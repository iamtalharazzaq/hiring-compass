from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.adapters.persistence.models import AuthSessionModel, UserModel
from app.modules.auth.domain.entities import AuthSession, User


class SqlAlchemyAuthRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_by_email(self, email: str) -> User | None:
        model = await self.session.scalar(select(UserModel).where(UserModel.email == email))
        return self._user(model) if model else None

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        model = await self.session.get(UserModel, user_id)
        return self._user(model) if model else None

    async def create_user(self, email: str, display_name: str, password_hash: str) -> User:
        now = datetime.now(UTC)
        model = UserModel(
            email=email,
            display_name=display_name,
            password_hash=password_hash,
            created_at=now,
            updated_at=now,
        )
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._user(model)

    async def create_session(
        self, user_id: UUID, refresh_token_hash: str, expires_at: datetime
    ) -> AuthSession:
        model = AuthSessionModel(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
            created_at=datetime.now(UTC),
        )
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._session(model)

    async def get_session_by_token_hash(self, token_hash: str) -> AuthSession | None:
        model = await self.session.scalar(
            select(AuthSessionModel).where(AuthSessionModel.refresh_token_hash == token_hash)
        )
        return self._session(model) if model else None

    async def revoke_session(self, session_id: UUID, used_at: datetime) -> None:
        model = await self.session.get(AuthSessionModel, session_id)
        if model:
            model.revoked_at = used_at
            model.last_used_at = used_at
            await self.session.commit()

    @staticmethod
    def _user(model: UserModel) -> User:
        return User(
            id=model.id,
            email=model.email,
            display_name=model.display_name,
            password_hash=model.password_hash,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _session(model: AuthSessionModel) -> AuthSession:
        return AuthSession(
            id=model.id,
            user_id=model.user_id,
            refresh_token_hash=model.refresh_token_hash,
            expires_at=model.expires_at,
            revoked_at=model.revoked_at,
            created_at=model.created_at,
            last_used_at=model.last_used_at,
        )
