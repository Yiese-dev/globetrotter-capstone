from fastapi import APIRouter, Depends

from app.core.deps import get_current_user
from app.core.errors import NotFoundError
from app.models.user import PreferencesUpdate, UserRecord
from app.repositories.user_repository import get_user_repository

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me/preferences", response_model=list[str])
async def get_preferences(current_user: UserRecord = Depends(get_current_user)) -> list[str]:
    return current_user.preferences


@router.patch("/me/preferences", response_model=list[str])
async def update_preferences(
    payload: PreferencesUpdate,
    current_user: UserRecord = Depends(get_current_user),
) -> list[str]:
    repo = get_user_repository()
    updated = await repo.update(current_user.id, {"preferences": payload.preferences})
    if updated is None:
        raise NotFoundError("User not found")
    return updated.preferences
