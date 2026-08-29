from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class AuthenticatedUser:
    id: UUID
    email: str
    display_name: str
    is_active: bool
    created_at: datetime


@dataclass(frozen=True)
class AuthResult:
    user: AuthenticatedUser
    access_token: str
    refresh_token: str
    expires_in: int
