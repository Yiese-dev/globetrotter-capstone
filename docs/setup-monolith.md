# Running the Monolith (Phase 1)

> Status: skeleton — exact commands confirmed once the FastAPI app exists (Stage 2).

## Prerequisites

- Python 3.11+

## Run

```bash
cd backend/monolith
python -m venv .venv
.venv/Scripts/activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

The API is then available at `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`. On first boot, the app seeds `app/data/destinations.json` from
`app/data/seed/destinations.seed.json`; `users.json` and `itineraries.json` start empty.

## Tests

```bash
cd backend/monolith
pytest
```
