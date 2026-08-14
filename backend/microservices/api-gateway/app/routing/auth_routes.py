from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.routing.proxy import forward

router = APIRouter()


@router.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST"])
async def proxy_auth(request: Request, path: str):
    settings = get_settings()
    return await forward(request, settings.user_service_url, "user-service")
