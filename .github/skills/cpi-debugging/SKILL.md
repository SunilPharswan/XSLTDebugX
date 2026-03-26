---
name: cpi-debugging
description: 'Debug SAP CPI simulation issues in XSLTDebugX. Use when CPI headers/properties missing, cpi:setHeader not working, cpi:getHeader returning empty, namespace errors, XSLT line number mismatch, CPI extension call failures.'
argument-hint: 'Issue description (e.g., "cpi:setHeader not capturing values")'
---

# CPI Simulation Debugging

## When to Use

- CPI headers or properties not appearing in Output panels
- `cpi:setHeader` / `cpi:setProperty` calls not capturing values
- `cpi:getHeader` / `cpi:getProperty` returning empty strings
- Namespace errors related to `cpi:` or `js:` prefixes
- XSLT error line numbers don't match source
- Transform runs in real CPI but not in XSLTDebugX

## How CPI Simulation Works

XSLTDebugX rewrites XSLT before running it through Saxon-JS to simulate SAP CPI runtime behavior.

### Rewriting Process

**Original XSLT:**
```xml
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  exclude-result-prefixes="cpi">
  
  <xsl:param name="exchange"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'ContentType', 'application/xml')"/>
  <xsl:variable name="client" select="cpi:getHeader($exchange, 'SAPClient')"/>
</xsl:stylesheet>
```

**Rewritten (internal):**
```xml
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:js="http://saxonica.com/ns/globalJS"
  exclude-result-prefixes="js">
  
  <xsl:param name="exchange"/>
  <xsl:value-of select="js:cpiSetHeader($exchange, 'ContentType', 'application/xml')"/>
  <xsl:variable name="client" select="js:cpiGetHeader($exchange, 'SAPClient')"/>
</xsl:stylesheet>
```

**Key transformations:**
1. `xmlns:cpi="..."` → `xmlns:js="http://saxonica.com/ns/globalJS"`
2. `cpi:setHeader(` → `js:cpiSetHeader(`
3. `cpi:setProperty(` → `js:cpiSetProperty(`
4. `cpi:getHeader(` → `js:cpiGetHeader(`
5. `cpi:getProperty(` → `js:cpiGetProperty(`
6. Inject `exclude-result-prefixes="js"` (prevents namespace leak)

### JavaScript Interceptors

Saxon-JS maps `js:` namespace to `window.*` functions:

```javascript
// Capture values into cpiCaptured object
window.cpiSetHeader = ($exchange, name, value) => {
  cpiCaptured.headers[name] = value;
  return '';  // Return empty string (mirrors CPI)
};

// Read from input Headers/Properties panels
window.cpiGetHeader = ($exchange, name) => {
  const row = kvData.headers.find(r => r.name === name);
  return row?.value ?? '';
};
```

**Critical:** Saxon evaluates ALL arguments before calling the JS function. This means dynamic expressions like `concat('REF-', //Id)` or `$someParam` are fully computed.

## Common Issues

### 1. Headers/Properties Not Captured

**Symptoms:**
- Output Headers/Properties panels show "— none —"
- `cpi:setHeader` / `cpi:setProperty` called but values missing

**Causes:**
- Missing `exclude-result-prefixes="cpi"` in original XSLT
- `cpi:` namespace not declared
- Function call syntax error

**Fix:**
```xml
<!-- ✅ Correct -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  exclude-result-prefixes="cpi">
  
  <xsl:param name="exchange"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'MyHeader', 'MyValue')"/>
</xsl:stylesheet>

<!-- ❌ Missing namespace declaration -->
<xsl:value-of select="cpi:setHeader($exchange, 'MyHeader', 'MyValue')"/>
<!-- Error: No namespace binding for prefix 'cpi' -->

<!-- ❌ Missing $exchange param -->
<xsl:value-of select="cpi:setHeader('MyHeader', 'MyValue')"/>
<!-- Error: Function signature mismatch -->
```

