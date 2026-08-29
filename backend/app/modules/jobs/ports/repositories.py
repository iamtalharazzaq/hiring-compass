from typing import Protocol
from uuid import UUID

from app.modules.jobs.application.dto import JobInput
from app.modules.jobs.domain.entities import Job
from app.modules.jobs.domain.enums import JobStatus


class JobRepository(Protocol):
    async def create(self, organization_id: UUID, user_id: UUID, data: JobInput) -> Job: ...
    async def get(self, organization_id: UUID, job_id: UUID) -> Job | None: ...
    async def list(
        self,
        organization_id: UUID,
        status: JobStatus | None,
        search: str | None,
        offset: int,
        limit: int,
    ) -> tuple[list[Job], int]: ...
    async def update(self, organization_id: UUID, job_id: UUID, data: JobInput) -> Job | None: ...
    async def set_status(
        self, organization_id: UUID, job_id: UUID, status: JobStatus
    ) -> Job | None: ...
