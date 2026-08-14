from httpx import AsyncClient

from tests.integration.factories import seed_destination


async def _register(client: AsyncClient, email: str) -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "hunter22", "full_name": "Test User"},
    )
    body = resp.json()
    return {"Authorization": f"Bearer {body['access_token']}"}


async def test_preferences_roundtrip(client: AsyncClient):
    headers = await _register(client, "prefs@example.com")

    initial = await client.get("/api/v1/users/me/preferences", headers=headers)
    assert initial.status_code == 200
    assert initial.json() == []

    updated = await client.patch(
        "/api/v1/users/me/preferences", json={"preferences": ["nature", "hiking"]}, headers=headers
    )
    assert updated.status_code == 200
    assert updated.json() == ["nature", "hiking"]

    fetched_again = await client.get("/api/v1/users/me/preferences", headers=headers)
    assert fetched_again.json() == ["nature", "hiking"]


async def test_recommendations_cold_start_fallback(client: AsyncClient):
    await seed_destination(name="Alpha Spot")
    await seed_destination(name="Beta Spot")
    headers = await _register(client, "coldstart@example.com")

    resp = await client.get("/api/v1/recommendations", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["fallback"] is True
    assert body["based_on_preferences"] == []
    assert [item["destination"]["name"] for item in body["items"]] == ["Alpha Spot", "Beta Spot"]


async def test_recommendations_scored_by_preference_overlap(client: AsyncClient):
    await seed_destination(name="Nature Trail", tags=["nature", "hiking"])
    await seed_destination(name="City Museum", tags=["historical", "culture"])
    headers = await _register(client, "scored@example.com")

    await client.patch("/api/v1/users/me/preferences", json={"preferences": ["nature", "hiking"]}, headers=headers)

    resp = await client.get("/api/v1/recommendations", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["fallback"] is False
    assert len(body["items"]) == 1
    assert body["items"][0]["destination"]["name"] == "Nature Trail"
    assert body["items"][0]["score"] == 1.0
