from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user
from app.models.user import LoginRequest, RegisterRequest, TokenResponse, UserPublic, UserRecord
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest) -> TokenResponse:
    return await auth_service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    return await auth_service.login(payload)


@router.get("/me", response_model=UserPublic)
async def me(current_user: UserRecord = Depends(get_current_user)) -> UserPublic:
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        preferences=current_user.preferences,
    )
