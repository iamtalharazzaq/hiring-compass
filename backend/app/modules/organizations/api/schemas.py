from pydantic import BaseModel, Field, field_validator

from app.modules.auth.api.schemas import validate_request_email
from app.modules.organizations.domain.entities import ROLES


class CreateOrganizationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class UpdateOrganizationRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class AddMemberRequest(BaseModel):
    email: str
    role: str

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        return validate_request_email(value)

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        if v not in ROLES:
            raise ValueError("Invalid role.")
        return v


class UpdateMemberRequest(BaseModel):
    role: str | None = None
    is_active: bool | None = None

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str | None) -> str | None:
        if v is not None and v not in ROLES:
            raise ValueError("Invalid role.")
        return v
