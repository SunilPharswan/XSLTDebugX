// ════════════════════════════════════════════
//  XSLT VALIDATION & MONACO MARKERS
// ════════════════════════════════════════════

// Track decoration collections per editor
let xsltDecorations = null;
let xmlDecorations  = null;

// Clear all markers and decorations from both editors
function clearAllMarkers() {
  monaco.editor.setModelMarkers(eds.xslt.getModel(), 'xsltforge', []);
  monaco.editor.setModelMarkers(eds.xml.getModel(),  'xsltforge', []);
  if (xsltDecorations) { xsltDecorations.clear(); xsltDecorations = null; }
  if (xmlDecorations)  { xmlDecorations.clear();  xmlDecorations  = null; }
}

// Set a red squiggle + glyph on a specific line in an editor
function markErrorLine(editor, lineNumber, message, oldDecor) {
  // Always clear the previous decoration collection before creating a new one
  if (oldDecor) { try { oldDecor.clear(); } catch(e) {} }
  const model = editor.getModel();
  const lineCount = model.getLineCount();
  const line = Math.min(Math.max(lineNumber, 1), lineCount);
  const lineLen = model.getLineLength(line);

  // Monaco marker (squiggle underline)
  monaco.editor.setModelMarkers(model, 'xsltforge', [{
    startLineNumber: line, startColumn: 1,
    endLineNumber:   line, endColumn: lineLen + 1,
    message,
    severity: monaco.MarkerSeverity.Error,
  }]);

  // Glyph + line background decoration
  const dec = editor.createDecorationsCollection([
    {
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: 'xf-error-line-bg',
        glyphMarginClassName: 'xf-error-glyph',
        glyphMarginHoverMessage: { value: '**Error:** ' + message },
      }
    }
  ]);

  // Scroll to the error line
  editor.revealLineInCenter(line);

  return dec;
}

// Try to parse XML using DOMParser; return { ok, line, col, message }
function validateXML(src) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(src, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (!err) return { ok: true };

  // Firefox/Chrome put the error text in the parsererror element
  const text = err.textContent || '';

  // Try to extract line number — format varies by browser
  // Chrome:  "error on line 7 at column 3"
  // Firefox: "XML Parsing Error: ... Line Number 7, Column 3"
  let line = 1, col = 1;
  const lineMatch = text.match(/line[\s:]+([0-9]+)/i) ||
                    text.match(/Line Number\s+([0-9]+)/i);
  const colMatch  = text.match(/column[\s:]+([0-9]+)/i) ||
                    text.match(/Column\s+([0-9]+)/i);
  if (lineMatch) line = parseInt(lineMatch[1]);
  if (colMatch)  col  = parseInt(colMatch[1]);

  // Clean up the message — strip leading <?xml...?> declaration if present
  const message = text.replace(/<\?xml[^?]*\?>\s*/i, '').trim().split('\n')[0].trim();
  return { ok: false, line, col, message };
}

// Parse Saxon error message to extract line number
// Formats seen:
//   "on line 7 in /NoStylesheetBaseURI"
//   "at line 7"
//   "line 7 column 3"
function parseSaxonErrorLine(msg) {
  const m = msg.match(/(?:on|at)\s+line\s+(\d+)/i) ||
            msg.match(/line\s+(\d+)/i);
  return m ? parseInt(m[1]) : null;
}

// Pre-flight: validate XML source and XSLT structure before running Saxon
// Returns true if OK to proceed, false if a blocking error was found
function preflight(xmlSrc, xsltSrc) {
  clearAllMarkers();
  let ok = true;

  // 1. Validate XML source
  const xmlResult = validateXML(xmlSrc);
  if (!xmlResult.ok) {
    clog(`XML parse error at line ${xmlResult.line}: ${xmlResult.message}`, 'error');
    xmlDecorations = markErrorLine(eds.xml, xmlResult.line, xmlResult.message, xmlDecorations);
    ok = false;
  }

  // 2. Validate XSLT — must be well-formed XML first
  const xsltResult = validateXML(xsltSrc);
  if (!xsltResult.ok) {
    clog(`XSLT parse error at line ${xsltResult.line}: ${xsltResult.message}`, 'error');
    xsltDecorations = markErrorLine(eds.xslt, xsltResult.line, xsltResult.message, xsltDecorations);
    ok = false;
  }

  if (!ok) {
    setStatus('Validation failed — fix errors before running', 'err');
  }
  return ok;
}

