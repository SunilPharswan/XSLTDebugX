# Critical Constraints & Architecture Patterns

These are the **must-know patterns** and constraints for XSLTDebugX development. Understanding these prevents bugs and performance issues.

---

## 1. Global Namespace Pollution

**The Problem:** No module system. All code runs in global scope.

**The Pattern:**
- Public API functions: unprefixed, e.g., `runTransform()`
- Private/internal functions: `_prefix`, e.g., `_rewriteCPICalls()`
- All global variables: descriptive names like `kvData`, `eds`, `saxonReady`

**Why It Matters:**
- Adding unprefixed function breaks if another module has same name
- Prefix signals "don't call this from outside this module"

**Correct Pattern:**
```javascript
// ✅ Public API (module-level)
function loadExample(key) { ... }

// ✅ Private (underscore prefix)
function _findExampleByKey(key) { ... }
function _validateExampleData(data) { ... }

// ❌ Don't do this
function validateExample(data) { }  // Unprefixed, looks public but isn't
function exampleValidator(data) { } // Global namespace pollution
```

---

## 2. Editor Model Isolation

**The Problem:** XSLT mode and XPath mode need different XML editors with different content.

**The Pattern:**
- Two separate XML models: `xmlModelXslt` and `xmlModelXpath`
- Only **one active** at any time
- Always check `modeManager.isXpath` before reading/writing XML

**Why It Matters:**
- Switching modes without syncing models → data loss
- Editing XML in wrong model → changes don't persist
- XSLT mode and XPath mode have different validation rules

**Correct Pattern:**
```javascript
// ✅ Reading XML safely
function getXmlContent() {
  const activeModel = modeManager.isXpath ? xmlModelXpath : xmlModelXslt;
  return activeModel.getValue();
}

// ❌ Don't do this
function getXmlContent() {
  return eds.xml.getValue();  // Which model?
  // Different modes have different content!
}

// ✅ Setting XML safely
function setXml(content) {
  const activeModel = modeManager.isXpath ? xmlModelXpath : xmlModelXslt;
  activeModel.setValue(content);
}

// ✅ Syncing models (done in mode-manager.js)
function switchToXpath() {
  xmlModelXpath.setValue(xmlModelXslt.getValue());
  modeManager.setMode('XPath');
}
```

---

## 3. Saxon-JS Async Readiness

**The Problem:** Saxon-JS loads **asynchronously** from CDN. Code that runs immediately might fail.

**The Pattern:**
- Always check `saxonReady` before calling transform
- `saxonReady` set to true only after Saxon-JS fully loaded
- Check happens in `runTransform()` and similar entry points

**Why It Matters:**
- Page loads and buttons get rendered before Saxon loads
- If user clicks "Run XSLT" before Saxon ready → silent fail
- Saxon loads in ~100-500ms depending on network

**Correct Pattern:**
```javascript
// ✅ Check before transform
async function runTransform() {
  if (!saxonReady) {
    clog('Saxon.JS not ready. Please wait...', 'warn');
    return;
  }
  // Safe to proceed with Saxon
  try {
    const result = await SaxonJS.XPath.evaluate(...);
  } catch (err) {
    clog(err.message, 'error');
  }
}

// ❌ Don't assume Saxon is ready
function runTransform() {
  const result = SaxonJS.XPath.evaluate(...);  // Might fail!
}

// ✅ Setting ready flag (in state.js initialization)
window.addEventListener('load', () => {
  // Saxon loaded, safe to mark ready
  saxonReady = true;
  clog('Saxon.JS ready', 'success');
});
```

---

## 4. CPI Simulation Rewriting

**The Problem:** CPI functions (`cpi:setHeader`, etc.) must be rewritten to JavaScript to work in browser.

**The Pattern:**
1. Before transform: Rewrite `cpi:*` calls to `js:*` namespace conversion
2. Inject JavaScript interceptor functions (`_cpiSetHeader`, etc.)
3. Pass Headers/Properties as `xsl:param`
4. Add `exclude-result-prefixes="js"` to prevent `js:` namespace in output
5. Capture output headers from interceptor object

**Why It Matters:**
- CPI simulation only works with rewriting; otherwise `cpi:` functions undefined
- Error line mapping shifts due to rewriting (fragile!)
- Rewriting logic is complex; don't modify without testing

**Correct Pattern:**
```javascript
// ✅ Before transform (in transform.js)
function runTransform() {
  let xslt = eds.xslt.getValue();
  
  // Rewrite CPI calls
  xslt = rewriteCPICalls(xslt);
  xslt = ensureJsExcluded(xslt);
  
  // Build params from kvData
  const params = buildParamsXPath();
  
  // Run with params
  const result = SaxonJS.XPath.evaluate(xslt, {
    params: params
  });
}

// ❌ Don't change rewriting logic lightly
// Line mapping is fragile; changes shift error line numbers!
```

**In XSLT:**
```xslt
<!-- ✅ After rewriting, looks like this -->
<xsl:stylesheet xmlns:js="http://saxonica.com/ns/interop.module"
                exclude-result-prefixes="js">
  <xsl:template match="/">
    <xsl:call-template name="js:_cpiSetHeader">
      <xsl:with-param name="name">X-Custom</xsl:with-param>
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```

---

## 5. Validation Debouncing

**The Problem:** Validating on every keystroke → CPU spike, UI freeze on large files.

**The Pattern:**
- Both XML and XSLT validation debounced at **800ms**
- After keystroke, wait 800ms. If another keystroke comes, restart timer.
- Only validate after user stops typing

**Why It Matters:**
- Large XSLT files (>50KB) take time to parse
- Validation every keystroke = ~50 validations per second while typing
- Debouncing reduces to 1-2 validations per pause

