/**
 * Arrangement - manages tracks, blocks, timeline, drag/drop, and rendering.
 */
class Arrangement {
  constructor() {
    this.tracks = [];
    this.blocks = [];
    this.selectedBlock = null;
    this.totalBars = 64;
    this.nextTrackId = 1;
    this.nextBlockId = 1;
    this.scrollLeft = 0;

    this.trackColors = ['green', 'blue', 'purple', 'orange', 'cyan', 'pink', 'yellow', 'red'];
    this.colorIndex = 0;

    // Drag state
    this._dragBlock = null;
    this._dragOffsetX = 0;
    this._dragStartBeat = 0;
    this._resizing = null;

    this._initDOM();
    this._drawRuler();
    this._bindEvents();

    // Start with 8 tracks
    for (let i = 0; i < 8; i++) {
      this.addTrack(`Track ${i + 1}`);
    }
  }

  _initDOM() {
    this.tracksContainer = document.getElementById('tracks-container');
    this.ruler = document.getElementById('ruler');
    this.playhead = document.getElementById('playhead');
    this.addTrackBtn = document.getElementById('btn-add-track');
  }

  _bindEvents() {
    this.addTrackBtn.addEventListener('click', () => this.addTrack());

    // Sync horizontal scroll between ruler and tracks
    this.tracksContainer.addEventListener('scroll', () => {
      this.scrollLeft = this.tracksContainer.scrollLeft;
      this.ruler.style.transform = `translateX(-${this.scrollLeft}px)`;
    });

    // Click on track lane to seek
    this.tracksContainer.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('track-lane') || e.target.closest('.track-lane')) {
        if (!e.target.closest('.audio-block')) {
          const lane = e.target.classList.contains('track-lane') ? e.target : e.target.closest('.track-lane');
          const rect = lane.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const beat = audioEngine.pixelsToBeat(x);
          audioEngine.seekToBeat(Math.max(0, beat));
          this.updatePlayhead(beat);
          this.deselectAll();
        }
      }
    });

    // Global mouse events for dragging
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup', (e) => this._onMouseUp(e));

    // Context menu
    document.addEventListener('contextmenu', (e) => {
      const block = e.target.closest('.audio-block');
      if (block) {
        e.preventDefault();
        this._showContextMenu(e.clientX, e.clientY, block.dataset.blockId);
      }
    });

    document.addEventListener('click', () => this._hideContextMenu());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedBlock) {
          this.removeBlock(this.selectedBlock);
          this.selectedBlock = null;
          document.getElementById('sound-settings').classList.add('hidden');
        }
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (this.selectedBlock) this.duplicateBlock(this.selectedBlock);
      }
    });
  }

  _drawRuler() {
    this.ruler.innerHTML = '';
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    const beatsPerBar = audioEngine.beatsPerBar;

    for (let bar = 0; bar < this.totalBars; bar++) {
      const barEl = document.createElement('div');
      barEl.className = 'ruler-bar';
      barEl.style.left = `${bar * beatsPerBar * beatW}px`;
      barEl.textContent = bar + 1;
      this.ruler.appendChild(barEl);

      // Beat subdivisions
      for (let beat = 1; beat < beatsPerBar; beat++) {
        const beatEl = document.createElement('div');
        beatEl.className = 'ruler-beat';
        beatEl.style.left = `${(bar * beatsPerBar + beat) * beatW}px`;
        this.ruler.appendChild(beatEl);
      }
    }
  }

  addTrack(name) {
    const color = this.trackColors[this.colorIndex % this.trackColors.length];
    this.colorIndex++;

    const track = {
      id: this.nextTrackId++,
      name: name || `Track ${this.tracks.length + 1}`,
      color,
      muted: false,
      soloed: false,
      volume: 1,
      pan: 0,
    };

    this.tracks.push(track);
    this._renderTrack(track);
    return track;
  }

  removeTrack(trackId) {
    this.blocks = this.blocks.filter(b => b.trackId !== trackId);
    this.tracks = this.tracks.filter(t => t.id !== trackId);
    const row = this.tracksContainer.querySelector(`[data-track-id="${trackId}"]`);
    if (row) row.remove();
  }

  _renderTrack(track) {
    const row = document.createElement('div');
    row.className = 'track-row';
    row.dataset.trackId = track.id;

    row.innerHTML = `
      <div class="track-label">
        <div class="track-color" style="background: var(--${track.color})"></div>
        <span class="track-name" contenteditable="true">${track.name}</span>
        <div class="track-controls">
          <button class="track-btn mute-btn" title="Mute">M</button>
          <button class="track-btn solo-btn" title="Solo">S</button>
          <button class="track-btn del-btn" title="Delete track">&times;</button>
        </div>
      </div>
      <div class="track-lane" data-track-id="${track.id}"></div>
    `;

    // Track name editing
    const nameEl = row.querySelector('.track-name');
    nameEl.addEventListener('blur', () => {
      track.name = nameEl.textContent.trim() || track.name;
    });
    nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
    });

    // Mute
    row.querySelector('.mute-btn').addEventListener('click', (e) => {
      track.muted = !track.muted;
      e.target.classList.toggle('muted', track.muted);
    });

    // Solo
    row.querySelector('.solo-btn').addEventListener('click', (e) => {
      track.soloed = !track.soloed;
      e.target.classList.toggle('soloed', track.soloed);
      // If any track is soloed, mute all others
      const anySoloed = this.tracks.some(t => t.soloed);
      for (const t of this.tracks) {
        if (anySoloed) {
          t.muted = !t.soloed;
        } else {
          t.muted = false;
        }
        const btn = this.tracksContainer.querySelector(`[data-track-id="${t.id}"] .mute-btn`);
        if (btn) btn.classList.toggle('muted', t.muted);
      }
    });

    // Delete track
    row.querySelector('.del-btn').addEventListener('click', () => {
      if (this.tracks.length > 1) this.removeTrack(track.id);
    });

    // Drop zone
    const lane = row.querySelector('.track-lane');
    lane.addEventListener('dragover', (e) => {
      e.preventDefault();
      lane.classList.add('drag-over');
    });
    lane.addEventListener('dragleave', () => {
      lane.classList.remove('drag-over');
    });
    lane.addEventListener('drop', (e) => {
      e.preventDefault();
      lane.classList.remove('drag-over');
      const soundId = e.dataTransfer.getData('soundId');
      if (soundId) {
        const rect = lane.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const beat = this._snapToBeat(audioEngine.pixelsToBeat(x));
        this.addBlock(soundId, track.id, beat);
      }
    });

    this.tracksContainer.appendChild(row);
  }

  addBlock(soundId, trackId, startBeat, options = {}) {
    const durationBeats = options.durationBeats || audioEngine.getDurationBeats(soundId);
    const track = this.tracks.find(t => t.id === trackId);

    const block = {
      id: this.nextBlockId++,
      soundId,
      trackId,
      startBeat: Math.max(0, startBeat),
      durationBeats: Math.max(0.5, durationBeats),
      color: track ? track.color : 'green',
      options: {
        volume: 1,
        pitch: 0,
        pan: 0,
        startOffset: 0,
        fadeIn: 0,
        fadeOut: 0,
        reverse: false,
        ...options,
      },
    };

    this.blocks.push(block);
    this._renderBlock(block);
    return block;
  }

  _renderBlock(block) {
    const lane = this.tracksContainer.querySelector(`.track-lane[data-track-id="${block.trackId}"]`);
    if (!lane) return;

    const el = document.createElement('div');
    el.className = 'audio-block';
    el.dataset.blockId = block.id;
    el.dataset.color = block.color;

    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    el.style.left = `${block.startBeat * beatW}px`;
    el.style.width = `${block.durationBeats * beatW}px`;

    // Get sound name
    const sound = window.soundBrowser ? window.soundBrowser.getSoundById(block.soundId) : null;
    const name = sound ? sound.name : block.soundId;

    el.innerHTML = `
      <span class="block-name">${name}</span>
      <div class="resize-handle"></div>
    `;

    // Click to select
    el.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('resize-handle')) {
        this._startResize(e, block);
        return;
      }
      if (e.button === 0) {
        this.selectBlock(block.id);
        this._startBlockDrag(e, block, el);
      }
    });

    // Double-click to open settings
    el.addEventListener('dblclick', () => {
      this.selectBlock(block.id);
      this._openSettings(block);
    });

    lane.appendChild(el);
  }

  _startBlockDrag(e, block, el) {
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    const rect = el.getBoundingClientRect();
    this._dragBlock = block;
    this._dragOffsetX = e.clientX - rect.left;
    this._dragStartBeat = block.startBeat;
    el.style.zIndex = '10';
    el.style.opacity = '0.8';
  }

  _startResize(e, block) {
    e.stopPropagation();
    this._resizing = block;
  }

  _onMouseMove(e) {
    if (this._dragBlock) {
      const lane = this.tracksContainer.querySelector(`.track-lane[data-track-id="${this._dragBlock.trackId}"]`);
      if (!lane) return;
      const rect = lane.getBoundingClientRect();
      const x = e.clientX - rect.left - this._dragOffsetX;
      const beat = this._snapToBeat(audioEngine.pixelsToBeat(x));
      this._dragBlock.startBeat = Math.max(0, beat);
      this._updateBlockPosition(this._dragBlock);

      // Check if mouse moved to a different track
      const trackRow = document.elementFromPoint(e.clientX, e.clientY)?.closest('.track-row');
      if (trackRow) {
        const newTrackId = parseInt(trackRow.dataset.trackId);
        if (newTrackId && newTrackId !== this._dragBlock.trackId) {
          this._moveBlockToTrack(this._dragBlock, newTrackId);
        }
      }
    }

    if (this._resizing) {
      const lane = this.tracksContainer.querySelector(`.track-lane[data-track-id="${this._resizing.trackId}"]`);
      if (!lane) return;
      const rect = lane.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const endBeat = this._snapToBeat(audioEngine.pixelsToBeat(x));
      const newDuration = Math.max(0.5, endBeat - this._resizing.startBeat);
      this._resizing.durationBeats = newDuration;
      this._updateBlockPosition(this._resizing);
    }
  }

  _onMouseUp() {
    if (this._dragBlock) {
      const el = this.tracksContainer.querySelector(`[data-block-id="${this._dragBlock.id}"]`);
      if (el) {
        el.style.zIndex = '';
        el.style.opacity = '';
      }
      this._dragBlock = null;
    }
    this._resizing = null;
  }

  _moveBlockToTrack(block, newTrackId) {
    const oldEl = this.tracksContainer.querySelector(`[data-block-id="${block.id}"]`);
    if (oldEl) oldEl.remove();

    block.trackId = newTrackId;
    const track = this.tracks.find(t => t.id === newTrackId);
    if (track) block.color = track.color;

    this._renderBlock(block);

    // Re-apply drag state to new element
    const newEl = this.tracksContainer.querySelector(`[data-block-id="${block.id}"]`);
    if (newEl) {
      newEl.style.zIndex = '10';
      newEl.style.opacity = '0.8';
      newEl.classList.add('selected');
    }
  }

  _updateBlockPosition(block) {
    const el = this.tracksContainer.querySelector(`[data-block-id="${block.id}"]`);
    if (!el) return;
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    el.style.left = `${block.startBeat * beatW}px`;
    el.style.width = `${block.durationBeats * beatW}px`;
  }

  _snapToBeat(beat) {
    // Snap to nearest quarter beat
    return Math.round(beat * 4) / 4;
  }

  selectBlock(blockId) {
    this.deselectAll();
    this.selectedBlock = blockId;
    const el = this.tracksContainer.querySelector(`[data-block-id="${blockId}"]`);
    if (el) el.classList.add('selected');
  }

  deselectAll() {
    this.selectedBlock = null;
    this.tracksContainer.querySelectorAll('.audio-block.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('sound-settings').classList.add('hidden');
  }

  duplicateBlock(blockId) {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) return;
    const newBlock = this.addBlock(block.soundId, block.trackId, block.startBeat + block.durationBeats, {
      ...block.options,
      durationBeats: block.durationBeats,
    });
    this.selectBlock(newBlock.id);
  }

  removeBlock(blockId) {
    this.blocks = this.blocks.filter(b => b.id !== blockId);
    const el = this.tracksContainer.querySelector(`[data-block-id="${blockId}"]`);
    if (el) el.remove();
  }

  _openSettings(block) {
    const panel = document.getElementById('sound-settings');
    panel.classList.remove('hidden');

    const sound = window.soundBrowser ? window.soundBrowser.getSoundById(block.soundId) : null;
    document.getElementById('settings-title').textContent = sound ? sound.name : 'Sound Settings';

    const opts = block.options;
    document.getElementById('snd-volume').value = opts.volume;
    document.getElementById('snd-volume-val').textContent = Math.round(opts.volume * 100) + '%';
    document.getElementById('snd-pitch').value = opts.pitch;
    document.getElementById('snd-pitch-val').textContent = opts.pitch > 0 ? `+${opts.pitch}` : opts.pitch;
    document.getElementById('snd-pan').value = opts.pan;
    document.getElementById('snd-pan-val').textContent = opts.pan === 0 ? 'C' : opts.pan < 0 ? `L${Math.round(Math.abs(opts.pan) * 100)}` : `R${Math.round(opts.pan * 100)}`;
    document.getElementById('snd-start').value = opts.startOffset;
    document.getElementById('snd-fadein').value = opts.fadeIn;
    document.getElementById('snd-fadeout').value = opts.fadeOut;
    document.getElementById('snd-reverse').checked = opts.reverse;

    // Bind live updates
    const update = () => {
      opts.volume = parseFloat(document.getElementById('snd-volume').value);
      opts.pitch = parseInt(document.getElementById('snd-pitch').value);
      opts.pan = parseFloat(document.getElementById('snd-pan').value);
      opts.startOffset = parseInt(document.getElementById('snd-start').value) || 0;
      opts.fadeIn = parseInt(document.getElementById('snd-fadein').value) || 0;
      opts.fadeOut = parseInt(document.getElementById('snd-fadeout').value) || 0;
      opts.reverse = document.getElementById('snd-reverse').checked;

      document.getElementById('snd-volume-val').textContent = Math.round(opts.volume * 100) + '%';
      document.getElementById('snd-pitch-val').textContent = opts.pitch > 0 ? `+${opts.pitch}` : `${opts.pitch}`;
      const pan = opts.pan;
      document.getElementById('snd-pan-val').textContent = pan === 0 ? 'C' : pan < 0 ? `L${Math.round(Math.abs(pan) * 100)}` : `R${Math.round(pan * 100)}`;
    };

    ['snd-volume', 'snd-pitch', 'snd-pan', 'snd-start', 'snd-fadein', 'snd-fadeout', 'snd-reverse'].forEach(id => {
      const el = document.getElementById(id);
      el.removeEventListener('input', update);
      el.addEventListener('input', update);
    });
  }

  updatePlayhead(beat) {
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    const px = beat * beatW;
    const labelW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--label-w'));
    this.playhead.style.left = `${labelW + px - this.scrollLeft}px`;
    this.playhead.style.display = 'block';

    // Update position display
    const totalSeconds = beat * audioEngine.secondsPerBeat;
    const mins = Math.floor(totalSeconds / 60);
    const secs = (totalSeconds % 60).toFixed(1);
    document.getElementById('position').textContent = `${mins}:${secs.padStart(4, '0')}`;
  }

  getLastBeat() {
    if (this.blocks.length === 0) return 0;
    return Math.max(...this.blocks.map(b => b.startBeat + b.durationBeats));
  }

  _showContextMenu(x, y, blockId) {
    this._hideContextMenu();
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.innerHTML = `
      <div class="context-menu-item" data-action="settings">Settings</div>
      <div class="context-menu-item" data-action="duplicate">Duplicate (Cmd+D)</div>
      <div class="context-menu-item" data-action="preview">Preview Sound</div>
      <div class="context-menu-sep"></div>
      <div class="context-menu-item danger" data-action="delete">Delete</div>
    `;

    menu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const block = this.blocks.find(b => b.id === parseInt(blockId));
      if (!block) return;

      if (action === 'settings') { this.selectBlock(block.id); this._openSettings(block); }
      if (action === 'duplicate') this.duplicateBlock(block.id);
      if (action === 'preview') audioEngine.preview(block.soundId, block.options);
      if (action === 'delete') this.removeBlock(block.id);
      this._hideContextMenu();
    });

    document.body.appendChild(menu);
  }

  _hideContextMenu() {
    document.querySelectorAll('.context-menu').forEach(m => m.remove());
  }

  // Serialize for save
  serialize() {
    return {
      tracks: this.tracks,
      blocks: this.blocks,
      bpm: audioEngine.bpm,
      beatsPerBar: audioEngine.beatsPerBar,
      totalBars: this.totalBars,
    };
  }

  // Load from saved data
  load(data) {
    this.tracksContainer.innerHTML = '';
    this.tracks = [];
    this.blocks = [];
    this.totalBars = data.totalBars || 64;

    audioEngine.bpm = data.bpm || 128;
    audioEngine.beatsPerBar = data.beatsPerBar || 4;
    document.getElementById('bpm').value = audioEngine.bpm;

    for (const t of data.tracks) {
      this.tracks.push(t);
      this.nextTrackId = Math.max(this.nextTrackId, t.id + 1);
      this._renderTrack(t);
    }

    for (const b of data.blocks) {
      this.blocks.push(b);
      this.nextBlockId = Math.max(this.nextBlockId, b.id + 1);
      this._renderBlock(b);
    }

    this._drawRuler();
  }
}

window.arrangement = new Arrangement();
