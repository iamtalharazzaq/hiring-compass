from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Hiring Compass API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    api_v1_prefix: str = "/api/v1"
    log_level: str = "INFO"
    database_url: str
    jwt_secret_key: str = Field(
        default="replace_with_a_long_random_value_for_local_development",
        validation_alias=AliasChoices("JWT_SECRET", "JWT_SECRET_KEY"),
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    refresh_cookie_name: str = "hiring_compass_refresh"
    frontend_origin: str = Field(
        default="http://localhost:5173",
        validation_alias=AliasChoices("FRONTEND_URL", "FRONTEND_ORIGIN"),
    )
    cors_origins: str = ""
    cookie_secure: bool = False
    seed_organization_name: str = "Hiring Compass"
    seed_organization_slug: str = "hiring-compass"
    seed_admin_name: str = "Admin"
    seed_admin_email: str = "admin@hiring-compass.test"
    seed_admin_password: str = "change_this_before_running_seed"
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "hiring_compass"
    minio_secret_key: str = "change_me_locally"
    minio_secure: bool = False
    minio_resume_bucket: str = "hiring-compass-resumes"
    resume_max_file_size_bytes: int = 10 * 1024 * 1024
    resume_download_url_expire_seconds: int = 300

    @field_validator("database_url")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgresql://"):
            return f"postgresql+asyncpg://{value.removeprefix('postgresql://')}"
        return value

    @model_validator(mode="after")
    def secure_storage_in_production(self) -> "Settings":
        if self.app_env not in {"development", "test"} and not self.minio_secure:
            raise ValueError("MINIO_SECURE must be true outside development.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
