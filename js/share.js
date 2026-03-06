// ════════════════════════════════════════════
//  SHARE
// ════════════════════════════════════════════

// ── Encode ──────────────────────────────────

function buildSharePayload(options) {
  const data = {};
  if (options.xml)        data.xml        = eds.xml?.getValue()  ?? '';
  if (options.xslt)       data.xslt       = eds.xslt?.getValue() ?? '';
  if (options.headers)    data.headers    = kvData.headers.map(r => ({ name: r.name, value: r.value }));
  if (options.properties) data.properties = kvData.properties.map(r => ({ name: r.name, value: r.value }));
  return data;
}

function encodeShareData(data) {
  const bytes      = new TextEncoder().encode(JSON.stringify(data));
  const compressed = pako.deflateRaw(bytes, { level: 9 });
  let   binary     = '';
  compressed.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateShareUrl(options) {
  return location.href.split('#')[0] + '#share/' + encodeShareData(buildSharePayload(options));
}

// ── Decode (called on page load) ─────────────

function loadFromShareHash() {
  if (!location.hash.startsWith('#share/')) return false;
  try {
    const b64    = location.hash.slice(7).replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json   = new TextDecoder().decode(pako.inflateRaw(bytes));
    window._pendingShareData = JSON.parse(json);
    history.replaceState(null, '', location.pathname + location.search);
    return true;
  } catch (e) {
    clog('Failed to decode share URL — link may be corrupted', 'error');
    return false;
  }
}

// Called from editor.js after Monaco + Saxon are ready
function applyShareData(data) {
  if (!data) return;

  clearTimeout(xsltDebounce);
  clearTimeout(xmlDebounce);
  _suppressNextValidation = true;
  clearAllMarkers();

  if (data.xml  !== undefined) eds.xml?.setValue(data.xml);
  _suppressNextValidation = true;
  if (data.xslt !== undefined) eds.xslt?.setValue(data.xslt);

  kvData  = { headers: [], properties: [] };
  kvIdSeq = 0;

  (data.headers    || []).forEach(r => { kvIdSeq++; kvData.headers.push(   { id: kvIdSeq, name: r.name, value: r.value }); });
  (data.properties || []).forEach(r => { kvIdSeq++; kvData.properties.push({ id: kvIdSeq, name: r.name, value: r.value }); });

  renderKV('headers');
  renderKV('properties');
  renderOutputKV({}, {});

  eds.out?.updateOptions({ readOnly: false });
  eds.out?.setValue('');
  eds.out?.updateOptions({ readOnly: true });

  clog('Shared session loaded', 'success');
  setStatus('Ready', 'ok');
}

// ── Modal ────────────────────────────────────

let _shareOptions = { xml: true, xslt: true, headers: true, properties: true };

function openShareModal() {
  document.getElementById('shareModalBackdrop').classList.add('open');
  _shareOptions = { xml: true, xslt: true, headers: true, properties: true };

  ['xml','xslt','headers','properties'].forEach(k => {
    const cb = document.getElementById('shareChk-' + k);
    if (cb) cb.checked = _shareOptions[k];
  });

  _refreshShareUrl(true);
}

function closeShareModal() {
  document.getElementById('shareModalBackdrop').classList.remove('open');
}

function handleShareBackdropClick(e) {
  if (e.target === document.getElementById('shareModalBackdrop')) closeShareModal();
}

function onShareCheckboxChange(key, checked) {
  _shareOptions[key] = checked;
  const anyOn = Object.values(_shareOptions).some(Boolean);
  document.getElementById('shareCopyBtn').disabled = !anyOn;
  if (anyOn) _refreshShareUrl(false);
}

function _refreshShareUrl(autoCopy) {
  try {
    const url   = generateShareUrl(_shareOptions);
    const input = document.getElementById('shareUrlInput');
    if (input) input.value = url;
    if (autoCopy) _copyShareUrl(true);
  } catch (e) {
    clog('Failed to generate share URL: ' + e.message, 'error');
  }
}

function _copyShareUrl(silent) {
  const input = document.getElementById('shareUrlInput');
  const url   = input ? input.value : '';
  if (!url) return;

  var onSuccess = function() {
    if (!silent) {
      var btn  = document.getElementById('shareCopyBtn');
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = orig; }, 1400);
    }
    clog('Share URL copied to clipboard', 'success');
  };

  var onFail = function() {
    // Fallback: select the text so the user can Ctrl+C manually
    input.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(_) {}
    if (ok) {
      onSuccess();
    } else {
      clog('Auto-copy unavailable - URL selected, press Ctrl+C to copy', 'warn');
    }
  };

  // navigator.clipboard may be undefined on file:// or non-HTTPS - guard synchronously
  if (window.navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(url).then(onSuccess, onFail);
  } else {
    onFail();
  }
}
