// ════════════════════════════════════════════
//  EXAMPLES LIBRARY MODAL
// ════════════════════════════════════════════

let exActiveCat = 'all';

// ── Render sidebar category buttons from CATEGORIES object ───────────────────
function renderExSidebar() {
  const sidebar = document.getElementById('exSidebar');
  if (!sidebar) return;

  const allExamples = Object.values(EXAMPLES);
  const total = allExamples.length;

  let html = '<div class="ex-sidebar-label">Categories</div>';

  // "All" button
  html += `<button class="ex-cat-btn${exActiveCat === 'all' ? ' active' : ''}" data-cat="all" onclick="setExCat('all')">All <span class="ex-cat-count">${total}</span></button>`;

  // One button per category — order follows CATEGORIES definition
  Object.entries(CATEGORIES).forEach(([cat, { label }]) => {
    const count = allExamples.filter(ex => ex.cat === cat).length;
    if (count === 0) return; // skip empty categories
    const isActive = exActiveCat === cat;
    html += `<button class="ex-cat-btn${isActive ? ' active' : ''}" data-cat="${cat}" onclick="setExCat('${cat}')">${label} <span class="ex-cat-count">${count}</span></button>`;
  });

  sidebar.innerHTML = html;
}

function openExModal() {
  document.getElementById('exModalBackdrop').classList.add('open');
  document.getElementById('exModalSearch').value = '';
  // Pre-select category based on current mode
  exActiveCat = xpathEnabled ? 'xpath' : 'all';
  renderExSidebar();
  renderExGrid();
  setTimeout(() => document.getElementById('exModalSearch').focus(), 60);
}

function closeExModal() {
  document.getElementById('exModalBackdrop').classList.remove('open');
}

function handleModalBackdropClick(e) {
  if (e.target === document.getElementById('exModalBackdrop')) closeExModal();
}

// Close modal on Escape; run transform on Ctrl/Cmd+Enter from anywhere
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeExModal();
    if (typeof closeShareModal === 'function') closeShareModal();
    if (typeof closeHelpModal  === 'function') closeHelpModal();
    return;
  }
  // Ctrl+Enter / Cmd+Enter → mode-aware run (works even when KV inputs have focus)
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (typeof xpathEnabled !== 'undefined' && xpathEnabled) runXPath();
    else runTransform();
  }
});

function setExCat(cat) {
  exActiveCat = cat;
  renderExSidebar();
  renderExGrid();
}

function filterExamples() { renderExGrid(); }

function renderExGrid() {
  const query  = (document.getElementById('exModalSearch').value || '').toLowerCase().trim();
  const wrap   = document.getElementById('exGridWrap');

  // Filter keys — iterate EXAMPLES directly, meta fields now live there
  const keys = Object.keys(EXAMPLES).filter(k => {
    const ex = EXAMPLES[k];
    if (exActiveCat !== 'all' && ex.cat !== exActiveCat) return false;
    if (query && !ex.label.toLowerCase().includes(query) && !ex.desc.toLowerCase().includes(query)) return false;
    return true;
  });

  document.getElementById('exModalCount').textContent = keys.length + ' example' + (keys.length !== 1 ? 's' : '');

  if (!keys.length) {
    wrap.innerHTML = '<div class="ex-no-results">No examples match your search.</div>';
    return;
  }

  // Group by category for section labels (only when showing all)
  const groups = {};
  keys.forEach(k => {
    const cat = EXAMPLES[k].cat;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(k);
  });

  let html = '';
  // Preserve CATEGORIES order for section grouping
  const orderedCats = [...Object.keys(CATEGORIES), ...Object.keys(groups).filter(c => !CATEGORIES[c])];
  orderedCats.filter(cat => groups[cat]).forEach(cat => {
    const catDef = CATEGORIES[cat] || { label: cat, accent: 'var(--sap-blue)' };
    if (exActiveCat === 'all') {
      html += `<div class="ex-grid-section-label">${catDef.label}</div>`;
    }
    html += '<div class="ex-grid">';
    groups[cat].forEach(k => {
      const ex = EXAMPLES[k];
      const accent = catDef.accent;
      html += `
        <div class="ex-card" style="--card-accent:${accent}" onclick="loadExample('${k}')">
          <div class="ex-card-top">
            <span class="ex-card-icon">${ex.icon}</span>
            <span class="ex-card-name">${ex.label}</span>
          </div>
          <div class="ex-card-desc">${ex.desc}</div>
          <div class="ex-card-footer">
            <span class="ex-card-tag">${catDef.label}</span>
            <span class="ex-card-load">Load →</span>
          </div>
        </div>`;
    });
    html += '</div>';
  });

  wrap.innerHTML = html;
}

