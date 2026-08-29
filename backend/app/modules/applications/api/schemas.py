from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.applications.domain.enums import ApplicationStatus


class CreateApplicationRequest(BaseModel):
    candidate_id: UUID


class ApplicationStatusRequest(BaseModel):
    status: ApplicationStatus


class ApplicationQuery(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(50, ge=1, le=100)
    status: ApplicationStatus | None = None
