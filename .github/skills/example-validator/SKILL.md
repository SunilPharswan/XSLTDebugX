---
name: example-validator
description: 'Audit all XSLT and XPath examples in the XSLTDebugX library. Use when checking example quality, before adding new examples, after bulk edits to examples-data.js, or to find broken/incomplete examples.'
argument-hint: 'Optional: category to check (transform, aggregation, format, cpi, xpath) or "all"'
---

# Example Validator

## When to Use

- Full audit before a release
- After adding or editing examples in `js/examples-data.js`
- When a reported example fails to run in the browser
- To check consistency across the entire library

---

## Validation Procedure

### Step 1 — Read the Source

Read the full file: `js/examples-data.js`

Extract:
- `CATEGORIES` keys → build the set of valid category values
- All `EXAMPLES` entries → key + all fields

### Step 2 — Run All Checks

For **every** example, run the checks below in order. Collect all failures before reporting.

---

## Check Catalogue

### M1 — Key Format
- Must match `/^[a-z][a-zA-Z0-9]+$/` (camelCase, starts with lowercase letter)
- ❌ `date-format`, `Date_Format`, `example1`, `test`

### M2 — Required Fields Present
Every example must have: `label`, `icon`, `desc`, `cat`, `xml`
- XSLT examples must also have `xslt`
- XPath examples must have `xpathExpr` (single string — default expression) and `xpathHints` (array of clickable hints)

### M3 — Label
- Must be a non-empty string
- Max 50 characters

### M4 — Icon
- **XSLT examples** (`cat !== 'xpath'`): must be a single emoji character
- **XPath examples** (`cat === 'xpath'`): `'ƒx'` is preferred; unicode math symbols (e.g. `'∑'`, `'⚡'`) are acceptable; plain emoji are discouraged but not blocking

### M5 — Description Length
- Max 60 characters
- Must not start with "This example" or "Example of"

### M6 — Category Valid
- `cat` value must be a key in `CATEGORIES` (`transform`, `aggregation`, `format`, `cpi`, `xpath`)
- XPath examples must use `cat: 'xpath'`

### M7 — XML Input
- Must start with `<?xml version="1.0" encoding="UTF-8"?>` (or `<?xml version='1.0'`)
- Must be well-formed: every opened tag must be closed (basic heuristic: count `<tagname` vs `</tagname>` for top-level element)
- Must not be an empty string

### M8 — XSLT Stylesheet (XSLT examples only, `cat !== 'xpath'`)
- Must start with `<?xml version="1.0"`
- Must contain `version="3.0"` on `<xsl:stylesheet`
- Must declare `xmlns:xsl="http://www.w3.org/1999/XSL/Transform"`
- Should declare `xmlns:xs="http://www.w3.org/2001/XMLSchema"` (warn if missing)
- `exclude-result-prefixes` is **not mandatory**: the `xsl` prefix is automatically excluded by the processor, so stylesheets with only `xmlns:xsl` do not need it. **Warn** (do not error) if additional namespaces (`xs`, `cpi`, etc.) are declared but `exclude-result-prefixes` is absent — those namespace nodes will leak into output elements.
- Must contain at least one `<xsl:template`

### M9 — XPath Examples (`cat === 'xpath'`)
- `xslt` field should be absent or empty string (`''`); flag if it contains a full stylesheet
- `xpathExpr` must be a non-empty string (the expression pre-loaded into the XPath input bar)
- `xpathHints` must be an array of non-empty strings (clickable hint chips shown below the input bar)
- `xpathHints` must have between 3 and 15 entries (10–14 is the established norm in this library)
- Field names are `xpathExpr` and `xpathHints` — not `xpathExprs` (old name, no longer used)

### M10 — CPI Examples (`cat === 'cpi'`)
- XSLT must declare `xmlns:cpi="http://sap.com/it/"` (this is the correct SAP CPI namespace URI)
- If `xmlns:cpi` is declared, `exclude-result-prefixes` should include `cpi` (warn if missing)
- If the example uses `cpi:setHeader` / `cpi:getHeader` / `cpi:setProperty` / `cpi:getProperty`, it must contain `<xsl:param name="exchange"` (required by the CPI simulation engine)
- All `cpi:` calls must pass `$exchange` as the first argument

### M11 — Duplicate Keys
- Every key in `EXAMPLES` must be unique (JS silently overwrites duplicate keys — last one wins)
- If any key appears more than once, both instances must be flagged

### M12 — Orphan Categories
- Every key in `CATEGORIES` must be referenced by at least one example
- Flag categories with zero examples

---

## Reporting Format

Group findings by severity:

### 🔴 Errors (must fix — example will not work)
| Key | Check | Issue |
|-----|-------|-------|
| `exampleKey` | M8 | Missing `version="3.0"` on `<xsl:stylesheet>` |

### 🟡 Warnings (should fix — may cause subtle issues)
| Key | Check | Issue |
|-----|-------|-------|
| `exampleKey` | M8 | Missing `xmlns:xs` declaration |

### 🟢 Summary
```
Total examples checked: N
  XSLT examples:  N  (transform: N, aggregation: N, format: N, cpi: N)
  XPath examples: N
Errors:   N
Warnings: N
```

If **zero issues found**, output only the summary with a ✅.

---

## Fix Guidance

After reporting, for each error suggest the exact fix:

```
Fix for exampleKey / M8:
  Change: <xsl:stylesheet version="1.0" ...>
  To:     <xsl:stylesheet version="3.0" ...>
```

Apply fixes directly to `js/examples-data.js` only when the user confirms or asks you to fix them. Do not auto-fix without confirmation.
