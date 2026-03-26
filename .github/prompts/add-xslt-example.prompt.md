---
description: "Add a new XSLT or XPath example to the XSLTDebugX library with XML input, transformation, and metadata"
argument-hint: "Example description (e.g., 'Date formatting with timezone conversion')"
---

Generate a complete example entry for [js/examples-data.js](../js/examples-data.js).

## Input Requirements

Ask the user for:
1. **Example description** — what the example demonstrates
2. **Category** — which category it belongs to (transform, aggregation, format, cpi, xpath)
3. **Sample XML input** — representative test data
4. **Expected output** — what the transformation should produce

## Output Format

Produce a complete JavaScript object ready to paste into `EXAMPLES`:

```javascript
exampleKey: {
  label: 'Display Name',
  icon: '🔄',
  desc: 'One-line description (max 60 chars)',
  cat: 'categoryKey',
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<Root>
  <!-- Sample XML input -->
</Root>`,
  xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>
  
  <!-- Explanatory comment about the transformation -->
  
  <xsl:template match="/">
    <!-- Transformation logic -->
  </xsl:template>
</xsl:stylesheet>`
}
```

## Guidelines

**Example Key:**
- Use camelCase
- Descriptive and unique
- No spaces or special chars

**Icon Selection:**
- 🔁 Identity, copy
- ✏️ Rename, edit
- 🔍 Filter, search
- 🏷️ Namespace, tag
- 🔢 Sort
- 🧹 Clean
- 🎯 Group
- ✂️ Split
- 🔗 Merge
- 📅 Date
- 💰 Currency
- 📊 Format
- 📄 Document
- ⚠️ Error
- ƒx XPath

**XSLT Best Practices:**
- Always use `version="3.0"`
- Include `xmlns:xs` for XPath functions
- Use `exclude-result-prefixes` to prevent namespace leakage
- Add 2-5 line comment explaining the pattern
- Show idiomatic XSLT 3.0 (avoid 1.0 workarounds)

**CPI Examples:**
- Include `xmlns:cpi="http://sap.com/it/cpi/scripting"`
- Add `exclude-result-prefixes="cpi"`
- Use `<xsl:param name="exchange"/>` for CPI context
- Example: `cpi:setHeader($exchange, 'HeaderName', 'value')`

**XPath Examples:**
- Set `cat: 'xpath'`
- Leave `xslt: ''` empty
- Add `xpathExprs` array with clickable example expressions

## Validation

Before presenting the example:
- [ ] Example key is unique camelCase
- [ ] Category exists in CATEGORIES (transform, aggregation, format, cpi, xpath)
- [ ] XML has proper declaration
- [ ] XSLT has version="3.0"
- [ ] XSLT includes explanatory comment
- [ ] Icon is single emoji
- [ ] Description ≤60 chars
- [ ] Code is well-formatted and indented

Provide the complete example object ready to insert, along with the category section it should be added to.
