# ruff: noqa: E501, E701, E702, I001, F401
from datetime import UTC, datetime
from uuid import UUID
from typing import cast
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.activity.application.service import record
from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.auth.adapters.persistence.models import UserModel
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.decisions.adapters.persistence.models import HiringDecisionModel
from app.modules.decisions.api.schemas import DecisionRequest, ReviewRequest
from app.modules.interviews.adapters.persistence.models import InterviewAssignmentModel, InterviewFeedbackModel, InterviewModel
from app.modules.jobs.adapters.persistence.models import JobModel
from app.modules.organizations.api.dependencies import require_active_organization_member, require_current_user
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response
router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["hiring-decisions"])
def manager(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}: raise HTTPException(403)
    return member
def reviewer(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "hiring_manager"}: raise HTTPException(403)
    return member
def data(item: HiringDecisionModel, proposer: str | None = None, reviewer_name: str | None = None) -> dict[str, object]:
    return {"id": str(item.id), "application_id": str(item.application_id), "proposed_outcome": item.proposed_outcome, "rationale": item.rationale, "status": item.status, "proposed_by": str(item.proposed_by), "proposer_name": proposer, "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None, "reviewed_by": str(item.reviewed_by) if item.reviewed_by else None, "reviewer_name": reviewer_name, "reviewed_at": item.reviewed_at.isoformat() if item.reviewed_at else None, "review_notes": item.review_notes, "returned_at": item.returned_at.isoformat() if item.returned_at else None, "withdrawn_at": item.withdrawn_at.isoformat() if item.withdrawn_at else None, "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()}
async def application(session: AsyncSession, org: UUID, app_id: UUID) -> ApplicationModel | None: return cast(ApplicationModel | None, await session.scalar(select(ApplicationModel).where(ApplicationModel.id == app_id, ApplicationModel.organization_id == org)))
async def readiness(session: AsyncSession, org: UUID, app: ApplicationModel) -> dict[str, object]:
    interviews = list((await session.scalars(select(InterviewModel).where(InterviewModel.organization_id == org, InterviewModel.application_id == app.id, InterviewModel.status != "cancelled"))).all()); now = datetime.now(UTC); past = [x for x in interviews if x.scheduled_at <= now]; future = [x for x in interviews if x.scheduled_at > now]
    feedback_count = int(await session.scalar(select(func.count(InterviewFeedbackModel.id)).join(InterviewModel, InterviewFeedbackModel.interview_id == InterviewModel.id).where(InterviewFeedbackModel.organization_id == org, InterviewFeedbackModel.interview_id.in_([x.id for x in past]), InterviewFeedbackModel.status == "submitted")) or 0) if past else 0
    expected = int(await session.scalar(select(func.count(InterviewAssignmentModel.id)).join(InterviewModel, InterviewAssignmentModel.interview_id == InterviewModel.id).where(InterviewAssignmentModel.organization_id == org, InterviewAssignmentModel.interview_id.in_([x.id for x in past]))) or 0) if past else 0
    reasons: list[dict[str, str]] = []
    if app.status != "interviewing": reasons.append({"code": "invalid_status", "message": "Application must be interviewing."})
    if not interviews: reasons.append({"code": "interview_missing", "message": "At least one completed interview is required."})
    if future: reasons.append({"code": "interview_scheduled", "message": "A future interview is still scheduled."})
    if not feedback_count: reasons.append({"code": "feedback_missing", "message": "At least one submitted feedback record is required."})
    if expected > feedback_count: reasons.append({"code": "feedback_incomplete", "message": "One assigned interviewer has not submitted feedback."})
    return {"ready": not reasons, "blocking_reasons": reasons, "interviews_total": len(interviews), "feedback_submitted": feedback_count, "feedback_expected": expected}
@router.get("/applications/{application_id}/decision-readiness")
async def decision_readiness(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    app = await application(session, organization_id, application_id)
    if not app: return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    return success_response(request, await readiness(session, organization_id, app))
@router.get("/applications/{application_id}/decisions")
async def decisions(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not await application(session, organization_id, application_id): return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    values = list((await session.scalars(select(HiringDecisionModel).where(HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.application_id == application_id).order_by(HiringDecisionModel.created_at.desc()))).all())
    return success_response(request, {"items": [data(x) for x in values]})
@router.get("/hiring-decisions/{decision_id}")
async def get_decision(request: Request, organization_id: UUID, decision_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id))
    return success_response(request, {"decision": data(item)}) if item else error_response(request, "NOT_FOUND", "Decision was not found.", 404)
@router.post("/applications/{application_id}/decisions", status_code=201)
async def create_decision(request: Request, organization_id: UUID, application_id: UUID, payload: DecisionRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    app = await application(session, organization_id, application_id)
    if not app: return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    active = await session.scalar(select(HiringDecisionModel.id).where(HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.application_id == application_id, HiringDecisionModel.status != "withdrawn"))
    if active: return error_response(request, "CONFLICT", "An active decision already exists for this application.", 409)
    now = datetime.now(UTC); item = HiringDecisionModel(organization_id=organization_id, application_id=application_id, proposed_outcome=payload.proposed_outcome, rationale=payload.rationale.strip(), proposed_by=user.id, created_at=now, updated_at=now); session.add(item); await session.flush(); await record(session, organization_id, "hiring_decision_created", "hiring_decision", item.id, user.id, candidate_id=app.candidate_id, job_id=app.job_id, application_id=app.id, metadata={"outcome": item.proposed_outcome, "status": item.status}); await session.commit(); return success_response(request, {"decision": data(item)}, 201)
@router.patch("/hiring-decisions/{decision_id}")
async def update_decision(request: Request, organization_id: UUID, decision_id: UUID, payload: DecisionRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.proposed_by == user.id))
    if not item: return error_response(request, "NOT_FOUND", "Decision was not found.", 404)
    if item.status not in {"draft", "returned"}: return error_response(request, "INVALID_STATE", "Only draft or returned decisions can be edited.", 409)
    item.proposed_outcome, item.rationale, item.updated_at = payload.proposed_outcome, payload.rationale.strip(), datetime.now(UTC); await session.commit(); return success_response(request, {"decision": data(item)})
@router.post("/hiring-decisions/{decision_id}/submit")
async def submit_decision(request: Request, organization_id: UUID, decision_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.proposed_by == user.id))
    if not item: return error_response(request, "NOT_FOUND", "Decision was not found.", 404)
    if item.status not in {"draft", "returned"}: return error_response(request, "INVALID_STATE", "Decision cannot be submitted in its current state.", 409)
    if not item.rationale.strip(): return error_response(request, "VALIDATION_ERROR", "Rationale is required before submission.", 422)
    app = await application(session, organization_id, item.application_id); ready = await readiness(session, organization_id, app) if app else {"ready": False, "blocking_reasons": []}
    if item.proposed_outcome != "hold" and not ready["ready"]:
        return error_response(request, "DECISION_NOT_READY", "Decision readiness requirements are not met.", 422)
    now = datetime.now(UTC); previous = item.status
    item.status, item.submitted_at, item.updated_at = "pending_approval", now, now
    if app:
        app.status, app.status_changed_at, app.updated_at = "decision_pending", now, now
    await record(session, organization_id, "hiring_decision_resubmitted" if previous == "returned" else "hiring_decision_submitted", "hiring_decision", item.id, user.id, application_id=item.application_id, metadata={"outcome": item.proposed_outcome, "status": item.status}); await session.commit(); return success_response(request, {"decision": data(item), "readiness": ready})
