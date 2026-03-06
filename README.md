# XSLTDebugX — SAP CPI XSLT IDE

> A browser-based XSLT 3.0 IDE built specifically for SAP Cloud Platform Integration (CPI) developers. Test and debug XSLT mappings locally — with full CPI runtime simulation — before ever deploying to your tenant.

---

## Why This Exists

SAP CPI's built-in mapping editor has no debugger, no live validation, and no way to test an XSLT stylesheet without deploying it to an integration flow and running an actual message through. Every iteration means a deploy cycle.

XSLTDebugX runs entirely in the browser. There is nothing to install, no build step, and no server. Open the page, paste your XML and XSLT, press **Ctrl+Enter**, and see the output — with your headers, properties, and `xsl:message` traces in a live console.

---

## Features

### Editor
- **Monaco Editor** — the same engine powering VS Code, with full XML syntax highlighting, bracket pair colourisation, auto-close tags, attribute `=""` insertion, and indent guides
- **Live validation** — XML and XSLT are validated as you type, with inline red squiggles and glyph margin markers at the offending line
- **Format** — pretty-print any pane with a single click
- **Upload / Download / Drag-drop** — load files directly into the XML or XSLT pane

### Transform Engine
- **XSLT 3.0** powered by [Saxon-JS 2.x](https://www.saxonica.com/saxon-js/documentation/index.html) — full spec support including `xsl:iterate`, higher-order functions, maps, arrays, and `xsl:message`
- **Pre-flight validation** — well-formedness is checked before Saxon ever sees your XML or XSLT, so errors are caught early with precise line numbers
- **Pretty-printed output** — XML output is auto-formatted; non-XML output (plain text, JSON-like strings) is shown as-is

### SAP CPI Simulation
- **Headers and Properties** — enter name/value pairs in the left panel; they are injected as `xsl:param` values exactly as the CPI runtime would pass them
- **`cpi:setHeader` / `cpi:setProperty`** — CPI extension calls are intercepted, their static string values extracted and shown in the Output Headers / Output Properties panels, and the calls are stripped before Saxon runs so it never sees the unknown namespace
- **`$exchange` param** — always injected automatically; stylesheets that declare `<xsl:param name="exchange"/>` never get a Saxon parameter error
- **`xsl:message` in console** — Saxon-JS routes `xsl:message` to `console.log`; XSLTDebugX intercepts those and surfaces them as amber console entries, in correct execution order — before the transform completion line on success, and before the error on `terminate="yes"`
- **`terminate="yes"` shown as intentional halt** — logged as a warning, not an error, and the XSLT editor is not marked with a spurious red glyph

### Examples Library
16 built-in examples across 4 categories, loadable from the Examples menu:

| Category | Examples |
|---|---|
| **Data Transformation** | Identity Transform, Rename & Filter Elements, Conditional Mapping, Namespace Handling, Lookup Table, Split into Multiple Records |
| **Aggregation & Splitting** | Aggregate Line Items, Multi-Source Merge, Group By Key |
| **Format Conversion** | XML to Flat File, Flat File to XML, IDoc Segments to XML |
| **SAP CPI Patterns** | Set Headers & Properties, SuccessFactors Upsert Mapping, SAP Batch Key Recovery, xsl:message Debugging |

### Share
A full session — XML input, XSLT stylesheet, headers, and properties — is encoded into a single URL. Click **Share**, and the URL is copied to your clipboard automatically. Send it to a colleague; they open the URL and the exact same session loads, with no server involved.

The encoding is: JSON → `TextEncoder` → `pako.deflateRaw` (level 9) → chunked `btoa` → base64url. The result lives in the URL hash fragment, so it never hits a server.

### Session Persistence
Everything is auto-saved to `localStorage` 800ms after you stop typing. Close the tab, reopen it — editors, headers, properties, and column states are all restored. A subtle "● Saved" pill in the status bar confirms each write.

### Themes
Light and dark mode, with separate Monaco editor themes tuned for each. Preference is persisted across sessions.

---

## CPI Developer Reference

### How CPI passes params to XSLT

In a real CPI integration flow, every message header and exchange property declared in your XSLT as `<xsl:param name="SomeHeader"/>` is injected by the runtime automatically. XSLTDebugX replicates this exactly — add a row to the Headers or Properties panel with the parameter name you declared, and it will be available in your stylesheet.

```xslt
<!-- Declare in your stylesheet -->
<xsl:param name="SAPClient"/>
<xsl:param name="TargetSystem"/>

<!-- Use it -->
<xsl:value-of select="$SAPClient"/>
```

Add `SAPClient` and `TargetSystem` to the Headers panel with your test values, and the transform runs as if CPI had injected them.

### How CPI extension calls are handled

CPI provides two extension functions for setting output headers and properties from within XSLT:

```xslt
<xsl:value-of select="cpi:setHeader($exchange, 'Content-Type', 'application/xml')"/>
<xsl:value-of select="cpi:setProperty($exchange, 'OrderStatus', 'APPROVED')"/>
```

Saxon-JS does not know the `cpi:` namespace and would throw an error if it saw these calls. XSLTDebugX handles them in two steps before running the transform:

1. **Extract** — static string values are captured via regex and shown in the Output Headers / Output Properties panels after the transform completes
2. **Strip** — the `xmlns:cpi` declaration and all `xsl:value-of` elements whose `select` calls `cpi:set*` are removed from the XSLT source

Only static string literals (single-quoted) are extracted. Dynamic values (`concat(...)`, variables, etc.) will show `— none —` in the output panels but are not lost — the stylesheet logic still executes correctly; only the display panel cannot show them statically.

**Known limitation:** stripping CPI calls removes lines from the XSLT before Saxon sees it. If Saxon reports an error on line N, the actual line in your editor may be at line N + offset. The console notes this, and the error glyph in the editor attempts a best-effort match.

### The `$exchange` param

CPI stylesheets often declare `<xsl:param name="exchange"/>` to receive the exchange object passed by the runtime. Saxon-JS would throw `XTTE0570: Supplied parameter exchange has no corresponding xsl:param` on any stylesheet that does _not_ declare it.

XSLTDebugX always injects `exchange: 'exchange'` (a dummy string) into the stylesheet params map, so both cases work without any configuration.

### Namespace declarations for CPI stylesheets

Every CPI XSLT needs the following namespace declarations. Missing any of them causes Saxon or the CPI runtime to throw namespace errors.

```xslt
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cpi="http://sap.com/it/cpi/scripting"
  xmlns:sap="http://www.sap.com"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  exclude-result-prefixes="cpi sap xs fn">
```

- `xmlns:cpi` — required for `cpi:setHeader` / `cpi:setProperty`
- `xmlns:sap` — SAP-specific extension functions and appears in SAP-generated payloads (IDoc, SOAP)
- `xmlns:xs` — required for any type cast: `xs:string(...)`, `xs:decimal(...)`, `xs:date(...)`
- `xmlns:fn` — explicit prefix for XPath functions: `fn:concat`, `fn:string-join`, etc.
- `exclude-result-prefixes` — prevents these namespace declarations leaking into output elements

For multi-mapping scenarios, also add:

```xslt
xmlns:multimap="http://sap.com/xi/XI/SplitAndMerge"
```

### Using `xsl:message` for debugging

`xsl:message` is the XSLT equivalent of `console.log`. In CPI, messages appear in the message monitor log. In XSLTDebugX, they appear in the console panel as amber entries.

```xslt
<!-- Trace a variable value -->
<xsl:message select="concat('DEBUG orderCount = ', $orderCount)"/>

<!-- Trace loop position -->
<xsl:message select="concat('DEBUG processing ', position(), ' of ', last())"/>

<!-- Hard stop on unexpected condition -->
<xsl:message terminate="yes" select="concat('FATAL: unknown status [', $status, ']')"/>
```

`terminate="yes"` is shown as a warning (not an error) in the console, and any messages fired before the halt appear above it — so the trace that led to the termination is always visible.

---

## Getting Started

### Use online

Open the GitHub Pages URL. No account, no install.

### Run locally

```bash
git clone https://github.com/your-org/XSLTDebugX.git
cd XSLTDebugX
open index.html    # macOS
# or just double-click index.html in your file manager
```

No build step. No `npm install`. No server required.

> **Note:** Clipboard auto-copy uses `navigator.clipboard` which requires HTTPS or `localhost`. On `file://`, it falls back to `document.execCommand('copy')` automatically.

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` / `Cmd+Enter` | Run transform |
| `Escape` | Close modal |

---

## Deployment

### GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings → Pages → Source**
3. Select branch `main`, folder `/` (root)
4. Save — the site will be live at `https://your-org.github.io/XSLTDebugX/`

A `.nojekyll` file is already included so GitHub Pages serves the JS files correctly without Jekyll interfering.

### Any static host

Copy the entire `XSLTDebugX-build/` directory to any static file host (Netlify, Vercel, S3, nginx). No server-side processing is needed.

### CDN dependencies

The following resources load from CDN at runtime. The app requires an internet connection unless these are self-hosted:

| Resource | URL |
|---|---|
| Monaco Editor | `cdn.jsdelivr.net/npm/monaco-editor@0.44.0` |
| Pako (compression) | `cdnjs.cloudflare.com/ajax/libs/pako/2.1.0` |
| JetBrains Mono font | `fonts.googleapis.com` |

Saxon-JS is bundled locally in `lib/SaxonJS2.js` and does not require a CDN connection.

---

## Project Structure

```
XSLTDebugX-build/
├── index.html              # App shell — layout, modals, script tags
├── css/
│   └── style.css           # All styles, themes (light/dark), component CSS
├── js/
│   ├── state.js            # Global state, console (clog), status bar, localStorage persistence
│   ├── validate.js         # DOMParser XML validation, Monaco markers and decorations
│   ├── panes.js            # clearPane, copyPane, prettyXML formatter, fmtEditor
│   ├── transform.js        # CPI extraction/stripping, KV panels, runTransform, xsl:message intercept
│   ├── examples-data.js    # All 16 built-in examples (XML + XSLT strings + metadata)
│   ├── modal.js            # Examples library modal, grid rendering, loadExample
│   ├── files.js            # File upload, download, drag-and-drop
│   ├── ui.js               # Column collapse, console minimize/maximize, theme toggle
│   ├── share.js            # Share URL encode/decode, share modal
│   └── editor.js           # Monaco init, themes, auto-close tags, debounced validation, Saxon init
└── lib/
    └── SaxonJS2.js         # Saxon-JS 2.x bundled locally (no CDN dependency)
```

### Script load order

Scripts must load in this exact order (as declared in `index.html`). Breaking the order causes reference errors because each file depends on globals from files above it.

```
pako (CDN)          ← must load before Monaco's AMD loader (AMD conflict)
Monaco loader (CDN) ← AMD require() setup
SaxonJS2.js         ← Saxon engine
state.js            ← eds, kvData, clog, scheduleSave — used by everything
validate.js         ← validateXML, markErrorLine, parseSaxonErrorLine
panes.js            ← prettyXML, copyPane, fmtEditor, _suppressNextValidation
transform.js        ← extractCPICalls, stripCPICalls, renderKV, runTransform
examples-data.js    ← EXAMPLES object
modal.js            ← openExModal, loadExample
files.js            ← handleUpload, downloadPane, setupDragDrop
ui.js               ← toggleSideCol, copyConsole, toggleTheme, clog helpers
share.js            ← loadFromShareHash, applyShareData, openShareModal
editor.js           ← Monaco create(), Saxon ready-check, session restore
```

---

## Architecture Notes

### CPI call stripping

`stripCPICalls()` in `transform.js` processes the XSLT source with four regex passes before it reaches Saxon:

1. Remove `xmlns:cpi="..."` namespace declaration
2. Remove `cpi` from `exclude-result-prefixes` (Saxon errors on undeclared prefixes even in that attribute)
3. Remove self-closing `<xsl:value-of select="cpi:set..."/>`
4. Remove open+close `<xsl:value-of select="cpi:set..."></xsl:value-of>`

The regex uses an attribute-value-aware inner pattern (`"[^"]*"|'[^']*'|[^<>]`) to avoid breaking on `>` characters inside attribute values.

### `xsl:message` interception

Saxon-JS routes `xsl:message` output to `console.log("xsl:message: <text>")`. There is no public hook in `SaxonJS.XPath.evaluate()` mode to intercept these differently.

XSLTDebugX temporarily replaces `console.log` with a wrapper before calling Saxon, captures any string starting with `"xsl:message: "`, and restores the original in a `finally` block. Messages are flushed to the in-app console at the right point:

- **On success:** before the "Transform complete" line
- **On error / terminate:** before the error message (so the trace that led to a failure appears above it)

### Share URL encoding

`encodeShareData()` in `share.js`:

```
{ xml, xslt, headers, properties }
  → JSON.stringify
  → TextEncoder.encode (UTF-8 bytes)
  → pako.deflateRaw (level 9)
  → chunked String.fromCharCode.apply (8192-byte chunks to avoid O(n²) and stack limits)
  → btoa
  → base64url (replace + → -, / → _, strip trailing =)
  → appended to URL as #share/<encoded>
```

The hash fragment is stripped via `history.replaceState` after decoding on the receiving end, so the share URL does not persist in the browser history of the recipient.

### Session persistence flags

Two boolean flags coordinate programmatic editor writes so they do not trigger unwanted side effects:

- `_suppressNextSave` — set before any `setValue` that should not trigger a localStorage write (share apply, example load, session clear). Always explicitly reset to `false` after both `setValue` calls to handle the case where the new value matches the current value and Monaco fires no change event.
- `_suppressNextValidation` — set before any `setValue` that should not trigger live validation (same scenarios). Same explicit reset pattern.

---

## Contributing

### Adding an example

Open `js/examples-data.js`. Add a new entry to the `EXAMPLES` object before the closing `};`:

```js
myNewExample: {
  label: 'My Example',          // shown in the card title
  icon:  '🗂️',                  // emoji shown in the card
  desc:  'One sentence description shown under the title',
  cat:   'cpi',                 // transform | aggregation | format | cpi
  xml: `<?xml version="1.0"?>
<Root>...</Root>`,
  xslt: `<?xml version="1.0"?>
<xsl:stylesheet version="3.0" ...>
  ...
</xsl:stylesheet>`,
  // Optional: pre-fill the Headers / Properties panels
  headers:    [['Content-Type', 'application/xml']],
  properties: [['SAPClient', '100']],
}
```

Don't forget to add a trailing comma after the previous entry.

### No build step

Edit JS and CSS files directly. Reload the browser. There is no bundler, transpiler, or watcher. What you write is what runs.

---

## Browser Compatibility

| Browser | Status |
|---|---|
| Chrome / Edge (Chromium) | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ Supported (Monaco has minor visual differences) |
| `file://` protocol | ✅ Works — clipboard falls back to `execCommand` |

Requires a modern browser for: `TextEncoder`, `DOMParser`, `navigator.clipboard` (or `execCommand` fallback), CSS custom properties.

---

## Known Limitations

| Limitation | Detail |
|---|---|
| CPI line number offset | `stripCPICalls` removes lines before Saxon sees the XSLT. Saxon error line numbers may not match the original editor lines. |
| Dynamic CPI values | `cpi:setHeader` / `cpi:setProperty` calls using variables or `concat()` cannot be statically extracted. The output panels will show `— none —` for those values. |
| No XPath evaluator | There is no dedicated panel to evaluate an XPath expression against the input XML without writing a full transform. |
| Monaco on `file://` | Some Monaco features behave differently on `file://` due to browser security restrictions. Serve from `localhost` or GitHub Pages for the full experience. |

---

## License

MIT

---

## Trademarks

SAP® and SAP Cloud Platform Integration (CPI) are registered trademarks of SAP SE. SuccessFactors® and IDoc® are trademarks or registered trademarks of SAP SE.

This project is not affiliated with, endorsed by, or in any way officially connected with SAP SE. All product and company names are used for identification purposes only.
