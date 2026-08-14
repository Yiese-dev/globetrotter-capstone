import uuid
from datetime import datetime, timezone

from app.core.config import get_settings
from app.core.errors import ConflictError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import LoginRequest, RegisterRequest, TokenResponse, UserPublic, UserRecord
from app.repositories.user_repository import get_user_repository


def _to_public(user: UserRecord) -> UserPublic:
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name, preferences=user.preferences)


def _issue_token(user: UserRecord) -> TokenResponse:
    settings = get_settings()
    token = create_access_token(user.id, settings.jwt_secret, settings.jwt_expires_minutes)
    return TokenResponse(access_token=token, user=_to_public(user))


async def register(payload: RegisterRequest) -> TokenResponse:
    repo = get_user_repository()
    existing = await repo.find(lambda u: u.email.lower() == payload.email.lower())
    if existing:
        raise ConflictError("An account with this email already exists")

    now = datetime.now(timezone.utc)
    user = UserRecord(
        id=str(uuid.uuid4()),
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        preferences=[],
        created_at=now,
        updated_at=now,
    )
    await repo.create(user)
    return _issue_token(user)


async def login(payload: LoginRequest) -> TokenResponse:
    repo = get_user_repository()
    matches = await repo.find(lambda u: u.email.lower() == payload.email.lower())
    if not matches or not verify_password(payload.password, matches[0].password_hash):
        raise UnauthorizedError("Invalid email or password")
    return _issue_token(matches[0])
