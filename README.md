# XSLTDebugX — SAP Cloud Integration XSLT IDE

> A browser-based XSLT 3.0 IDE and XPath evaluator built specifically for SAP Cloud Integration (CPI) developers. Test and debug XSLT mappings and XPath expressions locally — with full CPI runtime simulation — before ever deploying to your tenant.

---

## Why This Exists

SAP CPI's built-in mapping editor has no debugger, no live validation, and no way to test an XSLT stylesheet without deploying it to an integration flow and running an actual message through. Every iteration means a deploy cycle.

XSLTDebugX runs entirely in the browser. Nothing to install, no build step, no server. Open the page, paste your XML and XSLT, press **Ctrl+Enter**, and see the output — with your headers, properties, and `xsl:message` traces in a live console.

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
- **Upload / Download / Drag-drop** — load files directly into XML or XSLT pane
- **Right-click context menu** — Format XML/XSLT, Minify XML/XSLT, Comment/Uncomment Lines, Copy XPath — Exact or General

### XPath Evaluator
- **XPath 3.0** evaluated against XML input using Saxon-JS
- **Namespace bindings auto-provided** — `xs`, `fn`, `math`, `map`, `array` available without declaration
- **Expression syntax colorization** — live token coloring: functions (amber), attributes (lavender), strings (green), numbers (orange), operators (pink), variables `$exchange` (lavender), predicates `[ ]` (blue)
- **Expression history** — last 20 expressions persisted; browse with ▲ ▼ buttons or `↑ ↓` keys
- **Editor highlighting** — amber glyph markers and line backgrounds on matched nodes
- **Copy XPath of Element** — right-click any element to copy its XPath (exact or general)

### Transform Engine
- **XSLT 3.0** via [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) — `xsl:iterate`, higher-order functions, maps, arrays, `xsl:message`
- **Pre-flight validation** — well-formedness checked before Saxon runs
- **Pretty-printed output** — XML auto-formatted; non-XML shown as-is
- **Run button feedback** — spinner shown for minimum 300ms so feedback is always visible

### SAP CPI Simulation
- **Headers and Properties** — name/value pairs injected as `xsl:param` values as the CPI runtime does
- **`cpi:setHeader` / `cpi:setProperty`** — fully evaluated; static strings, variables, `concat()`, XPath expressions all work; values shown in Output panels
- **`cpi:getHeader` / `cpi:getProperty`** — reads from the Headers / Properties panels; returns empty string if not found (warns in console)
- **`$exchange` param** — always injected automatically
- **`xsl:message` in console** — amber entries in correct execution order
- **`terminate="yes"` as intentional halt** — logged as warning, not error

### Examples Library
32 built-in examples across 5 categories. All categories are fully dynamic — adding a new category to `CATEGORIES` in `examples-data.js` automatically creates its sidebar button, grid section, and card tags.

| Category | Count | Examples |
|---|---|---|
| **Data Transformation** | 4 | Identity Transform, Rename Elements & Attributes, Filter / Conditional Output, Namespace Handling |
| **Aggregation & Splitting** | 3 | Aggregate Line Items, Multi-Source Merge, Group By Key |
| **Format Conversion** | 3 | XML to Flat File, Flat File to XML, IDoc Segments to XML |
| **SAP CPI Patterns** | 11 | SOAP Fault Handling, Conditional Routing Headers, XML to Flat Text/CSV, SuccessFactors Employee Mapping, Set Headers & Properties, Batch Key Recovery, xsl:message Debugging, and more |
| **XPath Explorer** | 11 | Navigation & Predicates, Aggregation, String Functions, tokenize/string-join, Regex, Date & Duration, Namespace-Agnostic, Batch Error Detection, Conditional & Boolean Logic, Node Inspection, SOAP Envelope Navigation |

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
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="cpi xs">
```

### Using `xsl:message` for debugging

```xslt
<xsl:message select="concat('DEBUG orderCount = ', $orderCount)"/>
<xsl:message terminate="yes" select="concat('FATAL: unknown status [', $status, ']')"/>
```

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
│   ├── examples-data.js    # CATEGORIES object + 32 built-in examples
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

## Browser Compatibility

| Browser | Status |
|---|---|
| Chrome / Edge (Chromium) | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ Supported |
| `file://` protocol | ✅ Works — clipboard falls back to `execCommand` |

---

## Known Limitations

| Limitation | Detail |
|---|---|
| `$exchange` not a real object | Injected as a dummy string — only works as the first argument to `cpi:set*/get*` |
| Share is XSLT only | XPath expressions and XPath mode are not included in share URLs |

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