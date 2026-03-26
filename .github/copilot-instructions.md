# XSLTDebugX — Workspace Guidelines

> Browser-based XSLT 3.0 IDE for SAP Cloud Integration developers. See [README.md](../README.md) for full feature documentation.

**🔍 Looking for a specific feature or function?** See [features.instructions.md](instructions/features.instructions.md) for the complete API reference with all 200+ features, function locations, and implementation patterns.

## Project Type

**Zero-build static site** deployed to Cloudflare Workers. No npm scripts, no bundler, no build step. Edit → refresh → test.

## Tech Stack

- **Vanilla JavaScript ES6+** — 11 modules (~4,000 lines), global namespace, no framework
- **Monaco Editor 0.44.0** — CDN-loaded, custom dark/light themes
- **Saxon-JS 2.7** — bundled XSLT 3.0 + XPath 3.1 processor (`lib/SaxonJS2.js`)
- **Cloudflare Workers** — deployment via `wrangler.jsonc`, cache rules in `_headers`, SPA routing in `_redirects`
- **localStorage** — session persistence (`xdebugx-session-v1` key)

## Architecture

### Module Organization

Each JS file owns one domain. Load order matters (defined in `index.html`):

```
state.js → editor.js → transform.js → validate.js → xpath.js → 
panes.js → files.js → share.js → modal.js → ui.js → examples-data.js
```

| Module | Responsibility |
|--------|----------------|
| `state.js` | Global state, console, localStorage persistence, status bar |
| `editor.js` | Monaco initialization, themes, keyboard shortcuts |
| `transform.js` | XSLT execution, CPI header/property simulation, Saxon invocation |
| `validate.js` | XML/XSLT well-formedness, Monaco error markers |
| `xpath.js` | XPath mode UI, expression evaluation, history, syntax highlighting |
| `panes.js` | Word wrap, copy/clear/format, context menu, debounced validation |
| `files.js` | Upload/download, drag-and-drop, output language detection |
| `share.js` | URL encoding/decoding of editor state |
| `modal.js` | Examples library, category grid, search/filter |
| `ui.js` | Console state, theme toggle, help modal, column collapse |
| `examples-data.js` | 47 built-in examples across 5 dynamic categories |

### Key Global State

- `eds = { xml, xslt, out }` — Monaco editor instances
- `xmlModelXslt` / `xmlModelXpath` — separate XML models for mode isolation
- `kvData = { headers: [], properties: [] }` — CPI simulation params
- `saxonReady` — async readiness flag (must be true before transforms)
- `xpathEnabled` — current mode (XSLT vs XPath)
- All global vars use `_` prefix: `_savedSession`, `_xpathHistory`, `_wrapState`

## Code Style

### Naming Conventions

✅ **DO:**
- Prefix module-private functions with `_`: `_highlightXPath()`, `_syncXPathInput()`
- Use `let`/`const` (never `var`)
- HTML IDs in camelCase: `xmlEd`, `xsltEd`, `runBtn`, `consoleBody`
- CSS classes verbose with hyphens: `.pane-bar`, `.log-line`, `.xf-error-line-bg`

❌ **DON'T:**
- Add unprefixed global functions (causes namespace collisions)
- Create new Monaco models without tracking them (memory leak)
- Modify `lib/SaxonJS2.js` (vendor file)

### Comments

- Use emoji section dividers for major blocks: `// ════════ Section Name ════════`
- Inline comments for complex logic (CPI rewriting, error parsing, XPath tokenization)
- No JSDoc — keep functions self-describing

## Development Workflow

### Local Testing

Serve statically, no build needed:

```bash
npx serve .
# or: python -m http.server
# or: php -S localhost:8000
```

Open `http://localhost:3000` (or your port). Changes to `.js`, `.css`, `.html` are immediate on refresh.

### Debugging

- **Browser DevTools Console**: Shows `clog()` + Saxon errors
- **localStorage keys**: `xdebugx-session-v1` (state), `xdebugx-xpath-history` (last 20 expressions)
- **Monaco markers**: Red squiggles + glyphs for XML/XSLT validation errors

### Running Examples

Edit `js/examples-data.js`:
1. Add entry to `EXAMPLES` object
2. If new category: add to `CATEGORIES` array (auto-creates sidebar button + grid section)
3. Refresh browser, open Examples modal

