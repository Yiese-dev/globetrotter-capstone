from httpx import AsyncClient

from tests.integration.conftest import auth_headers


async def test_list_and_create_require_auth(client: AsyncClient):
    assert (await client.get("/api/v1/itineraries")).status_code == 401
    assert (await client.post("/api/v1/itineraries", json={"title": "Trip"})).status_code == 401


async def test_create_list_get_update_delete_lifecycle(client: AsyncClient):
    headers = auth_headers("user-1")

    create = await client.post(
        "/api/v1/itineraries",
        json={"title": "Yaoundé Weekend", "start_date": "2026-09-01", "end_date": "2026-09-03"},
        headers=headers,
    )
    assert create.status_code == 201
    itinerary_id = create.json()["id"]

    listed = await client.get("/api/v1/itineraries", headers=headers)
    assert len(listed.json()) == 1

    updated = await client.put(
        f"/api/v1/itineraries/{itinerary_id}", json={"title": "Yaoundé Long Weekend"}, headers=headers
    )
    assert updated.json()["title"] == "Yaoundé Long Weekend"

    deleted = await client.delete(f"/api/v1/itineraries/{itinerary_id}", headers=headers)
    assert deleted.status_code == 204

    gone = await client.get(f"/api/v1/itineraries/{itinerary_id}", headers=headers)
    assert gone.status_code == 404


async def test_users_cannot_access_each_others_itineraries(client: AsyncClient):
    owner_headers = auth_headers("owner")
    intruder_headers = auth_headers("intruder")

    create = await client.post("/api/v1/itineraries", json={"title": "Private Trip"}, headers=owner_headers)
    itinerary_id = create.json()["id"]

    resp = await client.get(f"/api/v1/itineraries/{itinerary_id}", headers=intruder_headers)
    assert resp.status_code == 404


async def test_stop_lifecycle(client: AsyncClient):
    headers = auth_headers("stopper")
    itinerary_id = (
        await client.post("/api/v1/itineraries", json={"title": "Stop Test"}, headers=headers)
    ).json()["id"]

    stop_payload = {
        "destination_id": "dest-1",
        "name": "Mont Zokye",
        "category": "nature",
        "image_url": "/static/destinations/mont_zokye.jpg",
        "lat": 3.93,
        "lng": 11.54,
    }
    add = await client.post(f"/api/v1/itineraries/{itinerary_id}/stops", json=stop_payload, headers=headers)
    assert add.status_code == 201
    stop_id = add.json()["stops"][0]["stop_id"]

    patched = await client.patch(
        f"/api/v1/itineraries/{itinerary_id}/stops/{stop_id}", json={"notes": "Bring water"}, headers=headers
    )
    assert patched.json()["stops"][0]["notes"] == "Bring water"

    removed = await client.delete(f"/api/v1/itineraries/{itinerary_id}/stops/{stop_id}", headers=headers)
    assert removed.json()["stops"] == []


async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "itinerary-service"}
