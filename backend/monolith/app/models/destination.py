from datetime import datetime

from pydantic import BaseModel, Field


class DestinationRecord(BaseModel):
    id: str
    name: str
    category: str
    tags: list[str] = Field(default_factory=list)
    description: str
    image_url: str
    lat: float
    lng: float
    address: str
    coordinates_verified: bool = False
    created_at: datetime


class DestinationPublic(BaseModel):
    id: str
    name: str
    category: str
    tags: list[str]
    description: str
    image_url: str
    lat: float
    lng: float
    address: str


def to_public(record: DestinationRecord) -> DestinationPublic:
    return DestinationPublic(
        id=record.id,
        name=record.name,
        category=record.category,
        tags=record.tags,
        description=record.description,
        image_url=record.image_url,
        lat=record.lat,
        lng=record.lng,
        address=record.address,
    )
