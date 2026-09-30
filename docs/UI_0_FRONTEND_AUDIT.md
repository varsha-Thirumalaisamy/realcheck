# REALCHECK AI — Phase UI-0: Frontend Audit

## 1. Current Architecture
*   **Framework:** React 18 single-page application built with Vite. No meta-frameworks like Next.js are in use.
*   **Routing:** No dedicated routing library (like `react-router-dom`). Navigation is handled manually via conditional rendering in `App.tsx` using a local `currentTab` state variable.
*   **State Management:** Local React state (`useState`, `useEffect`). Global state like `currentTab` and `activeCaseId` are hoisted to `App.tsx` and passed down via prop drilling.
*   **API Integration:** Centralized in `src/services/api.ts`. Currently, the API layer acts heavily as a mock/fallback system. If the backend doesn't respond or times out, it gracefully falls back to synthetic benchmark cases defined in memory.
*   **Authentication:** Currently non-existent. There is no login flow, session management, or access control.

## 2. Current Components
The `src/components/` directory contains highly stylized UI pieces:
*   `AuthenticityCore.tsx`
*   `CommandPalette.tsx`
*   `EvidenceCardComponent.tsx`
*   `Footer.tsx`
*   `Header.tsx`
*   `LiveScanAnimation.tsx`
*   `ScoreMeter.tsx`
*   `WhyThisResultModal.tsx`

## 3. Current Routes (Tabs)
As real URLs are not currently implemented, these exist as tab states:
*   `overview` (OverviewPage)
*   `image` (ImageForensicsPage)
*   `video` (VideoForensicsPage)
*   `audio` (AudioForensicsPage)
*   `text` (TextStylometryPage)
*   `workspace` (InvestigationWorkspacePage)
*   `ai-hub` (CentralizedAiHubPage)
*   `models` (ModelInsightsPage)
*   `reports` (ForensicReportsPage)
*   `about` (ArchitectureAboutPage)

## 4. Current Design System
*   **Styling Approach:** A mix of global CSS (`index.css`, `App.css`) and heavy use of inline React styles (`style={{ ... }}`). Tailwind CSS is **not** currently used.
*   **Aesthetic:** "Cyberpunk / Deep Forensics". Features a dark color palette with neon accents.
*   **Colors:** Deep background (`#060911`), Cyan primary (`#00f0ff`), Soft blue (`#38bdf8`), and standard traffic light colors for risk (Red/Amber/Green).
*   **Typography:** 'Outfit' for sans-serif and 'JetBrains Mono' for monospaced data displays.
*   **Effects:** Glassmorphism (`backdrop-filter: blur`), CSS animations (radar sweeps, scanner lasers, pulsing nodes).
*   **Theming:** Hard-coded dark mode. There is no light theme support.

## 5. Existing Reusable Components
*   `Header` and `Footer`: Global layout wrappers.
*   `CommandPalette`: A global Cmd+K search interface.
*   `ScoreMeter`: The circular SVG radial progress bar used to display authenticity scores.
*   `EvidenceCardComponent` & `WhyThisResultModal`: Reusable display blocks for forensic indicators.

## 6. Problems That Genuinely Need Fixing
*   **Hard-Coded / Demo Values:** Values like `RC-2026-0042`, `23/100`, and `91% confidence` are statically defined in `src/data/sampleCases.ts`. `App.tsx` hard-codes the initial state to `RC-2026-0042`. New analyses generated in `api.ts` often just copy these static templates and assign a random case ID.
*   **Lack of Routing:** The current `switch(currentTab)` setup breaks browser history (the back button) and prevents deep linking/URL sharing.
*   **Prop Drilling:** Passing `onNavigate` and `onSelectCase` through multiple layers of components is brittle and difficult to maintain.
*   **Inline Styles:** The heavy reliance on inline styles makes responsive design and media queries extremely difficult to manage cleanly.
*   **Missing Authentication:** As an enterprise platform, the lack of auth is a critical missing piece.

## 7. Things That Are Already Working and Must Be Preserved
*   **The Visual Aesthetic:** The dark, glowing, cyber-forensic look is striking and fits the product perfectly.
*   **Component Structure:** The separation of concerns between media-specific pages (Image, Video, Audio, Text) is logical.
*   **Custom Animations:** The `LiveScanAnimation` and `ScoreMeter` SVG animations are high-quality and shouldn't be discarded.
*   **Fallback Mechanism Design:** While the fake data needs to be phased out for real production use, having a resilient frontend that doesn't crash when the API times out is a good pattern.

## 8. Recommended Changes in Priority Order
1.  **Implement Real Routing:** Introduce `react-router-dom` to support actual URLs (e.g., `/case/RC-2026-0042`), enabling deep linking and browser navigation.
2.  **Centralize State:** Use React Context (or a lightweight library like Zustand) for global state (like active case, current user, theme) to eliminate prop drilling.
3.  **Authentication UI:** Add a login screen and protected routes.
4.  **Backend Integration Cleanup:** Update `api.ts` to fetch real dynamic data from the backend rather than intercepting calls to serve `SAMPLE_CASES`, or explicitly toggle a "Demo Mode".
5.  **Styling Refactor:** Gradually migrate inline styles to a standard system (CSS Modules or Tailwind CSS) to improve responsiveness and maintainability, and potentially add Light Mode support.

## 9. Files Likely to Require Modification
*   `src/App.tsx` (Complete rewrite for Router/Context Provider)
*   `src/services/api.ts` (Removing/isolating mock data logic)
*   `src/data/sampleCases.ts` (Deprecating or moving to a test suite)
*   All `src/pages/*.tsx` (Removing navigation props, using Router hooks instead)
*   `src/components/Header.tsx` (Updating navigation links)
*   `package.json` (Adding router/state dependencies)
