# Testing All XSLT & XPath Examples

> Quick guide to running comprehensive example tests across all 47 XSLT and XPath examples in the XSLTDebugX library.

## Overview

**New Test File:** `tests/e2e/workflows/examples-comprehensive.spec.js`

This test suite provides comprehensive coverage of all 47 examples in the XSLTDebugX library:

### Coverage Breakdown

| Category | Type | Count | Tests |
|----------|------|-------|-------|
| Transform | XSLT | 8 | 3 per example |
| Aggregation & Splitting | XSLT | 3 | 3 per example |
| Format Conversion | XSLT | 6 | 3 per example |
| SAP CPI Patterns | XSLT | 14 | 3 per example |
| **XSLT Subtotal** | | **31** | **93 tests** |
| XPath Explorer | XPath | 16 | 3 per example |
| **XPath Subtotal** | | **16** | **48 tests** |
| Mode Switching | Mixed | - | **3 tests** |
| Edge Cases | Special | - | **3 tests** |
| **TOTAL** | | **47 examples** | **~150 tests** |

## Running the Tests

### All Tests
```bash
npm test
```

### Just the Comprehensive Examples Suite
```bash
npx playwright test tests/e2e/workflows/examples-comprehensive.spec.js
```

### Specific Category
```bash
# Test only Transform examples
npx playwright test -g "TRANSFORM"

# Test only XPath examples
npx playwright test -g "XPATH"

# Test only CPI examples
npx playwright test -g "CPI"
```

### Specific Example
```bash
# Test a single example
npx playwright test -g "identityTransform"
```

### Interactive Mode (UI)
```bash
npx playwright test tests/e2e/workflows/examples-comprehensive.spec.js --ui
```

### With Browser Visible
```bash
npx playwright test tests/e2e/workflows/examples-comprehensive.spec.js --headed
```

### Debug Mode
```bash
PWDEBUG=1 npx playwright test tests/e2e/workflows/examples-comprehensive.spec.js
```

---

## What Each Test Checks

### XSLT Examples (Transform, Aggregation, Format, CPI)

#### 1. **Load & Verify Test**
- ✅ Example loads without errors
- ✅ Mode is correctly set to XSLT
- ✅ XML input is populated and well-formed
- ✅ XSLT is populated with required elements:
  - `xsl:stylesheet` with `version="3.0"`
  - `xsl:template` tag
- ✅ No console errors during load

#### 2. **Run Transform Test**
- ✅ Transform executes successfully (no timeout)
- ✅ Output is generated (non-empty)
- ✅ No runtime errors in console
- ✅ Execution completes cleanly

#### 3. **Output Format Validation Test**
- ✅ Output is not empty
- ✅ Output has valid format (XML, JSON, or text)
- ✅ Output starts with expected character (`<`, `{`, or `[`)

### XPath Examples (XPath Explorer)

#### 1. **Load & Mode Switch Test**
- ✅ Example loads without errors
- ✅ Mode automatically switches to XPath
- ✅ XML input is populated and well-formed
- ✅ No console errors during load

#### 2. **Evaluate Expression Test**
- ✅ XPath evaluation executes successfully
- ✅ Expression evaluation completes without timeout
- ✅ No runtime errors in console
- ✅ Evaluation completes cleanly

#### 3. **Verify Expression Content Test**
- ✅ XPath expression is populated
- ✅ Expression is not empty
- ✅ Expression looks valid (contains XPath syntax):
  - Forward slashes (`/`)
  - Predicates (`[...]`)
  - Function calls (`(...)`)
  - Namespace prefixes (`:`)

### Mode Switching Tests

- ✅ XSLT → XPath transition works
- ✅ XPath → XSLT transition works
- ✅ Same-type example loading preserves mode

### Edge Cases

- ✅ Rapid example switching (stress test)
- ✅ Session preservation across example loads
- ✅ Examples work correctly in both light and dark themes

---

## Test Output Example

When you run the tests, you'll see output like:

