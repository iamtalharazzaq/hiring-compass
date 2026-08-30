# ruff: noqa: E501, E701, E702, I001
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.interviews.adapters.persistence.models import InterviewModel, InterviewStageModel
from app.modules.interviews.api.schemas import CancelRequest, InterviewRequest, InterviewUpdateRequest, ReorderRequest, StageRequest, StageUpdateRequest
from app.modules.interviews.application.services import InterviewError, InterviewService
from app.modules.organizations.api.dependencies import require_active_organization_member, require_current_user
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["interviews"])
async def service(session: AsyncSession = Depends(get_db_session)) -> InterviewService: return InterviewService(session)
def manage(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}: raise HTTPException(403)
    return member
def view(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "recruiter", "hiring_manager"}: raise HTTPException(403)
    return member
def fail(request: Request, error: InterviewError) -> JSONResponse: return error_response(request, error.code, error.message, error.status)
def stage_data(item: InterviewStageModel) -> dict[str, object]: return {"id": str(item.id), "organization_id": str(item.organization_id), "job_id": str(item.job_id), "name": item.name, "description": item.description, "position": item.position, "duration_minutes": item.duration_minutes, "is_active": item.is_active, "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()}
def interview_data(item: InterviewModel) -> dict[str, object]: return {"id": str(item.id), "organization_id": str(item.organization_id), "application_id": str(item.application_id), "interview_stage_id": str(item.interview_stage_id), "scheduled_at": item.scheduled_at.isoformat(), "duration_minutes": item.duration_minutes, "location_or_meeting_details": item.location_or_meeting_details, "status": item.status, "cancelled_reason": item.cancelled_reason, "created_by": str(item.created_by), "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()}

@router.get("/jobs/{job_id}/interview-stages")
async def stages(request: Request, organization_id: UUID, job_id: UUID, _: OrganizationMember = Depends(view), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"items": [stage_data(x) for x in await svc.stages(organization_id, job_id)]})
    except InterviewError as error: return fail(request, error)
@router.post("/jobs/{job_id}/interview-stages", status_code=201)
async def add_stage(request: Request, organization_id: UUID, job_id: UUID, payload: StageRequest, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"stage": stage_data(await svc.add_stage(organization_id, job_id, payload.name, payload.description, payload.duration_minutes))}, 201)
    except InterviewError as error: return fail(request, error)
@router.patch("/interview-stages/{stage_id}")
async def update_stage(request: Request, organization_id: UUID, stage_id: UUID, payload: StageUpdateRequest, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"stage": stage_data(await svc.update_stage(organization_id, stage_id, **payload.model_dump(exclude_unset=True)))})
    except InterviewError as error: return fail(request, error)
@router.post("/jobs/{job_id}/interview-stages/reorder")
async def reorder(request: Request, organization_id: UUID, job_id: UUID, payload: ReorderRequest, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"items": [stage_data(x) for x in await svc.reorder(organization_id, job_id, payload.stage_ids)]})
    except InterviewError as error: return fail(request, error)
@router.post("/interview-stages/{stage_id}/deactivate")
async def deactivate(request: Request, organization_id: UUID, stage_id: UUID, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"stage": stage_data(await svc.update_stage(organization_id, stage_id, is_active=False))})
    except InterviewError as error: return fail(request, error)
@router.get("/jobs/{job_id}/interviews")
async def job_interviews(request: Request, organization_id: UUID, job_id: UUID, _: OrganizationMember = Depends(view), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"items": [interview_data(x) for x in await svc.job_interviews(organization_id, job_id)]})
    except InterviewError as error: return fail(request, error)
@router.get("/applications/{application_id}/interviews")
async def application_interviews(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(view), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"items": [interview_data(x) for x in await svc.application_interviews(organization_id, application_id)]})
    except InterviewError as error: return fail(request, error)
@router.post("/applications/{application_id}/interviews", status_code=201)
async def create(request: Request, organization_id: UUID, application_id: UUID, payload: InterviewRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"interview": interview_data(await svc.create_interview(organization_id, application_id, payload.interview_stage_id, payload.scheduled_at, payload.duration_minutes, payload.location_or_meeting_details, user.id))}, 201)
    except InterviewError as error: return fail(request, error)
@router.patch("/interviews/{interview_id}")
async def update(request: Request, organization_id: UUID, interview_id: UUID, payload: InterviewUpdateRequest, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"interview": interview_data(await svc.update_interview(organization_id, interview_id, **payload.model_dump(exclude_unset=True)))})
    except InterviewError as error: return fail(request, error)
@router.post("/interviews/{interview_id}/cancel")
async def cancel(request: Request, organization_id: UUID, interview_id: UUID, payload: CancelRequest, _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)) -> JSONResponse:
    try: return success_response(request, {"interview": interview_data(await svc.cancel(organization_id, interview_id, payload.cancelled_reason))})
    except InterviewError as error: return fail(request, error)
@router.get("/interviews")
async def upcoming(request: Request, organization_id: UUID, _: OrganizationMember = Depends(view), svc: InterviewService = Depends(service)) -> JSONResponse:
    return success_response(request, {"items": [interview_data(x) for x in await svc.upcoming(organization_id)]})
