# XSLTDebugX — Documentation Index

> **Browser-based XSLT 3.0 IDE for SAP Cloud Integration developers.**

Welcome! Use this index to find documentation for your role. All paths are relative to this file's location (`.github/docs/`).

---

## 👤 For Users

Start here if you want to **use XSLTDebugX** for XSLT transformations and XPath evaluation.

| Document | Purpose |
|----------|---------|
| [USERS/README.md](USERS/README.md) | Feature overview, getting started, common workflows, example gallery |
| [USERS/KEYBOARD_SHORTCUTS.md](USERS/KEYBOARD_SHORTCUTS.md) | Keyboard shortcuts quick reference |
| [../README.md](../README.md) | Project overview, badges, links to docs (user-facing landing page) |

**Quick Start:**
1. Open XSLTDebugX in your browser
2. Load or paste XSLT + XML
3. Click **Transform** or switch to **XPath** mode
4. View results in Output pane

---

## 🛠️ For Developers

Start here if you want to **contribute code, fix bugs, or understand the architecture**.

| Document | Purpose |
|----------|---------|
| [DEVELOPERS/SETUP.md](DEVELOPERS/SETUP.md) | Local development environment, testing checklist, performance tips |
| [DEVELOPERS/DEBUGGING.md](DEVELOPERS/DEBUGGING.md) | Browser DevTools debugging, localStorage inspection, error diagnosis |
| [DEVELOPERS/CODE_STYLE.md](DEVELOPERS/CODE_STYLE.md) | Naming conventions, module patterns, comment style, global namespace rules |
| [DEVELOPERS/CRITICAL_CONSTRAINTS.md](DEVELOPERS/CRITICAL_CONSTRAINTS.md) | Must-know patterns: Saxon async, CPI rewriting, debouncing, Share URL limits |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Module structure, data flow, design patterns, state management |
| [TESTING.md](TESTING.md) | E2E testing with Playwright, Page Object Model patterns, timing strategies, feature-specific setups |

**Quick Start:**
1. Clone repo and run `npm install`
2. Serve locally: `npx serve .` (or Python/PHP)
3. Open browser to `localhost:3000` (or your port)
4. Edit `.js`, `.css`, `.html` files; refresh to test
5. Run tests: `npm run test:e2e`

---

## 📝 For Contributors

Start here if you want to **contribute examples, documentation, or submit pull requests**.

| Document | Purpose |
|----------|---------|
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | PR process, code of conduct, testing before submission, browser compatibility checklist |
| [CONTRIBUTORS/CODE_STYLE.md](CONTRIBUTORS/CODE_STYLE.md) | Coding standards, naming conventions, comment patterns (detailed style guide) |
| [CONTRIBUTORS/COMMIT_GUIDELINES.md](CONTRIBUTORS/COMMIT_GUIDELINES.md) | Commit message format, PR title conventions, review process |
| [../CHANGELOG.md](../CHANGELOG.md) | Release notes and version history |

**Quick PR Workflow:**
1. Fork repo → Create feature branch
2. Make changes → Run tests locally
3. Test in browser across Chrome, Firefox, Safari, Edge
4. Commit with clear message (see COMMIT_GUIDELINES.md)
5. Submit PR with description of changes

---

## 📚 API Reference & Features

Technical documentation for developers extending or debugging the application.

| Document | Purpose |
|----------|---------|
| [../instructions/features.instructions.md](../instructions/features.instructions.md) | Complete 200+ feature catalog, function locations, implementation patterns |
| [../instructions/examples-data.instructions.md](../instructions/examples-data.instructions.md) | Example library structure, validation rules, category reference |
| [../instructions/testing.instructions.md](../instructions/testing.instructions.md) | Test architecture, EditorPage API, timing strategies, feature-specific test setups |
| [../instructions/transform.instructions.md](../instructions/transform.instructions.md) | XSLT execution, CPI simulation, error line mapping, debugging techniques |

**Use When:**
- Adding new features → features.instructions.md
- Creating XSLT/XPath examples → examples-data.instructions.md
- Writing E2E tests → testing.instructions.md
- Debugging transform or CPI issues → transform.instructions.md

---

## 🚀 Workspace Configuration

| Document | Purpose |
|----------|---------|
| [../copilot-instructions.md](../copilot-instructions.md) | Workspace guidelines, tech stack, module organization, critical constraints (used by Copilot AI agent) |
| [../AGENTS.md](../AGENTS.md) | Agent customization reference, skill documentation (if available) |

---

## 📋 Related Files

| File | Purpose |
|------|---------|
| [../wrangler.jsonc](../wrangler.jsonc) | Cloudflare Workers deployment config |
| [../_headers](../_headers) | HTTP cache rules and security headers |
| [../_redirects](../_redirects) | SPA routing (404 fallback) |
| [../package.json](../package.json) | Dependencies, npm scripts, metadata |

---

## 🔍 Where to Start?

**I want to...**

- **Use XSLTDebugX** → [USERS/README.md](USERS/README.md)
- **Set up local development** → [DEVELOPERS/SETUP.md](DEVELOPERS/SETUP.md)
- **Understand the architecture** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Write a test** → [TESTING.md](TESTING.md)
- **Add a new example** → [../instructions/examples-data.instructions.md](../instructions/examples-data.instructions.md)
- **Debug a feature** → [DEVELOPERS/DEBUGGING.md](DEVELOPERS/DEBUGGING.md)
- **Understand code style** → [DEVELOPERS/CODE_STYLE.md](DEVELOPERS/CODE_STYLE.md)
- **Submit a PR** → [../CONTRIBUTING.md](../CONTRIBUTING.md)
- **Find a specific function** → [../instructions/features.instructions.md](../instructions/features.instructions.md)
- **Debug CPI simulation** → [../instructions/transform.instructions.md](../instructions/transform.instructions.md)

---

## Navigation

- [File Browser](./) — Browse all .github/docs files and subfolders
- [Root README](../README.md) — Project overview (user-facing)
- [License & Third Party](../LICENSE) — Licensing information
