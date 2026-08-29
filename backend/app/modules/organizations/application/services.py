import re
from uuid import UUID

from sqlalchemy.exc import IntegrityError

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.organizations.adapters.persistence.repositories import (
    SqlAlchemyOrganizationRepository,
)
from app.modules.organizations.application.dto import MemberDetails, OrganizationDetails
from app.modules.organizations.domain.entities import Organization, OrganizationMember


class OrganizationError(Exception):
    def __init__(self, code: str, message: str, status: int = 400) -> None:
        self.code, self.message, self.status = code, message, status


class OrganizationService:
    def __init__(self, repository: SqlAlchemyOrganizationRepository) -> None:
        self.repository = repository

    async def create(self, user: AuthenticatedUser, name: str) -> OrganizationDetails:
        slug = await self._available_slug(name)
        org, member = await self.repository.create_org(name.strip(), slug, user.id)
        await self.repository.session.commit()
        return OrganizationDetails(org, member)

    async def list_mine(
        self, user: AuthenticatedUser
    ) -> list[tuple[Organization, OrganizationMember]]:
        return await self.repository.list_for_user(user.id)

    async def get_active_membership(
        self, org_id: UUID, user: AuthenticatedUser
    ) -> OrganizationMember:
        membership = await self.repository.get_member(org_id, user.id)
        if not membership or not membership.is_active:
            raise OrganizationError(
                "FORBIDDEN", "You do not have access to this organization.", 403
            )
        return membership

    async def get(self, org_id: UUID) -> Organization:
        org = await self.repository.get_org(org_id)
        if not org:
            raise OrganizationError("NOT_FOUND", "Organization was not found.", 404)
        return org

    async def update(self, org_id: UUID, name: str) -> Organization:
        model = await self.repository.get_org_model(org_id)
        if not model:
            raise OrganizationError("NOT_FOUND", "Organization was not found.", 404)
        slug = await self._available_slug(name, org_id)
        result = await self.repository.update_org(model, name.strip(), slug)
        await self.repository.session.commit()
        return result

    async def list_members(self, org_id: UUID) -> list[MemberDetails]:
        return await self.repository.list_members(org_id)

    async def add_member(self, org_id: UUID, email: str, role: str) -> MemberDetails:
        user = await self.repository.get_active_user_by_email(email)
        if not user:
            raise OrganizationError(
                "USER_NOT_FOUND", "An active user with that email is required.", 404
            )
        if await self.repository.get_member(org_id, user.id):
            raise OrganizationError(
                "MEMBERSHIP_EXISTS", "This user already belongs to the organization.", 409
            )
        try:
            member = await self.repository.add_member(org_id, user.id, role)
            await self.repository.session.commit()
        except IntegrityError:
            await self.repository.session.rollback()
            raise OrganizationError(
                "MEMBERSHIP_EXISTS", "This user already belongs to the organization.", 409
            ) from None
        return MemberDetails(member, user)

    async def update_member(
        self,
        org_id: UUID,
        actor: AuthenticatedUser,
        member_id: UUID,
        role: str | None,
        active: bool | None,
    ) -> OrganizationMember:
        member = await self.repository.get_member_by_id(org_id, member_id)
        if not member:
            raise OrganizationError("NOT_FOUND", "Membership was not found.", 404)
        if member.user_id == actor.id and (role is not None or active is not None):
            raise OrganizationError(
                "FORBIDDEN", "Admins cannot change their own role or active status.", 403
            )
        removes_admin = (
            member.is_active
            and member.role == "admin"
            and (active is False or (role is not None and role != "admin"))
        )
        if removes_admin and await self.repository.active_admin_count(org_id) <= 1:
            raise OrganizationError(
                "LAST_ACTIVE_ADMIN", "An organization must retain an active admin.", 409
            )
        result = await self.repository.update_member(member, role, active)
        await self.repository.session.commit()
        return result

    async def _available_slug(self, name: str, excluding_id: UUID | None = None) -> str:
        base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:130] or "organization"
        slug = base
        suffix = 2
        while await self.repository.slug_exists(slug, excluding_id):
            slug = f"{base[:135]}-{suffix}"
            suffix += 1
        return slug
