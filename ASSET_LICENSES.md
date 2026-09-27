# ASSET_LICENSES.md

Every non-original asset used by the project, with verified licensing.
Licenses are verified from the source — never assumed. No runtime external
(CDN) assets by default; everything below is bundled locally at build time.

## Fonts

### Space Grotesk Variable (default UI typeface)

- Source: Fontsource (`@fontsource-variable/space-grotesk`), upstream: Google Fonts (Florian Karsten)
- License: **SIL Open Font License 1.1** (verified via npm registry metadata, 2026-09-27)
- Attribution: include the OFL notice with distributions (see package LICENSE)
- Local path: `node_modules/@fontsource-variable/space-grotesk` (bundled by Vite)
- Commercial use: permitted under OFL-1.1
- Why: technical grotesk with aerospace-instrument character; default for UI/typography, configurable

### Fraunces Variable (display/ending serif candidate)

- Source: Fontsource (`@fontsource-variable/fraunces`), upstream: Google Fonts (Undercase Type / Phaedra Charles & Flavia Zimbardi)
- License: **SIL Open Font License 1.1** (verified via npm registry metadata, 2026-09-27)
- Attribution: include the OFL notice with distributions (see package LICENSE)
- Local path: `node_modules/@fontsource-variable/fraunces` (bundled by Vite)
- Commercial use: permitted under OFL-1.1
- Why: expressive editorial serif for display headlines and the ending moment; configurable

## Models / Audio / Textures

None yet. The aircraft is procedural placeholder geometry (original, no
license needed). Any future external asset must be added here FIRST with its
verified license before use.
