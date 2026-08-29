from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.adapters.persistence.models import UserModel
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.organizations.application.dto import MemberDetails
from app.modules.organizations.domain.entities import Organization, OrganizationMember

from .models import OrganizationMemberModel, OrganizationModel


class SqlAlchemyOrganizationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_org(self, org_id: UUID) -> Organization | None:
        model = await self.session.get(OrganizationModel, org_id)
        return self._org(model) if model else None

    async def get_member(self, org_id: UUID, user_id: UUID) -> OrganizationMember | None:
        model = await self.session.scalar(
            select(OrganizationMemberModel).where(
                OrganizationMemberModel.organization_id == org_id,
                OrganizationMemberModel.user_id == user_id,
            )
        )
        return self._member(model) if model else None

    async def list_for_user(self, user_id: UUID) -> list[tuple[Organization, OrganizationMember]]:
        rows = (
            await self.session.execute(
                select(OrganizationModel, OrganizationMemberModel)
                .join(OrganizationMemberModel)
                .where(
                    OrganizationMemberModel.user_id == user_id,
                    OrganizationMemberModel.is_active.is_(True),
                )
                .order_by(OrganizationModel.name)
            )
        ).all()
        return [(self._org(o), self._member(m)) for o, m in rows]

    async def create_org(
        self, name: str, slug: str, user_id: UUID
    ) -> tuple[Organization, OrganizationMember]:
        now = datetime.now(UTC)
        org = OrganizationModel(
            name=name, slug=slug, created_by_user_id=user_id, created_at=now, updated_at=now
        )
        self.session.add(org)
        await self.session.flush()
        member = OrganizationMemberModel(
            organization_id=org.id,
            user_id=user_id,
            role="admin",
            is_active=True,
            joined_at=now,
            updated_at=now,
        )
        self.session.add(member)
        await self.session.flush()
        return self._org(org), self._member(member)

    async def slug_exists(self, slug: str, excluding_id: UUID | None = None) -> bool:
        query = select(OrganizationModel.id).where(OrganizationModel.slug == slug)
        if excluding_id:
            query = query.where(OrganizationModel.id != excluding_id)
        return await self.session.scalar(query) is not None

    async def update_org(self, org: OrganizationModel, name: str, slug: str) -> Organization:
        org.name = name
        org.slug = slug
        org.updated_at = datetime.now(UTC)
        await self.session.flush()
        return self._org(org)

    async def get_org_model(self, org_id: UUID) -> OrganizationModel | None:
        return await self.session.get(OrganizationModel, org_id)

    async def list_members(self, org_id: UUID) -> list[MemberDetails]:
        rows = (
            await self.session.execute(
                select(OrganizationMemberModel, UserModel)
                .join(UserModel, UserModel.id == OrganizationMemberModel.user_id)
                .where(OrganizationMemberModel.organization_id == org_id)
                .order_by(UserModel.display_name)
            )
        ).all()
        return [MemberDetails(self._member(m), self._user(u)) for m, u in rows]

    async def get_active_user_by_email(self, email: str) -> AuthenticatedUser | None:
        u = await self.session.scalar(
            select(UserModel).where(
                func.lower(UserModel.email) == email.lower(), UserModel.is_active.is_(True)
            )
        )
        return self._user(u) if u else None

    async def add_member(self, org_id: UUID, user_id: UUID, role: str) -> OrganizationMember:
        now = datetime.now(UTC)
        m = OrganizationMemberModel(
            organization_id=org_id,
            user_id=user_id,
            role=role,
            is_active=True,
            joined_at=now,
            updated_at=now,
        )
        self.session.add(m)
        await self.session.flush()
        return self._member(m)

    async def get_member_by_id(
        self, org_id: UUID, member_id: UUID
    ) -> OrganizationMemberModel | None:
        return await self.session.scalar(
            select(OrganizationMemberModel).where(
                OrganizationMemberModel.organization_id == org_id,
                OrganizationMemberModel.id == member_id,
            )
        )

    async def active_admin_count(self, org_id: UUID) -> int:
        return int(
            await self.session.scalar(
                select(func.count())
                .select_from(OrganizationMemberModel)
                .where(
                    OrganizationMemberModel.organization_id == org_id,
                    OrganizationMemberModel.is_active.is_(True),
                    OrganizationMemberModel.role == "admin",
                )
            )
            or 0
        )

    async def update_member(
        self, member: OrganizationMemberModel, role: str | None, active: bool | None
    ) -> OrganizationMember:
        if role is not None:
            member.role = role
        if active is not None:
            member.is_active = active
        member.updated_at = datetime.now(UTC)
        await self.session.flush()
        return self._member(member)

    @staticmethod
    def _org(m: OrganizationModel) -> Organization:
        return Organization(m.id, m.name, m.slug, m.created_by_user_id, m.created_at, m.updated_at)

    @staticmethod
    def _member(m: OrganizationMemberModel) -> OrganizationMember:
        return OrganizationMember(
            m.id, m.organization_id, m.user_id, m.role, m.is_active, m.joined_at, m.updated_at
        )

    @staticmethod
    def _user(m: UserModel) -> AuthenticatedUser:
        return AuthenticatedUser(m.id, m.email, m.display_name, m.is_active, m.created_at)
