// ════════════════════════════════════════════
//  CPI HEADER / PROPERTY SIMULATION
// ════════════════════════════════════════════

// 1. Extract static string values from cpi:setHeader / cpi:setProperty calls
function extractCPICalls(xslt) {
  const result = { headers: {}, properties: {} };
  const hRe = /cpi:setHeader\s*\(\s*\$\w+\s*,\s*'([^']+)'\s*,\s*'([^']*)'\s*\)/g;
  const pRe = /cpi:setProperty\s*\(\s*\$\w+\s*,\s*'([^']+)'\s*,\s*'([^']*)'\s*\)/g;
  let m;
  while ((m = hRe.exec(xslt)) !== null) result.headers[m[1]]    = m[2];
  while ((m = pRe.exec(xslt)) !== null) result.properties[m[1]] = m[2];
  return result;
}

// 2. Remove the cpi: namespace declaration and rewrite cpi:setXxx calls
//    so Saxon-JS never sees the unknown function.
//    Strategy: remove xmlns:cpi="..." and replace the full xsl:value-of
//    element with a harmless empty string select.
function stripCPICalls(xslt) {
  // 1. Remove xmlns:cpi namespace declaration (double or single quoted)
  xslt = xslt.replace(/\s*xmlns:cpi\s*=\s*(?:"[^"]*"|'[^']*')/g, '');
  // 2. Remove 'cpi' from exclude-result-prefixes — Saxon-JS errors on undeclared prefixes
  //    even in exclude-result-prefixes, so this must be cleaned up after step 1 removes xmlns:cpi
  xslt = xslt.replace(/(exclude-result-prefixes\s*=\s*")([^"]*)"/g, (_, attr, val) => {
    const cleaned = val.split(/\s+/).filter(p => p !== 'cpi').join(' ');
    return attr + cleaned + '"';
  });
  // 3. Remove self-closing: <xsl:value-of select="cpi:setXxx(...)"/>
  //    Use ATTR_VAL-aware inner match so > inside select value doesn't break the regex
  xslt = xslt.replace(/<xsl:value-of(?:\s+(?:"[^"]*"|'[^']*'|[^<>])*?)?\s+select\s*=\s*"cpi:set[^"]*"(?:\s+(?:"[^"]*"|'[^']*'|[^<>])*?)?\/>/g, '');
  // 4. Remove open+close form: <xsl:value-of select="cpi:setXxx(...)"></xsl:value-of>
  xslt = xslt.replace(/<xsl:value-of(?:\s+(?:"[^"]*"|'[^']*'|[^<>])*?)?\s+select\s*=\s*"cpi:set[^"]*"(?:\s+(?:"[^"]*"|'[^']*'|[^<>])*?)?>[^<]*<\/xsl:value-of>/g, '');
  return xslt;
}

// 3. Build the stylesheet-params map fragment for XPath transform()
// Valid XML NCName: must start with letter or underscore, then letters/digits/.-_
function isValidNCName(name) {
  return /^[A-Za-z_][\w.\-]*$/.test(name);
}

function buildParamsXPath() {
  const entries = [];
  const skipped = [];
  // Inject a dummy $exchange so stylesheets that declare it don't get an error
  entries.push(`QName('','exchange'): 'exchange'`);
  // Pass all named input headers and properties
  [...kvData.headers, ...kvData.properties].forEach(row => {
    const k = row.name.trim();
    const v = row.value.trim().replace(/'/g, "''");
    if (!k) return;
    if (!isValidNCName(k)) {
      skipped.push(k);
      return; // skip invalid names silently here, warn after
    }
    entries.push(`QName('','${k}'): '${v}'`);
  });
  if (skipped.length) {
    // Warn — but don't block the transform
    skipped.forEach(n =>
      clog(`Warning: header/property "${n}" skipped — not a valid xsl:param name (must start with a letter or underscore)`, 'warn')
    );
  }
  return `, 'stylesheet-params': map { ${entries.join(', ')} }`;
}

// 4. Render the read-only output panels
function renderOutputKV(headers, properties) {
  const render = (rowsId, countId, data) => {
    const keys = Object.keys(data);
    document.getElementById(countId).textContent = keys.length;
    document.getElementById(rowsId).innerHTML = keys.length
      ? keys.map(k =>
          `<div class="kv-row-out">
            <span class="kv-k">${escHtml(k)}</span>
            <span class="kv-v">${escHtml(data[k])}</span>
          </div>`).join('')
      : '<div class="kv-empty">— none —</div>';
  };
  render('outHdrRows',  'outHdrCount',  headers);
  render('outPropRows', 'outPropCount', properties);
}

// ════════════════════════════════════════════
//  KV PANEL MANAGEMENT
// ════════════════════════════════════════════
function toggleKVPanel(panelId) {
  document.getElementById(panelId).classList.toggle('collapsed');
}

function addKVRow(type) {
  const id = ++kvIdSeq;
  kvData[type].push({ id, name: '', value: '' });
  renderKV(type);
  scheduleSave();
}

function deleteKVRow(type, id) {
  kvData[type] = kvData[type].filter(r => r.id !== id);
  renderKV(type);
  scheduleSave();
}

function updateKV(type, id, field, val) {
  const row = kvData[type].find(r => r.id === id);
  if (row) row[field] = val;
  const countId = type === 'headers' ? 'hdrCount' : 'propCount';
  document.getElementById(countId).textContent =
    kvData[type].filter(r => r.name.trim()).length;
  scheduleSave();
}

function renderKV(type) {
  const isHdr   = type === 'headers';
  const rowsEl  = document.getElementById(isHdr ? 'hdrRows'  : 'propRows');
  const countEl = document.getElementById(isHdr ? 'hdrCount' : 'propCount');
  const rows    = kvData[type];
  countEl.textContent = rows.filter(r => r.name.trim()).length;
  rowsEl.innerHTML = rows.length === 0
    ? '<div class="kv-empty">Click + to add</div>'
    : rows.map(r => `
        <div class="kv-row">
          <input value="${escHtml(r.name)}" placeholder="name"
            oninput="updateKV('${type}',${r.id},'name',this.value)"/>
          <input value="${escHtml(r.value)}" placeholder="value"
            oninput="updateKV('${type}',${r.id},'value',this.value)"/>
          <button class="kv-del-btn" onclick="deleteKVRow('${type}',${r.id})">×</button>
        </div>`).join('');
}

// ════════════════════════════════════════════
//  TRANSFORM
// ════════════════════════════════════════════
function runTransform() {
  if (!saxonReady) { clog('Saxon-JS not ready yet', 'error'); return; }

  // Reset error badge for fresh run
  consoleErrCount = 0;
  updateConsoleErrBadge();

  const btn = document.getElementById('runBtn');
  function resetBtn() {
    btn.disabled = false;
    btn.innerHTML = `<svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
      <path d="M3 1.5l11 6.5-11 6.5V1.5z"/></svg> Run Transform <span class="kbd">⌘↵</span>`;
  }

  btn.disabled = true;
  setStatus('Transforming…', 'busy');

  const xmlSrc = eds.xml?.getValue()?.trim();
  let xsltSrc  = eds.xslt?.getValue()?.trim();

  if (!xmlSrc)  { clog('XML Source is empty',       'error'); resetBtn(); return; }
  if (!xsltSrc) { clog('XSLT Stylesheet is empty',  'error'); resetBtn(); return; }

  // ── Pre-flight validation ──
  setStatus('Validating…', 'busy');
  if (!preflight(xmlSrc, xsltSrc)) {
    resetBtn();
    return;
  }

  const t0 = performance.now();
  clog(`Starting XSLT transform — XML ${xmlSrc.length} chars · XSLT ${xsltSrc.length} chars`, 'info');

  // Extract cpi: calls BEFORE stripping so we can show them in output panels
  const hasCPI   = /cpi:set(?:Header|Property)/.test(xsltSrc);
  const cpiCalls = hasCPI ? extractCPICalls(xsltSrc) : { headers: {}, properties: {} };
  if (hasCPI) {
    xsltSrc = stripCPICalls(xsltSrc);
    const _hc = Object.keys(cpiCalls.headers).length;
    const _pc = Object.keys(cpiCalls.properties).length;
    const _parts = ['CPI extension calls detected'];
    if (_hc) _parts.push(`${_hc} header${_hc > 1 ? 's' : ''}`);
    if (_pc) _parts.push(`${_pc} propert${_pc > 1 ? 'ies' : 'y'}`);
    if (!_hc && !_pc) _parts.push('dynamic values only — output panels will show — none —');
    clog(_parts.join(' — '), 'info');
  }

  // Log which params are being passed
  const namedParams = [...kvData.headers, ...kvData.properties].filter(r => r.name.trim());
  if (namedParams.length) {
    clog(`Passing xsl:params: ${namedParams.map(r => r.name).join(', ')}`, 'info');
  }

  const paramsXPath = buildParamsXPath();

  // ── Intercept xsl:message output ──────────────────────────────────────────
  // Saxon-JS routes xsl:message to console.log("xsl:message: <text>").
  // Temporarily patch console.log to capture those and route them to clog.
  const _xslMessages  = [];
  const _origConsoleLog = console.log;
  console.log = function(...args) {
    const first = args[0];
    if (typeof first === 'string' && first.startsWith('xsl:message: ')) {
      _xslMessages.push(first.slice(13));
    } else {
      _origConsoleLog.apply(console, args);
    }
  };

  try {
    const output = SaxonJS.XPath.evaluate(
      `transform(map {
        'stylesheet-text' : $xslt,
        'source-node'     : parse-xml($xml),
        'delivery-format' : 'serialized'
        ${paramsXPath}
      })?output`,
      [],
      { params: { xslt: xsltSrc, xml: xmlSrc } }
    );

    const elapsed = (performance.now() - t0).toFixed(1);

    // Flush xsl:message lines before completion log — fires in natural execution order
    _xslMessages.forEach(m => clog(`xsl:message → ${m}`, 'warn'));

    eds.out.updateOptions({ readOnly: false });
    eds.out.setValue(output.trimStart().startsWith('<') ? prettyXML(output) : output);
    eds.out.updateOptions({ readOnly: true });

    // Show output panels: CPI-set values take priority, then pass-through input headers + properties
    const outHdrs  = { ...cpiCalls.headers };
    const outProps = { ...cpiCalls.properties };
    kvData.headers.filter(r => r.name.trim() && !(r.name in outHdrs))
                  .forEach(r => { outHdrs[r.name] = r.value; });
    kvData.properties.filter(r => r.name.trim() && !(r.name in outProps))
                     .forEach(r => { outProps[r.name] = r.value; });
    renderOutputKV(outHdrs, outProps);

    clog(`Transform complete in ${elapsed} ms ✓`, 'success');
    setStatus(`Done · ${elapsed} ms`, 'ok');

    // Auto-expand output pane on first successful run
    const colRight = document.getElementById('colRight');
    if (colRight.classList.contains('collapsed')) {
      colRight.classList.remove('collapsed');
      scheduleSave();
      setTimeout(() => {
        eds.xml?.layout();
        eds.xslt?.layout();
        eds.out?.layout();
      }, 250);
    }

  } catch (err) {
    // Flush xsl:message lines before error — trace should precede the failure it caused
    _xslMessages.forEach(m => clog(`xsl:message → ${m}`, 'warn'));

    const fullMsg = err.message || String(err);
    const msg = fullMsg.split('\n')[0];

    // Detect terminate="yes" — Saxon throws "Terminated with <message text>"
    // Log it as a warn (not error) since it's an intentional halt, not a bug.
    // Error-highlight block is skipped — there's no broken line to mark.
    const terminateMatch = msg.match(/^Terminated with (.+)$/i);
    if (terminateMatch) {
      clog(`xsl:message terminate="yes" — ${terminateMatch[1]}`, 'warn');
    } else {
      clog(`Error: ${msg}`, 'error');
      // Try to highlight the offending line in the XSLT editor
      const errLine = parseSaxonErrorLine(fullMsg);
      if (errLine) {
        xsltDecorations = markErrorLine(eds.xslt, errLine, msg, xsltDecorations);
        clog(`↳ Error at line ${errLine} (highlighted in XSLT editor)`, 'error');
      }
    }

    setStatus('Transform failed', 'err');
  } finally {
    // Always restore console.log — even if Saxon throws
    // Messages already flushed above in try/catch at the right point in the log order
    console.log = _origConsoleLog;
  }

  resetBtn();
}


