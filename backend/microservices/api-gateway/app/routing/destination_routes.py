from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.routing.proxy import forward

router = APIRouter()


@router.api_route("/api/v1/destinations", methods=["GET"])
async def proxy_destinations_root(request: Request):
    settings = get_settings()
    return await forward(request, settings.recommendation_service_url, "recommendation-service")


@router.api_route("/api/v1/destinations/{path:path}", methods=["GET"])
async def proxy_destinations(request: Request, path: str):
    settings = get_settings()
    return await forward(request, settings.recommendation_service_url, "recommendation-service")


@router.api_route("/static/{path:path}", methods=["GET"])
async def proxy_static_assets(request: Request, path: str):
    """Destination photos live on recommendation-service's filesystem in Phase 2 — the
    gateway has to proxy /static/* too, or image URLs returned by the API (which are
    relative, e.g. "/static/destinations/x.jpg") would 404 through the gateway."""
    settings = get_settings()
    return await forward(request, settings.recommendation_service_url, "recommendation-service")
