from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class CandidateModel(Base):
    __tablename__ = "candidates"
    __table_args__ = (
        CheckConstraint("char_length(full_name) BETWEEN 2 AND 160"),
        CheckConstraint("years_of_experience IS NULL OR years_of_experience BETWEEN 0 AND 60"),
        Index("ix_candidates_organization_id", "organization_id"),
        Index("ix_candidates_organization_created_at", "organization_id", "created_at"),
        Index(
            "ix_candidates_org_email_lower",
            "organization_id",
            "email",
            unique=True,
            postgresql_where="email IS NOT NULL",
        ),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    created_by_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(30))
    location: Mapped[str | None] = mapped_column(String(160))
    current_title: Mapped[str | None] = mapped_column(String(160))
    years_of_experience: Mapped[int | None] = mapped_column(Integer)
    summary: Mapped[str | None] = mapped_column(Text)
    education: Mapped[list[dict[str, object]]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ResumeModel(Base):
    __tablename__ = "resumes"
    __table_args__ = (
        CheckConstraint("content_type = 'application/pdf'"),
        CheckConstraint("size_bytes > 0 AND size_bytes <= 10485760"),
        Index("ix_resumes_organization_id", "organization_id"),
        Index("ix_resumes_candidate_id", "candidate_id"),
        Index("ix_resumes_candidate_current", "candidate_id", "is_current"),
        Index(
            "ix_resumes_one_current",
            "candidate_id",
            unique=True,
            postgresql_where="is_current = true",
        ),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    candidate_id: Mapped[UUID] = mapped_column(ForeignKey("candidates.id"), nullable=False)
    uploaded_by_user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    content_type: Mapped[str] = mapped_column(String(64), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
