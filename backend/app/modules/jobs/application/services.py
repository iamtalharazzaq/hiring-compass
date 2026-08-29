from math import ceil
from uuid import UUID

from app.modules.auth.application.dto import AuthenticatedUser
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
    ) -> tuple[list[Job], int, int]:
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
