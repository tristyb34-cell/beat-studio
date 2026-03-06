/* =========================================================
   Sqweeky Clean Productions -- Sequencer Grid Engine
   =========================================================
   Infinite grid: any sound in any cell. Rows are generic
   numbered lanes. Blocks are placed via drag-drop from the
   sound browser or programmatically.
   ========================================================= */
(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────
  const INITIAL_ROWS    = 50;
  const TOTAL_BARS      = 320;       // 10 min at 128 BPM
  const BEATS_PER_BAR   = 4;
  const TOTAL_BEATS     = TOTAL_BARS * BEATS_PER_BAR;
  const AUTOSAVE_MS     = 10 * 60 * 1000;
  const AUTOSAVE_SLOTS  = 9;
  const ZOOM_H_MIN = 12;
  const ZOOM_H_MAX = 120;
  const ZOOM_V_MIN = 60;
  const ZOOM_V_MAX = 200;

  const CATEGORY_KEYS = [
    'kicks','snares','hihats','claps','percussion',
    'bass','synths','pads','leads','fx',
    'vocals','guitar','piano','violin','strings'
  ];

  // Extra keywords that map to categories (for fallback ID matching)
  const CATEGORY_ALIASES = {
    'hihats': ['hat','hihat','hh'],
    'kicks': ['kick','kck','bd'],
    'snares': ['snare','snr','sd'],
    'claps': ['clap','clp'],
    'percussion': ['perc','tom','rim','shaker','conga','bongo'],
    'bass': ['bass','sub'],
    'synths': ['synth'],
    'pads': ['pad'],
    'leads': ['lead'],
    'fx': ['fx','riser','impact','sweep'],
    'vocals': ['vocal','vox'],
    'guitar': ['guitar','gtr'],
    'piano': ['piano','keys'],
    'violin': ['violin'],
    'strings': ['string','str']
  };

  // ── State ─────────────────────────────────────────────
  let rows           = [];
  let blocks          = [];
  let _id             = 0;
  let selectedIds     = new Set();
  let clipboard       = null;   // array of relative block descriptors
  let undoStack       = [];
  let redoStack       = [];
  let loopStart       = null;
  let loopEnd         = null;
  let bpm             = 128;
  let autosaveTimer   = null;

  // Transient interaction state
  let dragState       = null;
  let resizeState     = null;
  let selectRect      = null;
  let panState        = null;   // grid panning via empty-space drag
  let momentumId      = null;   // requestAnimationFrame id for momentum
  let rightClickState = null;   // right-click: drag-select vs context menu
  let ctxMenuEl       = null;

  // DOM refs (resolved in init)
  let $area, $rulerScroll, $ruler, $gridScroll, $gridRows, $playhead, $addRowBtn;

  // ── ID generator ──────────────────────────────────────
  function uid(prefix) { return prefix + (++_id); }

  // ── CSS variable helpers ──────────────────────────────
  const root = document.documentElement;

  function cssNum(name) {
    return parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
  }
  function setCss(name, val) { root.style.setProperty(name, val); }
  function beatW()  { return cssNum('--beat-w')  || 48;  }
  function rowH()   { return cssNum('--row-h')   || 40;  }
  function labelW() { return cssNum('--label-w') || 200; }

  // ── Snap ──────────────────────────────────────────────
  function getSnapValue() {
    const el = document.getElementById('snap-select');
    if (!el) return 1;
    const v = parseFloat(el.value);
    return (isNaN(v) || v <= 0) ? 1 : v;
  }

  function snapBeat(beat) {
    const s = getSnapValue();
    return Math.max(0, Math.round(beat / s) * s);
  }

  // ── Utility ───────────────────────────────────────────
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function clone(obj) { return structuredClone(obj); }

  function lookupSound(soundId) {
    const lib = window.soundLibrary;
    if (lib) {
      if (typeof lib.getSoundById === 'function') {
        const s = lib.getSoundById(soundId);
        if (s) return s;
      }
      if (typeof lib.getSound === 'function') {
        const s = lib.getSound(soundId);
        if (s) return s;
      }
    }
    return null;
  }

  function soundLabel(soundId) {
    const s = lookupSound(soundId);
    if (s && s.name) return s.name;
    return soundId || '';
  }

  function soundCategory(soundId) {
    const s = lookupSound(soundId);
    if (s && s.category) return s.category;
    return '';
  }

  function catClass(soundId) {
    const cat = soundCategory(soundId).toLowerCase().replace(/[^a-z]/g, '');
    for (const k of CATEGORY_KEYS) {
      if (cat.includes(k.replace(/s$/, ''))) return 'cat-' + k;
    }
    // Fallback: check the soundId against aliases
    const lower = (soundId || '').toLowerCase();
    for (const [catKey, aliases] of Object.entries(CATEGORY_ALIASES)) {
      for (const alias of aliases) {
        if (lower.includes(alias)) return 'cat-' + catKey;
      }
    }
    return 'cat-default';
  }

  function defaultBlockOptions() {
    return {
      pitch: 0, fineTune: 0, volume: 1, pan: 0,
      attack: 0, decay: 0,
      filterType: 'none', cutoff: 20000, resonance: 0,
      distortion: 0, reverse: false, stretch: 1
    };
  }

  function dispatch(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }

  // ── Data access ───────────────────────────────────────
  function blockById(id)  { return blocks.find(b => b.id === id); }
  function rowById(id)    { return rows.find(r => r.id === id); }

  function getBlocksForRow(rowId) {
    return blocks.filter(b => b.rowId === rowId);
  }

  function getSelectedBlocks() {
    return blocks.filter(b => selectedIds.has(b.id));
  }

  function getLastBeat() {
    if (!blocks.length) return 0;
    return Math.max(...blocks.map(b => b.startBeat + b.durationBeats));
  }

  // ── Undo / Redo ───────────────────────────────────────
  function pushUndo(action) {
    undoStack.push(action);
    redoStack = [];
  }

  function applyAction(action, forward) {
    switch (action.type) {
      case 'addBlock':
        if (forward) blocks.push(clone(action.data));
        else blocks = blocks.filter(b => b.id !== action.data.id);
        break;
      case 'removeBlock':
        if (forward) blocks = blocks.filter(b => b.id !== action.data.id);
        else blocks.push(clone(action.data));
        break;
      case 'moveBlock': {
        const b = blockById(action.data.id);
        if (!b) break;
        if (forward) { b.rowId = action.data.toRowId; b.startBeat = action.data.toBeat; }
        else         { b.rowId = action.data.fromRowId; b.startBeat = action.data.fromBeat; }
        break;
      }
      case 'resizeBlock': {
        const b = blockById(action.data.id);
        if (!b) break;
        if (forward) { b.durationBeats = action.data.toDur; b.repeatCount = action.data.toRep; }
        else         { b.durationBeats = action.data.fromDur; b.repeatCount = action.data.fromRep; }
        break;
      }
      case 'editBlock': {
        const b = blockById(action.data.id);
        if (!b) break;
        b.options = clone(forward ? action.data.toOptions : action.data.fromOptions);
        break;
      }
      case 'addRow':
        if (forward) rows.push(clone(action.data));
        else {
          rows = rows.filter(r => r.id !== action.data.id);
          blocks = blocks.filter(b => b.rowId !== action.data.id);
        }
        break;
      case 'removeRow':
        if (forward) {
          rows = rows.filter(r => r.id !== action.data.row.id);
          blocks = blocks.filter(b => b.rowId !== action.data.row.id);
        } else {
          rows.splice(action.data.index, 0, clone(action.data.row));
          action.data.blocks.forEach(b => blocks.push(clone(b)));
        }
        break;
      case 'batch':
        (forward ? action.actions : action.actions.slice().reverse())
          .forEach(a => applyAction(a, forward));
        break;
    }
  }

  function undo() {
    if (!undoStack.length) return;
    const a = undoStack.pop();
    applyAction(a, false);
    redoStack.push(a);
    render();
  }

  function redo() {
    if (!redoStack.length) return;
    const a = redoStack.pop();
    applyAction(a, true);
    undoStack.push(a);
    render();
  }

  // ── Row CRUD ──────────────────────────────────────────
  function makeRow(number) {
    return { id: uid('r'), number, muted: false, solo: false };
  }

  function addRow() {
    const row = makeRow(rows.length + 1);
    rows.push(row);
    pushUndo({ type: 'addRow', data: clone(row) });
    render();
    return row;
  }

  function removeRow(rowId) {
    const idx = rows.findIndex(r => r.id === rowId);
    if (idx === -1 || rows.length <= 1) return;
    const row = rows[idx];
    const rowBlocks = blocks.filter(b => b.rowId === rowId).map(clone);
    pushUndo({ type: 'removeRow', data: { index: idx, row: clone(row), blocks: rowBlocks } });
    rows.splice(idx, 1);
    blocks = blocks.filter(b => b.rowId !== rowId);
    rows.forEach((r, i) => r.number = i + 1);
    render();
  }

  // ── Block CRUD ────────────────────────────────────────
  function addBlock(rowId, soundId, startBeat, durationBeats, options) {
    const snapped = snapBeat(startBeat);
    const dur = Math.max(getSnapValue(), durationBeats || 1);
    const block = {
      id: uid('b'),
      rowId,
      soundId,
      startBeat: snapped,
      durationBeats: dur,
      repeatCount: 1,
      options: Object.assign(defaultBlockOptions(), options || {})
    };
    blocks.push(block);
    pushUndo({ type: 'addBlock', data: clone(block) });
    render();
    return block;
  }

  function removeBlock(blockId) {
    const b = blockById(blockId);
    if (!b) return;
    pushUndo({ type: 'removeBlock', data: clone(b) });
    blocks = blocks.filter(x => x.id !== blockId);
    selectedIds.delete(blockId);
    const el = $gridRows.querySelector(`.seq-block[data-id="${blockId}"]`);
    if (el) el.remove();
  }

  function duplicateBlock(blockId) {
    const src = blockById(blockId);
    if (!src) return null;
    return addBlock(src.rowId, src.soundId,
      src.startBeat + src.durationBeats, src.durationBeats, clone(src.options));
  }

  function moveBlock(blockId, newRowId, newStartBeat) {
    const b = blockById(blockId);
    if (!b) return;
    const from = { rowId: b.rowId, beat: b.startBeat };
    b.rowId = newRowId;
    b.startBeat = Math.max(0, snapBeat(newStartBeat));
    pushUndo({
      type: 'moveBlock',
      data: { id: blockId, fromRowId: from.rowId, fromBeat: from.beat,
              toRowId: b.rowId, toBeat: b.startBeat }
    });
    render();
  }

  function resizeBlock(blockId, newDurationBeats) {
    const b = blockById(blockId);
    if (!b) return;
    const snap = getSnapValue();
    const newDur = Math.max(snap, snapBeat(newDurationBeats));
    const fromDur = b.durationBeats;
    const fromRep = b.repeatCount;
    let naturalDur = 1;
    const snd = lookupSound(b.soundId);
    if (snd && snd.duration) {
      naturalDur = Math.max(snap, snapBeat(snd.duration * (bpm / 60)));
    }
    b.durationBeats = newDur;
    b.repeatCount = naturalDur > 0 ? Math.max(1, Math.round(newDur / naturalDur)) : 1;
    pushUndo({
      type: 'resizeBlock',
      data: { id: blockId, fromDur, fromRep, toDur: newDur, toRep: b.repeatCount }
    });
    render();
  }

  // ── Rendering ─────────────────────────────────────────
  function render() {
    renderRows();
    renderRuler();
    renderLoopMarkers();
  }

  function renderRows() {
    $gridRows.innerHTML = '';
    const bw = beatW();
    const totalW = TOTAL_BEATS * bw;
    const bgBeat  = `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)`;
    const bgBar   = `linear-gradient(to right, rgba(255,255,255,0.25) 2px, transparent 2px)`;
    const bg16    = `linear-gradient(to right, rgba(68,136,255,0.45) 2px, transparent 2px)`;
    const bw16    = bw * 16;

    rows.forEach(row => {
      const el = document.createElement('div');
      el.className = 'seq-row';
      el.dataset.rowId = row.id;
      if (row.muted) el.classList.add('muted');
      if (row.solo)  el.classList.add('solo');

      // Sticky label
      const label = document.createElement('div');
      label.className = 'row-label';
      label.innerHTML =
        `<span class="row-num">Row ${row.number}</span>` +
        `<button class="row-btn mute-btn${row.muted ? ' active' : ''}" data-action="mute" title="Mute">M</button>` +
        `<button class="row-btn solo-btn${row.solo ? ' active' : ''}" data-action="solo" title="Solo">S</button>` +
        `<button class="row-btn del-btn" data-action="delete" title="Delete row">X</button>`;
      el.appendChild(label);

      // Lane
      const lane = document.createElement('div');
      lane.className = 'row-lane';
      lane.dataset.rowId = row.id;
      lane.style.width = totalW + 'px';
      lane.style.backgroundSize = `${bw}px 100%, ${bw * BEATS_PER_BAR}px 100%, ${bw16}px 100%`;
      lane.style.backgroundImage = bgBeat + ',' + bgBar + ',' + bg16;
      el.appendChild(lane);

      $gridRows.appendChild(el);

      // Blocks
      getBlocksForRow(row.id).forEach(b => renderBlockInLane(b, lane));
    });
  }

  function renderBlockInLane(block, lane) {
    const bw = beatW();
    const el = document.createElement('div');
    el.className = 'seq-block ' + catClass(block.soundId);
    if (selectedIds.has(block.id)) el.classList.add('selected');
    el.dataset.id = block.id;
    el.style.left   = (block.startBeat * bw) + 'px';
    el.style.width  = (block.durationBeats * bw) + 'px';
    el.title = soundLabel(block.soundId);

    const handleL = document.createElement('div');
    handleL.className = 'resize-l';
    el.appendChild(handleL);

    const lbl = document.createElement('span');
    lbl.className = 'block-label';
    lbl.textContent = soundLabel(block.soundId);
    el.appendChild(lbl);

    const handleR = document.createElement('div');
    handleR.className = 'resize-r';
    el.appendChild(handleR);

    lane.appendChild(el);
  }

  function renderRuler() {
    const bw = beatW();
    const totalW = TOTAL_BEATS * bw;
    $ruler.style.width = totalW + 'px';
    $ruler.innerHTML = '';

    for (let beat = 0; beat < TOTAL_BEATS; beat++) {
      const isBar = (beat % BEATS_PER_BAR === 0);
      if (isBar) {
        const m = document.createElement('div');
        const is16 = (beat % 16 === 0);
        m.className = is16 ? 'ruler-bar ruler-16' : 'ruler-bar';
        m.style.left = (beat * bw) + 'px';
        m.textContent = (beat / BEATS_PER_BAR) + 1;
        $ruler.appendChild(m);
      } else {
        const t = document.createElement('div');
        t.className = 'ruler-tick';
        t.style.left = (beat * bw) + 'px';
        const beatInBar = (beat % BEATS_PER_BAR) + 1;
        t.textContent = '.' + beatInBar;
        $ruler.appendChild(t);
      }
    }
  }

  function renderLoopMarkers() {
    $ruler.querySelectorAll('.loop-marker').forEach(e => e.remove());
    const ls = loopStart != null ? loopStart : 0;
    const le = loopEnd   != null ? loopEnd   : getLastBeat();
    if (le <= ls) return;
    const bw = beatW();

    const region = document.createElement('div');
    region.className = 'loop-marker loop-region';
    region.style.left  = (ls * bw) + 'px';
    region.style.width = ((le - ls) * bw) + 'px';
    $ruler.appendChild(region);

    ['start', 'end'].forEach(edge => {
      const h = document.createElement('div');
      h.className = 'loop-marker loop-handle loop-' + edge;
      h.style.left = ((edge === 'start' ? ls : le) * bw) + 'px';
      h.dataset.edge = edge;
      $ruler.appendChild(h);
    });
  }

  function refreshSelectionClasses() {
    $gridRows.querySelectorAll('.seq-block').forEach(el => {
      el.classList.toggle('selected', selectedIds.has(el.dataset.id));
    });
  }

  // ── Playhead ──────────────────────────────────────────
  function updatePlayhead(beat) {
    if (beat <= 0) { $playhead.style.display = 'none'; return; }
    $playhead.style.display = 'block';
    const px = labelW() + (beat * beatW()) - ($gridScroll ? $gridScroll.scrollLeft : 0);
    $playhead.style.left = px + 'px';
  }

  // ── Coordinate helpers ────────────────────────────────
  function beatFromClientX(clientX) {
    const rect = $gridScroll.getBoundingClientRect();
    return (clientX - rect.left + $gridScroll.scrollLeft) / beatW();
  }

  function rowFromClientY(clientY) {
    const rect = $gridScroll.getBoundingClientRect();
    const y = clientY - rect.top + $gridScroll.scrollTop;
    const idx = clamp(Math.floor(y / rowH()), 0, rows.length - 1);
    return rows[idx] || null;
  }

  function beatFromRulerX(clientX) {
    const rect = $rulerScroll.getBoundingClientRect();
    return (clientX - rect.left + $rulerScroll.scrollLeft) / beatW();
  }

  // ── Selection rectangle ───────────────────────────────
  function startSelectRect(e) {
    const rect = $gridScroll.getBoundingClientRect();
    const x = e.clientX - rect.left + $gridScroll.scrollLeft;
    const y = e.clientY - rect.top  + $gridScroll.scrollTop;
    const el = document.createElement('div');
    el.className = 'select-rect';
    $gridRows.appendChild(el);
    selectRect = { startX: x, startY: y, el, rect };
    positionSelectRect(e);
  }

  function positionSelectRect(e) {
    if (!selectRect) return;
    const r = selectRect.rect;
    const x = e.clientX - r.left + $gridScroll.scrollLeft;
    const y = e.clientY - r.top  + $gridScroll.scrollTop;
    const left = Math.min(selectRect.startX, x);
    const top  = Math.min(selectRect.startY, y);
    selectRect.el.style.left   = left + 'px';
    selectRect.el.style.top    = top  + 'px';
    selectRect.el.style.width  = Math.abs(x - selectRect.startX) + 'px';
    selectRect.el.style.height = Math.abs(y - selectRect.startY) + 'px';
  }

  function endSelectRect(e) {
    if (!selectRect) return;
    const r = selectRect.rect;
    const x = e.clientX - r.left + $gridScroll.scrollLeft;
    const y = e.clientY - r.top  + $gridScroll.scrollTop;
    const left   = Math.min(selectRect.startX, x);
    const right  = Math.max(selectRect.startX, x);
    const top    = Math.min(selectRect.startY, y);
    const bottom = Math.max(selectRect.startY, y);
    selectRect.el.remove();
    selectRect = null;

    const bw = beatW();
    const rh = rowH();
    const beatStart = left  / bw;
    const beatEnd   = right / bw;
    const rowStart  = Math.floor(top    / rh);
    const rowEnd    = Math.floor(bottom / rh);
    const rowIds    = rows.slice(rowStart, rowEnd + 1).map(r => r.id);

    selectedIds.clear();
    blocks.forEach(b => {
      if (!rowIds.includes(b.rowId)) return;
      const bEnd = b.startBeat + b.durationBeats;
      if (b.startBeat < beatEnd && bEnd > beatStart) selectedIds.add(b.id);
    });
    refreshSelectionClasses();
  }

  // ── Copy / Paste ──────────────────────────────────────
  function copySelection() {
    const sel = getSelectedBlocks();
    if (!sel.length) return;
    const minBeat = Math.min(...sel.map(b => b.startBeat));
    const order   = rows.map(r => r.id);
    const minRow  = Math.min(...sel.map(b => order.indexOf(b.rowId)));
    clipboard = sel.map(b => ({
      soundId: b.soundId,
      relBeat: b.startBeat - minBeat,
      relRow:  order.indexOf(b.rowId) - minRow,
      durationBeats: b.durationBeats,
      repeatCount: b.repeatCount,
      options: clone(b.options)
    }));
  }

  function cutSelection() {
    copySelection();
    const sel = getSelectedBlocks();
    const actions = sel.map(b => {
      const d = clone(b);
      blocks = blocks.filter(x => x.id !== b.id);
      selectedIds.delete(b.id);
      return { type: 'removeBlock', data: d };
    });
    if (actions.length) pushUndo({ type: 'batch', actions });
    render();
  }

  function pasteAt(rowId, beat) {
    if (!clipboard || !clipboard.length) return;
    const order = rows.map(r => r.id);
    const base  = order.indexOf(rowId);
    if (base === -1) return;
    const snapped = snapBeat(beat);
    const actions = [];
    clipboard.forEach(item => {
      const rIdx = clamp(base + item.relRow, 0, rows.length - 1);
      const block = {
        id: uid('b'),
        rowId: rows[rIdx].id,
        soundId: item.soundId,
        startBeat: snapped + item.relBeat,
        durationBeats: item.durationBeats,
        repeatCount: item.repeatCount,
        options: clone(item.options)
      };
      blocks.push(block);
      actions.push({ type: 'addBlock', data: clone(block) });
    });
    if (actions.length) pushUndo({ type: 'batch', actions });
    render();
  }

  function duplicateSelection() {
    const sel = getSelectedBlocks();
    if (!sel.length) return;
    const maxEnd  = Math.max(...sel.map(b => b.startBeat + b.durationBeats));
    const minStart = Math.min(...sel.map(b => b.startBeat));
    const offset  = maxEnd - minStart;
    const actions = [];
    sel.forEach(b => {
      const nb = {
        id: uid('b'),
        rowId: b.rowId,
        soundId: b.soundId,
        startBeat: b.startBeat + offset,
        durationBeats: b.durationBeats,
        repeatCount: b.repeatCount,
        options: clone(b.options)
      };
      blocks.push(nb);
      actions.push({ type: 'addBlock', data: clone(nb) });
    });
    if (actions.length) pushUndo({ type: 'batch', actions });
    render();
  }

  // ── Context menu ──────────────────────────────────────
  function showCtx(x, y, items) {
    closeCtx();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    items.forEach(item => {
      const d = document.createElement('div');
      d.className = 'ctx-item';
      d.textContent = item.label;
      d.addEventListener('click', e => { e.stopPropagation(); closeCtx(); item.action(); });
      menu.appendChild(d);
    });
    document.body.appendChild(menu);
    ctxMenuEl = menu;
    // Keep within viewport
    const r = menu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  menu.style.left = (window.innerWidth  - r.width  - 4) + 'px';
    if (r.bottom > window.innerHeight) menu.style.top  = (window.innerHeight - r.height - 4) + 'px';
    setTimeout(() => document.addEventListener('click', closeCtx, { once: true }), 0);
  }

  function closeCtx() {
    if (ctxMenuEl) { ctxMenuEl.remove(); ctxMenuEl = null; }
  }

  // ── Zoom ──────────────────────────────────────────────
  function zoomH(delta) {
    setCss('--beat-w', clamp(beatW() + delta, ZOOM_H_MIN, ZOOM_H_MAX) + 'px');
    render();
  }

  function zoomV(delta) {
    setCss('--row-h', clamp(rowH() + delta, ZOOM_V_MIN, ZOOM_V_MAX) + 'px');
    render();
  }

  // ── Serialization ─────────────────────────────────────
  function serialize() {
    return {
      rows:      rows.map(clone),
      blocks:    blocks.map(clone),
      bpm,
      loopStart,
      loopEnd
    };
  }

  function load(data) {
    if (!data) return;
    rows   = (data.rows   || []).map(clone);
    blocks = (data.blocks || []).map(b => {
      const c = clone(b);
      c.options = Object.assign(defaultBlockOptions(), c.options || {});
      if (c.repeatCount == null) c.repeatCount = 1;
      return c;
    });
    bpm       = data.bpm || 128;
    loopStart = data.loopStart != null ? data.loopStart : null;
    loopEnd   = data.loopEnd   != null ? data.loopEnd   : null;
    selectedIds.clear();
    undoStack = [];
    redoStack = [];
    // Advance id counter past loaded IDs
    const maxNum = Math.max(0,
      ...rows.map(r  => parseInt(r.id.replace(/\D/g, '')) || 0),
      ...blocks.map(b => parseInt(b.id.replace(/\D/g, '')) || 0)
    );
    _id = maxNum;
    // Pad to INITIAL_ROWS if template has fewer
    while (rows.length < INITIAL_ROWS) {
      rows.push(makeRow(rows.length + 1));
    }
    render();
  }

  // ── Autosave ──────────────────────────────────────────
  function autosave() {
    const meta = JSON.parse(localStorage.getItem('sqweeky_autosave_meta') || '[]');
    let slot = 0;
    if (meta.length >= AUTOSAVE_SLOTS) {
      meta.sort((a, b) => a.timestamp - b.timestamp);
      slot = meta[0].index;
      meta.shift();
    } else {
      const used = new Set(meta.map(m => m.index));
      for (let i = 0; i < AUTOSAVE_SLOTS; i++) { if (!used.has(i)) { slot = i; break; } }
    }
    localStorage.setItem('sqweeky_autosave_' + slot, JSON.stringify(serialize()));
    meta.push({ index: slot, timestamp: Date.now(), blockCount: blocks.length });
    localStorage.setItem('sqweeky_autosave_meta', JSON.stringify(meta));
  }

  function getAutosaves() {
    return JSON.parse(localStorage.getItem('sqweeky_autosave_meta') || '[]')
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  function loadAutosave(index) {
    const raw = localStorage.getItem('sqweeky_autosave_' + index);
    if (raw) load(JSON.parse(raw));
  }

  // ── Event: grid mousedown ─────────────────────────────
  function onGridMouseDown(e) {
    closeCtx();

    // Right-click: prepare for drag-select (only starts after movement)
    if (e.button === 2) {
      e.preventDefault();
      rightClickState = {
        startX: e.clientX,
        startY: e.clientY,
        dragging: false,
        event: e
      };
      return;
    }

    const blockEl   = e.target.closest('.seq-block');
    const isResizeR = e.target.classList.contains('resize-r');
    const isResizeL = e.target.classList.contains('resize-l');

    // ---- Resize handle (left or right) ----
    if ((isResizeR || isResizeL) && blockEl) {
      e.preventDefault();
      e.stopPropagation();
      const b = blockById(blockEl.dataset.id);
      if (!b) return;
      resizeState = {
        blockId: b.id,
        origDur: b.durationBeats,
        origStart: b.startBeat,
        origRep: b.repeatCount,
        startX:  e.clientX,
        edge: isResizeL ? 'left' : 'right'
      };
      return;
    }

    // ---- Click on a block ----
    if (blockEl) {
      const b = blockById(blockEl.dataset.id);
      if (!b) return;

      // Ctrl+click on already-selected: duplicate selection
      if ((e.ctrlKey || e.metaKey) && selectedIds.has(b.id)) {
        duplicateSelection();
        return;
      }

      // Select
      if (!e.shiftKey) selectedIds.clear();
      selectedIds.add(b.id);
      refreshSelectionClasses();
      dispatch('sequencer:select', { blocks: getSelectedBlocks() });

      // Prepare for possible drag-move
      dragState = {
        blockId: b.id,
        origBeat: b.startBeat,
        origRowId: b.rowId,
        startX: e.clientX,
        startY: e.clientY,
        moved: false
      };
      return;
    }

    // ---- Click empty space ----
    selectedIds.clear();
    refreshSelectionClasses();

    // Shift+click = selection rectangle; plain click = pan/flick the grid
    if (e.shiftKey) {
      startSelectRect(e);
    } else {
      e.preventDefault();
      stopMomentum();
      panState = {
        startX: e.clientX,
        startY: e.clientY,
        scrollLeft: $gridScroll.scrollLeft,
        scrollTop: $gridScroll.scrollTop,
        lastX: e.clientX,
        lastY: e.clientY,
        lastTime: performance.now(),
        velocityX: 0,
        velocityY: 0
      };
      $gridScroll.style.cursor = 'grabbing';
    }
  }

  // ── Event: mousemove (document-level) ─────────────────
  function onMouseMove(e) {
    // Selection rectangle
    if (selectRect) { positionSelectRect(e); return; }

    // Right-click: check if drag threshold exceeded to start selection
    if (rightClickState && !rightClickState.dragging) {
      const dx = e.clientX - rightClickState.startX;
      const dy = e.clientY - rightClickState.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        rightClickState.dragging = true;
        selectedIds.clear();
        refreshSelectionClasses();
        startSelectRect(rightClickState.event);
        positionSelectRect(e);
      }
      return;
    }

    // Grid panning
    if (panState) {
      const dx = e.clientX - panState.startX;
      const dy = e.clientY - panState.startY;
      $gridScroll.scrollLeft = panState.scrollLeft - dx;
      $gridScroll.scrollTop  = panState.scrollTop  - dy;
      syncScroll();

      // Track velocity for momentum
      const now = performance.now();
      const dt = now - panState.lastTime;
      if (dt > 0) {
        const vx = (e.clientX - panState.lastX) / dt;
        const vy = (e.clientY - panState.lastY) / dt;
        // Smooth the velocity with previous value
        panState.velocityX = panState.velocityX * 0.4 + vx * 0.6;
        panState.velocityY = panState.velocityY * 0.4 + vy * 0.6;
      }
      panState.lastX = e.clientX;
      panState.lastY = e.clientY;
      panState.lastTime = now;
      return;
    }

    // Resize
    if (resizeState) {
      const b = blockById(resizeState.blockId);
      if (!b) return;
      const delta = (e.clientX - resizeState.startX) / beatW();
      const snap  = getSnapValue();
      const bw = beatW();
      const el = $gridRows.querySelector(`.seq-block[data-id="${b.id}"]`);

      if (resizeState.edge === 'left') {
        // Left resize: move start forward/back, shrink/grow duration
        const maxDelta = resizeState.origDur - snap; // can't shrink past 1 snap
        const clampedDelta = Math.min(maxDelta, delta);
        const newStart = Math.max(0, snapBeat(resizeState.origStart + clampedDelta));
        const newDur = Math.max(snap, resizeState.origDur - (newStart - resizeState.origStart));
        b.startBeat = newStart;
        b.durationBeats = newDur;
        if (el) {
          el.style.left  = (newStart * bw) + 'px';
          el.style.width = (newDur * bw) + 'px';
        }
      } else {
        // Right resize: grow/shrink from end
        const newDur = Math.max(snap, snapBeat(resizeState.origDur + delta));
        b.durationBeats = newDur;
        if (el) el.style.width = (newDur * bw) + 'px';
      }
      return;
    }

    // Drag-move
    if (dragState) {
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      if (!dragState.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) dragState.moved = true;
      if (!dragState.moved) return;

      const b = blockById(dragState.blockId);
      if (!b) return;
      const deltaBeat = dx / beatW();
      const newBeat = Math.max(0, snapBeat(dragState.origBeat + deltaBeat));
      const targetRow = rowFromClientY(e.clientY);
      if (!targetRow) return;

      // Live DOM preview
      const el = $gridRows.querySelector(`.seq-block[data-id="${b.id}"]`);
      if (el) {
        el.style.left = (newBeat * beatW()) + 'px';
        if (targetRow.id !== b.rowId) {
          const newLane = $gridRows.querySelector(`.seq-row[data-row-id="${targetRow.id}"] .row-lane`);
          if (newLane && el.parentElement !== newLane) newLane.appendChild(el);
        }
      }
      b.rowId     = targetRow.id;
      b.startBeat = newBeat;
    }
  }

  // ── Event: mouseup (document-level) ───────────────────
  function onMouseUp(e) {
    // Right-click release without drag = let contextmenu event handle it
    if (rightClickState) {
      const wasDragging = rightClickState.dragging;
      rightClickState = null;
      if (wasDragging && selectRect) { endSelectRect(e); return; }
      // If not dragging, do nothing here; contextmenu event fires naturally
      return;
    }

    // Selection rectangle (left click)
    if (selectRect) { endSelectRect(e); return; }

    // Grid panning - release and apply momentum
    if (panState) {
      $gridScroll.style.cursor = '';
      const vx = panState.velocityX;
      const vy = panState.velocityY;
      panState = null;
      if (Math.abs(vx) > 0.15 || Math.abs(vy) > 0.15) {
        startMomentum(vx * 1000, vy * 1000);
      }
      return;
    }

    // Resize end
    if (resizeState) {
      const b = blockById(resizeState.blockId);
      const changed = b && (b.durationBeats !== resizeState.origDur || b.startBeat !== resizeState.origStart);
      if (b && changed) {
        // Compute repeat count based on natural duration
        let naturalDur = 1;
        const snd = lookupSound(b.soundId);
        if (snd && snd.duration) {
          naturalDur = Math.max(getSnapValue(), snapBeat(snd.duration * (bpm / 60)));
        }
        b.repeatCount = naturalDur > 0 ? Math.max(1, Math.round(b.durationBeats / naturalDur)) : 1;

        if (resizeState.edge === 'left' && b.startBeat !== resizeState.origStart) {
          // Left resize changes both position and duration
          pushUndo({
            type: 'batch',
            actions: [
              { type: 'moveBlock', data: { id: b.id, fromRowId: b.rowId, fromBeat: resizeState.origStart, toRowId: b.rowId, toBeat: b.startBeat } },
              { type: 'resizeBlock', data: { id: b.id, fromDur: resizeState.origDur, fromRep: resizeState.origRep, toDur: b.durationBeats, toRep: b.repeatCount } }
            ]
          });
        } else {
          pushUndo({
            type: 'resizeBlock',
            data: {
              id: b.id,
              fromDur: resizeState.origDur, fromRep: resizeState.origRep,
              toDur: b.durationBeats, toRep: b.repeatCount
            }
          });
        }
      }
      resizeState = null;
      return;
    }

    // Drag-move end
    if (dragState) {
      if (dragState.moved) {
        const b = blockById(dragState.blockId);
        if (b) {
          pushUndo({
            type: 'moveBlock',
            data: {
              id: b.id,
              fromRowId: dragState.origRowId, fromBeat: dragState.origBeat,
              toRowId: b.rowId, toBeat: b.startBeat
            }
          });
        }
      }
      dragState = null;
    }
  }

  // ── Event: double-click on block ──────────────────────
  function onGridDblClick(e) {
    const blockEl = e.target.closest('.seq-block');
    if (!blockEl) return;
    const b = blockById(blockEl.dataset.id);
    if (b) dispatch('sequencer:edit', { block: clone(b) });
  }

  // ── Event: context menu (only if right-click didn't drag) ──
  function onGridContextMenu(e) {
    e.preventDefault();
    // If right-click was a drag-select, skip context menu
    if (rightClickState && rightClickState.dragging) return;
    if (selectRect) return;
    const blockEl = e.target.closest('.seq-block');

    if (blockEl) {
      const b = blockById(blockEl.dataset.id);
      if (!b) return;
      if (!selectedIds.has(b.id)) {
        selectedIds.clear();
        selectedIds.add(b.id);
        refreshSelectionClasses();
      }
      showCtx(e.clientX, e.clientY, [
        { label: 'Delete',     action() { getSelectedBlocks().forEach(x => removeBlock(x.id)); } },
        { label: 'Duplicate',  action() { duplicateSelection(); } },
        { label: 'Copy',       action() { copySelection(); } },
        { label: 'Cut',        action() { cutSelection(); } },
        { label: 'Edit Sound', action() { dispatch('sequencer:edit', { block: clone(b) }); } }
      ]);
      return;
    }

    // Empty space: paste
    const beat = snapBeat(beatFromClientX(e.clientX));
    const row  = rowFromClientY(e.clientY);
    if (row && clipboard && clipboard.length) {
      showCtx(e.clientX, e.clientY, [
        { label: 'Paste', action() { pasteAt(row.id, beat); } }
      ]);
    }
  }

  // ── Event: row label buttons (delegation) ─────────────
  function onRowLabelClick(e) {
    const btn = e.target.closest('.row-btn');
    if (!btn) return;
    const rowEl = e.target.closest('.seq-row');
    if (!rowEl) return;
    const row = rowById(rowEl.dataset.rowId);
    if (!row) return;

    const action = btn.dataset.action;
    if (action === 'mute') {
      row.muted = !row.muted;
      btn.classList.toggle('active', row.muted);
      rowEl.classList.toggle('muted', row.muted);
    } else if (action === 'solo') {
      row.solo = !row.solo;
      btn.classList.toggle('active', row.solo);
      rowEl.classList.toggle('solo', row.solo);
    } else if (action === 'delete') {
      removeRow(row.id);
    }
  }

  // ── Event: drag-drop from sound browser ───────────────
  function onGridDragOver(e) {
    if (e.dataTransfer.types.includes('text/sound-id')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function onGridDrop(e) {
    const soundId = e.dataTransfer.getData('text/sound-id');
    if (!soundId) return;
    e.preventDefault();
    const beat = snapBeat(beatFromClientX(e.clientX));
    const row  = rowFromClientY(e.clientY);
    if (!row) return;

    // Determine natural duration
    let dur = 1;
    const snd = lookupSound(soundId);
    if (snd && snd.duration) {
      const natural = snd.duration * (bpm / 60);
      dur = natural < 1 ? 1 : Math.max(1, snapBeat(natural));
    }

    addBlock(row.id, soundId, Math.max(0, beat), dur);
  }

  // ── Event: keyboard shortcuts ─────────────────────────
  function onKeyDown(e) {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) return;
    const ctrl = e.ctrlKey || e.metaKey;

    // Delete / Backspace
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size) {
      e.preventDefault();
      const sel = getSelectedBlocks();
      const actions = sel.map(b => {
        const d = clone(b);
        blocks = blocks.filter(x => x.id !== b.id);
        selectedIds.delete(b.id);
        return { type: 'removeBlock', data: d };
      });
      if (actions.length) pushUndo({ type: 'batch', actions });
      render();
      return;
    }

    // Ctrl+Z / Ctrl+Shift+Z
    if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (ctrl && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }

    // Ctrl+C / X / V / A
    if (ctrl && e.key === 'c' && selectedIds.size) { e.preventDefault(); copySelection(); return; }
    if (ctrl && e.key === 'x' && selectedIds.size) { e.preventDefault(); cutSelection(); return; }
    if (ctrl && e.key === 'v' && clipboard && clipboard.length) {
      e.preventDefault();
      const sel = getSelectedBlocks();
      if (sel.length) pasteAt(sel[0].rowId, sel[0].startBeat + sel[0].durationBeats);
      else pasteAt(rows[0].id, 0);
      return;
    }
    if (ctrl && e.key === 'a') {
      e.preventDefault();
      blocks.forEach(b => selectedIds.add(b.id));
      refreshSelectionClasses();
      return;
    }
  }

  // ── Event: zoom via scroll wheel ──────────────────────
  // ── Momentum scrolling (flick) ──────────────────────
  function startMomentum(vx, vy) {
    stopMomentum();
    const friction = 0.92;
    let velX = vx;
    let velY = vy;
    function tick() {
      velX *= friction;
      velY *= friction;
      $gridScroll.scrollLeft -= velX * (1 / 60);
      $gridScroll.scrollTop  -= velY * (1 / 60);
      syncScroll();
      if (Math.abs(velX) > 0.5 || Math.abs(velY) > 0.5) {
        momentumId = requestAnimationFrame(tick);
      } else {
        momentumId = null;
      }
    }
    momentumId = requestAnimationFrame(tick);
  }

  function stopMomentum() {
    if (momentumId) {
      cancelAnimationFrame(momentumId);
      momentumId = null;
    }
  }

  function onWheel(e) {
    // Ctrl+scroll = zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -4 : 4;
      if (e.shiftKey) zoomV(delta);
      else zoomH(delta);
      return;
    }
    // Shift+scroll or plain scroll = horizontal scroll
    if (e.shiftKey || (!e.ctrlKey && Math.abs(e.deltaX) < Math.abs(e.deltaY))) {
      e.preventDefault();
      $gridScroll.scrollLeft += e.deltaY * 3;
      syncScroll();
    }
  }

  // ── Event: loop handle dragging ───────────────────────
  function onRulerMouseDown(e) {
    const handle = e.target.closest('.loop-handle');
    if (!handle) {
      // Click on ruler = seek playhead to that beat
      e.preventDefault();
      const beat = snapBeat(Math.max(0, beatFromRulerX(e.clientX)));
      dispatch('sequencer:seek', { beat });
      updatePlayhead(beat);
      return;
    }
    e.preventDefault();
    const edge = handle.dataset.edge;
    const onMove = me => {
      const beat = snapBeat(Math.max(0, beatFromRulerX(me.clientX)));
      if (edge === 'start') loopStart = beat;
      else loopEnd = beat;
      renderLoopMarkers();
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Scroll sync ───────────────────────────────────────
  function syncScroll() {
    $rulerScroll.scrollLeft = $gridScroll.scrollLeft;
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    $area       = document.getElementById('sequencer-area');
    $rulerScroll = document.getElementById('ruler-scroll');
    $ruler      = document.getElementById('ruler');
    $gridScroll = document.getElementById('grid-scroll');
    $gridRows   = document.getElementById('grid-rows');
    $playhead   = document.getElementById('playhead');
    $addRowBtn  = document.getElementById('btn-add-row');

    // Reset state
    rows = [];
    blocks = [];
    selectedIds.clear();
    undoStack = [];
    redoStack = [];
    _id = 0;

    // Build initial rows
    for (let i = 1; i <= INITIAL_ROWS; i++) rows.push(makeRow(i));

    render();

    // Wire events
    $gridScroll.addEventListener('scroll', syncScroll);
    $gridRows.addEventListener('mousedown', onGridMouseDown);
    $gridRows.addEventListener('dblclick', onGridDblClick);
    $gridRows.addEventListener('contextmenu', onGridContextMenu);
    $gridRows.addEventListener('click', onRowLabelClick);
    $gridRows.addEventListener('dragover', onGridDragOver);
    $gridRows.addEventListener('drop', onGridDrop);
    $ruler.addEventListener('mousedown', onRulerMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    $area.addEventListener('wheel', onWheel, { passive: false });

    if ($addRowBtn) $addRowBtn.addEventListener('click', () => addRow());

    // Autosave timer
    if (autosaveTimer) clearInterval(autosaveTimer);
    autosaveTimer = setInterval(autosave, AUTOSAVE_MS);
  }

  // ── Public API ────────────────────────────────────────
  window.sequencer = {
    init,
    addRow,
    removeRow,
    addBlock,
    removeBlock,
    duplicateBlock,
    moveBlock,
    resizeBlock,
    getRows:           () => rows.slice(),
    getBlocks:         () => blocks.slice(),
    getBlocksForRow,
    getSelectedBlocks,
    getLastBeat,
    snapBeat,
    updatePlayhead,
    serialize,
    load,
    undo,
    redo,
    getAutosaves,
    loadAutosave,
    render,
    renderRuler,

    // Expose state via getters/setters
    get rows()      { return rows; },
    get blocks()    { return blocks; },
    get bpm()       { return bpm; },
    set bpm(v)      { bpm = v; },
    get loopStart() { return loopStart; },
    set loopStart(v){ loopStart = v; renderLoopMarkers(); },
    get loopEnd()   { return loopEnd; },
    set loopEnd(v)  { loopEnd = v; renderLoopMarkers(); },

    // Utility for other modules
    blockById,
    rowById,
    autosave
  };
})();
