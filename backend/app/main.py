from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from app.config import get_settings
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
    app = FastAPI(
        title=settings.app_name,
        description="A focused API foundation for Hiring Compass.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.add_middleware(RequestIdMiddleware)
    register_exception_handlers(app)

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
