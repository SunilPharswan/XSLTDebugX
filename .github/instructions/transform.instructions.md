---
description: "CPI simulation rewriting, Saxon-JS transform execution, namespace handling, param injection, error line mapping. Use when modifying transform.js, debugging CPI simulation, fixing namespace issues, updating interceptors."
applyTo: "js/transform.js"
---

# Transform Module Guidelines

## Purpose

Orchestrates XSLT transformation execution with SAP CPI runtime simulation:
- Rewrites `cpi:` extension calls → `js:` namespace interceptors
- Injects headers/properties as `xsl:param` values
- Captures `cpi:setHeader` / `cpi:setProperty` output
- Handles `cpi:getHeader` / `cpi:getProperty` reads
- Intercepts `xsl:message` traces
- Manages Output Headers/Properties panels

## Critical Components

### 1. rewriteCPICalls(xslt)

Rewrites XSLT to use Saxon-JS JavaScript extension functions.

**Input:** Original XSLT with `cpi:` calls
**Output:** `{ rewritten }` with `js:` calls

**Transformations:**
1. Replace `xmlns:cpi="..."` → `xmlns:js="http://saxonica.com/ns/globalJS"`
2. Strip `cpi` from `exclude-result-prefixes`
3. Rewrite function calls: `cpi:setHeader(` → `js:cpiSetHeader(`
4. Same for `setProperty`, `getHeader`, `getProperty`

**Why this works:**
- Saxon-JS evaluates ALL function arguments before calling JS interceptors
- Dynamic expressions (`concat()`, XPath paths, variables) are fully computed
- No regex extraction of argument values needed

**Edge case:** If `xmlns:js` already exists in XSLT, don't duplicate it.

### 2. ensureJsExcluded(xslt)

Prevents `js:` namespace from leaking into output.

**Rule:** `exclude-result-prefixes` must include `js` to mirror CPI runtime

**Scenarios:**
- No `exclude-result-prefixes` → inject it on `<xsl:stylesheet>`
- Has `exclude-result-prefixes` → append `"js"` to value
- Already contains `js` → no-op

**Critical:** Without this, output XML gets polluted with `xmlns:js="..."`.

### 3. buildParamsXPath()

Constructs Saxon-JS `stylesheet-params` map from Headers/Properties panels.

**Format:**
```javascript
'stylesheet-params': map { 
  QName('','exchange'): 'exchange',
  QName('','SAPClient'): '100',
  QName('','TargetSystem'): 'ECC'
}
```

**Validation:**
- NCName check: params must start with letter/underscore
- Invalid names skipped with console warning
- Values escaped: single quotes doubled (`'` → `''`)

**Always inject:** `$exchange` param (dummy value) even if not in panels.

### 4. JavaScript Interceptors

Installed during transform if `cpi:` calls detected.

```javascript
window.cpiSetHeader = ($exchange, name, value) => {
  cpiCaptured.headers[name] = value;
  return '';  // Empty string return mirrors CPI
};

window.cpiGetHeader = ($exchange, name) => {
  const row = kvData.headers.find(r => r.name === name);
  if (!row) clog(`cpi:getHeader — '${name}' not found`, 'warn');
  return row?.value ?? '';
};
```

**Value coercion:** `_cpiStrVal()` handles Saxon-JS types (nodes, arrays, objects) → strings.

**Cleanup:** Restore previous functions after transform completes.

### 5. xsl:message Interception

Saxon-JS logs messages as `console.log("xsl:message: <text>")`.

**Patch:**
```javascript
const _origConsoleLog = console.log;
console.log = function(...args) {
  if (args[0]?.startsWith('xsl:message: ')) {
    _xslMessages.push(args[0].slice(13));
  } else {
    _origConsoleLog.apply(console, args);
  }
};
```

**Post-transform:** Emit all messages to `clog()` in execution order.

**Special case:** `terminate="yes"` logged as warning, not error.

## Modification Guidelines

### Adding New CPI Functions

Example: Add `cpi:deleteHeader` support

1. **Update rewriteCPICalls:**
   ```javascript
   xslt = xslt.replace(/cpi:deleteHeader\s*\(/g, 'js:cpiDeleteHeader(');
   ```

