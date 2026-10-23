# Sheikha Architecture Explorer

The existing `/architecture-explorer/` page presents the repository's architecture
registry in an Arabic RTL workspace. It is a registry browser, not an operational
control plane or proof of connected industrial infrastructure.

## Data Contract

- Read-only `GET /api/enterprise-architecture/full`, using
  `data.architecture` from the existing route.
- Source: `core/enterprise-architecture/sheikha-enterprise-architecture.js`.
- Six curated categories cover the current 24 layers. Unknown future layer IDs
  appear under an additional category instead of being silently discarded.
- Map positions indicate classification, not measured network connections.
  Dependencies and reverse dependencies come only from the source layer IDs.
- Static `ACTIVE` values are identified as registry declarations. `healthScore`
  is not presented as live health and is not included in the exported layers.
- Missing dependency targets are displayed explicitly. Relationship traversal is
  one level at a time, so cyclic source relationships do not cause recursion.
- The existing garden bitmap is a conceptual illustration, not a verified site.
  The page does not claim government, sovereign, or religious authority.

## Interaction

Search matches Arabic and English names, identifiers, purposes, responsibilities,
and capabilities. The URL preserves `q`, `group`, `view`, and `layer`. Following a
relationship outside the current filter clears the filter to reveal that layer.
The JSON export contains the filtered definitions, load timestamp, evidence type,
and dependency IDs outside the exported subset. It explicitly sets
`liveOperationVerified: false`.

The default `core` view is a locally rendered Three.js architectural model inspired
by the supplied dark-green and gold reference. The 2D map and layer list remain
available as `?view=map` and `?view=list`. Geometry is illustrative, not a physical
site model. Towers represent categories; picking one applies the same category
filter as the keyboard-accessible legend. Camera controls support rotation, zoom,
drag and reset. Optional automatic rotation is off initially, stops when the view
or document is hidden, and is disabled by reduced-motion preferences.

Directed links aggregate actual layer dependencies between categories. The current
29 dependencies produce nine distinct inter-category links (14 dependencies) and
15 internal-category dependencies. Internal and missing-target counts remain
explicit rather than being converted into invented external links. These are
registry relationships, not live traffic or telemetry.

The renderer loads only when the core view has data. Empty refreshes hide the
previous model and stop motion. WebGL initialization failure or context loss leaves
the registry, 2D map, filtering and export available; reloading the page retries
WebGL initialization. GPU resources are disposed when graphs are replaced or the
page is unloaded.

The UI uses text nodes for API content, checks the response shape, and aborts a
request after ten seconds. A failed refresh retains the previous successful
snapshot with a visible warning. A failed initial load does not substitute fake
data. No writes, device commands, or AI inference are performed.

## Local Preview

```bash
node tools/preview/sheikha-architecture-preview.cjs
```

This preview binds only to `127.0.0.1:4188` (or an available ephemeral port if
4188 is occupied). `PORT=0` requests an ephemeral port. It serves the existing
public assets and the one architecture read endpoint without booting `server.js`.
Other platform API endpoints are deliberately unavailable in this preview.
It does not add authentication and must not be exposed as a production server.

## Verification

```bash
node --test tests/sheikha-architecture-explorer.test.cjs
PLAYWRIGHT_MODULE=/tmp/sheikha-architecture-tools/node_modules/playwright \
  node --test tests/sheikha-architecture-browser.test.cjs
PLAYWRIGHT_MODULE=/tmp/sheikha-architecture-tools/node_modules/playwright \
  node --test tests/sheikha-architecture-core-browser.test.cjs
```

The browser test needs Playwright and Chrome. `CHROME_EXECUTABLE` overrides the
default `/opt/google/chrome/chrome`. `SCREENSHOT_DIR` overrides the default
`/tmp/sheikha-architecture-screenshots`. It blocks external browser requests and
checks desktop/mobile layout, keyboard selection, filtering, deep links, export,
stale/error states, untrusted labels, and bitmap/icon loading.

The core browser suite additionally checks screenshots and canvas pixels at six
viewport widths (320 through 1920), framing, camera interaction, 3D picking,
keyboard selection, motion preferences, refreshed graph data, WebGL failure and
context loss. Its default screenshot directory is
`/tmp/sheikha-architecture-core-screenshots`. Software WebGL is used for testing.

Icons are an unchanged subset of Lucide Static 0.468.0, copied locally with its
license under `public/architecture-explorer/icons/`. Three.js 0.180.0 is vendored
with its MIT license under `public/architecture-explorer/vendor/three/`.
`OrbitControls.js` has only its bare `three` import changed to the adjacent
`./three.module.min.js`; the two minified renderer modules are unchanged.
No CDN, external browser requests, production package changes, or architecture
backend contract changes are required.
