from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings

# Supabase and SQLAlchemy compatibility
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
# psycopg2 doesn't accept pgbouncer=true in the connection string
if "?pgbouncer=true" in db_url:
    db_url = db_url.replace("?pgbouncer=true", "")

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
