# PROGRESS.md

## Phase 0 — Reference Audit — VERIFIED (2026-09-27)

- Verification performed: `https://atmos.leeroy.ca/` fetched (static shell + text layer, HTTP 200); all 21 AGENTS §5 bullets addressed in `REFERENCE_AUDIT.md`; no source/asset/brand/text copied, no timings recorded; access limitations recorded honestly (§0).
- Known issues: no JS execution or visual rendering possible in this environment — aircraft/camera motion, transitions, lighting, post-processing, audio behavior, exact colors/timings are UNOBSERVABLE and were not invented. Third-party listing page blocked (403). A real-browser confirmation pass is recommended before final sign-off.
- Commit: `phase 0: add reference audit`

## Phase 1 — Project Foundation — VERIFIED (2026-09-27)

- Verification performed: `npm.cmd install` (240 packages, 0 vulns, `package-lock.json` committed);
  `npm run dev` serves HTTP 200 with `#root` + title; `npm run build` (typecheck + vite) succeeds,
  fonts bundled locally to `dist/assets`; `npm run lint`, `typecheck`, `format:check` clean;
  `npm run test` 5/5 (vitest); `npm run test:e2e` 1/1 (Chromium, no page errors).
  Registry-verified pins: React 19.3.0, R3F 9.8.1 (newest stable 9.x), drei 10.7.9, three 0.186.1,
  TS 5.9.3, Vite 8.3.1, `@types/node` 26.6.3 (added for config files).
- Known issues: none blocking. Playwright browsers installed locally (not committed); CI installs them.
- Commit: `phase 1: add project foundation`

## Phase 2 — WebGL Foundation — VERIFIED (2026-09-27)

- Verification performed: R3F Canvas mounts a visible WebGL canvas with zero page errors (Chromium e2e);
  `?forceFallback=1` renders the static fallback with core content; WebGL2 probe + context-loss →
  fallback recovery wired; `format:check`/`lint`/`typecheck`/`build` clean; unit 9/9; e2e 2/2.
- Known issues: main-bundle chunk-size warning (three.js; code-splitting lands with lazy loading in
  Phase 10); rendered pixels not eyeballed — full visual QA deferred to Phase 15 per plan.
- Commit: `phase 2: add webgl foundation`

## Phase 3 — Aircraft — VERIFIED (2026-09-27)

- Verification performed: unit 24/24 incl. 240-sample continuity (no flips, min quat dot > 0.9995),
  bank clamp, nose-along-tangent, flipped-axis + 180°-offset mapping, vertical-path survival;
  screenshots eyeballed at `?progress=0` (coherent stylized craft on path start, nose along route)
  and `?showPath=1` (debug line exits through the nose, gated correctly); `format`/`lint`/
  `typecheck`/`build` clean; e2e 3/3 with zero page errors.
- Known issues: craft reads small in the static foundation camera — reframed by the camera rig in
  Phase 5; main-bundle chunk warning carries over (code-split in Phase 10).
- Commit: `phase 3: add aircraft and flight path`

## Phase 4 — Progress System — VERIFIED (2026-09-27)

- Verification performed: unit 29/29 (delta-mode normalization, per-event clamp, key map incl.
  Home/End, touch mapping, damping convergence/clamping, background-delta immunity); e2e 6/6 —
  real wheel gestures advance progress with zero page scroll, `End`→100 / `Home`→0 predictably,
  a 100000px synthetic spike settles at ~4% (clamp holds); `format`/`lint`/`typecheck`/`build` clean.
- Known issues: touch verified by mapping unit tests only (no mobile lab here — re-verify in
  Phase 11 viewports); `enabled` gate wired for the Phase 10 state machine.
- Commit: `phase 4: add progress input system`

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
