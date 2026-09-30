# REALCHECK AI — Phase 7.0: Production Database Migration Analysis

## Current Database Architecture
The application currently uses SQLAlchemy as an ORM with a synchronous connection. The default database engine is set to SQLite (`sqlite:///./realcheck.db`) via `config.py`, which is suitable for local development. `database.py` dynamically handles SQLite-specific `connect_args` (`check_same_thread: False`) based on the URL scheme, which is a good practice for multi-environment support.

## Existing Models
1. `User` (in `user.py`) - Manages authentication.
2. `Case` (in `case.py`) - Stores investigation cases.
3. `MediaFile` (in `media.py`) - Stores file metadata (missing from initial migration).
4. `Batch` (in `job.py`) - Added in Phase 6.1 for Enterprise endpoints.
5. `Job` (in `job.py`) - Added in Phase 6.1 for Enterprise endpoints.

## Existing Migrations & Alembic Configuration
- Alembic is initialized in the `alembic/` directory.
- `alembic/env.py` imports `user`, `case`, and `media`, but **fails to import the `job` module**. Consequently, Alembic is entirely unaware of the `Batch` and `Job` models.
- **Initial Migration (`ed60ee90eaed`)**: 
  - Contains only the `users` and `cases` tables. `media_files` is missing.
  - Generates SQLite-specific syntax for timestamps: `server_default=sa.text('(CURRENT_TIMESTAMP)')`. This parenthesis syntax is incompatible with PostgreSQL, which expects `CURRENT_TIMESTAMP` or `now()`.

## SQLite Dependencies / Usages
- No raw SQLite queries (`execute("...")`) were found in the codebase. 
- The application relies heavily on `Base.metadata.create_all(bind=engine)` in `main.py` which blindly creates all tables if they don't exist. This is why the missing models (`Batch`, `Job`, `MediaFile`) work currently, despite being absent from Alembic migrations.
- The `DATABASE_URL` defaults to a hard-coded local path in `config.py`.

## PostgreSQL Readiness
- `requirements.txt` already includes `psycopg2-binary>=2.9.9`.
- `.env.example` already provides a sample PostgreSQL connection string (`postgresql://user:password@localhost:5432/realcheck`).
- The database engine logic correctly avoids SQLite-specific arguments when a `postgresql://` string is provided.

## Required Code Changes
1. **`alembic/env.py`**: Must import the `job` models (`from app.models import user, case, media, job`) so Alembic can track them.
2. **`main.py`**: `Base.metadata.create_all(bind=engine)` should be removed or conditionally disabled in production, forcing the use of Alembic migrations to ensure schema consistency.
3. **Alembic Migrations**: 
   - Modify the existing initial migration to remove the parentheses around `CURRENT_TIMESTAMP` (`sa.text('CURRENT_TIMESTAMP')`), making it compatible with both SQLite and PostgreSQL.
   - Generate a new migration (`alembic revision --autogenerate`) to capture the missing `media_files`, `batches`, and `jobs` tables.

## Required Environment Variables
- `DATABASE_URL`: Must be set to a valid PostgreSQL URI (e.g., `postgresql://user:password@host:5432/dbname`) in the production environment.

## Required Migration Steps
1. Apply the code changes listed above.
2. Run `alembic revision --autogenerate -m "Add missing media and batch models"` against a fresh database to create the new migration script.
3. For production deployment, execute `alembic upgrade head` to apply all schemas to the PostgreSQL instance.

## Testing Strategy
- **Local Testing**: Developers should continue using SQLite. The modified migrations must be tested against a fresh SQLite file to ensure `CURRENT_TIMESTAMP` works correctly.
- **Integration Testing**: Spin up a PostgreSQL container locally or in CI/CD and run `alembic upgrade head` to verify that the migrations execute without syntax errors. 

## Potential Compatibility Issues
- Existing SQLite databases will lack Alembic version tracking for the `Batch`, `Job`, and `MediaFile` tables since they were created via `Base.metadata.create_all`. 
- SQLite handles `Boolean`, `JSON`, and `DateTime` differently than PostgreSQL. While the current models are simple strings and datetimes, future schema additions must be careful with JSON/Array columns.

## Files that would need modification
- `backend/alembic/env.py`
- `backend/alembic/versions/ed60ee90eaed_initial_migration.py`
- `backend/app/main.py`
