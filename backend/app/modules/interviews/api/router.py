# ruff: noqa: E501, E701, E702, I001
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.interviews.adapters.persistence.models import (
    InterviewAssignmentModel,
    InterviewFeedbackItemModel,
    InterviewFeedbackModel,
    InterviewModel,
    InterviewStageModel,
    ScorecardCriterionModel,
    ScorecardModel,
)
from app.modules.interviews.api.schemas import (
    AssignmentRequest,
    CancelRequest,
    CriterionRequest,
    CriterionReorderRequest,
    FeedbackRequest,
    InterviewRequest,
    InterviewUpdateRequest,
    ReorderRequest,
    ScorecardRequest,
    StageRequest,
    StageUpdateRequest,
)
from app.modules.organizations.adapters.persistence.models import (
    OrganizationMemberModel,
)
from sqlalchemy import select
from datetime import UTC, datetime, timedelta
from app.modules.interviews.application.services import InterviewError, InterviewService
from app.modules.organizations.api.dependencies import (
    require_active_organization_member,
    require_current_user,
)
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response
from app.modules.activity.application.service import record

router = APIRouter(
    prefix="/api/v1/organizations/{organization_id}", tags=["interviews"]
)


async def service(session: AsyncSession = Depends(get_db_session)) -> InterviewService:
    return InterviewService(session)


def manage(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}:
        raise HTTPException(403)
    return member


