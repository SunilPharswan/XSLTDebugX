// ════════════════════════════════════════════
//  SIDE COLUMN COLLAPSE
// ════════════════════════════════════════════
function toggleSideCol(side) {
  const col = document.getElementById(side === 'left' ? 'colLeft' : 'colRight');
  col.classList.toggle('collapsed');
  scheduleSave();

  // Relayout all Monaco editors after transition
  setTimeout(() => {
    eds.xml?.layout();
    eds.xslt?.layout();
    eds.out?.layout();
  }, 250);
}

// ════════════════════════════════════════════
//  CONSOLE STATE (minimize / maximize)
// ════════════════════════════════════════════
let consoleState = 'normal';  // 'normal' | 'minimized'
let consoleErrCount = 0;

function setConsoleState(state) {
  const panel = document.getElementById('consolePanel');
  panel.classList.toggle('minimized', state === 'minimized');
  consoleState = state;

  // Relay Monaco continuously during the CSS transition (220ms) to prevent blank editor
  const start = performance.now();
  const duration = 240;
  function pump(now) {
    eds.xml?.layout();
    eds.xslt?.layout();
    eds.out?.layout();
    if (now - start < duration) requestAnimationFrame(pump);
  }
  requestAnimationFrame(pump);
}

// Clicking the bar toggles minimize
function handleConsoleBarClick(e) {
  setConsoleState(consoleState === 'minimized' ? 'normal' : 'minimized');
}

function updateConsoleErrBadge() {
  const badge = document.getElementById('consoleErrBadge');
  if (!badge) return;
  if (consoleErrCount > 0 && consoleState === 'minimized') {
    badge.textContent = consoleErrCount;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

function copyConsole() {
  const body = document.getElementById('consoleBody');
  const text = [...body.querySelectorAll('.log-line')]
    .filter(l => l.style.display !== 'none')
    .map(l => {
      const ts  = l.querySelector('.ts')?.textContent  ?? '';
      const msg = l.querySelector('.msg')?.textContent ?? '';
      return `${ts}  ${msg}`;
    }).join('\n');
  if (!text.trim()) return clog('Console is empty — nothing to copy', 'warn');

  const onSuccess = () => clog('Console copied to clipboard ✓', 'success');
  const onFail    = () => {
    // execCommand fallback for file:// or non-HTTPS contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = (() => { try { return document.execCommand('copy'); } catch(_) { return false; } })();
    document.body.removeChild(ta);
    ok ? onSuccess() : clog('Clipboard access denied', 'error');
  };

  if (window.navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(onSuccess, onFail);
  } else {
    onFail();
  }
}

// ════════════════════════════════════════════
//  CONSOLE FILTER
// ════════════════════════════════════════════
let consoleFilter = 'all';

function setConsoleFilter(filter) {
  consoleFilter = filter;

  // Update active button state
  document.querySelectorAll('.console-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  // Delegate all filtering (type + text) to applyConsoleSearch
  const searchVal = document.getElementById('consoleSearch')?.value ?? '';
  applyConsoleSearch(searchVal);
}

function applyConsoleSearch(query) {
  const term = query.trim().toLowerCase();
  const typeFilter = consoleFilter || 'all';
  document.querySelectorAll('#consoleBody .log-line').forEach(line => {
    const t = line.dataset.type;
    // INFO filter shows both info and success (success is a positive outcome, not a separate category)
    const matchesType = typeFilter === 'all'
      || t === typeFilter
      || (typeFilter === 'info' && t === 'success');
    const matchesText = !term || line.textContent.toLowerCase().includes(term);
    line.style.display = matchesType && matchesText ? '' : 'none';
  });
}

// ════════════════════════════════════════════
//  THEME TOGGLE
// ════════════════════════════════════════════
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('xdebugx-theme', isLight ? 'light' : 'dark');

  // Switch Monaco editor themes
  const monacoTheme = isLight ? 'xdebugx-light' : 'xdebugx';
  if (typeof monaco !== 'undefined') {
    monaco.editor.setTheme(monacoTheme);
  }
}

// Restore saved theme preference
(function() {
  const saved = localStorage.getItem('xdebugx-theme');
  if (saved === 'dark') {
    document.body.classList.remove('light');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '🌙';
  }
})();