**Correct Pattern:**
```javascript
// ✅ Debounced validation (in panes.js)
let xsltDebounce;
let xmlDebounce;

eds.xslt.onDidChangeModelContent(() => {
  clearTimeout(xsltDebounce);
  xsltDebounce = setTimeout(() => {
    validateXslt();
  }, 800);  // Wait 800ms after last keystroke
});

// ✅ Suppress spurious validation after programmatic changes
// (e.g., loading example, pasting from URL)
function loadExample(key) {
  _suppressNextValidation = true;  // Flag it
  
  eds.xslt.setValue(example.xslt);
  eds.xml.setValue(example.xml);
  
  // By the time first debounce fires, flag is false again
  setTimeout(() => {
    _suppressNextValidation = false;
  }, 100);
}

// ✅ Validation checks flag
function validateXslt() {
  if (_suppressNextValidation) return;  // Skip
  
  const xslt = eds.xslt.getValue();
  const result = validateXsltWellFormedness(xslt);
  // ...
}
```

---

## 6. Share URL Length Limits

**The Problem:** Browsers cap URLs at ~2,000-3,000 characters. Large XSLT + XML exceed this.

**The Pattern:**
- Share URL encodes state as `?state=...` query param
- Encoding is gzip-compatible, but has hard limit
- Large documents silently fail to share (no warning shown)
- User won't know until they try to load shared URL

**Why It Matters:**
- CPI examples with full XSLT + XML often exceed limit
- XSLT >2KB + XML >1KB = likely exceed limit
- Shared URLs won't work without warning

**Workaround:**
- Share as file upload instead of URL (future feature)
- Or break large transforms into smaller pieces

**Implementation Note:**
```javascript
// ✅ Share generates URL, no validation
function generateShareUrl() {
  const state = {
    xml: eds.xml.getValue(),
    xslt: eds.xslt.getValue(),
    // ... kvData, mode, etc.
  };
  
  const encoded = encodeState(state);
  const url = window.location.origin + '?state=' + encoded;
  
  // URL might be >2000 chars, but we don't warn
  // User will discover on load failure
  return url;
}

// ❌ Don't rely on share URL for large documents
```

---

## 7. localStorage Versioning

**The Problem:** If storage structure changes, old stored sessions become incompatible.

**The Pattern:**
- Storage key is versioned: `xdebugx-session-v1`, not just `xdebugx-session`
- If schema changes, bump version: `xdebugx-session-v2`
- Old version ignored, user gets fresh state
- No data loss, just reset on major version bump

**Why It Matters:**
- Users have old sessions in localStorage from weeks ago
- If you add new field without versioning, parsing breaks
- Versioning gracefully degrades without corrupting

**Correct Pattern:**
```javascript
// ✅ Versioned storage key
const STORAGE_KEY = 'xdebugx-session-v1';

// ✅ On load, gracefully handle version mismatch
function loadSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;  // No session
  
  try {
    return JSON.parse(stored);
  } catch (err) {
    clog('Session corrupted, starting fresh', 'warn');
    return null;
  }
}

// ✅ If schema changes, bump version
// const STORAGE_KEY = 'xdebugx-session-v2';
// Old v1 sessions ignored, users get fresh state

// ❌ Don't modify without versioning
// const STORAGE_KEY = 'xdebugx-session';
// If schema changes, old sessions break!
```

---

## 8. Mode Switching Timing

**The Problem:** Mode switch triggers UI animations and model reloads asynchronously.

**The Pattern:**
- UI switch is async but deterministic (1.5s wait)
- Always wait for mode animation to complete before interacting with mode-specific UI
- Check indicator changes before reading/writing mode-specific content

**Why It Matters:**
- XPath input field doesn't exist in XSLT mode (DOM not rendered)
- XSLT editor still displayed briefly after mode switch starts
- Code trying to access XPath input immediately = element not found

**Correct Pattern:**
```javascript
// ✅ Switch and wait for full UI update
async function switchToXPath() {
  await modeManager.setMode('XPATH');
  await page.waitForSelector('#xpathInput');  // In tests
  // Now safe to interact with XPath-specific UI
}

// ✅ Check mode before accessing mode-specific UI
function setXPathInput(expr) {
  if (!modeManager.isXpath) {
    clog('Must be in XPath mode', 'warn');
    return;
  }
  const input = document.getElementById('xpathInput');
  input.value = expr;
}

// ❌ Don't assume mode switch completes instantly
async function switchToXPath() {
  modeManager.setMode('XPATH');
  // Immediately access XPath input
  document.getElementById('xpathInput').value = '//Item';  // Might not exist yet!
}
```

---

## Summary Checklist

Before committing code, verify:

- [ ] **No global namespace pollution** — Unprefixed functions are intentional public API
- [ ] **Model isolation respected** — Check `modeManager.isXpath` before reading XML
- [ ] **Saxon readiness checked** — `if (!saxonReady)` before transform
- [ ] **CPI rewriting understood** — Don't modify `rewriteCPICalls()` lightly
- [ ] **Debouncing respected** — Validation wait 800ms, no changes to debounce timing
- [ ] **localStorage versioned** — Schema changes bump version
- [ ] **Mode timing respected** — Wait for animations before mode-specific access
- [ ] **Cleanup done properly** — Restore `console.log`, dispose Monaco models

---

## References

- **[copilot-instructions.md](../.github/copilot-instructions.md)** — Full architecture overview
- **[CODE_STYLE.md](./CODE_STYLE.md)** — Naming conventions and code style
- **[features.instructions.md](../instructions/features.instructions.md)** — 200+ features with locations
- **[transform.instructions.md](../instructions/transform.instructions.md)** — Deep dive on CPI simulation
