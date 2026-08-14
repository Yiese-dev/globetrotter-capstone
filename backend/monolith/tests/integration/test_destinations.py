from httpx import AsyncClient

from tests.integration.factories import seed_destination


async def test_list_requires_auth(client: AsyncClient):
    resp = await client.get("/api/v1/destinations")
    assert resp.status_code == 401


async def test_list_search_and_filter(client: AsyncClient, monkeypatch):
    await seed_destination(name="Riverside Hike", category="nature", tags=["nature", "hiking"])
    await seed_destination(name="Grand Basilica", category="religious", tags=["religious", "historical"])

    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "traveler@example.com", "password": "hunter22", "full_name": "T. Traveler"},
    )
    token = register.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    all_resp = await client.get("/api/v1/destinations", headers=headers)
    assert all_resp.status_code == 200
    body = all_resp.json()
    assert body["total"] == 2

    filtered = await client.get("/api/v1/destinations", params={"category": "religious"}, headers=headers)
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["name"] == "Grand Basilica"

    searched = await client.get("/api/v1/destinations", params={"search": "river"}, headers=headers)
    assert searched.json()["total"] == 1
    assert searched.json()["items"][0]["name"] == "Riverside Hike"


async def test_get_by_id_and_404(client: AsyncClient):
    destination = await seed_destination()
    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "id-test@example.com", "password": "hunter22", "full_name": "Id Test"},
    )
    headers = {"Authorization": f"Bearer {register.json()['access_token']}"}

    found = await client.get(f"/api/v1/destinations/{destination.id}", headers=headers)
    assert found.status_code == 200
    assert found.json()["name"] == destination.name

    missing = await client.get("/api/v1/destinations/does-not-exist", headers=headers)
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "NOT_FOUND"


async def test_categories_endpoint(client: AsyncClient):
    await seed_destination(category="nature")
    await seed_destination(category="dining")
    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "cats@example.com", "password": "hunter22", "full_name": "Cat Fan"},
    )
    headers = {"Authorization": f"Bearer {register.json()['access_token']}"}

    resp = await client.get("/api/v1/destinations/categories", headers=headers)
    assert resp.status_code == 200
    assert set(resp.json()) == {"nature", "dining"}
