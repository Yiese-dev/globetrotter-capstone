from fastapi import APIRouter, Depends, Query

from app.core.deps import get_verified_token
from app.services.recommendation_service import RecommendationsResponse, get_recommendations

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.get("", response_model=RecommendationsResponse)
async def recommendations(
    limit: int = Query(10, ge=1, le=50),
    token: str = Depends(get_verified_token),
) -> RecommendationsResponse:
    return await get_recommendations(token, limit)
