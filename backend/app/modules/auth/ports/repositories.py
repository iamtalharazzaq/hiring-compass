from datetime import datetime
from typing import Protocol
from uuid import UUID

from app.modules.auth.domain.entities import AuthSession, User


class AuthRepository(Protocol):
    async def get_user_by_email(self, email: str) -> User | None: ...

    async def get_user_by_id(self, user_id: UUID) -> User | None: ...

    async def create_user(self, email: str, display_name: str, password_hash: str) -> User: ...

    async def create_session(
        self, user_id: UUID, refresh_token_hash: str, expires_at: datetime
    ) -> AuthSession: ...

    async def get_session_by_token_hash(self, token_hash: str) -> AuthSession | None: ...

    async def revoke_session(self, session_id: UUID, used_at: datetime) -> None: ...
