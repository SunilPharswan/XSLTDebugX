// ════════════════════════════════════════════
//  PANE OPERATIONS
// ════════════════════════════════════════════


function clearPane(which) {
  const ed = which === 'xml' ? eds.xml : which === 'xslt' ? eds.xslt : eds.out;
  if (!ed) return;
  const wasReadOnly = ed.getRawOptions().readOnly;
  if (wasReadOnly) ed.updateOptions({ readOnly: false });
  ed.setValue('');
  if (wasReadOnly) ed.updateOptions({ readOnly: true });
  // Clear error markers from this pane
  if (which === 'xml'  && eds.xml)  {
    monaco.editor.setModelMarkers(eds.xml.getModel(),  'xsltforge', []);
    if (xmlDecorations)  { xmlDecorations.clear();  xmlDecorations  = null; }
    setStatus('Ready', 'ok');
  }
  if (which === 'xslt' && eds.xslt) {
    monaco.editor.setModelMarkers(eds.xslt.getModel(), 'xsltforge', []);
    if (xsltDecorations) { xsltDecorations.clear(); xsltDecorations = null; }
    setStatus('Ready', 'ok');
  }
  // Clear output KV panels when output is cleared
  if (which === 'out') renderOutputKV({}, {});
  scheduleSave();
}

function copyPane(which) {
  const ed = which === 'xml' ? eds.xml : which === 'xslt' ? eds.xslt : eds.out;
  const v  = ed?.getValue() ?? '';
  if (!v.trim()) return clog('Nothing to copy', 'warn');
  navigator.clipboard.writeText(v)
    .then(() => clog(`${which.toUpperCase()} copied to clipboard ✓`, 'success'))
    .catch(() => clog('Clipboard access denied', 'error'));
}

function prettyXML(xml) {
  // Tokenise with a regex that captures each XML token whole,
  // then decide indentation per token type.
  try {
    const INDENT = '  ';
    // Strip inter-tag whitespace so we start clean
    xml = xml.replace(/>\s+</g, '><').trim();

    // Token regex — handles attribute values containing > or < via ATTR_VAL,
    // and avoids the separate self-closing branch that caused ambiguity when
    // TAG_INNER consumed / characters inside attribute values.
    //
    //   PI / declaration   <?...?>
    //   comment            <!--...-->
    //   CDATA              <![CDATA[...]]>
    //   closing tag        </foo>
    //   any other tag      <foo ...>  or  <foo .../>
    //   text               anything else
    //
    // ATTR_VAL matches "..." or '...' to skip > chars inside quoted values.
    // [^<>] ensures TAG_INNER never crosses a tag boundary.
    const ATTR_VAL  = `"[^"]*"|'[^']*'`;
    const TAG_INNER = `(?:${ATTR_VAL}|[^<>])*`;
    const TOKEN_RE  = new RegExp(
      `<\\?[\\s\\S]*?\\?>` +                   // PI / XML declaration
      `|<!--[\\s\\S]*?-->` +                    // comment
      `|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>` +       // CDATA section
      `|</${TAG_INNER}>` +                      // closing tag  </foo>
      `|<${TAG_INNER}>` +                       // opening or self-closing tag
      `|[^<]+`,                                  // text node
      'g'
    );
    const tokens = xml.match(TOKEN_RE) || [];

    let out   = '';
    let depth = 0;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (!tok.trim()) continue;

      const isClose     = tok.startsWith('</');
      const isSelfClose = !isClose && tok.endsWith('/>');
      const isPI        = tok.startsWith('<?') || tok.startsWith('<!--') || tok.startsWith('<!');

      if (isClose) {
        // Closing tag — dedent before printing
        depth = Math.max(0, depth - 1);
        out += INDENT.repeat(depth) + tok + '\n';

      } else if (isSelfClose || isPI) {
        // Self-closing tag, PI, comment, CDATA — no depth change
        out += INDENT.repeat(depth) + tok + '\n';

      } else {
        // Opening tag — look ahead for special inline cases
        const nextTok  = tokens[i + 1];
        const afterTok = tokens[i + 2];

        if (nextTok && nextTok.startsWith('</')) {
          // <open></close> — empty element pair, keep on one line
          out += INDENT.repeat(depth) + tok + nextTok + '\n';
          i += 1;

        } else if (nextTok && !nextTok.startsWith('<') && afterTok && afterTok.startsWith('</')) {
          // <open>text</close> — simple inline content, keep on one line
          out += INDENT.repeat(depth) + tok + nextTok.trim() + afterTok + '\n';
          i += 2;

        } else if (nextTok && !nextTok.startsWith('<')) {
          // <open>text<child... — mixed content; emit tag+text prefix, indent children
          const trimmed = nextTok.trim();
          out += INDENT.repeat(depth) + tok + (trimmed ? trimmed + ' ' : '') + '\n';
          depth++;
          i += 1; // text token consumed; child elements follow

        } else {
          // Normal opening tag with child elements
          out += INDENT.repeat(depth) + tok + '\n';
          depth++;
        }
      }
    }

    return out.trim();
  } catch(e) {
    return xml; // fallback: return original if anything goes wrong
  }
}

function fmtEditor(which) {
  const ed = which === 'xml'  ? eds.xml
           : which === 'xslt' ? eds.xslt
           : eds.out;
  if (!ed) return;
  const wasReadOnly = ed.getRawOptions().readOnly;
  if (wasReadOnly) ed.updateOptions({ readOnly: false });
  const formatted = prettyXML(ed.getValue());
  // Suppress the live-validation debounce — formatting doesn't change validity
  _suppressNextValidation = true;
  ed.setValue(formatted);
  if (wasReadOnly) ed.updateOptions({ readOnly: true });
  scheduleSave();
  clog(`${which.toUpperCase()} formatted`, 'info');
}

// Flag read by debounce handlers to skip one validation cycle after Format
let _suppressNextValidation = false;

