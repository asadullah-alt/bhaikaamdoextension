Bhaikaamdo Extension — Build & Test
=================================

Overview
--------
This repository produces two browser-targeted builds from a single source tree:

- Chrome (Manifest V3) → built into `dist/chrome`
- Firefox (Manifest V2) → built into `dist/firefox`

Prerequisites
-------------
- Node.js (16+ recommended) and `npm`
- Install dependencies:

```bash
npm ci
```

Build commands
--------------
- Build Chrome output:

```bash
npm run build:chrome
```

The Chrome build uses `@crxjs/vite-plugin` and writes files to `dist/chrome`.

- Build Firefox output:

```bash
npm run build:firefox
```

The Firefox build disables `@crxjs` (it does not support MV2). It emits deterministic entry files and writes a transformed `manifest.json` into `dist/firefox` so the unpacked extension can be loaded in Firefox.

Packaging
---------
- Create a ZIP for Chrome:

```bash
npm run pack:chrome
```

- Create a ZIP for Firefox:

```bash
npm run pack:firefox
```

The produced ZIP files are placed at the repository root (e.g. `bhaikaamdo-extension-chrome.zip`).

Load locally for testing
------------------------
- Chrome / Edge:
  - Open `chrome://extensions`, enable Developer mode → Load unpacked → select the `dist/chrome` directory.

- Firefox (temporary install):
  - Open `about:debugging#/runtime/this-firefox` → "Load Temporary Add-on" → choose `dist/firefox/manifest.json`.

Notes and caveats
-----------------
- The Firefox build uses Manifest V2 (background scripts) because the current toolchain and target require it; Chrome uses Manifest V3 (service worker). Keep both `src/manifest.chrome.json` and `src/manifest.firefox.json` in sync for metadata and permissions.
- Bump the `version` fields in `src/manifest.chrome.json` and `src/manifest.firefox.json` before publishing — stores require unique versions.
- The build may emit large chunks (warnings about >500 KB). Consider code-splitting or `build.rollupOptions.output.manualChunks` to reduce bundle sizes.
- If you change content script or background entry filenames in source, verify the Firefox manifest mapping logic in `vite.config.ts` still matches the generated entries.

CI / publishing (optional)
-------------------------
- Typical CI steps:

```bash
npm ci
npm run build:chrome
npm run pack:chrome
```

- For Chrome Web Store automated uploads you will need an OAuth client + refresh token (store as CI secrets) or use a publisher API integration. For Mozilla AMO you can use `web-ext sign` with API credentials.

Files of interest
-----------------
- `vite.config.ts` — per-target build logic and manifest transform
- `src/manifest.chrome.json` — Chrome (MV3) manifest
- `src/manifest.firefox.json` — Firefox (MV2) manifest

If you want, I can add a GitHub Actions workflow to build + zip (and optionally upload) using repository secrets. Want me to add that next?