// ── Load an example ──
function loadExample(key) {
  const ex = EXAMPLES[key];
  if (!ex) return;

  // ── Step 1: Switch mode based on example type BEFORE loading content ──
  if (ex.xpathExpr && !xpathEnabled) {
    // XPath example — switch to XPath mode
    const colCenter = document.getElementById('colCenter');
    _xpathPreColCenterCollapsed = colCenter?.classList.contains('collapsed') ?? false;
    xpathEnabled = true;
    if (typeof _applyXPathToggleState === 'function') _applyXPathToggleState();
    clog('Switched to XPath mode', 'info');
  } else if (!ex.xpathExpr && xpathEnabled) {
    // XSLT example — switch to XSLT mode
    xpathEnabled = false;
    if (typeof _applyXPathToggleState === 'function') _applyXPathToggleState();
    if (typeof clearXPathResults === 'function') clearXPathResults();
    clog('Switched to XSLT mode', 'info');
  }

  // ── Step 2: Load content ──
  clearTimeout(xsltDebounce);
  clearTimeout(xmlDebounce);
  clearAllMarkers();

  try {
    _suppressNextValidation = true;
    eds.xml?.setValue(ex.xml);
    // Only set XSLT if in XSLT mode (and example has XSLT content)
    if (!xpathEnabled && ex.xslt) {
      _suppressNextValidation = true;
      eds.xslt?.setValue(ex.xslt);
    }
  } finally {
    _suppressNextValidation = false;
  }
  eds.out?.updateOptions({ readOnly: false });
  eds.out?.setValue('');
  eds.out?.updateOptions({ readOnly: true });
  renderOutputKV({}, {});

  // Only set KV panels in XSLT mode — they're hidden in XPath mode
  if (!xpathEnabled) {
    kvData = { headers: [], properties: [] };
    kvIdSeq = 0;
    if (ex.headers) {
      ex.headers.forEach(([n,v]) => { kvIdSeq++; kvData.headers.push({ id: kvIdSeq, name: n, value: v }); });
    }
    if (ex.properties) {
      ex.properties.forEach(([n,v]) => { kvIdSeq++; kvData.properties.push({ id: kvIdSeq, name: n, value: v }); });
    }
    renderKV('headers');
    renderKV('properties');
  }

  closeExModal();
  window.goatcounter?.count({ path: `example-${key}`, title: `Example: ${ex.label}` });
  window._lastExampleKey = key;

  // ── Step 3: Post-load layout and actions ──
  if (ex.xpathExpr) {
    const colRight = document.getElementById('colRight');
    if (colRight.classList.contains('collapsed')) colRight.classList.remove('collapsed');
    setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 250);
    clog(`Example loaded: "${ex.label}" — XPath pre-filled, running…`, 'success');
    const xpathInput = document.getElementById('xpathInput');
    if (xpathInput) {
      if (typeof _syncXPathInput === 'function') _syncXPathInput(ex.xpathExpr);
      else xpathInput.value = ex.xpathExpr;
      setTimeout(() => { if (typeof runXPath === 'function') runXPath(); }, 350);
    }
    // Render hints strip if example has hints
    if (typeof renderXPathHints === 'function') renderXPathHints(ex.xpathHints ?? null);
  } else {
    const colRight = document.getElementById('colRight');
    if (!colRight.classList.contains('collapsed')) {
      colRight.classList.add('collapsed');
      setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 250);
    }
    // Hide hints strip for XSLT examples
    if (typeof renderXPathHints === 'function') renderXPathHints(null);
    clog(`Example loaded: "${ex.label}" — press Run Transform to execute`, 'success');
  }

  scheduleSave();
}