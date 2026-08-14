from fastapi import APIRouter, Depends, status

from app.core.deps import get_current_user_id
from app.models.itinerary import ItineraryCreate, ItineraryPublic, ItineraryUpdate, StopCreate, StopUpdate
from app.services import itinerary_service

router = APIRouter(prefix="/api/v1/itineraries", tags=["itineraries"])


@router.get("", response_model=list[ItineraryPublic])
async def list_itineraries(user_id: str = Depends(get_current_user_id)) -> list[ItineraryPublic]:
    return await itinerary_service.list_itineraries(user_id)


@router.post("", response_model=ItineraryPublic, status_code=status.HTTP_201_CREATED)
async def create_itinerary(
    payload: ItineraryCreate, user_id: str = Depends(get_current_user_id)
) -> ItineraryPublic:
    return await itinerary_service.create_itinerary(user_id, payload)


@router.get("/{itinerary_id}", response_model=ItineraryPublic)
async def get_itinerary(itinerary_id: str, user_id: str = Depends(get_current_user_id)) -> ItineraryPublic:
    return await itinerary_service.get_itinerary(itinerary_id, user_id)


@router.put("/{itinerary_id}", response_model=ItineraryPublic)
async def update_itinerary(
    itinerary_id: str, payload: ItineraryUpdate, user_id: str = Depends(get_current_user_id)
) -> ItineraryPublic:
    return await itinerary_service.update_itinerary(itinerary_id, user_id, payload)


@router.delete("/{itinerary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary(itinerary_id: str, user_id: str = Depends(get_current_user_id)) -> None:
    await itinerary_service.delete_itinerary(itinerary_id, user_id)


@router.post("/{itinerary_id}/stops", response_model=ItineraryPublic, status_code=status.HTTP_201_CREATED)
async def add_stop(
    itinerary_id: str, payload: StopCreate, user_id: str = Depends(get_current_user_id)
) -> ItineraryPublic:
    return await itinerary_service.add_stop(itinerary_id, user_id, payload)


@router.patch("/{itinerary_id}/stops/{stop_id}", response_model=ItineraryPublic)
async def update_stop(
    itinerary_id: str,
    stop_id: str,
    payload: StopUpdate,
    user_id: str = Depends(get_current_user_id),
) -> ItineraryPublic:
    return await itinerary_service.update_stop(itinerary_id, user_id, stop_id, payload)


@router.delete("/{itinerary_id}/stops/{stop_id}", response_model=ItineraryPublic)
async def remove_stop(
    itinerary_id: str, stop_id: str, user_id: str = Depends(get_current_user_id)
) -> ItineraryPublic:
    return await itinerary_service.remove_stop(itinerary_id, user_id, stop_id)
