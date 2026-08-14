# Architecture

## Overview

PenielGo implements the same product twice: once as a monolith (Phase 1), once as a set of
microservices behind an API Gateway (Phase 2). Both phases expose the identical REST contract
described in [`api.md`](api.md), so the frontend can point at either one by changing a single
environment variable (see [`frontend-backend-switching.md`](frontend-backend-switching.md)).

Neither phase shares code, a database, or a Docker build context with the other — this is
intentional, so the two architectures can be inspected, run, and defended independently of one
another.

## Phase 1 — Monolith

```
        ┌──────────────┐        ┌───────────────────────────────┐
        │  React SPA   │──────▶ │        FastAPI (monolith)      │
        └──────────────┘        │  routers → services → repos    │
                                 │  auth · destinations · itin.   │
                                 │  recommendations                │
                                 └──────────────┬──────────────────┘
                                                │
                                   flat JSON files (backend/monolith/app/data/)
                                   users.json · destinations.json · itineraries.json
```

One process, one codebase, one data directory. Simple to run and deploy, but every feature is
coupled to the same process — a bug or slow endpoint in one area can affect the whole app.

## Phase 2 — Microservices

```
                          ┌──────────────┐
                          │  React SPA   │
                          └──────┬───────┘
                                 │  only this port is ever published to the host
                                 ▼
                        ┌─────────────────┐
                        │   API Gateway   │  (no business logic, no data store)
                        └───┬───────┬─────┘
              internal-only │       │        internal-only
                    ┌───────┘       └────────────┐
                    ▼                             ▼                    ▼
          ┌──────────────────┐         ┌────────────────────┐  ┌─────────────────────────┐
          │   User Service    │         │ Itinerary Service   │  │ Recommendation Service   │
          │  auth, profile,   │         │  itinerary CRUD,     │  │  destinations catalog,   │
          │  preferences      │         │  stops (snapshots)   │  │  tag-overlap scoring     │
          └────────┬──────────┘         └──────────┬──────────┘  └────────────┬─────────────┘
                   ▼                                ▼                          ▼
              users.json                     itineraries.json            destinations.json
```

Each service owns its own JSON data file(s) and its own codebase — no service reads another
service's data file directly. Cross-service data flow happens through the client: when a user
adds a destination to an itinerary, the frontend fetches the destination from the
Recommendation Service and POSTs a **denormalized snapshot** of it to the Itinerary Service.
This means the Itinerary Service (and auth via the User Service) keep working even if the
Recommendation Service is down — the concrete demonstration of failure isolation for this
project.

## Networking: the single-open-port rule

In the Docker Compose deployment of Phase 2, **only the API Gateway container publishes a port
to the host** (`ports: ["8080:8080"]`). The three backing services have no `ports:` entry at
all — that omission is what actually prevents the host from reaching them directly. (Compose's
`expose:` keyword, sometimes assumed to enforce this, is documentation-only and does not by
itself restrict container-to-container reachability, which is already open on the shared bridge
network — worth stating precisely rather than implying `expose:` is doing the enforcement.)

**Local development without Docker** cannot reproduce this boundary at the network level at
all — every service is just an OS process bound to a local port, and the gateway process needs
*some* port per service to forward HTTP requests to. What's preserved locally is discipline,
not a network mechanism: always exercise the app through `localhost:8080/api/v1/...`; direct
calls to a service's own port (e.g. `localhost:8001`) are for debugging only and would be
unreachable from outside the Docker network in the real deployment.

## Data ownership

| Data | Owner (Phase 2) | Rationale |
|---|---|---|
| Users, credentials, preferences | User Service | Registration/login/profile is a natural single boundary |
| Destinations catalog + tags | Recommendation Service | The spec names four services, not five — colocating the catalog with the service that scores against it avoids inventing a separate "catalog service" |
| Itineraries + stops | Itinerary Service | Stops are stored as denormalized snapshots, so this service has zero runtime dependency on the destinations catalog |

## Recommendation algorithm

Tag-overlap (Jaccard) scoring — no ML, fully explainable:

```
score(user_tags, destination_tags) = |user_tags ∩ destination_tags| / |user_tags ∪ destination_tags|
```

Destinations are ranked by score descending, filtered to `score > 0`. A user with no
preferences set yet gets a `fallback: true` response (catalog sorted by name) rather than an
empty result.

## Explicitly out of scope

Phase 3 (Cloud Deployment: containerized scaling, load balancing) and Phase 4 (Resilience:
caching, message queues, circuit breakers) are later phases of the course this project is
built for, but are **not** designed or implemented here — scoped out deliberately so Phase 1
and Phase 2 stay focused and defensible on their own terms.
