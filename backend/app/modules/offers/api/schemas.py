from datetime import date

from pydantic import BaseModel, Field


class OfferRequest(BaseModel):
    job_title: str = Field(min_length=1, max_length=200)
    salary: str = Field(min_length=1, max_length=80)
    currency: str = Field(min_length=1, max_length=8)
    start_date: date
    employment_type: str = Field(min_length=1, max_length=80)
    work_location: str = Field(min_length=1, max_length=200)
    expiry_date: date
    additional_terms: str | None = None


class OfferResponseRequest(BaseModel):
    response: str


class TaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    owner: str | None = Field(None, max_length=200)
    due_date: date | None = None
    is_required: bool = True


class TaskUpdateRequest(BaseModel):
    completed: bool
