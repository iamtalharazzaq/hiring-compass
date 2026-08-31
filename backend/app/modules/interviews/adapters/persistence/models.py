# ruff: noqa: E501
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.database.base import Base


class InterviewStageModel(Base):
    __tablename__ = "interview_stages"
    __table_args__ = (
        CheckConstraint("char_length(name) > 0"), CheckConstraint("position > 0"),
        CheckConstraint("duration_minutes IS NULL OR duration_minutes > 0"),
        Index("ix_interview_stages_organization_id", "organization_id"),
        Index("uq_interview_stages_job_position", "job_id", "position", unique=True),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    job_id: Mapped[UUID] = mapped_column(ForeignKey("jobs.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class InterviewModel(Base):
    __tablename__ = "interviews"
    __table_args__ = (
        CheckConstraint("status IN ('scheduled','completed','cancelled')"), CheckConstraint("duration_minutes > 0"),
        Index("ix_interviews_organization_scheduled", "organization_id", "scheduled_at"),
        Index("ix_interviews_application_id", "application_id"),
    )
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id"), nullable=False)
    interview_stage_id: Mapped[UUID] = mapped_column(ForeignKey("interview_stages.id"), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    location_or_meeting_details: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="scheduled")
    cancelled_reason: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class InterviewAssignmentModel(Base):
    __tablename__ = "interview_assignments"
    __table_args__ = (Index("uq_interview_assignments_interview_user", "interview_id", "user_id", unique=True), Index("ix_interview_assignments_organization_user", "organization_id", "user_id"))
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    interview_id: Mapped[UUID] = mapped_column(ForeignKey("interviews.id"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    assigned_by: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ScorecardModel(Base):
    __tablename__ = "interview_scorecards"
    __table_args__ = (Index("uq_interview_scorecards_stage", "interview_stage_id", unique=True),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    interview_stage_id: Mapped[UUID] = mapped_column(ForeignKey("interview_stages.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ScorecardCriterionModel(Base):
    __tablename__ = "scorecard_criteria"
    __table_args__ = (Index("uq_scorecard_criteria_position", "scorecard_id", "position", unique=True),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    scorecard_id: Mapped[UUID] = mapped_column(ForeignKey("interview_scorecards.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class InterviewFeedbackModel(Base):
    __tablename__ = "interview_feedback"
    __table_args__ = (Index("uq_interview_feedback_reviewer", "interview_id", "reviewer_id", unique=True),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    organization_id: Mapped[UUID] = mapped_column(ForeignKey("organizations.id"), nullable=False)
    interview_id: Mapped[UUID] = mapped_column(ForeignKey("interviews.id"), nullable=False)
    reviewer_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    overall_rating: Mapped[int | None] = mapped_column(Integer)
    recommendation: Mapped[str | None] = mapped_column(String(16))
    summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class InterviewFeedbackItemModel(Base):
    __tablename__ = "interview_feedback_items"
    __table_args__ = (Index("uq_interview_feedback_item", "feedback_id", "criterion_id", unique=True),)
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    feedback_id: Mapped[UUID] = mapped_column(ForeignKey("interview_feedback.id"), nullable=False)
    criterion_id: Mapped[UUID] = mapped_column(ForeignKey("scorecard_criteria.id"), nullable=False)
    rating: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
