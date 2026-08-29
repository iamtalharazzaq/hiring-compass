from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

ROLES = ("admin", "recruiter", "hiring_manager", "interviewer")


@dataclass(frozen=True)
class Organization:
    id: UUID
    name: str
    slug: str
    created_by_user_id: UUID
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True)
class OrganizationMember:
    id: UUID
    organization_id: UUID
    user_id: UUID
    role: str
    is_active: bool
    joined_at: datetime
    updated_at: datetime
