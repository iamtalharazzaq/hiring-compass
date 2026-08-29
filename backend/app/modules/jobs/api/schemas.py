from decimal import Decimal
from typing import TYPE_CHECKING
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.modules.jobs.domain.enums import EmploymentType, JobStatus, WorkplaceType

if TYPE_CHECKING:
    from app.modules.jobs.application.dto import JobInput


class JobFields(BaseModel):
    description: str | None = None
    location: str | None = Field(default=None, max_length=160)
    employment_type: EmploymentType | None = None
    workplace_type: WorkplaceType | None = None
    experience_min_years: int | None = Field(default=None, ge=0)
    experience_max_years: int | None = Field(default=None, ge=0)
    salary_min: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    salary_max: Decimal | None = Field(default=None, max_digits=14, decimal_places=2)
    salary_currency: str | None = Field(default=None, min_length=3, max_length=3)

    @model_validator(mode="after")
    def valid_ranges(self) -> "JobFields":
        if (
            self.experience_min_years is not None
            and self.experience_max_years is not None
            and self.experience_max_years < self.experience_min_years
        ):
            raise ValueError("Experience maximum must be greater than or equal to minimum.")
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_max < self.salary_min
        ):
            raise ValueError("Salary maximum must be greater than or equal to minimum.")
        if self.salary_currency:
            self.salary_currency = self.salary_currency.upper()
        return self


class CreateJobRequest(JobFields):
    title: str = Field(min_length=3, max_length=160)

    @model_validator(mode="after")
    def salary_has_currency(self) -> "CreateJobRequest":
        if (
            self.salary_min is not None or self.salary_max is not None
        ) and not self.salary_currency:
            raise ValueError("Salary currency is required when salary is provided.")
        return self


class UpdateJobRequest(JobFields):
    title: str | None = Field(default=None, min_length=3, max_length=160)

    @model_validator(mode="after")
    def title_cannot_be_null(self) -> "UpdateJobRequest":
        if "title" in self.model_fields_set and self.title is None:
            raise ValueError("Title cannot be null.")
        return self


def to_job_input(payload: JobFields) -> "JobInput":
    from app.modules.jobs.application.dto import JobInput

    return JobInput(**payload.model_dump(), fields=frozenset(payload.model_fields_set))


class ListJobsQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    status: JobStatus | None = None
    search: str | None = Field(default=None, max_length=160)


class RequirementRequest(BaseModel):
    requirement_type: str = Field(pattern="^(required|preferred)$")
    category: str = Field(
        pattern="^(skill|experience|education|responsibility|certification|other)$"
    )
    content: str = Field(min_length=3, max_length=500)


class ReorderRequirementsRequest(BaseModel):
    requirement_ids: list[UUID] = Field(min_length=1)


class ReviewNoteRequest(BaseModel):
    review_note: str = Field(min_length=3, max_length=1000)
