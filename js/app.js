/**
 * App - wires together: transport, sequencer, sound browser, editor, templates, save/load, export.
 * Sqweeky Clean Productions
 */
(function () {
  const engine = window.audioEngine;
  const seq = window.sequencer;
  const lib = window.soundLibrary;
  const editor = window.soundEditor;

  // ── Project name & template badge ──
  function getProjectName() {
    const el = document.getElementById('project-name');
    return el ? el.textContent.trim() : 'Untitled Project';
  }

  function setProjectName(name) {
    const el = document.getElementById('project-name');
    if (el) el.textContent = name || 'Untitled Project';
  }

  function setTemplateBadge(name) {
    const el = document.getElementById('template-badge');
    if (!el) return;
    if (name) {
      el.textContent = 'Template: ' + name;
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  }

  // ── Warning banner ──
  function showBanner(msg, duration) {
    let banner = document.getElementById('info-banner');
    if (banner) banner.remove();
    banner = document.createElement('div');
    banner.id = 'info-banner';
    banner.style.cssText = 'position:fixed;top:48px;left:50%;transform:translateX(-50%);background:#b45309;color:#fff;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;z-index:600;box-shadow:0 4px 20px rgba(0,0,0,0.5);pointer-events:auto;cursor:pointer;';
    banner.textContent = msg;
    banner.addEventListener('click', () => banner.remove());
    document.body.appendChild(banner);
    if (duration) setTimeout(() => { if (banner.parentNode) banner.remove(); }, duration);
  }

  function checkRowCount() {
    const rows = seq.getRows ? seq.getRows() : [];
    const blocks = seq.getBlocks ? seq.getBlocks() : [];
    const usedRowIds = new Set(blocks.map(b => b.rowId));
    const usedCount = rows.filter(r => usedRowIds.has(r.id)).length;
    if (usedCount > 15) {
      showBanner('This template uses ' + usedCount + ' rows (more than 15). Scroll down to see all rows.', 8000);
    }
  }

  // ── Init ──
  function boot() {
    engine.init();
    lib.init(engine.ctx);
    seq.init();
    if (editor && editor.init) editor.init();
    buildSoundBrowser();
    bindTransport();
    bindSaveLoad();
    bindExport();
    bindImportSounds();
    bindTemplates();
    bindVersionHistory();
    bindTutorial();
    bindKeyboard();
    bindSeek();
    bindBrowserCollapse();
    bindPatternRule();
  }

  // ── Sound Browser (left panel) ──
  function buildSoundBrowser() {
    const container = document.getElementById('sound-collections');
    const searchInput = document.getElementById('search-sounds');
    if (!container) return;

    function render(filter) {
      container.innerHTML = '';
      const collections = lib.getCollections();

      for (const col of collections) {
        let sounds = lib.sounds.filter(s => s.collection === col.name);
        if (filter) {
          const q = filter.toLowerCase();
          sounds = sounds.filter(s => s.name.toLowerCase().includes(q));
          if (sounds.length === 0) continue;
        }

        const section = document.createElement('div');
        section.className = 'sound-collection';

        const header = document.createElement('div');
        header.className = 'collection-header';
        header.innerHTML = `<span class="arrow">&#9654;</span> ${col.name} <span class="count">(${sounds.length})</span>`;
        header.addEventListener('click', () => {
          header.classList.toggle('open');
          items.classList.toggle('open');
        });

        const items = document.createElement('div');
        items.className = 'collection-items';

        for (const sound of sounds) {
          const item = document.createElement('div');
          item.className = 'sound-item';
          item.draggable = true;
          item.dataset.soundId = sound.id;

          const previewBtn = document.createElement('button');
          previewBtn.className = 'preview-btn';
          previewBtn.innerHTML = '&#9654;';
          previewBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            engine.init();
            const buf = await lib.generateSound(sound.id);
            if (buf) {
              engine.buffers.set(sound.id, buf);
              engine.preview(sound.id);
            }
          });

          const name = document.createElement('span');
          name.className = 'name';
          name.textContent = sound.name;

          item.appendChild(previewBtn);
          item.appendChild(name);

          // Drag start
          item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/sound-id', sound.id);
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('dragging');
          });
          item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
          });

          items.appendChild(item);
        }

        section.appendChild(header);
        section.appendChild(items);
        container.appendChild(section);
      }
    }

    render();

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        render(searchInput.value);
      });
    }

    // Keyboard navigation for collections
    let focusedIdx = -1;

    function getHeaders() {
      return Array.from(container.querySelectorAll('.collection-header'));
    }

    function setFocus(idx) {
      const headers = getHeaders();
      // Clear previous
      headers.forEach(h => h.classList.remove('focused'));
      focusedIdx = Math.max(0, Math.min(idx, headers.length - 1));
      if (headers[focusedIdx]) {
        headers[focusedIdx].classList.add('focused');
        headers[focusedIdx].scrollIntoView({ block: 'nearest' });
      }
    }

    container.setAttribute('tabindex', '0');
    container.style.outline = 'none';

    container.addEventListener('keydown', (e) => {
      const headers = getHeaders();
      if (!headers.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setFocus(focusedIdx + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        // If a collection is open, close it and stay on that header
        if (focusedIdx >= 0 && headers[focusedIdx] && headers[focusedIdx].classList.contains('open')) {
          headers[focusedIdx].click();
          return;
        }
        setFocus(focusedIdx - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (focusedIdx >= 0 && headers[focusedIdx]) {
          headers[focusedIdx].click();
        }
      }
    });

    // Click on a header also sets focus index
    container.addEventListener('click', (e) => {
      const header = e.target.closest('.collection-header');
      if (!header) return;
      const headers = getHeaders();
      const idx = headers.indexOf(header);
      if (idx >= 0) setFocus(idx);
      container.focus();
    });
  }

  // ── Transport ──
  function bindTransport() {
    const btnPlay = document.getElementById('btn-play');
    const btnStop = document.getElementById('btn-stop');
    const btnLoop = document.getElementById('btn-loop');
    const bpmInput = document.getElementById('bpm');
    const posDisplay = document.getElementById('position');

    let looping = false;

    btnPlay.addEventListener('click', () => {
      engine.init();
      if (engine.playing) {
        engine.pause();
        btnPlay.classList.remove('active');
        btnPlay.innerHTML = '&#9654;';
      } else {
        const startBeat = engine.pauseOffset / engine.secondsPerBeat;
        if (startBeat > 0) seq.centerOnBeat(startBeat);
        playArrangement();
        btnPlay.classList.add('active');
        btnPlay.innerHTML = '&#10074;&#10074;';
      }
    });

    btnStop.addEventListener('click', () => {
      engine.stop();
      btnPlay.classList.remove('active');
      btnPlay.innerHTML = '&#9654;';
      seq.updatePlayhead(0);
    });

    btnLoop.addEventListener('click', () => {
      looping = !looping;
      btnLoop.classList.toggle('active', looping);
    });

    bpmInput.addEventListener('change', () => {
      engine.bpm = parseInt(bpmInput.value) || 128;
      bpmInput.value = engine.bpm;
    });

    // Playhead tick
    engine.onTick = (beat) => {
      seq.updatePlayhead(beat);
      seq.followPlayhead(beat);

      // Position display
      const bar = Math.floor(beat / 4) + 1;
      const beatInBar = Math.floor(beat % 4) + 1;
      if (posDisplay) posDisplay.textContent = `Bar ${bar}.${beatInBar}`;

      // Auto-stop or loop at end
      const lastBeat = seq.getLastBeat();
      if (lastBeat > 0 && beat >= lastBeat) {
        if (looping) {
          const loopStart = seq.loopStart || 0;
          engine.stop();
          engine.pauseOffset = loopStart * engine.secondsPerBeat;
          playArrangement();
        } else {
          engine.stop();
          btnPlay.classList.remove('active');
          btnPlay.innerHTML = '&#9654;';
          seq.updatePlayhead(0);
        }
      }
    };
  }

  // Play the full arrangement from current position
  async function playArrangement() {
    const blocks = seq.getBlocks();
    const rows = seq.getRows ? seq.getRows() : [];

    // Ensure all sounds are generated and loaded into engine
    const soundIds = [...new Set(blocks.map(b => b.soundId))];
    await Promise.all(soundIds.map(async (id) => {
      if (!engine.buffers.has(id)) {
        const buf = await lib.generateSound(id);
        if (buf) engine.buffers.set(id, buf);
      }
    }));

    // Build tracks array for engine (one per row for mute/solo support)
    const soloRows = rows.filter(r => r.solo);
    const hasSolo = soloRows.length > 0;

    const tracks = rows.map(r => ({
      id: r.id,
      muted: hasSolo ? !r.solo : r.muted,
      volume: 1,
      pan: 0
    }));

    // Expand blocks with repeat counts
    const expandedBlocks = [];
    for (const block of blocks) {
      const repeat = block.repeatCount || 1;
      const singleDur = block.durationBeats / repeat;
      for (let i = 0; i < repeat; i++) {
        expandedBlocks.push({
          ...block,
          id: block.id + '_r' + i,
          startBeat: block.startBeat + (i * singleDur),
          durationBeats: singleDur,
          trackId: block.rowId
        });
      }
    }

    engine.play(expandedBlocks, tracks);
  }

  // ── Saved Rules Storage ──
  const RULES_KEY = 'sqweeky_saved_rules';

  function getSavedRules() {
    try { return JSON.parse(localStorage.getItem(RULES_KEY) || '[]'); }
    catch { return []; }
  }

  function saveRule(rule) {
    const rules = getSavedRules();
    rule.id = 'rule-' + Date.now();
    rules.push(rule);
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
    return rule;
  }

  function deleteRule(ruleId) {
    const rules = getSavedRules().filter(r => r.id !== ruleId);
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
  }

  // Project-level rules (saved/loaded with project JSON)
  let projectRules = [];

  function getAllRules() {
    const global = getSavedRules().map(r => ({ ...r, source: 'global' }));
    const proj = projectRules.map(r => ({ ...r, source: 'project' }));
    return [...proj, ...global];
  }

  // ── Pattern Rule Generator ──
  function openPatternModal(prefill) {
    let modal = document.getElementById('pattern-modal');
    if (modal) { modal.remove(); document.getElementById('pattern-backdrop')?.remove(); return; }

    const pf = prefill || {};

    // Build sound options from library
    const allSounds = lib.sounds || [];
    const soundOpts = allSounds.map(s =>
      `<option value="${s.id}"${s.id === pf.soundId ? ' selected' : ''}>${s.name}</option>`
    ).join('');

    // Build row options
    const rows = seq.getRows ? seq.getRows() : [];
    const rowOpts = rows.map(r =>
      `<option value="${r.id}"${r.id === pf.rowId ? ' selected' : ''}>Row ${r.number}</option>`
    ).join('');

    const beatVal = pf.beat || 1;
    const everyVal = pf.every || 2;
    const fromVal = pf.fromBar || 1;
    const toVal = pf.toBar || 32;
    const ruleName = pf.name || '';

    modal = document.createElement('div');
    modal.id = 'pattern-modal';
    Object.assign(modal.style, {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      background: '#1a1a2e', border: '1px solid #3a3a5c', borderRadius: '12px',
      padding: '24px', zIndex: '500', width: '540px', maxHeight: '85vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: '#e0e0f0', fontSize: '13px'
    });

    modal.innerHTML = `
      <h2 style="color:#00d4aa;margin-bottom:16px;font-size:16px;">Pattern Rule</h2>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">Rule Name</label>
          <input id="pr-name" type="text" value="${ruleName}" placeholder="e.g. Kick every 2 bars" style="flex:1;padding:5px 8px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#e0e0f0;font-size:12px;">
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">Sound</label>
          <select id="pr-sound" style="flex:1;padding:5px 8px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#e0e0f0;font-size:12px;">
            ${soundOpts}
          </select>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">Row</label>
          <select id="pr-row" style="flex:1;padding:5px 8px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#e0e0f0;font-size:12px;">
            ${rowOpts}
          </select>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">Beat in bar</label>
          <input id="pr-beat" type="number" value="${beatVal}" min="1" max="4" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
          <span style="color:#8888aa;font-size:11px;">(1 = .1, 2 = .2, 3 = .3, 4 = .4)</span>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">Every N bars</label>
          <input id="pr-every" type="number" value="${everyVal}" min="1" max="64" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:80px;color:#8888aa;">From bar</label>
          <input id="pr-from" type="number" value="${fromVal}" min="1" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
          <label style="color:#8888aa;">To bar</label>
          <input id="pr-to" type="number" value="${toVal}" min="1" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
        </div>
        <div style="border-top:1px solid #3a3a5c;padding-top:12px;margin-top:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="color:#8888aa;font-weight:600;">Shift Rules</span>
            <button id="pr-add-shift" class="action-btn" style="font-size:11px;">+ Add Shift</button>
          </div>
          <div id="pr-shifts" style="display:flex;flex-direction:column;gap:6px;"></div>
          <div style="color:#8888aa;font-size:10px;margin-top:4px;">e.g. "After bar 12, move to beat 4" shifts the pattern to .4 from bar 12 onward</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <button id="pr-preview" class="action-btn" style="flex:1;min-width:100px;">Preview (count)</button>
          <button id="pr-apply" class="action-btn accent" style="flex:1;min-width:80px;">Apply</button>
          <button id="pr-save-global" class="action-btn" style="flex:1;min-width:80px;">Save (Global)</button>
          <button id="pr-save-project" class="action-btn" style="flex:1;min-width:80px;">Save (Project)</button>
          <button id="pr-close" class="action-btn" style="flex:1;min-width:80px;">Cancel</button>
        </div>
      </div>
    `;

    const backdrop = document.createElement('div');
    backdrop.id = 'pattern-backdrop';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:499;';
    backdrop.addEventListener('click', () => { modal.remove(); backdrop.remove(); });

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Shift rules management
    const shiftsContainer = modal.querySelector('#pr-shifts');
    const shifts = [];

    function addShiftRow(barVal, beatVal2) {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:8px;align-items:center;';
      div.innerHTML = `
        <span style="color:#8888aa;">After bar</span>
        <input type="number" class="shift-bar" value="${barVal || 12}" min="1" style="width:50px;padding:4px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;font-size:12px;">
        <span style="color:#8888aa;">move to beat</span>
        <input type="number" class="shift-beat" value="${beatVal2 || 4}" min="1" max="4" step="1" style="width:50px;padding:4px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;font-size:12px;">
        <button class="shift-del small-btn" style="width:20px;height:20px;font-size:11px;">&times;</button>
      `;
      div.querySelector('.shift-del').addEventListener('click', () => {
        shifts.splice(shifts.indexOf(div), 1);
        div.remove();
      });
      shifts.push(div);
      shiftsContainer.appendChild(div);
    }

    modal.querySelector('#pr-add-shift').addEventListener('click', () => addShiftRow());

    // Pre-fill shifts from prefill data
    if (pf.shifts) {
      for (const s of pf.shifts) addShiftRow(s.bar, s.beat);
    }

    function readFormAsRule() {
      const name = modal.querySelector('#pr-name').value.trim();
      const soundId = modal.querySelector('#pr-sound').value;
      const rowId = modal.querySelector('#pr-row').value;
      const beat = parseInt(modal.querySelector('#pr-beat').value) || 1;
      const every = parseInt(modal.querySelector('#pr-every').value) || 1;
      const fromBar = parseInt(modal.querySelector('#pr-from').value) || 1;
      const toBar = parseInt(modal.querySelector('#pr-to').value) || 32;

      const shiftRules = [];
      for (const div of shifts) {
        const bar = parseInt(div.querySelector('.shift-bar').value) || 1;
        const b = parseInt(div.querySelector('.shift-beat').value) || 1;
        shiftRules.push({ bar, beat: b });
      }
      shiftRules.sort((a, b) => a.bar - b.bar);

      return { name, soundId, rowId, beat, every, fromBar, toBar, shifts: shiftRules };
    }

    function generateBlocks() {
      const rule = readFormAsRule();
      const result = [];
      for (let bar = rule.fromBar; bar <= rule.toBar; bar++) {
        if ((bar - rule.fromBar) % rule.every !== 0) continue;
        let beatInBar = rule.beat;
        for (const s of rule.shifts) {
          if (bar >= s.bar) beatInBar = s.beat;
        }
        const absoluteBeat = (bar - 1) * 4 + (beatInBar - 1);
        result.push({ soundId: rule.soundId, rowId: rule.rowId, startBeat: absoluteBeat });
      }
      return result;
    }

    modal.querySelector('#pr-preview').addEventListener('click', () => {
      const blocks = generateBlocks();
      modal.querySelector('#pr-preview').textContent = `Preview (${blocks.length} blocks)`;
    });

    modal.querySelector('#pr-apply').addEventListener('click', () => {
      const newBlocks = generateBlocks();
      for (const b of newBlocks) {
        seq.addBlock(b.rowId, b.soundId, b.startBeat, 1);
      }
      modal.remove();
      backdrop.remove();
    });

    modal.querySelector('#pr-save-global').addEventListener('click', () => {
      const rule = readFormAsRule();
      if (!rule.name) { alert('Give the rule a name first.'); return; }
      saveRule(rule);
      alert('Rule "' + rule.name + '" saved globally.');
    });

    modal.querySelector('#pr-save-project').addEventListener('click', () => {
      const rule = readFormAsRule();
      if (!rule.name) { alert('Give the rule a name first.'); return; }
      rule.id = 'rule-' + Date.now();
      projectRules.push(rule);
      alert('Rule "' + rule.name + '" saved to project. It will be included when you save the project.');
    });

    modal.querySelector('#pr-close').addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  }

  // ── Apply Saved Rule picker ──
  function openRulePicker(prefill) {
    const pf = prefill || {};
    const rules = getAllRules();

    if (rules.length === 0) {
      alert('No saved rules yet. Create a rule first using "Create Rule..." or the Pattern button, then save it.');
      return;
    }

    let modal = document.getElementById('rule-picker-modal');
    if (modal) { modal.remove(); document.getElementById('rule-picker-backdrop')?.remove(); return; }

    modal = document.createElement('div');
    modal.id = 'rule-picker-modal';
    Object.assign(modal.style, {
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      background: '#1a1a2e', border: '1px solid #3a3a5c', borderRadius: '12px',
      padding: '24px', zIndex: '500', width: '480px', maxHeight: '70vh', overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: '#e0e0f0', fontSize: '13px'
    });

    let html = `<h2 style="color:#00d4aa;margin-bottom:16px;font-size:16px;">Saved Rules</h2>`;

    // Optional: override sound/row
    const allSounds = lib.sounds || [];
    const soundOpts = allSounds.map(s =>
      `<option value="${s.id}"${s.id === pf.soundId ? ' selected' : ''}>${s.name}</option>`
    ).join('');
    const rows = seq.getRows ? seq.getRows() : [];
    const rowOpts = rows.map(r =>
      `<option value="${r.id}"${r.id === pf.rowId ? ' selected' : ''}>Row ${r.number}</option>`
    ).join('');

    html += `
      <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #3a3a5c;">
        <div style="color:#8888aa;font-size:11px;margin-bottom:6px;">Override sound/row (optional, leave to use rule's original):</div>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;">
          <label style="min-width:50px;color:#8888aa;">Sound</label>
          <select id="rp-sound" style="flex:1;padding:4px 6px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#e0e0f0;font-size:12px;">
            <option value="">-- Use rule's sound --</option>
            ${soundOpts}
          </select>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="min-width:50px;color:#8888aa;">Row</label>
          <select id="rp-row" style="flex:1;padding:4px 6px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#e0e0f0;font-size:12px;">
            <option value="">-- Use rule's row --</option>
            ${rowOpts}
          </select>
        </div>
      </div>
    `;

    html += `<div id="rp-list" style="display:flex;flex-direction:column;gap:4px;"></div>`;
    html += `<button id="rp-close" class="action-btn" style="margin-top:14px;width:100%;">Close</button>`;

    modal.innerHTML = html;

    const backdrop = document.createElement('div');
    backdrop.id = 'rule-picker-backdrop';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:499;';
    backdrop.addEventListener('click', () => { modal.remove(); backdrop.remove(); });

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    const list = modal.querySelector('#rp-list');

    for (const rule of rules) {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;transition:background 0.1s;';
      item.addEventListener('mouseenter', () => item.style.background = '#2a2a4a');
      item.addEventListener('mouseleave', () => item.style.background = 'transparent');

      const sourceTag = rule.source === 'project'
        ? '<span style="background:#3a6a3a;color:#aaffaa;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:4px;">project</span>'
        : '<span style="background:#3a3a6a;color:#aaaaff;padding:1px 5px;border-radius:3px;font-size:10px;margin-left:4px;">global</span>';

      const info = document.createElement('div');
      info.style.cssText = 'flex:1;';
      info.innerHTML = `
        <div style="font-weight:600;color:#e0e0f0;">${rule.name || 'Unnamed'}${sourceTag}</div>
        <div style="color:#8888aa;font-size:11px;">Beat ${rule.beat}, every ${rule.every} bars, bars ${rule.fromBar}-${rule.toBar}${rule.shifts && rule.shifts.length ? ', ' + rule.shifts.length + ' shift(s)' : ''}</div>
      `;

      const applyBtn = document.createElement('button');
      applyBtn.className = 'action-btn accent';
      applyBtn.textContent = 'Apply';
      applyBtn.style.cssText = 'font-size:11px;padding:4px 10px;';
      applyBtn.addEventListener('click', () => {
        const overrideSound = modal.querySelector('#rp-sound').value;
        const overrideRow = modal.querySelector('#rp-row').value;
        const soundId = overrideSound || rule.soundId;
        const rowId = overrideRow || rule.rowId;
        if (!soundId) { alert('This rule has no sound set. Pick one from the override dropdown.'); return; }
        if (!rowId) { alert('This rule has no row set. Pick one from the override dropdown.'); return; }

        for (let bar = rule.fromBar; bar <= rule.toBar; bar++) {
          if ((bar - rule.fromBar) % rule.every !== 0) continue;
          let beatInBar = rule.beat;
          if (rule.shifts) {
            for (const s of rule.shifts) {
              if (bar >= s.bar) beatInBar = s.beat;
            }
          }
          const absoluteBeat = (bar - 1) * 4 + (beatInBar - 1);
          seq.addBlock(rowId, soundId, absoluteBeat, 1);
        }
        modal.remove();
        backdrop.remove();
      });

      const editBtn = document.createElement('button');
      editBtn.className = 'action-btn';
      editBtn.textContent = 'Edit';
      editBtn.style.cssText = 'font-size:11px;padding:4px 10px;';
      editBtn.addEventListener('click', () => {
        modal.remove();
        backdrop.remove();
        openPatternModal({
          name: rule.name,
          soundId: rule.soundId,
          rowId: rule.rowId,
          beat: rule.beat,
          every: rule.every,
          fromBar: rule.fromBar,
          toBar: rule.toBar,
          shifts: rule.shifts
        });
      });

      const delBtn = document.createElement('button');
      delBtn.className = 'action-btn';
      delBtn.textContent = 'X';
      delBtn.title = 'Delete rule';
      delBtn.style.cssText = 'font-size:11px;padding:4px 8px;color:#ff6666;';
      delBtn.addEventListener('click', () => {
        if (!confirm('Delete rule "' + (rule.name || 'Unnamed') + '"?')) return;
        if (rule.source === 'global') {
          deleteRule(rule.id);
        } else {
          projectRules = projectRules.filter(r => r.id !== rule.id);
        }
        item.remove();
      });

      item.appendChild(info);
      item.appendChild(applyBtn);
      item.appendChild(editBtn);
      item.appendChild(delBtn);
      list.appendChild(item);
    }

    modal.querySelector('#rp-close').addEventListener('click', () => {
      modal.remove();
      backdrop.remove();
    });
  }

  function bindPatternRule() {
    const btn = document.getElementById('btn-pattern');
    if (!btn) return;
    btn.addEventListener('click', () => openPatternModal());

    // Listen for context menu events from sequencer
    document.addEventListener('sequencer:create-rule', (e) => {
      openPatternModal(e.detail);
    });
    document.addEventListener('sequencer:apply-rule', (e) => {
      openRulePicker(e.detail);
    });
  }

  // ── Collapse sound browser ──
  function bindBrowserCollapse() {
    const btn = document.getElementById('btn-collapse-browser');
    const panel = document.getElementById('sound-browser');
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      panel.classList.toggle('collapsed');
      btn.innerHTML = panel.classList.contains('collapsed') ? '&#9654;' : '&#9664;';
      btn.title = panel.classList.contains('collapsed') ? 'Expand panel' : 'Collapse panel';
    });
  }

  // ── Seek (click ruler to reposition playhead) ──
  function bindSeek() {
    document.addEventListener('sequencer:seek', (e) => {
      const beat = e.detail.beat;
      const wasPlaying = engine.playing;
      if (wasPlaying) engine.pause();
      engine.pauseOffset = beat * engine.secondsPerBeat;
      seq.updatePlayhead(beat);
      if (wasPlaying) playArrangement();
    });
  }

  // ── Keyboard shortcuts ──
  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;

      // Space = play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-play').click();
      }

      // Ctrl+Z = undo
      if (e.ctrlKey && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        if (seq.undo) seq.undo();
      }

      // Ctrl+Shift+Z = redo
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        if (seq.redo) seq.redo();
      }

      // Ctrl+S = save
      if (e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        document.getElementById('btn-save').click();
      }

      // R = restart playback from beat 0
      if (e.code === 'KeyR' && !e.ctrlKey) {
        e.preventDefault();
        const wasPlaying = engine.playing;
        engine.stop();
        engine.pauseOffset = 0;
        seq.updatePlayhead(0);
        if (wasPlaying) {
          playArrangement();
          document.getElementById('btn-play').classList.add('active');
          document.getElementById('btn-play').innerHTML = '&#10074;&#10074;';
        }
      }

      // Left/Right arrow = jump to nearest 16-beat boundary
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        const currentBeat = engine.playing
          ? (engine.ctx.currentTime - engine.startTime) / engine.secondsPerBeat
          : engine.pauseOffset / engine.secondsPerBeat;
        let targetBeat;
        if (e.code === 'ArrowLeft') {
          targetBeat = Math.floor((currentBeat - 0.01) / 16) * 16;
          if (targetBeat < 0) targetBeat = 0;
        } else {
          targetBeat = Math.ceil((currentBeat + 0.01) / 16) * 16;
        }
        const wasPlaying = engine.playing;
        if (wasPlaying) engine.pause();
        engine.pauseOffset = targetBeat * engine.secondsPerBeat;
        seq.updatePlayhead(targetBeat);
        seq.centerOnBeat(targetBeat);
        if (wasPlaying) playArrangement();
      }
    });
  }

  // ── Save/Load Project ──
  function bindSaveLoad() {
    document.getElementById('btn-save').addEventListener('click', () => {
      const data = seq.serialize();
      data.bpm = engine.bpm;
      data.appVersion = '2.0';
      data.projectName = getProjectName();
      if (projectRules.length) data.rules = projectRules;
      const badge = document.getElementById('template-badge');
      if (badge && badge.style.display !== 'none') {
        data.templateName = badge.textContent.replace('Template: ', '');
      }

      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const safeName = data.projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'untitled';
      a.download = safeName + '.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById('btn-load').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (data.bpm) {
            engine.bpm = data.bpm;
            document.getElementById('bpm').value = data.bpm;
          }
          seq.load(data);
          projectRules = data.rules || [];
          if (data.projectName) setProjectName(data.projectName);
          if (data.templateName) setTemplateBadge(data.templateName);
          checkRowCount();
        } catch (err) {
          alert('Failed to load project: ' + err.message);
        }
      });
      input.click();
    });
  }

  // ── Export WAV ──
  function bindExport() {
    document.getElementById('btn-export').addEventListener('click', async () => {
      const lastBeat = seq.getLastBeat();
      if (lastBeat === 0) return alert('No sounds placed yet. Add some sounds to the grid first.');

      const btn = document.getElementById('btn-export');
      btn.textContent = 'Exporting...';
      btn.disabled = true;

      try {
        // Ensure all sounds are loaded
        const blocks = seq.getBlocks();
        const soundIds = [...new Set(blocks.map(b => b.soundId))];
        await Promise.all(soundIds.map(async (id) => {
          if (!engine.buffers.has(id)) {
            const buf = await lib.generateSound(id);
            if (buf) engine.buffers.set(id, buf);
          }
        }));

        const rows = seq.getRows ? seq.getRows() : [];
        const soloRows = rows.filter(r => r.solo);
        const hasSolo = soloRows.length > 0;

        const tracks = rows.map(r => ({
          id: r.id,
          muted: hasSolo ? !r.solo : r.muted,
          volume: 1,
          pan: 0
        }));

        // Expand repeats
        const expandedBlocks = [];
        for (const block of blocks) {
          const repeat = block.repeatCount || 1;
          const singleDur = block.durationBeats / repeat;
          for (let i = 0; i < repeat; i++) {
            expandedBlocks.push({
              ...block,
              id: block.id + '_r' + i,
              startBeat: block.startBeat + (i * singleDur),
              durationBeats: singleDur,
              trackId: block.rowId
            });
          }
        }

        const wav = await engine.exportWAV(expandedBlocks, tracks, lastBeat + 1);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(wav);
        a.download = 'sqweeky-clean-export.wav';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.error('Export failed:', err);
        alert('Export failed: ' + err.message);
      }

      btn.textContent = 'Export WAV';
      btn.disabled = false;
    });
  }

  // ── Import custom sounds ──
  function bindImportSounds() {
    const btnImport = document.getElementById('btn-import-sounds');
    const fileInput = document.getElementById('file-input');

    btnImport.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      engine.init();
      for (const file of e.target.files) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const name = file.name.replace(/\.[^.]+$/, '');
          const id = 'user-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          await engine.loadSound(id, arrayBuffer);

          // Add to library
          lib.sounds.push({
            id,
            name,
            collection: 'user',
            category: 'default',
            duration: engine.getDuration(id)
          });
          lib._cache.set(id, engine.buffers.get(id));
        } catch (err) {
          console.warn('Failed to load:', file.name, err);
        }
      }
      buildSoundBrowser();
      fileInput.value = '';
    });
  }

  // ── Templates ──
  function bindTemplates() {
    const btn = document.getElementById('btn-templates');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Build template modal
      let modal = document.getElementById('template-modal');
      if (modal) { modal.remove(); return; }

      modal = document.createElement('div');
      modal.id = 'template-modal';
      Object.assign(modal.style, {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#1a1a2e', border: '1px solid #3a3a5c', borderRadius: '12px',
        padding: '24px', zIndex: '500', maxHeight: '70vh', overflowY: 'auto',
        width: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      });

      const title = document.createElement('h2');
      title.textContent = 'Templates';
      title.style.cssText = 'color:#00d4aa;margin-bottom:16px;font-size:16px;';
      modal.appendChild(title);

      const templates = window.templates || [];
      const categories = ['Drum and Bass', 'House', 'Dubstep', 'Electronic'];

      for (const cat of categories) {
        const catTemplates = templates.filter(t => t.category === cat);
        if (catTemplates.length === 0) continue;

        const catTitle = document.createElement('h3');
        catTitle.textContent = cat;
        catTitle.style.cssText = 'color:#e0e0f0;font-size:13px;margin:12px 0 6px;';
        modal.appendChild(catTitle);

        for (const tmpl of catTemplates) {
          const item = document.createElement('div');
          item.style.cssText = 'padding:8px 12px;cursor:pointer;border-radius:6px;margin:2px 0;font-size:12px;color:#e0e0f0;transition:background 0.1s;';
          const usedIds = new Set(tmpl.data.blocks.map(b => b.rowId));
          const usedRows = usedIds.size;
          item.textContent = tmpl.name + (usedRows > 15 ? '  (' + usedRows + ' rows)' : '');
          item.addEventListener('mouseenter', () => item.style.background = '#2a2a4a');
          item.addEventListener('mouseleave', () => item.style.background = 'transparent');
          item.addEventListener('click', () => {
              seq.load(tmpl.data);
              if (tmpl.data.bpm) {
                engine.bpm = tmpl.data.bpm;
                document.getElementById('bpm').value = tmpl.data.bpm;
              }
              setProjectName(tmpl.name);
              setTemplateBadge(tmpl.name);
              checkRowCount();
              modal.remove();
              backdrop.remove();
          });
          modal.appendChild(item);
        }
      }

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'action-btn';
      closeBtn.style.marginTop = '16px';
      closeBtn.addEventListener('click', () => { modal.remove(); backdrop.remove(); });
      modal.appendChild(closeBtn);

      const backdrop = document.createElement('div');
      backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:499;';
      backdrop.addEventListener('click', () => { modal.remove(); backdrop.remove(); });

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    });
  }

  // ── Version History ──
  function bindVersionHistory() {
    const btn = document.getElementById('btn-versions');
    if (!btn) return;

    btn.addEventListener('click', () => {
      let modal = document.getElementById('version-modal');
      if (modal) { modal.remove(); return; }

      modal = document.createElement('div');
      modal.id = 'version-modal';
      Object.assign(modal.style, {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#1a1a2e', border: '1px solid #3a3a5c', borderRadius: '12px',
        padding: '24px', zIndex: '500', maxHeight: '60vh', overflowY: 'auto',
        width: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
      });

      const title = document.createElement('h2');
      title.textContent = 'Version History';
      title.style.cssText = 'color:#00d4aa;margin-bottom:16px;font-size:16px;';
      modal.appendChild(title);

      const saves = seq.getAutosaves ? seq.getAutosaves() : [];

      if (saves.length === 0) {
        const empty = document.createElement('p');
        empty.textContent = 'No autosaves yet. Versions are saved every 10 minutes.';
        empty.style.cssText = 'color:#8888aa;font-size:12px;';
        modal.appendChild(empty);
      } else {
        for (const save of saves) {
          const item = document.createElement('div');
          item.style.cssText = 'padding:8px 12px;cursor:pointer;border-radius:6px;margin:2px 0;display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#e0e0f0;transition:background 0.1s;';

          const date = new Date(save.timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = date.toLocaleDateString();

          item.innerHTML = `<span>${dateStr} ${timeStr}</span><span style="color:#8888aa">${save.blockCount} blocks</span>`;
          item.addEventListener('mouseenter', () => item.style.background = '#2a2a4a');
          item.addEventListener('mouseleave', () => item.style.background = 'transparent');
          item.addEventListener('click', () => {
            if (confirm('Restore this version? Current work will be lost.')) {
              seq.loadAutosave(save.index);
              modal.remove();
              backdrop.remove();
            }
          });
          modal.appendChild(item);
        }
      }

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close';
      closeBtn.className = 'action-btn';
      closeBtn.style.marginTop = '16px';
      closeBtn.addEventListener('click', () => { modal.remove(); backdrop.remove(); });
      modal.appendChild(closeBtn);

      const backdrop = document.createElement('div');
      backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:499;';
      backdrop.addEventListener('click', () => { modal.remove(); backdrop.remove(); });

      document.body.appendChild(backdrop);
      document.body.appendChild(modal);
    });
  }

  // ── Tutorial link ──
  function bindTutorial() {
    const btn = document.getElementById('btn-tutorial');
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.open('tutorial.html', '_blank');
    });
  }

  // ── Autosave timer ──
  function startAutosave() {
    setInterval(() => {
      if (seq.getBlocks && seq.getBlocks().length > 0) {
        const data = seq.serialize();
        data.bpm = engine.bpm;
        data.timestamp = Date.now();

        // Rolling 9 slots (90 minutes at 10-minute intervals)
        const slotKey = 'sqweeky_autosave_slot';
        let slot = parseInt(localStorage.getItem(slotKey) || '0');
        localStorage.setItem('sqweeky_autosave_' + slot, JSON.stringify(data));
        slot = (slot + 1) % 9;
        localStorage.setItem(slotKey, slot.toString());

        console.log('[Autosave] Saved to slot', (slot - 1 + 9) % 9);
      }
    }, 10 * 60 * 1000); // Every 10 minutes
  }

  // ── Boot ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { boot(); startAutosave(); });
  } else {
    boot();
    startAutosave();
  }
})();
