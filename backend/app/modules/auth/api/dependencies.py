from collections.abc import AsyncIterator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.modules.auth.adapters.persistence.repositories import SqlAlchemyAuthRepository
from app.modules.auth.adapters.security.password_hasher import Argon2PasswordHasher
from app.modules.auth.adapters.security.token_service import JwtTokenService
from app.modules.auth.application.services import AuthService
from app.shared.database.engine import get_db_session


async def get_auth_service(
    session: AsyncSession = Depends(get_db_session),
    settings: Settings = Depends(get_settings),
) -> AsyncIterator[AuthService]:
    yield AuthService(
        SqlAlchemyAuthRepository(session),
        Argon2PasswordHasher(),
        JwtTokenService(settings),
        settings,
    )
