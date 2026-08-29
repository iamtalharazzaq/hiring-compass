from dataclasses import dataclass
from decimal import Decimal

from app.modules.jobs.domain.enums import EmploymentType, WorkplaceType


@dataclass(frozen=True)
class JobInput:
    title: str | None = None
    description: str | None = None
    location: str | None = None
    employment_type: EmploymentType | None = None
    workplace_type: WorkplaceType | None = None
    experience_min_years: int | None = None
    experience_max_years: int | None = None
    salary_min: Decimal | None = None
    salary_max: Decimal | None = None
    salary_currency: str | None = None
    fields: frozenset[str] = frozenset()
