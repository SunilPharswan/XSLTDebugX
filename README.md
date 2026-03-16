# XSLTDebugX — SAP Cloud Integration XSLT IDE

> A browser-based XSLT 3.0 IDE and XPath evaluator built specifically for SAP Cloud Integration (CPI) developers. Test and debug XSLT mappings and XPath expressions locally — with full CPI runtime simulation — before ever deploying to your tenant.

---

## Why This Exists

SAP CPI's built-in mapping editor has no debugger, no live validation, and no way to test an XSLT stylesheet without deploying it to an integration flow and running an actual message through. Every iteration means a deploy cycle.

XSLTDebugX runs entirely in the browser. Nothing to install, no build step, no server. Open the page, paste your XML and XSLT, press **Ctrl+Enter**, and see the output — with your headers, properties, and `xsl:message` traces in a live console.

---

## Two Modes

A segmented **XSLT | ƒx XPath** control in the header switches between modes. The active mode is always visible in the status bar pill (`XSLT` in blue, `XPath` in amber). Loading an example from the library automatically switches to the correct mode.

### XSLT Mode (default)

```
[ Input ] [ XSLT Stylesheet + Console ] [ Output ]
```

- Edit XML and XSLT side by side
- Run with **Run XSLT** or `Ctrl+Enter`
- CPI headers and properties injected as `xsl:param` values
- Output shown formatted with Output Headers / Properties panels

### XPath Mode

```
[ XQuery bar + XML Source ] [ XPath Results ]
      [ Console — full width ]
```

- **XQuery** pane-bar at the top of the left column with Copy, Clear, and ▲▼ history buttons
- Expression bar auto-grows and applies live syntax colorization as you type
- Type an XPath 3.0 expression and press **Enter** or **Run XPath**
- Matched nodes highlighted in amber in the XML editor with scroll to first match
- Results syntax-coloured using the Monaco XML tokenizer
- Match count badge in the XQuery header updates after every run
- XSLT pane, Headers, Properties, Output, and Share button all hidden — focused layout
- Console spans full width below both panes
- Left pane title switches between **Input** (XSLT mode) and **XML Source** (XPath mode)

---

## Features

### Editor
- **Monaco Editor** — same engine as VS Code: XML syntax highlighting, bracket pair colourisation, auto-close tags, attribute `=""` insertion, indent guides
- **Live validation** — XML and XSLT validated as you type with inline squiggles and glyph markers
- **Format / Minify** — pretty-print or minify any pane via toolbar button or right-click menu
- **Word wrap toggle** — per-pane wrap icon button in each pane bar; independent state for XML, XSLT, and Output; highlighted blue when active
- **Upload / Download / Drag-drop** — load files directly into XML or XSLT pane
- **Right-click context menu** — Format XML/XSLT, Minify XML/XSLT, Comment/Uncomment Lines, Copy XPath — Exact, Copy XPath — General

### XPath Evaluator
- **XPath 3.0** evaluated against XML input using Saxon-JS
- **Namespace bindings auto-provided** — `xs`, `fn`, `math`, `map`, `array` available in all expressions without declaration
- **Expression bar** — auto-growing textarea; wraps long expressions across multiple lines rather than scrolling horizontally
- **Expression syntax colorization** — live token coloring as you type: functions (amber), attributes `@` (lavender), string literals (green), numbers (orange), operators `and/or/not/eq` (pink/italic), path separators `/` (dim), predicates `[ ]` (blue), variables `$exchange` (lavender), node names (teal) — full dark and light theme support
- **Syntax-coloured results** — rendered with the Monaco XML tokenizer and current theme
- **Match count badge** — `3 matches` / `Error` / hidden — shown in the XQuery pane-bar header
- **Expression history** — last 20 expressions persisted to `localStorage`; browse with ▲ ▼ buttons in the header or `↑ / ↓` keys in the input; console logs position (`History 2/8: //Order[...]`)
- **Editor highlighting** — amber glyph markers and line backgrounds on matched nodes
- **Copy XPath of Element** — right-click any element to copy its XPath (exact or general) and populate the XQuery bar

### Transform Engine
- **XSLT 3.0** via [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) — `xsl:iterate`, higher-order functions, maps, arrays, `xsl:message`
- **Pre-flight validation** — well-formedness checked before Saxon runs
- **Pretty-printed output** — XML auto-formatted; non-XML shown as-is
- **Run button feedback** — spinner shown for a minimum 300ms so feedback is always visible even on fast transforms