def view(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter", "hiring_manager"}:
        raise HTTPException(403)
    return member


def assignment_manager(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter", "hiring_manager"}:
        raise HTTPException(403)
    return member


def staff(member: OrganizationMember) -> bool:
    return member.role in {"admin", "recruiter", "hiring_manager"}


async def assigned(
    session: AsyncSession, organization_id: UUID, interview_id: UUID, user_id: UUID
) -> bool:
    return bool(
        await session.scalar(
            select(InterviewAssignmentModel.id).where(
                InterviewAssignmentModel.organization_id == organization_id,
                InterviewAssignmentModel.interview_id == interview_id,
                InterviewAssignmentModel.user_id == user_id,
            )
        )
    )


def fail(request: Request, error: InterviewError) -> JSONResponse:
    return error_response(request, error.code, error.message, error.status)


def stage_data(item: InterviewStageModel) -> dict[str, object]:
    return {
        "id": str(item.id),
        "organization_id": str(item.organization_id),
        "job_id": str(item.job_id),
        "name": item.name,
        "description": item.description,
        "position": item.position,
        "duration_minutes": item.duration_minutes,
        "is_active": item.is_active,
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


def interview_data(item: InterviewModel) -> dict[str, object]:
    return {
        "id": str(item.id),
        "organization_id": str(item.organization_id),
        "application_id": str(item.application_id),
        "interview_stage_id": str(item.interview_stage_id),
        "scheduled_at": item.scheduled_at.isoformat(),
        "duration_minutes": item.duration_minutes,
        "end_at": (item.scheduled_at + timedelta(minutes=item.duration_minutes)).isoformat(),
        "location_or_meeting_details": item.location_or_meeting_details,
        "status": item.status,
        "cancelled_reason": item.cancelled_reason,
        "created_by": str(item.created_by),
        "created_at": item.created_at.isoformat(),
        "updated_at": item.updated_at.isoformat(),
    }


def assignment_data(item: InterviewAssignmentModel) -> dict[str, object]:
    return {
        "id": str(item.id),
        "interview_id": str(item.interview_id),
        "user_id": str(item.user_id),
        "assigned_by": str(item.assigned_by),
        "created_at": item.created_at.isoformat(),
    }


def scorecard_data(
    item: ScorecardModel, criteria: list[ScorecardCriterionModel]
) -> dict[str, object]:
    return {
        "id": str(item.id),
        "interview_stage_id": str(item.interview_stage_id),
        "title": item.title,
        "instructions": item.instructions,
        "criteria": [
            {
                "id": str(c.id),
                "name": c.name,
                "description": c.description,
                "position": c.position,
                "is_required": c.is_required,
                "is_active": c.is_active,
            }
            for c in criteria
        ],
    }


def feedback_data(
    item: InterviewFeedbackModel, items: list[InterviewFeedbackItemModel]
) -> dict[str, object]:
    return {
        "id": str(item.id),
        "interview_id": str(item.interview_id),
        "reviewer_id": str(item.reviewer_id),
        "overall_rating": item.overall_rating,
        "recommendation": item.recommendation,
        "summary": item.summary,
        "status": item.status,
        "submitted_at": item.submitted_at.isoformat() if item.submitted_at else None,
        "items": [
            {"criterion_id": str(x.criterion_id), "rating": x.rating, "notes": x.notes}
            for x in items
        ],
    }


@router.get("/jobs/{job_id}/interview-stages")
async def stages(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(view),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    stage_data(x) for x in await svc.stages(organization_id, job_id)
                ]
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.post("/jobs/{job_id}/interview-stages", status_code=201)
async def add_stage(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: StageRequest,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "stage": stage_data(
                    await svc.add_stage(
                        organization_id,
                        job_id,
                        payload.name,
                        payload.description,
                        payload.duration_minutes,
                    )
                )
            },
            201,
        )
    except InterviewError as error:
        return fail(request, error)


@router.patch("/interview-stages/{stage_id}")
async def update_stage(
    request: Request,
    organization_id: UUID,
    stage_id: UUID,
    payload: StageUpdateRequest,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "stage": stage_data(
                    await svc.update_stage(
                        organization_id,
                        stage_id,
                        **payload.model_dump(exclude_unset=True)
                    )
                )
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.post("/jobs/{job_id}/interview-stages/reorder")
async def reorder(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: ReorderRequest,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    stage_data(x)
                    for x in await svc.reorder(
                        organization_id, job_id, payload.stage_ids
                    )
                ]
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.post("/interview-stages/{stage_id}/deactivate")
async def deactivate(
    request: Request,
    organization_id: UUID,
    stage_id: UUID,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "stage": stage_data(
                    await svc.update_stage(organization_id, stage_id, is_active=False)
                )
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.get("/jobs/{job_id}/interviews")
async def job_interviews(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(view),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    interview_data(x)
                    for x in await svc.job_interviews(organization_id, job_id)
                ]
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.get("/applications/{application_id}/interviews")
async def application_interviews(
    request: Request,
    organization_id: UUID,
    application_id: UUID,
    _: OrganizationMember = Depends(view),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    interview_data(x)
                    for x in await svc.application_interviews(
                        organization_id, application_id
                    )
                ]
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.post("/applications/{application_id}/interviews", status_code=201)
async def create(
    request: Request,
    organization_id: UUID,
    application_id: UUID,
    payload: InterviewRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "interview": interview_data(
                    await svc.create_interview(
                        organization_id,
                        application_id,
                        payload.interview_stage_id,
                        payload.scheduled_at,
                        payload.duration_minutes,
                        payload.location_or_meeting_details,
                        user.id,
                        payload.end_at,
                    )
                )
            },
            201,
        )
    except InterviewError as error:
        return fail(request, error)


@router.patch("/interviews/{interview_id}")
async def update(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    payload: InterviewUpdateRequest,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "interview": interview_data(
                    await svc.update_interview(
                        organization_id,
                        interview_id,
                        **payload.model_dump(exclude_unset=True)
                    )
                )
            },
        )
    except InterviewError as error:
        return fail(request, error)


@router.post("/interviews/{interview_id}/cancel")
async def cancel(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    payload: CancelRequest,
    _: OrganizationMember = Depends(manage),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "interview": interview_data(
                    await svc.cancel(
                        organization_id, interview_id, payload.cancelled_reason
                    )
                )
            },
        )
    except InterviewError as error:
        return fail(request, error)

@router.post("/interviews/{interview_id}/complete")
async def complete(
    request: Request, organization_id: UUID, interview_id: UUID,
    _: OrganizationMember = Depends(manage), svc: InterviewService = Depends(service)
) -> JSONResponse:
    try:
        return success_response(request, {"interview": interview_data(await svc.complete(organization_id, interview_id))})
    except InterviewError as error:
        return fail(request, error)


@router.get("/interviews")
async def upcoming(
    request: Request,
    organization_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    member: OrganizationMember = Depends(require_active_organization_member),
    session: AsyncSession = Depends(get_db_session),
    svc: InterviewService = Depends(service),
) -> JSONResponse:
    items = await svc.upcoming(organization_id)
    if not staff(member):
        ids = set(
            (
                await session.scalars(
                    select(InterviewAssignmentModel.interview_id).where(
                        InterviewAssignmentModel.organization_id == organization_id,
                        InterviewAssignmentModel.user_id == user.id,
                    )
                )
            ).all()
        )
        items = [item for item in items if item.id in ids]
    return success_response(request, {"items": [interview_data(x) for x in items]})


@router.get("/interviews/{interview_id}/assignments")
async def assignments(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    member: OrganizationMember = Depends(require_active_organization_member),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    if not await session.scalar(
        select(InterviewModel.id).where(
            InterviewModel.id == interview_id,
            InterviewModel.organization_id == organization_id,
        )
    ):
        return error_response(request, "NOT_FOUND", "Interview was not found.", 404)
    if not staff(member) and not await assigned(
        session, organization_id, interview_id, user.id
    ):
        return error_response(
            request, "FORBIDDEN", "This interview is not assigned to you.", 403
        )
    items = (
        await session.scalars(
            select(InterviewAssignmentModel).where(
                InterviewAssignmentModel.organization_id == organization_id,
                InterviewAssignmentModel.interview_id == interview_id,
            )
        )
    ).all()
    return success_response(
        request, {"items": [assignment_data(item) for item in items]}
    )


@router.post("/interviews/{interview_id}/assignments", status_code=201)
async def assign(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    payload: AssignmentRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(assignment_manager),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    interview = await session.scalar(
        select(InterviewModel).where(
            InterviewModel.id == interview_id,
            InterviewModel.organization_id == organization_id,
        )
    )
    member = await session.scalar(
        select(OrganizationMemberModel).where(
            OrganizationMemberModel.organization_id == organization_id,
            OrganizationMemberModel.user_id == payload.user_id,
            OrganizationMemberModel.is_active,
        )
    )
    if not interview:
        return error_response(request, "NOT_FOUND", "Interview was not found.", 404)
    if interview.status == "cancelled":
        return error_response(
            request,
            "INVALID_STATE",
            "Cancelled interviews cannot receive assignments.",
            409,
        )
    if not member:
        return error_response(
            request, "NOT_FOUND", "Active organization member was not found.", 404
        )
    existing = await session.scalar(
        select(InterviewAssignmentModel).where(
            InterviewAssignmentModel.interview_id == interview_id,
            InterviewAssignmentModel.user_id == payload.user_id,
        )
    )
    if existing:
        return error_response(
            request, "CONFLICT", "This interviewer is already assigned.", 409
        )
    now = datetime.now(UTC)
    item = InterviewAssignmentModel(
        organization_id=organization_id,
        interview_id=interview_id,
        user_id=payload.user_id,
        assigned_by=user.id,
        created_at=now,
        updated_at=now,
    )
    session.add(item)
    await session.flush()
    await record(
        session,
        organization_id,
        "interviewer_assigned",
        "interview",
        interview_id,
        user.id,
        application_id=interview.application_id,
        interview_id=interview_id,
        metadata={"description": "Interviewer assigned"},
    )
    await session.commit()
    return success_response(request, {"assignment": assignment_data(item)}, 201)


@router.delete("/interview-assignments/{assignment_id}")
async def remove_assignment(
    request: Request,
    organization_id: UUID,
    assignment_id: UUID,
    _: OrganizationMember = Depends(assignment_manager),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    item = await session.scalar(
        select(InterviewAssignmentModel).where(
            InterviewAssignmentModel.id == assignment_id,
            InterviewAssignmentModel.organization_id == organization_id,
        )
    )
    if not item:
        return error_response(request, "NOT_FOUND", "Assignment was not found.", 404)
    interview_id = item.interview_id
    await session.delete(item)
    await record(
        session,
        organization_id,
        "interviewer_removed",
        "interview",
        interview_id,
        None,
        interview_id=interview_id,
        metadata={"description": "Interviewer removed"},
    )
    await session.commit()
    return success_response(request, {"removed": True})


@router.get("/interview-stages/{stage_id}/scorecard")
async def get_scorecard(
    request: Request,
    organization_id: UUID,
    stage_id: UUID,
    interview_id: UUID | None = Query(None),
    user: AuthenticatedUser = Depends(require_current_user),
    member: OrganizationMember = Depends(require_active_organization_member),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    if not staff(member):
        valid = interview_id and await assigned(
            session, organization_id, interview_id, user.id
        )
        interview = (
            await session.scalar(
                select(InterviewModel).where(
                    InterviewModel.id == interview_id,
                    InterviewModel.organization_id == organization_id,
                )
            )
            if valid
            else None
        )
        if not interview or interview.interview_stage_id != stage_id:
            return error_response(
                request, "FORBIDDEN", "This scorecard is not available to you.", 403
            )
    item = await session.scalar(
        select(ScorecardModel).where(
            ScorecardModel.organization_id == organization_id,
            ScorecardModel.interview_stage_id == stage_id,
        )
    )
    if not item:
        return success_response(request, {"scorecard": None})
    criteria = list(
        (
            await session.scalars(
                select(ScorecardCriterionModel)
                .where(ScorecardCriterionModel.scorecard_id == item.id)
                .order_by(ScorecardCriterionModel.position)
            )
        ).all()
    )
    return success_response(request, {"scorecard": scorecard_data(item, criteria)})


@router.put("/interview-stages/{stage_id}/scorecard")
async def put_scorecard(
    request: Request,
    organization_id: UUID,
    stage_id: UUID,
    payload: ScorecardRequest,
    _: OrganizationMember = Depends(manage),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    stage = await session.scalar(
        select(InterviewStageModel).where(
            InterviewStageModel.id == stage_id,
            InterviewStageModel.organization_id == organization_id,
        )
    )
    if not stage:
        return error_response(
            request, "NOT_FOUND", "Interview stage was not found.", 404
        )
    item = await session.scalar(
        select(ScorecardModel).where(ScorecardModel.interview_stage_id == stage_id)
    )
    now = datetime.now(UTC)
    if item:
        item.title, item.instructions, item.updated_at = (
            payload.title,
            payload.instructions,
            now,
        )
    else:
        item = ScorecardModel(
            organization_id=organization_id,
            interview_stage_id=stage_id,
            title=payload.title,
            instructions=payload.instructions,
            created_at=now,
            updated_at=now,
        )
        session.add(item)
    await session.commit()
    return success_response(request, {"scorecard": scorecard_data(item, [])})


@router.post("/scorecards/{scorecard_id}/criteria", status_code=201)
async def add_criterion(
    request: Request,
    organization_id: UUID,
    scorecard_id: UUID,
    payload: CriterionRequest,
    _: OrganizationMember = Depends(manage),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    card = await session.scalar(
        select(ScorecardModel).where(
            ScorecardModel.id == scorecard_id,
            ScorecardModel.organization_id == organization_id,
        )
    )
    if not card:
        return error_response(request, "NOT_FOUND", "Scorecard was not found.", 404)
    items = list(
        (
            await session.scalars(
                select(ScorecardCriterionModel).where(
                    ScorecardCriterionModel.scorecard_id == scorecard_id
                )
            )
        ).all()
    )
    if any(
        x.is_active and x.name.lower() == payload.name.strip().lower() for x in items
    ):
        return error_response(
            request,
            "CONFLICT",
            "An active criterion with that name already exists.",
            409,
        )
    now = datetime.now(UTC)
    item = ScorecardCriterionModel(
        scorecard_id=scorecard_id,
        name=payload.name.strip(),
        description=payload.description,
        position=len(items) + 1,
        is_required=payload.is_required,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    session.add(item)
    await session.commit()
    return success_response(
        request,
        {
            "criterion": {
                "id": str(item.id),
                "name": item.name,
                "description": item.description,
                "position": item.position,
                "is_required": item.is_required,
                "is_active": item.is_active,
            }
        },
        201,
    )


@router.post("/scorecard-criteria/{criterion_id}/deactivate")
async def deactivate_criterion(
    request: Request,
    organization_id: UUID,
    criterion_id: UUID,
    _: OrganizationMember = Depends(manage),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    item = await session.get(ScorecardCriterionModel, criterion_id)
    if not item:
        return error_response(request, "NOT_FOUND", "Criterion was not found.", 404)
    card = await session.get(ScorecardModel, item.scorecard_id)
    if not item or not card or card.organization_id != organization_id:
        return error_response(request, "NOT_FOUND", "Criterion was not found.", 404)
    assert item is not None
    item.is_active = False
    item.updated_at = datetime.now(UTC)
    await session.commit()
    return success_response(request, {"deactivated": True})


@router.get("/interviews/{interview_id}/my-feedback")
async def my_feedback(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    if not await assigned(session, organization_id, interview_id, user.id):
        return error_response(
            request,
            "FORBIDDEN",
            "Only assigned interviewers can view their feedback.",
            403,
        )
    item = await session.scalar(
        select(InterviewFeedbackModel).where(
            InterviewFeedbackModel.organization_id == organization_id,
            InterviewFeedbackModel.interview_id == interview_id,
            InterviewFeedbackModel.reviewer_id == user.id,
        )
    )
    if not item:
        return success_response(request, {"feedback": None})
    items = list(
        (
            await session.scalars(
                select(InterviewFeedbackItemModel).where(
                    InterviewFeedbackItemModel.feedback_id == item.id
                )
            )
        ).all()
    )
    return success_response(request, {"feedback": feedback_data(item, items)})


@router.post("/interviews/{interview_id}/feedback", status_code=201)
async def save_feedback(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    payload: FeedbackRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    assigned = await session.scalar(
        select(InterviewAssignmentModel).where(
            InterviewAssignmentModel.organization_id == organization_id,
            InterviewAssignmentModel.interview_id == interview_id,
            InterviewAssignmentModel.user_id == user.id,
        )
    )
    if not assigned:
        return error_response(
            request, "FORBIDDEN", "Only assigned interviewers can save feedback.", 403
        )
    interview = await session.scalar(
        select(InterviewModel).where(
            InterviewModel.id == interview_id,
            InterviewModel.organization_id == organization_id,
        )
    )
    if not interview:
        return error_response(request, "NOT_FOUND", "Interview was not found.", 404)
    if interview.status == "cancelled":
        return error_response(
            request,
            "INVALID_STATE",
            "Cancelled interviews cannot receive feedback.",
            409,
        )
    card = await session.scalar(
        select(ScorecardModel).where(
            ScorecardModel.organization_id == organization_id,
            ScorecardModel.interview_stage_id == interview.interview_stage_id,
        )
    )
    criteria = (
        set(
            (
                await session.scalars(
                    select(ScorecardCriterionModel.id).where(
                        ScorecardCriterionModel.scorecard_id == card.id
                    )
                )
            ).all()
        )
        if card
        else set()
    )
    if any(value.criterion_id not in criteria for value in payload.items):
        return error_response(
            request,
            "VALIDATION_ERROR",
            "Feedback items must belong to this interview's scorecard.",
            422,
        )
    item = await session.scalar(
        select(InterviewFeedbackModel).where(
            InterviewFeedbackModel.interview_id == interview_id,
            InterviewFeedbackModel.reviewer_id == user.id,
        )
    )
    now = datetime.now(UTC)
    if item and item.status == "submitted":
        return error_response(
            request, "INVALID_STATE", "Submitted feedback cannot be changed.", 409
        )
    if not item:
        item = InterviewFeedbackModel(
            organization_id=organization_id,
            interview_id=interview_id,
            reviewer_id=user.id,
            created_at=now,
            updated_at=now,
        )
        session.add(item)
        await session.flush()
    item.overall_rating, item.recommendation, item.summary, item.updated_at = (
        payload.overall_rating,
        payload.recommendation,
        payload.summary,
        now,
    )
    for value in payload.items:
        feedback_item = await session.scalar(
            select(InterviewFeedbackItemModel).where(
                InterviewFeedbackItemModel.feedback_id == item.id,
                InterviewFeedbackItemModel.criterion_id == value.criterion_id,
            )
        )
        if feedback_item:
            feedback_item.rating, feedback_item.notes, feedback_item.updated_at = (
                value.rating,
                value.notes,
                now,
            )
        else:
            session.add(
                InterviewFeedbackItemModel(
                    feedback_id=item.id,
                    criterion_id=value.criterion_id,
                    rating=value.rating,
                    notes=value.notes,
                    created_at=now,
                    updated_at=now,
                )
            )
    await record(
        session,
        organization_id,
        "feedback_draft_saved",
        "feedback",
        item.id,
        user.id,
        application_id=interview.application_id,
        interview_id=interview.id,
        metadata={"description": "Interview feedback draft saved", "status": "draft"},
    )
    await session.commit()
    values = list(
        (
            await session.scalars(
                select(InterviewFeedbackItemModel).where(
                    InterviewFeedbackItemModel.feedback_id == item.id
                )
            )
        ).all()
    )
    return success_response(request, {"feedback": feedback_data(item, values)}, 201)


@router.patch("/scorecard-criteria/{criterion_id}")
async def update_criterion(
    request: Request,
    organization_id: UUID,
    criterion_id: UUID,
    payload: CriterionRequest,
    _: OrganizationMember = Depends(manage),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    item = await session.get(ScorecardCriterionModel, criterion_id)
    card = await session.get(ScorecardModel, item.scorecard_id) if item else None
    if not item or not card or card.organization_id != organization_id:
        return error_response(request, "NOT_FOUND", "Criterion was not found.", 404)
    assert item is not None
    duplicate = await session.scalar(
        select(ScorecardCriterionModel.id).where(
            ScorecardCriterionModel.scorecard_id == item.scorecard_id,
            ScorecardCriterionModel.id != item.id,
            ScorecardCriterionModel.is_active,
            ScorecardCriterionModel.name.ilike(payload.name.strip()),
        )
    )
    if duplicate:
        return error_response(
            request,
            "CONFLICT",
            "An active criterion with that name already exists.",
            409,
        )
    item.name, item.description, item.is_required, item.updated_at = (
        payload.name.strip(),
        payload.description,
        payload.is_required,
        datetime.now(UTC),
    )
    await session.commit()
    return success_response(
        request, {"criterion": {"id": str(item.id), "name": item.name}}
    )


@router.post("/scorecards/{scorecard_id}/criteria/reorder")
async def reorder_criteria(
    request: Request,
    organization_id: UUID,
    scorecard_id: UUID,
    payload: CriterionReorderRequest,
    _: OrganizationMember = Depends(manage),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    card = await session.scalar(
        select(ScorecardModel).where(
            ScorecardModel.id == scorecard_id,
            ScorecardModel.organization_id == organization_id,
        )
    )
    items = (
        list(
            (
                await session.scalars(
                    select(ScorecardCriterionModel).where(
                        ScorecardCriterionModel.scorecard_id == scorecard_id
                    )
                )
            ).all()
        )
        if card
        else []
    )
    if not card or set(payload.criterion_ids) != {item.id for item in items}:
        return error_response(
            request,
            "VALIDATION_ERROR",
            "Criterion order must include every criterion.",
            422,
        )
    for position, criterion_id in enumerate(payload.criterion_ids, 1):
        next(item for item in items if item.id == criterion_id).position = position
    await session.commit()
    return success_response(request, {"items": [str(item.id) for item in items]})


@router.get("/interviews/{interview_id}/feedback")
async def feedback(
    request: Request,
    organization_id: UUID,
    interview_id: UUID,
    _: OrganizationMember = Depends(view),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    if not await session.scalar(
        select(InterviewModel.id).where(
            InterviewModel.id == interview_id,
            InterviewModel.organization_id == organization_id,
        )
    ):
        return error_response(request, "NOT_FOUND", "Interview was not found.", 404)
    values = list(
        (
            await session.scalars(
                select(InterviewFeedbackModel).where(
                    InterviewFeedbackModel.organization_id == organization_id,
                    InterviewFeedbackModel.interview_id == interview_id,
                    InterviewFeedbackModel.status == "submitted",
                )
            )
        ).all()
    )
    return success_response(
        request,
        {
            "items": [
                feedback_data(
                    value,
                    list(
                        (
                            await session.scalars(
                                select(InterviewFeedbackItemModel).where(
                                    InterviewFeedbackItemModel.feedback_id == value.id
                                )
                            )
                        ).all()
                    ),
                )
                for value in values
            ]
        },
    )


@router.patch("/interview-feedback/{feedback_id}")
async def update_feedback(
    request: Request,
    organization_id: UUID,
    feedback_id: UUID,
    payload: FeedbackRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    item = await session.scalar(
        select(InterviewFeedbackModel).where(
            InterviewFeedbackModel.id == feedback_id,
            InterviewFeedbackModel.organization_id == organization_id,
            InterviewFeedbackModel.reviewer_id == user.id,
        )
    )
    if not item:
        return error_response(request, "NOT_FOUND", "Feedback was not found.", 404)
    if item.status == "submitted":
        return error_response(
            request, "INVALID_STATE", "Submitted feedback cannot be changed.", 409
        )
    interview = await session.scalar(
        select(InterviewModel).where(
            InterviewModel.id == item.interview_id,
            InterviewModel.organization_id == organization_id,
        )
    )
    card = (
        await session.scalar(
            select(ScorecardModel).where(
                ScorecardModel.organization_id == organization_id,
                ScorecardModel.interview_stage_id == interview.interview_stage_id,
            )
        )
        if interview
        else None
    )
    criteria = (
        set(
            (
                await session.scalars(
                    select(ScorecardCriterionModel.id).where(
                        ScorecardCriterionModel.scorecard_id == card.id
                    )
                )
            ).all()
        )
        if card
        else set()
    )
    if (
        not interview
        or interview.status == "cancelled"
        or any(value.criterion_id not in criteria for value in payload.items)
    ):
        return error_response(
            request,
            "VALIDATION_ERROR",
            "Feedback items must belong to an active interview scorecard.",
            422,
        )
    now = datetime.now(UTC)
    item.overall_rating, item.recommendation, item.summary, item.updated_at = (
        payload.overall_rating,
        payload.recommendation,
        payload.summary,
        now,
    )
    for value in payload.items:
        existing = await session.scalar(
            select(InterviewFeedbackItemModel).where(
                InterviewFeedbackItemModel.feedback_id == item.id,
                InterviewFeedbackItemModel.criterion_id == value.criterion_id,
            )
        )
        if existing:
            existing.rating, existing.notes, existing.updated_at = (
                value.rating,
                value.notes,
                now,
            )
        else:
            session.add(
                InterviewFeedbackItemModel(
                    feedback_id=item.id,
                    criterion_id=value.criterion_id,
                    rating=value.rating,
                    notes=value.notes,
                    created_at=now,
                    updated_at=now,
                )
            )
    await session.commit()
    values = list(
        (
            await session.scalars(
                select(InterviewFeedbackItemModel).where(
                    InterviewFeedbackItemModel.feedback_id == item.id
                )
            )
        ).all()
    )
    return success_response(request, {"feedback": feedback_data(item, values)})


@router.post("/interview-feedback/{feedback_id}/submit")
async def submit_feedback(
    request: Request,
    organization_id: UUID,
    feedback_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    session: AsyncSession = Depends(get_db_session),
) -> JSONResponse:
    item = await session.scalar(
        select(InterviewFeedbackModel).where(
            InterviewFeedbackModel.id == feedback_id,
            InterviewFeedbackModel.organization_id == organization_id,
            InterviewFeedbackModel.reviewer_id == user.id,
        )
    )
    if not item:
        return error_response(request, "NOT_FOUND", "Feedback was not found.", 404)
    if item.status == "submitted":
        return error_response(
            request, "INVALID_STATE", "Feedback is already submitted.", 409
        )
    if not await assigned(session, organization_id, item.interview_id, user.id):
        return error_response(
            request, "FORBIDDEN", "Only assigned interviewers can submit feedback.", 403
        )
    interview = await session.scalar(
        select(InterviewModel).where(
            InterviewModel.id == item.interview_id,
            InterviewModel.organization_id == organization_id,
        )
    )
    if not interview or interview.status == "cancelled":
        return error_response(
            request,
            "INVALID_STATE",
            "Cancelled interviews cannot receive feedback.",
            409,
        )
    card = await session.scalar(
        select(ScorecardModel).where(
            ScorecardModel.organization_id == organization_id,
            ScorecardModel.interview_stage_id == interview.interview_stage_id,
        )
    )
    criteria = (
        list(
            (
                await session.scalars(
                    select(ScorecardCriterionModel).where(
                        ScorecardCriterionModel.scorecard_id == card.id,
                        ScorecardCriterionModel.is_active,
                    )
                )
            ).all()
        )
        if card
        else []
    )
    values = list(
        (
            await session.scalars(
                select(InterviewFeedbackItemModel).where(
                    InterviewFeedbackItemModel.feedback_id == item.id
                )
            )
        ).all()
    )
    by_criterion = {value.criterion_id: value for value in values}
    if any(
        criterion.is_required
        and (
            criterion.id not in by_criterion
            or by_criterion[criterion.id].rating is None
            or not (by_criterion[criterion.id].notes or "").strip()
        )
        for criterion in criteria
    ):
        return error_response(
            request,
            "VALIDATION_ERROR",
            "Required criteria need a rating and notes before submission.",
            422,
        )
    item.status, item.submitted_at, item.updated_at = (
        "submitted",
        datetime.now(UTC),
        datetime.now(UTC),
    )
    await record(
        session,
        organization_id,
        "feedback_submitted",
        "feedback",
        item.id,
        user.id,
        application_id=interview.application_id,
        interview_id=interview.id,
        metadata={
            "description": "Interview feedback submitted",
            "status": "submitted",
            "submitted_at": item.submitted_at.isoformat(),
        },
    )
    await session.commit()
    return success_response(request, {"feedback": feedback_data(item, values)})
