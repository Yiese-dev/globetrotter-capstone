from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings
from app.core.errors import UnauthorizedError
from app.core.security import decode_access_token
from app.models.user import UserRecord
from app.repositories.user_repository import get_user_repository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserRecord:
    if credentials is None:
        raise UnauthorizedError("Missing bearer token")

    settings = get_settings()
    try:
        payload = decode_access_token(credentials.credentials, settings.jwt_secret)
    except Exception as exc:
        raise UnauthorizedError("Invalid or expired token") from exc

    user = await get_user_repository().get_by_id(payload.get("sub", ""))
    if user is None:
        raise UnauthorizedError("User no longer exists")
    return user