### SAP CPI Simulation
- **Headers and Properties** — name/value pairs injected as `xsl:param` values as the CPI runtime does
- **`cpi:setHeader` / `cpi:setProperty`** — fully evaluated using Saxon-JS's `js:` namespace bridge; static strings, variables, `concat()`, XPath expressions all work correctly; values shown in Output panels
- **`cpi:getHeader` / `cpi:getProperty`** — reads from the Headers / Properties panels; returns the entered value, empty string if not found (warns in console)
- **`$exchange` param** — always injected automatically
- **`xsl:message` in console** — amber entries in correct execution order
- **`terminate="yes"` as intentional halt** — logged as warning, not error

### Examples Library
32 built-in examples across 5 categories. All categories and counts are fully dynamic — adding a new category to `CATEGORIES` in `examples-data.js` automatically creates its sidebar button, grid section, and card tags.

| Category | Count | Examples |
|---|---|---|
| **Data Transformation** | 4 | Identity Transform, Rename Elements & Attributes, Filter / Conditional Output, Namespace Handling |
| **Aggregation & Splitting** | 3 | Aggregate Line Items, Multi-Source Merge, Group By Key |
| **Format Conversion** | 3 | XML to Flat File, Flat File to XML, IDoc Segments to XML |
| **SAP CPI Patterns** | 11 | SOAP Fault Handling, Conditional Routing Headers, XML to Flat Text/CSV, SuccessFactors Employee Mapping, Set Headers & Properties, Batch Key Recovery, xsl:message Debugging, and more |
| **XPath Explorer** | 11 | Navigation & Predicates, Aggregation, String Functions, tokenize/string-join, Regex, Date & Duration, Namespace-Agnostic, Batch Error Detection, Conditional & Boolean Logic, Node Inspection, SOAP Envelope Navigation |

### Share
XML, XSLT, headers, and properties encoded into a single URL. Recipients always land in XSLT mode. Encoding: JSON → `TextEncoder` → `pako.deflateRaw` (level 9) → base64url in the URL hash. Never hits a server. XPath expressions and XPath mode are not shared.

### Session Persistence
Everything auto-saved to `localStorage` 800ms after you stop typing:

| Key | Contents |
|---|---|
| `xdebugx-session-v1` | XML, XSLT, headers, properties, column states, XPath expression, current mode |
| `xdebugx-xpath-history` | Last 20 XPath expressions (persists across reloads) |
| `xdebugx-theme` | Light / dark preference |

Restore log: `Session restored · saved 2m ago · XPath mode ✓`

**Clear Session is mode-aware:**
- In **XSLT mode** — resets XML + XSLT to identity transform, clears KV panels and output, stays in XSLT mode. Logs: `XSLT session cleared — editors reset to defaults.`
- In **XPath mode** — resets XML to the Navigation & Predicates example, resets expression bar to `//Item[@status='active']`, clears results and highlights, stays in XPath mode. Logs: `XPath session cleared — XML and expression reset to defaults.`

In both cases, XPath expression history is also fully cleared from `localStorage` and memory.

