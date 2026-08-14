from httpx import AsyncClient


async def _register(client: AsyncClient, email: str) -> dict:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "hunter22", "full_name": "Test User"},
    )
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


async def test_register_then_me(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "ada@example.com", "password": "hunter22", "full_name": "Ada Lovelace"},
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"


async def test_register_duplicate_email_conflicts(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "hunter22", "full_name": "Dup User"}
    assert (await client.post("/api/v1/auth/register", json=payload)).status_code == 201
    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409
    assert second.json()["error"]["code"] == "CONFLICT"


async def test_login_wrong_password_unauthorized(client: AsyncClient):
    payload = {"email": "bob@example.com", "password": "hunter22", "full_name": "Bob"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "wrong123"})
    assert resp.status_code == 401


async def test_me_without_token_unauthorized(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401


async def test_preferences_roundtrip(client: AsyncClient):
    headers = await _register(client, "prefs@example.com")

    initial = await client.get("/api/v1/users/me/preferences", headers=headers)
    assert initial.json() == []

    updated = await client.patch(
        "/api/v1/users/me/preferences", json={"preferences": ["nature", "hiking"]}, headers=headers
    )
    assert updated.status_code == 200
    assert updated.json() == ["nature", "hiking"]


async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "user-service"}
