from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent  # recommendation-service/app
ROOT_DIR = APP_DIR.parent  # recommendation-service


class Settings(BaseSettings):
    app_name: str = "PenielGo Recommendation Service"
    environment: str = "development"

    jwt_secret: str = "dev-secret-change-me"

    data_dir: Path = APP_DIR / "data"
    static_dir: Path = ROOT_DIR / "static"

    cors_origins: list[str] = ["http://localhost:5173"]
    port: int = 8003

    # Synchronous service-to-service call target — see services/recommendation_service.py
    user_service_url: str = "http://localhost:8001"

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PENIELGO_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
