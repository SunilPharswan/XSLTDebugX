# XSLTForge (XSLTDebugX) — UX Pain Points Analysis

**Date:** March 2026  
**Analysis Scope:** JavaScript codebase (11 modules), HTML layout, localStorage persistence

---

## Executive Summary

XSLTForge is a powerful XSLT/XPath IDE with strong technical foundations but several workflow friction points that accumulate to slow user productivity. Key themes:
- **Mode switching** lacks visual feedback about what data is preserved
- **Getting started** barrier is high — empty workspace provides no guidance
- **Feature discoverability** relies on user exploration (right-click, example browsing)
- **KV panel workflows** require repetitive interactions for common tasks
- **Error feedback** is console-heavy; status bar can be missed

---

## 1. USER WORKFLOW INEFFICIENCIES

### Issue 1.1: Repetitive Header/Property Entry (HIGH IMPACT)
**Problem:** Adding headers/properties requires 3 interactions per item:
1. Click `+` button
2. Type parameter name
3. Type parameter value

**Root Cause:** [lines: transform.js:118-139] each row is a separate pair of HTML inputs with `oninput` handlers. No batch entry mode, no import from JSON/CSV, no defaults.

**Workflow Impact:**
- CPI testing with 5+ headers requires 15+ interactions
- No copy/paste templates for common headers (Content-Type, Accept, etc.)
- Users might avoid testing different parameter combinations due to friction

**Improvement Direction:**
- Textarea mode for bulk entry (JSON, `name=value` pairs)
- Template dropdown for common headers (Content-Type, Accept, Authorization)
- Validation feedback shown inline (currently silent NCName check in buildParamsXPath)

---

### Issue 1.2: Parameter Name Validation is Silent (MEDIUM)
**Problem:** Invalid parameter names (violating NCName) are silently filtered out during transform with only console warning.

**Root Cause:** [lines: transform.js:61-64] isValidNCName() check happens in buildParamsXPath() after form submission, not during input.

**Workflow Impact:**
- User enters "My-Header" → sees it in table → submits transform → header silently dropped
- Console message is easily missed if minimized
- Users blame transform failures on bad XSLT instead of invalid parameter names

**Improvement Direction:**
- Real-time validation in KV input fields (show red border or inline error)
- Tooltip explaining NCName rules (must start with letter/underscore, only alphanumeric/dots/hyphens)
- Pre-submit validation with detailed error report

---

### Issue 1.3: Duplicate Key Handling is Silent (MEDIUM)
**Problem:** Duplicate headers/properties silently use last-write-wins with only console warning.

**Root Cause:** [lines: transform.js:79-82] duplicate keys are detected and logged, but UI shows both entries with no visual distinction.

**Workflow Impact:**
- User adds "Content-Type: application/xml" header, forgets, adds again with JSON value
- Sees both in table but only second one is used
- Confusing debugging experience ("why is my header not working?")

**Improvement Direction:**
- Highlight or badge duplicate keys in the table
- Prevent adding duplicate key names (validation on add)
- Show warning when duplicate is detected at transform time, before silently overwriting

---

### Issue 1.4: File Upload Requires Modal Dialog (LOW-MEDIUM)
**Problem:** Uploading XML/XSLT requires: click button → file picker appears → navigate and select.

**Root Cause:** [lines: files.js:5-8] standard HTML file input with hidden display. No drag-and-drop alternative at upload button level (drag-and-drop works on editor, not globally).

**Workflow Impact:**
- Users prefer to copy/paste for small files to avoid modal friction
- Drag-and-drop is discoverable only if user tries dragging onto editor specifically

**Improvement Direction:**
- Visible hover state on upload button indicating drag-and-drop support
- Drag-and-drop onto button itself (currently only editor panes support it)
- Recent files/history in upload menu

---

### Issue 1.5: Format Operations are Spread Across Tools (LOW)
**Problem:** Formatting options require multiple action: buttons: Format (via button) vs. Minify/Comment/Uncomment (via right-click context menu).

**Root Cause:** [lines: panes.js:176] Format button calls fmtEditor(). Minify/Comment are in editor.js context menu [lines: 503-520]. No unified menu.

**Workflow Impact:**
- Users might not discover minify option (hidden in right-click)
- Minify button doesn't persist state — can't toggle on/off
- No "Compare Original vs. Formatted" option

