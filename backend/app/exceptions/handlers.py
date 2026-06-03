"""Custom application exceptions and FastAPI exception handlers."""
from fastapi import Request
from fastapi.responses import JSONResponse


# ─── Domain Exceptions ──────────────────────────────────────────────────────


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    """Resource not found."""

    def __init__(self, message: str) -> None:
        super().__init__(message, 404)


class ConflictError(AppException):
    """Uniqueness constraint violation."""

    def __init__(self, message: str) -> None:
        super().__init__(message, 409)


class UnprocessableError(AppException):
    """Business rule violation (e.g. insufficient stock)."""

    def __init__(self, message: str) -> None:
        super().__init__(message, 422)


class BadRequestError(AppException):
    """Malformed or invalid request data."""

    def __init__(self, message: str) -> None:
        super().__init__(message, 400)


class UnauthorizedError(AppException):
    """Authentication or authorization failure."""

    def __init__(self, message: str = "Could not validate credentials") -> None:
        super().__init__(message, 401)


class ForbiddenError(AppException):
    """Authenticated but not authorised (e.g. non-admin accessing admin route)."""

    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(message, 403)


# ─── FastAPI Handlers ────────────────────────────────────────────────────────


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "status_code": exc.status_code},
    )
