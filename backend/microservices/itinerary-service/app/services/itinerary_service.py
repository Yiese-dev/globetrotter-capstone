import uuid
from datetime import datetime, timezone

from app.core.errors import NotFoundError
from app.models.itinerary import (
    ItineraryCreate,
    ItineraryPublic,
    ItineraryRecord,
    ItineraryUpdate,
    StopCreate,
    StopRecord,
    StopUpdate,
    to_public,
)
from app.repositories.itinerary_repository import get_itinerary_repository


async def _get_owned(itinerary_id: str, user_id: str) -> ItineraryRecord:
    record = await get_itinerary_repository().get_by_id(itinerary_id)
    if record is None or record.user_id != user_id:
        # 404 (not 403) so we never confirm to a caller that another user's itinerary ID exists.
        raise NotFoundError("Itinerary not found")
    return record


async def _save_stops(itinerary_id: str, stops: list[StopRecord]) -> ItineraryPublic:
    patch = {
        "stops": [s.model_dump(mode="json") for s in stops],
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    updated = await get_itinerary_repository().update(itinerary_id, patch)
    return to_public(updated)


async def list_itineraries(user_id: str) -> list[ItineraryPublic]:
    items = await get_itinerary_repository().find(lambda i: i.user_id == user_id)
    items.sort(key=lambda i: i.created_at, reverse=True)
    return [to_public(i) for i in items]


async def create_itinerary(user_id: str, payload: ItineraryCreate) -> ItineraryPublic:
    now = datetime.now(timezone.utc)
    record = ItineraryRecord(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=payload.title,
        start_date=payload.start_date,
        end_date=payload.end_date,
        notes=payload.notes,
        stops=[],
        created_at=now,
        updated_at=now,
    )
    await get_itinerary_repository().create(record)
    return to_public(record)


async def get_itinerary(itinerary_id: str, user_id: str) -> ItineraryPublic:
    return to_public(await _get_owned(itinerary_id, user_id))


async def update_itinerary(itinerary_id: str, user_id: str, payload: ItineraryUpdate) -> ItineraryPublic:
    await _get_owned(itinerary_id, user_id)
    patch = payload.model_dump(mode="json", exclude_unset=True)
    patch["updated_at"] = datetime.now(timezone.utc).isoformat()
    updated = await get_itinerary_repository().update(itinerary_id, patch)
    return to_public(updated)


async def delete_itinerary(itinerary_id: str, user_id: str) -> None:
    await _get_owned(itinerary_id, user_id)
    await get_itinerary_repository().delete(itinerary_id)


async def add_stop(itinerary_id: str, user_id: str, payload: StopCreate) -> ItineraryPublic:
    record = await _get_owned(itinerary_id, user_id)
    stop = StopRecord(
        stop_id=str(uuid.uuid4()),
        destination_id=payload.destination_id,
        name=payload.name,
        category=payload.category,
        image_url=payload.image_url,
        lat=payload.lat,
        lng=payload.lng,
        order=len(record.stops),
        planned_date=payload.planned_date,
        notes=payload.notes,
    )
    return await _save_stops(itinerary_id, record.stops + [stop])


async def update_stop(itinerary_id: str, user_id: str, stop_id: str, payload: StopUpdate) -> ItineraryPublic:
    record = await _get_owned(itinerary_id, user_id)
    stop_index = next((i for i, s in enumerate(record.stops) if s.stop_id == stop_id), None)
    if stop_index is None:
        raise NotFoundError("Stop not found")

    # exclude_unset (python-native types, not mode="json") so untouched fields — and their
    # types, e.g. `date` objects — are left exactly as they were on the existing StopRecord.
    updates = payload.model_dump(exclude_unset=True)
    stops = list(record.stops)
    stops[stop_index] = stops[stop_index].model_copy(update=updates)
    return await _save_stops(itinerary_id, stops)


async def remove_stop(itinerary_id: str, user_id: str, stop_id: str) -> ItineraryPublic:
    record = await _get_owned(itinerary_id, user_id)
    if not any(s.stop_id == stop_id for s in record.stops):
        raise NotFoundError("Stop not found")

    stops = [s for s in record.stops if s.stop_id != stop_id]
    return await _save_stops(itinerary_id, stops)
