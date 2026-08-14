from httpx import AsyncClient

import app.services.recommendation_service as recommendation_service
from tests.integration.conftest import auth_headers
from tests.integration.factories import seed_destination


async def test_recommendations_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/recommendations")
    assert resp.status_code == 401


async def test_cold_start_fallback_when_user_service_has_no_preferences(client: AsyncClient, monkeypatch):
    await seed_destination(name="Alpha Spot")
    await seed_destination(name="Beta Spot")

    async def fake_fetch(token: str) -> list[str]:
        return []

    monkeypatch.setattr(recommendation_service, "_fetch_user_preferences", fake_fetch)

    resp = await client.get("/api/v1/recommendations", headers=auth_headers())
    assert resp.status_code == 200
    body = resp.json()
    assert body["fallback"] is True
    assert [i["destination"]["name"] for i in body["items"]] == ["Alpha Spot", "Beta Spot"]


async def test_scored_by_preferences_from_user_service(client: AsyncClient, monkeypatch):
    await seed_destination(name="Nature Trail", tags=["nature", "hiking"])
    await seed_destination(name="City Museum", tags=["historical", "culture"])

    async def fake_fetch(token: str) -> list[str]:
        return ["nature", "hiking"]

    monkeypatch.setattr(recommendation_service, "_fetch_user_preferences", fake_fetch)

    resp = await client.get("/api/v1/recommendations", headers=auth_headers())
    body = resp.json()
    assert body["fallback"] is False
    assert len(body["items"]) == 1
    assert body["items"][0]["destination"]["name"] == "Nature Trail"
    assert body["items"][0]["score"] == 1.0


async def test_user_service_unreachable_degrades_to_fallback_not_500(client: AsyncClient, monkeypatch):
    """The failure-isolation contract: if user-service is down, recommendations still
    respond (unscored) instead of the whole request failing. Exercises the REAL
    _fetch_user_preferences (no mocking) against a port nothing is listening on."""
    await seed_destination(name="Still Visible")

    from app.core.config import get_settings

    monkeypatch.setenv("PENIELGO_USER_SERVICE_URL", "http://127.0.0.1:1")
    get_settings.cache_clear()

    resp = await client.get("/api/v1/recommendations", headers=auth_headers())
    assert resp.status_code == 200
    assert resp.json()["fallback"] is True
