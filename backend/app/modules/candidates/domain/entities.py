from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class Candidate:
    id: UUID
    organization_id: UUID
    created_by_user_id: UUID
    full_name: str
    email: str | None
    phone: str | None
    location: str | None
    current_title: str | None
    years_of_experience: int | None
    summary: str | None
    education: list[dict[str, object]]
    created_at: datetime
    updated_at: datetime
