// ════════════════════════════════════════════
//  FILE UPLOAD / DOWNLOAD
// ════════════════════════════════════════════

function triggerUpload(pane) {
  const id = pane === 'xml' ? 'uploadXml' : 'uploadXslt';
  document.getElementById(id).value = ''; // reset so same file can be re-uploaded
  document.getElementById(id).click();
}

function handleUpload(event, pane) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const text = e.target.result;
    const ed = pane === 'xml' ? eds.xml : eds.xslt;
    ed.setValue(text);
    scheduleSave();
    clog(`Uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB) → ${pane.toUpperCase()} pane`, 'success');
  };
  reader.onerror = () => clog(`Failed to read file: ${file.name}`, 'error');
  reader.readAsText(file);
}

function downloadPane(pane, defaultName) {
  const ed = pane === 'xml' ? eds.xml : pane === 'xslt' ? eds.xslt : eds.out;
  const text = ed?.getValue()?.trim();
  if (!text) { clog(`${pane.toUpperCase()} pane is empty — nothing to download`, 'warn'); return; }
  const blob = new Blob([text], { type: 'application/xml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = defaultName;
  a.click();
  URL.revokeObjectURL(url);
  clog(`Downloaded: ${defaultName}`, 'success');
}

// ── Drag & Drop onto each editor pane ──
function setupDragDrop(editorWrapId, pane) {
  const el = document.getElementById(editorWrapId);
  if (!el) return;

  el.addEventListener('dragover', e => {
    e.preventDefault();
    el.classList.add('drag-over');
  });
  el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
  el.addEventListener('drop', e => {
    e.preventDefault();
    el.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (pane === 'out') { clog('Cannot drop onto Output pane', 'warn'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const ed = pane === 'xml' ? eds.xml : eds.xslt;
      ed.setValue(ev.target.result);
      scheduleSave();
      clog(`Dropped: ${file.name} (${(file.size / 1024).toFixed(1)} KB) → ${pane.toUpperCase()} pane`, 'success');
    };
    reader.readAsText(file);
  });
}

