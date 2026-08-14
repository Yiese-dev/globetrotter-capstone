import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.repositories.destination_repository import get_destination_repository
from app.routers import destinations as destinations_router
from app.routers import recommendations as recommendations_router

logger = logging.getLogger("penielgo.recommendation-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging()
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    await get_destination_repository().seed_if_missing(settings.data_dir / "seed" / "destinations.seed.json")
    logger.info("Recommendation Service started (env=%s)", settings.environment)
    yield
    logger.info("Recommendation Service shutting down")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    settings.static_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static", StaticFiles(directory=str(settings.static_dir)), name="static")

    app.include_router(destinations_router.router)
    app.include_router(recommendations_router.router)

    @app.get("/health", tags=["health"])
    async def health() -> dict:
        return {"status": "ok", "service": "recommendation-service"}

    return app


app = create_app()
