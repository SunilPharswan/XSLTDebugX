// ════════════════════════════════════════════
//  XPATH EVALUATOR  +  XML EDITOR HIGHLIGHTING
// ════════════════════════════════════════════
//  Evaluates XPath 3.0 expressions against the XML input pane using Saxon-JS.
//  Matched nodes are highlighted in the XML editor with amber decorations.
//  Results are shown in the XPath Results panel (right column).
// ════════════════════════════════════════════

// Decoration collection for XPath highlights in the XML editor
let xpathDecorations = null;
let xpathEnabled = false; // off by default — user must explicitly enable
let _xpathPreColCenterCollapsed = false; // colCenter state before XPath was enabled

// ── XPath expression history ──────────────────────────────────────────────────
const _xpathHistory = [];        // most-recent-first
const _xpathHistoryMax = 20;
const _xpathHistoryKey = 'xdebugx-xpath-history';
let   _xpathHistoryCursor = -1;  // -1 = not browsing history
let   _xpathDraftExpr     = '';  // saves current typed text while browsing

// Load persisted history on startup
(function() {
  try {
    const saved = JSON.parse(localStorage.getItem(_xpathHistoryKey) || '[]');
    if (Array.isArray(saved)) _xpathHistory.push(...saved.slice(0, _xpathHistoryMax));
  } catch(_) {}
})();

function _xpathHistoryPush(expr) {
  if (!expr) return;
  // Remove duplicate if already present, then prepend
  const idx = _xpathHistory.indexOf(expr);
  if (idx !== -1) _xpathHistory.splice(idx, 1);
  _xpathHistory.unshift(expr);
  if (_xpathHistory.length > _xpathHistoryMax) _xpathHistory.length = _xpathHistoryMax;
  _xpathHistoryCursor = -1;
  // Persist to localStorage
  try { localStorage.setItem(_xpathHistoryKey, JSON.stringify(_xpathHistory)); } catch(_) {}
}

function _xpathHistoryNavigate(direction, input) {
  if (_xpathHistory.length === 0) {
    clog('ƒx  No expression history yet — run an expression first', 'info');
    return;
  }
  if (_xpathHistoryCursor === -1) {
    // Save whatever user was typing before browsing
    _xpathDraftExpr = input.value;
  }
  if (direction === 'up') {
    _xpathHistoryCursor = Math.min(_xpathHistoryCursor + 1, _xpathHistory.length - 1);
  } else {
    _xpathHistoryCursor = Math.max(_xpathHistoryCursor - 1, -1);
  }
  input.value = _xpathHistoryCursor === -1 ? _xpathDraftExpr : _xpathHistory[_xpathHistoryCursor];
  // Move cursor to end
  const len = input.value.length;
  input.setSelectionRange(len, len);
  if (_xpathHistoryCursor === -1) {
    clog(`ƒx  History: back to current draft`, 'info');
  } else {
    clog(`ƒx  History ${_xpathHistoryCursor + 1}/${_xpathHistory.length}: ${_xpathHistory[_xpathHistoryCursor]}`, 'info');
  }
  scheduleSave();
}

