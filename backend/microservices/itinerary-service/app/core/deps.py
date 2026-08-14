from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import UnauthorizedError
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Verifies the JWT locally (shared secret with user-service) and returns the user id.

    No call to user-service and no local user lookup: itinerary-service doesn't own user
    data, and a validly-signed token is sufficient proof of identity for scoping ownership —
    this is what makes JWT-based auth actually stateless across services.
    """
    if credentials is None:
        raise UnauthorizedError("Missing bearer token")

    settings = get_settings()
    try:
        payload = decode_access_token(credentials.credentials, settings.jwt_secret)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedError("Invalid token payload")
    return user_id
