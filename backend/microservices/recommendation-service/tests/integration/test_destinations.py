from httpx import AsyncClient

from tests.integration.conftest import auth_headers
from tests.integration.factories import seed_destination


async def test_list_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/destinations")
    assert resp.status_code == 401


async def test_list_search_and_filter(client: AsyncClient):
    await seed_destination(name="Riverside Hike", category="nature", tags=["nature", "hiking"])
    await seed_destination(name="Grand Basilica", category="religious", tags=["religious", "historical"])
    headers = auth_headers()

    all_resp = await client.get("/api/v1/destinations", headers=headers)
    assert all_resp.json()["total"] == 2

    filtered = await client.get("/api/v1/destinations", params={"category": "religious"}, headers=headers)
    assert filtered.json()["items"][0]["name"] == "Grand Basilica"

    searched = await client.get("/api/v1/destinations", params={"search": "river"}, headers=headers)
    assert searched.json()["items"][0]["name"] == "Riverside Hike"


async def test_get_by_id_and_404(client: AsyncClient):
    destination = await seed_destination()
    headers = auth_headers()

    found = await client.get(f"/api/v1/destinations/{destination.id}", headers=headers)
    assert found.status_code == 200

    missing = await client.get("/api/v1/destinations/does-not-exist", headers=headers)
    assert missing.status_code == 404


async def test_categories_endpoint(client: AsyncClient):
    await seed_destination(category="nature")
    await seed_destination(category="dining")

    resp = await client.get("/api/v1/destinations/categories", headers=auth_headers())
    assert set(resp.json()) == {"nature", "dining"}


async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.json() == {"status": "ok", "service": "recommendation-service"}
