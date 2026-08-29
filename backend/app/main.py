from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from app.config import get_settings
from app.shared.errors.handlers import register_exception_handlers
from app.shared.errors.responses import success_response
from app.shared.http.request_id import RequestIdMiddleware
from app.shared.logging.setup import configure_logging


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging(get_settings().log_level)
    yield


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

    return app


app = create_app()
