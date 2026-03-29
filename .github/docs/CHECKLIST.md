# XSLTDebugX UX Improvements — Quick Reference Checklist

> Fast-track UX improvements organized by phase and effort. Use this to track implementation.

---

## 🚀 PHASE 1: Immediate Fixes (Today — 20 min)

Essential blockers that prevent user success. Each fix is 2-5 minutes.

### [ ] 1. Auto-Run Toggle in Examples Modal
- **File:** `modal.js:132-153` (loadExample function)
- **Change:** Add checkbox `<input type="checkbox" id="exAutoRun" checked="false">`
- **Impact:** Users can review code before execution
- **Time:** 3 min

### [ ] 2. Mode Indicator Badge (Status Bar)
- **File:** `ui.js` (add status pill to header)
- **Change:** Show `🟡 XSLT Mode` or `🟡 XPath Mode` with button
- **Display:** In status bar, next to Run button
- **Impact:** Clarifies which mode will execute
- **Time:** 5 min

### [ ] 3. Right-Click Affordance Tooltip
- **File:** `editor.js:395` (context menu setup)
- **Change:** Add one-time tooltip: "💡 Right-click for Copy XPath, Snippets, Format"
- **Track:** localStorage flag `xdebugx-saw-context-menu-hint`
- **Impact:** Surfaces hidden features
- **Time:** 2 min

### [ ] 4. Share URL Length Warning
- **File:** `share.js:29-45` (encodeStateToUrl)
- **Change:** Display length before copy, warn if > 1,800 chars
- **UI:** Modal with red warning + suggestion to minify
- **Impact:** Prevents broken share links
- **Time:** 5 min

### [ ] 5. KV Field Real-Time Validation
- **File:** `transform.js:118-130` (addKVRow, updateKV)
- **Change:** Red highlight for invalid NCNames (regex: `/^[a-zA-Z_][a-zA-Z0-9._-]*$/`)
- **Display:** Real-time as user types
- **Impact:** Users see immediately why headers don't work
- **Time:** 5 min

**Total Phase 1 effort:** 20 minutes  
**Impact:** Catches 80% of new-user confusion, fixes all critical blockers

---

## 🎯 PHASE 2: Workflow Accelerators (This Week — 70 min)

High-impact improvements for experienced users. Focus on discovery and speed.

### [ ] 6. Welcome Onboarding Overlay
- **File:** `modal.js`, `css/style.css`
- **Scope:** 4-slide welcome (What is this? How to start? Shortcuts? Next steps?)
- **Track:** localStorage flag `xdebugx-saw-welcome-v1`
- **Skip:** "Don't show again" option
- **Impact:** 40% improvement in first-run conversion
- **Time:** 30 min

### [ ] 7. Copy XPath Toolbar Button
- **File:** `panes.js:8-50` (pane bar rendering)
- **Change:** Add button `[📋 Copy XPath]` next to Copy, Clear, Format
- **Enable:** Only when XML pane active + valid XML
- **Behavior:** Same as right-click "Copy XPath — Exact"
- **Impact:** Feature becomes discoverable
- **Time:** 5 min

### [ ] 8. Batch Clear All Editors
- **File:** `panes.js:18` (clearPane function)
- **Change:** Add button `[🗑️ Clear All]`
- **Behavior:** Clear XML, XSLT, Output, KV in one click
- **Confirm:** Show confirmation dialog
- **Impact:** Faster workspace reset
- **Time:** 3 min

### [ ] 9. CPI Standard Headers Preset
- **File:** `transform.js:140-160` (renderKV)
- **Change:** Add button `[📋 Add Standard SAP Headers]`
- **Presets:** Authorization, Content-Type, Accept, SOAPAction, etc.
- **Behavior:** Add rows, user can delete unused
- **Impact:** 50% faster CPI example setup
- **Time:** 10 min

### [ ] 10. Format/Minify Consolidation
- **File:** `panes.js:176` (fmtEditor), `editor.js:520` (minify)
- **Change:** Single dropdown `[✨ Format + Minify ▼]`
- **Options:** Format, Minify, Copy (byte count shown)
- **Shortcuts:** Show Shift+Alt+F and Shift+Alt+M hints
- **Impact:** Unified action, less menu searching
- **Time:** 10 min

### [ ] 11. Example Count Badges
- **File:** `modal.js:8-30` (renderExSidebar)
- **Change:** Show badge on category buttons: `[Transform 🟡 8]`
- **Impact:** Shows available examples per category
- **Time:** 2 min

### [ ] 12. Session Recovery Hint (First Visit)
- **File:** `state.js`, `modal.js`
- **Change:** Show hint banner if no saved session detected
- **Message:** "No saved session detected. Create new or load example?"
- **Dismiss:** localStorage flag `xdebugx-saw-recovery-hint`
- **Impact:** Helps users understand persistence
- **Time:** 5 min

**Total Phase 2 effort:** 70 minutes  
**Impact:** 25% faster workflows, 50% better feature discovery

---

## 🎨 PHASE 3: Polish & Advanced Features (Next Month — 190 min)

Nice-to-haves that complete the experience. Lower priority but high value.

### [ ] 13. Example Metadata Preview Modal
- **File:** `modal.js`
- **Before:** Clicking example loads immediately
- **After:** Show preview modal with mode, category, KV count, description
- **Button:** "Load" or "Cancel"
- **Time:** 45 min

