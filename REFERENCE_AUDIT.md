# REFERENCE_AUDIT.md — Phase 0 Reference Audit

> Scope: publicly observable behavior and presentation of `https://atmos.leeroy.ca/` only.
> No source code, proprietary assets, branding, verbatim copy, or exact animation timings are reproduced here.
> Method and limitations are recorded honestly in §0. Unobservable items are marked as such — nothing is invented.

## 0. Access & Method (limitations record)

- The reference URL was reachable (HTTP 200) on 2026-09-27. Retrieved: the static document shell (raw HTML) and the text content layer.
- **No JavaScript execution and no visual/browser rendering was possible in this environment.** The reference is a WebGL application (fullscreen canvas, behavior driven by script). Therefore the following could **not** be directly observed: rendered frames, animation, camera/aircraft motion, scroll response, color transitions over time, post-processing, audio playback, loading duration, exact timings. Each such item below is marked **UNOBSERVABLE HERE**.
- The third-party awards-listing page for the site returned HTTP 403 (blocked); its displayed color palette could not be read.
- High-level context from the creator's own publicly published project write-up is used sparingly, attributed as such, and kept non-technical. It corroborates structure, never timings or code.
- Verification status: static-structure observations verified via fetch; all dynamic-behavior items remain **unverified pending a real-browser pass** (Playwright/manual, planned before final sign-off).

## 1. Initial loading experience

- The content wrapper starts fully invisible (inline `opacity: 0`, anti-flash class): the user sees a blank page until the app initializes, then the intro appears.
- No active loader markup exists (a numeric loader is present only as disabled markup). The creator publicly confirms the experience is lightweight enough to need no loader.
- **UNOBSERVABLE HERE:** blank-screen duration, reveal easing.

## 2. Page composition

- Single fullscreen page of layers: fullscreen canvas; intro layer with large hero wordmark; dynamically populated subtitle/CTA slots; a scroll hint; an About overlay (explanatory copy, references slot, credits incl. licensed music attribution); an outro layer (closing message + CTA slot); persistent edge controls (About toggle, close button, sound toggle).
- No traditional stacked DOM content sections — journey content lives in the canvas. The document still carries complete metadata (title, description, viewport, theme-color, Open Graph, favicons).

## 3. Intro state

- First visible state: large centered brand wordmark as hero, built from individually wrapped letters (supports a staggered entrance — **timing UNOBSERVABLE, not recorded**), subtitle/CTA populated at runtime, and a hint inviting the user to scroll to begin.
- **UNOBSERVABLE HERE:** intro-to-flight handoff, whether a start click is required, intro duration.

## 4. Scroll behavior

- Scroll is the primary input (the hint frames scrolling as beginning the journey). The creator publicly documents a custom virtual-scroll approach: gestures feed a virtual progress value while the DOM itself does not scroll.
- **UNOBSERVABLE HERE:** smoothing, normalization, exact progress mapping, touch specifics. No timings recorded.

## 5. Aircraft behavior

- Publicly published (creator): a minimalist sky with an aircraft as the central subject; craft and clouds were externally modeled and imported.
- **UNOBSERVABLE HERE:** banking, orientation, idle motion, speed feel. Not invented.

## 6. Path movement

- Publicly published (creator): a visible guiding line runs the full experience, leading start-to-finish, with clouds and text panels positioned along the curve; the camera travels along it.
- Experiential read: one continuous guided trajectory, not discrete screens.
- **UNOBSERVABLE HERE:** path shape, curvature, arc-length feel, line visibility over time.

## 7. Camera movement

- Publicly published (creator): the camera travels the path with position/rotation adjusted to screen aspect ratio so text stays readable (desktop: slight turn toward text; mobile: pulls off-path, closer to text).
- **UNOBSERVABLE HERE:** compositions, FOV, look-ahead, transitions, smoothing. Nothing invented.

## 8. Typography timing

- The intro wordmark's per-letter structure implies staggered entrance (**timings UNOBSERVABLE, not recorded**). The creator publicly states scene text renders inside the 3D scene (WebGL text) with blocks distributed along the route — typography appears progressively with travel.
- Note: our project deliberately diverges — DOM stays the semantic source of truth; decorative 3D text is `aria-hidden`.

## 9. Background transitions

- Browser-chrome theme metadata is a soft periwinkle blue, indicating a light blue-sky identity. The creator publicly describes an enclosing gradient sky surface that travels with the camera — a continuous, seamless backdrop.
- **UNOBSERVABLE HERE:** color progression across the journey; exact palette beyond theme color. No values invented.

## 10. Atmosphere

