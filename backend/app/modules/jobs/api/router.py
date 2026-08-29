from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.jobs.adapters.persistence.repositories import SqlAlchemyJobRepository
from app.modules.jobs.api.schemas import (
    CreateJobRequest,
    ListJobsQuery,
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
