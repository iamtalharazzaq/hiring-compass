# ruff: noqa: E501, E701, E702, I001
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.database.base import Base

class ActivityEventModel(Base):
    __tablename__ = "activity_events"
    __table_args__ = (
        Index("ix_activity_events_organization_id", "organization_id"),
        Index("ix_activity_events_candidate_id", "candidate_id"),
        Index("ix_activity_events_application_id", "application_id"),
        Index("ix_activity_events_created_at", "created_at"),
        Index("ix_activity_events_event_type", "event_type"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    actor_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    candidate_id: Mapped[UUID | None] = mapped_column(ForeignKey("candidates.id"))
    job_id: Mapped[UUID | None] = mapped_column(ForeignKey("jobs.id"))
    application_id: Mapped[UUID | None] = mapped_column(ForeignKey("applications.id"))
    interview_id: Mapped[UUID | None] = mapped_column(ForeignKey("interviews.id"))
    entity_type: Mapped[str] = mapped_column(String(32), nullable=False)
    entity_id: Mapped[UUID] = mapped_column(nullable=False)
    event_metadata: Mapped[dict[str, object] | None] = mapped_column("metadata", JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
