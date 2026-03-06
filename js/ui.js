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
  const text = [...body.querySelectorAll('.log-line')].map(l => {
    const ts  = l.querySelector('.ts')?.textContent  ?? '';
    const msg = l.querySelector('.msg')?.textContent ?? '';
    return `${ts}  ${msg}`;
  }).join('\n');
  if (!text.trim()) return clog('Console is empty — nothing to copy', 'warn');
  navigator.clipboard.writeText(text)
    .then(() => clog('Console copied to clipboard ✓', 'success'))
    .catch(() => clog('Clipboard access denied', 'error'));
}

// ════════════════════════════════════════════
//  THEME TOGGLE
// ════════════════════════════════════════════
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('xforge-theme', isLight ? 'light' : 'dark');

  // Switch Monaco editor themes
  const monacoTheme = isLight ? 'xforge-light' : 'xforge';
  if (typeof monaco !== 'undefined') {
    monaco.editor.setTheme(monacoTheme);
  }
  clog(`Theme switched to ${isLight ? 'light' : 'dark'} mode`, 'info');
}

// Restore saved theme preference
(function() {
  const saved = localStorage.getItem('xforge-theme');
  if (saved === 'dark') {
    document.body.classList.remove('light');
    // Update button emoji once DOM is accessible (script is at bottom of body so DOM is ready)
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = '🌙';
  }
  // Default is light (body has class="light" in HTML), emoji is already ☀️
})();

