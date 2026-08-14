import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.routing import (
    auth_routes,
    destination_routes,
    health_routes,
    itinerary_routes,
    recommendation_routes,
    user_routes,
)

logger = logging.getLogger("penielgo.api-gateway")


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    settings = get_settings()
    logger.info("API Gateway started (env=%s)", settings.environment)
    yield
    logger.info("API Gateway shutting down")


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

    # Order matters: health_routes registers a literal "/api/v1/health" that must win over
    # any wildcard proxy route, and destination_routes' "/static/{path:path}" must not be
    # shadowed by anything registered before it.
    app.include_router(health_routes.router)
    app.include_router(auth_routes.router)
    app.include_router(user_routes.router)
    app.include_router(destination_routes.router)
    app.include_router(recommendation_routes.router)
    app.include_router(itinerary_routes.router)

    return app


app = create_app()
