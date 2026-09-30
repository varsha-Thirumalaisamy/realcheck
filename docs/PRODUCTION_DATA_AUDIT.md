# REALCHECK AI — PRODUCTION DATA AUDIT

This document catalogues every user-facing value within the application, classifying its origin (Backend, Computed, Hard-coded, or Demo Seed) to trace data integrity and identify areas requiring dynamic replacement for production.

---

## 1. Dashboard & Workspace (Global)

### `OverviewPage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **Total Cases** (`recentCases.length`) | `forensicApi.getInvestigations()` | Seeded Backend | Yes (Reads dynamic array) | None. |
| **Completed** (`completedCases`) | `recentCases.length` | Computed Frontend | No | Backend must provide a `status` field per case instead of assuming all are completed. |
| **Review Required** | `filter(score <= 30)` | Computed Frontend | No | Move threshold logic to the backend (e.g. `case.requires_review`). |
| **Processing** (`'0'`) | Inline string | Hard-coded | No | Map to backend `Processing` status count. |

### `InvestigationWorkspacePage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **Case List (ID, Filename, Score)** | `forensicApi.getInvestigations()` | Seeded Backend | Yes | None. |
| **Status Badge** (`deriveStatus()`) | Computed from `risk_level` | Computed Frontend | No | Use actual backend status (e.g., `Processing`, `Review`, `Completed`). |
| **Investigation Notes** | `"Automated intake completed..."` | Hard-coded | No | Fetch analyst notes or automated audit trails from the API. |

---

## 2. Forensic Analysis Engines

### `ImageForensicsPage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **`initialCaseId`** | `'RC-2026-0042'` | Demo/Seed | No | Remove default binding; fetch from URL param (e.g. `/:caseId`) or user session. |
| **Demo Switchers** | `'RC-2026-0042', 'RC-2026-0046'` | Hard-coded | No | Remove demo buttons in production; load only the requested file/case. |
| **Analysis Signals & Scores** | `currentCase` (Backend) | Seeded Backend | Yes | None (Data is accurately bound to the API response). |

### `VideoForensicsPage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **`initialCaseId`** | `'RC-2026-0043'` | Demo/Seed | No | Same as Image Engine. |
| **Timeline Segments** | `currentCase.suspicious_segments` | Seeded Backend | Yes | None. |
| **Demo Switchers** | `'RC-2026-0043', 'RC-2026-0047'` | Hard-coded | No | Remove demo buttons. |

### `AudioForensicsPage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **`initialCaseId`** | `'RC-2026-0044'` | Demo/Seed | No | Same as Image Engine. |
| **Spectrogram / Waveform Viewer** | Local File (Blob) / Demo Mock | Hard-coded UX | No | Render actual binary buffer from the API if no local file is uploaded. |

### `TextStylometryPage.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **`initialCaseId`** | `'RC-2026-0045'` | Demo/Seed | No | Same as Image Engine. |
| **Lexical Metrics (Burstiness, etc.)**| `currentCase.text_metrics` | Seeded Backend | Yes | None. |

---

## 3. UI Components & Shell

### `CommandPalette.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **Quick Nav Actions** | `'RC-2026-0042'`, etc. | Hard-coded | No | Populate quick nav with genuinely "Recent" or "Starred" cases from user context. |
| **Search Placeholder** | `"Search... 'RC-2026-0042'"` | Hard-coded | No | Keep as a placeholder format hint, but decouple from literal case IDs. |

### `ScoreMeter.tsx` & `EvidenceCardComponent.tsx`
| Displayed Value | Source | Classification | Production-Safe? | Recommended Change |
|----------------|--------|----------------|------------------|--------------------|
| **Authenticity Score / Confidence** | `props` -> Backend | Seeded Backend | Yes | Fully dynamic. Safe for production. |
| **Risk / Explanations** | `props` -> Backend | Seeded Backend | Yes | Fully dynamic. Safe for production. |

---

## Backend Context (`backend/app/forensics/database.py`)

All primary forensic results returned by the API (`/investigations`) are sourced from an in-memory dictionary (`INVESTIGATIONS_DB`) inside the backend. 
- **Scores, Explanations, Regions, and Probabilities** are meticulously seeded to simulate distinct forensic scenarios (Authentic, Deepfake, Voice Clone, AI-Assisted).
- **Result:** The frontend components (ScoreMeters, Evidence Cards, Timelines) are correctly built to read dynamic API data, but the API itself is returning static seeds.

### Misleading "Real" Forensic UX
Because the seeded backend data is highly detailed (e.g., precise `suspicious_regions` coordinates, `signal_variance_spread`, exact `ai_generation_probability` decimals), the UI **could mislead users into believing a live ML model just processed their specific file**, when in reality, if they click a demo button, it loads a pre-determined static JSON payload. 

**To transition to production:** The backend models (`detectors/`) must actively populate the `InvestigationResult` schema for uploaded files instead of relying on `database.py` seeds.
