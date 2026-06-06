"""Core configuration module."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Inventory & Order Management API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database — Railway injects DATABASE_URL automatically
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/inventory_db"

    # CORS — comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:80"

    # JWT Authentication
    JWT_SECRET_KEY: str = "supersecretkey_change_me_in_production_9af3d298ea"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def async_database_url(self) -> str:
        """Ensure the URL uses the asyncpg dialect."""
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
