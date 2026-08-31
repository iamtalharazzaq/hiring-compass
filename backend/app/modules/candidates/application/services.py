# ruff: noqa: E501, E701, E702, I001
import hashlib
from math import ceil
from uuid import UUID, uuid4

from app.config import get_settings
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.candidates.adapters.persistence.models import ResumeModel
from app.modules.candidates.adapters.persistence.repositories import CandidateRepository
from app.modules.candidates.application.dto import CandidateInput
from app.modules.candidates.domain.entities import Candidate
from app.modules.candidates.ports.resume_storage import ResumeStorage
from app.modules.activity.application.service import record


class CandidateError(Exception):
    def __init__(self, code: str, message: str, status: int) -> None:
        self.code, self.message, self.status = code, message, status


class CandidateService:
    def __init__(
        self, repository: CandidateRepository, storage: ResumeStorage | None = None
    ) -> None:
        self.repository, self.storage = repository, storage

    async def create(
        self, organization_id: UUID, user: AuthenticatedUser, data: CandidateInput
    ) -> Candidate:
        try:
            item = await self.repository.create(organization_id, user.id, data)
        except ValueError:
            raise CandidateError(
                "CONFLICT", "A candidate with this email already exists.", 409
            ) from None
        await record(self.repository.session, organization_id, "candidate_created", "candidate", item.id, user.id, candidate_id=item.id, metadata={"description": "Candidate profile created"})
        await self.repository.session.commit()
        return item

    async def list_resumes(self, organization_id: UUID, candidate_id: UUID) -> list[ResumeModel]:
        await self.get(organization_id, candidate_id)
        return await self.repository.resumes(organization_id, candidate_id)

    async def upload_resume(
        self,
        organization_id: UUID,
        candidate_id: UUID,
        user: AuthenticatedUser,
        filename: str,
        content_type: str | None,
        content: bytes,
    ) -> ResumeModel:
        await self.get(organization_id, candidate_id)
        settings = get_settings()
        if (
            len(content) == 0
            or len(content) > settings.resume_max_file_size_bytes
            or not filename.lower().endswith(".pdf")
            or content_type != "application/pdf"
            or not content.startswith(b"%PDF-")
        ):
            raise CandidateError(
                "VALIDATION_ERROR", "Resume must be a valid PDF no larger than 10 MiB.", 422
            )
        resume_id = uuid4()
        key = f"organizations/{organization_id}/candidates/{candidate_id}/resumes/{resume_id}.pdf"
        checksum = hashlib.sha256(content).hexdigest()
        if not self.storage:
            raise CandidateError("STORAGE_ERROR", "Resume storage is unavailable.", 503)
        try:
            await self.storage.upload(key, content)
            item = await self.repository.add_resume(
                organization_id, candidate_id, user.id, filename[:255], key, len(content), checksum
            )
            existing = await self.repository.resumes(organization_id, candidate_id)
            await record(self.repository.session, organization_id, "resume_version_added" if len(existing) > 1 else "resume_uploaded", "candidate", candidate_id, user.id, candidate_id=candidate_id, metadata={"description": "Resume uploaded"})
            await self.repository.session.commit()
            return item
        except Exception:
            try:
                await self.storage.delete(key)
            except Exception:
                pass
            await self.repository.session.rollback()
            raise CandidateError("STORAGE_ERROR", "Resume could not be saved.", 503) from None

    async def download_resume(
        self, organization_id: UUID, candidate_id: UUID, resume_id: UUID
    ) -> str:
        await self.get(organization_id, candidate_id)
        item = await self.repository.resume(organization_id, candidate_id, resume_id)
        if not item:
            raise CandidateError("NOT_FOUND", "Resume was not found.", 404)
        try:
            return (
                await self.storage.signed_url(
                    item.storage_key, get_settings().resume_download_url_expire_seconds
                )
                if self.storage
                else ""
            )
        except Exception:
            raise CandidateError("STORAGE_ERROR", "Resume download is unavailable.", 503) from None

    async def get(self, organization_id: UUID, candidate_id: UUID) -> Candidate:
        item = await self.repository.get(organization_id, candidate_id)
        if not item:
            raise CandidateError("NOT_FOUND", "Candidate was not found.", 404)
        return item

    async def list(
        self, organization_id: UUID, page: int, page_size: int, search: str | None, location: str | None = None, current_title: str | None = None, min_years: int | None = None, max_years: int | None = None
    ) -> tuple[list[Candidate], int, int]:
        items, total = await self.repository.list(
            organization_id, search, (page - 1) * page_size, page_size, location, current_title, min_years, max_years
        )
        return items, total, ceil(total / page_size) if total else 0

    async def update(
        self, organization_id: UUID, candidate_id: UUID, data: CandidateInput, actor_user_id: UUID | None = None
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
        await record(self.repository.session, organization_id, "candidate_profile_updated", "candidate", candidate_id, actor_user_id, candidate_id=candidate_id, metadata={"description": "Candidate profile updated"})
        await self.repository.session.commit()
        return item
