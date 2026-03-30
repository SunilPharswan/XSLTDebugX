# Contributing Code Style Guide

This guide applies when contributing code to XSLTDebugX. It's derived from the [Developer Code Style](../DEVELOPERS/CODE_STYLE.md) with emphasis on PR review expectations.

---

## Quick Checklist for PRs

Before submitting a pull request, ensure:

- [ ] **Code Style**
  - [ ] No `var` (use `let`/`const`)
  - [ ] camelCase for functions and variables
  - [ ] `_` prefix for private functions
  - [ ] Descriptive names (not `x`, `y`, `temp`)
  
- [ ] **Comments**
  - [ ] Complex logic has inline comments explaining "why"
  - [ ] No JSDoc (keep code self-describing)
  - [ ] Section dividers for major blocks (`// ════════ Section Name ════════`)
  
- [ ] **HTML/CSS**
  - [ ] HTML IDs in camelCase (`xmlEd`, `runBtn`)
  - [ ] CSS classes verbose and hyphenated (`.pane-bar`, `.error-line`)
  
- [ ] **Global Namespace**
  - [ ] No unprefixed global functions unless intentional public API
  - [ ] Private functions prefixed with `_`
  
- [ ] **Performance & Memory**
  - [ ] Cleanup: restore `console.log`, dispose Monaco models
  - [ ] No memory leaks (cleared timeouts, disposed models)
  - [ ] Debouncing preserved (don't change 800ms validation timeout)
  
- [ ] **Testing**
  - [ ] Code works in browser (manual test)
  - [ ] No console errors (`F12` → Console)
  - [ ] localStorage persistence works (refresh → changes restored)
  - [ ] E2E tests pass: `npm run test:e2e`
  - [ ] Tested in Chrome, Firefox, Safari, Edge (latest versions)

---

## Detailed Expectations

### 1. Variable & Function Naming

**Examples:**

```javascript
// ✅ Good
const MAX_HISTORY_SIZE = 20;
let editorInstance = null;

function runTransform() { ... }
async function validateXmlWellFormedness(xml) { ... }
function _parseErrorLineNumber(error) { ... }

for (let i = 0; i < items.length; i++) { }
const isXmlValid = checkXmlWellFormedness(xml);

// ❌ Bad (will be requested to change in review)
var MAX_SIZE = 20;                        // No var
function run() { ... }                    // Not descriptive
function parseErrorLineNumber(error) { }  // Should be private if only used internally
let x = 10;                               // Single letter variable
```

**Rule of Thumb:** If a reviewer can't immediately understand what something does from its name, it needs a better name or a comment.

### 2. Comments: Quality Over Quantity

**Good comments explain the "why", not the "what":**

```javascript
// ✅ Good: Explains why
// CPI rewriting converts cpi:setHeader → js:_cpiSetHeader to avoid namespace
// conflicts in XSLT output and to enable interception in JavaScript layer
const rewritten = xslt.replace(/cpi:setHeader/g, 'js:_cpiSetHeader');

// Debounce 800ms: Large XSLT files (>10KB) take ~6-10ms to parse.
// Validating on every keystroke = ~40-50 validations/sec = CPU spike.
xsltDebounce = setTimeout(() => validateXslt(), 800);

// ❌ Bad: States what code already says
// Loop through items (obviously looping)
for (let i = 0; i < items.length; i++) { }

// Replace string (obviously doing that)
const rewritten = xslt.replace(/old/g, 'new');

// Clear timeout (obviously clearing)
clearTimeout(myTimeout);
```

**Section Dividers** (use for major blocks):
```javascript
// ════════════════════════════════════════════════════════════════
// SECTION: CPI Header Rewriting
// ════════════════════════════════════════════════════════════════

function rewriteCPICalls(xslt) { ... }
```

### 3. Private vs. Public

If a function is only used within its module, prefix with `_`:

```javascript
// ✅ Good: Clear scope
function loadExample(key) { ... }          // Public API
function _findExampleByKey(key) { ... }    // Private, only used here

// ❌ Bad: Readers don't know if it's public or internal
function findExampleByKey(key) { ... }     // Looks public but might not be
```

**Guidelines:**
- Public functions: No prefix, documented if user-facing
- Private functions: `_` prefix, internal-only
- Event handlers: Name pattern `_onXxxClick`, `_onXxxChange`

### 4. Error Handling

Always use `clog()` for errors and important events:

```javascript
// ✅ Good
try {
  const result = SaxonJS.XPath.evaluate(xslt);
} catch (err) {
  clog(`Transform failed: ${err.message}`, 'error');
  return null;
}

// ✅ Warnings for expected issues
if (!saxonReady) {
  clog('Saxon.JS still loading, please wait...', 'warn');
  return;
}

// ✅ Success for important milestones
clog('Session restored from localStorage', 'success');

// ❌ Bad: Silent failures
try {
  const result = SaxonJS.XPath.evaluate(xslt);
} catch (err) {
  // Silently fails, user doesn't know why
  return null;
}

// ❌ Bad: Using console.log directly
console.error('Something went wrong');  // Use clog() instead
```

### 5. Memory Management

Clean up after yourself:

```javascript
// ✅ Good: Always restore
async function runTransform() {
  const originalLog = console.log;
  try {
    console.log = _captureLog;
    // ... run transform ...
  } finally {
    console.log = originalLog;  // Restored even if error
  }
}

// ✅ Good: Dispose models before reassign
if (eds.xml) {
  const model = eds.xml.getModel();
  if (model) model.dispose();
}
eds.xml = new monaco.editor.create(...);

// ❌ Bad: Cleanup skipped on error
async function runTransform() {
  console.log = _captureLog;
  const result = SaxonJS.XPath.evaluate(...);  // If this throws...
  console.log = originalLog;  // ...this never runs!
}

// ❌ Bad: Model not disposed
eds.xml = new monaco.editor.create(...);  // Memory leak!
```

### 6. Testing & Validation

**Before submitting PR:**

1. **Manual browser test:**
   ```bash
   npx serve .
   # Open http://localhost:3000
   # Test your changes manually
   # Open DevTools F12 → Console → No errors?
   ```

2. **Run E2E tests:**
   ```bash
   npm run test:e2e
   # All tests pass?
   ```

3. **Cross-browser test:**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest, if Mac available)
   - Edge (latest)

