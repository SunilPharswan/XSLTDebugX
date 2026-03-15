// ════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════
let eds = { xml: null, xslt: null, out: null };
let saxonReady  = false;

// KV stores: { id, name, value }
let kvData = { headers: [], properties: [] };
let kvIdSeq = 0;

// Validation debounce timers — declared at top level so loadExample can cancel them
let xsltDebounce = null;
let xmlDebounce  = null;

// ════════════════════════════════════════════
//  CONSOLE
// ════════════════════════════════════════════
function clog(msg, type = 'info') {
  const body = document.getElementById('consoleBody');
  const line = document.createElement('div');
  line.className = `log-line ${type}`;
  const ts = new Date().toLocaleTimeString('en-GB', { hour12: false });
  line.innerHTML = `<span class="ts">${ts}</span><span class="msg">${escHtml(msg)}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
  // Track errors/warnings for the minimised-console badge
  if (type === 'error' || type === 'warn') {
    consoleErrCount++;
    updateConsoleErrBadge();
    // Auto-restore console if minimised so errors aren't silently hidden
    if (consoleState === 'minimized') setConsoleState('normal');
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function clearConsole() {
  const body = document.getElementById('consoleBody');
  body.innerHTML = '';
  body.removeAttribute('data-filter');
  consoleErrCount = 0;
  updateConsoleErrBadge();
  // Reset filter buttons to ALL
  if (typeof setConsoleFilter === 'function') setConsoleFilter('all');
}

// ════════════════════════════════════════════
//  STATUS
// ════════════════════════════════════════════
function setStatus(txt, state = 'ok') {
  document.getElementById('statTxt').textContent = txt;
  const d = document.getElementById('statDot');
  d.className = 'stat-dot ' + state;
}



// ════════════════════════════════════════════
//  STATE PERSISTENCE  (localStorage)
// ════════════════════════════════════════════
const STORAGE_KEY = 'xdebugx-session-v1';
let _saveTimer = null;

// Debounced save — coalesces rapid keystrokes into one write
// Set _suppressNextSave = true before a programmatic setValue to skip that one save.
let _suppressNextSave = false;

function scheduleSave() {
  if (_suppressNextSave) { _suppressNextSave = false; return; }
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveState, 800);
}

function saveState() {
  try {
    const state = {
      xml:        eds.xml?.getValue()  ?? '',
      xslt:       eds.xslt?.getValue() ?? '',
      headers:    kvData.headers.map(r => ({ name: r.name, value: r.value })),
      properties: kvData.properties.map(r => ({ name: r.name, value: r.value })),
      leftCollapsed:  document.getElementById('colLeft')?.classList.contains('collapsed')  ?? false,
      rightCollapsed: document.getElementById('colRight')?.classList.contains('collapsed') ?? true,
      centerCollapsed: !xpathEnabled && (document.getElementById('colCenter')?.classList.contains('collapsed') ?? false),
      xpathExpr:    document.getElementById('xpathInput')?.value ?? '',
      xpathEnabled: xpathEnabled,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Flash a subtle "saved" indicator
    showSavedIndicator();
  } catch (e) {
    // localStorage full or unavailable — fail silently
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearSavedState() {
  localStorage.removeItem(STORAGE_KEY);

  // Reset editors to default example — suppress save so the cleared state isn't immediately re-written
  if (eds.xml)  { _suppressNextSave = true; eds.xml.setValue(EXAMPLES.identityTransform.xml); }
  if (eds.xslt) { _suppressNextSave = true; eds.xslt.setValue(EXAMPLES.identityTransform.xslt); }
  _suppressNextSave = false;
  if (eds.out)  { eds.out.updateOptions({ readOnly: false }); eds.out.setValue(''); eds.out.updateOptions({ readOnly: true }); }

  // Reset KV panels
  kvData.headers    = [];
  kvData.properties = [];
  kvIdSeq = 0;
  renderKV('headers');
  renderKV('properties');
  renderOutputKV({}, {});

  // Hide saved indicator
  const ind = document.getElementById('savedIndicator');
  if (ind) ind.style.opacity = '0';

  if (eds.xml && eds.xslt) clearAllMarkers();
  if (typeof clearXPathResults === 'function') clearXPathResults();
  const xpathInput = document.getElementById('xpathInput');
  if (xpathInput) xpathInput.value = '';
  // Reset XPath toggle to default (off)
  if (typeof xpathEnabled !== 'undefined') {
    xpathEnabled = false;
    if (typeof _applyXPathToggleState === 'function') _applyXPathToggleState();
    setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 50);
  }
  setStatus('Ready', 'ok');
  clog('Session cleared — editors reset to defaults.', 'info');
}

// ── Tiny "● Saved" pill in the status bar ──
let _savedFadeTimer = null;
function showSavedIndicator() {
  const ind = document.getElementById('savedIndicator');
  if (!ind) return;
  ind.style.opacity = '1';
  clearTimeout(_savedFadeTimer);
  _savedFadeTimer = setTimeout(() => { ind.style.opacity = '0'; }, 2000);
}