// ── Apply XPath enabled/disabled state to DOM (no logging, no side effects) ──
function _applyXPathToggleState() {
  const btnXslt    = document.getElementById('modeBtnXslt');
  const btnXpath   = document.getElementById('modeBtnXpath');
  const bar        = document.getElementById('xpathBar');
  const colCenter  = document.getElementById('colCenter');
  const hdrPanel   = document.getElementById('hdrPanel');
  const propPanel  = document.getElementById('propPanel');
  const outSection = document.getElementById('outputSection');
  const console_   = document.getElementById('consolePanel');
  const workspace  = document.querySelector('.workspace');
  const shareBtn   = document.getElementById('shareBtn');
  const runBtn     = document.getElementById('runBtn');
  const consoleTtl = document.querySelector('.console-title');

  if (btnXslt)  btnXslt.classList.toggle('active', !xpathEnabled);
  if (btnXpath) btnXpath.classList.toggle('active',  xpathEnabled);
  if (bar) bar.style.display = xpathEnabled ? '' : 'none';

  // When enabling: always collapse colCenter. When disabling: restore to pre-xpath state.
  if (colCenter) {
    if (xpathEnabled) {
      colCenter.classList.add('collapsed');
    } else {
      colCenter.classList.toggle('collapsed', _xpathPreColCenterCollapsed);
    }
  }

  // XPath mode: hide input KV panels and output section — XML + results only
  const kvDisplay = xpathEnabled ? 'none' : '';
  if (hdrPanel)   hdrPanel.style.display   = kvDisplay;
  if (propPanel)  propPanel.style.display  = kvDisplay;
  if (outSection) outSection.style.display = kvDisplay;

  // #3 Share hidden in XPath mode
  if (shareBtn) {
    shareBtn.classList.toggle('hidden', xpathEnabled);
  }

  // #4 Run button — rename and rewire by mode (never hidden)
  if (runBtn) {
    if (xpathEnabled) {
      runBtn.onclick = runXPath;
      runBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M3 1.5l11 6.5-11 6.5V1.5z"/></svg> Run XPath <span class="kbd">⌘↵</span>`;
    } else {
      runBtn.onclick = runTransform;
      runBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13"><path d="M3 1.5l11 6.5-11 6.5V1.5z"/></svg> Run XSLT <span class="kbd">⌘↵</span>`;
    }
  }

  // Mode pill in status bar + console label
  const modePill = document.getElementById('modePill');
  if (modePill) {
    modePill.textContent = xpathEnabled ? 'XPath' : 'XSLT';
    modePill.className = xpathEnabled ? 'mode-pill mode-xpath' : 'mode-pill mode-xslt';
  }
  if (consoleTtl) consoleTtl.textContent = xpathEnabled ? 'Console · XPath Mode' : 'Console · XSLT Mode';

  // Move console: XPath mode → below workspace; XSLT mode → inside colCenter (below XSLT editor)
  if (console_ && colCenter && workspace) {
    if (xpathEnabled) {
      workspace.insertAdjacentElement('afterend', console_);
    } else {
      colCenter.appendChild(console_);
    }
  }
}

// ── Toggle XPath evaluator on/off ─────────────────────────────────────────────
function toggleXPath() {
  xpathEnabled = !xpathEnabled;

  if (xpathEnabled) {
    // Save colCenter collapsed state before we hide it
    const colCenter = document.getElementById('colCenter');
    _xpathPreColCenterCollapsed = colCenter?.classList.contains('collapsed') ?? false;
  }

  _applyXPathToggleState();

  // Open right column when enabling — XPath results need to be visible
  if (xpathEnabled) {
    const colRight = document.getElementById('colRight');
    if (colRight?.classList.contains('collapsed')) colRight.classList.remove('collapsed');
  }

  if (!xpathEnabled) {
    clearXPathResults();
    clog('Switched to XSLT mode', 'info');
    window.goatcounter?.count({ path: 'mode-xslt', title: 'Switch to XSLT Mode' });
  } else {
    clog('Switched to XPath mode', 'info');
    window.goatcounter?.count({ path: 'mode-xpath', title: 'Switch to XPath Mode' });
  }
  scheduleSave();
  setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 50);
}

// ── Clear all XPath highlights from the XML editor ───────────────────────────
function clearXPathHighlights() {
  if (xpathDecorations) {
    try { xpathDecorations.clear(); } catch(e) {}
    xpathDecorations = null;
  }
}

// ── Convert a character offset in a string to { line, col } (1-based) ────────
function _offsetToLineCol(src, offset) {
  const before = src.substring(0, offset);
  const lines  = before.split('\n');
  return { line: lines.length, col: lines[lines.length - 1].length + 1 };
}

// ── Find the character offset of the Nth occurrence of a tag open/close ──────
// Requires the character immediately after the tag name to be whitespace, >, or /
// so that <Item does not match <ItemDetail.
function _nthTagOpen(src, tag, n) {
  // Matches <tag> <tag/> <tag attr=...>
  const re = new RegExp(`<${tag}(?=[\\s>/])`, 'g');
  let count = 0;
  let m;
  while ((m = re.exec(src)) !== null) {
    count++;
    if (count === n) return m.index;
  }
  return -1;
}

