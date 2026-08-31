from pydantic import BaseModel, EmailStr, Field

from app.modules.candidates.application.dto import CandidateInput


class CandidatePayload(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=160)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=30)
    location: str | None = Field(default=None, max_length=160)
    current_title: str | None = Field(default=None, max_length=160)
    years_of_experience: int | None = Field(default=None, ge=0, le=60)
    summary: str | None = Field(default=None, max_length=2000)


class CreateCandidateRequest(CandidatePayload):
    full_name: str = Field(min_length=2, max_length=160)


class CandidateQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    search: str | None = Field(default=None, max_length=160)
    location: str | None = Field(default=None, max_length=160)
    current_title: str | None = Field(default=None, max_length=160)
    min_years: int | None = Field(default=None, ge=0, le=60)
    max_years: int | None = Field(default=None, ge=0, le=60)


def candidate_input(payload: CandidatePayload) -> CandidateInput:
    fields = frozenset(payload.model_fields_set)
    return CandidateInput(**payload.model_dump(), fields=fields)
