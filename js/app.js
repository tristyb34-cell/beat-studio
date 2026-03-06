/**
 * App - wires everything together: transport, settings, save/load, export.
 */
(function () {
  const engine = window.audioEngine;
  const arr = window.arrangement;

  // ── Transport ──
  const btnPlay = document.getElementById('btn-play');
  const btnStop = document.getElementById('btn-stop');
  const bpmInput = document.getElementById('bpm');
  const timeSigSelect = document.getElementById('time-sig');

  btnPlay.addEventListener('click', () => {
    engine.init();
    if (engine.playing) {
      engine.pause();
      btnPlay.classList.remove('active');
      btnPlay.innerHTML = '&#9654;';
    } else {
      engine.play(arr.blocks, arr.tracks);
      btnPlay.classList.add('active');
      btnPlay.innerHTML = '&#10074;&#10074;';
    }
  });

  btnStop.addEventListener('click', () => {
    engine.stop();
    btnPlay.classList.remove('active');
    btnPlay.innerHTML = '&#9654;';
    arr.updatePlayhead(0);
  });

  bpmInput.addEventListener('change', () => {
    engine.bpm = parseInt(bpmInput.value) || 128;
    bpmInput.value = engine.bpm;
  });

  timeSigSelect.addEventListener('change', () => {
    engine.beatsPerBar = parseInt(timeSigSelect.value) || 4;
    arr._drawRuler();
  });

  // Spacebar to play/pause
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.isContentEditable) return;
    if (e.code === 'Space') {
      e.preventDefault();
      btnPlay.click();
    }
  });

  // Playhead tick callback
  engine.onTick = (beat) => {
    arr.updatePlayhead(beat);

    // Auto-stop at end
    const lastBeat = arr.getLastBeat();
    if (lastBeat > 0 && beat > lastBeat + 4) {
      engine.stop();
      btnPlay.classList.remove('active');
      btnPlay.innerHTML = '&#9654;';
      arr.updatePlayhead(0);
    }
  };

  // ── Sound Settings Panel ──
  document.getElementById('btn-close-settings').addEventListener('click', () => {
    document.getElementById('sound-settings').classList.add('hidden');
  });

  document.getElementById('btn-delete-block').addEventListener('click', () => {
    if (arr.selectedBlock) {
      arr.removeBlock(arr.selectedBlock);
      arr.selectedBlock = null;
      document.getElementById('sound-settings').classList.add('hidden');
    }
  });

  document.getElementById('btn-duplicate-block').addEventListener('click', () => {
    if (arr.selectedBlock) arr.duplicateBlock(arr.selectedBlock);
  });

  document.getElementById('btn-save-sound').addEventListener('click', async () => {
    if (!arr.selectedBlock) return;
    const block = arr.blocks.find(b => b.id === arr.selectedBlock);
    if (!block) return;

    // Export the modified sound as a downloadable file
    const buf = engine.buffers.get(block.soundId);
    if (!buf) return;

    const opts = block.options;
    const duration = buf.duration;
    const sr = buf.sampleRate;
    const offline = new OfflineAudioContext(buf.numberOfChannels, Math.ceil(duration * sr), sr);

    const source = offline.createBufferSource();
    source.buffer = opts.reverse ? engine._reverseBuffer(buf) : buf;
    source.playbackRate.value = Math.pow(2, (opts.pitch || 0) / 12);

    const gain = offline.createGain();
    gain.gain.value = opts.volume !== undefined ? opts.volume : 1;

    const pan = offline.createStereoPanner();
    pan.pan.value = opts.pan || 0;

    source.connect(gain);
    gain.connect(pan);
    pan.connect(offline.destination);
    source.start(0, (opts.startOffset || 0) / 1000);

    const rendered = await offline.startRendering();
    const wav = engine._audioBufferToWav(rendered);

    const sound = window.soundBrowser.getSoundById(block.soundId);
    const name = sound ? sound.name : 'sound';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(wav);
    a.download = `${name}_modified.wav`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ── Save/Load Project ──
  document.getElementById('btn-save').addEventListener('click', () => {
    const data = arr.serialize();
    // Also save sound metadata (but not audio data)
    data.sounds = window.soundBrowser.sounds.map(s => ({
      id: s.id,
      name: s.name,
      collection: s.collection,
      url: s.url || null,
      duration: s.duration,
      isUser: s.isUser || false,
    }));

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'beat-studio-project.json';
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
      const data = JSON.parse(text);
      arr.load(data);
    });
    input.click();
  });

  // ── Export WAV ──
  document.getElementById('btn-export').addEventListener('click', async () => {
    const lastBeat = arr.getLastBeat();
    if (lastBeat === 0) return alert('No blocks in the arrangement to export.');

    const btn = document.getElementById('btn-export');
    btn.textContent = 'Exporting...';
    btn.disabled = true;

    try {
      const wav = await engine.exportWAV(arr.blocks, arr.tracks, lastBeat + 4);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(wav);
      a.download = 'beat-studio-export.wav';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + err.message);
    }

    btn.textContent = 'Export WAV';
    btn.disabled = false;
  });
})();
