from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.activity.application.service import record
from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.offers.adapters.persistence.models import OnboardingModel, OnboardingTaskModel, OfferModel
from app.modules.offers.api.schemas import OfferRequest, OfferResponseRequest, TaskRequest, TaskUpdateRequest
from app.modules.organizations.api.dependencies import require_active_organization_member, require_current_user
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(tags=["offers"])
org_router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["offers"])
DEFAULT_TASKS = ("Confirm joining date", "Collect required documents", "Create account access", "Assign manager", "Share first-day information", "Complete orientation")


def manager(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}: raise HTTPException(403)
    return member


def reviewer(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "hiring_manager"}: raise HTTPException(403)
    return member


def offer_data(item: OfferModel) -> dict[str, object]:
    return {"id": str(item.id), "application_id": str(item.application_id), "job_title": item.job_title, "salary": item.salary, "currency": item.currency, "start_date": item.start_date.isoformat(), "employment_type": item.employment_type, "work_location": item.work_location, "expiry_date": item.expiry_date.isoformat(), "additional_terms": item.additional_terms, "status": item.status, "sent_at": item.sent_at.isoformat() if item.sent_at else None, "responded_at": item.responded_at.isoformat() if item.responded_at else None, "candidate_url": f"/offer/{item.candidate_token}"}


def onboarding_data(item: OnboardingModel, tasks: list[OnboardingTaskModel]) -> dict[str, object]:
    done = sum(task.completed_at is not None for task in tasks)
    return {"id": str(item.id), "application_id": str(item.application_id), "status": item.status, "progress": {"completed": done, "total": len(tasks)}, "tasks": [{"id": str(task.id), "title": task.title, "owner": task.owner, "due_date": task.due_date.isoformat() if task.due_date else None, "is_required": task.is_required, "completed": task.completed_at is not None, "completed_at": task.completed_at.isoformat() if task.completed_at else None} for task in tasks]}


async def app(session: AsyncSession, org: UUID, app_id: UUID) -> ApplicationModel | None:
    return await session.scalar(select(ApplicationModel).where(ApplicationModel.id == app_id, ApplicationModel.organization_id == org))


@org_router.get("/applications/{application_id}/offer")
async def get_offer(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.organization_id == organization_id, OfferModel.application_id == application_id))
    return success_response(request, {"offer": offer_data(item) if item else None})


@org_router.post("/applications/{application_id}/offer", status_code=201)
async def create_offer(request: Request, organization_id: UUID, application_id: UUID, payload: OfferRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    application = await app(session, organization_id, application_id)
    if not application: return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    if application.status != "hired": return error_response(request, "INVALID_STATE", "An offer can only be created for a hired candidate.", 409)
    if payload.expiry_date < payload.start_date: return error_response(request, "VALIDATION_ERROR", "Offer expiry must not be before the start date.", 422)
    if await session.scalar(select(OfferModel.id).where(OfferModel.application_id == application_id)): return error_response(request, "CONFLICT", "This application already has an offer.", 409)
    now = datetime.now(UTC); item = OfferModel(organization_id=organization_id, application_id=application_id, created_by=user.id, created_at=now, updated_at=now, **payload.model_dump())
    session.add(item); await session.flush(); await record(session, organization_id, "offer_created", "offer", item.id, user.id, candidate_id=application.candidate_id, job_id=application.job_id, application_id=application.id, metadata={"description": "Offer created", "status": item.status}); await session.commit()
    return success_response(request, {"offer": offer_data(item)}, 201)


@org_router.patch("/offers/{offer_id}")
async def update_offer(request: Request, organization_id: UUID, offer_id: UUID, payload: OfferRequest, _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.id == offer_id, OfferModel.organization_id == organization_id))
    if not item: return error_response(request, "NOT_FOUND", "Offer was not found.", 404)
    if item.status not in {"draft", "pending_approval", "approved"}: return error_response(request, "INVALID_STATE", "Sent offers cannot be edited.", 409)
    if payload.expiry_date < payload.start_date: return error_response(request, "VALIDATION_ERROR", "Offer expiry must not be before the start date.", 422)
    for key, value in payload.model_dump().items(): setattr(item, key, value)
    item.updated_at = datetime.now(UTC); await session.commit(); return success_response(request, {"offer": offer_data(item)})


