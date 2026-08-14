# API Reference

> Status: fully implemented and tested in both phases. The monolith (Stages 2–4) and the
> microservices behind the API Gateway (Stage 8) expose the identical contract below —
> verified by running the same frontend against both, unmodified except for one env var.

All endpoints are versioned under `/api/v1`. Both the monolith and the API Gateway expose the
identical set of paths below, so this document applies to either phase. Endpoints marked
**Auth** require an `Authorization: Bearer <token>` header obtained from `/auth/login` or
`/auth/register`.

## Error format

Every error response uses the same envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ /* optional */ ] } }
```

Codes in use: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`,
`INTERNAL_ERROR`.

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | no | Create an account; returns a token immediately (no separate login step needed) |
| POST | `/api/v1/auth/login` | no | Exchange email/password for a token |
| GET | `/api/v1/auth/me` | yes | Current user's profile |

## Users

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/users/me/preferences` | yes | Get the current user's preference tags |
| PATCH | `/api/v1/users/me/preferences` | yes | Update preference tags |

## Destinations

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/destinations` | yes | List/search/filter (`?category=&search=&page=&page_size=`) |
| GET | `/api/v1/destinations/{id}` | yes | Destination detail |
| GET | `/api/v1/destinations/categories` | yes | Distinct categories, for filter UI |

## Recommendations

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/recommendations` | yes | `?limit=` — tag-overlap scored list; `fallback:true` if the user has no preferences yet |

## Itineraries

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/itineraries` | yes | List the current user's itineraries |
| POST | `/api/v1/itineraries` | yes | Create an itinerary |
| GET | `/api/v1/itineraries/{id}` | yes | Itinerary detail, including stops |
| PUT | `/api/v1/itineraries/{id}` | yes | Update title/dates/notes |
| DELETE | `/api/v1/itineraries/{id}` | yes | Delete an itinerary |
| POST | `/api/v1/itineraries/{id}/stops` | yes | Add a stop (client supplies a denormalized destination snapshot) |
| PATCH | `/api/v1/itineraries/{id}/stops/{stop_id}` | yes | Update a stop |
| DELETE | `/api/v1/itineraries/{id}/stops/{stop_id}` | yes | Remove a stop |

## Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | no | Per-service liveness check (used by Docker healthchecks) |
| GET | `/api/v1/health` | no | Gateway-only: aggregates each backing service's `/health` |

Request/response bodies with field-level detail will be added here alongside each router's
implementation.