**Verify:**
- Console shows: `CPI extension calls detected — rewriting to js: namespace`
- No error messages about namespace bindings
- Check Output Headers/Properties counts update after transform

### 2. cpi:getHeader Returning Empty

**Symptoms:**
- `cpi:getHeader` / `cpi:getProperty` returns empty string
- Console warns: `cpi:getHeader — 'HeaderName' not found`

**Causes:**
- Header/property not added to input panels before running transform
- Name mismatch (case-sensitive, whitespace matters)

**Fix:**
1. Add header/property to input panels BEFORE running transform
2. Verify exact name matches (case-sensitive):
   ```xml
   <!-- Input panel: SAPClient = 100 -->
   <xsl:variable name="client" select="cpi:getHeader($exchange, 'SAPClient')"/>
   ✅ Returns: "100"
   
   <xsl:variable name="client" select="cpi:getHeader($exchange, 'sapclient')"/>
   ❌ Returns: "" (case mismatch)
   ```

**Debug:**
- Open console → filter for "cpi:getHeader" messages
- Check Headers/Properties panel for typos
- Copy-paste names to avoid whitespace issues

### 3. Namespace Errors

**Symptoms:**
- `Error: No namespace binding for prefix 'cpi'`
- `Namespace 'js' leaks into output XML`

**Causes:**
- Missing `xmlns:cpi` declaration
- Missing `exclude-result-prefixes`
- Manual `js:` namespace interference

**Fix:**
```xml
<!-- ✅ Complete CPI namespace declaration -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  exclude-result-prefixes="cpi">

<!-- ❌ Missing exclude-result-prefixes -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting">
<!-- Result: cpi: namespace appears in output -->

<!-- ❌ Manual js: namespace declaration -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  xmlns:js="http://my-custom-namespace">
<!-- Conflict with rewriting logic -->
```

**Auto-fixes:**
- XSLTDebugX automatically adds `exclude-result-prefixes="js"` during rewriting
- Never manually declare `xmlns:js` in XSLT

### 4. Dynamic Expressions Not Evaluating

**Symptoms:**
- `cpi:setHeader` with `concat()` not working
- XPath expressions as arguments fail

**Example:**
```xml
<!-- ✅ All of these work — Saxon evaluates arguments fully -->
<xsl:value-of select="cpi:setHeader($exchange, 'OrderId', //Header/OrderId)"/>
<xsl:value-of select="cpi:setHeader($exchange, 'OrderRef', concat('REF-', //Id))"/>
<xsl:value-of select="cpi:setHeader($exchange, 'Status', if (//Amount gt 1000) then 'HIGH' else 'LOW')"/>
<xsl:value-of select="cpi:setProperty($exchange, 'ItemCount', count(//Item))"/>

<!-- ❌ Literal text without quotes -->
<xsl:value-of select="cpi:setHeader($exchange, OrderId, Value)"/>
<!-- Error: OrderId and Value treated as elements, not strings -->
```

**Debug:**
- Add `<xsl:message>` before CPI calls to log computed values:
  ```xml
  <xsl:variable name="computedRef" select="concat('REF-', //Id)"/>
  <xsl:message select="concat('Setting OrderRef to: ', $computedRef)"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'OrderRef', $computedRef)"/>
  ```
- Check console for `xsl:message` output

### 5. Error Line Numbers Don't Match

**Symptoms:**
- Saxon reports error on line 45, but that line is blank in your XSLT
- Line number offset seems random

**Cause:**
- Rewriting process modifies XSLT internally
- Error line numbers refer to the rewritten XSLT, not the original
- XPath expressions embedded in XSLT cause fragile line mapping

**Fix:**
- Look for errors ±5 lines from reported line number
- Search for the error message text instead of relying on line number
- Use `<xsl:message>` to narrow down location:
  ```xml
  <xsl:template match="Order">
    <xsl:message>DEBUG: Processing Order</xsl:message>
    <!-- Your code here -->
    <xsl:message>DEBUG: Order complete</xsl:message>
  </xsl:template>
  ```
