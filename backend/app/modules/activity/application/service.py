# ruff: noqa: E501, E701, E702, I001
from datetime import UTC, datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.activity.adapters.persistence.models import ActivityEventModel


async def record(
    session: AsyncSession,
    organization_id: UUID,
    event_type: str,
    entity_type: str,
    entity_id: UUID,
    actor_user_id: UUID | None = None,
    candidate_id: UUID | None = None,
    job_id: UUID | None = None,
    application_id: UUID | None = None,
    interview_id: UUID | None = None,
    metadata: dict[str, object] | None = None,
) -> ActivityEventModel:
    event = ActivityEventModel(
        organization_id=organization_id,
        actor_user_id=actor_user_id,
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        candidate_id=candidate_id,
        job_id=job_id,
        application_id=application_id,
        interview_id=interview_id,
        event_metadata=metadata,
        created_at=datetime.now(UTC),
    )
    session.add(event)
    await session.flush()
    return event


async def timeline(
    session: AsyncSession,
    organization_id: UUID,
    *,
    candidate_id: UUID | None = None,
    application_id: UUID | None = None,
    page: int = 1,
    page_size: int = 30,
    event_type: str | None = None
) -> tuple[list[ActivityEventModel], int]:
    conditions = [ActivityEventModel.organization_id == organization_id]
    if candidate_id:
        conditions.append(ActivityEventModel.candidate_id == candidate_id)
    if application_id:
        conditions.append(ActivityEventModel.application_id == application_id)
    if event_type:
        conditions.append(ActivityEventModel.event_type == event_type)
    query = select(ActivityEventModel).where(*conditions)
    from sqlalchemy import func

    total = int(
        await session.scalar(select(func.count()).select_from(query.subquery())) or 0
    )
    values = list(
        (
            await session.scalars(
                query.order_by(
                    ActivityEventModel.created_at.desc(), ActivityEventModel.id.desc()
                )
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
        ).all()
    )
    return values, total
