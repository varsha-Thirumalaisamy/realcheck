# REALCHECK AI — Phase 6.1: Enterprise Batch Worker Hardening Analysis

## Current Architecture
The current backend is a FastAPI application running synchronously/asynchronously within a single process. It uses a lightweight architecture primarily designed for demonstration and development purposes. It utilizes an in-memory dictionary for maintaining state and SQLite as its primary database.

## Current Batch Flow
1. **Trigger:** The `/batch/analyze` endpoint in `enterprise.py` receives files or text content.
2. **Storage:** It writes files to temporary disk locations.
3. **Queueing (In-Memory):** It creates an entry in an in-memory dictionary (`BATCH_JOBS_DB`) in `batch_worker.py` with the status `"QUEUED"`.
4. **Execution:** It schedules the execution using FastAPI's built-in `BackgroundTasks` via `background_tasks.add_task(process_batch, batch_id)`.
5. **Processing:** The background task loops over jobs in the batch and uses `asyncio.gather` to concurrently run `process_job`. State updates and results are written back directly into the `BATCH_JOBS_DB` dictionary and a separate `INVESTIGATIONS_DB` dictionary.
6. **Polling:** The client polls the `/batch/{batch_id}` endpoint, which retrieves the status from the in-memory `BATCH_JOBS_DB`.

## Redis/Celery Status
- **Redis:** Not configured. There are no connections or references to Redis in the codebase.
- **Celery:** Not installed or configured. The `requirements.txt` file does not list `celery` or `redis`.

## Database Status
- **Current Database:** The project is currently using **SQLite** (`sqlite:///./realcheck.db`) by default in `config.py`.
- **PostgreSQL Readiness:** The `requirements.txt` includes `psycopg2-binary`, indicating that PostgreSQL support is planned or partially ready, but not actively configured as the default. The SQLAlchemy engine is setup to handle SQLite specific connect args, but can support PostgreSQL.
- **Batch State:** The batch job status is currently **stored only in memory** (`BATCH_JOBS_DB`). SQLAlchemy models for `Batch` and `Job` exist (in `models/job.py`), but they are not being actively used to track batch progress.

## Problems Found
1. **Volatile State:** Because batch status is stored in memory, restarting the API server drops all queued and running batch jobs, making it impossible to recover them.
2. **Scalability:** `BackgroundTasks` run in the same event loop/process as the FastAPI application. Heavy forensic analysis tasks will block the API server or consume all its memory/CPU, preventing it from handling new requests.
3. **Missing Distributed Queue:** There is no message broker (like Redis or RabbitMQ) to distribute tasks across multiple worker nodes.
4. **Lack of Concurrency Control:** `asyncio.gather` attempts to process all jobs in a batch at once, which could lead to Out-Of-Memory (OOM) errors if the batch is large.
5. **Database Underutilization:** The `Batch` and `Job` database models are ignored in favor of in-memory dictionaries.

## Recommended Implementation Steps
1. **Install Dependencies:** Add `celery` and `redis` to `requirements.txt`.
2. **Configure Redis & Celery:** Set up Celery configuration in the backend and point it to a Redis broker and backend.
3. **Migrate to PostgreSQL:** Update `.env`/`config.py` to use a PostgreSQL database URL to support concurrent connections efficiently.
4. **Persist Batch State to DB:** Update `enterprise.py` to save `Batch` and `Job` records to the database upon submission, rather than updating an in-memory dictionary.
5. **Refactor Batch Worker:** Rewrite `batch_worker.py` to define Celery tasks (`@celery.task`) instead of simple async functions.
6. **Update the Polling Endpoint:** Modify the `/batch/{batch_id}` route to fetch the current status from the database instead of `BATCH_JOBS_DB`.
7. **Add Worker Startup Script:** Add instructions or a script (e.g., in `docker-compose.yml`) to run the Celery worker process separately from the FastAPI server.

## Files that would need modification
- `backend/requirements.txt` (to add Celery, Redis)
- `backend/app/core/config.py` (to add Celery/Redis connection strings)
- `backend/app/core/batch_worker.py` (to convert async functions to Celery tasks, remove in-memory dict)
- `backend/app/api/enterprise.py` (to trigger Celery tasks and read/write to the database)
- `backend/app/main.py` (optional: to initialize Celery app)
- `docker-compose.yml` (to add Redis and Celery worker services)
- `backend/app/core/celery_app.py` (New file for Celery instantiation)
