from functools import lru_cache

from app.core.config import get_settings
from app.models.destination import DestinationRecord
from app.repositories.base import JsonRepository


@lru_cache
def get_destination_repository() -> JsonRepository[DestinationRecord]:
    """Process-wide singleton so the repository's lock actually serializes writes.

    recommendation-service is the authoritative owner of the destinations catalog in
    Phase 2 — see docs/architecture.md's data-ownership table."""
    settings = get_settings()
    return JsonRepository(settings.data_dir / "destinations.json", DestinationRecord)
