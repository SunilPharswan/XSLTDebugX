# Developer Documentation Hub

Central location for all XSLTDebugX developer documentation.

---

## 🚀 Getting Started

**New to XSLTDebugX development?** Start here:

1. **Want to set up local development?** → [DEVELOPMENT.md](DEVELOPMENT.md)
2. **Want to understand the codebase?** → [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
3. **Want to contribute code?** → [../../CONTRIBUTING.md](../../CONTRIBUTING.md)
4. **Want the full API reference?** → [../instructions/features.instructions.md](../instructions/features.instructions.md)

---

## 📚 Documentation Structure

```
.github/docs/               ← YOU ARE HERE (developer docs)
├── README.md              ← This file (navigation hub)
├── DEVELOPMENT.md         ← Local setup, debugging, testing
├── TESTING.md             ← E2E testing guide with Playwright
├── UX_ROADMAP.md          ← Strategic UX improvements (phases 1-3)
├── CHECKLIST.md           ← Tactical UX checklist with file locations
├── FEATURE_CHECKLIST.md   ← Quick reference to 200+ features
│
.github/instructions/       ← API reference (all 200+ features)
├── README.md              ← Features API hub
├── features.instructions.md
├── examples-data.instructions.md
├── transform.instructions.md
│
.github/skills/            ← Specialized tools
├── example-validator/     ← Audit all examples
└── xslt-example/          ← Create new examples
│
.github/ux/                ← Archived UX analysis (reference)
├── README.md              ← Archive index
├── UX_ANALYSIS.md         ← Detailed pain points (52 issues)
└── UX_ANALYSIS_SUMMARY.md ← Executive summary

Root:
├── README.md              ← User-facing features + getting started
├── ARCHITECTURE.md        ← Module structure, data flow
├── CONTRIBUTING.md        ← PR process, code style, setup
├── CHANGELOG.md           ← Version history
└── LICENSE
```

---

## 🎯 Common Tasks

### **I want to...**

- **Get the app running locally**
  → [DEVELOPMENT.md - Running the App Locally](DEVELOPMENT.md#running-the-app-locally)

- **Debug a feature in the browser**
  → [DEVELOPMENT.md - Debugging in Browser](DEVELOPMENT.md#debugging-in-browser)

- **Understand how the codebase is organized**
  → [../../ARCHITECTURE.md](../../ARCHITECTURE.md)

- **Submit a code contribution**
  → [../../CONTRIBUTING.md](../../CONTRIBUTING.md)

- **Find API docs for a specific function**
  → [../instructions/features.instructions.md](../instructions/features.instructions.md) (200+ feature catalog)

- **Understand XSLT rewriting and CPI simulation**
  → [../instructions/transform.instructions.md](../instructions/transform.instructions.md)

- **Add a new XSLT example**
  → [../skills/xslt-example/](../skills/xslt-example/) (interactive skill)

- **Audit all examples for quality**
  → [../skills/example-validator/](../skills/example-validator/) (verification tool)

- **Check UX improvements roadmap**
  → [UX_ROADMAP.md](UX_ROADMAP.md) (strategic plan)

- **Start implementing a UX improvement**
  → [CHECKLIST.md](CHECKLIST.md) (tactical checklist with file locations)

---

## 🔍 What Changed: Documentation Centralization

**As of March 2026**, documentation was reorganized for clarity:

| Before | After | Reason |
|--------|-------|--------|
| `DEVELOPMENT.md` (root) | `.github/docs/DEVELOPMENT.md` | Consolidate dev docs |
| `UX_IMPROVEMENT_PLAN.md` (root) | `.github/docs/UX_ROADMAP.md` | Move active roadmap to dev hub |
| `UX_QUICK_REFERENCE.md` (root) | `.github/docs/CHECKLIST.md` | Move tactical guide to dev hub |
| `UX_ANALYSIS.md` (root) | `.github/ux/UX_ANALYSIS.md` | Archive historical analysis |
| `UX_ANALYSIS_SUMMARY.md` (root) | `.github/ux/UX_ANALYSIS_SUMMARY.md` | Archive executive summary |
| `feature-checklist.md` (.github) | `.github/docs/FEATURE_CHECKLIST.md` | Centralize feature reference |
| N/A | `.github/docs/README.md` | Create this navigation hub |
| N/A | `.github/ux/README.md` | Index archived UX docs |

**Root remains clean:** User-facing docs (README, CONTRIBUTING, ARCHITECTURE, CHANGELOG, LICENSE) stay at root.

---

## 📖 Reference Guides

### For Users
- [README.md](../../README.md) — Features, getting started, keyboard shortcuts, common workflows
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Code contribution process, code style

### For Developers
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — Module structure, data flow, design patterns
- [DEVELOPMENT.md](DEVELOPMENT.md) — Local dev setup, debugging, testing
- [TESTING.md](TESTING.md) — E2E testing guide (Playwright, test structure, running tests)
- [../instructions/features.instructions.md](../instructions/features.instructions.md) — Complete 200+ feature API

### For Code Review
- [../instructions/examples-data.instructions.md](../instructions/examples-data.instructions.md) — Example structure, validation
- [../instructions/transform.instructions.md](../instructions/transform.instructions.md) — CPI simulation, XSLT rewriting

### For UX Improvement
- [UX_ROADMAP.md](UX_ROADMAP.md) — Strategic 3-phase plan with blockers, issues, quick wins
- [CHECKLIST.md](CHECKLIST.md) — Tactical 20-item checklist with file locations and effort estimates

### For Historical Reference
- [../ux/](../ux/) — Archived UX analysis, detailed pain points inventory

---

## 🏗️ Architecture Quick Reference

**Module Load Order** (critical — edit order in `index.html`):
```
state.js → editor.js → transform.js → validate.js → xpath.js → 
panes.js → files.js → share.js → modal.js → ui.js → examples-data.js
```

**Global State Variables:**
- `eds = { xml, xslt, out }` — Monaco editor instances
- `xmlModelXslt` / `xmlModelXpath` — Separate XML models for mode isolation
- `kvData = { headers: [], properties: [] }` — CPI simulation params
- `saxonReady` — Saxon-JS async readiness flag
- `xpathEnabled` — Current mode (XSLT vs XPath)

**Code Style:**
- Module-private functions: prefix with `_` (e.g., `_rewriteCPICalls`)
- HTML IDs in camelCase (e.g., `xmlEd`, `runBtn`)
- CSS classes verbose with hyphens (e.g., `.pane-bar`, `.log-line`)
- localStorage keys: `xdebugx-*-v1` (versioned)

For full details, see [ARCHITECTURE.md](../../ARCHITECTURE.md).

---

## 🔄 Workflows

### How to Develop Locally
1. Clone repo: `git clone <url>`
2. Start HTTP server: `python -m http.server`
3. Open browser: `http://localhost:8000`
4. Edit `.js`, `.css`, `.html` files
5. Refresh browser to see changes (no build!)
6. Check DevTools Console for errors

See [DEVELOPMENT.md - Making Changes](DEVELOPMENT.md#making-changes) for detailed walkthrough.

### How to Add an Example
1. Edit [../../js/examples-data.js](../../js/examples-data.js)
2. Add entry to `EXAMPLES` object with fields: `label`, `icon`, `desc`, `cat`, `xml`, `xslt`
3. For XPath: use `xpathExpr` instead of `xslt`
4. For CPI: include `headers`, `properties` arrays
5. Or use the [../skills/xslt-example/](../skills/xslt-example/) interactive skill

See [../instructions/examples-data.instructions.md](../instructions/examples-data.instructions.md) for validation rules.

### How to Test a Change
1. Load [Examples](../../index.html#Examples) to test your change
2. Open DevTools → **Console** and **Debugger**
3. Test all modes: XSLT, XPath, with/without CPI
4. Check for console errors or warnings
5. Verify localStorage persistence (refresh page)
6. Test in multiple browsers if possible

See [DEVELOPMENT.md - Testing Checklist](DEVELOPMENT.md#testing-checklist).

---

## 🚀 Quick Start By Role

### I'm a First-Time Contributor
1. Read [CONTRIBUTING.md](../../CONTRIBUTING.md) — code style, PR process
2. Follow [DEVELOPMENT.md](DEVELOPMENT.md) to get running locally
3. Check [ARCHITECTURE.md](../../ARCHITECTURE.md) to understand code organization
4. Find an issue or feature to work on
5. Submit a PR with tests

### I'm a Feature Developer
1. Scope feature in [ARCHITECTURE.md](../../ARCHITECTURE.md) — which module?
2. Write code using patterns from that module
3. Follow [../../CONTRIBUTING.md](../../CONTRIBUTING.md) code style
4. Test thoroughly with [DEVELOPMENT.md - Testing Checklist](DEVELOPMENT.md#testing-checklist)
5. Update docs if needed: examples-data or API reference

### I'm a UX Researcher / Designer
1. Read [UX_ROADMAP.md](UX_ROADMAP.md) — strategic analysis
2. For implementation prioritization, see [CHECKLIST.md](CHECKLIST.md)
3. Historical analysis: [../ux/](../ux/)
4. To propose changes: open issue with user feedback data

### I'm the Maintenance Lead
1. Monitor [../../CONTRIBUTING.md](../../CONTRIBUTING.md) for PRs
2. Review features against [../instructions/features.instructions.md](../instructions/features.instructions.md)
3. Run [../skills/example-validator/](../skills/example-validator/) before releases
4. Update CHANGELOG after each release
5. Check UX health metrics quarterly

---

## 📞 Need Help?

| Question | Answer |
|----------|--------|
| What feature exists? | [../instructions/features.instructions.md](../instructions/features.instructions.md) (200+ features) |
| How do I code style? | [../../CONTRIBUTING.md](../../CONTRIBUTING.md#code-style-guide) |
| How do I set up locally? | [DEVELOPMENT.md](DEVELOPMENT.md) |
| How do I understand the codebase? | [../../ARCHITECTURE.md](../../ARCHITECTURE.md) |
| What UX improvements are planned? | [UX_ROADMAP.md](UX_ROADMAP.md) or [CHECKLIST.md](CHECKLIST.md) |
| How do I debug in the browser? | [DEVELOPMENT.md - Debugging](DEVELOPMENT.md#debugging-in-browser) |
| How do I test my changes? | [DEVELOPMENT.md - Testing](DEVELOPMENT.md#testing-checklist) |
| How do I add an example? | [../skills/xslt-example/](../skills/xslt-example/) |

---

## 📊 Documentation Stats

- **Root docs:** 6 files (user-facing + architecture)
- **Dev hub:** 6 files (setup, debugging, UX planning)
- **Instructions:** 4 files (API reference, patterns, validation)
- **Skills:** 2 folders (example tools)
- **Archive:** 3 files (historical UX analysis)
- **Total:** 200+ features documented

**Total code examples:** 50+  
**Total workflows documented:** 8+  
**Last updated:** March 2026

---

**👉 Not sure where to start?** Pick a task above and follow the link!
