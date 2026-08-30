# ruff: noqa: E501, E701, E702
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.interviews.adapters.persistence.models import InterviewModel, InterviewStageModel
from app.modules.jobs.adapters.persistence.models import JobModel


class InterviewError(Exception):
    def __init__(self, code: str, message: str, status: int) -> None: self.code, self.message, self.status = code, message, status


class InterviewService:
    def __init__(self, session: AsyncSession): self.session = session
    async def job(self, org: UUID, job_id: UUID) -> JobModel:
        item = await self.session.scalar(select(JobModel).where(JobModel.id == job_id, JobModel.organization_id == org))
        if not item: raise InterviewError("NOT_FOUND", "Job was not found.", 404)
        return item
    async def stages(self, org: UUID, job_id: UUID) -> list[InterviewStageModel]:
        await self.job(org, job_id); return list((await self.session.scalars(select(InterviewStageModel).where(InterviewStageModel.organization_id == org, InterviewStageModel.job_id == job_id).order_by(InterviewStageModel.position))).all())
    async def add_stage(self, org: UUID, job_id: UUID, name: str, description: str | None, duration: int | None) -> InterviewStageModel:
        await self.job(org, job_id); stages = await self.stages(org, job_id)
        if any(s.is_active and s.name.lower() == name.lower() for s in stages): raise InterviewError("CONFLICT", "An active stage with that name already exists.", 409)
        now = datetime.now(UTC); item = InterviewStageModel(organization_id=org, job_id=job_id, name=name, description=description, duration_minutes=duration, position=len(stages)+1, is_active=True, created_at=now, updated_at=now); self.session.add(item); await self.session.commit(); return item
    async def stage(self, org: UUID, stage_id: UUID) -> InterviewStageModel:
        item = await self.session.scalar(select(InterviewStageModel).where(InterviewStageModel.id == stage_id, InterviewStageModel.organization_id == org))
        if not item: raise InterviewError("NOT_FOUND", "Interview stage was not found.", 404)
        return item
    async def update_stage(self, org: UUID, stage_id: UUID, **values: object) -> InterviewStageModel:
        item = await self.stage(org, stage_id); name = values.get("name")
        if isinstance(name, str):
            siblings = await self.stages(org, item.job_id)
            if any(s.id != item.id and s.is_active and s.name.lower() == name.lower() for s in siblings): raise InterviewError("CONFLICT", "An active stage with that name already exists.", 409)
        for key, value in values.items():
            if value is not None: setattr(item, key, value)
        item.updated_at = datetime.now(UTC); await self.session.commit(); return item
    async def reorder(self, org: UUID, job_id: UUID, ids: list[UUID]) -> list[InterviewStageModel]:
        stages = await self.stages(org, job_id)
        if set(ids) != {s.id for s in stages} or len(ids) != len(stages): raise InterviewError("VALIDATION_ERROR", "Stage order must include every stage exactly once.", 422)
        for pos, stage_id in enumerate(ids, 1): (next(s for s in stages if s.id == stage_id)).position = pos
        await self.session.commit(); return await self.stages(org, job_id)
    async def create_interview(self, org: UUID, app_id: UUID, stage_id: UUID, scheduled_at: datetime, duration: int | None, details: str | None, user_id: UUID) -> InterviewModel:
        app = await self.session.scalar(select(ApplicationModel).where(ApplicationModel.id == app_id, ApplicationModel.organization_id == org))
        if not app: raise InterviewError("NOT_FOUND", "Application was not found.", 404)
        job = await self.job(org, app.job_id)
        if job.status != "approved": raise InterviewError("INVALID_TRANSITION", "Only approved jobs can receive interviews.", 409)
        stage = await self.stage(org, stage_id)
        if stage.job_id != app.job_id or not stage.is_active: raise InterviewError("VALIDATION_ERROR", "Select an active stage for this application's job.", 422)
        if app.status == "shortlisted": app.status, app.status_changed_at = "interviewing", datetime.now(UTC)
        elif app.status != "interviewing": raise InterviewError("INVALID_TRANSITION", "Only shortlisted applications can receive their first interview.", 409)
        now = datetime.now(UTC); item = InterviewModel(organization_id=org, application_id=app.id, interview_stage_id=stage.id, scheduled_at=scheduled_at, duration_minutes=duration or stage.duration_minutes or 30, location_or_meeting_details=details, status="scheduled", created_by=user_id, created_at=now, updated_at=now); self.session.add(item); app.updated_at = now; await self.session.commit(); return item
    async def interview(self, org: UUID, interview_id: UUID) -> InterviewModel:
        item = await self.session.scalar(select(InterviewModel).where(InterviewModel.id == interview_id, InterviewModel.organization_id == org))
        if not item: raise InterviewError("NOT_FOUND", "Interview was not found.", 404)
        return item
    async def update_interview(self, org: UUID, interview_id: UUID, **values: object) -> InterviewModel:
        item = await self.interview(org, interview_id)
        if item.status == "cancelled": raise InterviewError("INVALID_STATE", "Cancelled interviews cannot be edited.", 409)
        for key, value in values.items():
            if value is not None: setattr(item, key, value)
        item.updated_at = datetime.now(UTC); await self.session.commit(); return item
    async def cancel(self, org: UUID, interview_id: UUID, reason: str | None) -> InterviewModel:
        item = await self.interview(org, interview_id)
        if item.status == "cancelled": raise InterviewError("INVALID_STATE", "Interview is already cancelled.", 409)
        item.status, item.cancelled_reason, item.updated_at = "cancelled", reason, datetime.now(UTC); await self.session.commit(); return item
    async def application_interviews(self, org: UUID, app_id: UUID) -> list[InterviewModel]:
        await self.session.scalar(select(ApplicationModel.id).where(ApplicationModel.id == app_id, ApplicationModel.organization_id == org)) or (_ for _ in ()).throw(InterviewError("NOT_FOUND", "Application was not found.", 404))
        return list((await self.session.scalars(select(InterviewModel).where(InterviewModel.organization_id == org, InterviewModel.application_id == app_id).order_by(InterviewModel.scheduled_at))).all())
    async def job_interviews(self, org: UUID, job_id: UUID) -> list[InterviewModel]:
        await self.job(org, job_id); return list((await self.session.scalars(select(InterviewModel).join(ApplicationModel, InterviewModel.application_id == ApplicationModel.id).where(InterviewModel.organization_id == org, ApplicationModel.job_id == job_id).order_by(InterviewModel.scheduled_at))).all())
    async def upcoming(self, org: UUID) -> list[InterviewModel]:
        return list((await self.session.scalars(select(InterviewModel).where(InterviewModel.organization_id == org, InterviewModel.status == "scheduled", InterviewModel.scheduled_at >= datetime.now(UTC)).order_by(InterviewModel.scheduled_at))).all())
