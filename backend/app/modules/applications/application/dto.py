from dataclasses import dataclass
from uuid import UUID

from app.modules.applications.domain.enums import ApplicationStatus


@dataclass(frozen=True)
class ApplicationInput:
    candidate_id: UUID


@dataclass(frozen=True)
class StatusInput:
    status: ApplicationStatus
