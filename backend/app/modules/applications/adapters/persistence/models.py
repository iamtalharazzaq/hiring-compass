from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class ApplicationModel(Base):
    __tablename__ = "applications"
    __table_args__ = (
        CheckConstraint("status IN ('new','shortlisted','interviewing','on_hold','rejected')"),
        Index("ix_applications_organization_id", "organization_id"),
        Index("ix_applications_job_status", "job_id", "status"),
        Index("ix_applications_candidate_created", "candidate_id", "created_at"),
        Index("uq_applications_job_candidate", "job_id", "candidate_id", unique=True),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    job_id: Mapped[UUID] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    candidate_id: Mapped[UUID] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="new")
    created_by_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    status_changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
