from app.core.errors import NotFoundError
from app.models.common import Page
from app.models.destination import DestinationPublic, to_public
from app.repositories.destination_repository import get_destination_repository


async def list_destinations(
    category: str | None, search: str | None, page: int, page_size: int
) -> Page[DestinationPublic]:
    repo = get_destination_repository()
    items = await repo.get_all()

    if category:
        items = [d for d in items if d.category == category]
    if search:
        needle = search.lower()
        items = [d for d in items if needle in d.name.lower() or needle in d.description.lower()]

    items.sort(key=lambda d: d.name)
    total = len(items)
    start = (page - 1) * page_size
    page_items = items[start : start + page_size]

    return Page(items=[to_public(d) for d in page_items], page=page, page_size=page_size, total=total)


async def get_destination(destination_id: str) -> DestinationPublic:
    repo = get_destination_repository()
    record = await repo.get_by_id(destination_id)
    if record is None:
        raise NotFoundError("Destination not found")
    return to_public(record)


async def list_categories() -> list[str]:
    repo = get_destination_repository()
    items = await repo.get_all()
    return sorted({d.category for d in items})
