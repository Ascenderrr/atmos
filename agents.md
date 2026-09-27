You are an expert frontend/WebGL engineer specializing in React, Three.js, React Three Fiber, GSAP, performance optimization, accessibility, and high-end interactive award-style websites.

Your task is to build a production-quality immersive 3D website inspired by the interaction style and visual experience of:

https://atmos.leeroy.ca/

The reference is used to study interaction patterns, pacing, composition, atmosphere, and technical ideas only.

The finished website must be an ORIGINAL implementation.

==================================================
0. NON-NEGOTIABLE PRINCIPLES
============================

1. Do not copy the original site's source code.
2. Do not copy proprietary assets.
3. Do not copy the original site's branding, identity, or exact visual assets.
4. Do not copy substantial text/content from the reference.
5. Do not fabricate asset URLs, licenses, or package information.
6. Do not claim that something was tested unless you actually tested it.
7. Do not declare the project complete merely because it builds.
8. Do not introduce a backend unless a later requirement explicitly requires one.
9. Prefer deterministic, maintainable engineering over unnecessary cleverness.
10. Keep the architecture simple enough that another developer can easily modify the flight path, typography, colors, timings, and assets.
11. Never allow multiple independent systems to fight over the same animation property.
12. Never let an optional asset prevent the site from becoming usable.
13. Do not stop the implementation because an optional design decision is unresolved; use a sensible configurable default and document it.
14. If the reference site cannot be accessed in your current environment, do NOT invent observations. Record the limitation in `REFERENCE_AUDIT.md` and continue using the requirements in this prompt.

The result should feel like an original premium interactive WebGL experience, not a generic Three.js demo.

==================================================

1. TECHNOLOGY STACK
   ==================================================

Use:

* TypeScript
* React
* Vite
* Three.js
* React Three Fiber
* @react-three/drei
* @react-three/postprocessing
* GSAP
* CSS
* @fontsource for self-hosted fonts
* Playwright for a minimal browser smoke-test suite
* ESLint
* Prettier

Do NOT introduce:

* a backend
* a database
* Express
* PostgreSQL
* MongoDB
* GraphQL
* authentication
* Next.js

unless a concrete future requirement genuinely makes one necessary.

The application should primarily run entirely in the browser and produce a static Vite build.

Do not add a CSS framework or state-management library unless a concrete problem requires one.

==================================================
2. DEPENDENCY STABILITY
=======================

Use mutually compatible stable dependency versions.

For the initial implementation:

* Use the stable React 19 generation.
* Use the stable React Three Fiber v9.x line.
* Do not use React Three Fiber v10 alpha/canary releases.
* Do not use alpha/canary/prerelease versions of core rendering dependencies.
* Use the newest stable v9.x release available when the project is initialized, after verifying it from the official package registry.
* Verify the exact installed versions rather than trusting model knowledge or an old tutorial.
* Commit the resulting package-lock.json.

If a newer major release becomes stable later, do not migrate automatically during this project.

Only change major versions when compatibility has been explicitly verified and the project benefits from the migration.

Record the dependency decision in `TECHNICAL_DECISIONS.md`.

==================================================
3. TOOLING & ENVIRONMENT
========================

Use Node.js 24 LTS as the reproducible project baseline.

Do not switch to Node 26 merely because it is newer.

Pin Node 24 using:

* `.nvmrc`
* and/or `engines.node` in package.json

Use npm.

Required scripts:

* npm run dev
* npm run build
* npm run preview
* npm run lint
* npm run typecheck
* npm run format
* npm run format:check
* npm run test
* npm run test:e2e
* npm run check

`npm run check` should run the project's formatting check, lint, typecheck, and production build.

Configure:

* ESLint using a standard current TypeScript/React configuration
* Prettier
* `.gitignore`
* `.nvmrc`
* package.json engines
* Playwright configuration

Do not invent a large custom style guide.

==================================================
4. PRIMARY RENDERER
===================

Use Three.js WebGLRenderer through React Three Fiber.

Target WebGL 2.

Do not use WebGPURenderer or WebGPU-only APIs for the initial implementation.

This is a deliberate compatibility decision, not a claim that WebGPU is permanently unsuitable.

The project should prioritize reliable broad browser compatibility and compatibility with the chosen R3F/WebGL post-processing stack.

Revisit WebGPU only in a future deliberate migration.

Use Three.js WebGL2 capability detection before initializing the main experience.

If WebGL2 is unavailable, immediately use the static HTML/CSS fallback.

Do not create a canvas and then leave the user with a broken blank screen.

==================================================
5. REFERENCE AUDIT
==================

Before writing application code, inspect:

https://atmos.leeroy.ca/

Create:

`REFERENCE_AUDIT.md`

The audit must contain only publicly observable behavior and presentation.

Analyze:

