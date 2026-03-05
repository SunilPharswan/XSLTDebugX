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
//  SAMPLE DATA
// ════════════════════════════════════════════



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
  document.getElementById('consoleBody').innerHTML = '';
  consoleErrCount = 0;
  updateConsoleErrBadge();
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
function scheduleSave() {
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

  // Reset editors to default example
  if (eds.xml)  eds.xml.setValue(EXAMPLES.identityTransform.xml);
  if (eds.xslt) eds.xslt.setValue(EXAMPLES.identityTransform.xslt);
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
  setStatus('Ready', 'ok');
  document.getElementById('statTime').textContent = '';
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

