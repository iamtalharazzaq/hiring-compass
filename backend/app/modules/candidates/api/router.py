from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.candidates.adapters.persistence.repositories import CandidateRepository
from app.modules.candidates.api.schemas import (
    CandidatePayload,
    CandidateQuery,
    CreateCandidateRequest,
    candidate_input,
)
from app.modules.candidates.application.services import CandidateError, CandidateService
from app.modules.candidates.domain.entities import Candidate
from app.modules.organizations.api.dependencies import (
    require_active_organization_member,
    require_current_user,
)
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations/{organization_id}/candidates", tags=["candidates"])


async def get_candidate_service(
    session: AsyncSession = Depends(get_db_session),
) -> CandidateService:
    return CandidateService(CandidateRepository(session))


def require_candidate_manager(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}:
        raise HTTPException(403)
    return member


def require_candidate_viewer(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter", "hiring_manager"}:
        raise HTTPException(403)
    return member


def data(item: Candidate) -> dict[str, object]:
    return {
        name: str(value)
        if name in {"id", "organization_id", "created_by_user_id"}
        else value.isoformat()
        if name.endswith("_at")
        else value
        for name, value in item.__dict__.items()
    }


def failure(request: Request, error: CandidateError) -> JSONResponse:
    return error_response(request, error.code, error.message, error.status)


@router.post("", status_code=201)
async def create_candidate(
    request: Request,
    organization_id: UUID,
    payload: CreateCandidateRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(require_candidate_manager),
    service: CandidateService = Depends(get_candidate_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "candidate": data(
                    await service.create(organization_id, user, candidate_input(payload))
                )
            },
            201,
        )
    except CandidateError as error:
        return failure(request, error)


@router.get("")
async def list_candidates(
    request: Request,
    organization_id: UUID,
    query: CandidateQuery = Depends(),
    _: OrganizationMember = Depends(require_candidate_viewer),
    service: CandidateService = Depends(get_candidate_service),
) -> JSONResponse:
    items, total, pages = await service.list(
        organization_id, query.page, query.page_size, query.search
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


@router.get("/{candidate_id}")
async def get_candidate(
    request: Request,
    organization_id: UUID,
    candidate_id: UUID,
    _: OrganizationMember = Depends(require_candidate_viewer),
    service: CandidateService = Depends(get_candidate_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"candidate": data(await service.get(organization_id, candidate_id))}
        )
    except CandidateError as error:
        return failure(request, error)


@router.patch("/{candidate_id}")
async def update_candidate(
    request: Request,
    organization_id: UUID,
    candidate_id: UUID,
    payload: CandidatePayload,
    _: OrganizationMember = Depends(require_candidate_manager),
    service: CandidateService = Depends(get_candidate_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "candidate": data(
                    await service.update(organization_id, candidate_id, candidate_input(payload))
                )
            },
        )
    except CandidateError as error:
        return failure(request, error)
