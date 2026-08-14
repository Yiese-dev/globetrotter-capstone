# PenielGo

PenielGo is a travel recommendation and itinerary web app, built as a university semester
project to demonstrate the evolution of a system from a **monolithic architecture** to a
**microservices architecture**.

Users can register and log in, browse and search real travel destinations (currently seeded
with landmarks, hotels, and restaurants around Yaoundé, Cameroon), receive personalized
recommendations based on their preferences, build and manage multi-stop itineraries, and
plot everything on an interactive OpenStreetMap-based map with turn-by-turn directions.

## Architecture

The backend is implemented **twice**, deliberately kept isolated from each other, so the
architectural evolution can be inspected and compared directly:

- **`backend/monolith/`** — Phase 1. A single FastAPI application handling auth, users,
  destinations, recommendations, and itineraries together, with data stored in flat JSON
  files (no database engine).
- **`backend/microservices/`** — Phase 2. The same functionality decomposed into four
  independently runnable services — an API Gateway, User Service, Itinerary Service, and
  Recommendation Service — each with its own JSON data store, communicating over REST.
  Only the API Gateway's port is ever exposed to the outside world.

Both phases expose an **identical REST API contract** (`/api/v1/...`), so the React frontend
can point at either one purely via configuration — see
[`docs/frontend-backend-switching.md`](docs/frontend-backend-switching.md).

See [`docs/architecture.md`](docs/architecture.md) for the full system design and
[`docs/monolith-vs-microservices.md`](docs/monolith-vs-microservices.md) for a side-by-side
comparison of the two phases.

## Repository layout

```
PenielGo/
├── assets/brand/        Brand assets (logo)
├── backend/
│   ├── monolith/         Phase 1 — single FastAPI app
│   └── microservices/     Phase 2 — API Gateway + 3 services
├── frontend/              React (Vite + TypeScript) web app
└── docs/                  Architecture, API, and setup documentation
```

## Getting started

- Monolith: [`docs/setup-monolith.md`](docs/setup-monolith.md)
- Microservices: [`docs/setup-microservices.md`](docs/setup-microservices.md)
- API reference: [`docs/api.md`](docs/api.md)

## Status

Both phases are complete and tested. All backend services (the monolith and all four
microservices) have passing test suites; the React frontend — auth, destination discovery,
recommendations, itinerary management, and the OpenStreetMap-based map — has been verified
end-to-end against both the monolith and the microservices gateway, including a failure-
isolation check (stopping the Recommendation Service leaves itineraries and auth unaffected).

`docker-compose.yml` for the microservices is written and its syntax validated
(`docker compose config`); an actual `docker compose up --build` run needs a Docker daemon,
which wasn't available in the environment this was built in.
