// ════════════════════════════════════════════
//  MONACO INIT
// ════════════════════════════════════════════
require.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
});

document.getElementById('loadTxt').textContent = 'Loading Monaco Editor…';

require(['vs/editor/editor.main'], () => {
  document.getElementById('loadTxt').textContent = 'Defining theme…';

  const _darkThemeDef = {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // XML structure
      { token: 'delimiter.xml',         foreground: '4a6080' },           // < > / =  — muted steel
      { token: 'metatag.xml',           foreground: 'f472b6' },           // <?xml ?>  — pink

      // Tags & attribute names — base colors (inline decorations override these per-element)
      { token: 'tag',                   foreground: '56b6c2', fontStyle: 'bold' },
      { token: 'tag.id.pug',            foreground: '56b6c2' },
      { token: 'attribute.name',        foreground: 'c084fc' },  // lavender — matches xml-attr-name
      { token: 'attribute.name.html',   foreground: 'c084fc' },

      // Attribute values / strings — soft lime green
      { token: 'attribute.value',       foreground: 'a8e06a' },
      { token: 'attribute.value.html',  foreground: 'a8e06a' },
      { token: 'string',                foreground: 'a8e06a' },
      { token: 'string.xml',            foreground: 'a8e06a' },

      // XSL-specific: namespace prefixes in attribute values
      { token: 'attribute.value.xpath', foreground: 'fbbf24' },           // XPath expressions — amber

      // Comments — dim and italic
      { token: 'comment',               foreground: '3d5470', fontStyle: 'italic' },
      { token: 'comment.xml',           foreground: '3d5470', fontStyle: 'italic' },

      // Numbers
      { token: 'number',                foreground: 'e8c56d' },

      // CDATA / entities
      { token: 'entity.xml',            foreground: 'c084fc' },           // purple
    ],
    colors: {
      'editor.background':                  '#070c14',
      'editor.foreground':                  '#c8d8e8',
      'editorLineNumber.foreground':        '#1e3050',
      'editorLineNumber.activeForeground':  '#4a70a8',
      'editor.lineHighlightBackground':     '#0c1826',
      'editor.lineHighlightBorderColor':    '#182030',
      'editorCursor.foreground':            '#0070f2',
      'editor.selectionBackground':         '#183060',
      'editor.inactiveSelectionBackground': '#10203a',
      'editorIndentGuide.background1':      '#182030',
      'editorIndentGuide.background2':      '#182030',
      'editorIndentGuide.background3':      '#182030',
      'editorIndentGuide.background4':      '#182030',
      'editorIndentGuide.background5':      '#182030',
      'editorIndentGuide.background6':      '#182030',
      'editorIndentGuide.activeBackground1':'#1e3050',
      'editorIndentGuide.activeBackground2':'#1e3050',
      'editorIndentGuide.activeBackground3':'#1e3050',
      'editorIndentGuide.activeBackground4':'#1e3050',
      'editorIndentGuide.activeBackground5':'#1e3050',
      'editorIndentGuide.activeBackground6':'#1e3050',
      'editorBracketHighlight.foreground1': '#2e6db4',
      'editorBracketHighlight.foreground2': '#2e8b4a',
      'editorBracketHighlight.foreground3': '#b47a2e',
      'editorBracketHighlight.foreground4': '#7a2eb4',
      'editorBracketHighlight.foreground5': '#2eb4b4',
      'editorBracketHighlight.foreground6': '#b42e5a',
      'scrollbarSlider.background':         '#182030aa',
      'scrollbarSlider.hoverBackground':    '#1e3050aa',
      'editorWidget.background':            '#0d1420',
      'input.background':                   '#0a1020',
      'dropdown.background':                '#0d1420',
    }
  };

  const _lightThemeDef = {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'tag',             foreground: '0550ae' },
      { token: 'attribute.name',  foreground: '116329' },
      { token: 'attribute.value', foreground: '0a3069' },
      { token: 'string',          foreground: '0a3069' },
      { token: 'delimiter.xml',   foreground: '8090a0' },
      { token: 'metatag.xml',     foreground: 'a626a4' },
      { token: 'comment',         foreground: '6a737d', fontStyle: 'italic' },
      { token: 'number',          foreground: 'b5521a' },
    ],
    colors: {
      'editor.background':                  '#ffffff',
      'editor.foreground':                  '#1a2535',
      'editorLineNumber.foreground':        '#c0cfe0',
      'editorLineNumber.activeForeground':  '#6080a0',
      'editor.lineHighlightBackground':     '#f0f6ff',
      'editor.lineHighlightBorderColor':    '#d8e8f8',
      'editorCursor.foreground':            '#0070f2',
      'editor.selectionBackground':         '#b8d4f8',
      'editor.inactiveSelectionBackground': '#d8e8f8',
      'editorIndentGuide.background1':      '#e0e8f0',
      'editorIndentGuide.background2':      '#e0e8f0',
      'editorIndentGuide.background3':      '#e0e8f0',
      'editorIndentGuide.background4':      '#e0e8f0',
      'editorIndentGuide.background5':      '#e0e8f0',
      'editorIndentGuide.background6':      '#e0e8f0',
      'editorIndentGuide.activeBackground1':'#b0c4d8',
      'editorIndentGuide.activeBackground2':'#b0c4d8',
      'editorIndentGuide.activeBackground3':'#b0c4d8',
      'editorIndentGuide.activeBackground4':'#b0c4d8',
      'editorIndentGuide.activeBackground5':'#b0c4d8',
      'editorIndentGuide.activeBackground6':'#b0c4d8',
      'editorBracketHighlight.foreground1': '#2e6db4',
      'editorBracketHighlight.foreground2': '#1a7f37',
      'editorBracketHighlight.foreground3': '#c87800',
      'editorBracketHighlight.foreground4': '#6f42c1',
      'editorBracketHighlight.foreground5': '#0969a0',
      'editorBracketHighlight.foreground6': '#cf222e',
      'scrollbarSlider.background':         '#c0cfe0aa',
      'scrollbarSlider.hoverBackground':    '#a8bcd4aa',
      'editorWidget.background':            '#f0f4f8',
      'input.background':                   '#ffffff',
      'dropdown.background':                '#f0f4f8',
    }
  };

  monaco.editor.defineTheme('xforge',       _darkThemeDef);
  monaco.editor.defineTheme('xforge-light', _lightThemeDef);

  // Apply saved theme to Monaco if light was restored from localStorage
  if (document.body.classList.contains('light')) {
    monaco.editor.setTheme('xforge-light');
  }

  // Override XML language to remove <> auto-close (our custom handler does tags)
  monaco.languages.setLanguageConfiguration('xml', {
    autoClosingPairs: [],
    surroundingPairs: [],
  });

  const shared = {
    theme: document.body.classList.contains('light') ? 'xforge-light' : 'xforge',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 13,
    lineHeight: 22,
    minimap: { enabled: false },
    glyphMargin: true,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    folding: true,
    renderLineHighlight: 'all',
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
    guides: { bracketPairs: 'active', indentation: true, highlightActiveIndentation: true },
    padding: { top: 10, bottom: 10 },
    wordWrap: 'off',
    suggest: { showWords: false },
    'semanticHighlighting.enabled': true,
  };

  // ── Restore saved session (if any) ──
  const _savedSession = loadSavedState();

  eds.xml = monaco.editor.create(
    document.getElementById('xmlEd'),
    { ...shared, language: 'xml', value: _savedSession?.xml ?? EXAMPLES.identityTransform.xml }
  );

  eds.xslt = monaco.editor.create(
    document.getElementById('xsltEd'),
    { ...shared, language: 'xml', value: _savedSession?.xslt ?? EXAMPLES.identityTransform.xslt }
  );

  eds.out = monaco.editor.create(
    document.getElementById('outEd'),
    { ...shared, language: 'xml', value: '', readOnly: true, renderValidationDecorations: 'off' }
  );

  // Ctrl/Cmd+Enter → run
  [eds.xml, eds.xslt].forEach(ed => {
    ed.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      runTransform
    );
  });

  // Set up drag & drop for XML and XSLT panes
  setupDragDrop('xmlEdWrap', 'xml');
  setupDragDrop('xsltEdWrap', 'xslt');

  // ── Auto-close XML tags for xml language mode ──
  // Combined auto-close handler: XML tags + bracket/quote pairs
  // Implemented manually because Monaco's built-in only works for 'html' mode.
  function setupAutoClose(editor) {
    let _inserting = false;

    const PAIRS = { '(': ')', '[': ']', '"': '"' };

    // Single onKeyDown handles: < intercept, bracket/quote pairs, skip-over
    editor.onKeyDown(e => {
      if (_inserting) return;
      const ch = e.browserEvent.key;

      // ── Block Monaco's built-in <> auto-pair ──
      if (ch === '<') {
        e.preventDefault();
        const pos = editor.getPosition();
        _inserting = true;
        editor.executeEdits('insert-lt', [{
          range: {
            startLineNumber: pos.lineNumber, startColumn: pos.column,
            endLineNumber:   pos.lineNumber, endColumn:   pos.column,
          },
          text: '<',
        }]);
        editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column + 1 });
        _inserting = false;
        return;
      }

      // ── Bracket / quote pairs ──
      if (PAIRS[ch]) {
        const model = editor.getModel();
        const sel   = editor.getSelection();
        const pos   = editor.getPosition();

        // Wrap selected text
        const selectedText = sel && !sel.isEmpty() ? model.getValueInRange(sel) : null;
        if (selectedText !== null) {
          e.preventDefault();
          _inserting = true;
          editor.executeEdits('auto-pair', [{ range: sel, text: ch + selectedText + PAIRS[ch] }]);
          editor.setPosition({ lineNumber: sel.endLineNumber, column: sel.endColumn + 1 });
          _inserting = false;
          return;
        }

        // Skip over existing closing char
        const lineText = model.getLineContent(pos.lineNumber);
        const nextChar = lineText[pos.column - 1];
        if (nextChar === PAIRS[ch]) {
          e.preventDefault();
          editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column + 1 });
          return;
        }

        // Insert pair
        e.preventDefault();
        _inserting = true;
        editor.executeEdits('auto-pair', [{
          range: {
            startLineNumber: pos.lineNumber, startColumn: pos.column,
            endLineNumber:   pos.lineNumber, endColumn:   pos.column,
          },
          text: ch + PAIRS[ch],
        }]);
        editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column + 1 });
        _inserting = false;
        return;
      }

      // ── Skip-over ) and ] ──
      if (ch === ')' || ch === ']') {
        const pos      = editor.getPosition();
        const lineText = editor.getModel().getLineContent(pos.lineNumber);
        if (lineText[pos.column - 1] === ch) {
          e.preventDefault();
          editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column + 1 });
        }
      }

      // ── Attribute = → ="" with cursor between quotes ──
      // Only fires when '=' is typed right after a word character (attribute name)
      if (ch === '=') {
        const pos      = editor.getPosition();
        const model    = editor.getModel();
        const lineText = model.getLineContent(pos.lineNumber);
        const charBefore = lineText[pos.column - 2]; // char just before cursor
        const charAfter  = lineText[pos.column - 1]; // char just after cursor

        // Only trigger inside a tag opener: prev char is word char, next is not already "
        // and there must be an unclosed '<' before the cursor on this line
        const lineUpToCursor = lineText.substring(0, pos.column - 1);
        const inTag = (lineUpToCursor.lastIndexOf('<') > lineUpToCursor.lastIndexOf('>'));
        if (/\w/.test(charBefore) && charAfter !== '"' && inTag) {
          e.preventDefault();
          _inserting = true;
          editor.executeEdits('attr-equals', [{
            range: {
              startLineNumber: pos.lineNumber, startColumn: pos.column,
              endLineNumber:   pos.lineNumber, endColumn:   pos.column,
            },
            text: '=""',
          }]);
          // Place cursor between the quotes
          editor.setPosition({ lineNumber: pos.lineNumber, column: pos.column + 2 });
          _inserting = false;
        }
      }
    });

    // ── XML auto-close tags ──
    editor.onDidChangeModelContent(ev => {
      if (_inserting) return;
      for (const change of ev.changes) {
        if (change.text !== '>') continue;
        const model    = editor.getModel();
        const pos      = editor.getPosition();
        const before   = model.getLineContent(pos.lineNumber).substring(0, pos.column - 1);
        if (!before.endsWith('>') || before.endsWith('/>')) continue;
        if (/<\/[^>]+>$/.test(before)) continue;
        const m = before.match(/<([a-zA-Z_][a-zA-Z0-9_:.-]*)(?:\s[^>]*)?>$/);
        if (!m) continue;
        _inserting = true;
        editor.executeEdits('auto-close-tag', [{
          range: {
            startLineNumber: pos.lineNumber, startColumn: pos.column,
            endLineNumber:   pos.lineNumber, endColumn:   pos.column,
          },
          text: '</' + m[1] + '>',
          forceMoveMarkers: false,
        }]);
        editor.setPosition(pos);
        _inserting = false;
      }
    });
  }

  setupAutoClose(eds.xml);
  setupAutoClose(eds.xslt);


  // Debounced live validation — runs 800ms after the user stops typing

  function runXsltValidation() {
    const src = eds.xslt.getValue().trim();
    if (!src) { clearAllMarkers(); return; }
    // Only validate the XSLT itself for well-formedness here
    monaco.editor.setModelMarkers(eds.xslt.getModel(), 'xsltforge', []);
    if (xsltDecorations) { xsltDecorations.clear(); xsltDecorations = null; }
    const result = validateXML(src);
    if (!result.ok) {
      xsltDecorations = markErrorLine(eds.xslt, result.line, result.message);
      setStatus(`XSLT error at line ${result.line}`, 'err');
    } else {
      // Only reset status if we're not mid-transform
      const current = document.getElementById('statTxt').textContent;
      if (current.startsWith('XSLT error')) setStatus('Ready', 'ok');
    }
  }

  function runXmlValidation() {
    const src = eds.xml.getValue().trim();
    if (!src) {
      monaco.editor.setModelMarkers(eds.xml.getModel(), 'xsltforge', []);
      if (xmlDecorations) { xmlDecorations.clear(); xmlDecorations = null; }
      const current = document.getElementById('statTxt').textContent;
      if (current.startsWith('XML error')) setStatus('Ready', 'ok');
      return;
    }
    monaco.editor.setModelMarkers(eds.xml.getModel(), 'xsltforge', []);
    if (xmlDecorations) { xmlDecorations.clear(); xmlDecorations = null; }
    const result = validateXML(src);
    if (!result.ok) {
      xmlDecorations = markErrorLine(eds.xml, result.line, result.message);
      setStatus(`XML error at line ${result.line}`, 'err');
    } else {
      const current = document.getElementById('statTxt').textContent;
      if (current.startsWith('XML error')) setStatus('Ready', 'ok');
    }
  }

  eds.xslt.onDidChangeModelContent(() => {
    scheduleSave();
    if (_suppressNextValidation) { _suppressNextValidation = false; return; }
    // Clear immediately so stale markers don't linger while user types
    monaco.editor.setModelMarkers(eds.xslt.getModel(), 'xsltforge', []);
    if (xsltDecorations) { xsltDecorations.clear(); xsltDecorations = null; }
    clearTimeout(xsltDebounce);
    xsltDebounce = setTimeout(runXsltValidation, 800);
  });

  eds.xml.onDidChangeModelContent(() => {
    scheduleSave();
    if (_suppressNextValidation) { _suppressNextValidation = false; return; }
    monaco.editor.setModelMarkers(eds.xml.getModel(), 'xsltforge', []);
    if (xmlDecorations) { xmlDecorations.clear(); xmlDecorations = null; }
    clearTimeout(xmlDebounce);
    xmlDebounce = setTimeout(runXmlValidation, 800);
  });

  document.getElementById('loadTxt').textContent = 'Loading Saxon-JS…';

  // Wait for Saxon-JS
  const checkSaxon = setInterval(() => {
    if (typeof SaxonJS !== 'undefined') {
      clearInterval(checkSaxon);
      saxonReady = true;
      hideLoader();
      clog('Saxon-JS 2.x loaded · XSLT 3.0 engine ready ✓', 'success');
      clog('Shortcut: Ctrl+Enter (Cmd+Enter on Mac) to run transform', 'info');

      // ── Restore persisted session ──
      if (_savedSession) {
        // Restore KV rows
        if (Array.isArray(_savedSession.headers)) {
          _savedSession.headers.forEach(r => {
            kvIdSeq++;
            kvData.headers.push({ id: kvIdSeq, name: r.name, value: r.value });
          });
        }
        if (Array.isArray(_savedSession.properties)) {
          _savedSession.properties.forEach(r => {
            kvIdSeq++;
            kvData.properties.push({ id: kvIdSeq, name: r.name, value: r.value });
          });
        }
        // Restore column collapse states
        if (_savedSession.leftCollapsed)  document.getElementById('colLeft')?.classList.add('collapsed');
        if (!_savedSession.rightCollapsed) document.getElementById('colRight')?.classList.remove('collapsed');
        // Relay Monaco after potential column changes
        setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 260);

        const ago = _savedSession.savedAt
          ? (() => {
              const diff = Math.round((Date.now() - _savedSession.savedAt) / 1000);
              if (diff < 60)   return `${diff}s ago`;
              if (diff < 3600) return `${Math.round(diff/60)}m ago`;
              return `${Math.round(diff/3600)}h ago`;
            })()
          : '';
        clog(`Session restored${ago ? ' · saved ' + ago : ''} ✓`, 'success');
      } else {
        clog('Identity Transform loaded. Use Examples menu to load CPI scenarios.', 'info');
      }

      renderKV('headers');
      renderKV('properties');
      renderOutputKV({}, {});
      setStatus('Ready', 'ok');
    }
  }, 200);

  // Timeout fallback
  setTimeout(() => {
    if (!saxonReady) {
      clearInterval(checkSaxon);
      hideLoader();
      clog('⚠ Saxon-JS failed to load. Check your internet connection.', 'error');
      setStatus('Saxon-JS unavailable', 'err');
    }
  }, 12000);
});

function hideLoader() {
  const el = document.getElementById('loadingOverlay');
  el.classList.add('hidden');
  setTimeout(() => el.remove(), 600);
}
