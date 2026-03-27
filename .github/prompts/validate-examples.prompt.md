---
description: "Audit all XSLT and XPath examples in js/examples-data.js for metadata, structure, and correctness issues. Produces a grouped error/warning report with fix suggestions."
argument-hint: "Optional: category to focus on (transform, aggregation, format, cpi, xpath) or leave blank for all"
---

Run a full validation audit of [js/examples-data.js](../js/examples-data.js) using the `example-validator` skill.

## Scope

- If an argument was provided, restrict checks to examples where `cat` matches it
- Otherwise audit **all** examples in `EXAMPLES`

## Steps

1. Load the `example-validator` skill and follow its procedure exactly
2. Read `js/examples-data.js` in full
3. Run all checks M1–M12 against every in-scope example
4. Output the report using the format defined in the skill (🔴 Errors → 🟡 Warnings → 🟢 Summary)
5. After the report, ask: **"Would you like me to apply the fixes?"**
   - If yes → fix only the flagged issues in `js/examples-data.js`, nothing else
   - If no → stop

## Constraints

- Do not auto-fix without confirmation
- Do not reformat or restructure examples that have no issues
- Do not change example content (XML/XSLT bodies) unless the issue is a structural error (e.g., wrong `version` attribute)