@org_router.post("/offers/{offer_id}/submit")
async def submit_offer(request: Request, organization_id: UUID, offer_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.id == offer_id, OfferModel.organization_id == organization_id))
    if not item or item.status != "draft": return error_response(request, "INVALID_STATE", "Only draft offers can be submitted.", 409)
    item.status, item.updated_at = "pending_approval", datetime.now(UTC); await record(session, organization_id, "offer_submitted", "offer", item.id, user.id, application_id=item.application_id, metadata={"description": "Offer submitted for approval"}); await session.commit(); return success_response(request, {"offer": offer_data(item)})


@org_router.post("/offers/{offer_id}/approve")
async def approve_offer(request: Request, organization_id: UUID, offer_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.id == offer_id, OfferModel.organization_id == organization_id))
    if not item or item.status != "pending_approval": return error_response(request, "INVALID_STATE", "Only pending offers can be approved.", 409)
    if item.created_by == user.id: return error_response(request, "FORBIDDEN", "The offer creator cannot approve it.", 403)
    item.status, item.approved_by, item.updated_at = "approved", user.id, datetime.now(UTC); await record(session, organization_id, "offer_approved", "offer", item.id, user.id, application_id=item.application_id, metadata={"description": "Offer approved"}); await session.commit(); return success_response(request, {"offer": offer_data(item)})


@org_router.post("/offers/{offer_id}/send")
async def send_offer(request: Request, organization_id: UUID, offer_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.id == offer_id, OfferModel.organization_id == organization_id))
    if not item or item.status != "approved": return error_response(request, "INVALID_STATE", "Only approved offers can be sent.", 409)
    now = datetime.now(UTC); item.status, item.sent_at, item.updated_at = "sent", now, now; await record(session, organization_id, "offer_sent", "offer", item.id, user.id, application_id=item.application_id, metadata={"description": "Offer sent"}); await session.commit(); return success_response(request, {"offer": offer_data(item)})


@router.get("/api/v1/offers/{token}")
async def candidate_offer(request: Request, token: UUID, session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.candidate_token == token))
    if not item: return error_response(request, "NOT_FOUND", "Offer was not found.", 404)
    return success_response(request, {"offer": offer_data(item)})


@router.post("/api/v1/offers/{token}/response")
async def respond_offer(request: Request, token: UUID, payload: OfferResponseRequest, session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OfferModel).where(OfferModel.candidate_token == token))
    if not item: return error_response(request, "NOT_FOUND", "Offer was not found.", 404)
    if item.status != "sent" or payload.response not in {"accepted", "declined"}: return error_response(request, "INVALID_STATE", "This offer cannot be responded to.", 409)
    application = await session.scalar(select(ApplicationModel).where(ApplicationModel.id == item.application_id)); now = datetime.now(UTC); item.status, item.responded_at, item.updated_at = payload.response, now, now
    if application: await record(session, item.organization_id, f"offer_{payload.response}", "offer", item.id, None, candidate_id=application.candidate_id, job_id=application.job_id, application_id=application.id, metadata={"description": f"Offer {payload.response}", "responded_at": now.isoformat()})
    await session.commit(); return success_response(request, {"offer": offer_data(item)})


@org_router.get("/applications/{application_id}/onboarding")
async def get_onboarding(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OnboardingModel).where(OnboardingModel.organization_id == organization_id, OnboardingModel.application_id == application_id))
    tasks = list((await session.scalars(select(OnboardingTaskModel).where(OnboardingTaskModel.onboarding_id == item.id).order_by(OnboardingTaskModel.position))).all()) if item else []
    return success_response(request, {"onboarding": onboarding_data(item, tasks) if item else None})


