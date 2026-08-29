import builtins
from datetime import UTC, datetime
from typing import cast
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.jobs.application.dto import JobInput
from app.modules.jobs.domain.entities import Job
from app.modules.jobs.domain.enums import EmploymentType, JobStatus, WorkplaceType

from .models import JobModel, JobRequirementModel


class SqlAlchemyJobRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, organization_id: UUID, user_id: UUID, data: JobInput) -> Job:
        now = datetime.now(UTC)
        model = JobModel(
            organization_id=organization_id,
            created_by_user_id=user_id,
            title=data.title or "",
            description=data.description,
            location=data.location,
            employment_type=data.employment_type.value if data.employment_type else None,
            workplace_type=data.workplace_type.value if data.workplace_type else None,
            experience_min_years=data.experience_min_years,
            experience_max_years=data.experience_max_years,
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            salary_currency=data.salary_currency,
            status=JobStatus.DRAFT.value,
            created_at=now,
            updated_at=now,
        )
        self.session.add(model)
        await self.session.flush()
        return self._job(model)

    async def get(self, organization_id: UUID, job_id: UUID) -> Job | None:
        model = await self.session.scalar(
            select(JobModel).where(
                JobModel.organization_id == organization_id, JobModel.id == job_id
            )
        )
        return self._job(model) if model else None

    async def list(
        self,
        organization_id: UUID,
        status: JobStatus | None,
        search: str | None,
        offset: int,
        limit: int,
    ) -> tuple[builtins.list[Job], int]:
        conditions = [JobModel.organization_id == organization_id]
        if status:
            conditions.append(JobModel.status == status.value)
        if search:
            conditions.append(JobModel.title.ilike(f"%{search.strip()}%"))
        query = select(JobModel).where(*conditions)
        total = int(
            await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        )
        models = (
            await self.session.scalars(
                query.order_by(JobModel.created_at.desc()).offset(offset).limit(limit)
            )
        ).all()
        return [self._job(model) for model in models], total

    async def update(self, organization_id: UUID, job_id: UUID, data: JobInput) -> Job | None:
        model = await self._model(organization_id, job_id)
        if not model:
            return None
        for field in data.fields:
            value = getattr(data, field)
            if field in {"employment_type", "workplace_type"} and value is not None:
                value = value.value
            setattr(model, field, value)
        model.updated_at = datetime.now(UTC)
        await self.session.flush()
        return self._job(model)

    async def set_status(
        self, organization_id: UUID, job_id: UUID, status: JobStatus
    ) -> Job | None:
        model = await self._model(organization_id, job_id)
        if not model:
            return None
        now = datetime.now(UTC)
        model.status = status.value
        model.updated_at = now
        if status is JobStatus.CLOSED:
            model.closed_at = now
        if status is JobStatus.ARCHIVED:
            model.archived_at = now
        await self.session.flush()
        return self._job(model)

    async def requirements(
        self, organization_id: UUID, job_id: UUID
    ) -> builtins.list[JobRequirementModel]:
        job = await self._model(organization_id, job_id)
        if not job:
            return []
        return list(
            (
                await self.session.scalars(
                    select(JobRequirementModel)
                    .where(JobRequirementModel.job_id == job_id)
                    .order_by(JobRequirementModel.rank)
                )
            ).all()
        )

    async def add_requirement(
        self,
        organization_id: UUID,
        job_id: UUID,
        requirement_type: str,
        category: str,
        content: str,
    ) -> JobRequirementModel | None:
        job = await self._model(organization_id, job_id)
        if not job:
            return None
        rank = (
            int(
                await self.session.scalar(
                    select(func.count())
                    .select_from(JobRequirementModel)
                    .where(JobRequirementModel.job_id == job_id)
                )
                or 0
            )
            + 1
        )
        now = datetime.now(UTC)
        item = JobRequirementModel(
            job_id=job_id,
            requirement_type=requirement_type,
            category=category,
            content=content,
            rank=rank,
            created_at=now,
            updated_at=now,
        )
        self.session.add(item)
        await self.session.flush()
        return item

    async def update_requirement(
        self,
        organization_id: UUID,
        job_id: UUID,
        requirement_id: UUID,
        requirement_type: str,
        category: str,
        content: str,
    ) -> JobRequirementModel | None:
        if not await self._model(organization_id, job_id):
            return None
        item = await self.session.scalar(
            select(JobRequirementModel).where(
                JobRequirementModel.id == requirement_id, JobRequirementModel.job_id == job_id
            )
        )
        if not item:
            return None
        item.requirement_type, item.category, item.content = requirement_type, category, content
        item.updated_at = datetime.now(UTC)
        await self.session.flush()
        return item

    async def delete_requirement(
        self, organization_id: UUID, job_id: UUID, requirement_id: UUID
    ) -> bool:
        if not await self._model(organization_id, job_id):
            return False
        item = await self.session.scalar(
            select(JobRequirementModel).where(
                JobRequirementModel.id == requirement_id, JobRequirementModel.job_id == job_id
            )
        )
        if not item:
            return False
        rank = item.rank
        await self.session.delete(item)
        await self.session.flush()
        await self.session.execute(
            update(JobRequirementModel)
            .where(JobRequirementModel.job_id == job_id, JobRequirementModel.rank > rank)
            .values(rank=JobRequirementModel.rank - 1, updated_at=datetime.now(UTC))
        )
        await self.session.flush()
        return True

    async def reorder_requirements(
        self, organization_id: UUID, job_id: UUID, requirement_ids: builtins.list[UUID]
    ) -> bool:
        if not await self._model(organization_id, job_id):
            return False
        items = await self.requirements(organization_id, job_id)
        if len(items) != len(requirement_ids) or {item.id for item in items} != set(
            requirement_ids
        ):
            return False
        offset = len(items) + 1
        await self.session.execute(
            update(JobRequirementModel)
            .where(JobRequirementModel.job_id == job_id)
            .values(rank=JobRequirementModel.rank + offset)
        )
        now = datetime.now(UTC)
        by_id = {item.id: item for item in items}
        for rank, requirement_id in enumerate(requirement_ids, 1):
            item = by_id[requirement_id]
            item.rank, item.updated_at = rank, now
        await self.session.flush()
        return True

    async def transition_review(
        self,
        organization_id: UUID,
        job_id: UUID,
        status: JobStatus,
        user_id: UUID | None = None,
        note: str | None = None,
    ) -> Job | None:
        model = await self._model(organization_id, job_id)
        if not model:
            return None
        now = datetime.now(UTC)
        model.status, model.updated_at = status.value, now
        if status is JobStatus.PENDING_APPROVAL:
            model.submitted_for_approval_at = now
        if status is JobStatus.APPROVED:
            model.approved_at, model.approved_by_user_id = now, user_id
        if status is JobStatus.DRAFT:
            model.review_note = note
        await self.session.flush()
        return self._job(model)

    async def _model(self, organization_id: UUID, job_id: UUID) -> JobModel | None:
        return cast(
            JobModel | None,
            await self.session.scalar(
                select(JobModel).where(
                    JobModel.organization_id == organization_id, JobModel.id == job_id
                )
            ),
        )

    @staticmethod
    def _job(model: JobModel) -> Job:
        return Job(
            id=model.id,
            organization_id=model.organization_id,
            created_by_user_id=model.created_by_user_id,
            title=model.title,
            description=model.description,
            location=model.location,
            employment_type=EmploymentType(model.employment_type)
            if model.employment_type
            else None,
            workplace_type=WorkplaceType(model.workplace_type) if model.workplace_type else None,
            experience_min_years=model.experience_min_years,
            experience_max_years=model.experience_max_years,
            salary_min=model.salary_min,
            salary_max=model.salary_max,
            salary_currency=model.salary_currency,
            status=JobStatus(model.status),
            created_at=model.created_at,
            updated_at=model.updated_at,
            closed_at=model.closed_at,
            archived_at=model.archived_at,
            submitted_for_approval_at=model.submitted_for_approval_at,
            approved_at=model.approved_at,
            approved_by_user_id=model.approved_by_user_id,
            review_note=model.review_note,
        )