2. **Add interceptor:**
   ```javascript
   window.cpiDeleteHeader = ($exchange, name) => {
     const key = _cpiStrVal(name);
     delete cpiCaptured.headers[key];
     return '';
   };
   ```

3. **Cleanup:**
   ```javascript
   _prevCpiDeleteHeader = window.cpiDeleteHeader;
   // ... run transform ...
   window.cpiDeleteHeader = _prevCpiDeleteHeader;
   ```

### Debugging Rewriting Issues

**Check console for:**
- `CPI extension calls detected — rewriting to js: namespace`
- `Passing xsl:params: [list]`

**Verify rewritten XSLT:**
```javascript
// Add temporary logging in runTransform():
if (hasCPI) {
  const { rewritten } = rewriteCPICalls(xsltSrc);
  console.log('--- REWRITTEN XSLT ---\n', rewritten);  // DEBUG
  xsltSrc = rewritten;
}
```

**Common issues:**
- Regex doesn't match due to whitespace around `(`
- `exclude-result-prefixes` injection fails if `<xsl:stylesheet>` is multiline
- NCName validation rejects valid params with `.` or `-`

### Error Line Mapping Fragility

**Problem:** Saxon error line numbers refer to rewritten XSLT, not original.

**Why it's hard:**
- Rewriting adds/removes lines (`xmlns:js`, stripped `cpi` namespace)
- XPath expressions in predicates can't be reliably line-mapped

**Current mitigation:**
- `findXPathExpressionLine()` searches original XSLT for error text
- Only works for lines with unique text
- Fails if expression appears multiple times

**Don't:**
- Rely on exact line numbers for complex errors
- Add more rewriting steps (increases mapping drift)

**Do:**
- Keep error messages informative with context
- Use `xsl:message` debugging instead of error line hunting

### Performance Considerations

**Spinner minimum duration:**
- Run button shows spinner for minimum 300ms
- Ensures visual feedback even for fast transforms
- Only applied if Saxon was actually invoked (not on pre-flight failures)

**Debouncing:**
- Validation debounced at 800ms (handled by `panes.js`)
- `persistSession()` also debounced at 800ms
- Don't add transform debouncing (user expects immediate execution)

### Memory Management

**Cleanup required:**
- Restore `console.log` after transform
- Restore CPI interceptor functions
- Clear `cpiCaptured` object
- Reset error counters

**Don't leak:**
- Don't keep references to old XSLT strings
- Don't accumulate `_xslMessages` across runs
- Always restore `window.*` functions even on error

## Testing Pattern

**Unit-testable functions:**
- `rewriteCPICalls(xslt)` — pure function, no side effects
- `ensureJsExcluded(xslt)` — pure function
- `isValidNCName(name)` — pure function
- `buildParamsXPath()` — depends on `kvData` global

**Integration testing:**
1. Load example with CPI calls
2. Add headers to input panels
3. Run transform
4. Verify Output Headers captured
5. Check console for expected messages

**Regression tests:**
- Identity transform (no CPI)
- CPI setHeader with static string
- CPI setHeader with `concat()`
- CPI setHeader with XPath expression
- CPI getHeader with missing header (warn)
- Invalid param names (skip with warning)
- Namespace already declared edge cases

## Common Pitfalls

**Don't:**
- Modify `lib/SaxonJS2.js` (vendor file)
- Add `xmlns:js` manually in XSLT (conflicts with rewriting)
- Assume error line numbers are accurate
- Call CPI interceptors directly from JS (only Saxon should invoke them)
- Mutate `xsltSrc` after passing to Saxon

**Do:**
- Always check `saxonReady` before running transform
- Clear error counters at start of each run
- Log CPI detection to console
- Validate NCNames before building params
- Clean up interceptors even on error path

## References

- [Saxon-JS JavaScript extension functions](https://www.saxonica.com/saxon-js/documentation/#!extensibility/js-calls)
- [SAP CPI scripting API](https://help.sap.com/docs/cloud-integration/)
- [XPath 3.1 specification](https://www.w3.org/TR/xpath-31/)
