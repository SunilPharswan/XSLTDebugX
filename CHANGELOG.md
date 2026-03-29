# Changelog

All notable changes to XSLTDebugX are documented here.

---

## [Unreleased]

---

## [1.2.0] — 2026-03-27

### Added
- **Architecture Overview** — New ARCHITECTURE.md with module structure, data flow diagrams, and design patterns
- **Development Guide** — New DEVELOPMENT.md for local setup, debugging, and testing workflows
- **Contributing Guide** — New CONTRIBUTING.md with code style, PR process, and testing checklist
- **Expanded Deployment Docs** — Detailed Cloudflare Pages setup, cache strategy, SPA routing, and release checklist in README
- **Advanced Debugging Section** — Browser DevTools integration, performance profiling, localStorage inspection, and network debugging
- **Instruction Files Index** — New `.github/instructions/README.md` for navigation across API docs
- **CHANGELOG.md** — This file, documenting all notable changes

### Enhanced
- **README.md** — Updated Table of Contents to include Architecture Overview and Development Guide
- **copilot-instructions.md** — Added comprehensive References section linking to all documentation files
- **Code Quality** — Verified comments in transform.js, xpath.js, validate.js are complete and current
- **Deployment Documentation** — Added cache configuration details, SPA routing explanation, and release process

### Documentation
- Updated SDK documentation links to point to new ARCHITECTURE.md
- Added navigation references between CONTRIBUTING.md, ARCHITECTURE.md, DEVELOPMENT.md, and README.md
- Cross-referenced all instruction files in copilot-instructions.md

---

## [1.1.0] — 2026-02-20

### Added
- **CPI GET/SET Complete Example** — Comprehensive example showing all 4 CPI functions (`getHeader`, `setHeader`, `getProperty`, `setProperty`) with step-by-step console debugging
- **Console Enhancements** — Search box, message type filtering (All/Info/Warn/Error), minimize/restore, error/warning count badges, auto-expand on errors
- **XPath Mode Improvements** — Expression history (last 20), clickable hint chips, auto-growing input bar, namespace-agnostic examples
- **Example Library Deduplication** — Reviewed and refined 46 examples across 5 categories

### Fixed
- XPath highlights now clear when switching to XSLT mode
- XPath results re-colorize correctly after theme toggle
- Session persistence preserves column collapse state
- Header/property validation warnings logged correctly

### Enhanced
- Output section minimizes automatically when XPath results are shown
- Cursor position tracking updated for both XSLT and XPath modes
- Console message timestamps added for better debugging
- Example library grid search now highlights matching text

---

## [1.0.0] — 2026-01-15

### Initial Release

#### Features
- **XSLT 3.0 Engine** — Full Saxon-JS 2.7 integration with XSLT 3.0 and XPath 3.1
- **Two Modes** — XSLT (transform + debug) and XPath (expression evaluator)
- **Live Validation** — XML and XSLT validated as you type with inline error markers
- **CPI Simulation** — `cpi:setHeader`, `cpi:getHeader`, `cpi:setProperty`, `cpi:getProperty` fully simulated
- **47 Built-in Examples** — Across 5 categories (Data Transformation, Aggregation, Format Conversion, SAP CPI Patterns, XPath Explorer)
- **Monaco Editor** — XML syntax highlighting, bracket pair coloring, auto-close tags, indent guides
- **Format & Minify** — Pretty-print or minify any pane via toolbar or context menu
- **Output Language Detection** — Auto-detects XML, JSON, plain text (CSV, fixed-length, EDI)
- **XPath Evaluator** — Evaluate expressions with result highlighting in XML editor
- **Console** — Message types (info, warn, error), `xsl:message` integration, timestamp tracking
- **Share URLs** — Encode XML, XSLT, headers, properties into shareable links
- **Session Persistence** — Auto-save to localStorage, survives browser refresh
- **Dark/Light Theme** — Toggle theme, preference persisted
- **Responsive Layout** — 3-column flex layout, collapsible sections, tablet/mobile support
- **File Operations** — Upload, download, drag-and-drop for XML and XSLT panes

#### Tech Stack
- Vanilla JavaScript ES6+ (no framework)
- Monaco Editor 0.44.0 (syntax highlighting, editor features)
- Saxon-JS 2.7 (XSLT 3.0 + XPath 3.1 processor)
- Cloudflare Pages (static site hosting)
- Zero build step

#### Documentation
- [README.md](../README.md) — Feature overview, getting started, keyboard shortcuts, common workflows
- [.github/instructions/features.instructions.md](instructions/features.instructions.md) — Feature inventory and API reference
- [.github/instructions/examples-data.instructions.md](instructions/examples-data.instructions.md) — Example library structure
- [.github/instructions/transform.instructions.md](instructions/transform.instructions.md) — CPI simulation details
- [.github/copilot-instructions.md](copilot-instructions.md) — Workspace development guidelines
- [.github/skills/](skills/) — Automated skills for examples management
- [.github/prompts/](prompts/) — Interactive prompts for example creation

---

## Versioning

XSLTDebugX uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes (e.g., XSLT 2.0 only → 3.0 only)
- **MINOR** — New features, enhancements (backward compatible)
- **PATCH** — Bug fixes (backward compatible)

---

## Release Process

Before releasing a new version:

1. Update version in `README.md`
2. Add entry to `CHANGELOG.md` with date and changes
3. Run [example-validator](../skills/example-validator/) — ensure all 46 examples pass
4. Test all 5 example categories in browser
5. Verify no console errors or warnings
6. Create GitHub release with version tag and CHANGELOG excerpt
7. Push to `main` — Cloudflare Pages auto-deploys

---

## Support

- **Bug reports**: Open a GitHub Issue with "Bug:" prefix
- **Feature requests**: Open a GitHub Issue with "Feature:" prefix
- **Questions**: Use GitHub Discussions or open an Issue with "Question:" prefix
- **Security issues**: Do not open a public issue; contact maintainer privately

---

## License

All changes are licensed under MIT. See [LICENSE](../LICENSE) for details.
