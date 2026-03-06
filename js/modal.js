// ════════════════════════════════════════════
//  EXAMPLES LIBRARY MODAL
// ════════════════════════════════════════════

const CAT_ACCENT = {
  transform:   '#3fb950',
  aggregation: '#f5a524',
  format:      '#c084fc',
  cpi:         '#0070f2',
};

let exActiveCat = 'all';

function openExModal() {
  document.getElementById('exModalBackdrop').classList.add('open');
  document.getElementById('exModalSearch').value = '';
  exActiveCat = 'all';
  document.querySelectorAll('.ex-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === 'all'));
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
    return;
  }
  // Ctrl+Enter / Cmd+Enter → run transform (works even when KV inputs have focus)
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    runTransform();
  }
});

function setExCat(cat) {
  exActiveCat = cat;
  document.querySelectorAll('.ex-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
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

  const CAT_LABELS = { transform:'Data Transformation', aggregation:'Aggregation & Splitting', format:'Format Conversion', cpi:'SAP CPI Patterns' };

  let html = '';
  Object.keys(groups).forEach(cat => {
    if (exActiveCat === 'all') {
      html += `<div class="ex-grid-section-label">${CAT_LABELS[cat] || cat}</div>`;
    }
    html += '<div class="ex-grid">';
    groups[cat].forEach(k => {
      const ex = EXAMPLES[k];
      const accent = CAT_ACCENT[ex.cat] || 'var(--sap-blue)';
      html += `
        <div class="ex-card" style="--card-accent:${accent}" onclick="loadExample('${k}')">
          <div class="ex-card-top">
            <span class="ex-card-icon">${ex.icon}</span>
            <span class="ex-card-name">${ex.label}</span>
          </div>
          <div class="ex-card-desc">${ex.desc}</div>
          <div class="ex-card-footer">
            <span class="ex-card-tag">${CAT_LABELS[ex.cat] || ex.cat}</span>
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

  // Cancel pending debounce timers and suppress the new ones triggered by setValue
  clearTimeout(xsltDebounce);
  clearTimeout(xmlDebounce);
  _suppressNextValidation = true;
  clearAllMarkers();

  eds.xml?.setValue(ex.xml);
  // _suppressNextValidation consumed by xml change — reset for xslt
  _suppressNextValidation = true;
  eds.xslt?.setValue(ex.xslt);
  eds.out?.updateOptions({ readOnly: false });
  eds.out?.setValue('');
  eds.out?.updateOptions({ readOnly: true });
  // Reset output KV panels
  renderOutputKV({}, {});
  // If example ships with headers/properties, pre-fill them
  kvData = { headers: [], properties: [] };
  kvIdSeq = 0;
  if (ex.headers) {
    ex.headers.forEach(([n,v]) => {
      kvIdSeq++;
      kvData.headers.push({ id: kvIdSeq, name: n, value: v });
    });
  }
  if (ex.properties) {
    ex.properties.forEach(([n,v]) => {
      kvIdSeq++;
      kvData.properties.push({ id: kvIdSeq, name: n, value: v });
    });
  }
  renderKV('headers');
  renderKV('properties');

  // Collapse output pane so stale output from previous example isn't shown
  const colRight = document.getElementById('colRight');
  if (!colRight.classList.contains('collapsed')) {
    colRight.classList.add('collapsed');
    setTimeout(() => { eds.xml?.layout(); eds.xslt?.layout(); eds.out?.layout(); }, 250);
  }

  closeExModal();
  clog(`Example loaded: "${ex.label}" — press Run Transform to execute`, 'success');
  scheduleSave();
}

