from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from .enums import EmploymentType, JobStatus, WorkplaceType


@dataclass(frozen=True)
class Job:
    id: UUID
    organization_id: UUID
    created_by_user_id: UUID
    title: str
    description: str | None
    location: str | None
    employment_type: EmploymentType | None
    workplace_type: WorkplaceType | None
    experience_min_years: int | None
    experience_max_years: int | None
    salary_min: Decimal | None
    salary_max: Decimal | None
    salary_currency: str | None
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None
    archived_at: datetime | None
