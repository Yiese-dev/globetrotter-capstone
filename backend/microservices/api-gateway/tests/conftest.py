import socket
import threading
import time

import pytest
import uvicorn
from fastapi import FastAPI, Request
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _make_fake_backend_app() -> FastAPI:
    """A minimal real backend: echoes back everything about the request it received, so
    tests can assert the gateway actually forwarded method/path/query/body/headers
    correctly — not just that it returned *something*."""
    app = FastAPI()

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "fake-backend"}

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
    async def catch_all(request: Request, path: str):
        body = await request.body()
        return {
            "path": "/" + path,
            "method": request.method,
            "query": dict(request.query_params),
            "body": body.decode() if body else None,
            "auth": request.headers.get("authorization"),
        }

    return app


@pytest.fixture
def fake_backend():
    """Runs a real uvicorn server in a background thread for the duration of one test —
    proves the gateway's proxy.py makes genuine HTTP calls, not something mocked away."""
    port = _free_port()
    config = uvicorn.Config(_make_fake_backend_app(), host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    deadline = time.time() + 5
    while not server.started and time.time() < deadline:
        time.sleep(0.05)

    yield f"http://127.0.0.1:{port}"

    server.should_exit = True
    thread.join(timeout=5)


def _clear_caches():
    get_settings.cache_clear()


@pytest.fixture
async def gateway_client(monkeypatch, fake_backend):
    monkeypatch.setenv("PENIELGO_USER_SERVICE_URL", fake_backend)
    monkeypatch.setenv("PENIELGO_ITINERARY_SERVICE_URL", fake_backend)
    monkeypatch.setenv("PENIELGO_RECOMMENDATION_SERVICE_URL", fake_backend)
    _clear_caches()

    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://gateway-test") as ac:
            yield ac

    _clear_caches()
