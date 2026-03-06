/**
 * Sound Browser - manages sound library, collections, drag from browser to arrangement.
 */
class SoundBrowser {
  constructor() {
    this.sounds = [];           // { id, name, collection, url, duration }
    this.collections = new Map(); // collection name -> [sounds]
    this.nextSoundId = 1;

    this._initDOM();
    this._bindEvents();
    this._loadDefaultSounds();
  }

  _initDOM() {
    this.collectionsEl = document.getElementById('sound-collections');
    this.searchInput = document.getElementById('search-sounds');
    this.fileInput = document.getElementById('file-input');
    this.addBtn = document.getElementById('btn-add-sounds');
  }

  _bindEvents() {
    this.addBtn.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this._handleFileUpload(e));
    this.searchInput.addEventListener('input', () => this._filterSounds());
  }

  async _handleFileUpload(e) {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const id = `user_${this.nextSoundId++}`;
      const collection = 'My Sounds';

      try {
        const buffer = await audioEngine.loadSound(id, arrayBuffer.slice(0));
        const sound = {
          id,
          name: file.name.replace(/\.[^.]+$/, ''),
          collection,
          duration: buffer.duration,
          isUser: true,
        };
        this.sounds.push(sound);

        if (!this.collections.has(collection)) {
          this.collections.set(collection, []);
        }
        this.collections.get(collection).push(sound);
      } catch (err) {
        console.error(`Failed to load ${file.name}:`, err);
      }
    }

    this._render();
    this.fileInput.value = '';
  }

  async addSoundFromURL(url, name, collection) {
    const id = `snd_${this.nextSoundId++}`;
    try {
      const buffer = await audioEngine.loadSoundFromURL(id, url);
      const sound = {
        id,
        name,
        collection,
        url,
        duration: buffer.duration,
      };
      this.sounds.push(sound);

      if (!this.collections.has(collection)) {
        this.collections.set(collection, []);
      }
      this.collections.get(collection).push(sound);
      return sound;
    } catch (err) {
      console.error(`Failed to load ${name} from ${url}:`, err);
      return null;
    }
  }

  getSoundById(id) {
    return this.sounds.find(s => s.id === id);
  }

  _formatDuration(sec) {
    if (sec < 1) return `${Math.round(sec * 1000)}ms`;
    return sec.toFixed(1) + 's';
  }

  _render() {
    this.collectionsEl.innerHTML = '';
    const searchTerm = this.searchInput.value.toLowerCase();

    for (const [name, sounds] of this.collections) {
      const filtered = searchTerm
        ? sounds.filter(s => s.name.toLowerCase().includes(searchTerm))
        : sounds;

      if (filtered.length === 0) continue;

      const collDiv = document.createElement('div');
      collDiv.className = 'sound-collection';

      const header = document.createElement('div');
      header.className = 'collection-header';
      header.innerHTML = `<span class="arrow">&#9654;</span> ${name} <span class="count">(${filtered.length})</span>`;
      header.addEventListener('click', () => {
        header.classList.toggle('open');
        itemsDiv.classList.toggle('open');
      });

      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'collection-items';

      for (const sound of filtered) {
        const item = document.createElement('div');
        item.className = 'sound-item';
        item.draggable = true;
        item.innerHTML = `
          <button class="preview-btn" title="Preview">&#9654;</button>
          <span class="name">${sound.name}</span>
          <span class="duration">${this._formatDuration(sound.duration)}</span>
        `;

        // Preview
        item.querySelector('.preview-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          audioEngine.preview(sound.id);
        });

        // Drag start
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('soundId', sound.id);
          item.classList.add('dragging');
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
        });

        itemsDiv.appendChild(item);
      }

      collDiv.appendChild(header);
      collDiv.appendChild(itemsDiv);
      this.collectionsEl.appendChild(collDiv);
    }
  }

  _filterSounds() {
    this._render();
  }

  async _loadDefaultSounds() {
    // Generate synthetic sounds using Web Audio API oscillators
    // These are starter sounds so the app works immediately without external files
    audioEngine.init();
    const ctx = audioEngine.ctx;

    const synths = [
      // Kicks
      { name: 'Kick - Deep', collection: 'Kicks', fn: (ctx) => this._genKick(ctx, 60, 0.5, 0.3) },
      { name: 'Kick - Punchy', collection: 'Kicks', fn: (ctx) => this._genKick(ctx, 80, 0.4, 0.2) },
      { name: 'Kick - Sub', collection: 'Kicks', fn: (ctx) => this._genKick(ctx, 45, 0.7, 0.4) },
      { name: 'Kick - Hard', collection: 'Kicks', fn: (ctx) => this._genKick(ctx, 100, 0.3, 0.15) },
      // Snares
      { name: 'Snare - Tight', collection: 'Snares', fn: (ctx) => this._genSnare(ctx, 0.2, 0.6) },
      { name: 'Snare - Loose', collection: 'Snares', fn: (ctx) => this._genSnare(ctx, 0.35, 0.4) },
      { name: 'Snare - Clap', collection: 'Snares', fn: (ctx) => this._genClap(ctx, 0.25) },
      // Hi-Hats
      { name: 'Hat - Closed', collection: 'Hi-Hats', fn: (ctx) => this._genHihat(ctx, 0.05) },
      { name: 'Hat - Open', collection: 'Hi-Hats', fn: (ctx) => this._genHihat(ctx, 0.25) },
      { name: 'Hat - Pedal', collection: 'Hi-Hats', fn: (ctx) => this._genHihat(ctx, 0.1) },
      // Percussion
      { name: 'Rim Shot', collection: 'Percussion', fn: (ctx) => this._genRim(ctx) },
      { name: 'Tom - Low', collection: 'Percussion', fn: (ctx) => this._genKick(ctx, 90, 0.3, 0.25) },
      { name: 'Tom - High', collection: 'Percussion', fn: (ctx) => this._genKick(ctx, 150, 0.2, 0.2) },
      { name: 'Shaker', collection: 'Percussion', fn: (ctx) => this._genNoise(ctx, 0.08, 0.3) },
      // Bass
      { name: 'Bass - Sub Sine', collection: 'Bass', fn: (ctx) => this._genBass(ctx, 55, 'sine', 0.5) },
      { name: 'Bass - Square', collection: 'Bass', fn: (ctx) => this._genBass(ctx, 55, 'square', 0.3) },
      { name: 'Bass - Saw', collection: 'Bass', fn: (ctx) => this._genBass(ctx, 55, 'sawtooth', 0.3) },
      { name: 'Bass - Reese', collection: 'Bass', fn: (ctx) => this._genReese(ctx, 55, 0.5) },
      // Synths
      { name: 'Pad - Warm', collection: 'Synths', fn: (ctx) => this._genPad(ctx, 220, 1.0) },
      { name: 'Pad - Dark', collection: 'Synths', fn: (ctx) => this._genPad(ctx, 110, 1.0) },
      { name: 'Lead - Pluck', collection: 'Synths', fn: (ctx) => this._genPluck(ctx, 440, 0.3) },
      { name: 'Lead - Square', collection: 'Synths', fn: (ctx) => this._genBass(ctx, 440, 'square', 0.2) },
      { name: 'Stab - Chord', collection: 'Synths', fn: (ctx) => this._genChordStab(ctx) },
      // FX
      { name: 'FX - Rise', collection: 'FX', fn: (ctx) => this._genRise(ctx, 1.5) },
      { name: 'FX - Impact', collection: 'FX', fn: (ctx) => this._genImpact(ctx) },
      { name: 'FX - Noise Sweep', collection: 'FX', fn: (ctx) => this._genNoiseSweep(ctx, 1.0) },
    ];

    for (const s of synths) {
      const id = `snd_${this.nextSoundId++}`;
      try {
        const buffer = await s.fn(ctx);
        audioEngine.buffers.set(id, buffer);
        const sound = { id, name: s.name, collection: s.collection, duration: buffer.duration };
        this.sounds.push(sound);
        if (!this.collections.has(s.collection)) this.collections.set(s.collection, []);
        this.collections.get(s.collection).push(sound);
      } catch (e) {
        console.error(`Failed to generate ${s.name}:`, e);
      }
    }

    this._render();
  }

  // ── Sound generators ──

  async _renderOffline(duration, fn) {
    const sr = 44100;
    const samples = Math.ceil(duration * sr);
    const offline = new OfflineAudioContext(2, samples, sr);
    fn(offline);
    return offline.startRendering();
  }

  _genKick(ctx, freq, duration, decay) {
    return this._renderOffline(duration, (off) => {
      const osc = off.createOscillator();
      const gain = off.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 3, 0);
      osc.frequency.exponentialRampToValueAtTime(freq, 0.04);
      osc.frequency.exponentialRampToValueAtTime(20, duration);
      gain.gain.setValueAtTime(1, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(duration);
    });
  }

  _genSnare(ctx, duration, noiseAmount) {
    return this._renderOffline(duration, (off) => {
      // Tone
      const osc = off.createOscillator();
      const oscGain = off.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, 0);
      osc.frequency.exponentialRampToValueAtTime(100, duration);
      oscGain.gain.setValueAtTime(0.7, 0);
      oscGain.gain.exponentialRampToValueAtTime(0.001, duration * 0.5);
      osc.connect(oscGain);
      oscGain.connect(off.destination);
      osc.start(0);
      osc.stop(duration);

      // Noise
      const bufSize = off.sampleRate * duration;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * noiseAmount;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const noiseGain = off.createGain();
      noiseGain.gain.setValueAtTime(1, 0);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, duration);
      const hp = off.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1000;
      noise.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(off.destination);
      noise.start(0);
      noise.stop(duration);
    });
  }

  _genClap(ctx, duration) {
    return this._renderOffline(duration, (off) => {
      const bufSize = off.sampleRate * duration;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const gain = off.createGain();
      // Multiple mini-attacks for clap texture
      gain.gain.setValueAtTime(0, 0);
      for (let i = 0; i < 3; i++) {
        gain.gain.setValueAtTime(0.8, 0.005 + i * 0.015);
        gain.gain.setValueAtTime(0.3, 0.01 + i * 0.015);
      }
      gain.gain.setValueAtTime(0.8, 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      const bp = off.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2500;
      bp.Q.value = 1.5;
      noise.connect(bp);
      bp.connect(gain);
      gain.connect(off.destination);
      noise.start(0);
      noise.stop(duration);
    });
  }

  _genHihat(ctx, duration) {
    return this._renderOffline(duration, (off) => {
      const bufSize = off.sampleRate * duration;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const gain = off.createGain();
      gain.gain.setValueAtTime(0.6, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      const hp = off.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 7000;
      noise.connect(hp);
      hp.connect(gain);
      gain.connect(off.destination);
      noise.start(0);
      noise.stop(duration);
    });
  }

  _genRim(ctx) {
    return this._renderOffline(0.05, (off) => {
      const osc = off.createOscillator();
      const gain = off.createGain();
      osc.type = 'square';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.8, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, 0.05);
      osc.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(0.05);
    });
  }

  _genNoise(ctx, duration, volume) {
    return this._renderOffline(duration, (off) => {
      const bufSize = off.sampleRate * duration;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * volume;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const gain = off.createGain();
      gain.gain.setValueAtTime(1, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      noise.connect(gain);
      gain.connect(off.destination);
      noise.start(0);
      noise.stop(duration);
    });
  }

  _genBass(ctx, freq, type, duration) {
    return this._renderOffline(duration, (off) => {
      const osc = off.createOscillator();
      const gain = off.createGain();
      const lp = off.createBiquadFilter();
      osc.type = type;
      osc.frequency.value = freq;
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(2000, 0);
      lp.frequency.exponentialRampToValueAtTime(200, duration);
      gain.gain.setValueAtTime(0.8, 0);
      gain.gain.setValueAtTime(0.8, duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(duration);
    });
  }

  _genReese(ctx, freq, duration) {
    return this._renderOffline(duration, (off) => {
      const osc1 = off.createOscillator();
      const osc2 = off.createOscillator();
      const gain = off.createGain();
      const lp = off.createBiquadFilter();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 1.008; // slight detune
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3000, 0);
      lp.frequency.exponentialRampToValueAtTime(300, duration);
      gain.gain.setValueAtTime(0.5, 0);
      gain.gain.setValueAtTime(0.5, duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc1.connect(lp);
      osc2.connect(lp);
      lp.connect(gain);
      gain.connect(off.destination);
      osc1.start(0);
      osc2.start(0);
      osc1.stop(duration);
      osc2.stop(duration);
    });
  }

  _genPad(ctx, freq, duration) {
    return this._renderOffline(duration, (off) => {
      const freqs = [freq, freq * 1.25, freq * 1.5]; // major chord
      const gain = off.createGain();
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.3, 0.2);
      gain.gain.setValueAtTime(0.3, duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, duration);
      const lp = off.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2000;
      for (const f of freqs) {
        const osc = off.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        osc.connect(lp);
        osc.start(0);
        osc.stop(duration);
      }
      lp.connect(gain);
      gain.connect(off.destination);
    });
  }

  _genPluck(ctx, freq, duration) {
    return this._renderOffline(duration, (off) => {
      const osc = off.createOscillator();
      const gain = off.createGain();
      const lp = off.createBiquadFilter();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(8000, 0);
      lp.frequency.exponentialRampToValueAtTime(200, duration);
      gain.gain.setValueAtTime(0.7, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      osc.connect(lp);
      lp.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(duration);
    });
  }

  _genChordStab(ctx) {
    const duration = 0.15;
    return this._renderOffline(duration, (off) => {
      const freqs = [261.63, 329.63, 392.00, 523.25]; // C major 7th
      const gain = off.createGain();
      gain.gain.setValueAtTime(0.6, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, duration);
      for (const f of freqs) {
        const osc = off.createOscillator();
        osc.type = 'square';
        osc.frequency.value = f;
        osc.connect(gain);
        osc.start(0);
        osc.stop(duration);
      }
      gain.connect(off.destination);
    });
  }

  _genRise(ctx, duration) {
    return this._renderOffline(duration, (off) => {
      const osc = off.createOscillator();
      const gain = off.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, 0);
      osc.frequency.exponentialRampToValueAtTime(4000, duration);
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.5, duration * 0.9);
      gain.gain.linearRampToValueAtTime(0, duration);
      osc.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(duration);
    });
  }

  _genImpact(ctx) {
    return this._renderOffline(0.8, (off) => {
      // Low boom
      const osc = off.createOscillator();
      const gain = off.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, 0);
      osc.frequency.exponentialRampToValueAtTime(20, 0.8);
      gain.gain.setValueAtTime(1, 0);
      gain.gain.exponentialRampToValueAtTime(0.001, 0.8);
      osc.connect(gain);
      gain.connect(off.destination);
      osc.start(0);
      osc.stop(0.8);

      // Noise layer
      const bufSize = off.sampleRate * 0.3;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const ng = off.createGain();
      ng.gain.setValueAtTime(0.4, 0);
      ng.gain.exponentialRampToValueAtTime(0.001, 0.3);
      noise.connect(ng);
      ng.connect(off.destination);
      noise.start(0);
      noise.stop(0.3);
    });
  }

  _genNoiseSweep(ctx, duration) {
    return this._renderOffline(duration, (off) => {
      const bufSize = off.sampleRate * duration;
      const noiseBuf = off.createBuffer(1, bufSize, off.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = off.createBufferSource();
      noise.buffer = noiseBuf;
      const gain = off.createGain();
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.4, duration * 0.5);
      gain.gain.linearRampToValueAtTime(0, duration);
      const bp = off.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 5;
      bp.frequency.setValueAtTime(200, 0);
      bp.frequency.exponentialRampToValueAtTime(8000, duration);
      noise.connect(bp);
      bp.connect(gain);
      gain.connect(off.destination);
      noise.start(0);
      noise.stop(duration);
    });
  }
}

window.soundBrowser = new SoundBrowser();
