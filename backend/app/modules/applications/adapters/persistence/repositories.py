import builtins
from datetime import UTC, datetime
from typing import cast
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import ApplicationModel


class ApplicationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, org: UUID, app_id: UUID) -> ApplicationModel | None:
        return cast(ApplicationModel | None, await self.session.scalar(
            select(ApplicationModel).where(
                ApplicationModel.organization_id == org, ApplicationModel.id == app_id
            )
        ))

    async def list(
        self,
        org: UUID,
        *,
        job_id: UUID | None = None,
        candidate_id: UUID | None = None,
        status: str | None = None,
        offset: int = 0,
        limit: int = 50,
    ) -> tuple[builtins.list[ApplicationModel], int]:
        conditions = [ApplicationModel.organization_id == org]
        if job_id:
            conditions.append(ApplicationModel.job_id == job_id)
        if candidate_id:
            conditions.append(ApplicationModel.candidate_id == candidate_id)
        if status:
            conditions.append(ApplicationModel.status == status)
        query = select(ApplicationModel).where(*conditions)
        total = int(
            await self.session.scalar(select(func.count()).select_from(query.subquery())) or 0
        )
        return list(
            (
                await self.session.scalars(
                    query.order_by(ApplicationModel.created_at.desc()).offset(offset).limit(limit)
                )
            ).all()
        ), total

    async def create(
        self, org: UUID, job_id: UUID, candidate_id: UUID, user_id: UUID
    ) -> ApplicationModel:
        now = datetime.now(UTC)
        item = ApplicationModel(
            organization_id=org,
            job_id=job_id,
            candidate_id=candidate_id,
            created_by_user_id=user_id,
            status="new",
            status_changed_at=now,
            created_at=now,
            updated_at=now,
        )
        self.session.add(item)
        await self.session.flush()
        return item

    async def change_status(self, item: ApplicationModel, status: str) -> ApplicationModel:
        now = datetime.now(UTC)
        item.status, item.status_changed_at, item.updated_at = status, now, now
        await self.session.flush()
        return item
