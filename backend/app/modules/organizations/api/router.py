from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.organizations.api.dependencies import (
    get_organization_service,
    require_active_organization_member,
    require_current_user,
    require_organization_admin,
)
from app.modules.organizations.api.schemas import (
    AddMemberRequest,
    CreateOrganizationRequest,
    UpdateMemberRequest,
    UpdateOrganizationRequest,
)
from app.modules.organizations.application.dto import MemberDetails
from app.modules.organizations.application.services import OrganizationError, OrganizationService
from app.modules.organizations.domain.entities import Organization, OrganizationMember
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations", tags=["organizations"])


def org_data(o: Organization) -> dict[str, object]:
    return {"id": str(o.id), "name": o.name, "slug": o.slug}


def member_data(m: OrganizationMember) -> dict[str, object]:
    return {
        "id": str(m.id),
        "role": m.role,
        "is_active": m.is_active,
        "joined_at": m.joined_at.isoformat(),
    }


def detail(d: MemberDetails) -> dict[str, object]:
    return {
        "user": {
            "id": str(d.user.id),
            "email": d.user.email,
            "display_name": d.user.display_name,
            "is_active": d.user.is_active,
        },
        "membership": member_data(d.member),
    }


def fail(request: Request, e: OrganizationError) -> JSONResponse:
    return error_response(request, e.code, e.message, e.status)


@router.post("")
async def create(
    request: Request,
    payload: CreateOrganizationRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    d = await service.create(user, payload.name)
    return success_response(
        request,
        {"organization": org_data(d.organization), "membership": member_data(d.membership)},
        201,
    )


@router.get("")
async def list_mine(
    request: Request,
    user: AuthenticatedUser = Depends(require_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    rows = await service.list_mine(user)
    return success_response(
        request, [{"organization": org_data(o), "role": m.role} for o, m in rows]
    )


@router.get("/{organization_id}")
async def get(
    request: Request,
    organization_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    try:
        await service.get_active_membership(organization_id, user)
        return success_response(
            request, {"organization": org_data(await service.get(organization_id))}
        )
    except OrganizationError as e:
        return fail(request, e)


@router.patch("/{organization_id}")
async def update(
    request: Request,
    organization_id: UUID,
    payload: UpdateOrganizationRequest,
    _: OrganizationMember = Depends(require_organization_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"organization": org_data(await service.update(organization_id, payload.name))}
        )
    except OrganizationError as e:
        return fail(request, e)


@router.get("/{organization_id}/members")
async def members(
    request: Request,
    organization_id: UUID,
    _: OrganizationMember = Depends(require_active_organization_member),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    return success_response(
        request, {"members": [detail(d) for d in await service.list_members(organization_id)]}
    )


@router.post("/{organization_id}/members")
async def add_member(
    request: Request,
    organization_id: UUID,
    payload: AddMemberRequest,
    _: OrganizationMember = Depends(require_organization_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            detail(await service.add_member(organization_id, str(payload.email), payload.role)),
            201,
        )
    except OrganizationError as e:
        return fail(request, e)


@router.patch("/{organization_id}/members/{member_id}")
async def update_member(
    request: Request,
    organization_id: UUID,
    member_id: UUID,
    payload: UpdateMemberRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(require_organization_admin),
    service: OrganizationService = Depends(get_organization_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "membership": member_data(
                    await service.update_member(
                        organization_id, user, member_id, payload.role, payload.is_active
                    )
                )
            },
        )
    except OrganizationError as e:
        return fail(request, e)
