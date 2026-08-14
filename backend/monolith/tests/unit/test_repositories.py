from pydantic import BaseModel

from app.repositories.base import JsonRepository


class Item(BaseModel):
    id: str
    name: str


async def test_create_get_update_delete(tmp_path):
    repo = JsonRepository(tmp_path / "items.json", Item)

    created = await repo.create(Item(id="1", name="one"))
    assert created.name == "one"

    fetched = await repo.get_by_id("1")
    assert fetched is not None
    assert fetched.name == "one"

    updated = await repo.update("1", {"name": "uno"})
    assert updated is not None
    assert updated.name == "uno"

    all_items = await repo.get_all()
    assert len(all_items) == 1

    deleted = await repo.delete("1")
    assert deleted is True
    assert await repo.get_by_id("1") is None


async def test_seed_if_missing_uses_seed_file(tmp_path):
    seed_path = tmp_path / "seed.json"
    seed_path.write_text('[{"id": "1", "name": "seeded"}]', encoding="utf-8")

    repo = JsonRepository(tmp_path / "items.json", Item)
    await repo.seed_if_missing(seed_path)

    items = await repo.get_all()
    assert len(items) == 1
    assert items[0].name == "seeded"


async def test_seed_if_missing_skips_when_file_exists(tmp_path):
    target = tmp_path / "items.json"
    repo = JsonRepository(target, Item)
    await repo.create(Item(id="1", name="already-there"))

    await repo.seed_if_missing(tmp_path / "seed.json")  # seed file doesn't even exist

    items = await repo.get_all()
    assert len(items) == 1
    assert items[0].name == "already-there"