### Status Bar
Left to right: status dot + message · Saxon-JS info · **cursor position** (`XML  Ln 12/48 · Col 7 · 1,247 chars`, updates per pane on focus/cursor move) · **mode pill** (`XSLT` blue / `XPath` amber) · Saved indicator · author links · SAP® notice

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
<!-- All of these work and show correct values in Output panels -->
<xsl:value-of select="cpi:setHeader($exchange, 'ContentType', 'application/xml')"/>
<xsl:value-of select="cpi:setHeader($exchange, 'OrderRef', concat('REF-', Id))"/>
<xsl:value-of select="cpi:setHeader($exchange, 'Customer', //Header/CustomerName)"/>
<xsl:value-of select="cpi:setHeader($exchange, 'Client', $SAPClient)"/>
<xsl:value-of select="cpi:setProperty($exchange, 'Status', if (Amount gt 1000) then 'HIGH' else 'LOW')"/>
```

**`cpi:getHeader` / `cpi:getProperty`** — reads from the Headers / Properties panels:

```xslt
<xsl:variable name="client" select="cpi:getHeader($exchange, 'SAPClient')"/>
<xsl:variable name="target" select="cpi:getProperty($exchange, 'TargetSystem')"/>
```

If the name is not found in the panel, returns empty string and warns in console. Names are case-sensitive and whitespace-trimmed.

**Rewrite steps before Saxon runs:**
1. `xmlns:cpi="..."` → `xmlns:js="http://saxonica.com/ns/globalJS"`
2. `cpi` removed from `exclude-result-prefixes`; `js` added (or injected if missing)
3. `cpi:setHeader(` → `js:cpiSetHeader(`, `cpi:getHeader(` → `js:cpiGetHeader(`, etc.

The `js:` namespace is always excluded from serialized output, mirroring CPI runtime behaviour.

### Namespace declarations for CPI stylesheets

```xslt
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  xmlns:sap="http://www.sap.com"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  exclude-result-prefixes="cpi sap xs fn">
```

For multi-mapping add `xmlns:multimap="http://sap.com/xi/XI/SplitAndMerge"`.

### Using `xsl:message` for debugging

```xslt
<xsl:message select="concat('DEBUG orderCount = ', $orderCount)"/>
<xsl:message select="concat('DEBUG processing ', position(), ' of ', last())"/>
<xsl:message terminate="yes" select="concat('FATAL: unknown status [', $status, ']')"/>
```

### XPath expressions for CPI payloads

In XPath mode, right-click any element for:

- **Copy XPath — Exact**: `/Orders/Order[2]/Amount` — positional, targets specific occurrence
- **Copy XPath — General**: `/Orders/Order/Amount` — pattern, matches all siblings

Both populate the XQuery bar and run immediately. In XSLT mode, same options copy to clipboard only.

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
| `Escape` | Close modal | Close modal |

---

## Deployment

Hosted on **Cloudflare Pages** at [xsltdebugx.pages.dev](https://xsltdebugx.pages.dev). Every push to the `main` branch auto-deploys — no manual steps needed.

### Cloudflare Pages setup

1. Connect your GitHub repo to Cloudflare Pages
2. Framework preset: **None** (static site)
3. Build command: leave empty
4. Output directory: `/` (root)
5. Save — Cloudflare deploys on every push to `main`

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
├── favicon.svg             # SVG favicon — XD logo mark
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
│   ├── ui.js               # Column collapse, console, theme toggle
│   ├── share.js            # Share URL encode/decode, force XSLT on receive
│   ├── xpath.js            # XPath evaluator, expression colorization, history, highlighting, mode toggle
│   └── editor.js           # Monaco init, context menu, cursor stat, session restore
└── lib/
    └── SaxonJS2.js         # Saxon-JS 2.x (bundled, no CDN)
```

### Script load order

```
pako → Monaco loader → SaxonJS2.js → state.js → validate.js → panes.js
→ transform.js → examples-data.js → modal.js → files.js → ui.js
→ share.js → xpath.js → editor.js
```

---

## Architecture Notes

### Two-mode layout system

`_applyXPathToggleState()` in `xpath.js` is the single function for all DOM changes on mode switch. It drives: XQuery bar visibility, XSLT column collapse (saving pre-XPath state in `_xpathPreColCenterCollapsed`), KV panels, Output section, Share button, Run button label and `onclick` handler, XSLT/XPath mode buttons active state, mode pill, console label, console panel DOM position (`insertAdjacentElement` / `appendChild`), and the left pane title (`Input` in XSLT mode, `XML Source` in XPath mode).

The XML input editor (`eds.xml`) is shared between both modes — switching mode never recreates or resets the editor, so XML content persists across mode switches.

### XPath expression colorization

The XPath bar uses an overlay div technique: the `<textarea>` has `color: transparent` and `caret-color` set, with a positioned `<div class="xpath-overlay">` behind it. `_highlightXPath()` in `xpath.js` tokenizes the expression character-by-character using ordered regex passes and injects `<span class="xpt-*">` tokens into the overlay. Token order: string literals → functions (lookahead `(`) → attributes `@` → numbers → keywords/operators → path separators → predicates → variables `$` → node names → fallback. All token colors use CSS variables (`--xpt-attr`, `--xpt-fn`, etc.) defined in both dark and light theme blocks in `style.css` — theme switching is free.

### Dynamic categories

`CATEGORIES` in `examples-data.js` is the single source of truth for category labels, accent colours, and sidebar order. `renderExSidebar()` in `modal.js` reads it at runtime — adding a new category requires only one line in `CATEGORIES` plus examples with the matching `cat` value.

### Monaco editor themes

Two custom themes are registered at startup: `xdebugx` (dark) and `xdebugx-light` (light). The active theme is stored in `localStorage` under `xdebugx-theme`.

### XPath expression history

Stored in `_xpathHistory[]` (most-recent-first, max 20), persisted to `localStorage` under `xdebugx-xpath-history`. `_xpathHistoryCursor` tracks position during browsing; `-1` means viewing the current draft saved in `_xpathDraftExpr`. Deduplicates on push.

### XPath namespace bindings

`SaxonJS.XPath.evaluate` is called with a `namespaceContext` providing `xs`, `fn`, `math`, `map`, and `array` prefixes — so expressions like `xs:date(...)`, `fn:concat(...)`, or `math:sqrt(...)` work without any namespace declaration in the XML input.

### CPI extension function bridge

`rewriteCPICalls()` in `transform.js` rewrites the XSLT source before Saxon runs — swapping `xmlns:cpi` for `xmlns:js` (`http://saxonica.com/ns/globalJS`) and renaming all `cpi:setHeader(`, `cpi:getHeader(`, `cpi:setProperty(`, `cpi:getProperty(` calls to their `js:` equivalents. Saxon-JS maps `js:funcName(args)` directly to `window.funcName(args)`, so Saxon fully evaluates all arguments before calling the JS interceptor — dynamic expressions, variables, and XPath paths all resolve correctly.

`ensureJsExcluded()` always runs after any XSLT processing to guarantee `js` is present in `exclude-result-prefixes`, preventing the `xmlns:js` declaration from leaking into serialized output. This mirrors CPI runtime behaviour where extension namespaces are never visible in the output XML.

Interceptors are registered on `window` before Saxon runs and restored (or deleted) in a `finally` block, even if Saxon throws.

### Share URL encoding

```
{ xml, xslt, headers, properties }
  → JSON.stringify → TextEncoder → pako.deflateRaw (level 9)
  → chunked btoa → base64url → URL hash #share/<encoded>
```

Hash stripped via `history.replaceState` after decoding. Recipients always land in XSLT mode.

---

## Contributing

### Adding an XSLT example

```js
// In js/examples-data.js — inside EXAMPLES object
myExample: {
  label: 'My Example', icon: '🗂️', desc: 'One sentence',
  cat: 'cpi',   // transform | aggregation | format | cpi — or a new key in CATEGORIES
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
  xslt:      '',    // always empty for XPath examples
  xpathExpr: '//Element[@attr="value"]',  // pre-filled and auto-runs on load
}
```

### Adding a new category

```js
// In js/examples-data.js — inside CATEGORIES object
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
| Unsupported `cpi:` functions | `cpi:getHeaders()`, `cpi:getProperties()`, `cpi:throwFault()`, `cpi:getBody()`, `cpi:setBody()` are not intercepted — Saxon will throw a namespace error if used |
| `$exchange` not a real object | Injected as a dummy string `'exchange'` — only works as the first argument to `cpi:set*/get*` |
| Runtime adapter headers | `CamelFileName`, `CamelHttpResponseCode`, adapter-specific headers must be added manually to the Headers panel |
| Multi-step iFlow chaining | Single transform only — output of one step cannot feed the next automatically |
| XPath colours after theme switch | Colorised results don't update on theme change — re-run the expression to refresh |
| Share is XSLT only | XPath expressions and XPath mode are not included in share URLs |

---

## Analytics & Privacy

XSLTDebugX uses [GoatCounter](https://www.goatcounter.com) for anonymous, privacy-friendly usage analytics.

### What is collected

| Event | When |
|---|---|
| Page view | Every visit to the app |
| `run-xslt` | User runs a transform |
| `run-xpath` | User evaluates an XPath expression |
| `mode-xslt` | User switches to XSLT mode |
| `mode-xpath` | User switches to XPath mode |
| `example-<key>` | User loads a specific example (e.g. `example-soapFaultHandling`) |

GoatCounter also records anonymous aggregate data per page view: approximate country, browser, screen size, and referrer.

### What is NOT collected

- No personal data
- No names, email addresses, or user accounts
- No IP addresses stored
- No cookies set
- No browser fingerprinting
- No cross-site tracking

### Why

This helps understand which features are most used (e.g. are more users running XSLT transforms or XPath queries?) and which examples are most popular, so development effort can be focused on what matters most to CPI developers.

### Opting out

If you run XSLTDebugX locally (`file://` or `localhost`) GoatCounter does not load. Any standard ad blocker (uBlock Origin, Privacy Badger, etc.) will also block the GoatCounter script — the app works fully without it.

---

## License

MIT — with an additional request that this software is not used for commercial purposes without prior written permission from the author. See [LICENSE](LICENSE) for full details.

---

## Third-Party Licenses

This project uses the following open source libraries:

| Library | License | Usage |
|---|---|---|
| [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) by Saxonica | [MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/) | XSLT 3.0 engine and XPath evaluator — bundled locally in `lib/SaxonJS2.js`, unmodified |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) by Microsoft | [MIT](https://github.com/microsoft/monaco-editor/blob/main/LICENSE.md) | Code editor — loaded from CDN |
| [Pako](https://github.com/nodeca/pako) by Nodeca | [MIT](https://github.com/nodeca/pako/blob/master/LICENSE) | Compression for share URLs — loaded from CDN |
| [JetBrains Mono](https://www.jetbrains.com/legalforms/fonts/) by JetBrains | [OFL-1.1](https://scripts.sil.org/OFL) | Monospace font — loaded from Google Fonts |

---

## Trademarks

SAP®, SAP Cloud Integration, and SAP Cloud Platform Integration (CPI) are registered trademarks of SAP SE. SuccessFactors® and IDoc® are trademarks or registered trademarks of SAP SE.

This project is not affiliated with, endorsed by, or in any way officially connected with SAP SE.