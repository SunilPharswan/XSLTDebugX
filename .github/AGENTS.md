# Custom Agents & Skills Reference

XSLTDebugX includes built-in skills and prompts for managing XSLT examples and documentation.

## Available Skills

Skills are specialized tools for specific workflows. Each skill contains detailed instructions and validation logic.

### example-validator

**Purpose**: Audit all XSLT and XPath examples for metadata correctness, structure, and completeness.

**When to Use**:
- Before releasing a new version (validate all 52 examples)
- After adding or editing examples in `js/examples-data.js`
- When a reported example fails to run
- To maintain library quality

**What It Does**:
- Reads `js/examples-data.js` file
- Runs 12-point validation checklist (M1–M12) on each example:
  - Key format (camelCase)
  - Required fields present (label, icon, desc, cat, xml, xslt)
  - Label max 50 chars
  - Icon is single emoji
  - Description max 60 chars
  - Category exists in CATEGORIES
  - XML valid and well-formed
  - XSLT valid and well-formed
  - Headers/properties array format (optional)
  - XPath examples have `xpathExpr` and `xpathHints`
  - Icon consistency across types
  - No orphaned categories

**Output**: Detailed report with:
- Total examples checked
- Passed/failed count
- List of failures with line numbers and descriptions
- Optional auto-fix for common issues

**Location**: `.github/skills/example-validator/SKILL.md`

---

### xslt-example

**Purpose**: Create new XSLT or XPath examples for the library with correct metadata and format.

**When to Use**:
- Adding a new transformation example
- Creating an XPath expression example
- Demonstrating SAP CPI patterns
- Building educational examples

**What It Does**:
- Interviews you for: description, category, XML input, expected output
- Generates a complete JavaScript object ready to paste
- Includes proper metadata (label, icon, description)
- Validates format matches requirements
- Provides optional headers/properties/hints

**Output**: A complete example entry like:
```javascript
myExample: {
  label: 'Example Name',
  icon: '🔄',
  desc: 'One-line description (max 60 chars)',
  cat: 'transform',
  xml: '<?xml version="1.0"?>...',
  xslt: '<?xml version="1.0"?>...',
  headers: [['X-Header', 'value']],  // optional
  properties: [['Prop', 'value']],   // optional
}
```

**Location**: `.github/skills/xslt-example/SKILL.md`

---

## Available Prompts

Prompts are interactive workflows for specific tasks.

### add-xslt-example

**Purpose**: Interactive prompt to generate a complete example entry (similar to xslt-example skill, but optimized for chat-based interaction).

**When to Use**:
- If you prefer guided step-by-step interaction
- Adding a single example quickly
- Learning the example format

**Workflow**:
1. Run the prompt
2. Answer questions about your example
3. Receive complete JavaScript object
4. Paste into `js/examples-data.js`
5. Run example-validator to check

**Location**: `.github/prompts/add-xslt-example.prompt.md`

---

### validate-examples

**Purpose**: Full audit of all examples with error/warning report and optional auto-fix (similar to example-validator skill, but with more reporting options).

**When to Use**:
- Before release — full library audit
- After bulk changes to examples
- Identifying all quality issues at once
- Getting a comprehensive report

**Output**:
- Full validation checklist results
- Categorized failures (critical/warnings)
- Summary statistics
- Auto-fix recommendations

**Location**: `.github/prompts/validate-examples.prompt.md`

---

## Potential Future Agents

The `.github/agents/` folder is currently empty. Future agent modes could include:

| Agent Name | Purpose | Use Case |
|---|---|---|
| `add-cpi-pattern` | Interactive workflow for creating CPI-specific examples | Adding new Integration Flow patterns |
| `debug-transform` | Step-through debugging for XSLT transforms | Troubleshooting failing transforms |
| `validate-xpath` | Validate and test XPath expressions | Ensuring XPath correctness |
| `generate-docs` | Auto-generate module documentation | Keeping API reference up to date |
| `audit-codebase` | Check code style and naming conventions | Maintain consistency |
| `release-checklist` | Interactive release workflow | Preparing for production deployment |

To create a custom agent:
1. Create a new folder in `.github/agents/`
2. Add `<agent_name>.agent.md` or `<agent_name>.skill.md`
3. Define custom instructions and workflow
4. Reference in this file

---

## How to Invoke Skills/Prompts

### In Copilot Chat

**Using a Skill**:
```
Use the example-validator skill to check all examples
```

**Using a Prompt**:
```
Run the add-xslt-example prompt to create a new example
```

**Inline Request**:
```
Create a new XSLT example that demonstrates grouping
```

### In VS Code

- Open Copilot Chat (`Ctrl+Shift+I` or `View → AI Chat`)
- Type your request
- Copilot detects and uses relevant skills/prompts automatically

---

## Workflow Examples

### Adding a New Example

**Option 1: Quick (Skill)**
1. Run `xslt-example` skill
2. Answer questions
3. Paste result into `js/examples-data.js`

**Option 2: Interactive (Prompt)**
1. Run `add-xslt-example` prompt
2. Follow step-by-step guidance
3. Get complete entry

**Option 3: Manual**
1. Read `.github/instructions/examples-data.instructions.md`
2. Create example object directly
3. Validate with `example-validator` skill

### Before Release

1. Update version in `README.md`
2. Update `CHANGELOG.md`
3. Run `example-validator` skill → review report
4. Fix any critical issues
5. Commit and push (Cloudflare Pages auto-deploys)

### Audit Quality

1. Run `example-validator` skill
2. Review failures and warnings
3. Ask skill to auto-fix minor issues
4. Manually review critical issues
5. Re-run validator to confirm fixes

---

## Customizing Skills/Prompts

Skills and prompts are defined in markdown files with YAML frontmatter:

```yaml
---
name: my-agent
description: "What this agent does"
argument-hint: "What the user should provide"
---

# Instructions

1. Do step 1
2. Do step 2
...
```

To modify:
1. Edit the `.md` file in `.github/agents/`, `.github/skills/`, or `.github/prompts/`
2. Update YAML frontmatter if needed
3. Update instructions and workflow
4. Reference the updated agent in this file

---

## Support & Troubleshooting

### Skill not found

- Check the file exists in correct folder: `.github/skills/<name>/SKILL.md`
- Verify filename and folder structure
- Reload Copilot Chat (`Ctrl+F5`)

### Prompt not applying

- Ensure prompt file is in `.github/prompts/` folder
- Check YAML frontmatter syntax (requires `---`)
- Verify `.md` file extension, not `.txt` or `.markdown`

### Agent customization questions

- See [agent-customization skill](../../../copilot-skill:/agent-customization/) for detailed help
- Read `.github/copilot-instructions.md` for workspace guidelines

---

## Related Documentation

- **Example Library Guide**: `.github/instructions/examples-data.instructions.md`
- **Code Style**: `CONTRIBUTING.md`
- **Development Setup**: `.github/DEVELOPMENT.md`
- **Architecture**: `ARCHITECTURE.md`