// ── Find the source range {startOffset, endOffset} for a matched element ──────
function _findNodeRange(xmlSrc, el, occurrenceIndex) {
  const tag        = el.nodeName;
  const openOffset = _nthTagOpen(xmlSrc, tag, occurrenceIndex);
  if (openOffset === -1) return null;

  // Walk to end of opening tag, respecting attribute quotes
  let i = openOffset + tag.length + 1; // skip past <tagName
  let inDouble = false, inSingle = false;
  while (i < xmlSrc.length) {
    const ch = xmlSrc[i];
    if (!inDouble && !inSingle) {
      if (ch === '"')  { inDouble = true; i++; continue; }
      if (ch === "'")  { inSingle = true; i++; continue; }
      if (ch === '>')  { i++; break; }
    } else if (inDouble && ch === '"') { inDouble = false; }
      else if (inSingle && ch === "'") { inSingle = false; }
    i++;
  }
  const openTagEnd = i;

  // Self-closing?
  if (xmlSrc[i - 2] === '/') {
    return { startOffset: openOffset, endOffset: openTagEnd };
  }

  // Find matching </tag> using precise regex, tracking nesting depth
  let depth = 1, j = openTagEnd;
  const openRe  = new RegExp(`<${tag}(?=[\\s>/])`, 'g');
  const closeRe = new RegExp(`<\\/${tag}(?=[\\s>])`, 'g');

  while (depth > 0) {
    openRe.lastIndex  = j;
    closeRe.lastIndex = j;
    const nextOpen  = openRe.exec(xmlSrc);
    const nextClose = closeRe.exec(xmlSrc);

    if (!nextClose) break;

    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      j = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) {
        const closeEnd = xmlSrc.indexOf('>', nextClose.index);
        return {
          startOffset: openOffset,
          endOffset:   closeEnd === -1 ? nextClose.index + nextClose[0].length : closeEnd + 1,
        };
      }
      j = nextClose.index + nextClose[0].length;
    }
  }

  // Fallback: just the opening tag
  return { startOffset: openOffset, endOffset: openTagEnd };
}

// ── Apply Monaco highlight decorations for all matched nodes ──────────────────
function _highlightMatchedNodes(items, xmlSrc) {
  clearXPathHighlights();
  if (!eds.xml || !items.length) return;

  const decorations = [];
  const tagCounts   = {};

  items.forEach(item => {
    if (!item || typeof item !== 'object') return; // skip atomics

    // Text node → highlight parent element's opening line
    if (item.nodeType === 3) {
      const parent = item.parentNode;
      if (!parent || parent.nodeType !== 1) return;
      const tag = parent.nodeName;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      const range = _findNodeRange(xmlSrc, parent, tagCounts[tag]);
      if (!range) return;
      const { line } = _offsetToLineCol(xmlSrc, range.startOffset);
      decorations.push(_makeLineDecoration(line));
      return;
    }

    // Attribute node → highlight owner element's opening line
    if (item.nodeType === 2) {
      const owner = item.ownerElement;
      if (!owner) return;
      const tag = owner.nodeName;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      const range = _findNodeRange(xmlSrc, owner, tagCounts[tag]);
      if (!range) return;
      const { line } = _offsetToLineCol(xmlSrc, range.startOffset);
      decorations.push(_makeLineDecoration(line, `**XPath match** attr \`${item.name}\``));
      return;
    }

    // Element node → full range highlight
    if (item.nodeType === 1) {
      const tag = item.nodeName;
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      const range = _findNodeRange(xmlSrc, item, tagCounts[tag]);
      if (!range) return;
      const start = _offsetToLineCol(xmlSrc, range.startOffset);
      const end   = _offsetToLineCol(xmlSrc, range.endOffset - 1);
      if (start.line === end.line) {
        // Single-line: inline highlight
        decorations.push({
          range: new monaco.Range(start.line, start.col, start.line, end.col + 1),
          options: {
            className: 'xf-xpath-match-inline',
            glyphMarginClassName: 'xf-xpath-match-glyph',
            glyphMarginHoverMessage: { value: `**XPath match** \`<${tag}>\`` },
          }
        });
      } else {
        // Multi-line: whole-line background on each line
        for (let ln = start.line; ln <= end.line; ln++) {
          decorations.push(_makeLineDecoration(
            ln,
            ln === start.line ? `**XPath match** \`<${tag}>\`` : null
          ));
        }
      }
    }
  });

  if (!decorations.length) return;
  xpathDecorations = eds.xml.createDecorationsCollection(decorations);
  // Scroll XML editor to first match
  eds.xml.revealLineInCenter(decorations[0].range.startLineNumber);
}

