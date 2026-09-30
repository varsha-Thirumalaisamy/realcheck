# REALCHECK AI — Phase 6.1: Enterprise Batch Worker Hardening Implementation

## What was changed
1. **Added Redis & Celery Support**: Replaced FastAPI `BackgroundTasks` with Celery tasks to process batches, enabling distributed processing and reliability.
2. **Database Persistence**: Updated `enterprise.py` and `batch_worker.py` to persist `Batch` and `Job` states in the existing SQLite database (SQLAlchemy models) instead of relying on an in-memory dictionary.
3. **Refactored Batch Worker**: `batch_worker.py` was rewritten to serve as a Celery task module. It now receives the job payloads, queries the DB, executes the synchronous detectors, and updates statuses (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`) in the database.
4. **API Endpoints**: Modified `/batch/analyze` to insert records into the database and queue the Celery task. Modified `/batch/{batch_id}` to retrieve current status from the database.

## Files Created
- `backend/app/core/celery_app.py`: Contains the Celery application initialization and configuration.
- `docs/PHASE_6_1_IMPLEMENTATION.md`: This documentation.

## Files Modified
- `backend/requirements.txt`: Added `celery` and `redis`.
- `backend/app/core/config.py`: Added `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` configurations.
- `backend/.env.example`: Added Celery environment variables.
- `backend/app/core/batch_worker.py`: Rewritten to use Celery tasks and database sessions instead of an in-memory dictionary.
- `backend/app/api/enterprise.py`: Updated endpoints to use the database and Celery `process_batch_task.delay()`.

## New Dependencies
- `celery>=5.3.0`
- `redis>=5.0.0`

## How Redis is Configured
Redis is configured via the `CELERY_BROKER_URL` and `CELERY_RESULT_BACKEND` variables in `config.py`. By default, it expects a Redis instance running at `redis://localhost:6379/0`.

## How the Celery Worker is Started (Windows)
To run Redis and Celery on Windows, follow these instructions:

1. **Start Redis**:
   If using WSL (Windows Subsystem for Linux) or Docker:
   ```bash
   docker run -p 6379:6379 -d redis
   ```
   Or natively via WSL:
   ```bash
   sudo service redis-server start
   ```

2. **Start Celery Worker**:
   Open a new PowerShell terminal, activate your virtual environment, and run:
   ```powershell
   cd backend
   celery -A app.core.celery_app worker --loglevel=info --pool=solo
   ```
   *(Note: `--pool=solo` is highly recommended on Windows to avoid process spawning issues.)*

## API Flow
1. **POST /api/enterprise/batch/analyze**: The user submits files/texts. The API creates a `Batch` and corresponding `Job` records in the database with status `QUEUED`. It then calls `.delay()` on the Celery task and returns the `batch_id`.
2. **Celery Task (`process_batch_task`)**: Picks up the task, updates the batch and job statuses to `PROCESSING`, runs the AI detectors, saves results, deletes temporary files, and updates the database records to `COMPLETED` or `FAILED`.
3. **GET /api/enterprise/batch/{batch_id}**: The user polls this endpoint. It queries the database for the batch and its associated jobs, returning the latest persisted state.

## Testing Instructions
To test the API locally:
1. Start Redis on port 6379.
2. Start the Celery worker (`celery -A app.core.celery_app worker --loglevel=info --pool=solo`).
3. Start the FastAPI server (`uvicorn app.main:app --reload`).
4. Run the test script: `python test_enterprise_api.py`.

## Known Limitations
- Currently using SQLite which might hit lock issues under heavy concurrent database writes from multiple Celery workers. A migration to PostgreSQL (Phase 7) is strongly recommended for production.
- Failed jobs do not automatically fail the entire batch. The batch completes when all jobs are processed, regardless of individual successes or failures.