* initial loading experience
* page composition
* intro state
* scroll behavior
* aircraft behavior
* path movement
* camera movement
* typography timing
* background transitions
* atmosphere
* cloud-like elements
* color/gradient transitions
* lighting
* post-processing
* interaction controls
* audio behavior
* section transitions
* ending behavior
* responsive behavior where observable
* any distinctive pacing principles worth reproducing in an original form

Do NOT:

* reproduce source code
* reverse-engineer proprietary implementation details
* copy original assets
* copy branding
* copy exact site text
* copy exact animation timings merely because they can be observed

The audit should describe what the user experiences, not attempt to recreate the original site's private implementation.

The audit must then be translated into original design decisions for this project.

==================================================
6. ASSET STRATEGY
=================

No runtime external asset URLs by default.

Prefer local/self-hosted assets.

Do not depend on remote CDN models, fonts, textures, or audio unless explicitly approved.

Create:

`ASSET_LICENSES.md`

Every non-original asset must be documented there with:

* asset name
* source
* exact license
* attribution requirements
* local file path
* whether commercial use is permitted

Do not claim an asset is CC0/CC-BY/etc. without verifying it.

---

## 6A. Aircraft

The initial aircraft must be a procedural/parametric placeholder built from Three.js geometry.

Use a visually coherent stylized aircraft rather than a pile of unrelated primitives.

The placeholder should contain:

* fuselage
* main wings
* tail
* vertical stabilizer
* optional cockpit/nose geometry

Keep the geometry simple enough to render efficiently.

Build the architecture so a real GLTF/GLB model can later replace the placeholder without changing the flight system.

The aircraft model implementation must support:

* placeholder mode
* GLTF/GLB mode
* configurable scale
* configurable orientation correction
* configurable forward axis

Never hard-code the assumption that a future GLTF uses +Z, -Z, +X, etc. as its forward direction.

Provide a configurable model orientation correction so imported assets can be aligned cleanly.

If a real aircraft asset is later sourced, verify and document its license first.

If GLTF compression is used:

* keep decoder assets local
* do not require a remote decoder CDN
* document the compression pipeline

---

## 6B. Audio

Audio is optional.

The application must work perfectly with zero audio files.

Create an AudioManager that supports:

* music loading
* play/pause
* mute/unmute
* volume
* fade in
* fade out
* cleanup
* failure recovery

When no audio asset is configured:

* do not show an enabled mute/unmute control
* either hide the control or render it disabled
* the rest of the application must work normally

Audio must only begin after valid user interaction where browser autoplay policies require that.

Never assume unmuted autoplay works everywhere.

If music is sourced externally:

* verify license
* document it in ASSET_LICENSES.md
* store the file locally

---

## 6C. Fonts

Use self-hosted fonts through @fontsource or local files.

Do not use a runtime Google Fonts CDN request.

Choose two candidate typefaces appropriate for an editorial/cinematic/aerospace visual identity.

Document why each was considered.

Choose one as the initial default.

Make the chosen font configurable.

Store font licensing information in ASSET_LICENSES.md.

==================================================
7. CONTENT MODEL
================

Do not use copied Atmos content.

Create original temporary placeholder content.

All visible text must be configurable.

Create a content/config structure similar to:

* site title
* hero title
* section titles
* section descriptions
* CTA/instruction text
* ending message

The placeholder copy should clearly be replaceable later.

Do not scatter strings across components.

The same content configuration must be usable by:

* WebGL experience
* DOM typography
* accessibility fallback
* no-WebGL fallback
* SEO metadata where appropriate

==================================================
8. EXPERIENCE STATE MACHINE
===========================

Do not represent the entire application using scattered booleans.

Use a clear experience state model.

Suggested states:

* LOADING
* READY
* INTRO
* ACTIVE
* ENDING
* COMPLETED
* SKIPPED
* FALLBACK
* ERROR

The exact implementation can vary, but state transitions must be explicit.

Example conceptual flow:

LOADING
↓
READY
↓
INTRO
↓
ACTIVE
↓
ENDING
↓
COMPLETED

Alternative paths:

READY → SKIPPED
ACTIVE → SKIPPED
ANY STATE → FALLBACK
ANY ERROR → FALLBACK or ERROR

The state machine must make these transitions deterministic.

Do not allow the loading state, intro timeline, scroll controller, and ending transition to independently manipulate the same scene without coordination.

==================================================
9. CORE EXPERIENCE
==================

Create a full-screen cinematic WebGL journey.

The user should feel like they are moving through one continuous world.

The experience should not feel like:

"section 1 → hard cut → section 2 → hard cut → section 3"

Instead it should feel like one continuous flight with editorial moments occurring naturally along the journey.

Use:

targetProgress: 0 → 1
currentProgress: 0 → 1

User input changes targetProgress.

currentProgress smoothly follows targetProgress.

All major animation derives from currentProgress.

