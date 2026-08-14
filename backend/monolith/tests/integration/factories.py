import uuid
from datetime import datetime, timezone

from app.models.destination import DestinationRecord
from app.repositories.destination_repository import get_destination_repository


async def seed_destination(**overrides) -> DestinationRecord:
    defaults = dict(
        id=str(uuid.uuid4()),
        name="Test Falls",
        category="nature",
        tags=["nature", "hiking"],
        description="A test waterfall used only in the automated test suite.",
        image_url="/static/destinations/test-falls.jpg",
        lat=1.0,
        lng=2.0,
        address="Testland",
        coordinates_verified=True,
        created_at=datetime.now(timezone.utc),
    )
    defaults.update(overrides)
    record = DestinationRecord(**defaults)
    await get_destination_repository().create(record)
    return record
