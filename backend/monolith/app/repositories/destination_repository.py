from functools import lru_cache

from app.core.config import get_settings
from app.models.destination import DestinationRecord
from app.repositories.base import JsonRepository


@lru_cache
def get_destination_repository() -> JsonRepository[DestinationRecord]:
    """Process-wide singleton so the repository's lock actually serializes writes."""
    settings = get_settings()
    return JsonRepository(settings.data_dir / "destinations.json", DestinationRecord)
