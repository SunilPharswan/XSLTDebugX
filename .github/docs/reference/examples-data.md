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
- Leave `xslt: ''` empty (no stylesheet, pure XPath evaluation)
- Add `xpathHints` array: clickable expression suggestions for users
- **xpathHints structure**: Show progression from simple → complex
  ```javascript
  xpathHints: [
    "//Order",                           // Basic selection
    "//Order[@status='OPEN']",          // Add predicate
    "//Order[@status='OPEN']/Item"      // Navigate deeper (final expression)
  ]
  ```
- Users see these as chips below the XPath input bar
- Clicking a chip runs that expression and highlights matched nodes
- **Rule M4b** (NEW): All XPath examples MUST include `xpathHints` with at least 3 progressively complex expressions
- Final expression in hints should match the most specific/useful search pattern

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

## Validation Checklist (M1–M13)

Before committing new or modified examples, verify all checks pass:

### Metadata (M1–M3)
- [ ] **M1**: Example key is camelCase, descriptive, unique
- [ ] **M2**: Label is concise (max 40 chars), icon is single emoji or `ƒx` for XPath
- [ ] **M3**: Description is max 60 chars, explains transformation purpose

### Structure (M4–M6)
- [ ] **M4**: Category exists in CATEGORIES
- [ ] **M4b** (NEW): XPath examples include `xpathHints` array with 3+ progressively complex expressions
- [ ] **M5**: XML starts with `<?xml version="1.0" encoding="UTF-8"?>`
- [ ] **M6**: XSLT starts with `<?xml version="1.0" encoding="UTF-8"?>` and `version="3.0"`

### XSLT Syntax (M7–M9)
- [ ] **M7**: Namespace declarations present (`xmlns:xsl`, `xmlns:xs` for XSLT examples)
- [ ] **M8**: `exclude-result-prefixes` prevents namespace leakage
- [ ] **M9**: Opening comment block explains pattern (3–5 lines)

### CPI Specifics (M10–M11)
- [ ] **M10** (CPI examples only): Includes `<xsl:param name="exchange"/>` declaration
- [ ] **M11** (CPI examples only): Uses `cpi:setHeader/getHeader/setProperty/getProperty` correctly

### Completeness (M12–M13)
- [ ] **M12**: No `TODO`, `FIXME`, or placeholder text
- [ ] **M13** (NEW): All category references exist; no orphaned categories
- [ ] Example appears in Examples modal and loads without errors

### Testing (Manual)
- [ ] Open app, click Examples, find your example in correct category
- [ ] Example loads (XML, XSLT, and hints/properties pre-filled)
- [ ] XSLT mode: Click Run, output appears without errors
- [ ] XPath mode: Click hint chips, matched nodes highlight in amber
- [ ] Console shows no red errors
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