```
✓ [TRANSFORM] identityTransform - Load & Verify (2.5s)
✓ [TRANSFORM] identityTransform - Run Transform (3.2s)
✓ [TRANSFORM] identityTransform - Output Format Validation (3.1s)
✓ [TRANSFORM] renameElements - Load & Verify (2.4s)
✓ [TRANSFORM] renameElements - Run Transform (2.8s)
...
✓ [CPI] cpiGetSet - Load & Verify (2.6s)
...
✓ [XPATH] xpathNavigation - Load & Mode Switch (2.5s)
✓ [XPATH] xpathNavigation - Evaluate Expression (3.2s)
✓ [XPATH] xpathNavigation - Verify Expression Content (2.4s)
...
✓ should have comprehensive coverage (report only) (15ms)

150 passed (2.5m)
```

---

## Interpreting Test Results

### ✅ All Tests Pass
Your examples library is healthy and ready for:
- Merging to main branch
- Releasing to users
- Distributing documentation

### ❌ Some Tests Fail
Check the failure message to understand the issue:

**Example:** `[TRANSFORM] myExample - Run Transform`
```
Error: Timeout waiting for output
```
→ Check that the XSLT in `myExample` doesn't have infinite loops

**Example:** `[XPATH] xpathCustom - Evaluate Expression`
```
Error: 0 === 0 (runtimeErrors.length must be 0)
```
→ Check that the XPath expression is syntactically valid

### Run a Single Failing Test
```bash
npx playwright test -g "exampleName" --headed
```

Check the browser to see what went wrong.

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build  # If needed
      - run: npm test       # Runs all tests including comprehensive examples
```

Before merging a PR that modifies examples, all comprehensive tests must pass.

---

## Related Documentation

- [Features Reference](../instructions/features.instructions.md) — Full API for testing
- [Testing Guide](./TESTING.md) — Setup, patterns, and best practices
- [Examples Library Guidelines](../instructions/examples-data.instructions.md) — How to add/modify examples
- [Example Validator Skill](../skills/example-validator/SKILL.md) — Automated example quality audit

---

## FAQ

### Q: How many tests are there?
**A:** ~150 tests across all examples. Each XSLT and XPath example generates 3 tests, plus mode switching and edge case tests.

### Q: How long do tests take to run?
**A:** ~2-3 minutes for the full comprehensive suite on a modern machine.

### Q: Can I test just one category?
**A:** Yes! Use grep to filter:
```bash
npx playwright test -g "CPI"        # CPI examples only
npx playwright test -g "XPATH"      # XPath examples only
npx playwright test -g "TRANSFORM"  # Transform examples only
```

### Q: What if a test is flaky (intermittent failures)?
**A:** The test suite was designed to minimize flakiness with:
- Generous timeouts (2-3 seconds per operation)
- Debounce waits matching application timing
- Modal animation waits

If you see flaky tests:
1. Run just that test with `--headed` to see what's happening
2. Check console for timing issues
3. Report in GitHub Issues

### Q: How do I add a new example to test?
**A:** Just add the example key to `EXAMPLE_KEYS` and `EXAMPLE_CATEGORIES` arrays at the top of `examples-comprehensive.spec.js`. Tests auto-generate from the metadata.

### Q: Can I skip slow examples?
**A:** Use `test.skip()` or `test.fixme()`:
```javascript
test.skip(`[TRANSFORM] slowExample - Run Transform`, ...);
```

---

## Maintenance

### When to Run Comprehensive Tests
- ✅ Before merging PRs to `main`
- ✅ Before cutting a release
- ✅ After adding new examples
- ✅ After modifying existing examples
- ✅ On every CI/CD push (recommended)

### Updating the Test Suite
If you add a new example to `examples-data.js`:

1. Add the example key to the `EXAMPLE_KEYS` array
2. Add category mapping to `EXAMPLE_CATEGORIES` object
3. Re-run tests — they'll auto-generate for the new example

No other changes needed! The parametrized test structure handles it.

---

**Last Updated:** March 2026
**Test File:** `tests/e2e/workflows/examples-comprehensive.spec.js`
**Framework:** Playwright 1.40+
