from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent  # itinerary-service/app
ROOT_DIR = APP_DIR.parent  # itinerary-service


class Settings(BaseSettings):
    app_name: str = "PenielGo Itinerary Service"
    environment: str = "development"

    jwt_secret: str = "dev-secret-change-me"

    data_dir: Path = APP_DIR / "data"

    cors_origins: list[str] = ["http://localhost:5173"]
    port: int = 8002

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PENIELGO_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
