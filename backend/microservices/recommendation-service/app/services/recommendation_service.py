import logging

import httpx
from pydantic import BaseModel

from app.core.config import get_settings
from app.models.destination import DestinationPublic, to_public
from app.repositories.destination_repository import get_destination_repository

logger = logging.getLogger("penielgo.recommendation-service")


class ScoredDestination(BaseModel):
    destination: DestinationPublic
    score: float


class RecommendationsResponse(BaseModel):
    items: list[ScoredDestination]
    based_on_preferences: list[str]
    fallback: bool


def jaccard_score(a: set[str], b: set[str]) -> float:
    """|intersection| / |union|. 0.0 whenever either set is empty."""
    if not a or not b:
        return 0.0
    union = len(a | b)
    return len(a & b) / union if union else 0.0


async def _fetch_user_preferences(token: str) -> list[str]:
    """The concrete "Recommendation Service calling User Service" synchronous REST call.

    Deliberately degrades to an empty list (i.e. the cold-start fallback response) rather
    than raising if user-service is slow or unreachable — a preferences outage should not
    also take down browsing/recommendations, it should just make them less personalized.
    """
    settings = get_settings()
    url = f"{settings.user_service_url}/api/v1/users/me/preferences"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, headers={"Authorization": f"Bearer {token}"})
        if response.status_code == 200:
            return response.json()
        logger.warning("user-service returned %s while fetching preferences", response.status_code)
    except httpx.RequestError as exc:
        logger.warning("user-service unreachable while fetching preferences: %s", exc)
    return []


async def get_recommendations(token: str, limit: int) -> RecommendationsResponse:
    preferences = set(await _fetch_user_preferences(token))
    destinations = await get_destination_repository().get_all()

    if not preferences:
        fallback_items = sorted(destinations, key=lambda d: d.name)[:limit]
        return RecommendationsResponse(
            items=[ScoredDestination(destination=to_public(d), score=0.0) for d in fallback_items],
            based_on_preferences=[],
            fallback=True,
        )

    scored = [(d, jaccard_score(preferences, set(d.tags))) for d in destinations]
    scored = [(d, s) for d, s in scored if s > 0]
    scored.sort(key=lambda pair: (-pair[1], pair[0].name))
    top = scored[:limit]

    return RecommendationsResponse(
        items=[ScoredDestination(destination=to_public(d), score=round(s, 4)) for d, s in top],
        based_on_preferences=sorted(preferences),
        fallback=False,
    )
