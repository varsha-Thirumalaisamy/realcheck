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
    # Enterprise & External APIs
    API_KEY: str = "rc_ent_2026_secure"
    WALTER_API_KEY: str | None = None
    WALTER_API_URL: str = "https://developer-portal.walterwrites.ai/api/detector/"
    ILLUMINARTY_API_KEY: str | None = None
    ILLUMINARTY_API_URL: str = "https://api.illuminarty.ai/v1/image/classify"
    REALITY_DEFENDER_API_KEY: str | None = None
    REALITY_DEFENDER_API_URL: str = "https://api.prd.realitydefender.xyz"
    
    _backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    _backend_env = os.path.join(_backend_dir, ".env")
    _root_env = os.path.join(os.path.dirname(_backend_dir), ".env")
    
    model_config = SettingsConfigDict(
        env_file=(_backend_env, _root_env, ".env"), 
        env_file_encoding="utf-8", 
        extra="ignore"
    )

settings = Settings()
