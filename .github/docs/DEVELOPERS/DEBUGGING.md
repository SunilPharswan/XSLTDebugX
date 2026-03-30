# Browser Debugging Guide

This guide covers debugging XSLTDebugX in the browser using DevTools.

---

## Opening DevTools

**Windows/Linux:**
- `F12` — Open DevTools
- `Ctrl+Shift+I` — Alternative shortcut
- `Ctrl+Shift+C` — Inspect element mode

**Mac:**
- `Cmd+Option+I` — Open DevTools
- `Cmd+Option+U` — View page source

---

## DevTools Tabs Overview

### 1. Console Tab

**Best for:** Debugging JavaScript errors, logging, live code execution.

**What to check:**
- **Errors** (red) — JavaScript syntax/runtime errors
- **Warnings** (yellow) — Deprecated code, performance warnings
- **Info/Logs** — Application messages via `clog(msg, 'info')`

**Saxon-JS Messages:**
- Appear as logs when `saxonReady` becomes true
- XSLT compilation errors show here

**Useful Commands:**
```javascript
// Check global state
window.eds              // { xml, xslt, out } Monaco instances
window.kvData           // { headers: [...], properties: [...] }
window.saxonReady       // true if Saxon-JS loaded
window.modeManager      // { isXpath, setMode(), ... }
window.clog             // { getMessages(), clear(), ... }

// Inspect current editor values
eds.xml.getValue()
eds.xslt.getValue()

// Check localStorage
localStorage.getItem('xdebugx-session-v1')

// Get XPath history
localStorage.getItem('xdebugx-xpath-history')

// Get current mode
modeManager.isXpath     // true = XPath, false = XSLT
```

### 2. Elements Tab

**Best for:** Inspecting HTML structure, CSS styles, debugging layout issues.

**What to check:**
- **DOM structure** — Is element present? Correct hierarchy?
- **CSS classes** — Applied correctly? Theme switched?
- **Visibility** — Is element `display: none`? Hidden by parent?
- **Attributes** — Correct `id`, `data-*` attributes?

**Common Elements to Inspect:**
- `#xmlEd`, `#xsltEd`, `#outEd` — Editor pane containers
- `#modeBtn` — Mode toggle buttons
- `.kv-row` — Header/Property table rows
- `#consoleBody` — Console output area
- `.status-error` — Error count badge

### 3. Sources Tab

**Best for:** Setting breakpoints, stepping through code, debugging complex logic.

**Steps:**
1. **Navigate to file** — Left panel → `localhost:3000` → `js/` → select file
2. **Set breakpoint** — Click line number (blue dot appears)
3. **Reload page** — Execution pauses at breakpoint
4. **Step through** — Use controls: Step Over (F10), Step Into (F11), Step Out (Shift+F11)
5. **Watch expressions** — Add to watch panel to track values
6. **Call stack** — See function call hierarchy

**Useful Breakpoints:**
- `runTransform()` in `transform.js` — Before transform execution
- `switchToXpath()` in `mode-manager.js` — Mode switch logic
- `rewriteCPICalls()` in `transform.js` — CPI rewriting inspection

### 4. Network Tab

**Best for:** Monitoring file loads, checking request sizes, detection CDN issues.

**What to check:**
- **lib/SaxonJS2.js** — Bundled (should load successfully)
- **monaco-editor** — CDN load times
- **Status codes** — All 200 (OK)? Any 404 (missing)?
- **File sizes** — Bundled libs should be ~2-5 MB compressed

**Common Issues:**
- Missing CDN URLs → CORS error, Saxon-JS fails to load
- Large XSLT/XML uploads → Check payload size

### 5. Application Tab (formerly "Storage")

**Best for:** Managing browser storage, testing persistence.

**localStorage Paths:**
- `xdebugx-session-v1` — Current editor state (XSLT, XML, output, mode, kvData)
- `xdebugx-xpath-history` — Last 20 XPath expressions
- Theme preference (if stored)

**sessionStorage:**
- Used for temporary session-level data

**How to test persistence:**
```javascript
// 1. Set some data
localStorage.setItem('xdebugx-session-v1', JSON.stringify({
  xml: '<root/>',
  xslt: '<xsl:stylesheet/>',
  mode: 'XSLT'
}));

// 2. Refresh page
location.reload();

// 3. Verify data restored
console.log(localStorage.getItem('xdebugx-session-v1'));
```

**Clear storage:**
- Right-click `Cookies` → Clear All
- Or run `localStorage.clear()` in Console

### 6. Performance Tab

**Best for:** Identifying slow operations, profiling CPU usage, monitoring memory.

**Steps:**
1. **Record** — Click ⚫ button to start recording
2. **Perform action** — Click "Run XSLT" or switch mode
3. **Stop** — Click ⏹️ to stop recording
4. **Analyze** — View timeline, flame graph, frame rate

