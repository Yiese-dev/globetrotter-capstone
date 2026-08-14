from pydantic import BaseModel

from app.models.destination import DestinationPublic, to_public
from app.repositories.destination_repository import get_destination_repository
from app.repositories.user_repository import get_user_repository


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


async def get_recommendations(user_id: str, limit: int) -> RecommendationsResponse:
    user = await get_user_repository().get_by_id(user_id)
    preferences = set(user.preferences) if user else set()
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
