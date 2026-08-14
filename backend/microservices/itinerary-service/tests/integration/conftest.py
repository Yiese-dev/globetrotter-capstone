import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.core.security import create_access_token
from app.repositories.itinerary_repository import get_itinerary_repository

TEST_SECRET = "test-secret"


def _clear_caches():
    get_settings.cache_clear()
    get_itinerary_repository.cache_clear()


@pytest.fixture
async def client(tmp_path, monkeypatch):
    monkeypatch.setenv("PENIELGO_DATA_DIR", str(tmp_path / "data"))
    monkeypatch.setenv("PENIELGO_JWT_SECRET", TEST_SECRET)
    _clear_caches()

    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

    _clear_caches()


def auth_headers(user_id: str) -> dict:
    """itinerary-service trusts any validly-signed token — no user-service round-trip needed
    to test it, since JWT verification is entirely local (shared secret)."""
    token = create_access_token(user_id, TEST_SECRET, 60)
    return {"Authorization": f"Bearer {token}"}