==================================================
10. SINGLE SOURCE OF TRUTH FOR ANIMATION
========================================

`currentProgress` is the authoritative source of truth for the cinematic scene.

The flow must always be:

USER INPUT
↓
targetProgress
↓
smoothed currentProgress
↓
scene evaluation
↓
camera
aircraft
lighting
atmosphere
3D typography
effects

Do NOT create independent animation clocks for major 3D scene properties.

For example:

BAD:

scroll → camera
GSAP → camera
useFrame → camera

GOOD:

scroll → targetProgress
targetProgress → currentProgress
currentProgress → camera evaluation

Use R3F `useFrame` for continuous scene evaluation.

Use GSAP primarily for:

* DOM animation
* UI transitions
* reusable easing
* non-scene cinematic DOM sequences

Do not run an independent GSAP timeline that fights the 3D scene.

If GSAP is used for a scene-related value, it must be driven by the same normalized progress model.

Do not use React state for values that change every frame.

Use refs, mutable values, or equivalent high-performance mechanisms for per-frame animation.

For React DOM animations, use appropriate GSAP cleanup mechanisms such as `gsap.context()` / `useGSAP()` where appropriate.

==================================================
11. SCROLL / INPUT SYSTEM
=========================

Do not use Lenis in the initial implementation.

The project already owns a custom normalized experience-progress system.

Only introduce Lenis later if testing demonstrates a concrete benefit.

If Lenis is introduced:

* it must not create a second independent progress system
* it must ultimately feed the same targetProgress/currentProgress model
* it must not conflict with keyboard/touch handling

---

## 11A. Desktop

Support:

* mouse wheel
* trackpad

Normalize wheel input properly.

Account for differing wheel delta modes and unusually large wheel events.

Clamp extreme wheel deltas.

Do not let one accidental wheel event jump from the beginning to the end.

---

## 11B. Touch

Support:

* touch swipe
* coarse pointer devices

Use pointer/touch events appropriately.

Do not allow unwanted browser page scrolling while the cinematic experience is active.

---

## 11C. Keyboard

Support keyboard interaction.

At minimum:

* ArrowDown / ArrowUp
* PageDown / PageUp
* Home
* End

Do not trap keyboard focus unnecessarily.

Users must always have a way to reach the static content/fallback.

---

## 11D. Skip

Provide a visible and keyboard-accessible:

"Skip animation"

or

"View text version"

control.

When activated:

* stop/cancel the active cinematic experience
* stop scroll interception
* restore normal document scrolling
* show the normal static/accessible version
* move focus appropriately
* do not leave hidden animation elements in the keyboard order

This is not optional.

==================================================
12. REDUCED MOTION
==================

Respect:

`prefers-reduced-motion`

Reduced-motion mode should:

* drastically reduce or disable cinematic movement
* avoid aggressive camera motion
* reduce aircraft banking
* reduce fades/scale effects where practical
* avoid excessive post-processing animation
* prefer simple section transitions

The user must still receive all content.

Do not make reduced-motion mode unusable.

For users requesting reduced motion, standard accessible HTML content should remain available.

==================================================
13. FLIGHT PATH
===============

Create a long cinematic flight route.

Use:

`THREE.CatmullRomCurve3`

or another mathematically appropriate spline.

The path should:

* curve vertically
* curve horizontally
* change direction gradually
* include cinematic turns
* contain varied sections
* avoid mechanically straight movement

Make the control points configurable.

Store them in configuration rather than inside a component.

Use curve evaluation based on normalized progress.

Prefer arc-length-aware evaluation so movement speed feels consistent along the path.

Avoid creating uneven speed caused by control-point spacing alone.

Create a debug mode where the path can optionally be visualized.

Keep the path visualization disabled in normal production mode.

==================================================
14. AIRCRAFT MOVEMENT
=====================

The aircraft must move along the flight path.

Use the spline position and tangent to determine:

* position
* forward direction
* orientation

The aircraft must not simply move between points while remaining visually unrotated.

Use vectors/quaternions correctly.

Avoid:

* sudden 180° flips
* gimbal-lock-like behavior
* unstable roll
* jitter at near-vertical tangents

Implement natural banking.

Banking should be based on the path's change in direction/curvature and be:

* configurable
* clamped
* smoothed

Suggested configuration:

* maxBankAngle
* bankSmoothing
* positionSmoothing
* orientationSmoothing
* lookAheadDistance
* aircraftScale
* forwardAxis
* modelRotationOffset

The aircraft should have subtle idle movement that is independent of user scrolling but remains deterministic and low amplitude.

Use delta-time so idle animation is frame-rate independent.

==================================================
15. CAMERA SYSTEM
=================

Create a dedicated:

`CameraRig`

Do not parent the camera directly to the aircraft.

The camera should be influenced by:

* aircraft position
* aircraft direction
* flight path tangent
* look-ahead position
* configured camera offset
* currentProgress
* cinematic section data

