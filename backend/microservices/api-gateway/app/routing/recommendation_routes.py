from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.routing.proxy import forward

router = APIRouter()


@router.api_route("/api/v1/recommendations", methods=["GET"])
async def proxy_recommendations(request: Request):
    settings = get_settings()
    return await forward(request, settings.recommendation_service_url, "recommendation-service")