## Critical Constraints

### 1. Global Namespace Pollution

No module system. All functions/vars are global unless wrapped in an IIFE or prefixed with `_`.

**Pattern to follow:**
```javascript
// Public API
function runTransform() { ... }

// Module-private (underscore prefix)
function _rewriteCPICalls(xslt) { ... }
```

### 2. Editor Model Isolation

Two XML models support mode switching:
- `xmlModelXslt` — used in XSLT mode
- `xmlModelXpath` — used in XPath mode

**Always sync the active model:** Check `xpathEnabled` before reading/writing XML content.

### 3. Saxon-JS Async Readiness

`window.SaxonJS` loads globally after page init. Always check:

```javascript
if (!saxonReady) {
  clog('Saxon not ready', 'warn');
  return;
}
```

### 4. CPI Simulation Rewriting

`transform.js` rewrites XSLT to intercept `cpi:setHeader` / `cpi:getHeader` / `cpi:setProperty` / `cpi:getProperty`:

1. Convert `cpi:` namespace → `js:` namespace
2. Inject JavaScript function interceptors
3. Add `exclude-result-prefixes="js"` (prevents namespace leak)
4. Build params from Headers/Properties panels

**Do not modify this logic unless debugging CPI simulation bugs.** Error line mapping is fragile.

### 5. Validation Debouncing

Both XML and XSLT use 800ms debounce (`xsltDebounce`, `xmlDebounce`). Use `_suppressNextValidation` flag to skip spurious validations after programmatic changes.

### 6. Share URL Length Limits

Browsers cap URLs at ~2,000 chars. Large XSLT + XML may exceed this. No warning shown; silently fails.

### 7. localStorage Versioning

Schema key is `xdebugx-session-v1`. Changing storage structure requires bumping version to avoid breaking old sessions.

## Deployment

Push to GitHub → auto-deploys to Cloudflare Pages via `wrangler.jsonc`.

**Cache configuration** (`_headers`):
- App code (`/css/*`, `/js/*`, `index.html`): `Cache-Control: no-store` (always fresh)
- Vendor libs (`/lib/*`): `Cache-Control: public, max-age=604800` (7-day cache)

**SPA routing** (`_redirects`):
- 404 fallback to `404.html` for URLs like `/README.md`, `/LICENSE`

## Common Patterns

See [features.instructions.md](instructions/features.instructions.md) for the full API reference. Key callouts:

- **Console**: `clog(msg, 'success'|'error'|'warn')` — maps to green/red/amber log lines
- **Headers/Properties**: `kvData.headers.push({name, value})` → `syncHeadersPropsTable()` → `persistSession()`
- **Format editors**: `fmtEditor('xml'|'xslt'|'out')` — via panes.js
- **Load example**: `loadExample('example-key')` — auto-switches to correct mode

## Agent Customizations

This workspace ships ready-made customizations. Load the relevant one before starting:

| Type | Name | Trigger |
|------|------|---------|
| **Skill** | `xslt-example` | Adding a new example to the library |
| **Skill** | `example-validator` | Auditing all XSLT/XPath examples for metadata, structure, and correctness |
| **Prompt** | `add-xslt-example` | Interactive prompt to generate a complete example entry |
| **Prompt** | `validate-examples` | Full audit of examples-data.js with error/warning report and optional auto-fix |

The `.github/agents/` folder is available for future custom agent modes.

## References

### Internal Documentation
- **Complete Feature Inventory**: [.github/instructions/features.instructions.md](instructions/features.instructions.md) — 200+ features, API reference, function locations
- **CPI Simulation Details**: [.github/instructions/transform.instructions.md](instructions/transform.instructions.md) — CPI rewriting, error line mapping
- **Example Library Structure**: [.github/instructions/examples-data.instructions.md](instructions/examples-data.instructions.md) — Categories, example format
- **User Documentation**: [README.md](../README.md) — Full feature docs, getting started

### Project Configuration  
- Cloudflare Workers: [wrangler.jsonc](../wrangler.jsonc)
- Cache policy: [_headers](../_headers)
- SPA routing: [_redirects](../_redirects)
- Example library: [examples-data.js](../js/examples-data.js)

### External APIs
- Saxon-JS docs: https://www.saxonica.com/saxon-js/documentation/
- Monaco Editor API: https://microsoft.github.io/monaco-editor/api/
