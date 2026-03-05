# XSLTDebugX — SAP CPI Developer IDE

A browser-based XSLT 3.0 IDE built for SAP Cloud Platform Integration (CPI) developers.

## Features

- **Live XSLT 3.0 transforms** powered by Saxon-JS
- **Monaco Editor** with syntax highlighting, error markers, auto-close tags
- **CPI simulation** — `cpi:setHeader` / `cpi:setProperty` support
- **16 built-in examples** covering common SAP CPI mapping patterns
- **Session persistence** — editors auto-save to localStorage
- **Format / Copy / Download** for all panes

## Project Structure

```
xsltdebugx/
├── index.html              # App shell (HTML only)
├── css/
│   └── style.css           # All styles + themes
├── js/
│   ├── state.js            # Global state, console, status bar, persistence
│   ├── validate.js         # XML validation, Monaco markers/decorations
│   ├── panes.js            # clearPane, copyPane, prettyXML, fmtEditor
│   ├── transform.js        # CPI stripping, KV panels, runTransform
│   ├── examples-data.js    # EXAMPLES data (XML + XSLT strings)
│   ├── modal.js            # Examples library modal + EX_META
│   ├── files.js            # Upload, download, drag-drop
│   ├── ui.js               # Column collapse, console state, theme toggle
│   └── editor.js           # Monaco init, auto-close, debounced validation
└── lib/
    └── SaxonJS2.js         # Saxon-JS 2.x (local copy)
```

## Script Load Order

Files must load in this order (declared in `index.html`):

1. `state.js` — global vars used by everything
2. `validate.js` — used by panes + transform
3. `panes.js` — used by transform + editor
4. `transform.js` — depends on validate + panes
5. `examples-data.js` — pure data, no dependencies
6. `modal.js` — depends on examples-data
7. `files.js` — depends on state + panes
8. `ui.js` — depends on state
9. `editor.js` — Monaco init, depends on everything above

## Deployment (GitHub Pages)

Push to `main` branch and enable GitHub Pages from repository settings → Pages → Deploy from branch `main`, folder `/` (root).

No build step required. Monaco and Google Fonts load from CDN; Saxon-JS loads from `./lib/`.