4. **Persistence test:**
   ```
   1. Load app
   2. Make change (edit XSLT, add header, etc.)
   3. Press F5 to refresh
   4. Does state restore? (It should)
   ```

5. **Console check:**
   - `F12` → Console tab
   - Any errors or warnings?
   - Expected: Only `clog()` messages, no JavaScript errors

### 7. Commit Messages

See [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) for format and conventions.

**Brief example:**
```
feat(transform): Add XPath debugging hints

- Parse XPath expression to suggest common patterns
- Show 3 progressive examples (simple → complex)
- Hints persist in localStorage

Fixes #123
```

---

## Common Review Feedback

### "This function name is unclear"
**Feedback:** Be more specific. Users of this function should know what it does.
```javascript
// ❌ Unclear
function process(data) { ... }

// ✅ Better
function validateXsltSyntax(xsltString) { ... }
```

### "Why is this needed? You should add a comment explaining the rationale"
**Feedback:** Not obvious what the code does. Add comment explaining the "why" not the "what".
```javascript
// ❌ No context
xsltDebounce = setTimeout(() => validateXslt(), 800);

// ✅ Context added
// Debounce 800ms: Parsing large XSLT (>10KB) is CPU-heavy.
// Validating on every keystroke = 40-50 validations/sec = freeze.
// 800ms debounce reduces to ~1-2 per pause, keeps UI responsive.
xsltDebounce = setTimeout(() => validateXslt(), 800);
```

### "Missing cleanup"
**Feedback:** Code restores state on success path but not on error. Use try/finally.
```javascript
// ❌ Cleanup skipped on error
console.log = _capture;
await transform();
console.log = original;  // Lost if transform() throws!

// ✅ Guaranteed cleanup
try {
  console.log = _capture;
  await transform();
} finally {
  console.log = original;  // Always happens
}
```

### "This breaks the module load order"
**Feedback:** Code depends on something defined later. Either reorder or restructure.
```javascript
// ❌ Invalid: references runTransform before it's defined
initUI();  // Calls runTransform()
function runTransform() { ... }

// ✅ Define dependencies first
function runTransform() { ... }
initUI();  // Now safe to call runTransform()
```

### "Add underscore prefix for internal function"
**Feedback:** Function looks like public API but is only used internally.
```javascript
// ❌ Ambiguous scope
function validateExample(data) { ... }

// ✅ Clear scope
function _validateExample(data) { ... }
```

---

## Helpful Resources

- **[Code Style Details](../DEVELOPERS/CODE_STYLE.md)** — Full code style guide
- **[Constraints & Patterns](../DEVELOPERS/CRITICAL_CONSTRAINTS.md)** — Architecture patterns to follow
- **[Features Catalog](../../instructions/features.instructions.md)** — All 200+ features; check before adding
- **[Commit Style](./COMMIT_GUIDELINES.md)** — How to format commit messages

---

## Questions Before You Code?

- **"Is this feature already implemented?"** → Check [features.instructions.md](../../instructions/features.instructions.md)
- **"What's the load order?"** → See [CODE_STYLE.md#module-organization](../DEVELOPERS/CODE_STYLE.md#module-organization)
- **"How do I test the changes?"** → See [SETUP.md](../DEVELOPERS/SETUP.md#testing)
- **"Why is there global state?"** → See [CRITICAL_CONSTRAINTS.md#1-global-namespace-pollution](../DEVELOPERS/CRITICAL_CONSTRAINTS.md#1-global-namespace-pollution)
- **"Still stuck?"** → Open an issue or ask in PR discussion

Good luck with your contribution! 🎉
