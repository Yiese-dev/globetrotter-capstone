from fastapi import APIRouter, Depends, Query

from app.core.deps import get_verified_token
from app.models.common import Page
from app.models.destination import DestinationPublic
from app.services import destination_service

router = APIRouter(prefix="/api/v1/destinations", tags=["destinations"], dependencies=[Depends(get_verified_token)])


@router.get("", response_model=Page[DestinationPublic])
async def list_destinations(
    category: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
) -> Page[DestinationPublic]:
    return await destination_service.list_destinations(category, search, page, page_size)


@router.get("/categories", response_model=list[str])
async def list_categories() -> list[str]:
    return await destination_service.list_categories()


@router.get("/{destination_id}", response_model=DestinationPublic)
async def get_destination(destination_id: str) -> DestinationPublic:
    return await destination_service.get_destination(destination_id)
