from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class StageRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    duration_minutes: int | None = Field(None, gt=0)

    @field_validator("name")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Stage name cannot be empty.")
        return value.strip()


class StageUpdateRequest(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=160)
    description: str | None = None
    duration_minutes: int | None = Field(None, gt=0)


class ReorderRequest(BaseModel):
    stage_ids: list[UUID] = Field(min_length=1)


class InterviewRequest(BaseModel):
    interview_stage_id: UUID
    scheduled_at: datetime
    duration_minutes: int | None = Field(None, gt=0)
    location_or_meeting_details: str | None = None
    end_at: datetime | None = None

    @field_validator("scheduled_at")
    @classmethod
    def timezone_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("scheduled_at must include a timezone.")
        return value

    @field_validator("end_at")
    @classmethod
    def end_timezone_aware(cls, value: datetime | None) -> datetime | None:
        if value and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("end_at must include a timezone.")
        return value


class InterviewUpdateRequest(BaseModel):
    scheduled_at: datetime | None = None
    duration_minutes: int | None = Field(None, gt=0)
    location_or_meeting_details: str | None = None
    end_at: datetime | None = None

    @field_validator("scheduled_at")
    @classmethod
    def timezone_aware(cls, value: datetime | None) -> datetime | None:
        if value and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("scheduled_at must include a timezone.")
        return value


class CancelRequest(BaseModel):
    cancelled_reason: str | None = None


class AssignmentRequest(BaseModel):
    user_id: UUID


class ScorecardRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    instructions: str | None = None

    @field_validator("title")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Scorecard title cannot be empty.")
        return value.strip()


class CriterionRequest(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    is_required: bool = True

    @field_validator("name")
    @classmethod
    def nonblank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Criterion name cannot be empty.")
        return value.strip()


class CriterionReorderRequest(BaseModel):
    criterion_ids: list[UUID] = Field(min_length=1)


class FeedbackItemRequest(BaseModel):
    criterion_id: UUID
    rating: int | None = Field(None, ge=1, le=5)
    notes: str | None = None


class FeedbackRequest(BaseModel):
    overall_rating: int | None = Field(None, ge=1, le=5)
    recommendation: str | None = None
    summary: str = ""
    items: list[FeedbackItemRequest] = []

    @field_validator("recommendation")
    @classmethod
    def recommendation_value(cls, value: str | None) -> str | None:
        if value and value not in {"strong_yes", "yes", "mixed", "no", "strong_no"}:
            raise ValueError("Invalid recommendation.")
        return value

    @field_validator("items")
    @classmethod
    def unique_criteria(cls, value: list[FeedbackItemRequest]) -> list[FeedbackItemRequest]:
        if len({item.criterion_id for item in value}) != len(value):
            raise ValueError("Each criterion can only be rated once.")
        return value
