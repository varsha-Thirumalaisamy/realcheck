import os
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "REALCHECK AI"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "change-this-in-production"
    
    # Database
    DATABASE_URL: str = "sqlite:///./realcheck.db"
    DIRECT_URL: str | None = None
    
    # Storage
    STORAGE_PROVIDER: str = "local"
    
    # Celery & Redis
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    CELERY_TASK_ALWAYS_EAGER: bool = False
    
    # ML & Detectors
    ENABLE_DEMO_MODE: bool = True
    
    # Email / SMTP (Optional in dev, required in prod)
    SMTP_HOST: str | None = None
    SMTP_PORT: int | None = 587

    @field_validator("SMTP_PORT", mode="before")
    @classmethod
    def parse_smtp_port(cls, v):
        if v == "" or v is None:
            return 587
        return int(v)
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_FROM_NAME: str = "REALCHECK AI"
    
    FRONTEND_URL: str = "http://localhost:5173"
    GOOGLE_CLIENT_ID: str | None = None
    
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
