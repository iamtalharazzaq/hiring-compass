import builtins
from math import ceil
from uuid import UUID

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.jobs.adapters.persistence.models import JobRequirementModel
from app.modules.jobs.adapters.persistence.repositories import SqlAlchemyJobRepository
from app.modules.jobs.application.dto import JobInput
from app.modules.jobs.domain.entities import Job
from app.modules.jobs.domain.enums import JobStatus
from app.modules.jobs.domain.policies import can_archive, can_close, can_edit


class JobError(Exception):
    def __init__(self, code: str, message: str, status: int) -> None:
        self.code, self.message, self.status = code, message, status


class JobService:
    def __init__(self, repository: SqlAlchemyJobRepository) -> None:
        self.repository = repository

    async def create(self, organization_id: UUID, user: AuthenticatedUser, data: JobInput) -> Job:
        job = await self.repository.create(organization_id, user.id, data)
        await self.repository.session.commit()
        return job

    async def list(
        self,
        organization_id: UUID,
        page: int,
        page_size: int,
        status: JobStatus | None,
        search: str | None,
    ) -> tuple[builtins.list[Job], int, int]:
        items, total = await self.repository.list(
            organization_id, status, search, (page - 1) * page_size, page_size
        )
        return items, total, ceil(total / page_size) if total else 0

    async def get(self, organization_id: UUID, job_id: UUID) -> Job:
        job = await self.repository.get(organization_id, job_id)
        if not job:
            raise JobError("NOT_FOUND", "Job was not found.", 404)
        return job

    async def update(self, organization_id: UUID, job_id: UUID, data: JobInput) -> Job:
        job = await self.get(organization_id, job_id)
        if not can_edit(job.status):
            raise JobError("INVALID_TRANSITION", "Only draft jobs can be edited.", 409)
        self._validate_update(job, data)
        updated = await self.repository.update(organization_id, job_id, data)
        if not updated:
            raise JobError("NOT_FOUND", "Job was not found.", 404)
        await self.repository.session.commit()
        return updated

    async def close(self, organization_id: UUID, job_id: UUID) -> Job:
        job = await self.get(organization_id, job_id)
        if not can_close(job.status):
            raise JobError("INVALID_TRANSITION", "This job cannot be closed.", 409)
        closed = await self.repository.set_status(organization_id, job_id, JobStatus.CLOSED)
        if not closed:
            raise JobError("NOT_FOUND", "Job was not found.", 404)
        await self.repository.session.commit()
        return closed

    async def archive(self, organization_id: UUID, job_id: UUID) -> Job:
        job = await self.get(organization_id, job_id)
        if not can_archive(job.status):
            raise JobError("INVALID_TRANSITION", "Only closed jobs can be archived.", 409)
        archived = await self.repository.set_status(organization_id, job_id, JobStatus.ARCHIVED)
        if not archived:
            raise JobError("NOT_FOUND", "Job was not found.", 404)
        await self.repository.session.commit()
        return archived

    async def submit(self, organization_id: UUID, job_id: UUID) -> Job:
        job = await self.get(organization_id, job_id)
        requirements = await self.repository.requirements(organization_id, job_id)
        if (
            job.status is not JobStatus.DRAFT
            or not job.title.strip()
            or not job.description
            or not job.description.strip()
            or not any(r.requirement_type == "required" for r in requirements)
        ):
            raise JobError("INVALID_TRANSITION", "The draft is not ready for review.", 409)
        item = await self.repository.transition_review(
            organization_id, job_id, JobStatus.PENDING_APPROVAL
        )
        await self.repository.session.commit()
        return item or job

    async def approve(self, organization_id: UUID, job_id: UUID, user: AuthenticatedUser) -> Job:
        job = await self.get(organization_id, job_id)
        if job.status is not JobStatus.PENDING_APPROVAL:
            raise JobError("INVALID_TRANSITION", "This job is not awaiting review.", 409)
        item = await self.repository.transition_review(
            organization_id, job_id, JobStatus.APPROVED, user.id
        )
        await self.repository.session.commit()
        return item or job

    async def return_to_draft(self, organization_id: UUID, job_id: UUID, note: str) -> Job:
        job = await self.get(organization_id, job_id)
        if job.status is not JobStatus.PENDING_APPROVAL:
            raise JobError("INVALID_TRANSITION", "This job is not awaiting review.", 409)
        item = await self.repository.transition_review(
            organization_id, job_id, JobStatus.DRAFT, note=note
        )
        await self.repository.session.commit()
        return item or job

    async def requirements(
        self, organization_id: UUID, job_id: UUID
    ) -> builtins.list[JobRequirementModel]:
        await self.get(organization_id, job_id)
        return await self.repository.requirements(organization_id, job_id)

    async def add_requirement(
        self,
        organization_id: UUID,
        job_id: UUID,
        requirement_type: str,
        category: str,
        content: str,
    ) -> JobRequirementModel:
        job = await self.get(organization_id, job_id)
        self._ensure_draft(job)
        item = await self.repository.add_requirement(
            organization_id, job_id, requirement_type, category, content
        )
        if not item:
            raise JobError("NOT_FOUND", "Job was not found.", 404)
        await self.repository.session.commit()
        return item

    async def update_requirement(
        self,
        organization_id: UUID,
        job_id: UUID,
        requirement_id: UUID,
        requirement_type: str,
        category: str,
        content: str,
    ) -> JobRequirementModel:
        self._ensure_draft(await self.get(organization_id, job_id))
        item = await self.repository.update_requirement(
            organization_id, job_id, requirement_id, requirement_type, category, content
        )
        if not item:
            raise JobError("NOT_FOUND", "Requirement was not found.", 404)
        await self.repository.session.commit()
        return item

    async def delete_requirement(
        self, organization_id: UUID, job_id: UUID, requirement_id: UUID
    ) -> None:
        self._ensure_draft(await self.get(organization_id, job_id))
        if not await self.repository.delete_requirement(organization_id, job_id, requirement_id):
            raise JobError("NOT_FOUND", "Requirement was not found.", 404)
        await self.repository.session.commit()

    async def reorder_requirements(
        self, organization_id: UUID, job_id: UUID, requirement_ids: builtins.list[UUID]
    ) -> builtins.list[JobRequirementModel]:
        self._ensure_draft(await self.get(organization_id, job_id))
        if not await self.repository.reorder_requirements(organization_id, job_id, requirement_ids):
            raise JobError(
                "VALIDATION_ERROR",
                "Requirement IDs must exactly match this job's requirements.",
                422,
            )
        await self.repository.session.commit()
        return await self.repository.requirements(organization_id, job_id)

    @staticmethod
    def _ensure_draft(job: Job) -> None:
        if job.status is not JobStatus.DRAFT:
            raise JobError(
                "INVALID_TRANSITION", "Requirements can only be changed on draft jobs.", 409
            )

    @staticmethod
    def _validate_update(job: Job, data: JobInput) -> None:
        values = {
            field: getattr(data, field) if field in data.fields else getattr(job, field)
            for field in (
                "experience_min_years",
                "experience_max_years",
                "salary_min",
                "salary_max",
                "salary_currency",
            )
        }
        if (
            values["experience_min_years"] is not None
            and values["experience_max_years"] is not None
            and values["experience_max_years"] < values["experience_min_years"]
        ):
            raise JobError("VALIDATION_ERROR", "Experience maximum is below minimum.", 422)
        if (
            values["salary_min"] is not None
            and values["salary_max"] is not None
            and values["salary_max"] < values["salary_min"]
        ):
            raise JobError("VALIDATION_ERROR", "Salary maximum is below minimum.", 422)
        if (values["salary_min"] is not None or values["salary_max"] is not None) and not values[
            "salary_currency"
        ]:
            raise JobError("VALIDATION_ERROR", "Salary currency is required.", 422)
