"""
FastAPI Main Application for RealCheck AI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.health import router as health_router
from .api.cases import router as cases_router
from .api.analysis import router as analysis_router
from .api.auth import router as auth_router

app = FastAPI(
    title="REALCHECK AI Forensic Analysis Platform",
    description="Explainable Digital Media Authenticity & Forensic Analysis Platform",
    version="1.0.0"
)

# Enable CORS for local frontend Vite dev server & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .core.database import engine
from .models.base import Base
from .models import job
from .models.user import User

# Create all tables only if using SQLite (for PostgreSQL, use Alembic)
from .core.config import settings
if settings.DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

from .api.enterprise import router as enterprise_router

app.include_router(health_router, prefix="/api")
app.include_router(cases_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(enterprise_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
@app.get("/")
def root():
    return {
        "platform": "REALCHECK AI",
        "tagline": "Don't just detect. Investigate, explain, and verify.",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
