from datetime import UTC, datetime, timedelta

from app.config import Settings
from app.modules.auth.application.dto import AuthenticatedUser, AuthResult
from app.modules.auth.domain.entities import User
from app.modules.auth.ports.password_hasher import PasswordHasher
from app.modules.auth.ports.repositories import AuthRepository
from app.modules.auth.ports.token_service import TokenService


class AuthenticationError(Exception):
    pass


class EmailAlreadyRegisteredError(Exception):
    pass


class AuthService:
    def __init__(
        self,
        repository: AuthRepository,
        password_hasher: PasswordHasher,
        token_service: TokenService,
        settings: Settings,
    ) -> None:
        self.repository = repository
        self.password_hasher = password_hasher
        self.token_service = token_service
        self.settings = settings

    async def signup(self, email: str, display_name: str, password: str) -> AuthResult:
        normalized_email = email.lower()
        if await self.repository.get_user_by_email(normalized_email):
            raise EmailAlreadyRegisteredError
        user = await self.repository.create_user(
            normalized_email,
            display_name.strip(),
            self.password_hasher.hash(password),
        )
        return await self._create_auth_result(user)

    async def login(self, email: str, password: str) -> AuthResult:
        user = await self.repository.get_user_by_email(email.lower())
        if (
            not user
            or not user.is_active
            or not self.password_hasher.verify(password, user.password_hash)
        ):
            raise AuthenticationError
        return await self._create_auth_result(user)

    async def refresh(self, refresh_token: str) -> AuthResult:
        now = datetime.now(UTC)
        session = await self.repository.get_session_by_token_hash(
            self.token_service.hash_refresh_token(refresh_token)
        )
        if not session or session.revoked_at or session.expires_at <= now:
            raise AuthenticationError
        user = await self.repository.get_user_by_id(session.user_id)
        if not user or not user.is_active:
            raise AuthenticationError
        await self.repository.revoke_session(session.id, now)
        return await self._create_auth_result(user)

    async def logout(self, refresh_token: str | None) -> None:
        if not refresh_token:
            return
        session = await self.repository.get_session_by_token_hash(
            self.token_service.hash_refresh_token(refresh_token)
        )
        if session and not session.revoked_at:
            await self.repository.revoke_session(session.id, datetime.now(UTC))

    async def current_user(self, access_token: str) -> AuthenticatedUser:
        user_id = self.token_service.parse_access_token(access_token)
        user = await self.repository.get_user_by_id(user_id) if user_id else None
        if not user or not user.is_active:
            raise AuthenticationError
        return self._safe_user(user)

    async def _create_auth_result(self, user: User) -> AuthResult:
        refresh_token = self.token_service.create_refresh_token()
        await self.repository.create_session(
            user.id,
            self.token_service.hash_refresh_token(refresh_token),
            datetime.now(UTC) + timedelta(days=self.settings.refresh_token_expire_days),
        )
        return AuthResult(
            user=self._safe_user(user),
            access_token=self.token_service.create_access_token(user.id),
            refresh_token=refresh_token,
            expires_in=self.settings.access_token_expire_minutes * 60,
        )

    @staticmethod
    def _safe_user(user: User) -> AuthenticatedUser:
        return AuthenticatedUser(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            is_active=user.is_active,
            created_at=user.created_at,
        )
