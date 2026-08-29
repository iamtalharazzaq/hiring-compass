from math import ceil
from uuid import UUID

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.candidates.adapters.persistence.repositories import CandidateRepository
from app.modules.candidates.application.dto import CandidateInput
from app.modules.candidates.domain.entities import Candidate


class CandidateError(Exception):
    def __init__(self, code: str, message: str, status: int) -> None:
        self.code, self.message, self.status = code, message, status


class CandidateService:
    def __init__(self, repository: CandidateRepository) -> None:
        self.repository = repository

    async def create(
        self, organization_id: UUID, user: AuthenticatedUser, data: CandidateInput
    ) -> Candidate:
        try:
            item = await self.repository.create(organization_id, user.id, data)
        except ValueError:
            raise CandidateError(
                "CONFLICT", "A candidate with this email already exists.", 409
            ) from None
        await self.repository.session.commit()
        return item

    async def get(self, organization_id: UUID, candidate_id: UUID) -> Candidate:
        item = await self.repository.get(organization_id, candidate_id)
        if not item:
            raise CandidateError("NOT_FOUND", "Candidate was not found.", 404)
        return item

    async def list(
        self, organization_id: UUID, page: int, page_size: int, search: str | None
    ) -> tuple[list[Candidate], int, int]:
        items, total = await self.repository.list(
            organization_id, search, (page - 1) * page_size, page_size
        )
        return items, total, ceil(total / page_size) if total else 0

    async def update(
        self, organization_id: UUID, candidate_id: UUID, data: CandidateInput
    ) -> Candidate:
        await self.get(organization_id, candidate_id)
        try:
            item = await self.repository.update(organization_id, candidate_id, data)
        except ValueError:
            raise CandidateError(
                "CONFLICT", "A candidate with this email already exists.", 409
            ) from None
        if not item:
            raise CandidateError("NOT_FOUND", "Candidate was not found.", 404)
        await self.repository.session.commit()
        return item