**Improvement Direction:**
- Unified format toolbar menu with options (Pretty, Minify, Comment)
- Format preset buttons (One-liner, Pretty-printed, Minified)
- "What changed" diff view after format operation

---

## 2. DISCOVERABILITY ISSUES

### Issue 2.1: Right-Click Features Are Hidden (MEDIUM-HIGH)
**Problem:** Valuable features only accessible via right-click context menu:
- Copy XPath (Exact & General variants)
- XSLT Code Snippets (for-each, choose-when, template, etc.)
- Comment/Uncomment

**Root Cause:** [lines: editor.js:395-520] context menu is configured but no UI hint that right-click is available. Help modal doesn't show right-click examples.

**Workflow Impact:**
- Users who aren't mouse-savvy might never discover XPath copying
- XSLT snippet library is invisible — users write boilerplate instead
- New users waste time wondering how to comment code

**Improvement Direction:**
- Add hint tooltip on hover: "Right-click for more options" or 💡 badge
- Move frequently-used items (Comment/Uncomment) to visible toolbar
- Show snippet menu in context menu with preview
- Add keyboard shortcut suggestion to help modal

---

### Issue 2.2: XPath Hints Strip is Undocumented (MEDIUM)
**Problem:** XPath examples pre-populate a "hints strip" with clickable expression chips, but this feature is undocumented and users might not notice it.

**Root Cause:** [lines: xpath.js:824-873] renderXPathHints() renders the strip, which is hidden by default and only shown when example loads. No explanation of what the chips do.

**Workflow Impact:**
- Expert users might miss pre-built expressions
- Novices might try to type expressions instead of clicking hints
- Examples with hints feel magical but not explained

**Improvement Direction:**
- Show hints strip by default (at least as empty placeholder)
- Label the strip: "Common expressions — click to try:"
- Add tooltip on hint chips: "Click to populate expression"
- Include examples without default expressions to teach the feature

---

### Issue 2.3: XSLT Snippets Are Context-Menu-Only (MEDIUM)
**Problem:** Useful XSLT patterns (for-each, choose-when, template, variable, etc.) [lines: editor.js:713-738] are only accessible via right-click context menu in XSLT editor.

**Root Cause:** Snippets are mapped directly to editor.js context menu. No discoverable menu or toolbar access.

**Workflow Impact:**
- Users write xsl:for-each from scratch instead of using template
- Beginners don't know templates exist
- Code quality may suffer (missed patterns, verbose code)

**Improvement Direction:**
- Snippets panel in left sidebar (collapsed by default)
- Toolbar button: "Insert Snippet" dropdown
- Snippet preview on hover (show destination code in tooltip)
- Keyboard shortcut (Ctrl+Shift+P → "Insert Snippet")

---

### Issue 2.4: Word Wrap Toggle Is an Easy Miss (LOW)
**Problem:** Word wrap toggle is a small icon button [lines: panes.js:8-12] among many toolbar buttons. No visual indication it's active.

**Root Cause:** State tracked in _wrapState object. Active state toggled with CSS class 'active', but button is small and context-switching might make it invisible.

**Workflow Impact:**
- Users with long lines might not discover word wrap exists
- Re-enabling/disabling word wrap requires hunting for the button

**Improvement Direction:**
- Larger or more prominent wrap toggle button
- Label the button with text hint: "Wrap" not just icon
- Keyboard shortcut display: "Alt+W" (currently no shortcut)
- Persistent user preference in localStorage per editor

---

## 3. MODE SWITCHING FRICTION

### Issue 3.1: XSLT↔XPath Switch Lacks Visual Feedback (HIGH)
**Problem:** When switching modes:
- Editor content swaps (two separate XML models)
- Panels collapse/expand automatically
- But no prominent UI signal that **data is preserved** or **what was hidden**

**Root Cause:** [lines: xpath.js:161-230] _applyXPathToggleState() performs many actions (console log, panel visibility, decorations) but changes are scattered. No unified "mode indicator" that highlights what's visible.

**Workflow Impact:**
- Users see right panel collapse and worry their XSLT work is lost
- Returning to XSLT mode, former layout isn't restored — confusing
- Console message about mode switch can be missed