@org_router.post("/applications/{application_id}/onboarding", status_code=201)
async def start_onboarding(request: Request, organization_id: UUID, application_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    application = await app(session, organization_id, application_id); offer = await session.scalar(select(OfferModel).where(OfferModel.application_id == application_id, OfferModel.status == "accepted"))
    if not application or not offer: return error_response(request, "INVALID_STATE", "Onboarding requires an accepted offer.", 409)
    item = await session.scalar(select(OnboardingModel).where(OnboardingModel.application_id == application_id))
    if item: return error_response(request, "CONFLICT", "Onboarding has already started.", 409)
    now = datetime.now(UTC); item = OnboardingModel(organization_id=organization_id, application_id=application_id, status="in_progress", started_at=now); session.add(item); await session.flush()
    session.add_all([OnboardingTaskModel(onboarding_id=item.id, title=title, position=index, is_required=True) for index, title in enumerate(DEFAULT_TASKS, 1)])
    application.status, application.status_changed_at, application.updated_at = "onboarding", now, now; await record(session, organization_id, "onboarding_started", "onboarding", item.id, user.id, candidate_id=application.candidate_id, job_id=application.job_id, application_id=application.id, metadata={"description": "Onboarding started"}); await session.commit()
    tasks = list((await session.scalars(select(OnboardingTaskModel).where(OnboardingTaskModel.onboarding_id == item.id).order_by(OnboardingTaskModel.position))).all()); return success_response(request, {"onboarding": onboarding_data(item, tasks)}, 201)


@org_router.post("/onboardings/{onboarding_id}/tasks", status_code=201)
async def add_task(request: Request, organization_id: UUID, onboarding_id: UUID, payload: TaskRequest, _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OnboardingModel).where(OnboardingModel.id == onboarding_id, OnboardingModel.organization_id == organization_id))
    if not item or item.status != "in_progress": return error_response(request, "INVALID_STATE", "Tasks can only be added while onboarding is in progress.", 409)
    position = int(await session.scalar(select(OnboardingTaskModel.position).where(OnboardingTaskModel.onboarding_id == onboarding_id).order_by(OnboardingTaskModel.position.desc()).limit(1)) or 0) + 1; task = OnboardingTaskModel(onboarding_id=onboarding_id, position=position, **payload.model_dump()); session.add(task); await session.commit(); return success_response(request, {"task": str(task.id)}, 201)


@org_router.patch("/onboarding-tasks/{task_id}")
async def update_task(request: Request, organization_id: UUID, task_id: UUID, payload: TaskUpdateRequest, _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    task = await session.scalar(select(OnboardingTaskModel).join(OnboardingModel).where(OnboardingTaskModel.id == task_id, OnboardingModel.organization_id == organization_id, OnboardingModel.status == "in_progress"))
    if not task: return error_response(request, "NOT_FOUND", "Onboarding task was not found.", 404)
    task.completed_at = datetime.now(UTC) if payload.completed else None; await session.commit(); return success_response(request, {"task": str(task.id), "completed": bool(task.completed_at)})


@org_router.post("/onboardings/{onboarding_id}/complete")
async def complete_onboarding(request: Request, organization_id: UUID, onboarding_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(OnboardingModel).where(OnboardingModel.id == onboarding_id, OnboardingModel.organization_id == organization_id, OnboardingModel.status == "in_progress")); tasks = list((await session.scalars(select(OnboardingTaskModel).where(OnboardingTaskModel.onboarding_id == onboarding_id))).all())
    if not item or any(task.is_required and not task.completed_at for task in tasks): return error_response(request, "INVALID_STATE", "Complete every required onboarding task first.", 409)
    application = await app(session, organization_id, item.application_id); now = datetime.now(UTC); item.status, item.completed_at = "completed", now
    if application: application.status, application.status_changed_at, application.updated_at = "onboarded", now, now; await record(session, organization_id, "onboarding_completed", "onboarding", item.id, user.id, candidate_id=application.candidate_id, job_id=application.job_id, application_id=application.id, metadata={"description": "Onboarding completed"})
    await session.commit(); return success_response(request, {"status": "completed"})
