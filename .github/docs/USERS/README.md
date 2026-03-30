# XSLTDebugX User Guide

Welcome to **XSLTDebugX**, a browser-based XSLT 3.0 IDE and XPath evaluator for SAP Cloud Integration developers.

This guide walks you through features, workflows, and keyboard shortcuts. For more information, see:
- [Keyboard Shortcuts](./KEYBOARD_SHORTCUTS.md) — Quick reference
- [Project README](../../README.md) — Full feature overview
- [Getting Started Tutorial](#getting-started)

---

## Getting Started

### Opening XSLTDebugX

1. **Online:** Visit the live deployment (URL from [README.md](../../README.md))
2. **Local:** Clone the repo and serve:
   ```bash
   git clone https://github.com/SunilPharswan/XSLTDebugX.git
   cd XSLTDebugX
   npx serve .          # or: python -m http.server, or: php -S localhost:8000
   ```
   Open `http://localhost:3000` (or your port)

### The Editor Layout

XSLTDebugX has a **three-column layout**:

```
┌─────────────────────────────────────────┐
│  Mode Toggle | Theme | Examples | Help  │
├────────────────────────────────────────┤
│ XML Input   │ XSLT Editor │ Output |
│             │             │        |
│             │             │        |
│             │             │        |
├────────────────────────────────────────┤
│ Headers     │ Console                   |
│ Properties  │                           │
└────────────────────────────────────────┘
```

**Left Column:** XML input data  
**Center Column:** XSLT stylesheet or XPath expression  
**Right Column:** Transformation results  
**Bottom Panel:** Headers/Properties injection (XSLT mode) + Console output

---

## Core Workflows

### Workflow 1: Transform XSLT + XML

1. **Load XSLT:**
   - Paste stylesheet in center column
   - Or upload via "📁" button
   - Or load from Examples gallery

2. **Load XML:**
   - Paste XML data in left column
   - Or upload via "📁" button
   - Or use example XML

3. **Run Transform:**
   - Click **"Run"** button (or `Ctrl+Enter`)
   - Results appear in right column

4. **Debug:**
   - View console messages below
   - See validation errors (red squiggles)
   - Check error counts in status bar

**Example:**
```xml
<!-- XML Input -->
<items>
  <item id="1">Apple</item>
  <item id="2">Banana</item>
</items>
```

```xslt
<!-- XSLT -->
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <list>
      <xsl:for-each select="//item">
        <product>
          <xsl:value-of select="."/>
        </product>
      </xsl:for-each>
    </list>
  </xsl:template>
</xsl:stylesheet>
```

```xml
<!-- Output -->
<list>
  <product>Apple</product>
  <product>Banana</product>
</list>
```

### Workflow 2: Evaluate XPath Expressions

1. **Switch to XPath Mode:**
   - Click **"ƒx"** button in header (top-right)
   - Or press `Ctrl+Shift+X`
   - Center column changes to XPath input

2. **Keep XML Data:**
   - XML input (left column) stays the same
   - Use `//item`, `//item/@id`, etc.

3. **Evaluate Expression:**
   - Type XPath expression in center column
   - Press `Ctrl+Enter` (or click Evaluate)
   - Results appear in right column (matching nodes highlighted)

4. **Browse Results:**
   - Each node is selectable
   - XPath highlights matching elements in visual tree (if available)

**Example:**
```xpath
# XPath Expression
//item[@id='1']/text()

# Result
Apple
```

### Workflow 3: Simulate CPI Headers & Properties

**Valid in XSLT mode only.**

1. **Open Headers/Properties Panels:**
   - Panels visible in bottom-left (toggleable)

2. **Add Headers (for CPI):**
   - Click **"+ Header"** button
   - Enter header name (e.g., `X-Custom-Header`)
   - Enter value (e.g., `my-value`)
   - Added to persistent storage (survives refresh)

3. **Use in XSLT:**
   ```xslt
   <xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cpi="http://sap.com/cpi">
     <xsl:template match="/">
       <result>
         <!-- Get header value -->
         <header><xsl:value-of select="cpi:getHeader('X-Custom-Header')"/></header>
       </result>
     </xsl:template>
   </xsl:stylesheet>
   ```

4. **View Output Headers:**
   - After transform, output headers appear in right-column **Output Headers**
   - Verify that `cpi:setHeader()` calls were captured

---

## Features

### Text Editing

- **Word Wrap:** Toggle via "Text Options" menu
- **Format Document:** `Ctrl+Shift+Alt+F` → auto-indent XML/XSLT
- **Copy / Clear:** Right-click context menu or buttons
- **Syntax Highlighting:** Color-coded XSLT/XML

### Validation

- **Real-Time Errors:** Red squiggles + line numbers
- **Error Count Badge:** Shows total error count in status bar
- **Error Details:** Hover over squiggle or check console
- **Validation Types:** XML well-formedness, XSLT syntax

### Examples Gallery

- **Open:** Click **"Examples"** button
- **Browse:** 50+ built-in examples organized by category
- **Categories:**
  - **Transform** — Basic XSLT patterns
  - **Aggregation** — Group, sort, count
  - **Format** — Output formatting (JSON, CSV, etc.)
  - **CPI** — SAP Cloud Integration scenarios
  - **XPath** — XPath expression examples
- **Load:** Click example → loads XSLT + XML + XPath expressions

### Session Persistence

- **Auto-Save:** Your work is saved to browser localStorage every 800ms
- **Refresh:** Close tab, reopen → your session restores
- **Clear:** Use "Clear Storage" button to reset all data
- **Export:** Download current session as JSON or individual files

### Share & Collaborate

- **Share URL:** Click **"Share"** → generates URL with encoded XSLT + XML
- **Share Code in PR:** Post URL in GitHub Issues, Slack, email
- **Limitation:** Long XSLT (>2000 chars total) may exceed URL limits

### Theme Toggle

- **Light/Dark Mode:** Click theme button (☀️/🌙)
- **Persisted:** Theme preference saved to localStorage

---

## Tips & Tricks

### Debugging Common Issues

| Issue | Solution |
|-------|----------|
| **XSLT won't run** | Check error badge; red squiggle shows syntax issue. Hover for details. |
| **Headers not captured** | Ensure mode is XSLT (not XPath). CPI simulation only works in XSLT mode. |
| **XPath returns empty** | Verify XML is valid and XPath expression matches nodes. Try `//*` to see all elements. |
| **Output is empty** | Check XSLT template match conditions. Add `<xsl:message>` for debugging. |
| **Size issues** | Collapse sidebar columns. Use word wrap toggle. Maximize window. |

### Performance Tips

- **Large Files:** Break transform into smaller templates
- **Console:** Clear message history periodically (helps browser memory)
- **XPath:** Filter with predicates rather than processing full tree

### Keyboard Shortcuts

See [KEYBOARD_SHORTCUTS.md](./KEYBOARD_SHORTCUTS.md) for complete reference.

**Most Common:**
- `Ctrl+Enter` — Run Transform / Evaluate XPath
- `Ctrl+Shift+X` — Toggle XSLT ↔ XPath mode
- `Ctrl+Shift+Alt+F` — Format document
- `Ctrl+/` — Toggle comment

---

## Examples

### Example 1: XML-to-JSON Conversion

```xslt
<!-- XSLT -->
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text"/>
  <xsl:template match="/">
    {
      "items": [
        <xsl:for-each select="//item">
          {"id": "<xsl:value-of select="@id"/>", "name": "<xsl:value-of select="."/>"}
          <xsl:if test="position() != last()">,</xsl:if>
        </xsl:for-each>
      ]
    }
  </xsl:template>
</xsl:stylesheet>
```

### Example 2: XPath to Find Duplicates

```xpath
//item[count(. | preceding-sibling::item[. = current()]) = 1]
```

### Example 3: CPI Header Injection

Use **Examples** → **CPI** to see real-world CPI scenarios.

---

## Getting Help

- **Keyboard Shortcut Help:** Press `?` in the app
- **Console Errors:** Check browser DevTools (F12 → Console tab)
- **Documentation:** See [.github/docs/INDEX.md](../INDEX.md)
- **Report Issues:** [GitHub Issues](https://github.com/SunilPharswan/XSLTDebugX/issues)

---

## Browser Support

- **Chrome/Edge (latest)** ✅
- **Firefox (latest)** ✅
- **Safari (latest)** ✅

---

## License

XSLTDebugX is open-source (see [LICENSE](../../LICENSE) for details).
