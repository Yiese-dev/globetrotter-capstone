from httpx import AsyncClient


async def _register(client: AsyncClient, email: str) -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "hunter22", "full_name": "Test User"},
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


async def test_list_and_create_require_auth(client: AsyncClient):
    assert (await client.get("/api/v1/itineraries")).status_code == 401
    assert (await client.post("/api/v1/itineraries", json={"title": "Trip"})).status_code == 401


async def test_create_list_get_update_delete_lifecycle(client: AsyncClient):
    headers = await _register(client, "itin@example.com")

    create = await client.post(
        "/api/v1/itineraries",
        json={"title": "Yaoundé Weekend", "start_date": "2026-09-01", "end_date": "2026-09-03"},
        headers=headers,
    )
    assert create.status_code == 201
    itinerary = create.json()
    assert itinerary["title"] == "Yaoundé Weekend"
    assert itinerary["stops"] == []
    itinerary_id = itinerary["id"]

    listed = await client.get("/api/v1/itineraries", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = await client.get(f"/api/v1/itineraries/{itinerary_id}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["id"] == itinerary_id

    updated = await client.put(
        f"/api/v1/itineraries/{itinerary_id}", json={"title": "Yaoundé Long Weekend"}, headers=headers
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Yaoundé Long Weekend"
    # untouched field should survive a partial PUT
    assert updated.json()["start_date"] == "2026-09-01"

    deleted = await client.delete(f"/api/v1/itineraries/{itinerary_id}", headers=headers)
    assert deleted.status_code == 204

    gone = await client.get(f"/api/v1/itineraries/{itinerary_id}", headers=headers)
    assert gone.status_code == 404


async def test_get_nonexistent_itinerary_404(client: AsyncClient):
    headers = await _register(client, "ghost@example.com")
    resp = await client.get("/api/v1/itineraries/does-not-exist", headers=headers)
    assert resp.status_code == 404
    assert resp.json()["error"]["code"] == "NOT_FOUND"


async def test_users_cannot_access_each_others_itineraries(client: AsyncClient):
    owner_headers = await _register(client, "owner@example.com")
    intruder_headers = await _register(client, "intruder@example.com")

    create = await client.post("/api/v1/itineraries", json={"title": "Private Trip"}, headers=owner_headers)
    itinerary_id = create.json()["id"]

    resp = await client.get(f"/api/v1/itineraries/{itinerary_id}", headers=intruder_headers)
    assert resp.status_code == 404  # not 403 — never confirm another user's itinerary exists

    resp = await client.put(
        f"/api/v1/itineraries/{itinerary_id}", json={"title": "Hijacked"}, headers=intruder_headers
    )
    assert resp.status_code == 404

    still_visible = await client.get("/api/v1/itineraries", headers=owner_headers)
    assert still_visible.json()[0]["title"] == "Private Trip"


async def test_stop_lifecycle(client: AsyncClient):
    headers = await _register(client, "stops@example.com")
    itinerary_id = (
        await client.post("/api/v1/itineraries", json={"title": "Stop Test"}, headers=headers)
    ).json()["id"]

    stop_payload_1 = {
        "destination_id": "dest-1",
        "name": "Mont Zokye",
        "category": "nature",
        "image_url": "/static/destinations/mont_zokye.jpg",
        "lat": 3.93,
        "lng": 11.54,
    }
    stop_payload_2 = {
        "destination_id": "dest-2",
        "name": "The Fifty-Five",
        "category": "dining",
        "image_url": "/static/destinations/the_fifty_five.png",
        "lat": 3.868,
        "lng": 11.513,
    }

    add_1 = await client.post(f"/api/v1/itineraries/{itinerary_id}/stops", json=stop_payload_1, headers=headers)
    assert add_1.status_code == 201
    assert len(add_1.json()["stops"]) == 1
    assert add_1.json()["stops"][0]["order"] == 0

    add_2 = await client.post(f"/api/v1/itineraries/{itinerary_id}/stops", json=stop_payload_2, headers=headers)
    assert add_2.status_code == 201
    stops = add_2.json()["stops"]
    assert len(stops) == 2
    assert stops[1]["order"] == 1
    stop_id_2 = stops[1]["stop_id"]

    patched = await client.patch(
        f"/api/v1/itineraries/{itinerary_id}/stops/{stop_id_2}",
        json={"notes": "Dinner reservation at 7pm"},
        headers=headers,
    )
    assert patched.status_code == 200
    patched_stop = next(s for s in patched.json()["stops"] if s["stop_id"] == stop_id_2)
    assert patched_stop["notes"] == "Dinner reservation at 7pm"
    assert patched_stop["name"] == "The Fifty-Five"  # untouched fields preserved

    removed = await client.delete(f"/api/v1/itineraries/{itinerary_id}/stops/{stop_id_2}", headers=headers)
    assert removed.status_code == 200
    assert len(removed.json()["stops"]) == 1
    assert removed.json()["stops"][0]["name"] == "Mont Zokye"

    missing_stop = await client.patch(
        f"/api/v1/itineraries/{itinerary_id}/stops/does-not-exist", json={"notes": "x"}, headers=headers
    )
    assert missing_stop.status_code == 404
