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

    @field_validator("scheduled_at")
    @classmethod
    def timezone_aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("scheduled_at must include a timezone.")
        return value


class InterviewUpdateRequest(BaseModel):
    scheduled_at: datetime | None = None
    duration_minutes: int | None = Field(None, gt=0)
    location_or_meeting_details: str | None = None

    @field_validator("scheduled_at")
    @classmethod
    def timezone_aware(cls, value: datetime | None) -> datetime | None:
        if value and (value.tzinfo is None or value.utcoffset() is None):
            raise ValueError("scheduled_at must include a timezone.")
        return value


class CancelRequest(BaseModel):
    cancelled_reason: str | None = None