function _makeLineDecoration(line, hoverMsg) {
  return {
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      className:            'xf-xpath-match-bg',
      glyphMarginClassName: 'xf-xpath-match-glyph',
      ...(hoverMsg ? { glyphMarginHoverMessage: { value: hoverMsg } } : {}),
    }
  };
}

// ── Serialize a single XDM item to a display string ──────────────────────────
function _xpathSerializeItem(item) {
  if (item === null || item === undefined) return { text: '(empty)', type: 'atomic' };
  if (typeof item === 'object' && item.nodeType) {
    try {
      // Document node (nodeType 9) — unwrap to its document element
      const target = item.nodeType === 9 ? item.documentElement : item;

      const raw   = new XMLSerializer().serializeToString(target);
      // Strip only namespace declarations injected by XMLSerializer
      // (xmlns="..." or xmlns:prefix="...") — use word boundary so we
      // don't accidentally clip attribute values that contain "xmlns"
      const clean = raw.replace(/\s+xmlns(?::\w+)?="[^"]*"/g, '');
      const text  = clean.trim().startsWith('<') ? prettyXML(clean) : clean;
      return { text, type: item.nodeType === 3 ? 'text' : 'node' };
    } catch(e) {
      return { text: String(item), type: 'node' };
    }
  }
  return { text: String(item), type: 'atomic' };
}

// ── Normalise Saxon-JS result to a flat JS array ─────────────────────────────
function _xpathNormalise(result) {
  if (result === null || result === undefined) return [];
  if (Array.isArray(result)) return result;
  return [result];
}

