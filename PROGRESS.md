# PROGRESS.md

## Phase 0 — Reference Audit — VERIFIED (2026-09-27)

- Verification performed: `https://atmos.leeroy.ca/` fetched (static shell + text layer, HTTP 200); all 21 AGENTS §5 bullets addressed in `REFERENCE_AUDIT.md`; no source/asset/brand/text copied, no timings recorded; access limitations recorded honestly (§0).
- Known issues: no JS execution or visual rendering possible in this environment — aircraft/camera motion, transitions, lighting, post-processing, audio behavior, exact colors/timings are UNOBSERVABLE and were not invented. Third-party listing page blocked (403). A real-browser confirmation pass is recommended before final sign-off.
- Commit: `phase 0: add reference audit`

## Phase 1 — Project Foundation — NOT STARTED
## Phase 2 — WebGL Foundation — NOT STARTED
## Phase 3 — Aircraft — NOT STARTED
## Phase 4 — Progress System — NOT STARTED
## Phase 5 — Camera — NOT STARTED
## Phase 6 — Typography — NOT STARTED
## Phase 7 — Atmosphere — NOT STARTED
## Phase 8 — Post-processing — NOT STARTED
## Phase 9 — Audio — NOT STARTED
## Phase 10 — Loading / Intro / Ending — NOT STARTED
## Phase 11 — Responsive / Mobile — NOT STARTED
## Phase 12 — Accessibility — NOT STARTED
## Phase 13 — Performance — NOT STARTED
## Phase 14 — Testing — NOT STARTED
## Phase 15 — Final Visual Polish — NOT STARTED
## Phase 16 — Deployment / CI — NOT STARTED

## Orchestration notes

- No model-pool config found (`.opencode/orchestrator.md`, user config) → session default model throughout.
- Environment can only dispatch `explore`/`librarian` sub-agents (no `general`/`code-reviewer`/`code-simplifier` mechanics available); implementation therefore proceeds directly in-phase with AGENTS.md as the governing spec, preserving phase order, per-phase verification, per-phase commits, and no-unverified-claims. Research tasks still use sub-agents where read-only (Phase 0 audit via explore task `bg_1437d64a`).
- Node baseline observed: `v24.11.1`. `npm.ps1` is blocked by Windows execution policy — use `npm.cmd`/`npx.cmd`.
