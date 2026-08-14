from datetime import date, datetime

from pydantic import BaseModel, Field


class StopRecord(BaseModel):
    stop_id: str
    destination_id: str
    name: str
    category: str
    image_url: str
    lat: float
    lng: float
    order: int
    planned_date: date | None = None
    notes: str | None = None


class ItineraryRecord(BaseModel):
    id: str
    user_id: str
    title: str
    start_date: date | None = None
    end_date: date | None = None
    notes: str | None = None
    stops: list[StopRecord] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ItineraryPublic(BaseModel):
    id: str
    title: str
    start_date: date | None
    end_date: date | None
    notes: str | None
    stops: list[StopRecord]
    created_at: datetime
    updated_at: datetime


def to_public(record: ItineraryRecord) -> ItineraryPublic:
    return ItineraryPublic(
        id=record.id,
        title=record.title,
        start_date=record.start_date,
        end_date=record.end_date,
        notes=record.notes,
        stops=record.stops,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


class ItineraryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)


class ItineraryUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)


class StopCreate(BaseModel):
    """The client supplies a denormalized snapshot of a destination it already fetched
    from /destinations — the itinerary service never reads the destinations catalog."""

    destination_id: str
    name: str
    category: str
    image_url: str
    lat: float
    lng: float
    planned_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)


class StopUpdate(BaseModel):
    planned_date: date | None = None
    notes: str | None = Field(default=None, max_length=2000)
    order: int | None = None
