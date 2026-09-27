# Meridian — A Cinematic Flight Study

An **original** immersive 3D website: one continuous flight through a procedural sky,
driven by scroll. Inspired by the interaction principles of scroll-driven aerial
experiences, built from scratch — no reference source, assets, or copy are used.

## Technology stack

TypeScript · React 19 · Vite · Three.js (WebGL2 via React Three Fiber v9) ·
`@react-three/drei` · `@react-three/postprocessing` · GSAP · CSS ·
self-hosted fonts (`@fontsource`) · Playwright smoke tests · ESLint · Prettier.

No backend, database, auth, or CSS/state framework. The app runs entirely in the
browser and builds to static files.

## Requirements

- Node.js 24 LTS (pinned via `.nvmrc` and `engines.node`; check with
  `node --version`). Manage versions with [nvm](https://github.com/nvm-sh/nvm)
  (`nvm use`) or fnm.
- npm (ships with Node).

## Installation

```bash
npm ci
npx playwright install chromium   # one-time, for the e2e smoke tests
```

## Scripts

| Script                 | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Local dev server                                |
| `npm run build`        | Typecheck + production build to `dist/`         |
| `npm run preview`      | Preview the production build locally            |
| `npm run lint`         | ESLint                                          |
| `npm run typecheck`    | `tsc --noEmit`                                  |
| `npm run format`       | Prettier write                                  |
| `npm run format:check` | Prettier check                                  |
| `npm run test`         | Unit tests (Vitest)                             |
| `npm run test:e2e`     | Browser smoke tests (Playwright, Chromium)      |
| `npm run check`        | `format:check` + `lint` + `typecheck` + `build` |

## Development

```bash
npm run dev
```

Progress is tracked per phase in `PROGRESS.md`. Do not mark a phase VERIFIED
unless its verification steps actually ran. Key specs: `AGENTS.md` (primary
technical specification), `REFERENCE_AUDIT.md` (reference observations and the
original design decisions derived from them), `TECHNICAL_DECISIONS.md`,
`ASSET_LICENSES.md`.

## Architecture

```
src/
  App.tsx                 # experience shell (state machine lands here)
  config/                 # site metadata, content copy, scene/sections (single source of truth)
  components/             # loading / start / end / overlay / fallback UI
  experience/             # R3F scene: aircraft, flight path, camera rig, atmosphere, effects
  animation/              # targetProgress → currentProgress model, interpolation
  hooks/                  # scroll progress, responsive, state, reduced motion, visibility
  audio/                  # AudioManager (optional-asset safe)
  renderer/               # WebGL2 detection, quality tiers
  shaders/                # gradient / atmosphere GLSL
  styles/                 # globals, accessibility
  utils/                  # pure helpers + unit tests
e2e/                      # Playwright smoke tests
```

One rule governs all animation: user input changes `targetProgress` (0→1),
`currentProgress` smoothly follows it, and the whole scene (camera, aircraft,
lighting, atmosphere, typography, effects) is evaluated from
`currentProgress`. No independent timelines fight over the same property.

## Assets & licensing

All non-original assets are listed in `ASSET_LICENSES.md` with source, exact
license, attribution, local path, and commercial-use status. Currently:
two self-hosted variable fonts (SIL OFL 1.1). No runtime CDN assets; the
aircraft starts as procedural placeholder geometry.

## Performance strategy

HIGH / MEDIUM / LOW quality tiers (pixel-ratio caps, cloud/particle density,
shadows, post-processing), object reuse in frame loops, disposal of GPU
resources, and a `?debug=1` overlay (FPS, progress, state, section, quality,
DPR, renderer stats).

## Debug modes (testing only, never production UI)

- `?debug=1` — performance overlay
- `?forceFallback=1` — static fallback even with WebGL2
- `?reducedMotion=1` — reduced-motion behavior
- `?showPath=1` — flight-path visualization
- `?quality=low|medium|high` — quality tier override

## Testing

```bash
npm run test      # unit tests
npm run test:e2e  # Playwright smoke tests (Chromium)
```

Smoke tests cover: page load, loader resolution, no uncaught errors, WebGL
init when available, scroll/keyboard progress changes, forced fallback content,
reduced motion, and no horizontal overflow at supported viewports.

## Deployment

Static build (`vite build` → `dist/`). Target: Vercel; also Netlify / GitHub
Pages compatible. The Vite `base` is relative (`'./'`) so subpath hosting
works; all asset URLs must respect the configured base — never hard-code
absolute `/assets/...` paths. Steps: `npm ci && npm run check`, deploy `dist/`.

## Known limitations

- Phase 0 audit: dynamic reference behaviors (motion, timings, lighting,
  post-processing, audio) could not be observed without browser rendering and
  were not invented — a browser confirmation pass is recommended.
- See `PROGRESS.md` for per-phase status and open issues.
