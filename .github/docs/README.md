# Developer Documentation Hub

**Master index and central location for all XSLTDebugX developer documentation.**

---

## 🚀 Getting Started

**New to XSLTDebugX development?** Start here:

1. **Want to set up local development?** → [DEVELOPMENT.md](DEVELOPMENT.md)
2. **Want to understand the codebase?** → [ARCHITECTURE.md](ARCHITECTURE.md) and [../../CONTRIBUTING.md](../../CONTRIBUTING.md)
3. **Want the full API reference?** → [../instructions/](../instructions/) (all feature docs + API)
4. **Want to contribute?** → [../../CONTRIBUTING.md](../../CONTRIBUTING.md) (code style, PR process, testing checklist)

---

## 📚 Documentation by Category

### Root-Level Documentation (User-Facing & Core)

| File | Purpose | When to Read |
|------|---------|------------|
| [README.md](../../README.md) | Features, getting started, modes, examples library, keyboard shortcuts | Everyone — start here |
| [CONTRIBUTING.md](../../CONTRIBUTING.md) | Code style, PR process, testing checklist, development setup | Before submitting PRs |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module structure, data flow, design patterns, namespace guidelines | Before coding features |
| [CHANGELOG.md](../../CHANGELOG.md) | Version history, release notes, feature additions | For version context |
| [LICENSE](../../LICENSE) | MIT License terms | Legal reference |

### Developer Setup & Workflows

| File | Purpose | When to Read |
|------|---------|------------|
| [DEVELOPMENT.md](DEVELOPMENT.md) | Local dev setup, debugging in browser, performance tips, troubleshooting | Setting up dev environment |
| [TESTING.md](TESTING.md) | E2E test suite, Playwright patterns, fixtures, timing strategies, debugging tests | Writing or debugging tests |

### Feature Reference & Checklists

| File | Purpose | When to Read |
|------|---------|------------|
| [CHECKLIST.md](CHECKLIST.md) | Pre-release verification, launch checklist, quality gates | Before releases |
| [FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md) | Feature validation, acceptance criteria, completeness checks | Implementing features |

### UX & Roadmap

| File | Purpose | When to Read |
|------|---------|------------|
| [UX_ROADMAP.md](UX_ROADMAP.md) | Actionable improvement roadmap, phased enhancement plan | Planning UX improvements |

### Technical Instructions (API Reference & Deep-Dives)

All files in `../instructions/` provide detailed technical documentation:

| File | Purpose | When to Read |
|------|---------|------------|
| [../instructions/README.md](../instructions/README.md) | API reference hub, navigation to all instruction files | First time with instructions |
| [../instructions/features.instructions.md](../instructions/features.instructions.md) | Complete feature catalog (200+ functions), API reference, line numbers | Implementing features |
| [../instructions/examples-data.instructions.md](../instructions/examples-data.instructions.md) | Example library structure, categories, validation rules (M1–M12) | Creating/modifying examples |
| [../instructions/testing.instructions.md](../instructions/testing.instructions.md) | E2E testing architecture, POM patterns, fixtures, timing strategies | Advanced testing work |
| [../instructions/transform.instructions.md](../instructions/transform.instructions.md) | XSLT rewriting, CPI simulation deep dive, error line mapping, param injection | Debugging transforms, fixing CPI |

### Interactive Tools (Skills & Prompts)

| Tool | Purpose | When to Use |
|------|---------|-----------|
| [../skills/xslt-example/](../skills/xslt-example/) | Create and format new XSLT/XPath examples | Adding examples to library |
| [../skills/example-validator/](../skills/example-validator/) | Audit all 46 examples for correctness, apply fixes | Quality-checking examples |
| [../prompts/add-xslt-example.prompt.md](../prompts/add-xslt-example.prompt.md) | Interactive prompt for example generation | Adding examples (interactive mode) |
| [../prompts/validate-examples.prompt.md](../prompts/validate-examples.prompt.md) | Interactive prompt for example validation | Validation with reporting |

### Configuration & Workspace Setup

| File | Purpose | When to Read |
|------|---------|------------|
| [../copilot-instructions.md](../copilot-instructions.md) | Workspace guidelines, architecture overview, constraints, critical code patterns | First time in workspace |
| [../AGENTS.md](../AGENTS.md) | Available agent customizations and specialized modes | Using specialized agents |

---

## 📂 Folder Organization

```
.github/docs/               ← Developer documentation (master location)
├── README.md              ← This file (comprehensive navigation hub)
├── ARCHITECTURE.md        ← Module structure, data flow, design patterns
├── DEVELOPMENT.md         ← Local setup, debugging, testing
├── TESTING.md             ← E2E testing guide with Playwright
├── CHECKLIST.md           ← Pre-release verification checklist
├── FEATURE_CHECKLIST.md   ← Feature validation reference
└── UX_ROADMAP.md          ← Strategic UX improvements roadmap

.github/instructions/       ← Detailed API reference & deep-dives
├── README.md              ← Instructions hub
├── features.instructions.md  ← 200+ feature catalog
├── examples-data.instructions.md ← Example format & validation
├── testing.instructions.md ← E2E test architecture & patterns
└── transform.instructions.md ← CPI simulation & XSLT rewriting

.github/skills/            ← Interactive tools
├── xslt-example/SKILL.md       ← Create new examples
└── example-validator/SKILL.md  ← Audit examples

Root (/)
├── README.md              ← User-facing features
├── CONTRIBUTING.md        ← Code style & PR process
├── CHANGELOG.md           ← Version history
└── LICENSE                ← MIT License
```

---

## 🎯 Common Tasks

### **I want to...**

- **Get the app running locally**
  → [DEVELOPMENT.md - Running the App Locally](DEVELOPMENT.md#running-the-app-locally)

- **Debug a feature in the browser**
  → [DEVELOPMENT.md - Debugging in Browser](DEVELOPMENT.md#debugging-in-browser)

- **Understand how the codebase is organized**
  → [ARCHITECTURE.md](ARCHITECTURE.md)

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
- [ARCHITECTURE.md](ARCHITECTURE.md) — Module structure, data flow, design patterns
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

For full details, see [ARCHITECTURE.md](ARCHITECTURE.md).

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
3. Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand code organization
4. Find an issue or feature to work on
5. Submit a PR with tests

### I'm a Feature Developer
1. Scope feature in [ARCHITECTURE.md](ARCHITECTURE.md) — which module?
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
| How do I understand the codebase? | [ARCHITECTURE.md](ARCHITECTURE.md) |
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
