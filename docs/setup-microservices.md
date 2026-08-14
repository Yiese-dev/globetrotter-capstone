# Running the Microservices (Phase 2)

> Status: implemented and verified (Stage 8) — all four services pass their own test suite,
> and the full app (register → browse → recommend → build an itinerary) works end-to-end
> through the gateway, including the cross-service recommendation-service → user-service
> call. `docker-compose.yml`'s syntax is validated (`docker compose config`); a full
> `docker compose up --build` run needs a Docker daemon, which wasn't available in the
> environment this was built in — confirm that command yourself before presenting.

## Option A — Docker Compose (recommended)

```bash
cd backend/microservices
cp .env.example .env
docker compose up --build
```

Only the API Gateway's port is published to the host: `http://localhost:8080`. The
`user-service`, `itinerary-service`, and `recommendation-service` containers are reachable only
from inside the Docker network (by the gateway) — they intentionally have no host port mapping.
**Always exercise the app through `localhost:8080/api/v1/...`.**

## Option B — Running services individually (no Docker)

Without Docker there is no network boundary to enforce, so each service binds its own local
port so the gateway process can reach it over HTTP. Each service needs its own virtualenv
and `.env` (copied from its `.env.example`) — they're kept independent on purpose:

```bash
# in 4 separate terminals, repeating this pattern per service (ports 8001/8002/8003/8080)
cd backend/microservices/user-service
python -m venv .venv && .venv/Scripts/activate   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --port 8001
```

The other three follow identically: `itinerary-service` on 8002, `recommendation-service` on
8003, `api-gateway` on 8080. On first boot, `recommendation-service` seeds
`app/data/destinations.json` from its own `app/data/seed/destinations.seed.json`.

Direct calls to `localhost:8001`/`8002`/`8003` are for debugging only — in the Docker
deployment above, they are not reachable from outside the network. Always go through
`localhost:8080` when exercising the app end-to-end.

## Tests

```bash
# run independently in each service directory
cd backend/microservices/<service> && pytest
```
