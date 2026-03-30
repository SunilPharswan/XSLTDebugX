# Code Style & Conventions

This document covers naming conventions, patterns, and style guidelines for XSLTDebugX development.

---

## JavaScript

### Variables & Functions

**Naming Convention:**

✅ **DO:**
- Use `const` and `let` (never `var`)
- Camel case for variables and functions: `myVariable`, `runTransform()`
- Prefix **private/internal** functions with `_`: `_rewriteCPICalls()`, `_syncXPathInput()`
- ALL CAPS for constants: `MAX_HISTORY_SIZE`, `DEFAULT_TIMEOUT_MS`
- Descriptive names: `isValidNcName()` not `isValid()`

❌ **DON'T:**
- Add top-level functions without `_` prefix (causes global namespace pollution)
- Use single-letter variables except loop counters (`i`, `j`, `k`)
- Prefix variables with `this.` unless inside class/object
- Use abbreviations that aren't standard (`deb` → `debounce`, `evt` → `event`)

**Example:**
```javascript
// ✅ Good
const MAX_RETRIES = 3;
let editorInstance = null;

function runTransform() { ... }
function _rewriteCPICalls(xslt) { ... }

for (let i = 0; i < items.length; i++) { }

// ❌ Bad
var maxRetries = 3         // No var
let EditorInstance = null; // Wrong case
function myFunc() { }      // Not descriptive
let myVar               // No context
function rewriteCPICalls() { } // Not private
```

### Global Variables & State

All top-level state uses descriptive names:

```javascript
// ✅ Good
const eds = { xml, xslt, out };              // Named instances
const xmlModelXslt = new XMLModel();          // Purpose clear
const kvData = { headers: [], properties: [] }; // Data structure obvious
const _xpathHistory = [];                    // Private, obvious state
const saxonReady = false;                     // Flag, clear boolean
const modeManager = { ... };                 // Obvious module

// ❌ Bad
let state = { ... };       // Generic, unclear
let data;                  // Too vague
let x, y, z;               // Meaningless
var globalEditor;          // Wrong scope marker
```

**Global Namespace Caution:**
Since there's no module system, keep the global namespace clean:

```javascript
// ✅ Public API (if truly needed globally)
function loadExample(key) { ... }

// ✅ Internal/private (prefix with _)
function _loadExampleFile(key) { ... }
function _parseExampleMetadata(data) { ... }

// ❌ Don't flood globals
function exampleHelper() { }
function exampleUtil() { }
function exampleWorker() { }
// ^ Too many unprefixed functions; use _prefix or put in object
```

### HTML Attributes

**IDs (camelCase):**
```html
<!-- ✅ Good -->
<input id="xmlEd" />
<button id="runBtn" />
<div id="consoleBody" />

<!-- ❌ Bad -->
<input id="XMLEd" />     <!-- All caps -->
<button id="run-btn" />  <!-- Hyphens for ID -->
<div id="console" />     <!-- Too generic -->
```

**Data Attributes:**
```html
<!-- ✅ Good -->
<div data-example-id="array-grouping" />          <!-- Hyphenated -->
<div data-xslt-mode="true" />                     <!-- Boolean clear -->
<span data-error-count="5" />

<!-- ❌ Bad -->
<div data-exampleId="array-grouping" />           <!-- camelCase in data -->
<div data-xsltmode="true" />                      <!-- No hyphen -->
```

### CSS Classes

**Use hyphenated names (verbose is good):**
```html
<!-- ✅ Good -->
<div class="pane-bar-left" />
<div class="error-line-background" />
<span class="status-badge-error" />
<button class="btn-primary-action" />

<!-- ❌ Bad -->
<div class="left" />              <!-- Too generic -->
<div class="err" />               <!-- Abbreviated -->
<span class="badge" />            <!-- Unclear purpose -->
<button class="btn-primary" />    <!-- Too similar to others -->
```

---

## Comments & Documentation

### Inline Comments

Use for **complex logic** only. Self-describing code needs no comments.

✅ **Good:**
```javascript
// CPI rewriting: Convert cpi:setHeader → js:_cpiSetHeader
// to avoid namespace conflicts with XSLT output
const rewritten = xslt.replace(/cpi:setHeader/g, 'js:_cpiSetHeader');

// Debounce validation: wait 800ms after keystroke before parsing
// to avoid freezing UI on large XSLT files (>10KB)
xsltDebounce = setTimeout(() => validateXslt(), 800);
```

❌ **Bad:**
```javascript
// Loop through items
for (let i = 0; i < items.length; i++) { }

// Set x to y
let x = y;

// Add header
kvData.headers.push(header);
```

### Section Dividers

Mark major section breaks with emoji dividers:

```javascript
// ════════════════════════════════════════════════════════════════
// SECTION: Initialize Editors
// ════════════════════════════════════════════════════════════════

function initEditors() { ... }

// ════════════════════════════════════════════════════════════════
// SECTION: Handle Transform Execution
// ════════════════════════════════════════════════════════════════

async function runTransform() { ... }
```

### No JSDoc

Keep code self-describing. Don't use JSDoc comments unless essential.