Use smooth interpolation/damping.

Create several camera compositions, for example:

* trailing chase view
* slightly elevated view
* side profile
* wider cinematic shot
* close immersive shot
* final stabilized composition

The camera must be progress-driven.

Use a configurable look-ahead point so the camera anticipates the aircraft's direction rather than constantly staring at its exact current position.

Avoid camera snapping between sections.

Each camera mode should define:

* position offset
* look-at offset
* FOV
* interpolation strength
* transition range

Interpolate between modes instead of switching abruptly.

==================================================
16. ATMOSPHERE
==============

Build an atmospheric environment using a combination of:

* animated gradient
* procedural shader effects
* fog
* clouds or cloud-like geometry
* lighting
* subtle noise
* atmospheric color changes
* optional particles where performance permits

The environment should feel alive even when the user stops scrolling.

Do not rely on a single static background image.

The color palette should evolve with progress.

Make colors configurable.

Prefer shaders for large full-screen atmospheric effects when they are more efficient than thousands of DOM or mesh elements.

Use deterministic seeds for procedural placement.

Do not call unseeded `Math.random()` during every render frame.

==================================================
17. LIGHTING & COLOR MANAGEMENT
===============================

Use a deliberate color-management strategy.

Keep texture color spaces correct.

Use an appropriate output color space for the browser display.

Choose tone mapping intentionally and document the choice.

Do not mix inconsistent color spaces across:

* textures
* materials
* shaders
* post-processing
* DOM overlays

The visual output should be consistent between development and production.

==================================================
18. TYPOGRAPHY
==============

Typography is a major part of the visual identity.

Use large editorial typography.

Keep important text accessible in the DOM.

3D typography may be used where it adds visual value.

Important accessibility rule:

If a 3D text element exists only as a decorative visual representation of DOM text, mark the decorative 3D version as `aria-hidden="true"`.

Do not expose the same headline twice to screen readers.

DOM text should remain the semantic source of truth.

Typography animation may include:

* fade
* slide
* scale
* depth movement
* opacity
* letter/word spacing
* subtle blur-like transitions
* controlled clipping/masking

Do not overuse effects.

Text should appear at intentional progress ranges.

Keep all typography content and timing configurable.

==================================================
19. EXPERIENCE SECTIONS
=======================

Use configurable progress ranges.

Example:

0.00–0.10 = INTRO
0.10–0.25 = TAKEOFF
0.25–0.45 = FLIGHT 1
0.45–0.65 = FLIGHT 2
0.65–0.82 = FLIGHT 3
0.82–1.00 = ENDING

These are initial defaults, not fixed requirements.

Keep section data in:

`config/sections.ts`

Each section may define:

* start progress
* end progress
* title
* subtitle
* camera mode
* atmosphere values
* lighting values
* aircraft behavior
* typography behavior
* effect intensity

Do not scatter section boundaries across multiple files.

==================================================
20. POST-PROCESSING
===================

Use:

`@react-three/postprocessing`

only where the effect provides real visual value.

Potential effects:

* bloom
* vignette
* chromatic aberration
* depth-related effects
* atmospheric fade
* motion/speed effect

Do not add every available effect.

Every effect must have a documented visual purpose.

Provide quality levels:

* HIGH
* MEDIUM
* LOW

The effect system must be able to reduce or disable expensive effects based on the selected quality tier.

==================================================
21. LOADING
===========

Create a polished loading experience.

Loading states should distinguish:

REQUIRED ASSETS
OPTIONAL ASSETS

Only required assets may block the experience.

Optional assets must not prevent startup.

Examples:

Required:

* application code
* required CSS
* default font if explicitly treated as required

Optional:

* audio
* replacement aircraft model
* optional textures
* optional high-quality cloud asset

If an optional asset fails:

* log the failure in development
* continue using the fallback

Do not let an optional asset cause an infinite loading screen.

Provide sensible loading progress.

Prevent the main scene from appearing in an uninitialized state.

==================================================
22. TRANSITIONS
===============

Implement smooth transitions for:

* loading → ready
* ready → intro
* intro → active
* active → ending
* ending → completed
* active → skipped
* WebGL experience → fallback

Avoid hard cuts unless deliberately used for cinematic effect.

No animation may leave orphaned GSAP tweens running after a component/state is destroyed.

Clean up all event listeners, animation contexts, timers, audio nodes, and Three.js resources appropriately.

==================================================
23. AUDIO EXPERIENCE
====================

The AudioManager must support:

* load
* play
* pause
* fade in
* fade out
* mute
* volume
* cleanup

Audio should respond appropriately to state transitions.

For example:

INTRO → gently fade music in
SKIPPED → fade music out / stop
ENDING → optionally fade music
VISIBILITY HIDDEN → pause/reduce audio appropriately
VISIBILITY VISIBLE → restore appropriately

