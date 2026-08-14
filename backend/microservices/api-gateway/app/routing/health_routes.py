import httpx
from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter()


@router.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": "api-gateway"}


@router.get("/api/v1/health", tags=["health"])
async def aggregate_health() -> dict:
    """Gateway-only endpoint: fans out to every backing service's own /health so a single
    call shows the whole system's status, without the gateway holding any state itself."""
    settings = get_settings()
    services = {
        "user-service": settings.user_service_url,
        "itinerary-service": settings.itinerary_service_url,
        "recommendation-service": settings.recommendation_service_url,
    }

    results: dict[str, str] = {}
    async with httpx.AsyncClient(timeout=3.0) as client:
        for name, base_url in services.items():
            try:
                response = await client.get(f"{base_url}/health")
                results[name] = "ok" if response.status_code == 200 else f"unhealthy ({response.status_code})"
            except httpx.RequestError:
                results[name] = "unreachable"

    overall = "ok" if all(status == "ok" for status in results.values()) else "degraded"
    return {"status": overall, "gateway": "ok", "services": results}
