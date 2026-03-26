---
name: xslt-example
description: 'Create new XSLT or XPath examples for XSLTDebugX library. Use when adding examples, creating transformations, building example catalog, demonstrating XSLT patterns, XPath expressions, CPI simulation scenarios.'
argument-hint: 'Example description (e.g., "Date formatting with timezone conversion")'
---

# XSLT Example Creator

## When to Use

- Adding new examples to the XSLTDebugX library
- Creating XSLT transformation demonstrations
- Building XPath expression showcases
- Documenting SAP CPI patterns

## Prerequisites

Examples live in [js/examples-data.js](../../js/examples-data.js). Structure:

```javascript
const EXAMPLES = {
  exampleKey: {
    label: 'Display Name',
    icon: '🔄',                    // Single emoji (or 'ƒx' for XPath examples)
    desc: 'One-line description',  // Max 60 chars
    cat:  'categoryKey',           // Must exist in CATEGORIES
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Root>...</Root>`,
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  ...
</xsl:stylesheet>`,
    // XPath examples only:
    xpathExpr: '//Root/Item',           // Default expression pre-loaded in XPath bar
    xpathHints: ['//Root/Item', 'count(//Item)']  // Clickable hint chips (3–15 entries)
  }
}
```

## Categories

Available in `CATEGORIES` object (mapped to sidebar buttons):

| Key | Label | When to Use |
|-----|-------|-------------|
| `transform` | Data Transformation | Rename, filter, restructure XML |
| `aggregation` | Aggregation & Splitting | Group-by, split, merge records |
| `format` | Format Conversion | Date/currency format, XML→JSON/CSV |
| `cpi` | SAP CPI Patterns | Headers, properties, IDoc, SOAP, error handling |
| `xpath` | XPath Explorer | XPath 3.1 expressions, navigation, functions |

## Procedure

### 1. Choose Category

Match task to category above. If none fit, propose new category.

### 2. Create Example Key

- Use camelCase: `dateFormatConversion`, `splitMessage`, `idocOrders05`
- Descriptive and unique
- No spaces or special chars

### 3. Write XML Input

**Requirements:**
- Start with `<?xml version="1.0" encoding="UTF-8"?>`
- Representative test data (2-5 records typical)
- Include edge cases if relevant (empty elements, nulls, special chars)
- Max ~50 lines (keep examples readable)

**CPI examples:** Use realistic SAP structures (IDoc segments, SOAP envelopes, EDI)

### 4. Write XSLT Stylesheet

**Required structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="xs">
  <xsl:output method="xml" indent="yes"/>

  <!-- Multi-line comment explaining the pattern -->

  <xsl:template match="...">
    ...
  </xsl:template>
</xsl:stylesheet>
```

**Best practices:**
- Always declare `xmlns:xs` if using XPath 3.1 functions
- Use `exclude-result-prefixes` to prevent namespace leakage
- Add explaining comments (3-5 lines) at the top
- Show idiomatic XSLT 3.0 (avoid XSLT 1.0 workarounds)
- For CPI: include `xmlns:cpi="http://sap.com/it/"` if using headers/properties

**CPI simulation:**
```xml
<xsl:param name="exchange"/>  <!-- Always available in CPI mode -->
<xsl:value-of select="cpi:setHeader($exchange, 'ContentType', 'application/json')"/>
<xsl:variable name="client" select="cpi:getHeader($exchange, 'SAPClient')"/>
```

**CPI namespace:** Always use `xmlns:cpi="http://sap.com/it/"` (the correct SAP CPI namespace URI).

### 5. Choose Icon

Select an emoji that visually represents the example:

- 🔁 Identity, copy
- ✏️ Rename, edit
- 🔍 Filter, search
- 🏷️ Namespace, tag
- 🎁 Wrap, package
- 📦 Unwrap, unpack
- 🔢 Sort, order
- 🧹 Clean, remove
- 🎯 Group, aggregate
- ✂️ Split, divide
- 🔗 Merge, join
- 📅 Date, time
- 💰 Currency, money
- 📊 Format, convert
- 📄 Document, IDoc
- 🧾 Invoice
- 🗺️ Mapping, lookup
- ⚠️ Error, fault
- 📡 SOAP, web service
- `ƒx` XPath (use `'ƒx'` in icon field — preferred for all xpath category examples)

### 6. Write Description

One line, max 60 chars. Focus on the **what** and **why**:

✅ Good:
- "Map SAP IDoc ORDERS05 to target REST API"
- "Split batch into individual messages with envelope"
- "Format amounts with locale-aware thousand separators"

❌ Bad:
- "Example for orders" (too vague)
- "This example demonstrates how to transform IDoc ORDERS05 format messages received from SAP ECC system into a REST API compatible JSON structure" (too long)

### 7. Add XPath Hints (XPath examples only)

For `cat: 'xpath'` examples, set two fields:

```javascript
xpathExpr: '//Order/Item[Qty > 10]',   // Single string — pre-loaded in XPath bar on load
xpathHints: [                           // Array — rendered as clickable chips (3–15 entries)
  '//Order/Item[Qty > 10]',
  'sum(//Item/Total)',
  'distinct-values(//Customer)',
  // ... 10–14 entries is the established library norm
]
```

**Note:** The field names are `xpathExpr` (singular string) and `xpathHints` (array). The old name `xpathExprs` is no longer used.

### 8. Insert Example

Open [js/examples-data.js](../../js/examples-data.js):
- Find the category section comment (e.g., `// ── SAP CPI PATTERNS ──`)
- Add example in alphabetical order within category
- Maintain 2-line spacing between examples

