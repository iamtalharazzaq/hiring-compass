from datetime import timedelta

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.modules.auth.api.dependencies import get_auth_service
from app.modules.auth.api.schemas import LoginRequest, SignupRequest
from app.modules.auth.application.dto import AuthenticatedUser, AuthResult
from app.modules.auth.application.services import (
    AuthenticationError,
    AuthService,
    EmailAlreadyRegisteredError,
)
from app.shared.errors.responses import error_response, success_response

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _user_data(user: AuthenticatedUser) -> dict[str, object]:
    return {
        "id": str(user.id),
        "email": user.email,
        "display_name": user.display_name,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
    }


def _auth_response(
    request: Request, result: AuthResult, settings: Settings, status: int
) -> JSONResponse:
    response = success_response(
        request,
        {
            "user": _user_data(result.user),
            "access_token": result.access_token,
            "token_type": "bearer",
            "expires_in": result.expires_in,
        },
        status,
    )
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=result.refresh_token,
        max_age=int(timedelta(days=settings.refresh_token_expire_days).total_seconds()),
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/api/v1/auth",
    )
    return response


def _clear_refresh_cookie(response: JSONResponse, settings: Settings) -> None:
    response.delete_cookie(settings.refresh_cookie_name, path="/api/v1/auth")


@router.post("/signup")
async def signup(
    request: Request,
    payload: SignupRequest,
    service: AuthService = Depends(get_auth_service),
    settings: Settings = Depends(get_settings),
) -> JSONResponse:
    try:
        result = await service.signup(str(payload.email), payload.display_name, payload.password)
    except EmailAlreadyRegisteredError:
        return error_response(
            request, "EMAIL_ALREADY_REGISTERED", "Email is already registered.", 409
        )
    return _auth_response(request, result, settings, 201)


@router.post("/login")
async def login(
    request: Request,
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
    settings: Settings = Depends(get_settings),
) -> JSONResponse:
    try:
        result = await service.login(str(payload.email), payload.password)
    except AuthenticationError:
        return error_response(request, "INVALID_CREDENTIALS", "Invalid email or password.", 401)
    return _auth_response(request, result, settings, 200)


@router.post("/refresh")
async def refresh(
    request: Request,
    service: AuthService = Depends(get_auth_service),
    settings: Settings = Depends(get_settings),
) -> JSONResponse:
    try:
        result = await service.refresh(request.cookies.get(settings.refresh_cookie_name, ""))
    except AuthenticationError:
        response = error_response(request, "UNAUTHENTICATED", "Authentication is required.", 401)
        _clear_refresh_cookie(response, settings)
        return response
    return _auth_response(request, result, settings, 200)


@router.post("/logout")
async def logout(
    request: Request,
    service: AuthService = Depends(get_auth_service),
    settings: Settings = Depends(get_settings),
) -> JSONResponse:
    await service.logout(request.cookies.get(settings.refresh_cookie_name))
    response = success_response(request, {"status": "logged_out"})
    _clear_refresh_cookie(response, settings)
    return response


@router.get("/me")
async def me(
    request: Request,
    service: AuthService = Depends(get_auth_service),
) -> JSONResponse:
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        return error_response(request, "UNAUTHENTICATED", "Authentication is required.", 401)
    try:
        user = await service.current_user(token)
    except AuthenticationError:
        return error_response(request, "UNAUTHENTICATED", "Authentication is required.", 401)
    return success_response(request, {"user": _user_data(user)})
