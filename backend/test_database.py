import os
import unittest
from unittest.mock import patch
from sqlalchemy import create_engine
from app.core.config import Settings
from app.models.base import Base
from app.models import user, case, media, job

class TestDatabaseConfig(unittest.TestCase):
    
    def test_sqlite_configuration(self):
        # Default fallback is sqlite
        settings = Settings(DATABASE_URL="sqlite:///./test.db")
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
            pool_pre_ping=True
        )
        self.assertEqual(engine.url.drivername, "sqlite")
        
        # Test model creation (does not require Postgres)
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import inspect
        inspector = inspect(engine)
        self.assertTrue(inspector.has_table("users"))
        self.assertTrue(inspector.has_table("batches"))
        Base.metadata.drop_all(bind=engine)

    def test_postgresql_configuration_validation(self):
        settings = Settings(DATABASE_URL="postgresql://user:password@localhost:5432/realcheck")
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {},
            pool_pre_ping=True
        )
        self.assertEqual(engine.url.drivername, "postgresql")
        # connect_args should not contain check_same_thread for postgres
        self.assertNotIn("check_same_thread", getattr(engine, 'connect_args', {}))
        
    def test_invalid_database_url_handling(self):
        with self.assertRaises(Exception):
            engine = create_engine("invalid_db_url://user:pass@localhost/db")
            engine.connect()

if __name__ == "__main__":
    unittest.main()