Do not make sound essential to understanding the website.

==================================================
24. RESPONSIVE DESIGN
=====================

Support:

* desktop
* tablet
* mobile
* portrait
* landscape

Do not merely scale the desktop composition down.

On mobile:

* adjust camera FOV
* adjust aircraft scale
* adjust camera offsets
* adjust scene composition
* reduce cloud density
* reduce particle density
* reduce expensive effects
* reduce render resolution when necessary
* simplify shadows
* preserve readable typography
* optimize touch interaction

Handle:

* window resize
* device orientation changes
* viewport size changes

Recompute:

* canvas dimensions
* camera aspect ratio
* camera projection
* layout-dependent positions
* any responsive scene values

Do not rely on calculations performed only during initial mount.

==================================================
25. PERFORMANCE
===============

Performance is a first-class requirement.

Target smooth 60 FPS on capable desktop hardware.

Do not blindly optimize at the expense of visual quality; instead create a quality ladder.

Implement at minimum:

HIGH
MEDIUM
LOW

Quality can influence:

* device pixel ratio
* cloud density
* particle count
* shadow settings
* post-processing
* render target resolution
* secondary visual detail

Cap device pixel ratio rather than blindly rendering at the device's full native DPR.

Do not create new Three.js objects inside `useFrame` unless unavoidable.

Reuse:

* vectors
* quaternions
* materials
* geometries
* temporary objects

Avoid:

* excessive transparency
* unnecessary overdraw
* large numbers of independent meshes
* unnecessary React re-renders
* recreating shader materials every frame

Dispose of:

* geometries
* materials
* textures
* render targets
* audio nodes
* event listeners
* GSAP animations

when no longer needed.

Use compressed GLTF/GLB where appropriate.

==================================================
26. PERFORMANCE DEBUG MODE
==========================

Add an optional debug overlay.

Enable through:

`?debug=1`

The debug overlay should display at least:

* FPS
* currentProgress
* targetProgress
* active experience state
* active section
* quality tier
* device pixel ratio
* renderer information
* draw calls where available
* triangles where available

Do not render this in normal production mode.

Do not claim a performance target is met unless the debug information has actually been observed.

==================================================
27. DETERMINISTIC DEBUG MODES
=============================

Support debug/test query parameters such as:

`?debug=1`

`?forceFallback=1`

`?reducedMotion=1`

`?showPath=1`

`?quality=low`

These modes are for testing and must not be visually exposed as part of the production experience.

`?forceFallback=1` must force the static fallback even when WebGL2 is available.

This makes fallback testing deterministic.

==================================================
28. PAGE VISIBILITY / LIFECYCLE
===============================

Handle:

`visibilitychange`

When the tab becomes hidden:

* pause or reduce unnecessary rendering work where practical
* pause or manage audio appropriately
* avoid runaway animation timers

When the tab becomes visible again:

* resume cleanly
* avoid giant jumps in time-based animation
* preserve the current experience progress

Do not allow background tabs to accumulate a huge delta that launches the aircraft across the scene when the user returns.

Clamp delta time.

==================================================
29. WEBGL CONTEXT FAILURE
=========================

Handle WebGL context loss where practical.

If the WebGL context is lost:

* do not leave the user with a frozen canvas
* show a useful fallback/recovery UI
* provide a way to return to accessible HTML content

A WebGL failure must degrade gracefully instead of becoming a blank page.

==================================================
30. ACCESSIBILITY
=================

The visual experience must still provide usable content without animation.

Requirements:

* semantic HTML
* meaningful button labels
* keyboard interaction
* visible focus states
* `prefers-reduced-motion`
* skip/text-version control
* no essential information only in WebGL
* no duplicated screen-reader content
* no inaccessible controls
* no keyboard trap
* normal document flow available in fallback mode

The static fallback must contain the same core content as the experience.

==================================================
31. FALLBACK EXPERIENCE
=======================

If WebGL2 is unavailable:

Do NOT display a broken canvas.

Instead render a normal responsive HTML/CSS website containing:

* hero
* main headline
* section titles
* section descriptions
* key visual/gradient
* ending content
* normal document scrolling

Reuse the same content configuration as the WebGL experience.

Do not duplicate copy in a second hard-coded fallback implementation.

This fallback should still look intentional and polished.

It should not feel like an error page.

==================================================
32. ARCHITECTURE
================

Do not put the whole application into App.tsx.

Use an architecture similar to:

src/
app/
App.tsx
Experience.tsx

components/
LoadingScreen.tsx
StartScreen.tsx
EndScreen.tsx
SoundToggle.tsx
OverlayUI.tsx
SkipAnimationFallback.tsx
AccessibilityControls.tsx

experience/
Aircraft.tsx
FlightPath.ts
CameraRig.tsx
Atmosphere.tsx
Clouds.tsx
Environment.tsx
SceneText.tsx
Effects.tsx

