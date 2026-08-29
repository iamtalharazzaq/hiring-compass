from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from .enums import ApplicationStatus


@dataclass(frozen=True)
class Application:
    id: UUID
    organization_id: UUID
    job_id: UUID
    candidate_id: UUID
    status: ApplicationStatus
    created_by_user_id: UUID
    status_changed_at: datetime
    created_at: datetime
    updated_at: datetime
