# Commit & Pull Request Guidelines

This guide covers how to format commits, write PR descriptions, and go through the review process for XSLTDebugX.

---

## Commit Message Format

Use **conventional commits** for clarity and consistency.

### Structure

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat** — New feature
- **fix** — Bug fix
- **docs** — Documentation only
- **refactor** — Code refactoring (no feature change)
- **perf** — Performance improvement
- **test** — Test additions or modifications
- **ci** — CI/CD configuration
- **chore** — Dependency updates, tooling

### Scope

Area of code affected:
- **transform** — XSLT execution, CPI rewriting
- **xpath** — XPath mode, evaluation
- **editor** — Monaco editor, themes
- **validate** — Validation (XML/XSLT)
- **examples** — Example library, examples-data.js
- **ui** — UI components, buttons, layout
- **docs** — Documentation files
- **tests** — E2E tests

### Subject

- Imperative mood: "add" not "added", "fix" not "fixed"
- No period at end
- Limit to 50 characters
- Describe what, not why (why goes in body)

### Body

- Explain *why*, not what (code already shows what)
- Wrap at 72 characters
- Separate from subject with blank line
- Use bullet points for multiple changes

### Footer

- Use `Fixes #123` for bug fixes (closes GitHub issue)
- Use `Refs #123` for related issues
- Link to PRs if relevant

### Examples

**Good:**
```
feat(transform): Add CPI property simulation

- Rewrite cpi:setProperty calls to js:_cpiSetProperty
- Build property params from Properties panel
- Show output properties after transform

Fixes #89
```

```
fix(xpath): Handle empty nodeset results

Previous code assumed results array always present.
Now checks for empty array before rendering hints.
Prevents "Cannot read property length" error when
XPath returns no matching nodes.

Refs #123
```

```
docs(readme): Update keyboard shortcut table

Added Ctrl+Shift+X for XSLT↔XPath mode toggle.
Clarified that Enter works in XPath mode but not XSLT.

Fixes #105
```

**Bad:**
```
Updated stuff          # Bad: vague, no type
feat: fixed the thing  # Bad: wrong mood, vague scope
Add new feature        # Bad: no type/scope prefix
fix: fix bug fix       # Bad: repetitive, unclear what bug
Merge branch 'dev'     # Bad: auto-generated, not meaningful
```

---

## Pull Request Process

### Before You Start