// ── Main entry point ──────────────────────────────────────────────────────────
function runXPath() {
  if (!saxonReady) { clog('Saxon-JS not ready yet', 'error'); return; }
  if (!xpathEnabled) return;

  // Reset error badge for fresh run
  consoleErrCount = 0;
  updateConsoleErrBadge();

  const input = document.getElementById('xpathInput');
  const expr  = input?.value?.trim();
  if (!expr) {
    clog('ƒx  Expression is empty — type an XPath expression and press Run', 'warn');
    return;
  }

  const xmlSrc = eds.xml?.getValue()?.trim();

  // Ensure right column is open
  const colRight = document.getElementById('colRight');
  if (colRight.classList.contains('collapsed')) {
    colRight.classList.remove('collapsed');
    setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 250);
  }

  // Clear previous highlights immediately
  clearXPathHighlights();

  if (!xmlSrc) {
    clog('ƒx  XML Source is empty — add XML input first', 'warn');
    _showXPathResults([], 'XML Source is empty — add XML input first', true);
    return;
  }

  const xmlCheck = validateXML(xmlSrc);
  if (!xmlCheck.ok) {
    const xmlErr = `XML error at line ${xmlCheck.line}: ${xmlCheck.message}`;
    clog(`ƒx  ${xmlErr}`, 'error');
    _showXPathResults([], xmlErr, true);
    return;
  }

  clog(`ƒx  ${expr}`, 'info');
  window.goatcounter?.count({ path: 'run-xpath', title: 'Run XPath' });
  _xpathHistoryPush(expr);
  _xpathHistoryCursor = -1;

  try {
    const t0      = performance.now();
    const NS = {
      xs:   'http://www.w3.org/2001/XMLSchema',
      fn:   'http://www.w3.org/2005/xpath-functions',
      math: 'http://www.w3.org/2005/xpath-functions/math',
      map:  'http://www.w3.org/2005/xpath-functions/map',
      array:'http://www.w3.org/2005/xpath-functions/array',
    };
    const docNode = SaxonJS.XPath.evaluate('parse-xml($xml)', [], { params: { xml: xmlSrc } });
    const raw     = SaxonJS.XPath.evaluate(expr, docNode, { namespaceContext: NS });
    const elapsed = (performance.now() - t0).toFixed(1);
    const items   = _xpathNormalise(raw);

    // Summarise result types for the console
    if (items.length === 0) {
      clog(`ƒx  No matches  ·  ${elapsed}ms`, 'warn');
    } else {
      const nodeCount   = items.filter(x => x && typeof x === 'object' && x.nodeType === 1).length;
      const textCount   = items.filter(x => x && typeof x === 'object' && x.nodeType === 3).length;
      const attrCount   = items.filter(x => x && typeof x === 'object' && x.nodeType === 2).length;
      const atomicCount = items.length - nodeCount - textCount - attrCount;
      const parts = [];
      if (nodeCount)   parts.push(`${nodeCount} element${nodeCount  !== 1 ? 's' : ''}`);
      if (textCount)   parts.push(`${textCount} text${textCount     !== 1 ? 's' : ''}`);
      if (attrCount)   parts.push(`${attrCount} attr${attrCount     !== 1 ? 's' : ''}`);
      if (atomicCount) parts.push(`${atomicCount} value${atomicCount !== 1 ? 's' : ''}`);
      clog(`ƒx  ${items.length} match${items.length !== 1 ? 'es' : ''}  ·  ${parts.join(', ')}  ·  ${elapsed}ms`, 'success');
    }

    // Highlight matched nodes in the XML editor
    _highlightMatchedNodes(items, xmlSrc);

    _showXPathResults(items, null, false);

  } catch(e) {
    const msg = (e.message || String(e)).split('\n')[0];
    clog(`ƒx  ${msg}`, 'error');
    _showXPathResults([], msg, true);
  }
}

// ── Build an absolute XPath for a DOM element node ───────────────────────────
// indexed=true  → /Orders/Order[2]/Amount  (positional, exact)
// indexed=false → /Orders/Order/Amount     (general, pattern)
function _buildXPathFromNode(el, indexed = true) {
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1) {
    const tag      = node.nodeName;
    const siblings = node.parentNode
      ? [...node.parentNode.children].filter(c => c.nodeName === tag)
      : [node];
    const idx = siblings.indexOf(node) + 1;
    parts.unshift(
      indexed && siblings.length > 1 ? `${tag}[${idx}]` : tag
    );
    node = node.parentNode;
  }
  return '/' + parts.join('/');
}

// ── Public: get XPath at current cursor position in the XML editor ────────────
// Returns { indexed, general } — both absolute XPath strings, or null.
function getXPathAtCursor(editor) {
  const model  = editor.getModel();
  const pos    = editor.getPosition();
  const offset = model.getOffsetAt(pos);
  const src    = model.getValue();
  const domNode = _getXPathDomNodeAtOffset(src, offset);
  if (!domNode) return null;
  return {
    indexed: _buildXPathFromNode(domNode, true),
    general: _buildXPathFromNode(domNode, false),
  };
}

// ── Find the element at a character offset in raw XML source ─────────────────
function _getXPathDomNodeAtOffset(xmlSrc, offset) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(xmlSrc, 'application/xml');
  if (doc.querySelector('parsererror')) return null;

  const tagRe = /<([\w:.-]+)(?=[\s>/])/g;
  let m;
  const tagOccurrences = {};
  let bestTag = null, bestOcc = 0, bestStart = -1;

  while ((m = tagRe.exec(xmlSrc)) !== null) {
    const tag = m[1];
    if (tag.startsWith('/') || tag.startsWith('?') || tag.startsWith('!')) continue;
    tagOccurrences[tag] = (tagOccurrences[tag] || 0) + 1;
    const occ   = tagOccurrences[tag];
    const range = _findNodeRangeByTag(xmlSrc, tag, occ);
    if (!range) continue;
    if (offset >= range.startOffset && offset <= range.endOffset) {
      if (range.startOffset >= bestStart) {
        bestTag = tag; bestOcc = occ; bestStart = range.startOffset;
      }
    }
  }

  if (!bestTag) return null;
  const allNodes = [...doc.getElementsByTagName('*')].filter(el => el.nodeName === bestTag);
  return allNodes[bestOcc - 1] ?? null;
}

