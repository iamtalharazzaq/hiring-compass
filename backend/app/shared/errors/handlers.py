import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.shared.errors.responses import error_response

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, _: RequestValidationError) -> JSONResponse:
        return error_response(request, "VALIDATION_ERROR", "The request is invalid.", 422)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(
        request: Request, exception: StarletteHTTPException
    ) -> JSONResponse:
        if exception.status_code == 404:
            return error_response(
                request, "NOT_FOUND", "The requested resource was not found.", 404
            )
        return error_response(
            request,
            "HTTP_ERROR",
            "The request could not be completed.",
            exception.status_code,
        )

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, exception: Exception) -> JSONResponse:
        logger.exception("unhandled_exception")
        return error_response(
            request, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.", 500
        )
