import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "127.0.0.1"

    # Security
    SECRET_KEY: str = "dev-campusfix-insecure-secret-key-change-in-production-min32chars!"
    SESSION_COOKIE_NAME: str = "campusfix_session"
    SESSION_MAX_AGE_SECONDS: int = 86400  # 24 hours
    SECURE_COOKIES: bool = False
    SAME_SITE_POLICY: str = "lax"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite:///./campusfix.db"

    # ML Paths
    MODEL_STORAGE_PATH: str = "./models/resolution_estimator.joblib"
    MODEL_METADATA_PATH: str = "./models/model_metadata.json"

    # Demo Accounts (Development / Evaluation Setup)
    DEMO_ADMIN_NAME: str = "Campus Maintenance Lead"
    DEMO_ADMIN_EMAIL: str = "admin@campusfix.local"
    DEMO_ADMIN_PASSWORD: str = "AdminCampusFix2026!"

    DEMO_ANALYST_NAME: str = "Project Reviewer"
    DEMO_ANALYST_EMAIL: str = "analyst@campusfix.local"
    DEMO_ANALYST_PASSWORD: str = "AnalystCampusFix2026!"

    DEMO_USER_NAME: str = "Alex Student"
    DEMO_USER_EMAIL: str = "student@campusfix.local"
    DEMO_USER_PASSWORD: str = "StudentCampusFix2026!"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