// Variant of _findNodeRange that takes tag + occurrence directly (no DOM element needed)
function _findNodeRangeByTag(xmlSrc, tag, occurrenceIndex) {
  const openOffset = _nthTagOpen(xmlSrc, tag, occurrenceIndex);
  if (openOffset === -1) return null;

  let i = openOffset + tag.length + 1;
  let inDouble = false, inSingle = false;
  while (i < xmlSrc.length) {
    const ch = xmlSrc[i];
    if (!inDouble && !inSingle) {
      if (ch === '"')  { inDouble = true;  i++; continue; }
      if (ch === "'")  { inSingle = true;  i++; continue; }
      if (ch === '>')  { i++; break; }
    } else if (inDouble && ch === '"') { inDouble = false; }
      else if (inSingle && ch === "'") { inSingle = false; }
    i++;
  }
  const openTagEnd = i;
  if (xmlSrc[i - 2] === '/') return { startOffset: openOffset, endOffset: openTagEnd };

  let depth = 1, j = openTagEnd;
  const openRe  = new RegExp(`<${tag}(?=[\\s>/])`, 'g');
  const closeRe = new RegExp(`<\\/${tag}(?=[\\s>])`, 'g');
  while (depth > 0) {
    openRe.lastIndex  = j;
    closeRe.lastIndex = j;
    const nextOpen  = openRe.exec(xmlSrc);
    const nextClose = closeRe.exec(xmlSrc);
    if (!nextClose) break;
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      j = nextOpen.index + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) {
        const closeEnd = xmlSrc.indexOf('>', nextClose.index);
        return { startOffset: openOffset, endOffset: closeEnd === -1 ? nextClose.index + nextClose[0].length : closeEnd + 1 };
      }
      j = nextClose.index + nextClose[0].length;
    }
  }
  return { startOffset: openOffset, endOffset: openTagEnd };
}

// ── Render results panel ───────────────────────────────────────────────────────
// Async because monaco.editor.colorize() returns a Promise.
// Generation counter prevents a slow first run overwriting a faster second run.
let _showXPathGen = 0;
async function _showXPathResults(items, errorMsg, isError) {
  const gen = ++_showXPathGen; // capture generation for this call
  const panel   = document.getElementById('xpathResultsPanel');
  const body    = document.getElementById('xpathResultsBody');
  const countEl = document.getElementById('xpathMatchCount');

  panel.classList.add('visible');
  // Only minimise output section if it's actually visible (not hidden in XPath mode)
  const outSec = document.getElementById('outputSection');
  if (outSec && outSec.style.display !== 'none') {
    outSec.classList.add('xpath-minimized');
    setTimeout(() => { eds.out?.layout(); }, 250);
  }

  // Helper: update the XQuery pane-bar count badge
  const headerCount = document.getElementById('xpathHeaderCount');
  const _setHeaderCount = (text, cls) => {
    if (!headerCount) return;
    headerCount.textContent = text;
    headerCount.className = 'xpath-header-count' + (cls ? ' ' + cls : '');
    headerCount.style.display = text ? '' : 'none';
  };

  if (isError) {
    countEl.textContent = 'Error';
    countEl.className   = 'xpath-match-count has-error';
    body.innerHTML      = `<div class="xpath-error">${escHtml(errorMsg)}</div>`;
    _setHeaderCount('Error', 'has-error');
    return;
  }

  const n = items.length;
  countEl.textContent = `${n} match${n !== 1 ? 'es' : ''}`;
  countEl.className   = n > 0 ? 'xpath-match-count has-results' : 'xpath-match-count';
  _setHeaderCount(`${n} match${n !== 1 ? 'es' : ''}`, n > 0 ? 'has-results' : '');

  if (n === 0) {
    body.innerHTML = '<div class="xpath-no-results">No matches found for this expression.</div>';
    return;
  }

  // Serialize all items first
  const serialized = items.map(item => _xpathSerializeItem(item));

  // Colorize node/text items using Monaco's own XML tokenizer — same colours as the editors
  const colorized = await Promise.all(serialized.map(async ({ text, type }) => {
    if ((type === 'node' || type === 'text') && typeof monaco !== 'undefined') {
      try {
        return await monaco.editor.colorize(text, 'xml', { tabSize: 2 })
          .then(html => html.replace(/<br\s*\/?>\s*$/, ''));
      } catch(_) {
        return escHtml(text);
      }
    }
    return escHtml(text);
  }));

  // Bail if a newer run has started while we were awaiting colorize
  if (gen !== _showXPathGen) return;

  body.innerHTML = serialized.map(({ type }, i) => {
    const typeLabel = type === 'node' ? 'Node' : type === 'text' ? 'Text' : 'Value';
    return `<div class="xpath-result-item">
      <span class="xpath-result-num">${i + 1}</span>
      <pre class="xpath-result-content">${colorized[i]}</pre>
      <span class="xpath-result-type ${type}">${typeLabel}</span>
    </div>`;
  }).join('');
}