1. **Check if work already exists:**
   - Search [GitHub Issues](https://github.com/SunilPharswan/XSLTDebugX/issues)
   - Check [features.instructions.md](../../instructions/features.instructions.md) for existing features
   - Avoid duplicate work

2. **Open an issue for significant features:**
   - Describe the feature
   - Explain the approach
   - Get feedback before writing code
   - Small bug fixes can skip this step

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   # or for bug fixes:
   git checkout -b fix/bug-description
   ```

2. **Follow code style:**
   - See [CONTRIBUTORS/CODE_STYLE.md](./CODE_STYLE.md)
   - No `var`, use `let`/`const`
   - Prefix private functions with `_`
   - Descriptive names
   - Comments explain "why", not "what"

3. **Test locally:**
   ```bash
   npx serve .
   # Test in browser at http://localhost:3000
   # F12 → Console: Any errors?
   
   npm run test:e2e
   # All tests pass?
   ```

4. **Test cross-browser:**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (if Mac available)
   - Edge (latest)

5. **Commit with clear messages:**
   ```bash
   git add .
   git commit -m "feat(transform): Add CPI property simulation"
   
   # Or for multi-part commits:
   git commit -m "feat(transform): Add CPI property simulation
   
   - Rewrite cpi:setProperty calls
   - Add Property panel to UI
   - Show output properties
   
   Fixes #89"
   ```

### Submitting the PR

1. **Push your branch:**
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create PR on GitHub:**
   - Use the PR template (if available)
   - Clear, descriptive title
   - Link related issues with `Fixes #123`

### PR Description

**Format:**

```markdown
## Description
Brief explanation of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Testing
What manual testing did you do?
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] E2E tests pass
- [ ] No console errors

## Related Issues
Fixes #123
Refs #456
```

**Example:**
```markdown
## Description
Adds XPath evaluation hints to improve user experience when learning XPath.
Shows 3 progressive examples (simple → complex) below the input bar.

## Changes
- Parse XPath expression to suggest common patterns
- Display clickable hint chips below input
- Persist hint history in localStorage
- Add hint styling to match theme (light/dark)

## Testing
- [x] Tested in Chrome, Firefox, Safari
- [x] npm run test:e2e passes (all 8 test files)
- [x] F12 console shows no errors
- [x] Hints persist across session refresh
- [x] Theme toggle works with hints

Fixes #198
```

### During Review

**Expect feedback on:**
- Code style (naming, comments, organization)
- Performance (debouncing, memory leaks)
- Compatibility (cross-browser, localStorage)
- Testing (E2E tests, manual verification)
- Documentation (comments, README updates if needed)

**Responding to feedback:**
1. Thank the reviewer 👏
2. Make requested changes
3. Commit with clear message: `refactor: Address review feedback on PR #123`
4. Push changes
5. Reply to comment when done

**Don't:**
- Take feedback personally (it's about code quality, not you)
- Dismiss feedback without discussion
- Make major scope changes without reopening discussion

### Merging

- Requires **at least 1 approval** from maintainers
- All tests must pass (CI checks)
- No unresolved conversations
- Squash or rebase before merge (maintainers will handle)

---

## Common Review Scenarios

### Scenario: "CI Tests Failing"

**Action:**
1. Check [GitHub Actions](https://github.com/SunilPharswan/XSLTDebugX/actions) tab
2. View error logs
3. Run locally: `npm run test:e2e`
4. Fix the failing test
5. Commit and push

**Example:**
```bash
npm run test:e2e -- tests/e2e/workflows/examples-comprehensive.spec.js
# See which test fails, why
# Fix code or test
git commit -m "fix: Handle empty XPath results in evaluation"
git push origin fix/empty-xpath-results
```

### Scenario: "Please Update Dependencies"

**Action:**
```bash
npm install
npm audit
npm audit fix  # If safe
npm run test:e2e  # Verify no breaks
git commit -m "chore: Update dependencies"
git push
```

### Scenario: "Needs Documentation Update"

**Action:**
1. Update relevant docs:
   - [README.md](../../README.md) — User-facing features
   - [USERS/README.md](./README.md) — User workflows
   - [features.instructions.md](../../instructions/features.instructions.md) — API reference
   - [examples-data.instructions.md](../../instructions/examples-data.instructions.md) — Example format

2. Link doc updates in PR description
3. Commit: `docs: Update keyboard shortcuts for new mode toggle`

### Scenario: "Needs Tests"

**Action:**
1. See [DEVELOPERS/SETUP.md](../DEVELOPERS/SETUP.md#testing) for test patterns
2. Add test to appropriate file in `tests/e2e/workflows/`
3. Run: `npm run test:e2e -- tests/e2e/workflows/your-test.spec.js`
4. Commit: `test: Add test for CPI property simulation`

---

## Best Practices

### ✅ Do:
- Write small, focused PRs (easier to review)
- Make commits atomic (each commit is one logical change)
- Link related issues with `Fixes #123`
- Test thoroughly before submitting
- Respond to feedback promptly and professionally
- Ask questions if feedback is unclear
- Thank reviewers for their time

### ❌ Don't:
- Submit huge PRs (>500 lines of changes, hard to review)
- Mix refactoring with feature changes (separate PRs)
- Ignore failing CI tests
- Push force-protected branches
- Be defensive about feedback
- Merge your own PRs (let maintainers do it)
- Leave PRs stale (respond to feedback within a week)

---

## Draft PRs

If you're still working on a PR, mark it as **Draft**:

1. Click **"Still in progress?"** when creating PR
2. Or convert: **"Convert to draft"** after creation

**Why:** Prevents accidental merges, signals "feedback welcome but not ready"

---

## Questions?

- **"What scope should I use?"** → See "Scope" section above
- **"How do I link an issue?"** → Use `Fixes #123` in commit/PR description
- **"Can I commit to main?"** → No, use feature branches, submit PR
- **"Can I rewrite history?"** → Only on your own branch before PR merge
- **"Still unsure?"** → Open a discussion issue or ask in PR

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub PR Docs](https://docs.github.com/en/pull-requests)
- [Code of Conduct](../../CONTRIBUTING.md#code-of-conduct)
- [Code Style Guide](./CODE_STYLE.md)

Good luck with your contribution! 🚀
