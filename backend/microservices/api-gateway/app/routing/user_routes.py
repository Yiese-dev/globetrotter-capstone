from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.routing.proxy import forward

router = APIRouter()


@router.api_route("/api/v1/users/{path:path}", methods=["GET", "PATCH"])
async def proxy_users(request: Request, path: str):
    settings = get_settings()
    return await forward(request, settings.user_service_url, "user-service")
