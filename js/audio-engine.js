/**
 * Audio Engine - handles Web Audio API, playback, decoding, and export.
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();       // soundId -> AudioBuffer
    this.playing = false;
    this.startTime = 0;
    this.pauseOffset = 0;
    this.activeSources = [];
    this.bpm = 128;
    this.beatsPerBar = 4;
    this.onTick = null;             // callback for playhead updates
    this._rafId = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  get secondsPerBeat() {
    return 60 / this.bpm;
  }

  get secondsPerBar() {
    return this.secondsPerBeat * this.beatsPerBar;
  }

  // Convert beat position to pixels
  beatToPixels(beat) {
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    return beat * beatW;
  }

  // Convert pixels to beat position
  pixelsToBeat(px) {
    const beatW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat-w'));
    return px / beatW;
  }

  // Load an audio file and decode it
  async loadSound(id, arrayBuffer) {
    this.init();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
    this.buffers.set(id, audioBuffer);
    return audioBuffer;
  }

  // Load from URL
  async loadSoundFromURL(id, url) {
    this.init();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.loadSound(id, arrayBuffer);
  }

  // Get buffer duration in seconds
  getDuration(soundId) {
    const buf = this.buffers.get(soundId);
    return buf ? buf.duration : 0;
  }

  // Get duration in beats
  getDurationBeats(soundId) {
    return this.getDuration(soundId) / this.secondsPerBeat;
  }

  // Preview a sound (one-shot playback)
  preview(soundId, options = {}) {
    this.init();
    const buf = this.buffers.get(soundId);
    if (!buf) return;

    const source = this.ctx.createBufferSource();
    const gainNode = this.ctx.createGain();
    const panNode = this.ctx.createStereoPanner();

    source.buffer = options.reverse ? this._reverseBuffer(buf) : buf;
    source.playbackRate.value = options.playbackRate || Math.pow(2, (options.pitch || 0) / 12);

    gainNode.gain.value = options.volume !== undefined ? options.volume : 1;
    panNode.pan.value = options.pan || 0;

    source.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(this.ctx.destination);

    const offset = (options.startOffset || 0) / 1000;
    source.start(0, offset);

    return source;
  }

  // Play the full arrangement
  play(blocks, tracks) {
    this.init();
    this.stop();
    this.playing = true;

    const now = this.ctx.currentTime;
    this.startTime = now - this.pauseOffset;

    for (const block of blocks) {
      const track = tracks.find(t => t.id === block.trackId);
      if (!track || track.muted) continue;

      const buf = this.buffers.get(block.soundId);
      if (!buf) continue;

      const startBeat = block.startBeat;
      const startSec = startBeat * this.secondsPerBeat;
      const blockDurBeats = block.durationBeats || this.getDurationBeats(block.soundId);
      const blockDurSec = blockDurBeats * this.secondsPerBeat;

      const source = this.ctx.createBufferSource();
      const gainNode = this.ctx.createGain();
      const panNode = this.ctx.createStereoPanner();

      const opts = block.options || {};
      source.buffer = opts.reverse ? this._reverseBuffer(buf) : buf;
      source.playbackRate.value = Math.pow(2, (opts.pitch || 0) / 12);

      const vol = (opts.volume !== undefined ? opts.volume : 1) * (track.volume !== undefined ? track.volume : 1);
      gainNode.gain.value = vol;
      panNode.pan.value = opts.pan || track.pan || 0;

      // Fade in
      if (opts.fadeIn > 0) {
        gainNode.gain.setValueAtTime(0, now + startSec - this.pauseOffset);
        gainNode.gain.linearRampToValueAtTime(vol, now + startSec - this.pauseOffset + opts.fadeIn / 1000);
      }

      // Fade out
      if (opts.fadeOut > 0) {
        const fadeStart = startSec + blockDurSec - opts.fadeOut / 1000;
        gainNode.gain.setValueAtTime(vol, now + fadeStart - this.pauseOffset);
        gainNode.gain.linearRampToValueAtTime(0, now + startSec + blockDurSec - this.pauseOffset);
      }

      source.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(this.ctx.destination);

      const playAt = now + startSec - this.pauseOffset;
      const offset = (opts.startOffset || 0) / 1000;

      if (playAt >= now) {
        source.start(playAt, offset, blockDurSec);
      } else {
        // We're past this block's start, play from the right offset
        const elapsed = now - playAt;
        if (elapsed < blockDurSec) {
          source.start(now, offset + elapsed, blockDurSec - elapsed);
        }
      }

      this.activeSources.push(source);
    }

    this._startTick();
  }

  stop() {
    this.playing = false;
    this.pauseOffset = 0;
    for (const src of this.activeSources) {
      try { src.stop(); } catch (e) { /* already stopped */ }
    }
    this.activeSources = [];
    this._stopTick();
  }

  pause() {
    if (!this.playing) return;
    this.pauseOffset = this.ctx.currentTime - this.startTime;
    this.playing = false;
    for (const src of this.activeSources) {
      try { src.stop(); } catch (e) {}
    }
    this.activeSources = [];
    this._stopTick();
  }

  getCurrentBeat() {
    if (!this.playing) return this.pauseOffset / this.secondsPerBeat;
    const elapsed = this.ctx.currentTime - this.startTime;
    return elapsed / this.secondsPerBeat;
  }

  seekToBeat(beat) {
    const wasPlaying = this.playing;
    if (wasPlaying) {
      for (const src of this.activeSources) {
        try { src.stop(); } catch (e) {}
      }
      this.activeSources = [];
    }
    this.pauseOffset = beat * this.secondsPerBeat;
    if (wasPlaying) {
      // Will be re-triggered by play()
    }
  }

  // Export arrangement to WAV
  async exportWAV(blocks, tracks, totalBeats) {
    const sampleRate = 44100;
    const totalDuration = totalBeats * this.secondsPerBeat;
    const totalSamples = Math.ceil(totalDuration * sampleRate);
    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    for (const block of blocks) {
      const track = tracks.find(t => t.id === block.trackId);
      if (!track || track.muted) continue;

      const buf = this.buffers.get(block.soundId);
      if (!buf) continue;

      const source = offlineCtx.createBufferSource();
      const gainNode = offlineCtx.createGain();
      const panNode = offlineCtx.createStereoPanner();

      const opts = block.options || {};
      source.buffer = opts.reverse ? this._reverseBuffer(buf) : buf;
      source.playbackRate.value = Math.pow(2, (opts.pitch || 0) / 12);

      const vol = (opts.volume !== undefined ? opts.volume : 1) * (track.volume !== undefined ? track.volume : 1);
      gainNode.gain.value = vol;
      panNode.pan.value = opts.pan || track.pan || 0;

      source.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(offlineCtx.destination);

      const startSec = block.startBeat * (60 / this.bpm);
      const blockDurSec = (block.durationBeats || this.getDurationBeats(block.soundId)) * (60 / this.bpm);
      const offset = (opts.startOffset || 0) / 1000;

      source.start(startSec, offset, blockDurSec);
    }

    const rendered = await offlineCtx.startRendering();
    return this._audioBufferToWav(rendered);
  }

  _reverseBuffer(buffer) {
    const reversed = this.ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const src = buffer.getChannelData(ch);
      const dst = reversed.getChannelData(ch);
      for (let i = 0; i < src.length; i++) {
        dst[i] = src[src.length - 1 - i];
      }
    }
    return reversed;
  }

  _startTick() {
    const tick = () => {
      if (!this.playing) return;
      if (this.onTick) this.onTick(this.getCurrentBeat());
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _stopTick() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const dataLength = buffer.length * blockAlign;
    const headerLength = 44;
    const totalLength = headerLength + dataLength;

    const wav = new ArrayBuffer(totalLength);
    const view = new DataView(wav);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, totalLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    const channels = [];
    for (let ch = 0; ch < numChannels; ch++) {
      channels.push(buffer.getChannelData(ch));
    }

    let offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([wav], { type: 'audio/wav' });
  }
}

window.audioEngine = new AudioEngine();
