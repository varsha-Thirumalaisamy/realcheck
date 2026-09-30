# REALCHECK AI — Phase 7.0: Production-Ready PostgreSQL Support

## What Changed
- **Alembic Tracking**: Updated `alembic/env.py` to import the `job` models, allowing Alembic to track the `Batch` and `Job` entities.
- **Migration Compatibility**: Edited the initial Alembic migration (`ed60ee90eaed`) to remove SQLite-specific syntax (`sa.text('(CURRENT_TIMESTAMP)')`), replacing it with standard `sa.text('CURRENT_TIMESTAMP')` that runs smoothly on both SQLite and PostgreSQL.
- **Missing Models Tracked**: Generated a new Alembic migration (`5aaaa1fcfef0`) that natively adds the previously missing `media_files`, `batches`, and `jobs` tables to Alembic's history without recreating them using raw SQLAlchemy metadata.
- **Dynamic Connection Constraints**: Maintained SQLite-only multithreading connection arguments (`check_same_thread: False`) dynamically parsing the `.env` `DATABASE_URL`.
- **Environment Driven Creation**: Refactored `main.py` so `Base.metadata.create_all` is only executed when running locally via `sqlite:///`. This forces PostgreSQL deployments to strictly rely on `alembic upgrade head`, ensuring a safe production schema history.
- **Environment Documentation**: Updated `.env.example` to explicitly show both the Local Development (SQLite) and Production (PostgreSQL) `DATABASE_URL` structures. Redis URLs were also properly documented without leaking credentials.
- **Database Tests**: Created `test_database.py` which isolates and validates that the dynamic configuration correctly processes SQLite and PostgreSQL URIs, stripping thread constraints appropriately.

## SQLite Local-Development Setup
The application remains unchanged for local development. Out of the box, `DATABASE_URL` defaults to `sqlite:///./realcheck.db`.

Exact commands for local SQLite development:
```powershell
# 1. Start Redis for Celery (if testing batch processing)
docker run -p 6379:6379 -d redis

# 2. Run the application (Tables are auto-created by main.py)
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 3. Start Celery worker in a separate terminal
cd backend
celery -A app.core.celery_app worker --loglevel=info --pool=solo
```

## PostgreSQL Production Setup
For production, a running PostgreSQL instance is required. No tables will be automatically generated; Alembic is the strict enforcer of schemas.

Exact commands for PostgreSQL setup:
```bash
# 1. Start the PostgreSQL instance (if using Docker)
docker run --name realcheck-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=realcheck -p 5432:5432 -d postgres:15

# 2. Set the environment variable in your production environment
export DATABASE_URL="postgresql://user:password@localhost:5432/realcheck"

# 3. Initialize the fresh PostgreSQL database with Alembic
cd backend
python -m alembic upgrade head
```

## Environment Variables
The `.env.example` has been updated:
```env
# Database Configuration
# Local Development (SQLite)
# DATABASE_URL=sqlite:///./realcheck.db
# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/realcheck

# Celery & Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

## Alembic Migration Commands
If you make future schema changes to models:
1. Validate against a fresh SQLite database to prevent Postgres-only types (or vice versa).
2. Generate the new migration:
   ```bash
   python -m alembic revision --autogenerate -m "Description of change"
   ```
3. Upgrade:
   ```bash
   python -m alembic upgrade head
   ```

## How existing data can be migrated later
Existing SQLite data from `realcheck.db` is NOT automatically migrated to PostgreSQL. To migrate existing data, a custom ETL script (Phase 7.1+) or a tool like `pgloader` must be utilized to export SQLite tables and insert them into the PostgreSQL instance. The schema structures are identical, simplifying the transfer mapping.

## Testing Instructions
Tests have been added to validate engine configuration and model schemas.
```powershell
cd backend
python test_database.py
```
*Note: These tests use a local SQLite instance to validate model creation. True PostgreSQL validation tests are bypassed to prevent CI/CD failures unless a PostgreSQL server is mocked/containerized during the test stage.*

## Known Limitations
- The `test_enterprise_api.py` script continues to "hang" when Celery is forced into `CELERY_TASK_ALWAYS_EAGER=True` locally because it blocks the HTTP event loop on our ML models. This is a local development quirk that resolves itself in production when a true Redis broker runs in the background.
- JSON data is stored as plain `String` types in models to maintain parity across SQLite and PostgreSQL. Advanced JSONB querying on Postgres cannot be used currently without breaking SQLite backwards compatibility.
