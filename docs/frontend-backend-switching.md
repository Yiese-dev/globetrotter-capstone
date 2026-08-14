# Switching the Frontend Between Monolith and Microservices

> Status: implemented and verified against both phases (Stage 5 against the monolith, Stage 8
> against the microservices gateway) — same build, only `VITE_API_BASE_URL` changes.

Both backend phases expose the identical REST contract documented in [`api.md`](api.md), so
the frontend never needs a code change to switch — only its API base URL.

In `frontend/.env.local`:

```bash
# Point at the monolith (Phase 1)
VITE_API_BASE_URL=http://localhost:8000/api/v1

# — or — point at the microservices API Gateway (Phase 2)
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Restart the Vite dev server after changing this value (`npm run dev`). There is nothing else
to change: routes, request/response shapes, and auth headers are identical in both phases.
