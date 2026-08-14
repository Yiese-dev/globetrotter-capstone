from functools import lru_cache

from app.core.config import get_settings
from app.models.itinerary import ItineraryRecord
from app.repositories.base import JsonRepository


@lru_cache
def get_itinerary_repository() -> JsonRepository[ItineraryRecord]:
    """Process-wide singleton so the repository's lock actually serializes writes."""
    settings = get_settings()
    return JsonRepository(settings.data_dir / "itineraries.json", ItineraryRecord)
