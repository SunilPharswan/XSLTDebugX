# XSLTDebugX — SAP Cloud Integration XSLT IDE

![XSLT 3.0](https://img.shields.io/badge/XSLT-3.0-blue?logo=w3c) ![XPath 3.1](https://img.shields.io/badge/XPath-3.1-blue) ![Saxon-JS](https://img.shields.io/badge/Saxon--JS-2.x-green) ![License](https://img.shields.io/badge/license-MIT-green) ![No Build](https://img.shields.io/badge/build-none-orange) ![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)

> A browser-based XSLT 3.0 IDE and XPath evaluator built specifically for SAP Cloud Integration (CPI) developers. Test and debug XSLT mappings and XPath expressions locally — with full CPI runtime simulation — before ever deploying to your tenant.

**[🚀 Try it now: xsltdebugx.pages.dev](https://xsltdebugx.pages.dev)**

## Table of Contents
- [Why This Exists](#why-this-exists)
- [Recent Updates](#recent-updates)
- [Two Modes](#two-modes)
- [Features](#features)
- [CPI Developer Reference](#cpi-developer-reference)
- [Getting Started](#getting-started)
- [Quick Start Tutorial](#quick-start-tutorial)
- [Common Workflows](#common-workflows)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Browser Compatibility](#browser-compatibility)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Why This Exists

SAP CPI's built-in mapping editor has no debugger, no live validation, and no way to test an XSLT stylesheet without deploying it to an integration flow and running an actual message through. Every iteration means a deploy cycle.

XSLTDebugX runs entirely in the browser. Nothing to install, no build step, no server. Open the page, paste your XML and XSLT, press **Ctrl+Enter**, and see the output — with your headers, properties, and `xsl:message` traces in a live console.

---

## Recent Updates

- **CPI GET/SET Complete Example** — New comprehensive example showing all 4 CPI functions (`getHeader`, `setHeader`, `getProperty`, `setProperty`) with step-by-step console debugging for newcomers
- **47 Built-in Examples** — Example library deduplicated and refined across 5 categories (Data Transformation, Aggregation, Format Conversion, SAP CPI Patterns, XPath Explorer)
- **Console Enhancements** — Search, type filtering, minimize/restore, auto-expand on errors, error/warning count badges
- **XPath Mode Improvements** — Clickable hint chips, expression history (last 20), auto-growing input bar, namespace-agnostic examples

---

## Two Modes

A segmented **XSLT | ƒx XPath** control in the header switches between modes. The active mode is always visible in the status bar pill. Loading an example automatically switches to the correct mode.

### XSLT Mode (default)

```
[ Input ] [ XSLT Stylesheet + Console ] [ Output ]
```

Edit XML and XSLT side by side. Run with **Run XSLT** or `Ctrl+Enter`. CPI headers and properties injected as `xsl:param` values. Output shown formatted with Output Headers / Properties panels.

### XPath Mode

```
[ XQuery bar + XML Source ] [ XPath Results ]
      [ Console — full width ]
```

Type an XPath 3.0 expression and press **Enter** or **Run XPath**. Matched nodes highlighted in amber in the XML editor. Results syntax-coloured. Expression bar auto-grows and applies live syntax colorization as you type. XSLT pane, Headers, Properties, and Output all hidden for a focused layout.

---

## Features

### Editor
- **Monaco Editor** — XML syntax highlighting, bracket pair colourisation, auto-close tags, indent guides
- **Live validation** — XML and XSLT validated as you type with inline squiggles and glyph markers
- **Format / Minify** — pretty-print or minify any pane via toolbar button or right-click menu
- **Word wrap toggle** — per-pane wrap icon button in each pane bar; independent state for XML, XSLT, and Output
- **Upload / Download / Drag-drop** — load files directly into XML or XSLT pane; output filename auto-detects format (.xml, .json, .txt, .csv)
- **Right-click context menu** — Format XML/XSLT, Minify XML/XSLT, Comment/Uncomment Lines, Copy XPath — Exact or General
- **Pane toolbars** — each pane has dedicated Copy, Clear (🗑️), Format (✨) buttons
- **Auto-save** — all edits persisted to localStorage after 800ms of inactivity
- **Cursor tracking** — status bar shows current line:column position for active editor

### XPath Evaluator
- **XPath 3.0** evaluated against XML input using Saxon-JS
- **Namespace bindings auto-provided** — `xs`, `fn`, `math`, `map`, `array` available without declaration
- **Expression syntax colorization** — live token coloring: functions (amber), attributes (lavender), strings (green), numbers (orange), operators (pink), variables `$exchange` (lavender), predicates `[ ]` (blue)
- **Expression history** — last 20 expressions persisted; browse with ▲ ▼ buttons or `↑ ↓` keys
- **Editor highlighting** — amber glyph markers and line backgrounds on matched nodes
- **Copy XPath of Element** — right-click any element to copy its XPath (exact or general)
- **Hints strip** — clickable XPath expression chips appear below the input bar when an XPath example is loaded; click any chip to instantly run that expression

### Transform Engine
- **XSLT 3.0** via [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) — `xsl:iterate`, higher-order functions, maps, arrays, `xsl:message`
- **Pre-flight validation** — well-formedness checked before Saxon runs
- **Output language detection** — auto-detects XML, JSON, and plain text (CSV, fixed-length, EDI) from actual output content; switches Monaco language mode and updates the download filename accordingly
- **Pretty-printed output** — XML auto-formatted; JSON pretty-printed with 2-space indent; plain text shown as-is
- **Run button feedback** — spinner shown for minimum 300ms so feedback is always visible

### SAP CPI Simulation
- **Headers and Properties** — name/value pairs injected as `xsl:param` values as the CPI runtime does
- **`cpi:setHeader` / `cpi:setProperty`** — fully evaluated; static strings, variables, `concat()`, XPath expressions all work; values shown in Output panels
- **`cpi:getHeader` / `cpi:getProperty`** — reads from the Headers / Properties panels; returns empty string if not found (warns in console)
- **`$exchange` param** — always injected automatically
- **`xsl:message` in console** — amber entries in correct execution order
- **`terminate="yes"` as intentional halt** — logged as warning, not error
- **Comprehensive example** — "CPI Headers & Properties (Complete)" shows all 4 functions (getHeader, setHeader, getProperty, setProperty) with step-by-step console debugging for newcomers

### Console
- **Message types** — info (blue), success (green), warn (amber), error (red) with color-coded icons and timestamps
- **Search** — live filter with text highlighting; works across all message types
- **Type filter** — All / Info / Success / Warn / Error buttons to show/hide specific message types
- **Minimize/restore** — collapse console to single-line header; error/warning count badge shown when minimized
- **Clear** — wipe all messages and reset filters
- **Auto-restore** — console auto-expands when errors occur (if minimized)
- **xsl:message integration** — appears as amber "info" entries; `terminate="yes"` shown as warning

### User Interface
- **Theme toggle** — light/dark mode switcher in header; preference persisted to localStorage
- **Column collapse** — hide left (XML), center (XSLT+Console), or right (Output/Results) columns via ◀ ▶ buttons
- **Status bar** — shows cursor position (Ln:Col), editor label (XML Input / XSLT / etc.), current mode (XSLT / XPath)
- **Pane toolbars** — each pane has Copy, Clear, Format/Minify buttons plus word-wrap toggle
- **Help modal** — keyboard shortcuts reference (? icon in header)
- **Responsive layout** — 3-column flex layout with collapsible sections; works on tablets (iPad Pro tested)

### Examples Library
47 built-in examples across 5 categories. All categories are fully dynamic — adding a new category to `CATEGORIES` in `examples-data.js` automatically creates its sidebar button, grid section, and card tags.

**Library Features:**
- **Search** — live filter by example name or description; highlights matching text
- **Category sidebar** — click any category button to jump to that section; shows example count badges
- **Grid layout** — responsive card grid with icons, descriptions, and category tags
- **One-click load** — loads XML, XSLT, headers, properties, and auto-switches to correct mode (XSLT/XPath)
- **XPath hint chips** — XPath examples show clickable expression chips below the input bar

| Category | Count | Examples |
|---|---|---|
| **Data Transformation** | 8 | Identity Transform, Rename Elements, Filter / Conditional Output, Namespace Handling, Unwrap / Rewrap Payload, Sort Records, Deep Copy + Field Injection, Empty Element Cleanup |
| **Aggregation & Splitting** | 3 | Group-by & Aggregate, Split Message, Merge / Collect Records |
| **Format Conversion** | 6 | Date Format Conversion, Currency & Amount Formatting, Multi-Currency Consolidation, XML → JSON Output, XML → CSV Output, XML → Fixed-Length Output |
| **SAP CPI Patterns** | 13 | IDoc ORDERS05, IDoc INVOIC01, Value Mapping / Lookup, CPI Headers & Properties (Complete), Error Handling (xsl:try), Batch Processing, Batch Key Recovery, xsl:message Debugging, SOAP Fault Handling, Conditional Routing Headers, XML to Flat Text/CSV, SuccessFactors Employee Mapping, Strip SOAP Envelope, Add XML Wrapper |
| **XPath Explorer** | 16 | Navigation & Predicates, Aggregation, String Functions, tokenize/string-join, Regex, Date & Duration, Namespace-Agnostic, Batch Error Detection, Conditional & Boolean, Node Inspection, SOAP Envelope Navigation, distinct-values(), Sibling Axes, index-of() & subsequence(), deep-equal(), xs: Type Casting |

### Share
XML, XSLT, headers, and properties encoded into a single URL. Recipients always land in XSLT mode. Never hits a server. XPath expressions and XPath mode are not shared.

### Session Persistence
Everything auto-saved to `localStorage` 800ms after you stop typing. **Clear Session is mode-aware** — in XSLT mode resets editors to identity transform; in XPath mode resets XML and expression to defaults. Both modes stay in their current mode and wipe XPath expression history.

---

## CPI Developer Reference

### How CPI passes params to XSLT

```xslt
<xsl:param name="SAPClient"/>
<xsl:param name="TargetSystem"/>
<xsl:value-of select="$SAPClient"/>
```

Add `SAPClient` and `TargetSystem` to the Headers panel with your test values.

### How CPI extension calls are handled

XSLTDebugX rewrites `cpi:` calls to Saxon-JS's `js:` namespace before running the transform. Saxon evaluates all arguments fully — dynamic expressions, variables, XPath paths — and calls JavaScript interceptors with the real computed values.

**`cpi:setHeader` / `cpi:setProperty`** — captured and shown in Output Headers / Output Properties panels:

```xslt
<xsl:value-of select="cpi:setHeader($exchange, 'ContentType', 'application/xml')"/>
<xsl:value-of select="cpi:setHeader($exchange, 'OrderRef', concat('REF-', Id))"/>
<xsl:value-of select="cpi:setHeader($exchange, 'Customer', //Header/CustomerName)"/>
<xsl:value-of select="cpi:setProperty($exchange, 'Status', if (Amount gt 1000) then 'HIGH' else 'LOW')"/>
```

**`cpi:getHeader` / `cpi:getProperty`** — reads from the Headers / Properties panels:

```xslt
<xsl:variable name="client" select="cpi:getHeader($exchange, 'SAPClient')"/>
<xsl:variable name="target" select="cpi:getProperty($exchange, 'TargetSystem')"/>
```

### Namespace declarations for CPI stylesheets

```xslt
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="cpi xs">
```

### Using `xsl:message` for debugging

```xslt
<xsl:message select="concat('DEBUG orderCount = ', $orderCount)"/>
<xsl:message terminate="yes" select="concat('FATAL: unknown status [', $status, ']')"/>
```

Messages appear in the console with timestamps. Use `terminate="yes"` to halt execution (shown as warning, not error).

### Console debugging patterns

```xslt
<!-- Variable inspection -->
<xsl:variable name="total" select="sum(//Item/Amount)"/>
<xsl:message select="concat('🔵 Total calculated: ', $total)"/>

<!-- Loop progress tracking -->
<xsl:for-each select="Items/Item">
  <xsl:message select="concat('Processing item ', position(), ' of ', last())"/>
</xsl:for-each>

<!-- Conditional branch tracing -->
<xsl:choose>
  <xsl:when test="$tier = 'GOLD'">
    <xsl:message>✅ Gold tier: routing to EXPRESS</xsl:message>
  </xsl:when>
  <xsl:otherwise>
    <xsl:message>ℹ️ Standard tier: routing to ECONOMY</xsl:message>
  </xsl:otherwise>
</xsl:choose>
```

**Tip:** Use emoji prefixes (🔵 debug, ✅ success, ⚠️ warning, ❌ error) to visually distinguish message types in the console.

### XPath expressions for CPI payloads

In XPath mode, right-click any element for:

- **Copy XPath — Exact**: `/Orders/Order[2]/Amount` — positional, targets specific occurrence
- **Copy XPath — General**: `/Orders/Order/Amount` — pattern, matches all siblings

---

## Getting Started

### Use online

**[https://xsltdebugx.pages.dev](https://xsltdebugx.pages.dev)** — open in any browser. No account, no install.

### Run locally

```bash
git clone https://github.com/SunilPharswan/XSLTDebugX.git
cd XSLTDebugX
open index.html    # macOS
```

No build step. No `npm install`. No server required.

### Keyboard shortcuts

| Shortcut | XSLT Mode | XPath Mode |
|---|---|---|
| `Ctrl+Enter` / `Cmd+Enter` | Run XSLT | Run XPath |
| `Enter` (in XQuery bar) | — | Run XPath |
| `↑` (in XQuery bar) | — | Previous expression from history |
| `↓` (in XQuery bar) | — | Next expression / back to draft |
| `Escape` | Close any open modal | Close any open modal |

---

## Quick Start Tutorial

### Testing a CPI XSLT mapping

1. **Load an example** — Click **Examples** button → **SAP CPI Patterns** → **"CPI Headers & Properties (Complete)"**
2. **Review the setup** — XML input, XSLT stylesheet, and Headers/Properties panels are pre-filled
3. **Run it** — Press **Run XSLT** or `Ctrl+Enter`
4. **Check the output** — Output pane shows transformed XML; Output Headers/Properties show values set by `cpi:setHeader/setProperty`
5. **Watch the console** — Console shows step-by-step debug messages from `xsl:message` with timestamps
6. **Modify it** — Change a header value (e.g., `channel` from `B2B` to `B2C`), press `Ctrl+Enter` again — routing logic changes instantly

### Evaluating XPath expressions

1. **Switch to XPath mode** — Click **ƒx XPath** button in header
2. **Load an XPath example** — Click **Examples** → **XPath Explorer** → **"Navigation & Predicates"**
3. **See the hints** — Clickable expression chips appear below the XPath input bar
4. **Click a hint** — Instantly runs that expression; matched nodes highlighted in amber in the XML editor
5. **Try your own** — Type `//Order[Total > 1000]` and press `Enter`
6. **Browse history** — Use `↑` `↓` keys to navigate through last 20 expressions

---

## Common Workflows

### Testing IDoc transformations
- Load **IDoc ORDERS05 → Custom XML** or **IDoc INVOIC01** examples
- Replace the sample IDoc with your actual IDoc payload from CPI message monitoring
- Run the transform to see the mapped output
- Use **Copy XPath — General** on any element to build predicates for conditional logic

### Debugging missing header values
- Add your CPI headers to the **Headers** panel (e.g., `SAPClient`, `ContentType`)
- Use `cpi:getHeader($exchange, 'SAPClient')` in your XSLT
- Check the console — warns if header not found
- Use the **"CPI Headers & Properties (Complete)"** example as a reference

### Validating date/time conversions
- Load **Date Format Conversion** example
- Replace sample dates with your actual SAP dates (YYYYMMDD format)
- See converted ISO 8601, readable, and calculation results instantly
- Use XPath mode with `xs:date()` and `format-date()` functions to test edge cases

### Building complex XPath predicates
- Switch to **XPath mode**
- Load your XML payload into the XML editor
- Right-click any element → **Copy XPath — General** to get the base path
- Add predicates: `//Order[Amount > 1000 and Status='OPEN']`
- See matched nodes highlighted immediately — refine until you get the right subset

### Sharing work with colleagues
- Click **Share** button → copy URL
- Recipient gets your exact XML, XSLT, headers, and properties
- Great for code reviews, asking for help, or documenting bugs
- Note: XPath expressions are not shared (XSLT mode only)

---

## Deployment

Hosted on **Cloudflare Pages** at [xsltdebugx.pages.dev](https://xsltdebugx.pages.dev). Every push to `main` auto-deploys.

### Cloudflare Pages setup

1. Connect your GitHub repo to Cloudflare Pages
2. Framework preset: **None** (static site)
3. Build command: leave empty
4. Output directory: `/` (root)

### CDN dependencies

| Resource | URL |
|---|---|
| Monaco Editor | `cdn.jsdelivr.net/npm/monaco-editor@0.44.0` |
| Pako | `cdnjs.cloudflare.com/ajax/libs/pako/2.1.0` |
| JetBrains Mono | `fonts.googleapis.com` |

Saxon-JS is bundled locally in `lib/SaxonJS2.js` — no CDN dependency.

---

## Project Structure

```
XSLTDebugX/
├── favicon.svg
├── index.html              # App shell — layout, modals, script tags
├── css/
│   └── style.css           # All styles, themes (light/dark), component CSS
├── js/
│   ├── state.js            # Global state, console, status bar, localStorage
│   ├── validate.js         # XML validation, Monaco markers
│   ├── panes.js            # clearPane, copyPane, prettyXML, fmtEditor, toggleWordWrap
│   ├── transform.js        # CPI simulation, KV panels, runTransform
│   ├── examples-data.js    # CATEGORIES object + 47 built-in examples
│   ├── modal.js            # Examples library, dynamic sidebar, loadExample
│   ├── files.js            # Upload, download, drag-and-drop
│   ├── ui.js               # Column collapse, console, theme toggle, help modal
│   ├── share.js            # Share URL encode/decode
│   ├── xpath.js            # XPath evaluator, expression colorization, history, highlighting, mode toggle
│   └── editor.js           # Monaco init, context menu, cursor stat, session restore
└── lib/
    └── SaxonJS2.js         # Saxon-JS 2.x (bundled, no CDN)
```

---

## Contributing

### Adding an XSLT example

```js
myExample: {
  label: 'My Example', icon: '🗂️', desc: 'One sentence',
  cat: 'cpi',   // transform | aggregation | format | cpi | xpath
  xml:  `<Root>...</Root>`,
  xslt: `<xsl:stylesheet version="3.0" ...>...</xsl:stylesheet>`,
  headers:    [['Content-Type', 'application/xml']],  // optional
  properties: [['SAPClient', '100']],                 // optional
}
```

### Adding an XPath example

```js
myXPathExample: {
  label: 'My XPath Example', icon: '🔍', desc: 'One sentence',
  cat: 'xpath',
  xml:       `<Root>...</Root>`,
  xslt:      '',
  xpathExpr: '//Element[@attr="value"]',
}
```

### Adding a new category

```js
odata: { label: 'OData Patterns', accent: '#e879f9' },
```

Sidebar button, count badge, grid section label, and card tag all appear automatically.

---

## FAQ

### Can I use this for production CPI flows?
**Yes, but with testing.** XSLTDebugX simulates CPI's XSLT runtime accurately for standard XSLT 3.0 and CPI extension functions. Always test in your CPI development tenant before deploying to production.

### Does this work offline?
**Partially.** After first load, the app works offline from browser cache. However, Monaco Editor and fonts load from CDN, so offline mode may have degraded styling. Saxon-JS is bundled locally and works offline.

### Can I save my work?
**Three ways:**
1. **Auto-save** — everything saved to `localStorage` automatically (survives browser restarts)
2. **Share URL** — creates a shareable link with XML, XSLT, headers, properties
3. **Download** — download individual panes as files

### Why is my XSLT slow?
Large XML (>100KB) or complex recursive templates can be slow. Saxon-JS is interpreted JavaScript, not compiled like Saxon-HE or Saxon-EE. Use `xsl:message` to identify bottleneck templates.

### Can I submit examples?
**Yes!** Fork the repo, add your example to `js/examples-data.js`, and submit a pull request. See **Contributing** section for format.

### Does this support XSLT 1.0?
**No.** XSLTDebugX uses Saxon-JS 2.x which is XSLT 3.0 only. XSLT 1.0 stylesheets will fail with namespace or version errors. Upgrade to `version="3.0"` or use an XSLT 1.0 processor.

### Why are my namespaces stripped in the output?
Check `exclude-result-prefixes="cpi xs"` in your stylesheet declaration. Namespaces declared but not in the exclude list will appear in output.

### Can I debug multi-step CPI flows?
**One step at a time.** XSLTDebugX simulates a single XSLT mapping step. For multi-step flows, test each XSLT separately. Use the output from one as the input XML for the next.

---

## Browser Compatibility

| Browser | Status |
|---|---|
| Chrome / Edge (Chromium) | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ Supported |
| `file://` protocol | ✅ Works — clipboard falls back to `execCommand` |

---

## Known Limitations

| Limitation | Detail | Workaround |
|---|---|---|
| `$exchange` not a real object | Injected as a dummy string — only works as the first argument to `cpi:set*/get*` | Always pass `$exchange` as first param to CPI functions |
| Share URL length | Browser URL limit ~2,000 chars; large XSLT + XML may exceed this | Use **Download** instead for large payloads |
| Share is XSLT only | XPath expressions and XPath mode are not included in share URLs | Screenshot XPath results or copy expression manually |
| Large file performance | XML/XSLT files >500KB may slow Monaco editor | Split large IDocs or use external XML editor for initial cleanup |
| No XSLT debugger | Cannot step through templates or inspect variables mid-execution | Use `xsl:message` extensively to trace execution flow |

---

## Troubleshooting

### "Saxon not ready" error
**Cause:** Saxon-JS hasn't loaded yet (network slow or blocked)  
**Fix:** Wait 2-3 seconds after page load, then try again. If persists, check browser console for CDN blocking.

### Transform produces no output
**Causes:**
- XML or XSLT not well-formed → check red squiggles in editor
- No matching templates → use "Identity Transform" example as base
- `xsl:message terminate="yes"` halts transform → check console for termination message

**Fix:** Load **"Identity Transform"** example and verify XML copies to output, then incrementally add your logic.

### Headers/Properties not working
**Cause:** Param names in XSLT don't match Headers/Properties panel  
**Fix:** 
- Open **"CPI Headers & Properties (Complete)"** example
- Headers panel: `source` + `channel` → XSLT params: `<xsl:param name="source"/>` and `<xsl:param name="channel"/>`
- Case-sensitive match required

### XPath returns empty results
**Causes:**
- Namespace mismatch → XML uses namespaces, XPath doesn't
- Wrong path → use **Copy XPath — General** from right-click menu to get correct path

**Fix:**
- For namespaced XML, use `*[local-name()='Element']` instead of `Element`
- Load **"Namespace-Agnostic Selection"** XPath example for patterns

### Console messages not appearing
**Cause:** Console filter set to errors-only or minimized  
**Fix:**
- Click **All** button in console toolbar to reset filter
- Click console header bar to restore if minimized

### Session lost after browser refresh
**Cause:** localStorage cleared or browser in private/incognito mode  
**Fix:**
- Use **Share** button before closing to get a URL backup
- Or **Download** each pane to save locally

---

## Analytics

XSLTDebugX uses [GoatCounter](https://www.goatcounter.com) for anonymous, privacy-friendly analytics — no personal data, no cookies, no cross-site tracking. Blocked by any standard ad blocker. Not loaded on `file://` or `localhost`.

---

## License

MIT — with an additional request that this software is not used for commercial purposes without prior written permission from the author. See [LICENSE](LICENSE) for full details.

---

## Third-Party Licenses

| Library | License | Usage |
|---|---|---|
| [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) by Saxonica | [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/) | XSLT 3.0 engine and XPath evaluator — bundled in `lib/SaxonJS2.js` |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) by Microsoft | [MIT](https://github.com/microsoft/monaco-editor/blob/main/LICENSE.md) | Code editor — loaded from CDN |
| [Pako](https://github.com/nodeca/pako) by Nodeca | [MIT](https://github.com/nodeca/pako/blob/master/LICENSE) | Compression for share URLs — loaded from CDN |
| [JetBrains Mono](https://www.jetbrains.com/legalforms/fonts/) by JetBrains | [OFL-1.1](https://scripts.sil.org/OFL) | Monospace font — loaded from Google Fonts |

---

## Trademarks

SAP®, SAP Cloud Integration, and SAP Cloud Platform Integration (CPI) are registered trademarks of SAP SE. SuccessFactors® and IDoc® are trademarks or registered trademarks of SAP SE.

This project is not affiliated with, endorsed by, or in any way officially connected with SAP SE.