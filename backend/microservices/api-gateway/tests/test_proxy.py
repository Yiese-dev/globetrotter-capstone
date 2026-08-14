from httpx import AsyncClient


async def test_gateway_own_health(gateway_client: AsyncClient):
    resp = await gateway_client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "service": "api-gateway"}


async def test_proxies_auth_register_to_user_service(gateway_client: AsyncClient):
    resp = await gateway_client.post("/api/v1/auth/register", json={"email": "a@example.com"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["path"] == "/api/v1/auth/register"
    assert body["method"] == "POST"
    assert '"email"' in body["body"]


async def test_proxies_destinations_list_with_query_params(gateway_client: AsyncClient):
    resp = await gateway_client.get("/api/v1/destinations", params={"category": "nature", "page": "2"})
    body = resp.json()
    assert body["path"] == "/api/v1/destinations"
    assert body["query"] == {"category": "nature", "page": "2"}


async def test_proxies_destination_detail_by_id(gateway_client: AsyncClient):
    resp = await gateway_client.get("/api/v1/destinations/abc-123")
    assert resp.json()["path"] == "/api/v1/destinations/abc-123"


async def test_proxies_static_assets_to_recommendation_service(gateway_client: AsyncClient):
    resp = await gateway_client.get("/static/destinations/mont_zokye.jpg")
    assert resp.json()["path"] == "/static/destinations/mont_zokye.jpg"


async def test_proxies_itineraries_crud_verbs(gateway_client: AsyncClient):
    resp = await gateway_client.put("/api/v1/itineraries/xyz", json={"title": "New title"})
    body = resp.json()
    assert body["path"] == "/api/v1/itineraries/xyz"
    assert body["method"] == "PUT"


async def test_forwards_authorization_header(gateway_client: AsyncClient):
    resp = await gateway_client.get("/api/v1/itineraries", headers={"Authorization": "Bearer abc123"})
    assert resp.json()["auth"] == "Bearer abc123"


async def test_downstream_unreachable_returns_503_not_500(gateway_client: AsyncClient, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setenv("PENIELGO_USER_SERVICE_URL", "http://127.0.0.1:1")
    get_settings.cache_clear()

    resp = await gateway_client.get("/api/v1/auth/me")
    assert resp.status_code == 503
    assert resp.json()["error"]["code"] == "SERVICE_UNAVAILABLE"


async def test_aggregate_health_reports_each_service(gateway_client: AsyncClient):
    resp = await gateway_client.get("/api/v1/health")
    body = resp.json()
    assert body["status"] == "ok"
    assert body["services"] == {
        "user-service": "ok",
        "itinerary-service": "ok",
        "recommendation-service": "ok",
    }


async def test_aggregate_health_degrades_when_one_service_is_down(gateway_client: AsyncClient, monkeypatch):
    from app.core.config import get_settings

    monkeypatch.setenv("PENIELGO_RECOMMENDATION_SERVICE_URL", "http://127.0.0.1:1")
    get_settings.cache_clear()

    resp = await gateway_client.get("/api/v1/health")
    body = resp.json()
    assert body["status"] == "degraded"
    assert body["services"]["recommendation-service"] == "unreachable"
    assert body["services"]["user-service"] == "ok"