**What to look for:**
- **Frame rate** — Should stay 60 FPS (no jank)
- **Long tasks** — Yellow/red blocks indicate slow JavaScript
- **GC (garbage collection)** — Purple blocks; minimize during interaction
- **Layout thrashing** — Repeated DOM reads/writes

---

## Common Debugging Tasks

### Debug: "Transform won't run"

1. **Check Editor Content:**
   ```javascript
   console.log(eds.xslt.getValue());    // Is XSLT empty?
   console.log(eds.xml.getValue());     // Is XML empty?
   ```

2. **Check Saxon Ready:**
   ```javascript
   console.log(window.SaxonJS);         // Defined?
   console.log(saxonReady);             // true?
   ```

3. **Check Error Badge:**
   - Look at red error count in header → Click to focus error line
   - DevTools Console → Look for red error messages

4. **Check Mode:**
   ```javascript
   console.log(modeManager.isXpath);    // Is it in XPath mode?
   ```

### Debug: "Mode switch breaks everything"

1. **Verify mode indicator:**
   ```javascript
   console.log(modeManager.isXpath);    // Current mode
   modeManager.setMode('XSLT');          // Explicitly set mode
   ```

2. **Check XML model switch:**
   ```javascript
   console.log(eds.xml.getModel());     // Which model active?
   console.log(xmlModelXslt);           // Should be different from xmlModelXpath
   ```

3. **Check timing:**
   - Mode switch takes 1.5s for animation. Is code trying to interact too fast?
   - Try waiting: `await new Promise(r => setTimeout(r, 2000));`

### Debug: "CPI headers/properties not working"

1. **Check kvData:**
   ```javascript
   console.log(window.kvData);          // { headers: [...], properties: [...] }
   console.log(kvData.headers[0]);      // { name, value }
   ```

2. **Check mode:**
   ```javascript
   console.log(modeManager.isXpath);    // Must be false (XSLT mode)
   // CPI only works in XSLT mode!
   ```

3. **Check Output Headers:**
   - After transform, check right pane for "Output Headers"
   - Should show headers set by `cpi:setHeader()` calls in XSLT

4. **Check XSLT for CPI calls:**
   ```javascript
   const xslt = eds.xslt.getValue();
   console.log(xslt.includes('cpi:'));  // Should be true for CPI example
   ```

### Debug: "XPath won't evaluate"

1. **Check mode:**
   ```javascript
   console.log(modeManager.isXpath);    // Must be true
   ```

2. **Check XPath input:**
   ```javascript
   const xpathInput = document.getElementById('xpathInput');
   console.log(xpathInput.value);       // Should contain expression
   ```

3. **Check XML validity:**
   - XPath requires valid XML
   - Check left pane for validation errors (red squiggles)

4. **Check expression syntax:**
   - Try simple: `//Item` (should match if elements exist)
   - Try step-by-step: `/`, `/*`, `//`, `//Item`, etc.

### Debug: "Storage corrupt / won't restore"

```javascript
// 1. Check what's stored
const stored = localStorage.getItem('xdebugx-session-v1');
console.log(stored);

// 2. Try to parse it
try {
  const session = JSON.parse(stored);
  console.log(session);
} catch (e) {
  console.error('Not valid JSON:', e);
}

// 3. Clear and start fresh
localStorage.clear();
location.reload();
```

---

## Performance Optimization

### Profiling XSLT Transform

1. **Open Performance tab**
2. **Click ⚫ Record**
3. **Click "Run Transform"**
4. **Click ⏹️ Stop**
5. **Analyze:**
   - Look for long JavaScript frames (yellow/red)
   - Saxon compilation time
   - DOM rendering time

### Reducing Transform Time

- **Break large templates** into smaller reusable templates
- **Use keys/indexes** instead of linear search
- **Validate debouncing** is working (800ms); if too short, reduces performance
- **Check console** for unexpected validation loops

---

## Tips & Tricks

### Quick State Dump

```javascript
// Copy current state to clipboard (for sharing bug reports)
console.log(JSON.stringify({
  xml: eds.xml.getValue(),
  xslt: eds.xslt.getValue(),
  mode: modeManager.isXpath ? 'XPATH' : 'XSLT',
  kvData: window.kvData,
  errors: await window.clog.getMessages().filter(m => m.type === 'error')
}, null, 2));
```

### Pause on Exception

- DevTools Console → Settings ⚙️ → Check "Pause on exceptions"
- JavaScript will pause when error is thrown

### Local Overrides

Use Chrome DevTools Local Overrides to test code changes without reloading:
1. Sources tab → Overrides folder
2. Select override location (maps to local file)
3. Edit in DevTools; changes persist on reload

---

## Resources

- **[Browser DevTools Docs](https://developer.chrome.com/docs/devtools/)**
- **[Mozilla DevTools Guide](https://developer.mozilla.org/docs/Tools)**
- **[Safari Web Inspector](https://webkit.org/web-inspector/)**
- **[Firefox Developer Tools](https://firefox-source-docs.mozilla.org/devtools/)**
