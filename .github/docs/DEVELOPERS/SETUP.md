# Developer Setup Guide

Get up and running with XSLTDebugX development in minutes.

---

## Prerequisites

- **Node.js 16+** (for npm and Playwright)
- **Git** (for version control)
- **Browser** (Chrome, Firefox, Safari, or Edge)
- **Code editor** (VS Code recommended)
- **Terminal** (PowerShell, Bash, or Zsh)

**Optional:**
- **Cloudflare CLI** (for deployment testing, not needed for local dev)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/SunilPharswan/XSLTDebugX.git
cd XSLTDebugX
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- **Playwright** — E2E testing framework
- **prettier** — Code formatter
- Other dev tools

### Step 3: Serve the Application

Choose one method based on your environment:

**Option A: Node.js (recommended)**
```bash
npx serve .
# Opens on http://localhost:3000
# Changes to .js, .css, .html are live on refresh
```

**Option B: Python 3**
```bash
python -m http.server 3000
# Opens on http://localhost:3000
```

**Option C: Python 2**
```bash
python -m SimpleHTTPServer 3000
# Opens on http://localhost:3000
```

**Option D: PHP**
```bash
php -S localhost:3000
# Opens on http://localhost:3000
```

**Option E: VS Code Live Server**
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → "Open with Live Server"

### Step 4: Open in Browser

Navigate to `http://localhost:3000` (or your configured port).

You should see the XSLTDebugX editor with:
- Three-column layout (XML | XSLT | Output)
- Mode toggle button (top-right)
- Examples gallery button
- Console below

---

## Making Changes

### Edit Workflow

1. **Make change** to `.js`, `.css`, or `.html` file
2. **Refresh browser** (`F5` or `Ctrl+R`)
3. **Test in browser** — Verify UI works as expected
4. **Check console** (`F12` → Console tab) for errors

### JavaScript Development

- **Location:** `js/` folder (12 modules)
- **Load order:** Defined in `index.html` script tags
- **No build step:** Pure ES6+ vanilla JavaScript
- **Global namespace:** Use `_` prefix for private functions (e.g., `_myPrivateFunction()`)
- **See:** [CODE_STYLE.md](./CODE_STYLE.md) for naming and pattern conventions

### CSS Development

- **Location:** `css/style.css` (monolithic file, ~1500 lines)
- **Themes:** Dark/light mode managed with CSS variables
- **Classes:** Use verbose hyphenated names (e.g., `.pane-bar`, `.error-line`)
- **No build:** Plain CSS, no preprocessor

### HTML Development

