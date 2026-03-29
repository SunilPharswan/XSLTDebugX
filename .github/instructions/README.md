# Instruction Files Reference

This folder contains detailed technical documentation for XSLTDebugX developers. Each file covers a specific domain.

## Quick Navigation

| File | Purpose | When to Use |
|------|---------|------------|
| **[features.instructions.md](features.instructions.md)** | Complete 200+ feature inventory and API reference | Implementing new features, checking if functionality exists, understanding existing code, debugging feature interactions |
| **[examples-data.instructions.md](examples-data.instructions.md)** | Example library structure, categories, validation rules, example format | Adding new examples, modifying categories, validating example metadata || **[testing.instructions.md](testing.instructions.md)** | E2E testing architecture, Playwright patterns, timing, fixtures, async patterns | Writing tests, debugging test failures, understanding timing strategies || **[transform.instructions.md](transform.instructions.md)** | CPI simulation, XSLT rewriting, error line mapping, param injection | Modifying transform.js, debugging CPI simulation, fixing namespace issues, updating interceptor functions |

## How to Use

### For Feature Implementation

1. **Check if feature exists** → Read `features.instructions.md` feature catalog
2. **Find related functions** → Search for line numbers and function names
3. **Understand patterns** → See code style and design pattern examples
4. **Implement carefully** → Follow existing conventions

**Example**: "How do I add a new console message type?"
- Search `features.instructions.md` for "Console" section
- Find `clog()` function reference → `state.js:XX`
- Check current message types (info, success, warn, error)
- Add new type following same pattern

### For Example Library Work

1. **Understand structure** → Read `examples-data.instructions.md`
2. **Check validation rules** → Learn all 12 validation checks (M1–M12)
3. **View example format** → See required and optional fields
4. **Create or modify** → Use [xslt-example skill](../skills/xslt-example/) or create manually
5. **Validate** → Use [example-validator skill](../skills/example-validator/)

**Example**: "I want to add a new CPI pattern example"
- Read `examples-data.instructions.md` → CATEGORIES and EXAMPLES section
- Note: category `cpi` exists, accent color is `#0070f2`
- Use `xslt-example` skill to generate complete entry
- Run `example-validator` skill to check for errors

### For CPI Simulation Bugs

1. **Understand rewriting** → Read `transform.instructions.md` CPI simulation section
2. **Check error mapping** → Learn how Saxon line numbers are mapped back to original XSLT
3. **Debug interceptors** → See how `cpi:setHeader`, `cpi:getHeader`, etc. work
4. **Test patterns** → See included CPI example patterns

**Example**: "Why aren't CPI headers being captured?"
- Check `transform.instructions.md` for `rewriteCPICalls()` function
- Verify `xmlns:cpi` → `xmlns:js` namespace rewriting works
- Check interceptor functions (`window.cpiSetHeader`, etc.)
- Look at "CPI Headers & Properties (Complete)" example for reference

## File Locations

```
.github/
├── instructions/
│   ├── README.md (← you are here)
│   ├── features.instructions.md
│   ├── examples-data.instructions.md
│   └── transform.instructions.md
├── skills/
│   ├── example-validator/SKILL.md
│   └── xslt-example/SKILL.md
├── prompts/
│   ├── add-xslt-example.prompt.md
│   └── validate-examples.prompt.md
└── copilot-instructions.md (← workspace guidelines)
```

## Related Documentation

- **[CONTRIBUTING.md](../../CONTRIBUTING.md)** — Code style, PR guidelines, development setup
- **[ARCHITECTURE.md](../docs/ARCHITECTURE.md)** — Module structure, data flow, design patterns
- **[DEVELOPMENT.md](DEVELOPMENT.md)** — Local dev workflow, debugging, performance tips
- **[README.md](../../README.md)** — User-facing features, getting started, keyboard shortcuts

## Skill-Based Workflows

### Adding a New Example

1. Open **[xslt-example skill](../skills/xslt-example/SKILL.md)**
2. Follow the skill to generate a complete example entry
3. Optionally use **[add-xslt-example prompt](../prompts/add-xslt-example.prompt.md)** for interactive generation
4. Paste the result into `js/examples-data.js`, in the `EXAMPLES` object
5. Run **[example-validator skill](../skills/example-validator/SKILL.md)** to check for errors

### Validating Examples

1. Run **[example-validator skill](../skills/example-validator/SKILL.md)**
2. Choose scope: single category, or "all"
3. Validator runs 12-point checks (M1–M12) on all examples
4. Review error/warning report
5. Auto-fix option available for common issues

### Modifying Instruction Files

If you find outdated or incorrect information in any instruction file:
1. Make your edits directly
2. Cross-reference line numbers with actual code
3. Verify against CONTRIBUTING.md code style guide
4. Commit with message: "Docs: Update X in <file>"

## First Steps

**If you're new:**
1. Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for code style
2. Read [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for module overview
3. Glance at `features.instructions.md` for architecture patterns
4. Check out **[DEVELOPMENT.md](../docs/DEVELOPMENT.md)** for local setup

**If you're adding a feature:**
1. Search `features.instructions.md` for related functions
2. Check line numbers and existing code
3. Follow the code style guide in CONTRIBUTING.md
4. Test locally with DEVELOPMENT.md guidance

**If you're adding an example:**
1. Use `xslt-example` skill to generate
2. Reference `examples-data.instructions.md` for format
3. Validate with `example-validator` skill
4. Update CHANGELOG.md

## Support

- **Questions about a feature?** → Search `features.instructions.md`
- **Example validation failing?** → Check `examples-data.instructions.md` M1–M12 checklist
- **CPI simulation not working?** → Read `transform.instructions.md`
- **How to set up locally?** → See `DEVELOPMENT.md`
- **PR guidelines?** → See `CONTRIBUTING.md`

Still confused? Open a GitHub issue with your question!
