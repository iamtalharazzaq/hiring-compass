import re
from datetime import datetime
from uuid import UUID

from email_validator import EmailNotValidError, validate_email
from pydantic import BaseModel, EmailStr, Field, field_validator

LOCAL_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.local$", re.IGNORECASE)


def validate_request_email(value: str) -> str:
    normalized = value.strip().lower()
    if LOCAL_EMAIL_PATTERN.fullmatch(normalized):
        return normalized
    try:
        return validate_email(
            normalized, check_deliverability=False, test_environment=True
        ).normalized
    except EmailNotValidError as error:
        raise ValueError("Enter a valid email address.") from error


class SignupRequest(BaseModel):
    email: str
    display_name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=10)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        return validate_request_email(value)

    @field_validator("password")
    @classmethod
    def password_has_letter_and_number(cls, value: str) -> str:
        if not any(character.isalpha() for character in value) or not any(
            character.isdigit() for character in value
        ):
            raise ValueError("Password must include at least one letter and one number.")
        return value


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        return validate_request_email(value)


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    display_name: str
    is_active: bool
    created_at: datetime
