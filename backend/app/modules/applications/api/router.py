from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.applications.adapters.persistence.repositories import ApplicationRepository
from app.modules.applications.api.schemas import (
    ApplicationQuery,
    ApplicationStatusRequest,
    CreateApplicationRequest,
)
from app.modules.applications.application.services import ApplicationError, ApplicationService
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.organizations.api.dependencies import (
    require_active_organization_member,
    require_current_user,
)
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["applications"])


async def service(session: AsyncSession = Depends(get_db_session)) -> ApplicationService:
    return ApplicationService(ApplicationRepository(session))


def manager(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}:
        raise HTTPException(403)
    return member


def viewer(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter", "hiring_manager"}:
        raise HTTPException(403)
    return member


def fail(request: Request, error: ApplicationError) -> JSONResponse:
    return error_response(request, error.code, error.message, error.status)


def data(item: ApplicationModel) -> dict[str, object]:
    return {
        "id": str(item.id),
        "organization_id": str(item.organization_id),
        "job_id": str(item.job_id),
        "candidate_id": str(item.candidate_id),
        "status": item.status,
        "created_by_user_id": str(item.created_by_user_id),
        "status_changed_at": item.status_changed_at.isoformat(),
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


@router.post("/jobs/{job_id}/applications", status_code=201)
async def add(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: CreateApplicationRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(manager),
    service: ApplicationService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "application": data(
                    await service.add(organization_id, job_id, payload.candidate_id, user)
                )
            },
            201,
        )
    except ApplicationError as error:
        return fail(request, error)


@router.get("/jobs/{job_id}/applications")
async def list_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    query: ApplicationQuery = Depends(),
    _: OrganizationMember = Depends(viewer),
    service: ApplicationService = Depends(service),
) -> JSONResponse:
    try:
        items, total, pages = await service.list(
            organization_id,
            job_id=job_id,
            status=query.status,
            page=query.page,
            page_size=query.page_size,
        )
        return success_response(
            request,
            {
                "items": [data(item) for item in items],
                "pagination": {
                    "page": query.page,
                    "page_size": query.page_size,
                    "total": total,
                    "total_pages": pages,
                },
            },
        )
    except ApplicationError as error:
        return fail(request, error)


@router.get("/candidates/{candidate_id}/applications")
async def list_candidate(
    request: Request,
    organization_id: UUID,
    candidate_id: UUID,
    query: ApplicationQuery = Depends(),
    _: OrganizationMember = Depends(viewer),
    service: ApplicationService = Depends(service),
) -> JSONResponse:
    try:
        items, total, pages = await service.list(
            organization_id, candidate_id=candidate_id, page=query.page, page_size=query.page_size
        )
        return success_response(
            request,
            {
                "items": [data(item) for item in items],
                "pagination": {
                    "page": query.page,
                    "page_size": query.page_size,
                    "total": total,
                    "total_pages": pages,
                },
            },
        )
    except ApplicationError as error:
        return fail(request, error)


@router.get("/applications/{application_id}")
async def get(
    request: Request,
    organization_id: UUID,
    application_id: UUID,
    _: OrganizationMember = Depends(viewer),
    service: ApplicationService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"application": data(await service.get(organization_id, application_id))}
        )
    except ApplicationError as error:
        return fail(request, error)


@router.post("/applications/{application_id}/status")
async def change(
    request: Request,
    organization_id: UUID,
    application_id: UUID,
    payload: ApplicationStatusRequest,
    _: OrganizationMember = Depends(manager),
    service: ApplicationService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "application": data(
                    await service.change_status(organization_id, application_id, payload.status)
                )
            },
        )
    except ApplicationError as error:
        return fail(request, error)
