from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.models.user import UserRecord
from app.services.recommendation_service import RecommendationsResponse, get_recommendations

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationsResponse)
async def recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: UserRecord = Depends(get_current_user),
) -> RecommendationsResponse:
    return await get_recommendations(current_user.id, limit)
