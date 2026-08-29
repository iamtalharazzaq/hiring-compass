from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.modules.applications.api.router import router as applications_router
from app.modules.auth.api.router import router as auth_router
from app.modules.candidates.api.router import router as candidates_router
from app.modules.jobs.api.router import router as jobs_router
from app.modules.organizations.api.router import router as organizations_router
from app.shared.database.engine import dispose_engine
from app.shared.database.readiness import is_database_ready
from app.shared.errors.handlers import register_exception_handlers
from app.shared.errors.responses import error_response, success_response
from app.shared.http.request_id import RequestIdMiddleware
from app.shared.logging.setup import configure_logging


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging(get_settings().log_level)
    try:
        yield
    finally:
        await dispose_engine()


def create_app() -> FastAPI:
    settings = get_settings()
    if settings.app_env != "development":
        if settings.jwt_secret_key == "replace_with_a_long_random_value_for_local_development":
            raise RuntimeError("JWT_SECRET_KEY must be changed outside development.")
        if not settings.cookie_secure:
            raise RuntimeError("COOKIE_SECURE must be true outside development.")
    app = FastAPI(
        title=settings.app_name,
        description="A focused API foundation for Hiring Compass.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )
    app.add_middleware(RequestIdMiddleware)
    register_exception_handlers(app)
    app.include_router(auth_router)
    app.include_router(candidates_router)
    app.include_router(organizations_router)
    app.include_router(jobs_router)
    app.include_router(applications_router)

    @app.get("/health")
    async def health(request: Request) -> object:
        return success_response(
            request,
            {
                "status": "ok",
                "service": "hiring-compass-api",
                "environment": settings.app_env,
            },
        )

    @app.get("/health/ready")
    async def readiness(request: Request) -> object:
        if not await is_database_ready():
            return error_response(
                request,
                "SERVICE_UNAVAILABLE",
                "Database is unavailable.",
                503,
            )
        return success_response(
            request,
            {"status": "ready", "dependencies": {"database": "ok"}},
        )

    return app


app = create_app()
