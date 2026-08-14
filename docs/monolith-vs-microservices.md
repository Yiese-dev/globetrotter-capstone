# Monolith vs. Microservices — Comparison

> Status: complete — both phases are built, tested, and were run side by side to produce the
> observations below.

| Aspect | Phase 1 — Monolith | Phase 2 — Microservices |
|---|---|---|
| Codebases | 1 (`backend/monolith/`) | 4 (`api-gateway/`, `user-service/`, `itinerary-service/`, `recommendation-service/`) |
| Data ownership | 1 shared `app/data/` directory | Each service owns its own JSON file(s); no cross-service file access |
| Deployment unit | 1 process/container | 4 independently deployable containers |
| Ports exposed | 1 (the app itself) | 1 (only the API Gateway; backing services are internal-only) |
| Inter-component communication | In-process function calls | REST over HTTP through the gateway |
| Failure blast radius | A bug anywhere can affect the whole app | A failing service degrades only its own endpoints — demonstrated in Stage 8 by stopping the Recommendation Service and confirming itineraries/auth still work |
| Scaling | Scale the whole app, or nothing | Each service could in principle scale independently (not exercised in this project, but the boundaries support it) |
| Local dev complexity | `uvicorn` once | `docker compose up`, or 4 separate `uvicorn` processes |
| Best for | Small team, fast iteration, simple deployment | Independent team ownership, isolating failures, scaling hot paths separately |

## Tradeoffs observed while building this project

**What got harder:**

- **Cross-service data access needed real design work.** In the monolith, recommendation
  scoring just imported `user_repository` and called a function. In microservices,
  recommendation-service can't touch user-service's `users.json` at all, so it now makes a
  real HTTP call to user-service's `/users/me/preferences` endpoint, forwarding the caller's
  own JWT. That's one extra network hop and one new failure mode (see below) for something
  that used to be a single Python function call.
- **The seed dataset now exists in two places.** `destinations.seed.json` is duplicated
  between `backend/monolith/app/data/seed/` and
  `backend/microservices/recommendation-service/app/data/seed/` (per the no-shared-code rule
  between phases). They have to be kept in sync by hand if the catalog changes.
- **Testing a reverse proxy is not the same as testing a normal FastAPI app.** The gateway's
  own test suite needed a real background uvicorn server as a fake backend (not just
  `ASGITransport`) to prove requests were actually forwarded over HTTP with the right method,
  path, query string, and headers — more setup than any other service's tests needed.
- **One more thing to run locally.** The monolith is one `uvicorn` command. The microservices
  version is four processes (or one `docker compose up`), each with its own venv/`.env` in
  local-dev mode.

**What got easier / more robust:**

- **A dependency failure no longer takes down the app.** This was the concrete payoff,
  verified directly: with `recommendation-service` killed, `/api/v1/destinations` and
  `/api/v1/recommendations` failed cleanly with `503 SERVICE_UNAVAILABLE` through the
  gateway, while `/api/v1/itineraries` and `/api/v1/auth/me` kept working normally — because
  itinerary-service never depends on recommendation-service at runtime (stops are
  denormalized snapshots, see `docs/architecture.md`). In the monolith, there's no equivalent
  scenario to even test — one crash takes everything down.
- **Auth verification is genuinely stateless per service.** Each service decodes the shared
  JWT locally; only user-service ever looks a user up in its own data. No service-to-service
  call is needed just to answer "is this request authenticated," which kept the itinerary and
  recommendation services simple despite the extra process boundary.
- **A single `/api/v1/health` gives a real system-wide status.** The monolith's `/health` can
  only ever say "the process that received this request is up." The gateway's aggregate
  health check fans out to all three services and reports exactly which one is down — closer
  to what you'd actually want when operating this in production.