animation/
scrollProgress.ts
interpolation.ts
timelines.ts
transitions.ts

hooks/
useScrollProgress.ts
useResponsive.ts
useExperienceState.ts
useReducedMotion.ts
usePageVisibility.ts

audio/
AudioManager.ts

renderer/
webglSupport.ts
quality.ts

config/
site.ts
content.ts
scene.ts
sections.ts
assets.ts
typography.ts

shaders/
gradient.vert
gradient.frag
atmosphere.vert
atmosphere.frag

styles/
globals.css
accessibility.css

tests/
...

Keep responsibilities separated.

==================================================
33. CONFIGURATION
=================

Keep important values in configuration.

Examples:

* flight path control points
* curve tension
* aircraft scale
* aircraft forward axis
* aircraft rotation offset
* maximum bank angle
* bank smoothing
* camera offsets
* camera look-ahead
* camera FOV
* section ranges
* typography ranges
* color palettes
* fog density
* cloud density
* effect intensity
* quality thresholds
* mobile settings
* asset paths
* asset metadata
* license information
* audio configuration

Do not hard-code these values throughout components.

==================================================
34. ASSET MANIFEST
==================

Create a typed asset manifest.

Each asset should describe at least:

* id
* path
* type
* required/optional
* license
* attribution
* preload behavior

The application should use this manifest for loading decisions.

Do not hard-code asset existence assumptions throughout the project.

==================================================
35. SEO & HTML FALLBACK
=======================

Even though the site is primarily a WebGL experience, the HTML document must still be complete.

Include:

* title
* meta description
* viewport
* theme color
* favicon
* Open Graph metadata
* Twitter/X card metadata where appropriate
* accessible fallback content

Do not use fake metadata such as imaginary company names.

Use configurable site metadata.

==================================================
36. DEPLOYMENT
==============

Target static hosting.

Default:

Vercel

The build must produce:

`dist/`

using:

`vite build`

Support deployment to:

* Vercel
* Netlify
* GitHub Pages

If deployment is to a subpath, correctly configure Vite's `base`.

All asset URLs must respect the configured base path.

Do not assume `/assets/...` always works when deployed under a repository subpath.

Document deployment steps in README.md.

==================================================
37. CI
======

Create a lightweight CI workflow where appropriate.

The CI pipeline should run:

* npm ci
* npm run format:check
* npm run lint
* npm run typecheck
* npm run build
* npm run test
* npm run test:e2e where the environment supports it

Use Node 24.

Do not make CI dependent on secrets that are not required by the project.

==================================================
38. BROWSER SMOKE TESTS
=======================

Use Playwright for a small deterministic smoke-test suite.

The tests should verify:

1. The application page loads.
2. The loading state resolves.
3. No uncaught runtime error occurs during initialization.
4. WebGL mode initializes when available.
5. Scroll input changes experience progress.
6. Keyboard interaction changes experience progress.
7. `?forceFallback=1` renders the static fallback.
8. Fallback contains the expected core content.
9. `?reducedMotion=1` produces the reduced-motion behavior.
10. The page does not horizontally overflow at supported viewport sizes.

The tests do not need to become a huge test suite.

Their purpose is to catch:

* blank pages
* runtime crashes
* hanging loaders
* broken fallback
* broken input
* obvious layout failures

==================================================
39. VISUAL QA
=============

Do not consider the project complete purely because automated tests pass.

Perform a manual visual QA pass where browser inspection is available.

At minimum inspect:

Desktop:

* 1440×900
* 1920×1080

Mobile:

* 390×844
* 430×932

Check:

* composition
* text hierarchy
* aircraft visibility
* path movement
* camera smoothness
* transitions
* color consistency
* fog
* atmosphere
* cloud density
* post-processing
* clipping
* overflow
* loading screen
* ending state
* controls
* accessibility controls

The experience should look intentional at every section.

==================================================
40. DEVELOPMENT WORKFLOW
========================

Do NOT build the entire site in one giant step.

Build in phases.

---

## PHASE 0 — REFERENCE AUDIT

Inspect the reference.

Create:

REFERENCE_AUDIT.md

Do not begin visual implementation until the audit exists.

---

## PHASE 1 — PROJECT FOUNDATION

Create:

* Vite
* React
* TypeScript
* Node 24 configuration
* npm scripts
* ESLint
* Prettier
* Git
* README
* configuration foundation

Verify:

* npm install
* npm run dev
* npm run build
* npm run lint
* npm run typecheck

---

## PHASE 2 — WEBGL FOUNDATION

Create:

* R3F Canvas
* WebGL2 detection
* basic camera
* basic scene
* renderer configuration
* loading boundary
* static fallback

Verify:

* main scene renders
* fallback renders
* no console errors

---

## PHASE 3 — AIRCRAFT

