import logging

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("penielgo.api-gateway")


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int, details: list | None = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class ServiceUnavailableError(AppError):
    """Raised when a downstream service can't be reached — never lets an unrelated
    service outage surface as an opaque 500."""

    def __init__(self, service: str):
        super().__init__("SERVICE_UNAVAILABLE", f"{service} is currently unavailable", 503)


def _error_envelope(code: str, message: str, details=None) -> dict:
    body = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=_error_envelope(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=422,
            content=jsonable_encoder(
                _error_envelope("VALIDATION_ERROR", "Request validation failed", exc.errors())
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(request: Request, exc: StarletteHTTPException):
        code = {404: "NOT_FOUND", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 409: "CONFLICT"}.get(
            exc.status_code, "ERROR"
        )
        return JSONResponse(status_code=exc.status_code, content=_error_envelope(code, str(exc.detail)))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception):
        logger.exception("Unhandled error while processing %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content=_error_envelope("INTERNAL_ERROR", "An unexpected error occurred"))
