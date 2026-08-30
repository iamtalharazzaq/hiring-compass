# ruff: noqa: E501, E701, E702, I001, F401
from uuid import UUID
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.activity.adapters.persistence.models import ActivityEventModel
from app.modules.activity.application.service import timeline
from app.modules.organizations.api.dependencies import (
    require_active_organization_member,
)
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations/{organization_id}", tags=["activity"])
LABELS = {
    "candidate_created": "Candidate created",
    "candidate_profile_updated": "Candidate profile updated",
    "resume_uploaded": "Resume uploaded",
    "resume_version_added": "Resume version added",
    "application_created": "Application created",
    "application_status_changed": "Application status changed",
    "interview_stage_created": "Interview stage created",
    "interview_scheduled": "Interview scheduled",
    "interview_updated": "Interview updated",
    "interview_cancelled": "Interview cancelled",
    "interviewer_assigned": "Interviewer assigned",
    "interviewer_removed": "Interviewer removed",
    "feedback_draft_saved": "Feedback draft saved",
    "feedback_submitted": "Feedback submitted",
}


def event_data(
    event: ActivityEventModel, actor: tuple[UUID, str] | None
) -> dict[str, object]:
    return {
        "id": str(event.id),
        "event_type": event.event_type,
        "label": LABELS.get(event.event_type, "Activity recorded"),
        "description": str((event.event_metadata or {}).get("description", "")),
        "actor": {"id": str(actor[0]), "display_name": actor[1]} if actor else None,
        "candidate_id": str(event.candidate_id) if event.candidate_id else None,
        "job_id": str(event.job_id) if event.job_id else None,
        "application_id": str(event.application_id) if event.application_id else None,
        "interview_id": str(event.interview_id) if event.interview_id else None,
        "metadata": event.event_metadata or {},
        "created_at": event.created_at.isoformat(),
    }


async def response(
    request: Request,
    organization_id: UUID,
    member: OrganizationMember,
    session: AsyncSession,
    *,
    candidate_id: UUID | None = None,
    application_id: UUID | None = None,
    page: int = 1,
    page_size: int = 30,
    event_type: str | None = None
) -> JSONResponse:
    if member.role not in {"admin", "recruiter", "hiring_manager"}:
        return error_response(
            request, "FORBIDDEN", "You do not have access to activity timelines.", 403
        )
    if candidate_id:
        from app.modules.candidates.adapters.persistence.models import CandidateModel
        if not await session.scalar(select(CandidateModel.id).where(CandidateModel.id == candidate_id, CandidateModel.organization_id == organization_id)):
            return error_response(request, "NOT_FOUND", "Candidate was not found.", 404)
    if application_id:
        from app.modules.applications.adapters.persistence.models import ApplicationModel
        if not await session.scalar(select(ApplicationModel.id).where(ApplicationModel.id == application_id, ApplicationModel.organization_id == organization_id)):
            return error_response(request, "NOT_FOUND", "Application was not found.", 404)
    values, total = await timeline(
        session,
        organization_id,
        candidate_id=candidate_id,
        application_id=application_id,
        page=page,
        page_size=page_size,
        event_type=event_type,
    )
    actor_ids = {event.actor_user_id for event in values if event.actor_user_id}
    from app.modules.auth.adapters.persistence.models import UserModel

    actors = (
        {
            user.id: user.display_name
            for user in (
                await session.scalars(
                    select(UserModel).where(UserModel.id.in_(actor_ids))
                )
            ).all()
        }
        if actor_ids
        else {}
    )
    return success_response(
        request,
        {
            "items": [
                (
                    event_data(
                        event, (event.actor_user_id, actors[event.actor_user_id])
                    )
                    if event.actor_user_id and event.actor_user_id in actors
                    else event_data(event, None)
                )
                for event in values
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size if total else 0,
            },
        },
    )


@router.get("/candidates/{candidate_id}/timeline")
async def candidate_timeline(
    request: Request,
    organization_id: UUID,
    candidate_id: UUID,
    page: int = 1,
    page_size: int = 30,
    event_type: str | None = None,
    member: OrganizationMember = Depends(require_active_organization_member),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    return await response(
        request,
        organization_id,
        member,
        session,
        candidate_id=candidate_id,
        page=page,
        page_size=page_size,
        event_type=event_type,
    )


@router.get("/applications/{application_id}/timeline")
async def application_timeline(
    request: Request,
    organization_id: UUID,
    application_id: UUID,
    page: int = 1,
    page_size: int = 30,
    event_type: str | None = None,
    member: OrganizationMember = Depends(require_active_organization_member),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    return await response(
        request,
        organization_id,
        member,
        session,
        application_id=application_id,
        page=page,
        page_size=page_size,
        event_type=event_type,
    )
