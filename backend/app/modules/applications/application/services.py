from math import ceil
from uuid import UUID

from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.applications.adapters.persistence.repositories import ApplicationRepository
from app.modules.applications.domain.enums import ApplicationStatus
from app.modules.applications.domain.policies import can_transition
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.candidates.adapters.persistence.repositories import CandidateRepository
from app.modules.jobs.adapters.persistence.repositories import SqlAlchemyJobRepository


class ApplicationError(Exception):
    def __init__(self, code: str, message: str, status: int) -> None:
        self.code, self.message, self.status = code, message, status


class ApplicationService:
    def __init__(self, repository: ApplicationRepository) -> None:
        self.repository = repository

    async def add(
        self, org: UUID, job_id: UUID, candidate_id: UUID, user: AuthenticatedUser
    ) -> ApplicationModel:
        job = await SqlAlchemyJobRepository(self.repository.session).get(org, job_id)
        candidate = await CandidateRepository(self.repository.session).get(org, candidate_id)
        if not job or not candidate:
            raise ApplicationError("NOT_FOUND", "Job or candidate was not found.", 404)
        if job.status.value != "approved":
            raise ApplicationError(
                "INVALID_TRANSITION", "Candidates can only be added to approved jobs.", 409
            )
        try:
            item = await self.repository.create(org, job_id, candidate_id, user.id)
            await self.repository.session.commit()
            return item
        except Exception:
            await self.repository.session.rollback()
            raise ApplicationError(
                "CONFLICT", "This candidate is already attached to the job.", 409
            ) from None

    async def get(self, org: UUID, app_id: UUID) -> ApplicationModel:
        item = await self.repository.get(org, app_id)
        if not item:
            raise ApplicationError("NOT_FOUND", "Application was not found.", 404)
        return item

    async def list(
        self,
        org: UUID,
        *,
        job_id: UUID | None = None,
        candidate_id: UUID | None = None,
        status: ApplicationStatus | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> tuple[list[ApplicationModel], int, int]:
        items, total = await self.repository.list(
            org,
            job_id=job_id,
            candidate_id=candidate_id,
            status=status.value if status else None,
            offset=(page - 1) * page_size,
            limit=page_size,
        )
        return items, total, ceil(total / page_size) if total else 0

    async def change_status(
        self, org: UUID, app_id: UUID, status: ApplicationStatus
    ) -> ApplicationModel:
        item = await self.get(org, app_id)
        current = ApplicationStatus(item.status)
        if not can_transition(current, status):
            raise ApplicationError(
                "INVALID_TRANSITION", "This application status cannot change that way.", 409
            )
        item = await self.repository.change_status(item, status.value)
        await self.repository.session.commit()
        return item