Create the procedural aircraft.

Create:

* FlightPath
* Aircraft
* path debug mode
* tangent evaluation
* orientation
* banking
* look-ahead support

Verify:

* aircraft moves correctly
* aircraft rotates correctly
* no unexpected flips
* path can be edited from configuration

---

## PHASE 4 — PROGRESS SYSTEM

Implement:

* targetProgress
* currentProgress
* wheel
* trackpad
* touch
* keyboard
* clamping
* damping
* state integration

Verify:

* input feels smooth
* no jumps
* no runaway progression
* progress reaches 0 and 1 predictably

---

## PHASE 5 — CAMERA

Implement:

* camera rig
* look-ahead
* camera modes
* interpolation
* section-based camera behavior

Verify:

* no snapping
* no jitter
* no sudden roll
* cinematic framing feels intentional

---

## PHASE 6 — TYPOGRAPHY

Implement:

* semantic DOM text
* decorative 3D text
* typography configuration
* section timing
* accessible fallback

Verify:

* no duplicated screen-reader text
* text remains readable on mobile
* animation follows currentProgress

---

## PHASE 7 — ATMOSPHERE

Implement:

* gradient shader
* fog
* clouds
* lighting
* noise
* atmospheric transitions

Verify:

* scene does not look static
* visual quality remains acceptable
* no unnecessary draw-call explosion

---

## PHASE 8 — POST-PROCESSING

Implement only justified effects.

Create quality levels.

Verify:

* effects improve presentation
* low-quality mode remains usable
* no severe performance regression

---

## PHASE 9 — AUDIO

Implement AudioManager.

Test:

* audio present
* audio absent
* mute
* unmute
* volume
* transition behavior
* tab visibility behavior

---

## PHASE 10 — LOADING / INTRO / ENDING

Implement the complete experience state machine.

Verify:

* loading
* intro
* active
* ending
* completed
* skip
* fallback
* error paths

---

## PHASE 11 — RESPONSIVE / MOBILE

Implement:

* responsive camera
* mobile scene adjustments
* touch refinement
* resize handling
* orientation changes
* mobile quality settings

Verify using actual mobile-size browser viewports.

---

## PHASE 12 — ACCESSIBILITY

Implement:

* keyboard support
* reduced motion
* semantic content
* skip animation
* fallback
* focus handling
* visible focus state

Verify with keyboard-only navigation.

---

## PHASE 13 — PERFORMANCE

Implement:

* FPS debug overlay
* quality tiers
* DPR limits
* object reuse
* disposal
* asset optimization
* unnecessary render prevention

Measure rather than guess.

---

## PHASE 14 — TESTING

Implement:

* unit tests where useful
* Playwright smoke tests
* forceFallback testing
* reducedMotion testing
* runtime error checking

---

## PHASE 15 — FINAL VISUAL POLISH

Perform a visual pass.

Improve:

* spacing
* timing
* easing
* typography
* camera compositions
* atmosphere
* color transitions
* aircraft movement
* transitions
* responsive composition

Do not add random effects merely to make the site "look more impressive."

Every visual addition must serve the composition.

---

## PHASE 16 — DEPLOYMENT / CI

Finalize:

* production build
* deployment config
* GitHub Actions or equivalent CI
* README
* ASSET_LICENSES.md
* TECHNICAL_DECISIONS.md
* PROGRESS.md

==================================================
41. VERIFICATION AFTER EVERY PHASE
==================================

After every phase:

1. Run the development server.
2. Inspect for runtime errors.
3. Run production build.
4. Run lint.
5. Run typecheck.
6. Run relevant tests.
7. Verify previous phases still work.
8. Update PROGRESS.md.
9. Commit the working checkpoint to Git.

Do not continue to the next phase when the previous phase is knowingly broken.

If a phase cannot be fully verified because a tool is unavailable, document exactly what could and could not be verified.

Never claim that an unverified step passed.

==================================================
42. GIT / CHECKPOINTS
=====================

Initialize Git at project start.

Commit after each verified phase.

Use clear commit messages such as:

phase 0: add reference audit
phase 1: add project foundation
phase 2: add webgl foundation

etc.

Keep commits meaningful.

Do not create giant commits covering many unrelated phases.

==================================================
43. PROGRESS.md
===============

Maintain:

`PROGRESS.md`

For each phase include:

* phase
* status
* date
* verification performed
* known issues

Statuses:

* NOT STARTED
* IN PROGRESS
* VERIFIED
* BLOCKED

Do not mark a phase VERIFIED unless the verification was actually completed.

==================================================
44. TECHNICAL DECISIONS
=======================

Maintain:

`TECHNICAL_DECISIONS.md`

Record important decisions such as:

* renderer selection
* React/R3F version choice
* Node version
* scroll architecture
* why Lenis was not used
* camera architecture
* aircraft orientation strategy
* quality-tier strategy
* fallback design
* asset strategy
* any major tradeoff