@router.post("/hiring-decisions/{decision_id}/approve")
async def approve(request: Request, organization_id: UUID, decision_id: UUID, payload: ReviewRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id))
    if not item: return error_response(request, "NOT_FOUND", "Decision was not found.", 404)
    if item.proposed_by == user.id: return error_response(request, "FORBIDDEN", "The proposer cannot approve their own decision.", 403)
    if item.status != "pending_approval": return error_response(request, "INVALID_STATE", "Only pending decisions can be approved.", 409)
    app = await application(session, organization_id, item.application_id); now = datetime.now(UTC); item.status, item.reviewed_by, item.reviewed_at, item.review_notes, item.updated_at = "approved", user.id, now, payload.review_notes, now
    if app: app.status = {"proceed_to_offer": "offer_approved", "reject": "rejected", "hold": "on_hold"}[item.proposed_outcome]; app.status_changed_at, app.updated_at = now, now
    await record(session, organization_id, "hiring_decision_approved", "hiring_decision", item.id, user.id, application_id=item.application_id, metadata={"outcome": item.proposed_outcome, "status": item.status}); await session.commit(); return success_response(request, {"decision": data(item)})
@router.post("/hiring-decisions/{decision_id}/return")
async def return_decision(request: Request, organization_id: UUID, decision_id: UUID, payload: ReviewRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not payload.review_notes or not payload.review_notes.strip(): return error_response(request, "VALIDATION_ERROR", "Review notes are required when returning a decision.", 422)
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id))
    if not item: return error_response(request, "NOT_FOUND", "Decision was not found.", 404)
    if item.proposed_by == user.id: return error_response(request, "FORBIDDEN", "The proposer cannot return their own decision.", 403)
    if item.status != "pending_approval": return error_response(request, "INVALID_STATE", "Only pending decisions can be returned.", 409)
    now = datetime.now(UTC); item.status, item.reviewed_by, item.reviewed_at, item.returned_at, item.review_notes, item.updated_at = "returned", user.id, now, now, payload.review_notes.strip(), now; app = await application(session, organization_id, item.application_id)
    if app: app.status, app.status_changed_at, app.updated_at = "interviewing", now, now
    await record(session, organization_id, "hiring_decision_returned", "hiring_decision", item.id, user.id, application_id=item.application_id, metadata={"outcome": item.proposed_outcome, "status": item.status}); await session.commit(); return success_response(request, {"decision": data(item)})
@router.post("/hiring-decisions/{decision_id}/withdraw")
async def withdraw(request: Request, organization_id: UUID, decision_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.id == decision_id, HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.proposed_by == user.id))
    if not item: return error_response(request, "NOT_FOUND", "Decision was not found.", 404)
    if item.status in {"approved", "withdrawn"}: return error_response(request, "INVALID_STATE", "This decision cannot be withdrawn.", 409)
    now = datetime.now(UTC); item.status, item.withdrawn_at, item.updated_at = "withdrawn", now, now; app = await application(session, organization_id, item.application_id)
    if app: app.status, app.status_changed_at, app.updated_at = "interviewing", now, now
    await record(session, organization_id, "hiring_decision_withdrawn", "hiring_decision", item.id, user.id, application_id=item.application_id, metadata={"outcome": item.proposed_outcome, "status": item.status}); await session.commit(); return success_response(request, {"decision": data(item)})
@router.get("/approvals/hiring-decisions")
async def inbox(request: Request, organization_id: UUID, page: int = 1, page_size: int = 30, _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    query = select(HiringDecisionModel).where(HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.status == "pending_approval"); total = int(await session.scalar(select(func.count()).select_from(query.subquery())) or 0); values = list((await session.scalars(query.order_by(HiringDecisionModel.submitted_at.desc()).offset((page - 1) * page_size).limit(page_size))).all()); return success_response(request, {"items": [data(x) for x in values], "pagination": {"page": page, "page_size": page_size, "total": total, "total_pages": (total + page_size - 1) // page_size if total else 0}})
