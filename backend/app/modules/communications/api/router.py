# ruff: noqa: E501, E701, E702, E703, I001
from datetime import UTC, datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.activity.application.service import record
from app.modules.applications.adapters.persistence.models import ApplicationModel
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.candidates.adapters.persistence.models import CandidateModel
from app.modules.communications.adapters.persistence.models import CandidateCommunicationModel
from app.modules.communications.api.schemas import CommunicationRequest, ReviewRequest
from app.modules.communications.adapters.persistence.delivery_models import EmailDeliveryModel
from app.modules.communications.adapters.email.smtp import SmtpEmailSender
from app.config import get_settings
from pydantic import BaseModel
from app.modules.decisions.adapters.persistence.models import HiringDecisionModel
from app.modules.jobs.adapters.persistence.models import JobModel
from app.modules.organizations.api.dependencies import require_active_organization_member, require_current_user
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response
router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["candidate-communications"])
class SendRequest(BaseModel): confirmation: bool
def delivery_data(item: EmailDeliveryModel) -> dict[str, object]: return {"id": str(item.id), "communication_id": str(item.communication_id), "recipient_email": item.recipient_email, "subject_snapshot": item.subject_snapshot, "status": item.status, "attempt_count": item.attempt_count, "last_error_code": item.last_error_code, "last_error_message": "Delivery failed. Retry after checking email configuration." if item.status == "failed" else None, "sent_at": item.sent_at.isoformat() if item.sent_at else None, "failed_at": item.failed_at.isoformat() if item.failed_at else None, "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()}
def manager(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}: raise HTTPException(403)
    return member
def reviewer(member: OrganizationMember = Depends(require_active_organization_member)) -> OrganizationMember:
    if member.role not in {"admin", "hiring_manager"}: raise HTTPException(403)
    return member
def data(item: CandidateCommunicationModel) -> dict[str, object]:
    return {"id": str(item.id), "organization_id": str(item.organization_id), "application_id": str(item.application_id), "candidate_id": str(item.candidate_id), "job_id": str(item.job_id), "communication_type": item.communication_type, "status": item.status, "recipient_email": item.recipient_email, "subject": item.subject, "body": item.body, "salary_amount": str(item.salary_amount) if item.salary_amount is not None else None, "salary_currency": item.salary_currency, "start_date": item.start_date.isoformat() if item.start_date else None, "employment_details": item.employment_details, "expires_at": item.expires_at.isoformat() if item.expires_at else None, "created_by": str(item.created_by), "reviewed_by": str(item.reviewed_by) if item.reviewed_by else None, "review_notes": item.review_notes, "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None, "reviewed_at": item.reviewed_at.isoformat() if item.reviewed_at else None, "ready_at": item.ready_at.isoformat() if item.ready_at else None, "created_at": item.created_at.isoformat(), "updated_at": item.updated_at.isoformat()}
async def context(session: AsyncSession, org: UUID, app_id: UUID) -> tuple[ApplicationModel, CandidateModel, JobModel] | None:
    app = await session.scalar(select(ApplicationModel).where(ApplicationModel.id == app_id, ApplicationModel.organization_id == org))
    if not app: return None
    candidate = await session.scalar(select(CandidateModel).where(CandidateModel.id == app.candidate_id, CandidateModel.organization_id == org)); job = await session.scalar(select(JobModel).where(JobModel.id == app.job_id, JobModel.organization_id == org))
    return (app, candidate, job) if candidate and job else None
@router.get("/applications/{application_id}/communications")
async def list_communications(request: Request, organization_id: UUID, application_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not await context(session, organization_id, application_id): return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    values = list((await session.scalars(select(CandidateCommunicationModel).where(CandidateCommunicationModel.organization_id == organization_id, CandidateCommunicationModel.application_id == application_id).order_by(CandidateCommunicationModel.created_at.desc()))).all()); return success_response(request, {"items": [data(x) for x in values]})
@router.post("/applications/{application_id}/communications", status_code=201)
async def create(request: Request, organization_id: UUID, application_id: UUID, payload: CommunicationRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    found = await context(session, organization_id, application_id)
    if not found: return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    app, candidate, job = found
    if not candidate.email: return error_response(request, "VALIDATION_ERROR", "The candidate does not have a valid email address.", 422)
    if payload.communication_type == "offer":
        decision = await session.scalar(select(HiringDecisionModel).where(HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.application_id == app.id, HiringDecisionModel.proposed_outcome == "proceed_to_offer", HiringDecisionModel.status == "approved"))
        if not decision: return error_response(request, "COMMUNICATION_NOT_READY", "An approved proceed-to-offer decision is required.", 422)
    now = datetime.now(UTC); item = CandidateCommunicationModel(organization_id=organization_id, application_id=app.id, candidate_id=candidate.id, job_id=job.id, communication_type=payload.communication_type, recipient_email=candidate.email, subject=payload.subject.strip(), body=payload.body.strip(), salary_amount=payload.salary_amount, salary_currency=payload.salary_currency.upper() if payload.salary_currency else None, start_date=payload.start_date, employment_details=payload.employment_details, expires_at=payload.expires_at, created_by=user.id, created_at=now, updated_at=now); session.add(item); await session.flush(); await record(session, organization_id, "communication_created", "candidate_communication", item.id, user.id, candidate_id=candidate.id, job_id=job.id, application_id=app.id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await session.commit(); return success_response(request, {"communication": data(item)}, 201)
@router.get("/candidate-communications/{communication_id}")
async def get(request: Request, organization_id: UUID, communication_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id)); return success_response(request, {"communication": data(item)}) if item else error_response(request, "NOT_FOUND", "Communication was not found.", 404)
@router.patch("/candidate-communications/{communication_id}")
async def update(request: Request, organization_id: UUID, communication_id: UUID, payload: CommunicationRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id, CandidateCommunicationModel.created_by == user.id));
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.status not in {"draft", "returned"}: return error_response(request, "INVALID_STATE", "Only draft or returned communications can be edited.", 409)
    if payload.communication_type == "offer" and not await session.scalar(select(HiringDecisionModel.id).where(HiringDecisionModel.organization_id == organization_id, HiringDecisionModel.application_id == item.application_id, HiringDecisionModel.proposed_outcome == "proceed_to_offer", HiringDecisionModel.status == "approved")): return error_response(request, "COMMUNICATION_NOT_READY", "An approved proceed-to-offer decision is required.", 422)
    item.communication_type, item.subject, item.body, item.salary_amount, item.salary_currency, item.start_date, item.employment_details, item.expires_at, item.updated_at = payload.communication_type, payload.subject.strip(), payload.body.strip(), payload.salary_amount, payload.salary_currency.upper() if payload.salary_currency else None, payload.start_date, payload.employment_details, payload.expires_at, datetime.now(UTC); await session.commit(); return success_response(request, {"communication": data(item)})
@router.post("/candidate-communications/{communication_id}/submit")
async def submit(request: Request, organization_id: UUID, communication_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id, CandidateCommunicationModel.created_by == user.id));
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.status not in {"draft", "returned"}: return error_response(request, "INVALID_STATE", "Communication cannot be submitted in its current state.", 409)
    now = datetime.now(UTC); item.status, item.submitted_at, item.updated_at = "pending_approval", now, now; await record(session, organization_id, "communication_submitted", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await session.commit(); return success_response(request, {"communication": data(item)})
@router.post("/candidate-communications/{communication_id}/approve")
async def approve(request: Request, organization_id: UUID, communication_id: UUID, payload: ReviewRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id));
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.created_by == user.id: return error_response(request, "FORBIDDEN", "The communication creator cannot approve it.", 403)
    if item.status != "pending_approval": return error_response(request, "INVALID_STATE", "Only pending communications can be approved.", 409)
    now = datetime.now(UTC); item.status, item.reviewed_by, item.reviewed_at, item.ready_at, item.review_notes, item.updated_at = "ready_to_send", user.id, now, now, payload.review_notes, now; await record(session, organization_id, "communication_approved", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await record(session, organization_id, "communication_marked_ready", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await session.commit(); return success_response(request, {"communication": data(item)})
@router.post("/candidate-communications/{communication_id}/return")
async def return_for_changes(request: Request, organization_id: UUID, communication_id: UUID, payload: ReviewRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not payload.review_notes or not payload.review_notes.strip(): return error_response(request, "VALIDATION_ERROR", "Review notes are required when returning a communication.", 422)
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id));
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.created_by == user.id: return error_response(request, "FORBIDDEN", "The communication creator cannot return it.", 403)
    if item.status != "pending_approval": return error_response(request, "INVALID_STATE", "Only pending communications can be returned.", 409)
    now = datetime.now(UTC); item.status, item.reviewed_by, item.reviewed_at, item.review_notes, item.updated_at = "returned", user.id, now, payload.review_notes.strip(), now; await record(session, organization_id, "communication_returned", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await session.commit(); return success_response(request, {"communication": data(item)})
@router.post("/candidate-communications/{communication_id}/cancel")
async def cancel(request: Request, organization_id: UUID, communication_id: UUID, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id, CandidateCommunicationModel.created_by == user.id));
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.status in {"approved", "ready_to_send", "cancelled"}: return error_response(request, "INVALID_STATE", "This communication cannot be cancelled.", 409)
    now = datetime.now(UTC); item.status, item.updated_at = "cancelled", now; await record(session, organization_id, "communication_cancelled", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_type": item.communication_type, "communication_id": str(item.id), "status": item.status}); await session.commit(); return success_response(request, {"communication": data(item)})
@router.get("/approvals/candidate-communications")
async def inbox(request: Request, organization_id: UUID, _: OrganizationMember = Depends(reviewer), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    values = list((await session.scalars(select(CandidateCommunicationModel).where(CandidateCommunicationModel.organization_id == organization_id, CandidateCommunicationModel.status == "pending_approval").order_by(CandidateCommunicationModel.submitted_at.desc()))).all()); return success_response(request, {"items": [data(x) for x in values]})
@router.get("/candidate-communications/{communication_id}/deliveries")
async def deliveries(request: Request, organization_id: UUID, communication_id: UUID, _: OrganizationMember = Depends(require_active_organization_member), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    values = list((await session.scalars(select(EmailDeliveryModel).where(EmailDeliveryModel.organization_id == organization_id, EmailDeliveryModel.communication_id == communication_id).order_by(EmailDeliveryModel.created_at.desc()))).all()); return success_response(request, {"items": [delivery_data(x) for x in values]})
async def send_delivery(session: AsyncSession, item: CandidateCommunicationModel, user: AuthenticatedUser) -> EmailDeliveryModel:
    now = datetime.now(UTC); delivery = EmailDeliveryModel(organization_id=item.organization_id, communication_id=item.id, recipient_email=item.recipient_email, subject_snapshot=item.subject, body_snapshot=item.body, status="sending", attempt_count=1, created_by=user.id, created_at=now, updated_at=now); session.add(delivery); await session.flush()
    try:
        SmtpEmailSender(get_settings()).send(item.recipient_email, item.subject, item.body); delivery.status, delivery.sent_at, item.status = "sent", now, "sent"; item.updated_at = now
    except Exception:
        delivery.status, delivery.failed_at, delivery.last_error_code, delivery.last_error_message = "failed", now, "SMTP_SEND_FAILED", "Delivery failed. Retry after checking email configuration."; delivery.updated_at = now
    await session.commit(); return delivery
@router.post("/candidate-communications/{communication_id}/send")
async def send(request: Request, organization_id: UUID, communication_id: UUID, payload: SendRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not payload.confirmation: return error_response(request, "CONFIRMATION_REQUIRED", "Explicit confirmation is required before sending.", 422)
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == communication_id, CandidateCommunicationModel.organization_id == organization_id).with_for_update())
    if not item: return error_response(request, "NOT_FOUND", "Communication was not found.", 404)
    if item.status == "sent": return error_response(request, "DUPLICATE_SEND", "This communication has already been sent.", 409)
    if item.status != "ready_to_send": return error_response(request, "INVALID_STATE", "Only approved communications ready to send can be sent.", 409)
    delivery = await send_delivery(session, item, user)
    if delivery.status == "failed": return error_response(request, "SMTP_SEND_FAILED", "The message could not be sent. Review the delivery details and try again.", 502)
    await record(session, organization_id, "communication_sent", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_id": str(item.id), "delivery_id": str(delivery.id), "communication_type": item.communication_type, "delivery_status": delivery.status}); await session.commit(); return success_response(request, {"communication": data(item), "delivery": delivery_data(delivery)})
@router.post("/email-deliveries/{delivery_id}/retry")
async def retry(request: Request, organization_id: UUID, delivery_id: UUID, payload: SendRequest, user: AuthenticatedUser = Depends(require_current_user), _: OrganizationMember = Depends(manager), session: AsyncSession = Depends(get_db_session)) -> JSONResponse:
    if not payload.confirmation: return error_response(request, "CONFIRMATION_REQUIRED", "Explicit confirmation is required before sending.", 422)
    old = await session.scalar(select(EmailDeliveryModel).where(EmailDeliveryModel.id == delivery_id, EmailDeliveryModel.organization_id == organization_id));
    if not old: return error_response(request, "NOT_FOUND", "Delivery was not found.", 404)
    if old.status != "failed": return error_response(request, "INVALID_STATE", "Only failed deliveries can be retried.", 409)
    item = await session.scalar(select(CandidateCommunicationModel).where(CandidateCommunicationModel.id == old.communication_id, CandidateCommunicationModel.organization_id == organization_id));
    if not item or item.status == "sent": return error_response(request, "INVALID_STATE", "This communication is no longer retryable.", 409)
    delivery = await send_delivery(session, item, user); await record(session, organization_id, "communication_send_retried", "candidate_communication", item.id, user.id, application_id=item.application_id, candidate_id=item.candidate_id, job_id=item.job_id, metadata={"communication_id": str(item.id), "delivery_id": str(delivery.id), "communication_type": item.communication_type, "delivery_status": delivery.status}); await session.commit(); return success_response(request, {"delivery": delivery_data(delivery)})