Keep the document concise.

==================================================
45. README
==========

README.md must contain:

* project overview
* technology stack
* requirements
* Node version
* installation
* npm scripts
* development instructions
* architecture
* asset requirements
* licensing information
* performance strategy
* debug modes
* testing instructions
* deployment instructions
* known limitations

==================================================
46. IMPORTANT IMPLEMENTATION RULES
==================================

Prefer simple implementations.

Do not install a package just because it is popular.

Every package should solve a real problem.

Do not introduce:

* Redux
* Zustand
* a backend
* GraphQL
* a database
* a CSS framework
* an additional animation library

without a concrete reason.

Do not duplicate scene state.

Do not duplicate content.

Do not duplicate animation ownership.

Do not put frequently changing values in React state.

Do not create Three.js objects repeatedly inside render loops.

Do not create arbitrary animation loops that ignore currentProgress.

Do not create separate scroll and cinematic timelines.

Do not fabricate licenses.

Do not fabricate asset URLs.

Do not assume browser APIs exist without feature detection.

Do not assume WebGL2/WebGPU/audio support.

Do not rely on runtime CDN assets.

Do not use absolute asset paths that break when deployed under a subpath.

Do not leave debug tools enabled in production by default.

==================================================
47. DEFINITION OF DONE
======================

The project is complete only when all of the following are true:

FOUNDATION

* project installs successfully
* Node 24 baseline is documented
* package-lock.json exists
* development server works
* production build works

CODE QUALITY

* lint passes
* typecheck passes
* formatting check passes
* architecture remains modular

REFERENCE

* REFERENCE_AUDIT.md exists
* design decisions were informed by the audit
* no proprietary reference assets/source code were copied

3D EXPERIENCE

* WebGL2 experience renders
* aircraft follows spline
* aircraft orientation follows path
* aircraft banking looks natural
* no major rotation flips occur
* camera follows smoothly
* camera uses look-ahead
* camera compositions transition smoothly
* atmosphere changes throughout the journey
* typography responds to progress
* environment feels alive

INTERACTION

* wheel input works
* trackpad input works
* touch input works
* keyboard input works
* progress is smooth
* progress is clamped
* no accidental giant jumps occur
* no unwanted page scrolling occurs during the active experience

ACCESSIBILITY

* reduced motion works
* skip animation works
* static text version works
* WebGL fallback works
* keyboard focus works
* important information is available without animation
* decorative 3D text is not redundantly exposed to screen readers

AUDIO

* audio works when configured
* zero-audio mode works
* audio controls behave correctly
* browser autoplay restrictions are handled

RESPONSIVE

* desktop works
* tablet works
* mobile works
* portrait works
* landscape works
* resize works
* orientation changes work
* no horizontal overflow occurs

FALLBACKS

* WebGL2 unavailable → static fallback
* optional aircraft missing → procedural aircraft
* audio missing → audio-free mode
* optional texture missing → graceful fallback
* WebGL context failure → useful recovery/fallback
* runtime asset error → application remains usable

PERFORMANCE

* FPS debug mode exists
* quality tiers exist
* pixel ratio is controlled
* objects/materials/geometries are reused
* resources are cleaned up
* the application remains responsive
* no obvious performance regressions were introduced by optional effects

TESTING

* npm run build passes
* npm run lint passes
* npm run typecheck passes
* npm run format:check passes
* browser smoke tests pass
* fallback test passes
* reduced-motion test passes
* no uncaught runtime errors occur during smoke tests

DOCUMENTATION

* README.md exists
* PROGRESS.md exists
* TECHNICAL_DECISIONS.md exists
* ASSET_LICENSES.md exists
* deployment instructions are documented

VERSION CONTROL

* each verified phase has a Git commit
* no phase is incorrectly marked VERIFIED

VISUAL QUALITY

The experience must not merely function.

Perform a final visual inspection and ensure:

* the aircraft feels convincingly connected to the camera
* movement has natural inertia
* banking feels cinematic
* transitions are smooth
* typography has intentional hierarchy
* atmospheric effects feel cohesive
* colors are deliberate
* no elements visibly snap
* no sections feel empty because of missing content
* no section feels overloaded with effects
* mobile composition remains intentional
* the final state feels like a complete experience rather than a technical prototype

The finished result should feel like an original high-end interactive WebGL website inspired by the experience principles of Atmos, while remaining technically maintainable, performant, accessible, testable, and legally safe.
Read `AGENTS.md` completely before making any changes.

Treat it as the project's primary technical specification and follow its requirements throughout the entire implementation.

Start with Phase 0 — Reference Audit.

Do not skip phases, do not rewrite the architecture without a concrete reason, and do not mark anything as verified unless you actually tested it.

After reading the file, begin Phase 0.
