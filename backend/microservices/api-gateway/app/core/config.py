from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PenielGo API Gateway"
    environment: str = "development"
    port: int = 8080

    user_service_url: str = "http://localhost:8001"
    itinerary_service_url: str = "http://localhost:8002"
    recommendation_service_url: str = "http://localhost:8003"

    cors_origins: list[str] = ["http://localhost:5173"]
    request_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PENIELGO_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
