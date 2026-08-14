import asyncio
import json
import os
import tempfile
from pathlib import Path
from typing import Callable, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class JsonRepository(Generic[T]):
    """Reads/writes a list of records to a single JSON file.

    Concurrency model: one asyncio.Lock per repository instance guards every
    read-modify-write sequence. This is only safe because this service runs as a
    single Uvicorn worker (no --workers>1) — see docs/architecture.md. Writes go
    through a temp-file + os.replace() swap so a crash mid-write can never leave
    the JSON file corrupted.
    """

    def __init__(self, file_path: Path, model: type[T]):
        self._file_path = file_path
        self._model = model
        self._lock = asyncio.Lock()

    def _read_raw(self) -> list[dict]:
        if not self._file_path.exists():
            return []
        text = self._file_path.read_text(encoding="utf-8").strip()
        if not text:
            return []
        return json.loads(text)

    def _write_raw(self, records: list[dict]) -> None:
        self._file_path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_path = tempfile.mkstemp(dir=self._file_path.parent, prefix=".tmp-", suffix=".json")
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2, default=str)
            os.replace(tmp_path, self._file_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    async def get_all(self) -> list[T]:
        async with self._lock:
            return [self._model.model_validate(r) for r in self._read_raw()]

    async def get_by_id(self, id_: str) -> T | None:
        async with self._lock:
            for r in self._read_raw():
                if r.get("id") == id_:
                    return self._model.model_validate(r)
            return None

    async def find(self, predicate: Callable[[T], bool]) -> list[T]:
        async with self._lock:
            results: list[T] = []
            for r in self._read_raw():
                model = self._model.model_validate(r)
                if predicate(model):
                    results.append(model)
            return results

    async def create(self, record: T) -> T:
        async with self._lock:
            records = self._read_raw()
            records.append(json.loads(record.model_dump_json()))
            self._write_raw(records)
            return record

    async def update(self, id_: str, patch: dict) -> T | None:
        async with self._lock:
            records = self._read_raw()
            for i, r in enumerate(records):
                if r.get("id") == id_:
                    r.update(patch)
                    records[i] = r
                    self._write_raw(records)
                    return self._model.model_validate(r)
            return None

    async def delete(self, id_: str) -> bool:
        async with self._lock:
            records = self._read_raw()
            filtered = [r for r in records if r.get("id") != id_]
            if len(filtered) == len(records):
                return False
            self._write_raw(filtered)
            return True

    async def seed_if_missing(self, seed_path: Path) -> None:
        async with self._lock:
            if self._file_path.exists():
                return
            data = []
            if seed_path.exists():
                data = json.loads(seed_path.read_text(encoding="utf-8"))
            self._write_raw(data)
