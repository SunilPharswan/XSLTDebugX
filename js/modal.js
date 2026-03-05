// ── Menu toggle ──
// ════════════════════════════════════════════
//  EXAMPLES LIBRARY MODAL
// ════════════════════════════════════════════

const EX_META = {
  // Data Transformation
  identityTransform:    { icon:'🔁', name:'Identity Transform',              desc:'Copy XML as-is — foundation for all CPI mappings',           cat:'transform' },
  renameElements:       { icon:'✏️', name:'Rename Elements & Attributes',     desc:'Map SAP IDoc MATMAS fields to target REST format',           cat:'transform' },
  filterNodes:          { icon:'🔍', name:'Filter / Conditional Output',      desc:'Keep only nodes matching multi-field conditions',            cat:'transform' },
  namespaceHandling:    { icon:'🏷️', name:'Namespace Handling',               desc:'Strip ns prefixes, remap namespaces, enrich inline',         cat:'transform' },
  // Aggregation & Splitting
  groupBy:              { icon:'📦', name:'Group-by & Aggregate',             desc:'Nested grouping with subtotals — xsl:for-each-group',        cat:'aggregation' },
  splitMessage:         { icon:'✂️', name:'Split Message',                    desc:'Wrap each record as standalone message with index',          cat:'aggregation' },
  mergeMessages:        { icon:'🔀', name:'Merge / Collect Records',          desc:'Flatten nested records, compute open/closed totals',         cat:'aggregation' },
  // Format Conversion
  dateFormatting:       { icon:'📅', name:'Date Format Conversion',           desc:'SAP YYYYMMDD ↔ ISO 8601 ↔ display formats',                  cat:'format' },
  currencyAmount:       { icon:'💱', name:'Currency & Amount Formatting',     desc:'format-number, IBAN validation, negative handling',          cat:'format' },
  multiCurrencyReport:  { icon:'💹', name:'Multi-Currency Consolidation',     desc:'Convert to base currency, group by currency code',           cat:'format' },
  // SAP CPI Patterns
  idocToXml:            { icon:'📄', name:'IDoc ORDERS05 → Custom XML',       desc:'Full IDoc parse: control record, header, vendor, items',     cat:'cpi' },
  lookupEnrich:         { icon:'🔗', name:'Value Mapping / Lookup',           desc:'Inline lookup tables — replaces CPI Value Mapping step',     cat:'cpi' },
  cpiHeaders:           { icon:'⚙️', name:'Headers & Properties (CPI)',       desc:'xsl:param binding + cpi:setHeader / setProperty',            cat:'cpi' },
  errorHandling:        { icon:'🛡️', name:'Error Handling (xsl:try)',         desc:'Per-field try/catch with fallback — XSLT 3.0 resilience',   cat:'cpi' },
  batchProcessing:      { icon:'🔄', name:'Batch Processing (SuccessFactors)',desc:'OData $batch for EmpEmployment + EmpJob UPSERT',             cat:'cpi' },
  batchKeyRecovery:     { icon:'🔑', name:'Batch Key Recovery (SuccessFactors)', desc:'Re-inject saved keys into $batch response by position',      cat:'cpi' },
};

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

  // Filter keys
  const keys = Object.keys(EX_META).filter(k => {
    const m = EX_META[k];
    if (exActiveCat !== 'all' && m.cat !== exActiveCat) return false;
    if (query && !m.name.toLowerCase().includes(query) && !m.desc.toLowerCase().includes(query)) return false;
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
    const cat = EX_META[k].cat;
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
      const m = EX_META[k];
      const accent = CAT_ACCENT[m.cat] || 'var(--sap-blue)';
      html += `
        <div class="ex-card" style="--card-accent:${accent}" onclick="loadExample('${k}')">
          <div class="ex-card-top">
            <span class="ex-card-icon">${m.icon}</span>
            <span class="ex-card-name">${m.name}</span>
          </div>
          <div class="ex-card-desc">${m.desc}</div>
          <div class="ex-card-footer">
            <span class="ex-card-tag">${CAT_LABELS[m.cat] || m.cat}</span>
            <button class="ex-card-load" onclick="event.stopPropagation();loadExample('${k}')">Load →</button>
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
  eds.xml?.setValue(ex.xml);
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

  // Cancel any pending debounce validations to avoid ghost squiggles
  clearTimeout(xsltDebounce);
  clearTimeout(xmlDebounce);
  clearAllMarkers();

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

