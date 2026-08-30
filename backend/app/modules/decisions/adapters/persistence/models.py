# ruff: noqa: E501, E701, E702, I001
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.shared.database.base import Base

class HiringDecisionModel(Base):
    __tablename__ = "hiring_decisions"
    __table_args__ = (CheckConstraint("proposed_outcome IN ('proceed_to_offer','reject','hold')"), CheckConstraint("status IN ('draft','pending_approval','approved','returned','withdrawn')"), Index("ix_hiring_decisions_org_application", "organization_id", "application_id"))
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id"), nullable=False)
    proposed_outcome: Mapped[str] = mapped_column(String(32), nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")
    proposed_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    reviewed_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_notes: Mapped[str | None] = mapped_column(Text)
    returned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    withdrawn_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
