# TECHNICAL_DECISIONS.md

Concise record of the project's major technical choices. Updated as phases land.

## Dependency baseline (Phase 1, verified from the npm registry 2026-09-27)

| Package                                                                                                               | Version                                             | Rationale                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `react` / `react-dom` (+ `@types`)                                                                                    | 19.3.0                                              | Stable React 19 generation per spec.                                                                              |
| `@react-three/fiber`                                                                                                  | 9.8.1                                               | Newest stable v9.x (registry `latest` dist-tag); v10 alpha/canary explicitly excluded.                            |
| `@react-three/drei`                                                                                                   | 10.7.9                                              | Stable; peer range requires R3F `^9` + React `^19` — satisfied.                                                   |
| `@react-three/postprocessing`                                                                                         | 3.1.3                                               | Stable v3 line compatible with the R3F v9 stack.                                                                  |
| `three`                                                                                                               | 0.186.1                                             | Required by drei (`>=0.159`) and the fiber/postprocessing stack.                                                  |
| `gsap`                                                                                                                | 3.15.0                                              | DOM/UI animation and easing only — never an independent scene clock.                                              |
| `@fontsource-variable/space-grotesk`, `@fontsource-variable/fraunces`                                                 | 5.3.0                                               | Self-hosted variable fonts (OFL-1.1, verified via registry).                                                      |
| `vite` / `@vitejs/plugin-react`                                                                                       | 8.3.1 / 6.1.1                                       | Stable build toolchain.                                                                                           |
| `typescript`                                                                                                          | 5.9.3                                               | Deliberately the 5.9 line, not the 7.x native-port line (`latest`), for full ESLint/editor tooling compatibility. |
| `eslint` (+ `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) | 10.11.0 / 10.0.1 / 8.70.1 / 7.1.1 / 0.5.7 / 17.12.0 | Current flat-config TypeScript/React setup.                                                                       |
| `prettier`                                                                                                            | 3.9.9                                               | Formatting.                                                                                                       |
| `vitest`                                                                                                              | 5.0.2                                               | Unit tests for pure logic (progress math, interpolation).                                                         |
| `@playwright/test`                                                                                                    | 1.63.0                                              | Minimal deterministic browser smoke suite (Chromium).                                                             |
| Node                                                                                                                  | 24 (`v24.11.1` observed, `.nvmrc` + `engines.node`) | Reproducible LTS baseline; not Node 26.                                                                           |
| `@types/node`                                                                                                         | 26.6.3                                              | Types for Node APIs in config/test files only.                                                                    |

No major-version migration without explicit verification. `package-lock.json` is committed.

## Renderer: WebGL2 via R3F, no WebGPU

Three.js `WebGLRenderer` through React Three Fiber, targeting WebGL2 with
capability detection before init and an immediate static fallback. WebGPU-only
APIs are excluded for broad compatibility with the chosen post-processing
stack. Revisit only as a deliberate future migration.

## Color management (Phase 2)

Three r152+ defaults (sRGB output color space) with `ACESFilmicToneMapping`
at exposure 1.0, set once in `Experience` `onCreated`. DOM overlays author
against the same palette; post-processing (Phase 8) must preserve this chain
and is the only place allowed to revisit it.

The custom sky shader appends `tonemapping_fragment` + `colorspace_fragment`
so uniform colors travel the same pipeline as built-in materials.

Post-processing (Phase 8): only Bloom (sun/bright-cloud glow) and Vignette
(frame focus) — each with a documented purpose; chromatic aberration, DoF, and
motion blur rejected as unjustified cost. HIGH = both, MEDIUM = vignette only,
LOW = direct render. Verified empirically that the composer path tone-matches
the direct path, so no extra ToneMapping effect is needed. DPR caps and
auto-degrade belong to Phase 13, not here.

## Experience state machine (Phase 10)

Single `useExperienceState` hook owns every transition: loading (font gate,
best-effort capped) → ready (user gesture) → intro (first input yields) →
active → ending (auto at 0.985) → completed, with skipped/fallback/error exits
to the same static content. Audio follows the same transitions (fade in on
begin/replay, fade out on skip/ending). GSAP is scoped to DOM overlay
entrances/exits in reverting contexts — never the 3D scene. `?progress=`
boots straight into active for deterministic tests. Experience chunk is
lazy-loaded behind the loading screen.

## StrictMode-safe singletons (Phase 9 lesson)

Root singletons (AudioManager) must survive React 19 StrictMode's
mount-unmount-remount: App's dispose-on-unmount killed audio before any
gesture. The manager now rebuilds its element on next use (`ensureElement`)
instead of dying permanently — verified by a dedicated unit test and a
temporary in-browser configured-audio pass.

## Lint: react-hooks/immutability vs frame loops (Phase 7)

Per-frame mutation of Three.js GPU objects (uniforms, fog, material colors,
opacity) is the idiomatic R3F pattern and cannot satisfy the new
`react-hooks/immutability` rule without per-frame rebuilds. Targeted
`eslint-disable-next-line` suppressions with reasons are used at those sites;
pure logic stays in testable modules so the suppressions never cover decisions.

## Scroll architecture: custom normalized progress, no Lenis

`targetProgress` (0→1) ← user input; `currentProgress` damps toward it in
`useFrame`; the entire scene evaluates from `currentProgress`. Lenis is
excluded: it would add a second progress system with no demonstrated benefit.
Reconsider only with measured evidence, feeding the same model.

## Camera: dedicated progress-driven rig

`CameraRig` is never parented to the aircraft; it interpolates between
configured composition modes (offset, look-at, FOV, strength, range) from
`currentProgress` + section data with a look-ahead point. No snapping.

## Aircraft orientation: configurable forward axis

Placeholder is procedural geometry; a future GLB plugs in via configurable
scale, orientation correction, and forward axis — never a hard-coded axis
assumption; local decoder assets only, no remote CDN.

Orientation math (Phase 3): `setFromUnitVectors(model forward → path
tangent)`, then a model-space Euler correction, then roll about the tangent
for banking; all smoothing exponential and frame-rate independent.
Near-vertical tangents fall back to the last stable up vector. The math lives
in a pure, allocation-free module (`aircraftKinematics.ts`) covered by unit
tests: route-wide continuity (no flips), bank clamp, nose-along-tangent,
flipped forward axis, 180° offset correction, and vertical-path survival.

## Quality tiers: HIGH / MEDIUM / LOW

Pixel-ratio caps, cloud/particle density, shadows, post-processing intensity,
and render-target resolution scale by tier; debug query params override.

## Fallback design

Same content config drives the WebGL DOM typography, the static
HTML fallback, and SEO metadata — no duplicated copy. `?forceFallback=1`
forces the fallback deterministically for tests.

## Asset strategy

Local/self-hosted only, typed manifest with required/optional split; optional
assets never block startup. Licenses verified, never fabricated
(`ASSET_LICENSES.md`).

## Fonts

Two candidates evaluated for an editorial/cinematic/aerospace identity:
**Space Grotesk** (technical grotesk, aerospace instrument character —
default) and **Fraunces** (expressive serif for display/ending moments).
Selectable via configuration; both SIL OFL 1.1, commercial use permitted.

## Deployment base

Vite `base: './'` (relative) so Vercel, Netlify, and GitHub Pages subpaths all
resolve assets correctly.
