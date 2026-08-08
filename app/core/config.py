from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HECTRON API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    database_url: str
    cors_origins: str = "*"
    embedding_dim: int = 1536

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: object) -> object:
        """Normalize provider-issued URLs (e.g. Neon) for SQLAlchemy + psycopg2.

        SQLAlchemy's psycopg2 dialect only accepts the ``postgresql://`` scheme,
        while many providers hand out ``postgres://``. We rewrite the scheme so
        the same DATABASE_URL works locally and on Vercel without extra config.
        """
        if isinstance(value, str) and value.startswith("postgres://"):
            return "postgresql://" + value[len("postgres://") :]
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        raw = (self.cors_origins or "").strip()
        if raw in {"*", "all"}:
            return ["*"]
        return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
