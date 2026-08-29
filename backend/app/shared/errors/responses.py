from typing import Any

from fastapi import Request
from fastapi.responses import JSONResponse

from app.shared.http.request_id import request_id_for


def success_response(request: Request, data: Any, status_code: int = 200) -> JSONResponse:
    request_id = request_id_for(request)
    return JSONResponse(
        status_code=status_code,
        content={"data": data, "request_id": request_id},
        headers={"X-Request-ID": request_id},
    )


def error_response(request: Request, code: str, message: str, status_code: int) -> JSONResponse:
    request_id = request_id_for(request)
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message, "request_id": request_id}},
        headers={"X-Request-ID": request_id},
    )
