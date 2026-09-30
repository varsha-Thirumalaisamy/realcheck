# REALCHECK AI — Architecture Document

## 1. Current Architecture

### Frontend Architecture

- **Framework:** React 19 + TypeScript.
- **Build Tool:** Vite.
- **Routing:** Custom state-based routing via `currentTab` in `App.tsx`. Does not currently use a library like `react-router-dom`.
- **State Management:** React local state (`useState`, `useEffect`) and prop drilling. No global state manager.
- **Styling:** Custom CSS (`App.css`, `index.css`) utilizing a glassmorphism aesthetic.
- **API Communication:** Likely standard fetch/axios in the `services/` directory.

### Backend Architecture

- **Framework:** FastAPI (Python 3.10+).
- **Structure:**
  - `app/main.py`: Entrypoint, FastAPI app instantiation, CORS configuration.
  - `app/api/routes.py`: Contains all endpoints (`/health`, `/models`, `/investigations`, `/analyze/*`, `/reports/*`) tightly coupled in one file.
  - `app/schemas/forensics.py`: Pydantic v2 schemas defining the data models.

## 2. Current Features

- **Dashboard and Case-Management:** Interactive UI to view and select benchmark cases, switch between different media forensic workspaces (Image, Video, Audio, Text).
- **Upload:** Form to submit Image, Video, Audio, and Text for analysis (synchronous processing).
- **Visual Analysis Views:** Dual-view original vs. Grad-CAM heatmaps, temporal anomaly scrubbers, spectrograms, burstiness bar charts (rendered via frontend UI based on backend coordinates).
- **Forensic Reports:** Generates structured JSON, CSV, and HTML reports based on analysis results.

## 3. Demo/Placeholder Components (Current AI Logic)

**Where simulated results are generated:**

- **Image Analysis:** `backend/app/detectors/image/detector.py`
- **Video Analysis:** `backend/app/detectors/video/detector.py`
- **Audio Analysis:** `backend/app/detectors/audio/detector.py`
- **Text Analysis:** `backend/app/detectors/text/detector.py`

In all four detectors, the `.analyze()` method does not run actual machine learning models. Instead, it generates a hash of the filename and returns static, hardcoded `ForensicSignal`, `EvidenceCard`, and `SuspiciousRegion` objects. They explicitly set `is_demo_analysis=True`.

## 4. Database/Storage Approach

- **Database:** Currently entirely simulated. It uses an in-memory Python dictionary (`INVESTIGATIONS_DB` in `backend/app/forensics/database.py`) pre-loaded with static benchmark cases.
- **File Storage:** Files uploaded to the `/analyze` endpoints are processed synchronously in memory and are discarded. No files are saved to the local disk or cloud storage.
- **Authentication:** None. The application operates in a single-user local environment.

## 5. Current Problems

1.  **Synchronous ML Endpoints:** The `/analyze/*` endpoints are synchronous. While this works for the instant demo responses, real ML inference will block the FastAPI worker and cause timeouts.
2.  **No Persistence:** Any uploaded media or created case is lost when the FastAPI server restarts because it only exists in the `INVESTIGATIONS_DB` memory dictionary.
3.  **Tightly Coupled Routing:** `routes.py` handles all endpoints, making it difficult to scale as we add authentication, users, and case management.
4.  **No State/Auth Management:** The frontend has no mechanism to manage isolated user sessions, tokens, or route protection.

## 6. Recommended Production Architecture

```text
                    ┌──────────────────────┐
                    │      React/Vite      │
                    │     Frontend UI      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI API     │
                    │ Auth / Cases / Jobs  │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌────────────────┐                ┌───────────────┐
       │  PostgreSQL    │                │ Object Storage│
       │ Users / Cases  │                │ S3 / R2 / GCS │
       │ Results / Jobs │                │ Media Files   │
       └────────────────┘                └───────────────┘
                │
                ▼
       ┌────────────────┐
       │ Redis          │
       │ Queue / Cache  │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Celery Workers │
       │ ML Inference   │
       └───────┬────────┘
               │
       ┌───────┼───────────────┐
       ▼       ▼               ▼
    IMAGE    VIDEO           AUDIO/TEXT
    MODEL    MODEL             MODEL
```

## 7. Files That Need Modification

- `backend/requirements.txt` (to add Postgres, Celery, Redis dependencies)
- `backend/app/api/routes.py` (split into modular routers)
- `backend/app/main.py` (register new routers, setup DB lifecycle)
- `backend/app/forensics/database.py` (replace with SQLAlchemy setup)
- `backend/app/detectors/*/detector.py` (adapt interfaces to queue jobs instead of returning instant mock data)
- `frontend/package.json` (add routing/state libraries)
- `frontend/src/App.tsx` (implement actual routing instead of state-based tabs)
- `frontend/src/services/*` (update API calls to handle async job polling)
- `.env.example` (add database, celery, storage, and JWT secrets)

## 8. New Files That Should Be Created

- `backend/app/core/config.py` (Pydantic settings manager)
- `backend/app/core/security.py` (JWT and password hashing logic)
- `backend/app/models/*.py` (SQLAlchemy models for User, Case, MediaFile, etc.)
- `backend/app/api/auth.py`
- `backend/app/api/cases.py`
- `backend/app/api/analysis.py`
- `backend/app/services/storage.py` (S3 abstraction layer)
- `backend/app/workers/celery_app.py`
- `backend/app/workers/tasks.py`
- `backend/alembic/` (Database migrations folder)

## 9. Dependencies That Need to Be Added

**Backend:**

- `sqlalchemy` (Database ORM)
- `alembic` (Database migrations)
- `psycopg2-binary` or `asyncpg` (PostgreSQL adapter)
- `passlib`, `bcrypt`, `python-jose` (Authentication & Security)
- `celery` (Task Queue)
- `redis` (Broker client)
- `boto3` (AWS S3 Storage client)

**Frontend:**

- `react-router-dom` (Declarative routing)
