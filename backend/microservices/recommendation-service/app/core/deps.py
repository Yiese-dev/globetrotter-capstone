from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import UnauthorizedError
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_verified_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Verifies the JWT locally (shared secret with user-service) and returns the raw token
    string, so callers can forward it on to user-service for the preferences lookup (see
    services/recommendation_service.py) without decoding it twice."""
    if credentials is None:
        raise UnauthorizedError("Missing bearer token")

    settings = get_settings()
    try:
        decode_access_token(credentials.credentials, settings.jwt_secret)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token") from exc

    return credentials.credentials