- **Location:** `index.html` (main entry point)
- **Modules:** Script tags in order (don't change load order without reason)
- **Ids:** camelCase (e.g., `xmlEd`, `runBtn`, `consoleBody`)

---

## Testing

### Running E2E Tests

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/e2e/smoke.spec.js

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run with debugger
npm run test:e2e:debug

# Update snapshots (after intentional changes)
npm run test:e2e -- --update-snapshots
```

### Test Files

Located in `tests/e2e/workflows/`:
- `smoke.spec.js` — Core functionality (Transform, mode switch, examples)
- `xslt-transform.spec.js` — XSLT execution edge cases
- `xpath-evaluation.spec.js` — XPath mode, expression history
- `cpi-simulation.spec.js` — Headers/Properties injection
- `examples-comprehensive.spec.js` — All 50+ examples load and run
- `session-management.spec.js` — localStorage persistence
- `share-url.spec.js` — URL encoding/decoding
- `mode-switching.spec.js` — XSLT ↔ XPath transitions
- `examples-library.spec.js` — Examples modal, search, filtering

### Writing Tests

See [TESTING.md](../TESTING.md) for detailed test patterns, Page Object Model, timing strategies, and fixture usage.

**Quick example:**
```javascript
test('Transform XSLT with XML', async ({ page, context }) => {
  await page.goto('http://localhost:3000');
  const editor = page.context().editor;  // EditorPage helper

  await editor.setXslt('<xsl:stylesheet...>');
  await editor.setXml('<root/>');
  await editor.runTransform();

  const output = await editor.getOutput();
  expect(output).toContain('expected-content');
});
```

---

## Debugging

### Browser DevTools

1. **Open DevTools:** Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. **Console tab:** Check for JavaScript errors, `clog()` messages, Saxon warnings
3. **Elements tab:** Inspect HTML structure, CSS classes, styles
4. **Sources tab:** Set breakpoints, step through code
5. **Network tab:** Check file loads, request/response sizes
6. **Application tab:** View localStorage (`xdebugx-session-v1`), sessionStorage

### localStorage Inspection

```javascript
// In DevTools Console:
localStorage.getItem('xdebugx-session-v1')
// Returns: {xml: "...", xslt: "...", output: "...", mode: "XSLT", ...}

// Clear all
localStorage.clear()

// Restore previous session
localStorage.setItem('xdebugx-session-v1', previousJson)
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **Monaco editor not loading** | Check `lib/SaxonJS2.js` is accessible. Check CDN URLs in `index.html`. |
| **Saxon-JS errors** | Check Console → check `window.SaxonJS` is defined. Timing issue? Wait for `saxonReady`. |
| **Styles not updating** | Hard-refresh browser (`Ctrl+Shift+R` or `Cmd+Shift+R`). Clear browser cache. |
| **localStorage corrupt** | Run `localStorage.clear()` in DevTools, refresh. |
| **Tests timeout** | Increase `timeout` in `playwright.config.js`. Check for timing issues in test code. |

---

## Code Quality

### Formatting

```bash
# Format code (if prettier installed)
npx prettier --write "js/**/*.js"
```

### Linting

XSLTDebugX doesn't use ESLint by default, but you can add it:

```bash
npx eslint js/
```

### Testing Checklist Before PR

- [ ] Code follows [CODE_STYLE.md](./CODE_STYLE.md) (naming, comments, patterns)
- [ ] Tests pass: `npm run test:e2e`
- [ ] No console errors (F12 → Console)
- [ ] localStorage still works (refresh browser, state persists)
- [ ] Tested in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Keyboard shortcuts still work
- [ ] Examples load and run
- [ ] URL share functionality tested

---

## Performance Tips

### Optimization During Development

- **Large XSLT files:** Break into smaller templates for faster parsing
- **Validation debouncing:** Don't reduce 800ms debounce (causes UI freeze)
- **Storage:** Use `persistSession()` sparingly; already debounced
- **Console:** Clear message history periodically (browser memory)
- **Monitor:** Open DevTools → Performance tab → record transform → check for bottlenecks

### Memory Leaks

- Always cleanup Monaco models: `model.dispose()`
- Restore `console.log`, CPI interceptors even on error
- Clear references to old XSLT strings
- Don't accumulate `_xslMessages` across runs

---

## Helpful Resources

- **[CODE_STYLE.md](./CODE_STYLE.md)** — Naming conventions, patterns, comments
- **[CRITICAL_CONSTRAINTS.md](./CRITICAL_CONSTRAINTS.md)** — Must-know architectural rules
- **[DEBUGGING.md](./DEBUGGING.md)** — Detailed debugging techniques
- **[TESTING.md](../TESTING.md)** — E2E testing guide with Playwright patterns
- **[features.instructions.md](../instructions/features.instructions.md)** — 200+ feature catalog with locations
- **Saxon-JS Docs:** https://www.saxonica.com/saxon-js/documentation/
- **Monaco Editor API:** https://microsoft.github.io/monaco-editor/api/
- **Playwright Docs:** https://playwright.dev/

---

## Getting Help

- **Code style questions:** See [CODE_STYLE.md](./CODE_STYLE.md)
- **Architecture questions:** See [CRITICAL_CONSTRAINTS.md](./CRITICAL_CONSTRAINTS.md) and [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Test failures:** See [TESTING.md](../TESTING.md)
- **Feature location:** See [features.instructions.md](../instructions/features.instructions.md)
- **Report bugs:** [GitHub Issues](https://github.com/SunilPharswan/XSLTDebugX/issues)
