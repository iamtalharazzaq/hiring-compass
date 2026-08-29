from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.jobs.adapters.persistence.models import JobRequirementModel
from app.modules.jobs.adapters.persistence.repositories import SqlAlchemyJobRepository
from app.modules.jobs.api.schemas import (
    CreateJobRequest,
    ListJobsQuery,
    ReorderRequirementsRequest,
    RequirementRequest,
    ReviewNoteRequest,
    UpdateJobRequest,
    to_job_input,
)
from app.modules.jobs.application.services import JobError, JobService
from app.modules.jobs.domain.entities import Job
from app.modules.organizations.api.dependencies import (
    require_active_organization_member,
    require_current_user,
)
from app.modules.organizations.domain.entities import OrganizationMember
from app.shared.database.engine import get_db_session
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/organizations/{organization_id}/jobs", tags=["jobs"])


async def get_job_service(session: AsyncSession = Depends(get_db_session)) -> JobService:
    return JobService(SqlAlchemyJobRepository(session))


async def require_job_manager(
    member: OrganizationMember = Depends(require_active_organization_member),
) -> OrganizationMember:
    if member.role not in {"admin", "recruiter"}:
        raise HTTPException(403)
    return member


def job_data(job: Job) -> dict[str, object]:
    return {
        "id": str(job.id),
        "organization_id": str(job.organization_id),
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "employment_type": job.employment_type.value if job.employment_type else None,
        "workplace_type": job.workplace_type.value if job.workplace_type else None,
        "experience_min_years": job.experience_min_years,
        "experience_max_years": job.experience_max_years,
        "salary_min": str(job.salary_min) if job.salary_min is not None else None,
        "salary_max": str(job.salary_max) if job.salary_max is not None else None,
        "salary_currency": job.salary_currency,
        "status": job.status.value,
        "created_at": job.created_at.isoformat(),
        "updated_at": job.updated_at.isoformat(),
        "closed_at": job.closed_at.isoformat() if job.closed_at else None,
        "archived_at": job.archived_at.isoformat() if job.archived_at else None,
        "submitted_for_approval_at": job.submitted_for_approval_at.isoformat()
        if job.submitted_for_approval_at
        else None,
        "approved_at": job.approved_at.isoformat() if job.approved_at else None,
        "review_note": job.review_note,
    }


def requirement_data(item: JobRequirementModel) -> dict[str, object]:
    return {
        "id": str(item.id),
        "requirement_type": item.requirement_type,
        "category": item.category,
        "content": item.content,
        "rank": item.rank,
    }


def failure(request: Request, error: JobError) -> JSONResponse:
    return error_response(request, error.code, error.message, error.status)


@router.post("", status_code=201)
async def create_job(
    request: Request,
    organization_id: UUID,
    payload: CreateJobRequest,
    user: AuthenticatedUser = Depends(require_current_user),
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    job = await service.create(organization_id, user, to_job_input(payload))
    return success_response(request, {"job": job_data(job)}, 201)


@router.get("")
async def list_jobs(
    request: Request,
    organization_id: UUID,
    query: ListJobsQuery = Depends(),
    _: OrganizationMember = Depends(require_active_organization_member),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    items, total, total_pages = await service.list(
        organization_id, query.page, query.page_size, query.status, query.search
    )
    return success_response(
        request,
        {
            "items": [job_data(job) for job in items],
            "pagination": {
                "page": query.page,
                "page_size": query.page_size,
                "total": total,
                "total_pages": total_pages,
            },
        },
    )


@router.get("/{job_id}")
async def get_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(require_active_organization_member),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"job": job_data(await service.get(organization_id, job_id))}
        )
    except JobError as error:
        return failure(request, error)


@router.patch("/{job_id}")
async def update_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: UpdateJobRequest,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        job = await service.update(organization_id, job_id, to_job_input(payload))
        return success_response(request, {"job": job_data(job)})
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/close")
async def close_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"job": job_data(await service.close(organization_id, job_id))}
        )
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/archive")
async def archive_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"job": job_data(await service.archive(organization_id, job_id))}
        )
    except JobError as error:
        return failure(request, error)


@router.get("/{job_id}/requirements")
async def list_requirements(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(require_active_organization_member),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    requirement_data(item)
                    for item in await service.requirements(organization_id, job_id)
                ]
            },
        )
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/requirements", status_code=201)
async def add_requirement(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: RequirementRequest,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "requirement": requirement_data(
                    await service.add_requirement(
                        organization_id,
                        job_id,
                        payload.requirement_type,
                        payload.category,
                        payload.content,
                    )
                )
            },
            201,
        )
    except JobError as error:
        return failure(request, error)


@router.patch("/{job_id}/requirements/{requirement_id}")
async def update_requirement(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    requirement_id: UUID,
    payload: RequirementRequest,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "requirement": requirement_data(
                    await service.update_requirement(
                        organization_id,
                        job_id,
                        requirement_id,
                        payload.requirement_type,
                        payload.category,
                        payload.content,
                    )
                )
            },
        )
    except JobError as error:
        return failure(request, error)


@router.delete("/{job_id}/requirements/{requirement_id}")
async def delete_requirement(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    requirement_id: UUID,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        await service.delete_requirement(organization_id, job_id, requirement_id)
        return success_response(request, {"deleted": True})
    except JobError as error:
        return failure(request, error)


@router.put("/{job_id}/requirements/reorder")
async def reorder_requirements(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: ReorderRequirementsRequest,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request,
            {
                "items": [
                    requirement_data(item)
                    for item in await service.reorder_requirements(
                        organization_id, job_id, payload.requirement_ids
                    )
                ]
            },
        )
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/submit-for-approval")
async def submit_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    _: OrganizationMember = Depends(require_job_manager),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    try:
        return success_response(
            request, {"job": job_data(await service.submit(organization_id, job_id))}
        )
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/approve")
async def approve_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    user: AuthenticatedUser = Depends(require_current_user),
    member: OrganizationMember = Depends(require_active_organization_member),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    if member.role not in {"admin", "hiring_manager"}:
        raise HTTPException(403)
    try:
        return success_response(
            request, {"job": job_data(await service.approve(organization_id, job_id, user))}
        )
    except JobError as error:
        return failure(request, error)


@router.post("/{job_id}/return-to-draft")
async def return_job(
    request: Request,
    organization_id: UUID,
    job_id: UUID,
    payload: ReviewNoteRequest,
    member: OrganizationMember = Depends(require_active_organization_member),
    service: JobService = Depends(get_job_service),
) -> JSONResponse:
    if member.role not in {"admin", "hiring_manager"}:
        raise HTTPException(403)
    try:
        return success_response(
            request,
            {
                "job": job_data(
                    await service.return_to_draft(organization_id, job_id, payload.review_note)
                )
            },
        )
    except JobError as error:
        return failure(request, error)
