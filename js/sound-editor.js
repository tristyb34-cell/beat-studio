/**
 * Sound Editor - Sqweeky Clean Productions
 * Bottom panel editor for modifying placed sounds on the grid.
 * Opens on double-click (sequencer:edit event), provides tuning,
 * level, envelope, filter, and effects controls with scoped apply.
 */
(function () {
  const SoundEditor = {
    currentBlockId: null,
    currentBlock: null,
    applyScope: 'beat',
    _undoBatch: null,

    init() {
      this._cacheElements();
      this._injectApplyScope();
      this._bindControls();
      this._bindButtons();
      this._bindKeyboard();
      this._bindEditEvent();
    },

    /* ------------------------------------------------------------------ */
    /*  DOM references                                                     */
    /* ------------------------------------------------------------------ */
    _cacheElements() {
      this.el = document.getElementById('sound-editor');
      this.titleEl = document.getElementById('editor-title');

      this.controls = {
        pitch:      document.getElementById('ed-pitch'),
        fine:       document.getElementById('ed-fine'),
        volume:     document.getElementById('ed-volume'),
        pan:        document.getElementById('ed-pan'),
        attack:     document.getElementById('ed-attack'),
        decay:      document.getElementById('ed-decay'),
        filterType: document.getElementById('ed-filter-type'),
        cutoff:     document.getElementById('ed-cutoff'),
        resonance:  document.getElementById('ed-resonance'),
        distortion: document.getElementById('ed-distortion'),
        reverse:    document.getElementById('ed-reverse'),
        stretch:    document.getElementById('ed-stretch'),
      };

      this.displays = {
        pitch:      document.getElementById('ed-pitch-val'),
        fine:       document.getElementById('ed-fine-val'),
        volume:     document.getElementById('ed-volume-val'),
        pan:        document.getElementById('ed-pan-val'),
        attack:     document.getElementById('ed-attack-val'),
        decay:      document.getElementById('ed-decay-val'),
        cutoff:     document.getElementById('ed-cutoff-val'),
        resonance:  document.getElementById('ed-resonance-val'),
        distortion: document.getElementById('ed-distortion-val'),
        stretch:    document.getElementById('ed-stretch-val'),
      };
    },

    /* ------------------------------------------------------------------ */
    /*  Inject the apply-scope selector                                    */
    /* ------------------------------------------------------------------ */
    _injectApplyScope() {
      const header = this.el.querySelector('.editor-header');
      const rightSection = this.el.querySelector('.editor-header-right');

      const wrapper = document.createElement('div');
      wrapper.className = 'editor-apply-scope';
      wrapper.style.cssText =
        'display:inline-flex;align-items:center;gap:6px;margin-left:16px;';

      const label = document.createElement('span');
      label.textContent = 'Apply to:';
      label.style.cssText =
        'font-size:12px;color:var(--text-secondary, #aaa);white-space:nowrap;';

      const select = document.createElement('select');
      select.id = 'ed-apply-scope';
      select.style.cssText = [
        'background:var(--bg-tertiary, #2a2a2a)',
        'color:var(--text-primary, #eee)',
        'border:1px solid var(--border-color, #444)',
        'border-radius:4px',
        'padding:3px 8px',
        'font-size:12px',
        'cursor:pointer',
        'outline:none',
      ].join(';');

      const options = [
        { value: 'beat',     text: 'This beat' },
        { value: 'all',      text: 'All of this sound' },
        { value: 'bar',      text: 'This bar' },
        { value: 'selected', text: 'Selected beats' },
      ];

      options.forEach(function (opt) {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.text;
        select.appendChild(o);
      });

      select.addEventListener('change', function () {
        SoundEditor.applyScope = select.value;
      });

      wrapper.appendChild(label);
      wrapper.appendChild(select);
      header.insertBefore(wrapper, rightSection);
      this.scopeSelect = select;
    },

    /* ------------------------------------------------------------------ */
    /*  Bind slider / select / checkbox events                             */
    /* ------------------------------------------------------------------ */
    _bindControls() {
      const self = this;
      const rangeMap = {
        pitch:      'pitch',
        fine:       'fineTune',
        volume:     'volume',
        pan:        'pan',
        attack:     'attack',
        decay:      'decay',
        cutoff:     'cutoff',
        resonance:  'resonance',
        distortion: 'distortion',
        stretch:    'stretch',
      };

      Object.keys(rangeMap).forEach(function (key) {
        var ctrl = self.controls[key];
        if (!ctrl) return;
        ctrl.addEventListener('input', function () {
          var val = parseFloat(ctrl.value);
          self._updateValue(key, val);
          self._applyChange(rangeMap[key], val);
        });
      });

      if (this.controls.filterType) {
        this.controls.filterType.addEventListener('change', function () {
          self._applyChange('filterType', this.value);
        });
      }

      if (this.controls.reverse) {
        this.controls.reverse.addEventListener('change', function () {
          self._applyChange('reverse', this.checked);
        });
      }
    },

    /* ------------------------------------------------------------------ */
    /*  Button bindings                                                    */
    /* ------------------------------------------------------------------ */
    _bindButtons() {
      var self = this;

      var previewBtn = document.getElementById('btn-preview-editor');
      if (previewBtn) {
        previewBtn.addEventListener('click', function () { self._preview(); });
      }

      var saveBtn = document.getElementById('btn-save-sound');
      if (saveBtn) {
        saveBtn.addEventListener('click', function () { self._saveWav(); });
      }

      var closeBtn = document.getElementById('btn-close-editor');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () { self.close(); });
      }
    },

    /* ------------------------------------------------------------------ */
    /*  Keyboard shortcut                                                  */
    /* ------------------------------------------------------------------ */
    _bindKeyboard() {
      var self = this;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && self.currentBlockId !== null) {
          self.close();
        }
      });
    },

    /* ------------------------------------------------------------------ */
    /*  Listen for the custom sequencer:edit event                         */
    /* ------------------------------------------------------------------ */
    _bindEditEvent() {
      var self = this;
      document.addEventListener('sequencer:edit', function (e) {
        if (e.detail) {
          self.open(e.detail);
        }
      });
    },

    /* ------------------------------------------------------------------ */
    /*  Open the editor for a block                                        */
    /* ------------------------------------------------------------------ */
    open(block) {
      if (!block) return;

      this.currentBlockId = block.id;
      this.currentBlock = block;

      if (!block.options) {
        block.options = {};
      }

      var opts = block.options;

      this.titleEl.textContent = 'Sound Editor - ' + (block.name || block.soundId || 'Untitled');

      this._setControl('pitch',      opts.pitch      !== undefined ? opts.pitch      : 0);
      this._setControl('fine',       opts.fineTune   !== undefined ? opts.fineTune   : 0);
      this._setControl('volume',     opts.volume     !== undefined ? opts.volume     : 1);
      this._setControl('pan',        opts.pan        !== undefined ? opts.pan        : 0);
      this._setControl('attack',     opts.attack     !== undefined ? opts.attack     : 0);
      this._setControl('decay',      opts.decay      !== undefined ? opts.decay      : 0);
      this._setControl('cutoff',     opts.cutoff     !== undefined ? opts.cutoff     : 20000);
      this._setControl('resonance',  opts.resonance  !== undefined ? opts.resonance  : 0);
      this._setControl('distortion', opts.distortion !== undefined ? opts.distortion : 0);
      this._setControl('stretch',    opts.stretch    !== undefined ? opts.stretch    : 1);

      if (this.controls.filterType) {
        this.controls.filterType.value = opts.filterType || 'none';
      }

      if (this.controls.reverse) {
        this.controls.reverse.checked = !!opts.reverse;
      }

      // Reset scope to default
      this.applyScope = 'beat';
      if (this.scopeSelect) this.scopeSelect.value = 'beat';

      this.el.classList.remove('hidden');
    },

    /* ------------------------------------------------------------------ */
    /*  Set a control's value and update its display                        */
    /* ------------------------------------------------------------------ */
    _setControl(key, value) {
      var ctrl = this.controls[key];
      if (ctrl) {
        ctrl.value = value;
      }
      this._updateValue(key, value);
    },

    /* ------------------------------------------------------------------ */
    /*  Close the editor                                                   */
    /* ------------------------------------------------------------------ */
    close() {
      this.currentBlockId = null;
      this.currentBlock = null;
      this.el.classList.add('hidden');
    },

    /* ------------------------------------------------------------------ */
    /*  Format and display a control's value                               */
    /* ------------------------------------------------------------------ */
    _updateValue(control, value) {
      var display = this.displays[control];
      if (!display) return;

      var text = '';

      switch (control) {
        case 'pitch':
          var v = parseInt(value, 10);
          text = (v > 0 ? '+' : '') + v + ' st';
          break;

        case 'fine':
          var c = parseInt(value, 10);
          text = (c > 0 ? '+' : '') + c + ' ct';
          break;

        case 'volume':
          text = Math.round(parseFloat(value) * 100) + '%';
          break;

        case 'pan':
          var p = parseFloat(value);
          if (Math.abs(p) < 0.01) {
            text = 'C';
          } else if (p < 0) {
            text = 'L' + Math.round(Math.abs(p) * 100);
          } else {
            text = 'R' + Math.round(p * 100);
          }
          break;

        case 'attack':
          text = parseInt(value, 10) + 'ms';
          break;

        case 'decay':
          text = parseInt(value, 10) + 'ms';
          break;

        case 'cutoff':
          var hz = parseFloat(value);
          if (hz >= 1000) {
            text = (hz / 1000).toFixed(1).replace(/\.0$/, '') + 'kHz';
          } else {
            text = Math.round(hz) + 'Hz';
          }
          break;

        case 'resonance':
          text = parseFloat(value).toFixed(1);
          break;

        case 'distortion':
          text = parseInt(value, 10) + '%';
          break;

        case 'stretch':
          text = parseFloat(value).toFixed(2).replace(/0$/, '') + 'x';
          break;

        default:
          text = String(value);
      }

      display.textContent = text;
    },

    /* ------------------------------------------------------------------ */
    /*  Apply a change to the appropriate scope                            */
    /* ------------------------------------------------------------------ */
    _applyChange(option, value) {
      if (!this.currentBlock) return;

      var blocks = this._getTargetBlocks();
      var prevValues = [];

      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        if (!b.options) b.options = {};
        prevValues.push({ id: b.id, prev: b.options[option] });
        b.options[option] = value;
      }

      // Push undo action if sequencer supports it
      if (window.sequencer && typeof window.sequencer.pushUndo === 'function') {
        var undoData = {
          type: 'sound-edit',
          option: option,
          blocks: prevValues,
          newValue: value,
        };
        window.sequencer.pushUndo(undoData);
      }

      // Notify sequencer that blocks were modified
      if (window.sequencer && typeof window.sequencer.onBlocksModified === 'function') {
        window.sequencer.onBlocksModified(blocks);
      }
    },

    /* ------------------------------------------------------------------ */
    /*  Get blocks based on the current apply scope                        */
    /* ------------------------------------------------------------------ */
    _getTargetBlocks() {
      var current = this.currentBlock;
      if (!current) return [];

      if (!window.sequencer || typeof window.sequencer.getBlocks !== 'function') {
        return [current];
      }

      switch (this.applyScope) {
        case 'all': {
          var allBlocks = window.sequencer.getBlocks();
          return allBlocks.filter(function (b) {
            return b.soundId === current.soundId;
          });
        }

        case 'bar': {
          var barStart = Math.floor(current.startBeat / 4) * 4;
          var barEnd = barStart + 4;
          var barBlocks = window.sequencer.getBlocks();
          return barBlocks.filter(function (b) {
            return b.startBeat >= barStart && b.startBeat < barEnd;
          });
        }

        case 'selected': {
          if (typeof window.sequencer.getSelectedBlocks === 'function') {
            return window.sequencer.getSelectedBlocks();
          }
          return [current];
        }

        case 'beat':
        default:
          return [current];
      }
    },

    /* ------------------------------------------------------------------ */
    /*  Preview the current sound with modifications                       */
    /* ------------------------------------------------------------------ */
    _preview() {
      if (!this.currentBlock) return;

      if (window.audioEngine && typeof window.audioEngine.preview === 'function') {
        window.audioEngine.preview(
          this.currentBlock.soundId,
          Object.assign({}, this.currentBlock.options)
        );
      }
    },

    /* ------------------------------------------------------------------ */
    /*  Save / export the modified sound as a WAV file                     */
    /* ------------------------------------------------------------------ */
    _saveWav() {
      if (!this.currentBlock) return;

      var block = this.currentBlock;
      var opts = Object.assign({}, block.options);

      // Resolve the source buffer
      var sourceBuffer = null;
      if (window.audioEngine && window.audioEngine.buffers) {
        sourceBuffer = window.audioEngine.buffers[block.soundId];
      }
      if (!sourceBuffer) {
        console.warn('[SoundEditor] No audio buffer found for', block.soundId);
        return;
      }

      var sampleRate = sourceBuffer.sampleRate;
      var channels = sourceBuffer.numberOfChannels;

      // Calculate stretched duration
      var stretchFactor = opts.stretch || 1;
      var baseDuration = sourceBuffer.duration;
      var finalDuration = baseDuration * stretchFactor;

      // Add envelope tail
      var attackSec = (opts.attack || 0) / 1000;
      var decaySec = (opts.decay || 0) / 1000;
      var renderDuration = Math.max(finalDuration, finalDuration + decaySec) + 0.05;

      var offline = new OfflineAudioContext(channels, Math.ceil(renderDuration * sampleRate), sampleRate);

      // If reverse, create a reversed copy of the buffer
      var workingBuffer = sourceBuffer;
      if (opts.reverse) {
        workingBuffer = offline.createBuffer(channels, sourceBuffer.length, sampleRate);
        for (var ch = 0; ch < channels; ch++) {
          var src = sourceBuffer.getChannelData(ch);
          var dst = workingBuffer.getChannelData(ch);
          for (var i = 0; i < src.length; i++) {
            dst[i] = src[src.length - 1 - i];
          }
        }
      }

      // Source node
      var source = offline.createBufferSource();
      source.buffer = workingBuffer;

      // Pitch (semitones + fine tune in cents)
      var pitchSemitones = opts.pitch || 0;
      var fineCents = opts.fineTune || 0;
      var totalCents = (pitchSemitones * 100) + fineCents;
      source.detune.value = totalCents;

      // Stretch via playbackRate
      if (stretchFactor !== 1) {
        source.playbackRate.value = 1 / stretchFactor;
      }

      var currentNode = source;

      // Envelope via gain node
      var gainNode = offline.createGain();
      var vol = opts.volume !== undefined ? opts.volume : 1;

      if (attackSec > 0) {
        gainNode.gain.setValueAtTime(0, 0);
        gainNode.gain.linearRampToValueAtTime(vol, attackSec);
      } else {
        gainNode.gain.setValueAtTime(vol, 0);
      }

      if (decaySec > 0) {
        var decayStart = finalDuration - decaySec;
        if (decayStart < attackSec) decayStart = attackSec;
        gainNode.gain.setValueAtTime(vol, decayStart);
        gainNode.gain.linearRampToValueAtTime(0, decayStart + decaySec);
      }

      currentNode.connect(gainNode);
      currentNode = gainNode;

      // Pan
      var panVal = opts.pan || 0;
      if (Math.abs(panVal) > 0.01) {
        var panner = offline.createStereoPanner();
        panner.pan.value = panVal;
        currentNode.connect(panner);
        currentNode = panner;
      }

      // Filter
      var filterType = opts.filterType || 'none';
      if (filterType !== 'none') {
        var filter = offline.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = opts.cutoff !== undefined ? opts.cutoff : 20000;
        filter.Q.value = opts.resonance || 0;
        currentNode.connect(filter);
        currentNode = filter;
      }

      // Distortion via waveshaper
      var distAmt = opts.distortion || 0;
      if (distAmt > 0) {
        var shaper = offline.createWaveShaper();
        shaper.curve = this._makeDistortionCurve(distAmt);
        shaper.oversample = '4x';
        currentNode.connect(shaper);
        currentNode = shaper;
      }

      currentNode.connect(offline.destination);
      source.start(0);

      var self = this;
      offline.startRendering().then(function (renderedBuffer) {
        var wavBlob;
        if (window.audioEngine && typeof window.audioEngine._audioBufferToWav === 'function') {
          wavBlob = window.audioEngine._audioBufferToWav(renderedBuffer);
        } else {
          wavBlob = self._audioBufferToWav(renderedBuffer);
        }

        var url = URL.createObjectURL(wavBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = (block.name || block.soundId || 'sound') + '-modified.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      }).catch(function (err) {
        console.error('[SoundEditor] WAV render failed:', err);
      });
    },

    /* ------------------------------------------------------------------ */
    /*  Distortion curve generator                                         */
    /* ------------------------------------------------------------------ */
    _makeDistortionCurve(amount) {
      var samples = 44100;
      var curve = new Float32Array(samples);
      var k = (amount / 100) * 50;
      for (var i = 0; i < samples; i++) {
        var x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) /
                   (Math.PI + k * Math.abs(x));
      }
      return curve;
    },

    /* ------------------------------------------------------------------ */
    /*  Fallback WAV encoder (used if audioEngine doesn't expose one)      */
    /* ------------------------------------------------------------------ */
    _audioBufferToWav(buffer) {
      var numChannels = buffer.numberOfChannels;
      var sampleRate = buffer.sampleRate;
      var length = buffer.length;
      var bytesPerSample = 2;
      var blockAlign = numChannels * bytesPerSample;
      var dataSize = length * blockAlign;
      var headerSize = 44;
      var arrayBuffer = new ArrayBuffer(headerSize + dataSize);
      var view = new DataView(arrayBuffer);

      function writeString(offset, str) {
        for (var i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      }

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * blockAlign, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bytesPerSample * 8, true);
      writeString(36, 'data');
      view.setUint32(40, dataSize, true);

      var channels = [];
      for (var ch = 0; ch < numChannels; ch++) {
        channels.push(buffer.getChannelData(ch));
      }

      var offset = 44;
      for (var i = 0; i < length; i++) {
        for (var ch = 0; ch < numChannels; ch++) {
          var sample = Math.max(-1, Math.min(1, channels[ch][i]));
          var intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          view.setInt16(offset, intSample, true);
          offset += 2;
        }
      }

      return new Blob([arrayBuffer], { type: 'audio/wav' });
    },
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      SoundEditor.init();
    });
  } else {
    SoundEditor.init();
  }

  window.soundEditor = SoundEditor;
})();
