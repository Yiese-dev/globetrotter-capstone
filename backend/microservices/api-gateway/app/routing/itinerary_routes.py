from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.routing.proxy import forward

router = APIRouter()


@router.api_route("/api/v1/itineraries", methods=["GET", "POST"])
async def proxy_itineraries_root(request: Request):
    settings = get_settings()
    return await forward(request, settings.itinerary_service_url, "itinerary-service")


@router.api_route("/api/v1/itineraries/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy_itineraries(request: Request, path: str):
    settings = get_settings()
    return await forward(request, settings.itinerary_service_url, "itinerary-service")
