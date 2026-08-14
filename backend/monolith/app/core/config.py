from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

APP_DIR = Path(__file__).resolve().parent.parent  # backend/monolith/app
ROOT_DIR = APP_DIR.parent  # backend/monolith


class Settings(BaseSettings):
    app_name: str = "PenielGo Monolith"
    environment: str = "development"

    jwt_secret: str = "dev-secret-change-me"
    jwt_expires_minutes: int = 60

    data_dir: Path = APP_DIR / "data"
    static_dir: Path = ROOT_DIR / "static"

    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="PENIELGO_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
