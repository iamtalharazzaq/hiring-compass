from collections.abc import AsyncIterator
from uuid import UUID

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.api.dependencies import get_auth_service
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.auth.application.services import AuthenticationError, AuthService
from app.modules.organizations.adapters.persistence.repositories import (
    SqlAlchemyOrganizationRepository,
)
from app.modules.organizations.application.services import OrganizationError, OrganizationService
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session


async def get_organization_service(
    session: AsyncSession = Depends(get_db_session),
) -> AsyncIterator[OrganizationService]:
    yield OrganizationService(SqlAlchemyOrganizationRepository(session))


async def require_current_user(
    authorization: str | None = Header(default=None),
    service: AuthService = Depends(get_auth_service),
) -> AuthenticatedUser:
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(401)
    try:
        return await service.current_user(token)
    except AuthenticationError:
        raise HTTPException(401) from None


async def require_active_organization_member(
    organization_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> OrganizationMember:
    try:
        return await service.get_active_membership(organization_id, user)
    except OrganizationError as e:
        raise HTTPException(e.status) from None


async def require_organization_admin(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role != "admin":
        raise HTTPException(403)
    return member
