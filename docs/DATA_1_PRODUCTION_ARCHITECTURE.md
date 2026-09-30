# DATA-1 PRODUCTION ARCHITECTURE AUDIT

This document maps the complete end-to-end data flow for REALCHECK AI, evaluating the integrity of the analysis pipeline from user upload to frontend report.

## The Analysis Pipeline Flow
1. **USER UPLOAD**: The frontend successfully packages the file and transmits it via `multipart/form-data` to the FastAPI backend.
2. **API**: `app/api/analysis.py` catches the file. If a `sample_id` (demo button) was provided, it immediately aborts and returns the cached mock data from `database.py`.
3. **FILE STORAGE**: If it's a real upload, temporary files are created (e.g. `tempfile.mkstemp` for Audio), or the filename is passed down.
4. **DETECTOR**: The file is passed to `detector.analyze()`. **[FAILURE POINT]** The detectors ignore the file content completely.
5. **FORENSIC ENGINE**: No live ML models, signal processing, or neural networks are loaded or invoked.
6. **RESULT**: The detector generates a highly realistic, hard-coded Pydantic schema (`InvestigationResult`) and generates a random case ID (`RC-2026-XXXX`).
7. **DATABASE**: The mock result is injected into the in-memory dictionary `INVESTIGATIONS_DB`.
8. **FRONTEND**: The frontend correctly and dynamically renders this payload via React components.

---

## Media Type Classifications

### IMAGE
- **Upload**: REAL / DEMO (Bypassed if demo button used).
- **Detection**: DEMO (Returns static Vision Transformer mock data).
- **Result persistence**: DEMO (In-memory dict).
- **Frontend**: REAL (Dynamic React components).

### VIDEO
- **Upload**: REAL / DEMO.
- **Detection**: DEMO (Returns static Landmark RNN mock data).
- **Result persistence**: DEMO.
- **Frontend**: REAL.

### AUDIO
- **Upload**: REAL / DEMO.
- **Detection**: DEMO (Returns static Voiceprint mock data).
- **Result persistence**: DEMO.
- **Frontend**: REAL.

### TEXT
- **Upload**: REAL / DEMO.
- **Detection**: DEMO (Returns static stylometry mock data).
- **Result persistence**: DEMO.
- **Frontend**: REAL.

---

## Action Plan (Architecture Transition)

### A. What can be safely reused
- **Frontend UI & Components**: The React layer is production-ready. It flawlessly handles state, loading, and dynamic rendering of complex forensic structures.
- **API Router Structure**: The FastAPI endpoint definitions (`/analyze/image`, etc.) are well-formed.
- **Pydantic Schemas**: `InvestigationResult`, `ForensicSignal`, etc., are excellent, robust schemas.
- **Celery Infrastructure**: The background worker setup is valid for handling long-running ML tasks.

### B. What must be replaced
- **`detector.py` implementations**: All four detectors must be rewritten to load actual models (e.g., PyTorch, librosa, OpenCV) and process the raw bytes of the uploaded files.
- **Persistence Layer**: The `INVESTIGATIONS_DB` in-memory dictionary must be fully replaced by the newly created SQLAlchemy `Investigation` model backed by SQLite/PostgreSQL.

### C. What should remain as test/demo infrastructure
- `database.py` and `sampleCases.ts` should be preserved for E2E testing, CI/CD pipelines, and demonstrative onboarding for new users.

### D. What should NOT be changed yet
- Do not modify the frontend UI, sidebars, routing, or user-facing components. 

### Clarification on "Detectors"
**Important Note:** The current detectors (`app/detectors/*`) perform **NO REAL COMPUTATION** and do not utilize any **VALIDATED DETECTION MODEL**. They exclusively return **DEMO/MOCK DATA**. Future implementation tickets (DATA-2, DATA-3) will require implementing genuine signal processing and deep learning inference.