- Check Monaco error markers (red squiggles) for validation issues

**Known issue:** Line mapping is fragile when CPI calls appear inside complex XPath predicates.

### 6. Valid NCName Errors

**Symptoms:**
- Console warns: `header/property "123-Header" skipped — not a valid xsl:param name`
- Header/property not passed to XSLT

**Cause:**
- XSLT params must be valid XML NCNames (start with letter/underscore)
- Numeric prefixes and special chars (except `.`, `-`, `_`) are invalid

**Fix:**
```xml
<!-- ✅ Valid param names -->
SAPClient
TargetSystem
Content_Type
My-Header

<!-- ❌ Invalid param names -->
123-Header        ← starts with number
Content-Type!     ← special char !
order:id          ← colon reserved for namespaces
```

**Workaround:**
- Rename headers to start with letter/underscore
- Or access via `cpi:getHeader()` instead of param injection

## Verification Checklist

When CPI calls aren't working:

- [ ] `xmlns:cpi="http://sap.com/it/cpi/scripting"` declared
- [ ] `exclude-result-prefixes="cpi"` present
- [ ] `<xsl:param name="exchange"/>` declared
- [ ] Function calls use 3 arguments: `cpi:setHeader($exchange, name, value)`
- [ ] Headers/properties added to input panels before running
- [ ] Names match exactly (case-sensitive)
- [ ] Console shows "CPI extension calls detected"
- [ ] No namespace binding errors in console

## Console Messages Reference

| Message | Meaning | Action |
|---------|---------|--------|
| `CPI extension calls detected — rewriting to js: namespace` | Rewriting triggered | Normal |
| `Passing xsl:params: SAPClient, TargetSystem` | Params injected | Verify names match |
| `cpi:getHeader — 'MyHeader' not found in Headers panel` | Missing input header | Add to Headers panel |
| `header/property "123" skipped — not a valid xsl:param name` | Invalid NCName | Rename or use cpi:getHeader |
| `xsl:message: My debug output` | Your debug trace | Check logic flow |

## Testing Pattern

Use this template to verify CPI simulation:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  exclude-result-prefixes="cpi">
  <xsl:output method="xml" indent="yes"/>
  
  <xsl:param name="exchange"/>
  <xsl:param name="TestHeader"/>  <!-- Add TestHeader=TestValue to Headers panel -->
  
  <xsl:template match="/">
    <!-- Test setHeader with static value -->
    <xsl:value-of select="cpi:setHeader($exchange, 'Static', 'StaticValue')"/>
    
    <!-- Test setHeader with dynamic value -->
    <xsl:value-of select="cpi:setHeader($exchange, 'Dynamic', concat('Ref-', //Id))"/>
    
    <!-- Test getHeader -->
    <xsl:variable name="retrieved" select="cpi:getHeader($exchange, 'TestHeader')"/>
    <xsl:message select="concat('Retrieved TestHeader: ', $retrieved)"/>
    
    <!-- Test param injection -->
    <xsl:message select="concat('Param TestHeader: ', $TestHeader)"/>
    
    <Result>
      <Message>CPI test complete</Message>
    </Result>
  </xsl:template>
</xsl:stylesheet>
```

**Expected:**
- Console: `CPI extension calls detected`
- Console: `Passing xsl:params: TestHeader`
- Console: `xsl:message: Retrieved TestHeader: TestValue`
- Console: `xsl:message: Param TestHeader: TestValue`
- Output Headers: `Static = StaticValue`, `Dynamic = Ref-[yourId]`

## References

- [transform.js](../../js/transform.js) — CPI rewriting logic (`rewriteCPICalls`, `ensureJsExcluded`)
- [Saxon-JS extension functions](https://www.saxonica.com/saxon-js/documentation/#!extensibility/js-calls)
- [SAP CPI scripting reference](https://help.sap.com/docs/cloud-integration/)
