# UI-5: New Investigation Workflow

## Goal
Create a clean, focused entry point for starting a new investigation — replacing the previous behavior where the `+ New Investigation` sidebar button routed directly to the multi-media Case Workspace.

## Entry Point

The `+ New Investigation` button in the left sidebar now navigates to `/new-investigation` instead of `/workspace`.

This is a deliberate UX improvement: users previously landed on the complex Case Workspace (which is a fusion/comparison tool) rather than the logical starting point of choosing a media type.

## Pages & Routes Created

### `NewInvestigationPage.tsx` → `/new-investigation`

A single-purpose media-type selector page. The user sees:

```
New Investigation
Select the type of content you want to investigate.

[ Image  ]  Visual authenticity and manipulation analysis
[ Video  ]  Temporal and deepfake analysis
[ Audio  ]  Acoustic and voice authenticity analysis
[ Text   ]  Stylometric and AI-writing analysis
```

Each card:
- Shows the media type label and a brief 1-line description.
- Shows a 2-line technical detail about what the engine detects (FFT, Wav2Vec2, etc.).
- Navigates directly into the **existing analysis page** (`/image`, `/video`, `/audio`, `/text`) — no new analysis logic was created.
- Has hover effects: accent border, subtle box shadow, and a 3px x-axis nudge.

A secondary link at the bottom allows experienced users to jump directly to the **Cases Workspace** for multi-media evidence fusion.

## Steps 2–4 (Upload, Analyze, Result)

These are handled entirely by the **existing forensic engine pages**:

| Step | Page |
|------|------|
| Step 2 — Input/Upload | `ImageForensicsPage`, `VideoForensicsPage`, `AudioForensicsPage`, `TextStylometryPage` |
| Step 3 — Analyze | `LiveScanAnimation` component + existing `forensicApi.analyzeMedia()` |
| Step 4 — Result | Inline on the same engine page (ScoreMeter, EvidenceCards, WhyThisResultModal) |

No analysis logic was duplicated or replaced. The `NewInvestigationPage` only acts as a routing gateway.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/NewInvestigationPage.tsx` | **Created** — media-type selector page |
| `src/App.tsx` | **Edited** — added `/new-investigation` route and import |
| `src/components/Sidebar.tsx` | **Edited** — `+ New Investigation` button now navigates to `new-investigation` |

## Design Decisions

- **No hero/decorative graphics** — the page is purposefully minimal and functional.
- **Vertical card list** — allows more detail per card than a grid, and scrolls cleanly on mobile.
- **Accent colors per media type** — Image (cyan), Video (sky), Audio (teal), Text (blue) — same colors used in the rest of the app.
- **Theme support** — uses CSS variables (`var(--bg-card)`, `var(--text-main)`, etc.) for Dark/Light/System compatibility.
- **No fake progress steps** — analysis progress (File received → Preparing → Analyzing) is rendered by the existing `LiveScanAnimation` component inside each engine page when a real file is being processed.

## Build Result

`npm run build` completed with exit code 0.