### 9. Test

1. Serve locally: `npx serve .` 
2. Open `http://localhost:3000`
3. Click Examples → your category → your example
4. Verify XML + XSLT load correctly
5. Press **Ctrl+Enter** (XSLT mode) or **Enter** (XPath mode)
6. Check output and console for errors

## Validation Checklist

Before committing:

- [ ] Example key is unique and camelCase
- [ ] Category exists in `CATEGORIES`
- [ ] XML has `<?xml version="1.0" encoding="UTF-8"?>` declaration
- [ ] XSLT has `version="3.0"` and proper namespaces
- [ ] XSLT includes explanatory comment block
- [ ] Icon is a single emoji
- [ ] Description is ≤60 chars
- [ ] Example placed alphabetically within category section
- [ ] Example runs without errors in browser
- [ ] Console shows expected output/messages

## Common Patterns

### CPI Header/Property Example

```javascript
cpiSimulation: {
  label: 'Headers & Properties',
  icon: '🏷️',
  desc: 'Set/get CPI headers and properties dynamically',
  cat: 'cpi',
  xml: `<Order><Id>12345</Id></Order>`,
  xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/"
  exclude-result-prefixes="cpi">
  
  <xsl:template match="Order">
    <xsl:value-of select="cpi:setHeader($exchange, 'OrderId', Id)"/>
    <Result>
      <Id><xsl:value-of select="Id"/></Id>
    </Result>
  </xsl:template>
</xsl:stylesheet>`
}
```

### XPath Explorer Example

```javascript
xpathNavigation: {
  label: 'Navigation & Predicates',
  icon: 'ƒx',
  desc: 'Axis navigation with positional predicates',
  cat: 'xpath',
  xml: `<Orders>
  <Order><Id>1</Id><Status>Open</Status></Order>
  <Order><Id>2</Id><Status>Closed</Status></Order>
</Orders>`,
  xslt: '',  // Leave empty for XPath mode
  xpathExpr: '//Order[1]',          // Pre-loaded default expression
  xpathHints: [                      // Clickable chips — aim for 10–14
    '//Order[1]',
    '//Order[Status="Open"]',
    '//Order[last()]/Id'
  ]
}
```

### Format Conversion (XML → JSON)

```javascript
xmlToJson: {
  label: 'XML → JSON Output',
  icon: '📊',
  desc: 'Transform XML to JSON with map/array structures',
  cat: 'format',
  xml: `<Items><Item><Name>A</Name><Price>10</Price></Item></Items>`,
  xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  
  <xsl:template match="Items">
    <xsl:text>{"items":[</xsl:text>
    <xsl:apply-templates select="Item"/>
    <xsl:text>]}</xsl:text>
  </xsl:template>
</xsl:stylesheet>`
}
```

## Troubleshooting

**Example doesn't appear in modal:**
- Check `cat` value exists in `CATEGORIES` object
- Verify JavaScript syntax (missing comma, unclosed string)
- Check browser console for parse errors

**XSLT runs but output is empty:**
- Verify `<xsl:output method="xml|text|json"/>` matches expected output
- Check template `match` patterns align with XML structure
- Add `<xsl:message>` debug statements

**CPI functions not working:**
- Ensure `xmlns:cpi="http://sap.com/it/"` is declared
- Add `exclude-result-prefixes="cpi"` to prevent namespace in output
- Use `$exchange` param: `<xsl:param name="exchange"/>`

**XPath expressions not highlighted:**
- Verify `cat: 'xpath'`
- Check `xpathHints` array syntax (must be array of strings)
- Check `xpathExpr` is a non-empty string
- Ensure expressions are valid XPath 3.1

## References

- [Saxon-JS XSLT 3.0 documentation](https://www.saxonica.com/saxon-js/documentation/)
- [XPath 3.1 specification](https://www.w3.org/TR/xpath-31/)
- [SAP CPI scripting reference](https://help.sap.com/docs/cloud-integration/)
- [Example library source](../../js/examples-data.js)
