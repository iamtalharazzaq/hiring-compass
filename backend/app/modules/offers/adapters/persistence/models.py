from datetime import date, datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class OfferModel(Base):
    __tablename__ = "offers"
    __table_args__ = (CheckConstraint("status IN ('draft','pending_approval','approved','sent','accepted','declined','expired')"),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id"), nullable=False, unique=True)
    candidate_token: Mapped[UUID] = mapped_column(default=uuid4, unique=True, nullable=False)
    job_title: Mapped[str] = mapped_column(String(200), nullable=False)
    salary: Mapped[str] = mapped_column(String(80), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    employment_type: Mapped[str] = mapped_column(String(80), nullable=False)
    work_location: Mapped[str] = mapped_column(String(200), nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    additional_terms: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False)
    created_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    approved_by: Mapped[UUID | None] = mapped_column(ForeignKey("users.id"))
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class OnboardingModel(Base):
    __tablename__ = "onboardings"
    __table_args__ = (CheckConstraint("status IN ('not_started','in_progress','completed')"),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False, index=True)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id"), nullable=False, unique=True)
    status: Mapped[str] = mapped_column(String(20), default="not_started", nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OnboardingTaskModel(Base):
    __tablename__ = "onboarding_tasks"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    onboarding_id: Mapped[UUID] = mapped_column(ForeignKey("onboardings.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    owner: Mapped[str | None] = mapped_column(String(200))
    due_date: Mapped[date | None] = mapped_column(Date)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    position: Mapped[int] = mapped_column(Integer, nullable=False)