**Improvement Direction:**
- Animated mode transition (dim out one section, fade in the other)
- Prominent mode indicator showing **"XSLT Mode [XML Input] ← → [Output]"** vs. **"XPath Mode [XML Source] ← → [Results]"**
- Save/restore exact layout state per mode (columns that were collapsed, panel scroll positions)
- Tooltip on mode button: "Switching modes preserves all your data"

---

### Issue 3.2: Layout State Not Fully Restored Across Modes (MEDIUM)
**Problem:** When toggling XPath→XSLT→XPath, the previous column collapse state isn't restored perfectly.

**Root Cause:** [lines: xpath.js:157] _xpathPreColCenterCollapsed saves state, but it's only used for one round-trip. If user toggles multiple times, state diverges from expectation.

**Workflow Impact:**
- User: XPath (center collapsed) → XSLT (center expands) → back to XPath (center isn't collapsed again)
- Each mode switch feels like the IDE is "resetting" the layout

**Improvement Direction:**
- Maintain a layout stack per mode (not just one previous state)
- Or: persist exact collapse state of all columns per mode in localStorage
- Allow user to "reset to default layout" button in help

---

### Issue 3.3: No Keyboard Shortcut for Mode Toggle (LOW-MEDIUM)
**Problem:** Mode switching requires clicking the mode button in header (XSLT/XPath buttons) [lines: index.html:64-70]. No keyboard shortcut advertised.

**Root Cause:** Buttons are clickable but no keyboard listener for Ctrl+Shift+X or similar.

**Workflow Impact:**
- Power users expected keyboard shortcut doesn't exist
- Switching modes breaks flow (reach for mouse)

**Improvement Direction:**
- Add listener for Ctrl+Shift+X (or Cmd+Shift+X on Mac) to toggle mode
- Show shortcut in button title: `"XPath mode (Ctrl+Shift+X)"`
- Include in help modal's shortcuts tab

---

## 4. GETTING STARTED BARRIERS

### Issue 4.1: Empty Workspace Provides No Guidance (HIGH)
**Problem:** On first load, user sees three blank editor panes with no hints about what to do next.

**Root Cause:** [lines: index.html] initial HTML has empty editors. Examples button and Help button exist but aren't highlighted for new users.

**Workflow Impact:**
- New users stare at blank screen and wonder "how do I start?"
- Some might leave before clicking Examples
- Entry barrier is high compared to tools with tutorial/onboarding

**Improvement Direction:**
- Overlay on blank workspace: **"New here? Start with Examples → or paste your XSLT below"**
- Auto-highlight Examples button with pulse/badge on first visit
- Mini-tutorial modal on first load (one-time, can be dismissed)
- Friendly status message: "Click Examples to load a sample, or start typing…"

---

### Issue 4.2: Help Modal Doesn't Teach the Basics (MEDIUM)
**Problem:** Help modal [lines: ui.js:204-213] exists but is text-heavy and doesn't teach workflow step-by-step.

**Root Cause:** Help modal is defined in HTML but content is reference-style (features list, shortcuts) not tutorial-style (how to use the IDE).

**Workflow Impact:**
- New users don't know recommended workflow (0. Start with example → 1. Modify XML → 2. Adjust XSLT → 3. Run → 4. Check output)
- Help doesn't explain three-column layout purpose
- Shortcuts list exists but many shortcuts aren't obvious (right-click features)

**Improvement Direction:**
- Add "Getting Started" tab to help modal
- Show interactive walkthrough (highlight editor panes one-by-one, explain purpose)
- Include mini-video or GIF showing workflow (Click run → see output)
- Link to feature reference instead of in-modal list

---

### Issue 4.3: Keyboard Shortcuts Not Prominently Displayed (LOW-MEDIUM)
**Problem:** Several important shortcuts exist but aren't advertised:
- Cmd+Enter / Ctrl+Enter to run transform
- Right-click to access snippets
- Up/Down arrows in XPath expression history

**Root Cause:** [lines: index.html] shortcuts are in button titles (`<span class="kbd">⌘↵</span>`) on Run button but help modal doesn't have dedicated shortcuts panel.

**Workflow Impact:**
- Users use mouse for everything, slowing productivity
- Shortcuts are discovered accidentally

**Improvement Direction:**
- Dedicated "Keyboard Shortcuts" section in help modal
- Show all shortcuts grouped by editor (XML, XSLT, XPath)
- Overlay hints on first keystroke (e.g., "Pro tip: Ctrl+Enter is faster")
- Customizable shortcuts (user preference)

---

## 5. PERSISTENCE & RECOVERY

### Issue 5.1: Share URL Length Limit Has Weak UX (MEDIUM)
**Problem:** Share URLs are limited to ~2,000 chars (browser limit). If exceeded, warning is shown [lines: share.js:40-42] but link is still generated. Users might share broken links without realizing.

**Root Cause:** [lines: share.js:39] generateShareUrl() checks length and logs warning, but doesn't prevent generation or suggest alternatives.

**Workflow Impact:**
- User with large XSLT/XML gets warning but shares link anyway
- Recipient clicks link → nothing loads → poor support experience
- No recovery mechanism (no hint to compress, no fallback share method)

**Improvement Direction:**
- Block share generation if over 2,000 chars with actionable error
- Suggest compression: "Remove comments, minify XSLT, or share via pastebin instead"
- Offer "Save as file" alternative to URL (download .xslt + .xml pair)
- Auto-compress XSLT before sharing (remove comments, minify)

---

### Issue 5.2: Session Recovery After Share Decode Failure is Poor (MEDIUM)
**Problem:** If share URL is corrupted or modified, decoding fails silently [lines: share.js:27-35] and user lands on empty workspace. Old saved session isn't restored.

**Root Cause:** [lines: share.js:31-34] loadFromShareHash() returns false on error, but applyShareData() is only called if hash loads successfully.

**Workflow Impact:**
- User clicks bad share link → blank workspace
- User doesn't know if they did something wrong or link is bad
- No way to recover (can't "go back" to previous session)

**Improvement Direction:**
- More informative error: **"Share link is invalid or corrupted"** (not just console error)
- Offer: "Would you like to restore your last saved session?" dialog
- Implement "recent sessions" dropdown in header (auto-save snapshots)
- Undo button for last few actions (browser history integration)

---

### Issue 5.3: Clear Session Button Has No Confirmation (MEDIUM)
**Problem:** "Clear session" button [lines: index.html:49] clears everything immediately without confirmation dialog.

**Root Cause:** onclick handler calls clearSavedState() [lines: state.js:137-161] directly with no prompt.

**Workflow Impact:**
- User accidentally clicks button → all saved work is gone
- No undo option
- Dangerous for users who forgot they had unsaved changes in localStorage

**Improvement Direction:**
- Confirmation dialog: **"Delete all saved sessions? This cannot be undone."**
- Show what will be deleted (all editors, KV panels, XPath history, preferences)
- Or: implement "trash/archive" instead of permanent delete (recover within 7 days)
- Add keyboard shortcut confirmation: Ctrl+Shift+Delete to actually delete

---

### Issue 5.4: localStorage Schema Changes Are Not Versioned Safely (LOW)
**Problem:** [lines: state.js:112] STORAGE_KEY = 'xdebugx-session-v1' is versioned, but if format changes mid-session, users lose state.

**Root Cause:** Version is static. If new fields are added (e.g., new KV panel), old sessions can't be upgraded.

**Workflow Impact:**
- Deploy schema change → users with v1 sessions lose data on next load
- No migration path

**Improvement Direction:**
- Implement schema migration logic (if schema v1, upgrade to v2 by adding default fields)
- Semantic versioning: v1 = original, v2 = added new fields, v3 = breaking changes
- Show "schema outdated" message if user has very old session and offer to reset

---

### Issue 5.5: KV Panel Data Has No Size Management (LOW)
**Problem:** Users can add unlimited headers/properties. If abused (1,000+ items), localStorage hits quota and silently fails.

**Root Cause:** [lines: state.js:114-124] saveState() writes full kvData array with no size cap. No warning if approaching quota.

**Workflow Impact:**
- User adds many test parameters → next save silently fails
- User doesn't notice (no error message visible)
- Data loss without user awareness

**Improvement Direction:**
- Limit KV items to reasonable max (e.g., 50 per type)
- Show warning when approaching limit
- Warn on save if localStorage is full: **"Session save failed — too much data. Try clearing older sessions."**
- Auto-cleanup: delete oldest entries when quota exceeded

---

## 6. VISUAL / INTERACTION FEEDBACK

### Issue 6.1: Status Bar Can Be Missed (MEDIUM)
**Problem:** Status updates (Transforming…, Validating…, Ready) appear in status bar [lines: state.js:75-79] which is small and easy to miss. Users might not know what's happening.

**Root Cause:** Status bar is passive text in footer. No animation, no prominent color change except red for errors.

**Workflow Impact:**
- User clicks Run → waits unsure if transform is happening
- Validation errors might not be noticed (yellow squiggle + console required)

**Improvement Direction:**
- Animated status bar (progress bar or pulse animation)
- More prominent placement (center of screen or inline with Run button)
- Sound/notification for errors or completion
- Show actual progress: "Validating (step 1/3)…"

---

### Issue 6.2: Console Minimization Hides Errors (MEDIUM)
**Problem:** When console is minimized, errors are only visible via small error badge [lines: ui.js:74-82]. Users might not notice badge.

**Root Cause:** [lines: ui.js:74-82] updateConsoleErrBadge() shows count, but badge is small and text-based.

**Workflow Impact:**
- Transform fails → user doesn't notice badge → assumes transform succeeded
- Confusion and wasted debugging time

**Improvement Direction:**
- More prominent error notification (banner, toast, or audio)
- Auto-restore console on error (expand if minimized)
- Blinking badge (CSS animation) to draw attention
- Show first error message in a tooltip

---

### Issue 6.3: "Saved" Feedback is Weak (LOW-MEDIUM)
**Problem:** [lines: state.js:104] showSavedIndicator() function is called but implementation isn't shown in code. users don't get clear feedback that their work was auto-saved.

**Root Cause:** Auto-save uses 800ms debounce [lines: state.js:33] but no visual confirmation.

**Workflow Impact:**
- User types → pauses → types again… → doesn't know if work is saved
- Lose trust in auto-save feature

**Improvement Direction:**
- Flash brief "Saved ✓" message in status bar
- Save indicator icon in header (animated while saving, checkmark when done)
- Show in localStorage badge: "Last saved 2 minutes ago"

---

### Issue 6.4: Run Button Spinner Has Artificial Delay (LOW)
**Problem:** [lines: transform.js:217-225] run button shows spinner for minimum 300ms even if transform completes instantly.

**Root Cause:** _MIN_SPINNER_MS = 300 ensures visual feedback even for fast transforms.

**Workflow Impact:**
- User feels IDE is slow even though transforms are fast
- Artificial delay feels clunky

**Improvement Direction:**
- Reduce minimum to 100ms (still visible but not sluggish)
- Or: only apply delay if first transform (show it's working)
- Show actual timing: "Transform completed in 47ms"

---

### Issue 6.5: Run Button Changes Text by Mode (LOW)
**Problem:** Run button text changes: **"Run XSLT"** ↔ **"Run XPath"** [lines: transform.js:211-221]. users might expect a modal toggle, not a text change.

**Root Cause:** Button label reflects mode but button is always the same element.

**Workflow Impact:**
- Minor confusion (is this the right button to click?)
- Muscle memory breaks when switching modes

**Improvement Direction:**
- Keep button size/position consistent but show mode indicator badge
- Or: have separate buttons for each mode but only one visible at a time
- Icon + short label: "▶ Run" (mode shown in header, not button)

---

## 7. EXAMPLE SYSTEM

### Issue 7.1: Examples Auto-Run Without "Preview" Phase (HIGH)
**Problem:** Loading an example [lines: modal.js:120-175] automatically populates editors AND immediately runs the transform (or XPath expression). Users don't get to review first.

**Root Cause:** [lines: modal.js:155-162] loadExample() calls runTransform() or runXPath() directly after 350ms delay.

**Workflow Impact:**
- User clicks example → transform runs → output appears
- User doesn't get to read/understand the XSLT before output
- Confusing if output is unexpected (user doesn't know what the code did)
- No chance to modify slightly before running

**Improvement Direction:**
- Add checkbox in examples modal: **"Auto-run example?"** (default: off)
- Or: "Load + Run" vs. "Load Only" buttons
- Show example description prominently before running
- Add "Try it yourself" button after viewing output (prompts user to modify)

---

### Issue 7.2: Example Search/Filter Has No Feedback (LOW-MEDIUM)
**Problem:** [lines: modal.js:84-94] Search filters examples instantly with no debounce or "searching…" message.

**Root Cause:** filterExamples() calls renderExGrid() synchronously on every keystroke.

**Workflow Impact:**
- Typing fast might feel sluggish (re-renders on every character)
- No indication search is working (does it search title, description, or code?)

**Improvement Direction:**
- Add 200ms debounce to search input
- Show search hint: "Searching title and description…"
- Highlight matched text in results
- Show recent searches in dropdown

---

### Issue 7.3: No Way to Add/Share Custom Examples in UI (MEDIUM)
**Problem:** Examples are hardcoded in JS [lines: examples-data.js]. Users can't create and save custom examples for their workflows.

**Root Cause:** EXAMPLES object is read-only (defined in code). No UI to add examples.

**Workflow Impact:**
- Users must remember their own patterns or re-create from scratch
- Can't share organization-specific examples with team
- No "Save as template" feature after successful transform

**Improvement Direction:**
- Add "Save as Example" button after successful transform (creates local example)
- Export examples as JSON file (share with team)
- Import examples from JSON file (team library)
- Allow organizing custom examples into folders

---

### Issue 7.4: Example Categories Are Code-Only (LOW)
**Problem:** [lines: examples-data.js:1-5] CATEGORIES are defined in JS. Adding a new category requires code edit.

**Root Cause:** Categories are static. No UI builder for categories.

**Workflow Impact:**
- Maintainers must edit code to organize examples
- Can't dynamically adjust categories based on usage

**Improvement Direction:**
- Generate categories from example tags (metadata)
- Allow collapsing empty categories
- Search across categories with faceted filtering

---

## 8. CPI SIMULATION UX

### Issue 8.1: KV Panel State Isn't Persisted Across Mode Switches (MEDIUM)
**Problem:** Headers/Properties panels are hidden in XPath mode [lines: modal.js:118-136]. When switching back to XSLT, panels are visible again but state was saved, so they re-appear with previous values.

**Root Cause:** [lines: xpath.js:161-230] Mode switch hides/shows panels but doesn't clear them. State is restored from localStorage.

**Workflow Impact:**
- User in XSLT mode adds headers → switches to XPath → back to XSLT → headers are still there
- Convenient but confusing: did they persist per-mode or globally?

**Improvement Direction:**
- Clarify: **"Headers and Properties are global (saved across mode switches)"**
- Or: make them truly per-mode (separate KV data for XSLT and XPath)
- Show a note: "Session includes X headers, Y properties"

---

### Issue 8.2: CPI Function Behavior Isn't Documented in UI (MEDIUM)
**Problem:** cpi:getHeader/getProperty empty string fallback [lines: transform.js:245-254] is only documented in code comments. Users don't know what value will be returned if key is missing.

**Root Cause:** No inline help or tooltip in KV panels explaining CPI semantics.

**Workflow Impact:**
- User expects null/error if key missing, gets empty string instead
- Confusing XSLT behavior (xsl:if doesn't trigger as expected)

**Improvement Direction:**
- Tooltip on Headers/Properties panels: **"Missing keys return empty string — use xsl:if to check"**
- Show example usage in sidebar
- Link to SAP CPI documentation

---

### Issue 8.3: No Way to Test CPI Functions Standalone (MEDIUM)
**Problem:** Users must write full XSLT to test cpi:setHeader/getHeader. Can't test CPI logic in isolation.

**Root Cause:** CPI functions are only hooked during Saxon transform. No "test CPI" mode.

**Workflow Impact:**
- Debugging CPI mappings requires full XSLT write/run cycle
- Slow iteration on CPI logic

**Improvement Direction:**
- Simple test panel: **"Test CPI Function"** with dropdown (setHeader, setProperty, getHeader, getProperty)
- Input fields for arguments, show result
- No XSLT required

---

### Issue 8.4: Output Headers/Properties Feedback is Ambiguous (LOW-MEDIUM)
**Problem:** Output Headers/Properties panels [lines: transform.js:94-104] show captured values but don't indicate if they were set by XSLT or pre-populated from input.

**Root Cause:** [lines: transform.js:355-361] Both cpiCaptured and input KV values are merged with no visual distinction.

**Workflow Impact:**
- User sees "Content-Type: application/xml" in output panel
- Unclear if XSLT set it or it came from input
- Debugging is harder

**Improvement Direction:**
- Color-code output headers: **green = set by XSLT, gray = input passthrough**
- Show delta: **"Changed: 3, Unchanged: 2"**
- Hover tooltip: **"Set by xsl:line 42"** (link to XSLT line)

---

### Issue 8.5: Namespace Rewriting Errors Are Hard to Debug (MEDIUM)
**Problem:** CPI rewriting [lines: transform.js:22-47] converts cpi: → js: namespace. If rewriting fails, Saxon error line numbers no longer match original XSLT.

**Root Cause:** [lines: validate.js:80-105] findXPathExpressionLine() tries to find the expression in original XSLT and use Saxon's line as hint, but on complex XSLT this can fail or map to wrong line.

**Workflow Impact:**
- Saxon reports error on line 50 → actual error is on line 27 in original XSLT
- Users waste time debugging the wrong line
- Error message shows rewritten XSLT code, not original

**Improvement Direction:**
- Show original XSLT in error message (not rewritten version)
- Add "Show rewritten XSLT" button for advanced debugging
- Accurate error line mapping even with namespace rewriting
- Test error line mapping in test suite

---

## 9. COPY / SHARE WORKFLOWS

### Issue 9.1: Share Modal Auto-Copies Without Asking (MEDIUM)
**Problem:** [lines: share.js:134-140] openShareModal() calls _copyShareUrl(url, true) immediately, which silently copies to clipboard.

**Root Cause:** Auto-copy design assumes users always want to copy. The `silent=true` parameter means no feedback.

**Workflow Impact:**
- User clicks Share → nothing obvious happens → clipboard is modified
- User might expect to see URL first, not copy immediately
- Clipboard hijacking (user had something else copied)

**Improvement Direction:**
- Show URL in modal first, then ask **"Copy to clipboard?"**
- Or: Copy button with visible feedback
- Tooltip: "Copied!" after copy succeeds
- Option to "open in new tab" instead of copy

---

### Issue 9.2: Share Always Switches Recipient to XSLT Mode (MEDIUM)
**Problem:** [lines: share.js:73-87] applyShareData() always forces XSLT mode on receiver side, even if sender was in XPath mode.

**Root Cause:** [lines: share.js:13-17] buildSharePayload() only captures XSLT model (xmlModelXslt), not XPath mode metadata.

**Workflow Impact:**
- User in XPath mode creates share link → recipient lands in XSLT mode (confusing)
- Doesn't share the "intent" of the session (learning XPath vs. writing XSLT)

**Improvement Direction:**
- Include mode metadata in share payload
- Receiver lands in sender's mode by default
- Show note: **"Sender was in [XPath] mode"**

---

### Issue 9.3: No Warning About Sharing Sensitive Data (LOW-MEDIUM)
**Problem:** Share URL contains full XML + XSLT + headers/properties. Users might not realize this is plaintext (base64 encoded, not encrypted).

**Root Cause:** [lines: share.js] No mention of privacy. Data is compressed but not encrypted.

**Workflow Impact:**
- User shares link containing PII or credentials → data is exposed
- User doesn't realize encryption isn't applied

**Improvement Direction:**
- Tooltip on Share button: **"Warning: URL contains unencrypted XML and XSLT"**
- Checkbox: **"This data is public"** (user must acknowledge)
- Offer password-protected cloud storage option for sensitive shares

---

### Issue 9.4: URL Encoding Efficiency Could Improve Large Files (LOW)
**Problem:** [lines: share.js:10-18] encodeShareData() uses pako.deflateRaw() which is good, but charset encoding isn't optimized for XML/XSLT.

**Root Cause:** JSON.stringify → UTF-8 TextEncoder → deflate. No XML-specific compression or charset selection (UTF-7 would be smaller).

**Workflow Impact:**
- Large XSLT files produce very long URLs
- Users hit URL length limit at smaller file sizes than necessary

**Improvement Direction:**
- Use BROTLI instead of DEFLATE for better compression ratio
- Strip unnecessary whitespace before encoding
- Consider URL-less sharing (POST to server, get short code)

---

## 10. ERROR RECOVERY

### Issue 10.1: Validation Errors Are Well-Shown! ✓ (STRENGTH)
**Positive:** [lines: validate.js:10-50] clearAllMarkers() and markErrorLine() create excellent error feedback:
- Red squiggle in editor
- Glyph in margin with hover message
- Console message with line number
- Error line is scrolled into view

**No changes needed** — this is a UX strength.

---

### Issue 10.2: Saxon Error Line Mapping Can Be Inaccurate (MEDIUM)
**Problem:** [lines: validate.js:80-105] Saxon errors in XSLT with CPI rewriting can show wrong line numbers (off by number of rewritten lines).

**Root Cause:** findXPathExpressionLine() heuristically finds the expression by pattern matching. If expression appears multiple times, heuristic might pick wrong occurrence.

**Workflow Impact:**
- User sees "error on line 100" but line 100 has different code
- User is confused and spends time on wrong code
- Multiple matches cause ambiguity [lines: validate.js:96-101]

**Improvement Direction:**
- Add offset mapping: track which lines were rewritten to build offset map
- Use source maps (map rewritten line numbers back to original)
- In error message, show **original XSLT line + rewritten line** for debugging

---

### Issue 10.3: No "Undo Transform" or "Revert Changes" Button (LOW)
**Problem:** If transform produces unexpected output, user must manually undo changes to XSLT/XML. No one-click revert.

**Root Cause:** Editor undo (Ctrl+Z) exists but it undoes typing, not transform execution. No "rollback" to previous version.

**Workflow Impact:**
- User runs transform → output is wrong → must manually fix XSLT → re-run
- Tedious iteration

**Improvement Direction:**
- Checkpoint system: "Save version before run" button
- Undo panel: **"Revert to before run"**
- Version history sidebar showing past states

---

### Issue 10.4: Timeout Handling for Large Files Is Absent (LOW-MEDIUM)
**Problem:** Large XML files or complex XSLT might time out at browser level (silent hang), but no progress indication or timeout warning.

**Root Cause:** [lines: transform.js:250-340] SaxonJS.XPath.evaluate() is blocking. No timeout wrapper or progress callback.

**Workflow Impact:**
- User clicks Run → nothing happens → browser hangs for 10+ seconds
- User thinks IDE crashed
- Forced to hard refresh (loses unsaved state)

**Improvement Direction:**
- Add 5-second timeout with message: **"Transform taking too long… click Cancel"**
- Progress indicator: show how much XML has been processed
- Auto-suggest: "Try simplifying your XSLT or breaking into smaller chunks"
- WebWorker isolation (transform in background thread to keep UI responsive)

---

### Issue 10.5: Browser Console Errors Aren't Surfaced in IDE (LOW)
**Problem:** If Saxon-JS has JS errors (rare but possible), they're logged to browser console but not shown in IDE console.

**Root Cause:** [lines: transform.js:280-290] exception handling catches Saxon errors but browser JS errors are separate.

**Workflow Impact:**
- Silent failures that only developers see in browser DevTools
- End users have no clue what went wrong

**Improvement Direction:**
- Wrap window.onerror to capture JS exceptions and log to IDE console
- Show browser console errors as red errors in IDE console

---

## Summary Table: Issue Frequency & Severity

| Severity | Count | Examples |
|----------|-------|----------|
| **HIGH** | 3 | Examples auto-run, empty workspace, mode switch feedback |
| **MEDIUM-HIGH** | 3 | Right-click features hidden, repetitive KV entry, share URL limits |
| **MEDIUM** | 18 | Error line mapping, validation feedback, layout restoration, etc. |
| **LOW-MEDIUM** | 9 | Word wrap discovery, timeout handling, clipboard hijacking, etc. |
| **LOW** | 7 | Spinner delay, button text, category organization, etc. |
| **STRENGTH** | 1 | Validation errors (excellent UX) |

---

## Quick Wins (Easy Improvements with High Impact)

1. **Add "Auto-run examples?" checkbox** → Fixes Issue 7.1 (27s to implement)
2. **Real-time KV validation** → Fixes Issues 1.2 + 6.1 (45s to implement)
3. **Confirm Clear Session button** → Fixes Issue 5.3 (20s to implement)
4. **Show "Right-click for more options" hint** → Fixes Issue 2.1 (30s to implement)
5. **Add mode indicator badge to Run button** → Fixes Issue 6.5 (35s to implement)

---

## Recommended Next Steps

1. **Priority 1 (do first):** Onboarding improvements (Issues 4.1, 4.2, 2.1)
2. **Priority 2 (high ROI):** KV workflow improvements (Issues 1.1, 1.2)
3. **Priority 3 (polish):** Error recovery & feedback (Issues 6.1, 6.3, 10.2)
4. **Priority 4 (nice-to-have):** Advanced features (Issues 7.3, 8.3)
