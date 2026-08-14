import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.repositories.destination_repository import get_destination_repository
from app.repositories.itinerary_repository import get_itinerary_repository
from app.repositories.user_repository import get_user_repository


def _clear_caches():
    get_settings.cache_clear()
    get_user_repository.cache_clear()
    get_destination_repository.cache_clear()
    get_itinerary_repository.cache_clear()


@pytest.fixture
async def client(tmp_path, monkeypatch):
    monkeypatch.setenv("PENIELGO_DATA_DIR", str(tmp_path / "data"))
    monkeypatch.setenv("PENIELGO_JWT_SECRET", "test-secret")
    _clear_caches()

    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    # httpx's ASGITransport does not run FastAPI startup/shutdown automatically —
    # drive the lifespan explicitly so seeding (destinations.json) happens like in production.
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    _clear_caches()
