from functools import lru_cache

from app.core.config import get_settings
from app.models.user import UserRecord
from app.repositories.base import JsonRepository


@lru_cache
def get_user_repository() -> JsonRepository[UserRecord]:
    """Process-wide singleton so the repository's lock actually serializes writes."""
    settings = get_settings()
    return JsonRepository(settings.data_dir / "users.json", UserRecord)