- Publicly published (creator): airy minimalist sky; wind-like particles become visible on fast scrolling (driven by scroll acceleration), hidden when calm — the environment reacts to input velocity rather than dense scenery.
- **UNOBSERVABLE HERE:** density, fog, particle appearance.

## 11. Cloud-like elements

- Publicly published (creator): authored 3D clouds placed all along the guiding curve as route scenery/framing.
- **UNOBSERVABLE HERE:** style, count, density, parallax. Nothing invented.

## 12. Color / gradient transitions

- Gradient-based sky coloring is publicly stated; only static observable is the theme color. **Progression, palettes, timings UNOBSERVABLE — not invented.**

## 13. Lighting

- **UNOBSERVABLE HERE — inaccessible.** No rendered frames; no public detail. Nothing invented.

## 14. Post-processing

- **UNOBSERVABLE HERE — inaccessible.** No runtime effects observable; project tags mention WebGL plus authoring tools (unverified as runtime effects). No effects asserted.

## 15. Interaction controls

- Observed: About button with roll-over label treatment; close (X) button for the overlay; sound toggle with multi-bar equalizer indicator defaulting to an on appearance; scroll (wheel/trackpad/touch) as primary journey control with virtual (non-DOM) scrolling.
- **Gap found:** no keyboard controls, skip control, or focus behavior present in static markup or testable here. Our spec closes this gap (skip + keyboard + focus management required).

## 16. Audio behavior

- Music is present and credited (licensed pack, attribution linked); toggle defaults to enabled appearance.
- **UNOBSERVABLE HERE:** autoplay handling, fades, mute logic, interaction gating. Not invented.

## 17. Section transitions

- No discrete page sections; one continuous canvas sequence with panels along the route; About works as a modal-style overlay with close control.
- **UNOBSERVABLE HERE:** panel enter/exit, cross-fades, hard cuts. Nothing invented.

## 18. Ending behavior

- Closing message phrased as an airline-style crew sign-off (paraphrased sentiment: thanks for flying, see you again), plus a runtime-populated outro CTA; further farewell/credits in About.
- **UNOBSERVABLE HERE:** final camera composition, reveal mechanics, CTA behavior.

## 19. Responsive behavior (where observable)

- Standard responsive viewport meta present. Creator publicly documents aspect-ratio-derived camera framing with distinct mobile treatment (off-path, closer to text); awards listing shows desktop and mobile presentations.
- **UNOBSERVABLE HERE:** breakpoints, FOV changes, performance scaling, portrait specifics.

## 20. Distinctive pacing principles (to reproduce in original form)

1. One continuous journey on a single normalized scroll-driven progress — no native DOM scroll, no discrete sections; editorial moments occur along a route.
2. A visible narrative spine (guiding line) making abstract progress tangible.
3. Content distributed in space along the route — pacing emerges from travel, not cuts.
4. Backdrop travels with the viewer (enclosing gradient sky) — seamless, never-empty frame.
5. Motion-reactive detail (velocity-driven wind streaks) — calm scenes stay alive, fast input is rewarded.
6. Readability via camera reframing per aspect ratio, not shrunken text.
7. Minimal environment, maximum focus — few authored elements instead of dense scenery.
8. Airline-metaphor UI framing: journey hint, sound toggle, info overlay, crew-style sign-off.
9. Near-zero loading ceremony when the payload is light — hidden-until-ready handoff over a heavy loader.

## 21. Translation into original design decisions for this project

1. Drive everything from a single `targetProgress`/`currentProgress` pair fed by our own normalized wheel/touch/keyboard input; native scroll disabled during the active experience.
2. Give the journey an original narrative spine: a soft particle contrail/ribbon behind the aircraft (not a copied line design).
3. Place all editorial content along the spline via `config/sections.ts` progress ranges — pacing from travel, not section cuts.
4. Build an aspect-ratio-aware `CameraRig`: portrait presets reframe toward text panels, landscape keeps a wider trailing shot (our own offsets/math).
5. Use a camera-attached gradient sky dome with our own shader; palette evolves with progress from configuration.
6. Add velocity-reactive wind-streak particles (opacity from damped progress delta; deterministic seeded placement; instanced geometry).
7. Adopt the airline-metaphor chrome with fully original copy from our content config: hint, equalizer-style sound toggle, About overlay, crew-style sign-off.
8. Keep payloads light: required/optional asset split; hidden-until-ready handoff; no blocking loader for the base experience.
9. Diverge on text: DOM is the semantic source of truth; decorative 3D text is `aria-hidden`; provide skip/text-version control the reference lacks.
10. Close the reference's gaps: full keyboard support, visible focus, `prefers-reduced-motion` mode, and a polished static fallback sharing the same content config.
