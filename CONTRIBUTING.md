# Contributing to XSLTDebugX

Welcome! XSLTDebugX is an open-source browser-based XSLT 3.0 IDE maintained by the community. This guide will help you contribute code, documentation, examples, and bug reports.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Before You Start](#before-you-start)
- [Development Setup](#development-setup)
- [Code Style Guide](#code-style-guide)
- [Working with Examples](#working-with-examples)
- [Testing Your Changes](#testing-your-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Issue Reporting](#issue-reporting)
- [License](#license)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please be respectful in all interactions and follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2_1/code_of_conduct/).

---

## Before You Start

- **Check existing issues** — Search [GitHub Issues](https://github.com/yourusername/xsltdebugx/issues) to see if your idea is already being discussed
- **Open an issue first** — For significant features or breaking changes, open an issue to discuss the approach before coding
- **Small fixes** — Bug fixes and documentation improvements can go straight to a PR

---

## Development Setup

XSLTDebugX requires **no build step**. It's a zero-build static site with vanilla JavaScript, CSS, and HTML.

### Prerequisites

- **Git** — for cloning and submitting PRs
- **Node.js 18+** (optional) — only if you want to use `npm` for local serving utilities
- **A modern browser** — Chrome, Firefox, Safari, or Edge for testing
- **A text editor** — VS Code (with Copilot instructions included) is recommended

### Local Serving

XSLTDebugX can be served by any static HTTP server. Choose one:

**Option 1: Using Node.js (if installed)**

```bash
npm install -g serve
serve .
# Open http://localhost:3000
```

**Option 2: Using Python (built-in on most systems)**

```bash
python -m http.server 8000
# Open http://localhost:8000
```

Or Python 2:

```bash
python -m SimpleHTTPServer 8000
```

**Option 3: Using PHP (if installed)**

```bash
php -S localhost:8000
# Open http://localhost:8000
```

**Option 4: VS Code Live Server Extension**

Install the **Live Server** extension in VS Code, right-click `index.html`, and select "Open with Live Server".

### Testing Your Local Build

1. Open your served local URL in a browser
2. Open DevTools (F12) and check the Console for any errors
3. Test each pane (XML, XSLT, Output) with an example:
   - Click **Examples** button → select a transform example
   - Press **Ctrl+Enter** or click **Run XSLT**
   - Verify the output appears and console is clean

---

## Code Style Guide

XSLTDebugX uses vanilla ES6+ JavaScript with no framework or build tool. Follow these conventions:

### JavaScript

**Naming**
- `const` and `let` only — never `var`
- camelCase for variables and functions: `runTransform()`, `xmlContent`
- camelCase for HTML IDs: `xmlEd`, `xsltEd`, `runBtn`, `consoleBody`
- UPPERCASE for constants: `_MIN_SPINNER_MS`, `_xpathHistoryMax`
- Prefix internal/private functions with underscore: `_highlightXPath()`, `_rewriteCPICalls()`
- No unprefixed global functions — wrap in module scope or use `_` prefix to avoid namespace collisions

**Code Organization**
- Use emoji section dividers for major blocks:
  ```javascript
  // ════════════════════════════════════════════
  //  SECTION NAME
  // ════════════════════════════════════════════
  ```
- Group related functions together
- Prefer short, focused functions over large monolithic ones
- Use guard clauses to reduce nesting:
  ```javascript
  if (!saxonReady) {
    clog('Saxon not ready', 'error');
    return;
  }
  // ... rest of function
  ```

**Comments**
- Add comments for **why**, not **what** (code should be self-documenting)
- Inline comments for complex logic (CPI rewriting, XPath tokenization, error parsing)
- Reference line numbers in instructions when needed: `// See validate.js:56`
- No JSDoc comments — keep functions self-describing with clear variable names

**Error Handling**
- Use try/catch for Saxon-JS operations (async evaluation can throw)
- Log errors with `clog(msg, 'error')` before returning or throwing
- Provide user-friendly messages in the console, not stack traces

### CSS

**Naming**
- Use hyphens for class names: `.pane-bar`, `.log-line`, `.xf-error-line-bg`, `.xpath-result-item`
- Prefix VS Code Editor-related classes with `xf-`: `.xf-error-glyph`, `.xf-xpath-match-inline`
- Prefix XPath features with `xpath-`: `.xpath-hint-chip`, `.xpath-results-panel`
- Use semantic grouping: `.hdr-*` for headers panel, `.prop-*` for properties panel

**Colors & Themes**
- Define theme colors in `editor.js` (dark/light theme objects)
- Use CSS custom properties for theme-aware colors when possible
- Keep color contrast WCAG AA compliant

### HTML

**Structure**
- Use semantic HTML5 elements: `<nav>`, `<section>`, `<article>`, `<button>`, etc.
- Use `id` for targeted JS access: `getElementById('xmlEd')`
- Use `data-*` attributes for configuration: `data-pane="xml"`, `data-type="headers"`

---

## Working with Examples

The example library is in [js/examples-data.js](js/examples-data.js) with 52+ examples across 5 categories.

### Adding a New Example

1. **Use the `xslt-example` skill** — Generates complete example objects:
   - Run the skill with: "Create a new XSLT example for XPath filtering"
   - Provide description, category, sample XML, and expected output
   - Skill outputs a ready-to-paste JavaScript object

2. **Or add manually** using the structure in [.github/instructions/examples-data.instructions.md](.github/instructions/examples-data.instructions.md):
   ```javascript
   exampleKey: {
     label: 'Display Name',
     icon: '🔄',
     desc: 'One-line description (max 60 chars)',
     cat: 'transform',  // Must be in CATEGORIES
     xml: `<?xml version="1.0" encoding="UTF-8"?>
   <Root>...</Root>`,
     xslt: `<?xml version="1.0" encoding="UTF-8"?>
   <xsl:stylesheet version="3.0" ...>
     <!-- XSLT content -->
   </xsl:stylesheet>`,
     xpathHints: ['//element', '//element[@attr]']  // Optional — appears below XPath input
   }
   ```

3. **Validate** — Run the `example-validator` skill:
   - Checks all 52 examples for metadata correctness, required fields, proper formatting
   - Reports any broken or incomplete examples

4. **Test** — Refresh browser and verify:
   - Example appears in the correct category sidebar button
   - Example loads correctly when clicked
   - XML input, XSLT, and output all render without errors
   - If XPath hints provided, chips appear below the expression bar

### Example Categories

- `transform` — Data transformation (green #3fb950)
- `aggregation` — Aggregation & splitting (amber #f5a524)
- `format` — Format conversion (purple #c084fc)
- `cpi` — SAP CPI patterns (blue #0070f2)
- `xpath` — XPath expressions (amber #f5a524)

---

## Testing Your Changes

### Browser Testing Checklist

**Before submitting a PR, verify:**

- [ ] **XSLT Mode** — Transform runs, output appears, no console errors
- [ ] **XPath Mode** — Toggle to XPath, expressions evaluate, nodes highlight in amber
- [ ] **Both modes** — Theme toggle works in both modes, decorations update correctly
- [ ] **Headers/Properties** — Add rows, run transform, values inject correctly as `xsl:param`
- [ ] **CPI simulation** — Test `cpi:setHeader`, `cpi:setProperty`, `cpi:getHeader`, `cpi:getProperty`
- [ ] **File operations** — Upload XML/XSLT, download output, drag-and-drop files
- [ ] **Examples** — Load 3+ examples from different categories, verify no errors
- [ ] **Console** — All features work: search, type filters, minimize, auto-restore on error
- [ ] **localStorage** — Refresh browser, verify state persists (XML, XSLT, Headers, Properties)
- [ ] **Performance** — Large XML (>1MB) and XSLT (>100KB) load without hanging
- [ ] **Keyboard shortcuts** — Ctrl+Enter (Run), Ctrl+B (toggle XPath), Ctrl+T (theme), etc.
- [ ] **Responsive** — Test on mobile (Safari), tablet (Chrome), desktop
- [ ] **Browser compatibility** — Test on Chrome, Firefox, Safari, Edge (latest versions)

### Debugging in Browser DevTools

**Opening DevTools**
- Windows/Linux: `F12` or `Ctrl+Shift+I`
- macOS: `Cmd+Option+I`

**What to check**
- **Console** — `clog()` messages appear correctly, no red errors
- **Storage → Application → localStorage** — Key `xdebugx-session-v1` persists your edits
- **Network** — Saxon-JS library (`lib/SaxonJS2.js`) loads from CDN; Monaco loads from CDN
- **Debugger** — Set breakpoints in your new functions to step through execution
- **Performance** — Watch for long transforms or XPath evaluations (use performance.now() timing)

### Testing with Example Payloads

XSLTDebugX includes 52 built-in examples. Test your changes with:
1. Simple transform (alphabetic ordering)
2. Aggregation example (grouping, counting)
3. Format conversion (XML → JSON)
4. CPI pattern (header/property injection)
5. XPath expression (filtering, positional predicates)

---

## Submitting a Pull Request

### Before Submitting

1. **Fork and clone** the repository
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/add-dark-mode-toggle
   # or
   git checkout -b fix/xpath-highlights-stale
   ```
3. **Make your changes** and test thoroughly (see Testing Checklist above)
4. **Commit with clear messages**:
   ```bash
   git commit -m "Fix: XPath highlights now clear when switching to XSLT mode"
   git commit -m "Feat: Add localStorage persistence for column collapse state"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/add-dark-mode-toggle
   ```

### PR Description Template

When opening a PR on GitHub, use this template:

```markdown
## Description
Brief summary of the change (1-2 sentences).

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (change that breaks existing functionality)
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe how you tested this change:
- Tested XSLT mode with large transforms
- Verified XPath highlights update on theme switch
- Tested on Chrome and Firefox

## Checklist
- [ ] I have tested the change in a browser
- [ ] I have verified no console errors appear
- [ ] I have updated related documentation
- [ ] I have added a new example (if applicable)
- [ ] My code follows the code style guide
```

### PR Review Process

1. **GitHub Actions** runs basic lint checks (if configured)
2. **Maintainer reviews** code style, logic, and test coverage
3. **Feedback** provided on PR (may require changes)
4. **Approval** and merge to `main` branch
5. **Auto-deployment** to `xsltdebugx.pages.dev` via Cloudflare Pages

---

## Issue Reporting

Found a bug? Help us fix it!

### Bug Report Template

```markdown
## Description
What did you try to do? What happened instead?

## Steps to Reproduce
1. Open XSLTDebugX
2. Load the "Data Transformation" example
3. Click "Run XSLT"
4. Expected: Output appears in 100ms
5. Actual: Console shows "Saxon error: undefined variable..."

## Environment
- **Browser**: Chrome 120 (Windows 10)
- **OS**: Windows 10
- **Version**: As of 2026-03-27

## Affected Code
If you know which file/function, mention it:
- File: `js/xpath.js`
- Function: `_highlightXPath()`

## Additional Context
Attach screenshots, XSLT snippets, or XML samples if relevant.
```

---

## Maintenance Guidelines

### Release Hygiene

Before releasing a new version:

1. **Bump version** in `README.md`
2. **Update CHANGELOG.md** with all changes
3. **Run example validator** — ensure all 52 examples pass checks
4. **Test all examples** — click through each category, verify no errors
5. **Create GitHub release** with version tag and changelog entry
6. **Verify deployment** — Cloudflare Pages auto-deploys on push; check site is live

### Updating Dependencies

- **Saxon-JS** — Only update if a critical security fix or feature is available. Test all XPath and XSLT examples after updating.
- **Monaco Editor** — Check release notes for breaking changes. Update in `index.html` CDN link.
- **Cloudflare Workers** — Update `wrangler.jsonc` version, test deployment.

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License). See [LICENSE](LICENSE) for details.

---

## Questions?

- **Documentation**: See [README.md](README.md) for user features and [.github/instructions/](../instructions/) for developer API reference
- **Discussions**: Open a GitHub Discussion to ask questions
- **Issues**: Use GitHub Issues for bugs and feature requests

Thank you for contributing to XSLTDebugX! 🙏
