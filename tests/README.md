# XSLTDebugX E2E Test Suite — Quick Reference

> This guide provides quick lookup for writing and maintaining Playwright E2E tests for XSLTDebugX. For comprehensive architecture details, troubleshooting, and advanced patterns, see [.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md).

## Table of Contents

- [File Organization](#file-organization)
- [Page Object Model: EditorPage API](#page-object-model-editorpage-api)
- [Test Data & Fixtures](#test-data--fixtures)
- [Timing Constants](#timing-constants)
- [Test Structure Template](#test-structure-template)
- [Common Patterns](#common-patterns)
- [When to Use Each Test File](#when-to-use-each-test-file)
- [New Test Checklist](#new-test-checklist)

---

## File Organization

```
tests/
├── e2e/                          # End-to-end test files
│   ├── smoke.spec.js             # Basic app load, transform, mode toggle (3 tests)
│   └── workflows/                # Feature-specific test suites
│       ├── xslt-transform.spec.js      # Core XSLT workflow (8 tests)
│       ├── xpath-evaluation.spec.js    # XPath expressions (4 tests)
│       ├── cpi-simulation.spec.js      # Headers/properties, CPI rewriting (10 tests)
│       ├── mode-switching.spec.js      # XSLT ↔ XPath mode transitions (7 tests)
│       ├── session-management.spec.js  # localStorage persistence, reload (8 tests)
│       ├── examples-library.spec.js    # Examples modal, search, loading (12 tests)
│       └── share-url.spec.js           # Share URL generation, round-trip (9 tests)
├── fixtures/
│   └── sample-data.js            # Reusable XML, XSLT, and test data (~400 lines)
├── utils/
│   └── test-helpers.js           # EditorPage POM class + utility functions (~650 lines)
└── README.md                     # This file
```

**Test Stats:** ~61 tests across 7 files, ~700 lines of test code + helpers

---

## Page Object Model: EditorPage API

The `EditorPage` class abstracts all UI interactions. Import and instantiate in `beforeEach`:

```javascript
import { EditorPage } from '../utils/test-helpers.js';

test.beforeEach(async ({ page: testPage }) => {
  const editor = new EditorPage(testPage);
  await editor.navigate();
  await testPage.evaluate(() => localStorage.clear());
  // Now use editor.* methods for all interactions
});
```

### Navigation & Initialization

| Method | Purpose | Waits |
|--------|---------|-------|
| `navigate()` | Load app, wait for Monaco, JS init | 2s + networkidle |
| `waitForDebounce()` | Wait for 800ms debounce + 200ms buffer | 1s |

**Example:**
```javascript
await editor.navigate();
```

---

### Editor Content (Monaco API)

| Method | Purpose | Returns |
|--------|---------|---------|
| `fillXml(content)` | Set XML via Monaco editor[0] | –– |
| `getXmlContent()` | Read XML from editor[0] | string |
| `fillXslt(content)` | Set XSLT via Monaco editor[1] | –– |
| `getXsltContent()` | Read XSLT from editor[1] | string |
| `getOutput()` | Read output from editor[2] | string |

**Example:**
```javascript
await editor.fillXml(sampleData.simpleXml);
await editor.fillXslt(sampleData.simpleXslt);
const xml = await editor.getXmlContent();
const result = await editor.getOutput();
```

---

### Execution & Interaction

| Method | Purpose | Keyboard | Waits |
|--------|---------|----------|-------|
| `clickRun()` | Press Run button (#runBtn) | – | 2s |
| `runViaKeyboard()` | Ctrl+Enter from first editor | ✓ | 2s |

**Example:**
```javascript
// Method 1: Click button
await editor.fillXml(xml);
await editor.fillXslt(xslt);
await editor.clickRun();

// Method 2: Keyboard shortcut (from anywhere)
await editor.runViaKeyboard();
```

---

### Mode Switching

| Method | Purpose | Current Check | Waits |
|--------|---------|----------------|-------|
| `getMode()` | Get current mode (XSLT\|XPATH) | Reads `window.modeManager.isXpath` | – |
| `switchToXslt()` | Activate XSLT mode | Checks mode first, skips if already XSLT | 1.5s |
| `switchToXpath()` | Activate XPath mode | Checks mode first, skips if already XPATH | 1.5s |

**Example:**
```javascript
await editor.switchToXslt();  // Safe: only switches if not already XSLT
const mode = await editor.getMode();  // Returns 'XSLT' or 'XPATH'
expect(mode).toBe('XSLT');
```

---

### Console & State Inspection

| Method | Purpose | Returns |
|--------|---------|---------|
| `getConsoleMessages()` | Read all clog output | Array<{type, msg, timestamp}> |
| `getConsoleErrors()` | Filter for errors only | Array<{type, msg}> |
| `clearConsole()` | Clear console output | – |
| `getStoredSession()` | Parse localStorage xdebugx-session-v1 | Object\|null |
| `clearStorage()` | Clear all localStorage + sessionStorage | – |
| `hasErrors()` | Check if error badge visible | boolean |
| `getErrorCount()` | Parse error count from badge | number |

**Example:**
```javascript
// Verify no console errors
const errors = await editor.getConsoleErrors();
expect(errors.length).toBe(0);

// Verify session persisted
const session = await editor.getStoredSession();
expect(session.xml).toContain('<?xml');

// Check for transformation errors
const hasErr = await editor.hasErrors();
expect(hasErr).toBe(false);
```

---

### CPI Simulation (Headers & Properties)

#### Add/Update/Delete Headers

| Method | Purpose | Params | Waits |
|--------|---------|--------|-------|
| `addHeader(name, value)` | Add header to panel | string, string | 1s debounce |
| `updateHeader(index, name, value)` | Modify existing header | number, string, string | 1s debounce |
| `deleteHeader(index)` | Remove header by row index | number | 1s debounce |
| `getHeaderCount()` | Read header count badge | – | – |

**Example:**
```javascript
// Add 2 headers
await editor.addHeader('Authorization', 'Bearer token123');
await editor.addHeader('X-Custom-Header', 'value');

// Read count
expect(await editor.getHeaderCount()).toBe(2);

// Update first header
await editor.updateHeader(0, 'X-Updated', 'newValue');

// Delete it
await editor.deleteHeader(0);
expect(await editor.getHeaderCount()).toBe(1);
```

#### Properties (Identical Interface)

| Method | Purpose | Params |
|--------|---------|--------|
| `addProperty(name, value)` | Add property | string, string |
| `updateProperty(index, name, value)` | Modify property | number, string, string |
| `deleteProperty(index)` | Remove property | number |
| `getPropertyCount()` | Read count badge | – |

**Example:**
```javascript
await editor.addProperty('environment', 'production');
await editor.addProperty('requestId', '12345');
expect(await editor.getPropertyCount()).toBe(2);
```

#### Read Output Headers/Properties (Read-Only)

| Method | Purpose | Returns |
|--------|---------|---------|
| `readOutputHeaders()` | Parse output Headers panel | Array<{name, value}> |
| `readOutputProperties()` | Parse output Properties panel | Array<{name, value}> |

**Example:**
```javascript
// Input header
await editor.addHeader('X-Test', 'original');
await editor.clickRun();

// Read what app output
const headers = await editor.readOutputHeaders();
expect(headers).toContainEqual({ name: 'X-Test', value: 'original' });
```

---

### Examples Library

| Method | Purpose | Params/Returns | Waits |
|--------|---------|--------|-------|
| `openExamplesModal()` | Open modal (#exBtn) | – | Modal open |
| `closeExamplesModal()` | Close modal if open | – | 500ms |
| `loadExample(key)` | Load example by key from EXAMPLES | string | 1.5s |
| `searchExamples(query)` | Filter examples by text | string | 800ms (debounce) |
| `getExampleCount()` | Get filtered count badge | – | number |
| `setAutoRunExamples(bool)` | Toggle auto-run checkbox | boolean | 500ms |

**Example:**
```javascript
// Load an example
await editor.loadExample('simple-transform');
const mode = await editor.getMode();
expect(mode).toBe('XSLT');

// Search examples
await editor.openExamplesModal();
await editor.searchExamples('xpath');
const count = await editor.getExampleCount();
expect(count).toBeGreaterThan(0);
await editor.closeExamplesModal();
```

---

### Share URL Feature

| Method | Purpose | Returns | Waits |
|--------|---------|---------|-------|
| `generateShareUrl()` | Create URL from state | string (full URL) | 1.5s |
| `getShareUrlLength()` | Get generated URL length | number | –– |
| `hasShareUrlWarning()` | Check URL length warning | boolean | –– |
| `closeShareModal()` | Close share modal (Escape key) | – | 600ms |
| `loadFromShareUrl(url)` | Navigate to share URL | – | 3s + Saxon |
| `hasPendingShareData()` | Check if share data detected | boolean | – |

**Example:**
```javascript
// Generate share URL
await editor.fillXml(sampleData.simpleXml);
await editor.fillXslt(sampleData.simpleXslt);
const shareUrl = await editor.generateShareUrl();
expect(shareUrl).toContain('?s=');

// Load from share URL (round-trip test)
await editor.loadFromShareUrl(shareUrl);
const loadedXml = await editor.getXmlContent();
expect(loadedXml).toContain('<?xml');
```

---

## Test Data & Fixtures

All sample data in **`tests/fixtures/sample-data.js`** exported as `sampleData` object:

### Transform Examples

| Key | Purpose | Use Case |
|-----|---------|----------|
| `simpleXml` | 2-user dataset | Basic transforms, most common tests |
| `simpleXslt` | Standard copy transform | Verify output matches input structure |
| `simpleExpectedOutput` | Reference XML | Compare actual vs expected |
| `xsltWithMessage` | Has xsl:message | Test console output, logging |
| `jsonXslt` | Outputs JSON | Transform.json format output |
| `plaintextXslt` | method="text" | Text-mode output verification |

### Error Testing

| Key | Purpose |
|-----|---------|
| `malformedXml` | Missing closing tag (validation error) |
| `invalidXslt` | Unknown XSLT element (compile error) |

### Specialized Data

| Key | Purpose |
|-----|---------|
| `cpiXslt` | XSLT with `cpi:` namespace (used in CPI simulation tests) |
| `xmlForXpath` | Book catalog (3 books, 2 genres) for XPath queries |
| `xpathExpressions` | Predefined XPath tests + expected results |
| `namespacedXml` | Default + custom namespaces |
| `emptyXml` / `emptyXslt` | Edge cases |
| `generateLargeXml(n)` | Stress testing helper (generates n records) |

**Example:**
```javascript
import { sampleData } from '../fixtures/sample-data.js';

// Use sample data
await editor.fillXml(sampleData.simpleXml);
await editor.fillXslt(sampleData.simpleXslt);

// XPath testing
const xml = await fetchData(sampleData.xmlForXpath);
const { countBooks, firstTitle } = sampleData.xpathExpressions;
```

---

## Timing Constants

| Value | Component | Purpose | Notes |
|-------|-----------|---------|-------|
| **2s** | `navigate()` | Monaco async + JS init | After networkidle |
| **300ms** | Editor fill | setValue processing | After `fillXml()`, `fillXslt()` |
| **800ms** | State debounce | 800ms app debounce | ✓ Standard timing |
| **1s** | `waitForDebounce()` | 800ms + 200ms buffer | Safe for localStorage checks |
| **1.5s** | Mode switch | Mode animation + DOM | For `switchToXslt()`, `switchToXpath()` |
| **2s** | Transform run | Saxon processing + render | After `clickRun()`, `runViaKeyboard()` |
| **500–600ms** | Modal timing | Open/close animation | share, examples |
| **1.5–3s** | Share URL load | Full navigation + Saxon init | `loadFromShareUrl()` uses 3s |

**Best Practice:** Use EditorPage methods which include timing. Only add extra waits for:
- Conditional logic: `.catch(() => false)` for visibility checks
- Debounce verification: Run transform, add delay, verify localStorage
- Complex animations: Check DOM state, then wait

---

## Test Structure Template

All tests follow the **AAA pattern** (Arrange-Act-Assert):

```javascript
import { test, expect } from '@playwright/test';
import { EditorPage } from '../utils/test-helpers.js';
import { sampleData } from '../fixtures/sample-data.js';

test.describe('Feature Name', () => {
  let editor;  // Page Object instance

  test.beforeEach(async ({ page }) => {
    // Setup: Initialize app, clear storage, set mode
    editor = new EditorPage(page);
    await editor.navigate();
    await page.evaluate(() => localStorage.clear());
    
    // Feature-specific setup
    await editor.switchToXslt();  // or switchToXpath()
  });

  test('should do something specific', async () => {
    // ARRANGE: Set up test data
    const expectedOutput = '...';

    // ACT: Perform the action
    await editor.fillXml(sampleData.simpleXml);
    await editor.fillXslt(sampleData.simpleXslt);
    await editor.clickRun();

    // ASSERT: Verify expectations
    const result = await editor.getOutput();
    expect(result).toContain(expectedOutput);
    
    // Optional: Verify state persistence
    const session = await editor.getStoredSession();
    expect(session.xml).toBeDefined();
  });
});
```

---

## Common Patterns

### Pattern 1: Transform & Verify Output

```javascript
test('should transform simple XML', async () => {
  await editor.fillXml(sampleData.simpleXml);
  await editor.fillXslt(sampleData.simpleXslt);
  await editor.clickRun();

  const output = await editor.getOutput();
  expect(output).toContain('<results>');
  expect(output).toContain('John Doe');
});
```

### Pattern 2: Session Persistence

```javascript
test('should persist session to localStorage', async () => {
  await editor.fillXml(sampleData.simpleXml);
  await editor.fillXslt(sampleData.simpleXslt);
  await editor.waitForDebounce();  // Wait for localStorage write

  const session = await editor.getStoredSession();
  expect(session.xml).toEqual(sampleData.simpleXml);
  expect(session.xslt).toEqual(sampleData.simpleXslt);
});
```

### Pattern 3: Mode Switching & Content Preservation

```javascript
test('should preserve XML when switching modes', async () => {
  const xml = sampleData.simpleXml;
  
  // Start in XSLT mode
  await editor.switchToXslt();
  await editor.fillXml(xml);
  
  // Switch to XPath
  await editor.switchToXpath();
  const xmlXpath = await editor.getXmlContent();
  expect(xmlXpath).toEqual(xml);  // Should be same!
  
  // Switch back to XSLT
  await editor.switchToXslt();
  const xmlXslt = await editor.getXmlContent();
  expect(xmlXslt).toEqual(xml);  // Still preserved
});
```

### Pattern 4: CPI Headers & Properties

```javascript
test('should add and persist CPI headers', async () => {
  // Add headers
  await editor.addHeader('Authorization', 'Bearer xyz');
  await editor.addHeader('X-Custom', 'value');
  expect(await editor.getHeaderCount()).toBe(2);

  // Verify in localStorage
  const session = await editor.getStoredSession();
  expect(session.headers).toEqual([
    { name: 'Authorization', value: 'Bearer xyz' },
    { name: 'X-Custom', value: 'value' }
  ]);
});
```

### Pattern 5: XPath Evaluation

```javascript
test('should evaluate XPath expression', async () => {
  await editor.switchToXpath();
  await editor.fillXml(sampleData.xmlForXpath);
  
  // XPath mode: enter expression in input, Ctrl+Enter evaluates
  // (The input handling is specific to your XPath UI)
  const expression = "count(//book)";
  // [-- your XPath input method here --]
  
  const messages = await editor.getConsoleMessages();
  expect(messages).toContainEqual(expect.objectContaining({ msg: '3' }));
});
```

### Pattern 6: Error Handling

```javascript
test('should report XML validation errors', async () => {
  await editor.fillXml(sampleData.malformedXml);  // Missing closing tag
  await editor.fillXslt(sampleData.simpleXslt);
  await editor.clickRun();

  const hasErr = await editor.hasErrors();
  expect(hasErr).toBe(true);
  
  const errors = await editor.getConsoleErrors();
  expect(errors.length).toBeGreaterThan(0);
});
```

### Pattern 7: Share URL Round-Trip

```javascript
test('should generate and load share URL', async () => {
  // Generate
  await editor.fillXml(sampleData.simpleXml);
  await editor.fillXslt(sampleData.simpleXslt);
  const shareUrl = await editor.generateShareUrl();
  expect(shareUrl).toContain('?s=');

  // Load from URL
  await editor.loadFromShareUrl(shareUrl);
  const xml = await editor.getXmlContent();
  const xslt = await editor.getXsltContent();
  
  expect(xml).toEqual(sampleData.simpleXml);
  expect(xslt).toEqual(sampleData.simpleXslt);
});
```

---

## When to Use Each Test File

| Test File | Feature | Example Topics |
|-----------|---------|-----------------|
| **smoke.spec.js** | Basic sanity | App loads, UI visible, mode toggle works |
| **xslt-transform.spec.js** | Core XSLT | Transform execution, output parsing, keyboard shortcuts, errors |
| **xpath-evaluation.spec.js** | XPath mode | Expression evaluation, predicates, empty sets, result formatting |
| **cpi-simulation.spec.js** | CPI runtime | Add/update/delete headers, properties, CPI rewriting, interceptors |
| **mode-switching.spec.js** | Mode transitions | XSLT ↔ XPath, content preservation, mode persistence |
| **session-management.spec.js** | localStorage | Session persist, cross-tab, reload, mode state |
| **examples-library.spec.js** | Examples | Modal open/close, category nav, search, auto-run, mode switching |
| **share-url.spec.js** | Share feature | URL generation, encoding, round-trip, corruption, length warnings |

---

## New Test Checklist

Before committing a new test, verify:

- [ ] **Setup** — `beforeEach` clears localStorage, sets correct mode
- [ ] **Timing** — Uses EditorPage waits, not arbitrary `waitForTimeout`
- [ ] **Fixtures** — Uses `sampleData.*` from sample-data.js, not inline data
- [ ] **AAA Pattern** — Arrange, Act, Assert clearly separated
- [ ] **No Page Leaks** — All editors/storage cleared between tests
- [ ] **Error Handling** — Graceful `.catch(() => false)` for optional checks
- [ ] **Isolation** — Test doesn't depend on other tests running first
- [ ] **Readability** — Variable names clear, assertions obvious
- [ ] **Documentation** — Test name describes what it verifies (e.g., "should persist headers to localStorage")

---

## Additional Resources

For comprehensive architecture, detailed examples, troubleshooting, and debugging guides, see:

- **[.github/instructions/testing.instructions.md](../.github/instructions/testing.instructions.md)** — Full technical guide
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** — Development workflow
- **[playwright.config.js](../playwright.config.js)** — Test configuration
- **[tests/utils/test-helpers.js](utils/test-helpers.js)** — Complete EditorPage API with JSDoc

---

**Last Updated:** March 2026 | **Test Suite Version:** 1.0 (61 tests, 7 files, 100% passing)
