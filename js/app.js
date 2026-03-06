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

  // ── Pattern Rule Generator ──
  function bindPatternRule() {
    const btn = document.getElementById('btn-pattern');
    if (!btn) return;

    btn.addEventListener('click', () => {
      let modal = document.getElementById('pattern-modal');
      if (modal) { modal.remove(); document.getElementById('pattern-backdrop')?.remove(); return; }

      // Build sound options from library
      const allSounds = lib.sounds || [];
      const soundOpts = allSounds.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

      // Build row options
      const rows = seq.getRows ? seq.getRows() : [];
      const rowOpts = rows.map(r => `<option value="${r.id}">Row ${r.number}</option>`).join('');

      modal = document.createElement('div');
      modal.id = 'pattern-modal';
      Object.assign(modal.style, {
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#1a1a2e', border: '1px solid #3a3a5c', borderRadius: '12px',
        padding: '24px', zIndex: '500', width: '520px', maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', color: '#e0e0f0', fontSize: '13px'
      });

      modal.innerHTML = `
        <h2 style="color:#00d4aa;margin-bottom:16px;font-size:16px;">Pattern Rule</h2>
        <div style="display:flex;flex-direction:column;gap:12px;">
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
            <input id="pr-beat" type="number" value="1" min="1" max="4" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
            <span style="color:#8888aa;font-size:11px;">(1 = .1, 2 = .2, 3 = .3, 4 = .4)</span>
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <label style="min-width:80px;color:#8888aa;">Every N bars</label>
            <input id="pr-every" type="number" value="2" min="1" max="64" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
          </div>
          <div style="display:flex;gap:10px;align-items:center;">
            <label style="min-width:80px;color:#8888aa;">From bar</label>
            <input id="pr-from" type="number" value="1" min="1" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
            <label style="color:#8888aa;">To bar</label>
            <input id="pr-to" type="number" value="32" min="1" step="1" style="width:60px;padding:5px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;">
          </div>
          <div style="border-top:1px solid #3a3a5c;padding-top:12px;margin-top:4px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="color:#8888aa;font-weight:600;">Shift Rules</span>
              <button id="pr-add-shift" class="action-btn" style="font-size:11px;">+ Add Shift</button>
            </div>
            <div id="pr-shifts" style="display:flex;flex-direction:column;gap:6px;"></div>
            <div style="color:#8888aa;font-size:10px;margin-top:4px;">e.g. "After bar 12, move to beat 4" shifts the pattern to .4 from bar 12 onward</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button id="pr-preview" class="action-btn" style="flex:1;">Preview (count)</button>
            <button id="pr-apply" class="action-btn accent" style="flex:1;">Apply</button>
            <button id="pr-close" class="action-btn" style="flex:1;">Cancel</button>
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

      modal.querySelector('#pr-add-shift').addEventListener('click', () => {
        const idx = shifts.length;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;gap:8px;align-items:center;';
        div.innerHTML = `
          <span style="color:#8888aa;">After bar</span>
          <input type="number" class="shift-bar" value="12" min="1" style="width:50px;padding:4px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;font-size:12px;">
          <span style="color:#8888aa;">move to beat</span>
          <input type="number" class="shift-beat" value="4" min="1" max="4" step="1" style="width:50px;padding:4px;background:#2a2a4a;border:1px solid #3a3a5c;border-radius:4px;color:#00d4aa;text-align:center;font-size:12px;">
          <button class="shift-del small-btn" style="width:20px;height:20px;font-size:11px;">&times;</button>
        `;
        div.querySelector('.shift-del').addEventListener('click', () => {
          shifts.splice(shifts.indexOf(div), 1);
          div.remove();
        });
        shifts.push(div);
        shiftsContainer.appendChild(div);
      });

      function generateBlocks() {
        const soundId = modal.querySelector('#pr-sound').value;
        const rowId = modal.querySelector('#pr-row').value;
        const baseBeat = parseInt(modal.querySelector('#pr-beat').value) || 1;
        const every = parseInt(modal.querySelector('#pr-every').value) || 1;
        const fromBar = parseInt(modal.querySelector('#pr-from').value) || 1;
        const toBar = parseInt(modal.querySelector('#pr-to').value) || 32;

        // Gather shift rules sorted by bar
        const shiftRules = [];
        for (const div of shifts) {
          const bar = parseInt(div.querySelector('.shift-bar').value) || 1;
          const beat = parseInt(div.querySelector('.shift-beat').value) || 1;
          shiftRules.push({ bar, beat });
        }
        shiftRules.sort((a, b) => a.bar - b.bar);

        const result = [];
        for (let bar = fromBar; bar <= toBar; bar++) {
          // Check if this bar matches the "every N" pattern
          if ((bar - fromBar) % every !== 0) continue;

          // Determine which beat to use based on shift rules
          let beatInBar = baseBeat;
          for (const rule of shiftRules) {
            if (bar >= rule.bar) beatInBar = rule.beat;
          }

          // Convert to absolute beat: (bar-1)*4 + (beatInBar-1)
          const absoluteBeat = (bar - 1) * 4 + (beatInBar - 1);
          result.push({ soundId, rowId, startBeat: absoluteBeat });
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

      modal.querySelector('#pr-close').addEventListener('click', () => {
        modal.remove();
        backdrop.remove();
      });
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
          if (data.projectName) setProjectName(data.projectName);
          if (data.templateName) setTemplateBadge(data.templateName);
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
          item.textContent = tmpl.name;
          item.addEventListener('mouseenter', () => item.style.background = '#2a2a4a');
          item.addEventListener('mouseleave', () => item.style.background = 'transparent');
          item.addEventListener('click', () => {
            if (confirm('Load template "' + tmpl.name + '"? This will replace your current work.')) {
              seq.load(tmpl.data);
              if (tmpl.data.bpm) {
                engine.bpm = tmpl.data.bpm;
                document.getElementById('bpm').value = tmpl.data.bpm;
              }
              setProjectName(tmpl.name);
              setTemplateBadge(tmpl.name);
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