// ── Clear results, highlights, and restore output section ─────────────────────
function clearXPathResults() {
  clearXPathHighlights();
  document.getElementById('xpathResultsPanel')?.classList.remove('visible');
  document.getElementById('outputSection')?.classList.remove('xpath-minimized');
  const headerCount = document.getElementById('xpathHeaderCount');
  if (headerCount) { headerCount.style.display = 'none'; headerCount.textContent = ''; }
  setTimeout(() => { eds.out?.layout(); }, 250);
}

// ── Restore output section when a transform runs ──────────────────────────────
function restoreOutputSection() {
  document.getElementById('outputSection')?.classList.remove('xpath-minimized');
  // Collapse XPath results panel and clear editor highlights — mirror of output being minimized during XPath run
  document.getElementById('xpathResultsPanel')?.classList.remove('visible');
  clearXPathHighlights();
}

// ── Clear XPath expression input ──────────────────────────────────────────────
function clearXPathInput() {
  const input = document.getElementById('xpathInput');
  if (input) { input.value = ''; input.focus(); scheduleSave(); }
  clearXPathResults();
}

// ── Copy XPath expression to clipboard ────────────────────────────────────────
function copyXPathInput() {
  const expr = document.getElementById('xpathInput')?.value?.trim();
  if (!expr) return clog('XPath bar is empty — nothing to copy', 'warn');
  const onSuccess = () => clog(`ƒx  Expression copied to clipboard ✓`, 'success');
  const onFail    = () => {
    const ta = document.createElement('textarea');
    ta.value = expr;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = (() => { try { return document.execCommand('copy'); } catch(_) { return false; } })();
    document.body.removeChild(ta);
    ok ? onSuccess() : clog('Clipboard access denied', 'error');
  };
  if (window.navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(expr).then(onSuccess, onFail);
  } else { onFail(); }
}

// ── Copy results to clipboard ──────────────────────────────────────────────────
function copyXPathResults() {
  const body = document.getElementById('xpathResultsBody');
  if (!body) return;
  const text = [...body.querySelectorAll('.xpath-result-content')]
    .map((el, i) => `[${i + 1}] ${el.textContent}`)
    .join('\n' + '─'.repeat(40) + '\n');
  if (!text.trim()) return clog('XPath results are empty — nothing to copy', 'warn');

  const onSuccess = () => clog('XPath results copied to clipboard ✓', 'success');
  const onFail    = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    const ok = (() => { try { return document.execCommand('copy'); } catch(_) { return false; } })();
    document.body.removeChild(ta);
    ok ? onSuccess() : clog('Clipboard access denied', 'error');
  };

  if (window.navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess, onFail);
  } else { onFail(); }
}