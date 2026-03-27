---
description: "XSLT and XPath example library structure, categories, example format, validation rules. Use when adding examples, modifying categories, updating example metadata."
applyTo: "js/examples-data.js"
---

# Examples Library Guidelines

## Structure

Two main objects: `CATEGORIES` and `EXAMPLES`

### CATEGORIES

Single source of truth for sidebar buttons and example sections:

```javascript
const CATEGORIES = {
  categoryKey: { 
    label: 'Display Name',        // Shows in sidebar + grid
    accent: '#hexcolor'            // Tag background color
  }
}
```

**Rules:**
- Adding a new category auto-creates: sidebar button + grid section + tag color
- Never orphan categories (ensure at least one example uses it)
- Accent colors should be distinct and accessible

**Current categories:**
- `transform` — Data Transformation (#3fb950, green)
- `aggregation` — Aggregation & Splitting (#f5a524, amber)
- `format` — Format Conversion (#c084fc, purple)
- `cpi` — SAP CPI Patterns (#0070f2, blue)
- `xpath` — XPath Explorer (#f5a524, amber)

### EXAMPLES

```javascript
const EXAMPLES = {
  exampleKey: {                    // camelCase, unique, descriptive
    label: 'Display Name',         // Shows in card header
    icon: '🔄',                     // Single emoji
    desc: 'One-line description',  // Max 60 chars, shows in card
    cat: 'categoryKey',            // Must exist in CATEGORIES
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<Root>...</Root>`,                 // Input XML with declaration
    xslt: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="3.0"...>
  <!-- Comment explaining pattern -->
</xsl:stylesheet>`,                // XSLT 3.0 transformation
    xpathExprs: ['//Item', '...']  // Optional: XPath mode only
  }
}
```

## Validation Rules

### Example Key
- ✅ `dateFormatConversion`, `idocOrders05`, `splitMessage`
- ❌ `date-format`, `Date_Format`, `example1`

### Icon
- Use single emoji that represents the transformation visually
- Common: 🔁 (identity), ✏️ (rename), 🔍 (filter), 📅 (date), 💰 (currency), ✂️ (split), 🔗 (merge)
- XPath examples: Use `ƒx` (not emoji)

### Description
- Max 60 characters
- Focus on **what** and **why**, not implementation
- ✅ "Map IDoc ORDERS05 to REST API"
- ❌ "This example shows how to transform..."

### Category
- Must exist in `CATEGORIES` object
- XPath examples must use `cat: 'xpath'`

### XML Input
- Always start with `<?xml version="1.0" encoding="UTF-8"?>`
- 2-5 sample records (keep readable)
- Include edge cases if demonstrating error handling
- Realistic structure for CPI examples (IDoc segments, SOAP)

### XSLT Stylesheet
- Always `version="3.0"`
- Include namespace declarations: `xmlns:xsl`, `xmlns:xs`
- Use `exclude-result-prefixes` to prevent namespace leakage
- Add 3-5 line comment block explaining the pattern
- Show idiomatic XSLT 3.0 (avoid 1.0 workarounds)

**CPI examples:**
```xml
xmlns:cpi="http://sap.com/it/"
exclude-result-prefixes="cpi xs"
<xsl:param name="exchange"/>
```

### XPath Expressions (XPath examples only)
- Set `cat: 'xpath'`
- Leave `xslt: ''` empty
- Add `xpathExprs` array with 3-7 clickable expressions
- Show progression: simple → complex

## Organization

Examples are grouped by category with comment dividers:

```javascript
// ── DATA TRANSFORMATION ──────────────────────────────────────────

identityTransform: { ... },
renameElements: { ... },

// ── SAP CPI PATTERNS ──────────────────────────────────────────

idocOrders05: { ... },
```

**Alphabetically sort within each category** for maintainability.

## Common Patterns

### Identity Transform Template
```javascript
identityTransform: {
  label: 'Identity Transform',
  icon: '🔁',
  desc: 'Copy XML as-is — foundation for CPI mappings',
  cat: 'transform',
  xml: `<Root><Item>Test</Item></Root>`,
  xslt: `<xsl:template match="@* | node()">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
    </xsl:copy>
  </xsl:template>`
}
```

### CPI Simulation Template
```javascript
cpiExample: {
  label: 'Headers & Properties',
  icon: '🏷️',
  desc: 'Set/get CPI headers dynamically',
  cat: 'cpi',
  xml: `<Order><Id>123</Id></Order>`,
  xslt: `<xsl:param name="exchange"/>
  <xsl:value-of select="cpi:setHeader($exchange, 'OrderId', //Id)"/>`
}
```

### XPath Explorer Template
```javascript
xpathExample: {
  label: 'Navigation & Predicates',
  icon: 'ƒx',
  desc: 'Axis navigation with positional predicates',
  cat: 'xpath',
  xml: `<Orders><Order><Id>1</Id></Order></Orders>`,
  xslt: '',
  xpathExprs: [
    '//Order[1]',
    '//Order/Id',
    'count(//Order)'
  ]
}
```

## Testing Checklist

After adding an example:
- [ ] Example loads without JavaScript errors
- [ ] XML + XSLT appear in correct editors
- [ ] Transform runs successfully (Ctrl+Enter)
- [ ] Console shows expected messages
- [ ] Output is formatted correctly
- [ ] Example appears in correct category section
- [ ] Icon and description render properly

## Troubleshooting

**Example doesn't appear:**
- Check JavaScript syntax (missing comma, unclosed backtick)
- Verify category exists in `CATEGORIES`
- Check browser console for parse errors

**Transform fails:**
- Verify XSLT has `version="3.0"`
- Check namespace declarations
- Ensure `exclude-result-prefixes` includes all non-output namespaces

**Wrong category:**
- Update `cat` value to match CATEGORIES key
- Check category accent color renders correctly
