import builtins
from datetime import UTC, datetime
from typing import cast
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.candidates.application.dto import CandidateInput
from app.modules.candidates.domain.entities import Candidate

from .models import CandidateModel, ResumeModel


class CandidateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, organization_id: UUID, user_id: UUID, data: CandidateInput) -> Candidate:
        now = datetime.now(UTC)
        model = CandidateModel(
            organization_id=organization_id,
            created_by_user_id=user_id,
            full_name=data.full_name or "",
            email=self._email(data.email),
            phone=data.phone,
            location=data.location,
            current_title=data.current_title,
            years_of_experience=data.years_of_experience,
            summary=data.summary,
            created_at=now,
            updated_at=now,
        )
        self.session.add(model)
        try:
            await self.session.flush()
        except IntegrityError:
            await self.session.rollback()
            raise ValueError("duplicate") from None
        return self._candidate(model)

    async def get(self, organization_id: UUID, candidate_id: UUID) -> Candidate | None:
        model = await self.session.scalar(
            select(CandidateModel).where(
                CandidateModel.organization_id == organization_id, CandidateModel.id == candidate_id
            )
        )
        return self._candidate(model) if model else None

    async def list(
        self, organization_id: UUID, search: str | None, offset: int, limit: int
    ) -> tuple[builtins.list[Candidate], int]:
        conditions = [CandidateModel.organization_id == organization_id]
        if search:
            term = f"%{search.strip()}%"
            conditions.append(
                CandidateModel.full_name.ilike(term)
                | CandidateModel.email.ilike(term)
                | CandidateModel.current_title.ilike(term)
            )
        query = select(CandidateModel).where(*conditions)
        total = int(
            await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        )
        models = (
            await self.session.scalars(
                query.order_by(CandidateModel.created_at.desc()).offset(offset).limit(limit)
            )
        ).all()
        return [self._candidate(model) for model in models], total

    async def update(
        self, organization_id: UUID, candidate_id: UUID, data: CandidateInput
    ) -> Candidate | None:
        model = await self.session.scalar(
            select(CandidateModel).where(
                CandidateModel.organization_id == organization_id, CandidateModel.id == candidate_id
            )
        )
        if not model:
            return None
        for field in data.fields:
            value = getattr(data, field)
            setattr(model, field, self._email(value) if field == "email" else value)
        model.updated_at = datetime.now(UTC)
        try:
            await self.session.flush()
        except IntegrityError:
            await self.session.rollback()
            raise ValueError("duplicate") from None
        return self._candidate(model)

    @staticmethod
    def _email(value: str | None) -> str | None:
        return value.lower() if value else None

    @staticmethod
    def _candidate(model: CandidateModel) -> Candidate:
        return Candidate(**{name: getattr(model, name) for name in Candidate.__dataclass_fields__})

    async def resumes(
        self, organization_id: UUID, candidate_id: UUID
    ) -> builtins.list[ResumeModel]:
        result = await self.session.scalars(
            select(ResumeModel)
            .where(
                ResumeModel.organization_id == organization_id,
                ResumeModel.candidate_id == candidate_id,
            )
            .order_by(ResumeModel.created_at.desc())
        )
        return list(result.all())

    async def add_resume(
        self,
        organization_id: UUID,
        candidate_id: UUID,
        user_id: UUID,
        filename: str,
        key: str,
        size: int,
        checksum: str,
    ) -> ResumeModel:
        await self.session.execute(
            update(ResumeModel)
            .where(
                ResumeModel.organization_id == organization_id,
                ResumeModel.candidate_id == candidate_id,
                ResumeModel.is_current.is_(True),
            )
            .values(is_current=False)
        )
        item = ResumeModel(
            organization_id=organization_id,
            candidate_id=candidate_id,
            uploaded_by_user_id=user_id,
            original_filename=filename,
            storage_key=key,
            content_type="application/pdf",
            size_bytes=size,
            sha256=checksum,
            is_current=True,
            created_at=datetime.now(UTC),
        )
        self.session.add(item)
        await self.session.flush()
        return item

    async def resume(
        self, organization_id: UUID, candidate_id: UUID, resume_id: UUID
    ) -> ResumeModel | None:
        return cast(
            ResumeModel | None,
            await self.session.scalar(
                select(ResumeModel).where(
                    ResumeModel.organization_id == organization_id,
                    ResumeModel.candidate_id == candidate_id,
                    ResumeModel.id == resume_id,
                )
            ),
        )