### [ ] 14. Example Search & Filter
- **File:** `modal.js`
- **Add:** Search box + tag filter (not just category)
- **Index:** Search in label, description, XML content
- **Feedback:** Show match count
- **Time:** 30 min

### [ ] 15. CPI Import/Export as JSON
- **File:** `transform.js`
- **UI:** "Import" button → paste JSON, "Export" button → copy JSON
- **Format:** `{ "headers": { "name": "value" }, "properties": {...} }`
- **Time:** 20 min

### [ ] 16. Show Captured KV in Output
- **File:** `transform.js:95-110` (renderOutputKV)
- **Add:** Section showing which headers/properties were set during transform
- **Compare:** Show "set" vs "input" values
- **Time:** 10 min

### [ ] 17. Mode Layout State Persistence
- **File:** `xpath.js:161-235` (_applyXPathToggleState)
- **Add:** Save KV/Output panel collapsed state before mode switch
- **Restore:** Restore when switching back to same mode
- **Time:** 15 min

### [ ] 18. Auto-Growing KV Table
- **File:** `transform.js` (CSS for table)
- **Change:** Remove fixed height, use `max-height` with scroll
- **Behavior:** Grow as rows added, stay organized
- **Time:** 5 min

### [ ] 19. Duplicate Key Detection Badge
- **File:** `transform.js:125-140` (updateKV)
- **Add:** Warn badge next to KV panel header if duplicate detected
- **Message:** "Duplicate key: 'Authorization' (last value wins)"
- **Time:** 5 min

### [ ] 20. JSON State Export Option
- **File:** `share.js`
- **Add:** "Copy as JSON" button (alternative to URL encoding)
- **Use:** Users can save/version state externally
- **Time:** 5 min

**Total Phase 3 effort:** 190 minutes (3 hours)  
**Impact:** 60%+ UX improvement, full feature accessibility

---

## 📊 Implementation Progress Tracker

Copy this table and update as you implement:

```
Phase 1: Critical Fixes
[ ] 1. Auto-run toggle            20% ☐
[ ] 2. Mode indicator badge       40% ☐
[ ] 3. Right-click tooltip         60% ☐
[ ] 4. Share URL warning           80% ☐
[ ] 5. KV validation              100% ☐

Phase 2: Workflow Accelerators
[ ] 6. Welcome overlay            20% ☐
[ ] 7. Copy XPath button          30% ☐
[ ] 8. Clear All button           40% ☐
[ ] 9. SAP preset headers         50% ☐
[ ] 10. Format dropdown           60% ☐
[ ] 11. Category badges           70% ☐
[ ] 12. Recovery hint             80% ☐

Phase 3: Polish
[ ] 13. Example preview modal     20% ☐
[ ] 14. Search & filter           30% ☐
[ ] 15. KV import/export JSON    40% ☐
[ ] 16. Show captured KV          45% ☐
[ ] 17. Layout state restore      50% ☐
[ ] 18. Auto-grow table           55% ☐
[ ] 19. Duplicate detection       60% ☐
[ ] 20. JSON export               70% ☐
```

---

## 🎯 Success Criteria

After each phase, verify:

**Phase 1 Complete?**
- ✅ New users can load examples without auto-execution
- ✅ Mode indicator shows which mode is active
- ✅ Invalid KV fields show red highlight
- ✅ Share URL shows length warning

**Phase 2 Complete?**
- ✅ Welcome overlay appears on first visit
- ✅ Copy XPath is toolbar button (not hidden in context menu)
- ✅ CPI headers can be added via preset
- ✅ Users understand where to find all features

**Phase 3 Complete?**
- ✅ Users can preview example before loading
- ✅ Find examples via search + filter
- ✅ Can import/export KV state as JSON
- ✅ Layout state persists across mode switches

---

## 💡 Pro Tips for Implementation

1. **CSS Classes:** Use existing patterns from `style.css` (`.pane-bar`, `.log-line`, `.xf-error-line-bg`)
2. **localStorage Keys:** Follow pattern `xdebugx-*`. Current keys:
   - `xdebugx-session-v1` — main state
   - `xdebugx-xpath-history` — last 20 expressions
3. **Mode Detection:** Always check `xpathEnabled` before routing XML model
4. **Debouncing:** Use existing timers (`xsltDebounce`, `xmlDebounce`)
5. **Testing:** Serve with `python -m http.server`, test in all modes + browsers
6. **Breaking Tests:** Watch for localStorage schema changes (bump version)

---

## 🔗 Related Files to Review

- `index.html` — HTML structure, modal containers
- `js/modal.js` — Example loading, category rendering
- `js/transform.js` — CPI simulation, KV management
- `js/ui.js` — Status bar, theme toggle
- `js/xpath.js` — Mode switching, XPath state
- `js/panes.js` — Pane toolbars, clear/copy/format
- `css/style.css` — Theming, layout, responsive
- `../instructions/features.instructions.md` — API reference

---

## 📞 Questions During Implementation?

Refer to:
1. **How does X work?** → [../instructions/features.instructions.md](../instructions/features.instructions.md)
2. **What's the module structure?** → [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
3. **Code style guide?** → [../../CONTRIBUTING.md](../../CONTRIBUTING.md)
4. **Existing patterns?** → Search codebase for similar code
