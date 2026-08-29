from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class JobModel(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint("experience_min_years IS NULL OR experience_min_years >= 0"),
        CheckConstraint("experience_max_years IS NULL OR experience_max_years >= 0"),
        CheckConstraint(
            "experience_min_years IS NULL OR experience_max_years IS NULL "
            "OR experience_max_years >= experience_min_years"
        ),
        CheckConstraint("salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min"),
        CheckConstraint(
            "(salary_min IS NULL AND salary_max IS NULL) OR salary_currency IS NOT NULL"
        ),
        CheckConstraint("salary_currency IS NULL OR char_length(salary_currency) = 3"),
        CheckConstraint(
            "employment_type IS NULL OR employment_type IN "
            "('full_time', 'part_time', 'contract', 'temporary', 'internship')"
        ),
        CheckConstraint(
            "workplace_type IS NULL OR workplace_type IN ('remote', 'hybrid', 'onsite')"
        ),
        CheckConstraint(
            "status IN ('draft', 'pending_approval', 'approved', 'closed', 'archived')"
        ),
        Index("ix_jobs_organization_id", "organization_id"),
        Index("ix_jobs_organization_status", "organization_id", "status"),
        Index("ix_jobs_organization_created_at", "organization_id", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    created_by_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(160))
    employment_type: Mapped[str | None] = mapped_column(String(32))
    workplace_type: Mapped[str | None] = mapped_column(String(32))
    experience_min_years: Mapped[int | None] = mapped_column()
    experience_max_years: Mapped[int | None] = mapped_column()
    salary_min: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    salary_max: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    salary_currency: Mapped[str | None] = mapped_column(String(3))
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    submitted_for_approval_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by_user_id: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    review_note: Mapped[str | None] = mapped_column(Text)


class JobRequirementModel(Base):
    __tablename__ = "job_requirements"
    __table_args__ = (
        CheckConstraint("requirement_type IN ('required', 'preferred')"),
        CheckConstraint(
            "category IN ('skill', 'experience', 'education', 'responsibility', "
            "'certification', 'other')"
        ),
        CheckConstraint("char_length(content) BETWEEN 3 AND 500"),
        CheckConstraint("rank > 0"),
        Index("ix_job_requirements_job_id", "job_id"),
        Index("uq_job_requirements_rank", "job_id", "rank", unique=True),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    job_id: Mapped[UUID] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    requirement_type: Mapped[str] = mapped_column(String(16), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    rank: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
