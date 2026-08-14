from httpx import AsyncClient


async def test_register_then_me(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "ada@example.com", "password": "hunter22", "full_name": "Ada Lovelace"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["user"]["email"] == "ada@example.com"
    token = body["access_token"]

    me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "ada@example.com"


async def test_register_duplicate_email_conflicts(client: AsyncClient):
    payload = {"email": "dup@example.com", "password": "hunter22", "full_name": "Dup User"}
    first = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409
    assert second.json()["error"]["code"] == "CONFLICT"


async def test_register_weak_password_rejected(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "alllettersnoNumber", "full_name": "Weak Pw"},
    )
    assert resp.status_code == 422
    assert resp.json()["error"]["code"] == "VALIDATION_ERROR"


async def test_login_wrong_password_unauthorized(client: AsyncClient):
    payload = {"email": "bob@example.com", "password": "hunter22", "full_name": "Bob"}
    await client.post("/api/v1/auth/register", json=payload)

    resp = await client.post("/api/v1/auth/login", json={"email": "bob@example.com", "password": "wrong123"})
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"


async def test_me_without_token_unauthorized(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "UNAUTHORIZED"


async def test_health_check(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