```javascript
// ❌ Avoid
/**
 * Validates XML well-formedness
 * @param {string} xml - The XML string to validate
 * @returns {Object} Validation result with errors array
 */
function validateXml(xml) { ... }

// ✅ Better: Descriptive function name + inline comment if needed
function validateXmlWellFormedness(xml) {
  // Returns { isValid: bool, errors: [{message, line}] }
  ...
}
```

---

## Code Organization

### Module Load Order

Order matters! Defined in `index.html`:

```
1. state.js         — Global state, console, persistence
2. editor.js        — Monaco setup
3. transform.js     — XSLT execution
4. validate.js      — XML/XSLT validation
5. xpath.js         — XPath mode
6. panes.js         — UI panels, actions
7. files.js         — File handling
8. share.js         — URL encoding
9. modal.js         — Examples library
10. ui.js           — Theme, console, UI
11. examples-data.js — Example definitions
12. mode-manager.js — Centralized mode switching (NEW)
```

**Do not change load order** unless you understand dependencies. Dependent modules must load **after** their dependencies.

### Function Organization

Within a module, organize by:**1. Imports / Global state setup
2. Utility functions (prefixed with `_`)
3. Public API functions (no prefix)
4. Event listeners / initialization

```javascript
// ════════════════════════════════════════════════════════════════
// state.js structure
// ════════════════════════════════════════════════════════════════

// Setup
const clog = {
  messages: [],
  log(msg, type = 'info') { ... },
  clear() { ... }
};

const kvData = {
  headers: [],
  properties: []
};

// Utilities (private)
function _loadSession() { ... }
function _saveSession() { ... }

// Public API
function persistSession() { ... }
function clearSession() { ... }

// Initialization
document.addEventListener('beforeunload', persistSession);
```

---

## Error Handling

### Try-Catch Patterns

Use try-catch for operations that can fail (parsing, validation, etc.):

```javascript
try {
  const parsed = JSON.parse(sessionData);
  restoreSession(parsed);
} catch (err) {
  clog(`Session restore failed: ${err.message}`, 'warn');
  clearSession(); // Fallback to clean state
}
```

### Error Logging

Standard error logging via `clog()`:

```javascript
clog(msg, 'error')    // Red, used for runtime errors
clog(msg, 'warn')     // Yellow, used for warnings
clog(msg, 'info')     // Gray, default logging
clog(msg, 'success')  // Green, positive outcomes
```

---

## Performance Guidelines

### Debouncing Pattern

Use for 800ms debounces (validation, persistence):

```javascript
let xsltDebounce;

function onXsltChange() {
  clearTimeout(xsltDebounce);
  xsltDebounce = setTimeout(() => {
    validateXslt();
  }, 800);
}
```

### Managing Global State

Always clean up references:

```javascript
// ✅ Good: Restore and clean up
async function runTransform() {
  const originalLog = console.log;
  const originalError = console.error;

  try {
    console.log = _captureLog;
    // ... run transform ...
  } finally {
    console.log = originalLog;      // Always restore
    console.error = originalError;
  }
}

// ❌ Bad: Left cleanup to chance
function runTransform() {
  console.log = _captureLog;
  // ... run transform ...
  console.log = originalLog;  // What if error thrown above?
}
```

### Memory Leaks to Avoid

```javascript
// ❌ Bad: Doesn't clean up Monaco model
eds.xml = new monaco.editor.create(...);
// Later...
eds.xml = new monaco.editor.create(...);  // Old model not disposed!

// ✅ Good: Cleanup before reassign
if (eds.xml) {
  eds.xml.getModel().dispose();
}
eds.xml = new monaco.editor.create(...);
```

---

## External Libraries

### Monaco Editor

- **Never** modify `lib/SaxonJS2.js` (vendor file)
- Always track created models for cleanup
- Use `CDN` URLs; don't bundle locally

### Saxon-JS

- Always check `saxonReady` before invoking transforms
- Saxon async loads in background; be patient
- Errors logged to console; check DevTools

---

## Testing Concerns

### Test-Friendly Code

While XSLTDebugX doesn't have unit tests, be mindful:

- Pure functions are better (easier to test separately)
- Avoid hidden dependencies on DOM state
- Log important decisions (`clog()`) for debugging
- Use clear error messages (helps test debugging)

---

## Checklist Before Committing

- [ ] No `var` declarations (use `let`/`const`)
- [ ] Private functions prefixed with `_`
- [ ] Variables named descriptively
- [ ] No global functions without `_` prefix (unless intentional public API)
- [ ] Complex logic has inline comments explaining the "why"
- [ ] HTML IDs in camelCase
- [ ] CSS classes verbose and hyphenated
- [ ] No JSDoc (keep code self-describing)
- [ ] Proper cleanup (restore `console.log`, dispose Monaco models, etc.)
- [ ] No memory leaks (disposed models, cleared timeouts)
- [ ] Errors logged via `clog()` with appropriate type
- [ ] Load order respected in `index.html`

---

## Resources

- **Module organization**: See [copilot-instructions.md](../.github/copilot-instructions.md) (Code Style section)
- **Architecture & Constraints**: See [CRITICAL_CONSTRAINTS.md](./CRITICAL_CONSTRAINTS.md)
- **Feature locations**: See [features.instructions.md](../instructions/features.instructions.md)
