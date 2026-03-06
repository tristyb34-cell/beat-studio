(function() {
  'use strict';

  // ---------------------------------------------------------------------------
  // Sound definitions: 112 sounds across 11 categories
  // ---------------------------------------------------------------------------
  const SOUNDS = [
    // KICKS (12)
    { id: 'kick-808', name: '808 Kick', collection: 'drums', category: 'kicks', duration: 0.5 },
    { id: 'kick-house', name: 'House Kick', collection: 'drums', category: 'kicks', duration: 0.35 },
    { id: 'kick-dnb', name: 'DnB Kick', collection: 'drums', category: 'kicks', duration: 0.25 },
    { id: 'kick-dubstep', name: 'Dubstep Kick', collection: 'drums', category: 'kicks', duration: 0.4 },
    { id: 'kick-deep', name: 'Deep Kick', collection: 'drums', category: 'kicks', duration: 0.45 },
    { id: 'kick-punchy', name: 'Punchy Kick', collection: 'drums', category: 'kicks', duration: 0.2 },
    { id: 'kick-sub', name: 'Sub Kick', collection: 'drums', category: 'kicks', duration: 0.5 },
    { id: 'kick-techno', name: 'Techno Kick', collection: 'drums', category: 'kicks', duration: 0.3 },
    { id: 'kick-distorted', name: 'Distorted Kick', collection: 'drums', category: 'kicks', duration: 0.3 },
    { id: 'kick-click', name: 'Click Kick', collection: 'drums', category: 'kicks', duration: 0.15 },
    { id: 'kick-layered', name: 'Layered Kick', collection: 'drums', category: 'kicks', duration: 0.35 },
    { id: 'kick-boom', name: 'Boom Kick', collection: 'drums', category: 'kicks', duration: 0.6 },

    // SNARES (10)
    { id: 'snare-tight', name: 'Tight Snare', collection: 'drums', category: 'snares', duration: 0.2 },
    { id: 'snare-fat', name: 'Fat Snare', collection: 'drums', category: 'snares', duration: 0.3 },
    { id: 'snare-dnb', name: 'DnB Snare', collection: 'drums', category: 'snares', duration: 0.25 },
    { id: 'snare-clap', name: 'Clap Snare', collection: 'drums', category: 'snares', duration: 0.25 },
    { id: 'snare-rimshot', name: 'Rimshot', collection: 'drums', category: 'snares', duration: 0.15 },
    { id: 'snare-lofi', name: 'Lo-Fi Snare', collection: 'drums', category: 'snares', duration: 0.25 },
    { id: 'snare-noise', name: 'Noise Snare', collection: 'drums', category: 'snares', duration: 0.2 },
    { id: 'snare-layered', name: 'Layered Snare', collection: 'drums', category: 'snares', duration: 0.3 },
    { id: 'snare-breakbeat', name: 'Breakbeat Snare', collection: 'drums', category: 'snares', duration: 0.25 },
    { id: 'snare-electronic', name: 'Electronic Snare', collection: 'drums', category: 'snares', duration: 0.2 },

    // HI-HATS (10)
    { id: 'hat-closed', name: 'Closed Hat', collection: 'drums', category: 'hihats', duration: 0.08 },
    { id: 'hat-open', name: 'Open Hat', collection: 'drums', category: 'hihats', duration: 0.4 },
    { id: 'hat-pedal', name: 'Pedal Hat', collection: 'drums', category: 'hihats', duration: 0.1 },
    { id: 'hat-shaker', name: 'Shaker Hat', collection: 'drums', category: 'hihats', duration: 0.12 },
    { id: 'hat-metallic', name: 'Metallic Hat', collection: 'drums', category: 'hihats', duration: 0.15 },
    { id: 'hat-bright', name: 'Bright Hat', collection: 'drums', category: 'hihats', duration: 0.1 },
    { id: 'hat-dark', name: 'Dark Hat', collection: 'drums', category: 'hihats', duration: 0.1 },
    { id: 'hat-sizzle', name: 'Sizzle Hat', collection: 'drums', category: 'hihats', duration: 0.35 },
    { id: 'hat-ride', name: 'Ride', collection: 'drums', category: 'hihats', duration: 0.5 },
    { id: 'hat-crash', name: 'Crash', collection: 'drums', category: 'hihats', duration: 1.0 },

    // CLAPS (6)
    { id: 'clap-house', name: 'House Clap', collection: 'drums', category: 'claps', duration: 0.3 },
    { id: 'clap-tight', name: 'Tight Clap', collection: 'drums', category: 'claps', duration: 0.15 },
    { id: 'clap-big', name: 'Big Clap', collection: 'drums', category: 'claps', duration: 0.4 },
    { id: 'clap-layered', name: 'Layered Clap', collection: 'drums', category: 'claps', duration: 0.35 },
    { id: 'clap-reverb', name: 'Reverb Clap', collection: 'drums', category: 'claps', duration: 0.6 },
    { id: 'clap-snap', name: 'Snap', collection: 'drums', category: 'claps', duration: 0.1 },

    // PERCUSSION (10)
    { id: 'perc-tom-low', name: 'Tom Low', collection: 'drums', category: 'percussion', duration: 0.4 },
    { id: 'perc-tom-mid', name: 'Tom Mid', collection: 'drums', category: 'percussion', duration: 0.3 },
    { id: 'perc-tom-high', name: 'Tom High', collection: 'drums', category: 'percussion', duration: 0.25 },
    { id: 'perc-bongo', name: 'Bongo', collection: 'drums', category: 'percussion', duration: 0.2 },
    { id: 'perc-conga', name: 'Conga', collection: 'drums', category: 'percussion', duration: 0.3 },
    { id: 'perc-cowbell', name: 'Cowbell', collection: 'drums', category: 'percussion', duration: 0.2 },
    { id: 'perc-tambourine', name: 'Tambourine', collection: 'drums', category: 'percussion', duration: 0.25 },
    { id: 'perc-shaker', name: 'Shaker', collection: 'drums', category: 'percussion', duration: 0.15 },
    { id: 'perc-woodblock', name: 'Wood Block', collection: 'drums', category: 'percussion', duration: 0.1 },
    { id: 'perc-triangle', name: 'Triangle', collection: 'drums', category: 'percussion', duration: 0.5 },

    // BASS (12)
    { id: 'bass-sub', name: 'Sub Bass', collection: 'bass', category: 'bass', duration: 1.5 },
    { id: 'bass-deep', name: 'Deep Bass', collection: 'bass', category: 'bass', duration: 1.5 },
    { id: 'bass-wobble', name: 'Wobble Bass', collection: 'bass', category: 'bass', duration: 2.0 },
    { id: 'bass-reese', name: 'Reese Bass', collection: 'bass', category: 'bass', duration: 2.0 },
    { id: 'bass-acid', name: 'Acid Bass', collection: 'bass', category: 'bass', duration: 1.0 },
    { id: 'bass-pluck', name: 'Pluck Bass', collection: 'bass', category: 'bass', duration: 0.8 },
    { id: 'bass-saw', name: 'Saw Bass', collection: 'bass', category: 'bass', duration: 1.5 },
    { id: 'bass-square', name: 'Square Bass', collection: 'bass', category: 'bass', duration: 1.5 },
    { id: 'bass-fm', name: 'FM Bass', collection: 'bass', category: 'bass', duration: 1.0 },
    { id: 'bass-808', name: '808 Bass', collection: 'bass', category: 'bass', duration: 2.0 },
    { id: 'bass-rubber', name: 'Rubber Bass', collection: 'bass', category: 'bass', duration: 1.0 },
    { id: 'bass-growl', name: 'Growl Bass', collection: 'bass', category: 'bass', duration: 1.5 },

    // SYNTHS (10)
    { id: 'synth-saw-stab', name: 'Saw Stab', collection: 'synths', category: 'synths', duration: 0.5 },
    { id: 'synth-supersaw', name: 'Super Saw', collection: 'synths', category: 'synths', duration: 1.0 },
    { id: 'synth-square-stab', name: 'Square Stab', collection: 'synths', category: 'synths', duration: 0.5 },
    { id: 'synth-chord-stab', name: 'Chord Stab', collection: 'synths', category: 'synths', duration: 0.8 },
    { id: 'synth-organ-stab', name: 'Organ Stab', collection: 'synths', category: 'synths', duration: 0.6 },
    { id: 'synth-brass-stab', name: 'Brass Stab', collection: 'synths', category: 'synths', duration: 0.7 },
    { id: 'synth-pluck', name: 'Pluck Synth', collection: 'synths', category: 'synths', duration: 0.5 },
    { id: 'synth-bell', name: 'Bell Synth', collection: 'synths', category: 'synths', duration: 1.0 },
    { id: 'synth-key', name: 'Key Synth', collection: 'synths', category: 'synths', duration: 0.8 },
    { id: 'synth-poly', name: 'Poly Synth', collection: 'synths', category: 'synths', duration: 1.0 },

    // PADS (8)
    { id: 'pad-warm', name: 'Warm Pad', collection: 'synths', category: 'pads', duration: 3.5 },
    { id: 'pad-dark', name: 'Dark Pad', collection: 'synths', category: 'pads', duration: 3.5 },
    { id: 'pad-ambient', name: 'Ambient Pad', collection: 'synths', category: 'pads', duration: 4.0 },
    { id: 'pad-shimmer', name: 'Shimmer Pad', collection: 'synths', category: 'pads', duration: 4.0 },
    { id: 'pad-string', name: 'String Pad', collection: 'synths', category: 'pads', duration: 3.5 },
    { id: 'pad-glass', name: 'Glass Pad', collection: 'synths', category: 'pads', duration: 3.0 },
    { id: 'pad-evolving', name: 'Evolving Pad', collection: 'synths', category: 'pads', duration: 4.0 },
    { id: 'pad-choir', name: 'Choir Pad', collection: 'synths', category: 'pads', duration: 3.5 },

    // LEADS (8)
    { id: 'lead-saw', name: 'Saw Lead', collection: 'synths', category: 'leads', duration: 1.0 },
    { id: 'lead-square', name: 'Square Lead', collection: 'synths', category: 'leads', duration: 1.0 },
    { id: 'lead-detuned', name: 'Detuned Lead', collection: 'synths', category: 'leads', duration: 1.0 },
    { id: 'lead-portamento', name: 'Portamento Lead', collection: 'synths', category: 'leads', duration: 1.2 },
    { id: 'lead-acid', name: 'Acid Lead', collection: 'synths', category: 'leads', duration: 1.0 },
    { id: 'lead-pluck', name: 'Pluck Lead', collection: 'synths', category: 'leads', duration: 0.6 },
    { id: 'lead-whistle', name: 'Whistle Lead', collection: 'synths', category: 'leads', duration: 1.0 },
    { id: 'lead-hoover', name: 'Hoover Lead', collection: 'synths', category: 'leads', duration: 1.5 },

    // FX (11)
    { id: 'fx-riser-up', name: 'Riser Up', collection: 'fx', category: 'fx', duration: 3.0 },
    { id: 'fx-riser-down', name: 'Riser Down', collection: 'fx', category: 'fx', duration: 3.0 },
    { id: 'fx-sweep-up', name: 'Sweep Up', collection: 'fx', category: 'fx', duration: 2.5 },
    { id: 'fx-sweep-down', name: 'Sweep Down', collection: 'fx', category: 'fx', duration: 2.5 },
    { id: 'fx-impact', name: 'Impact', collection: 'fx', category: 'fx', duration: 2.0 },
    { id: 'fx-whitenoise', name: 'White Noise', collection: 'fx', category: 'fx', duration: 2.0 },
    { id: 'fx-vinyl', name: 'Vinyl Crackle', collection: 'fx', category: 'fx', duration: 3.0 },
    { id: 'fx-laser', name: 'Laser', collection: 'fx', category: 'fx', duration: 0.5 },
    { id: 'fx-zap', name: 'Zap', collection: 'fx', category: 'fx', duration: 0.3 },
    { id: 'fx-siren', name: 'Siren', collection: 'fx', category: 'fx', duration: 2.5 },
    { id: 'fx-alarm', name: 'Alarm', collection: 'fx', category: 'fx', duration: 2.0 },

    // VOCALS (6)
    { id: 'vox-chop', name: 'Vocal Chop', collection: 'vocals', category: 'vocals', duration: 0.4 },
    { id: 'vox-ah', name: 'Formant Ah', collection: 'vocals', category: 'vocals', duration: 1.0 },
    { id: 'vox-oh', name: 'Formant Oh', collection: 'vocals', category: 'vocals', duration: 1.0 },
    { id: 'vox-ee', name: 'Formant Ee', collection: 'vocals', category: 'vocals', duration: 1.0 },
    { id: 'vox-stab', name: 'Vocal Stab', collection: 'vocals', category: 'vocals', duration: 0.3 },
    { id: 'vox-rise', name: 'Vocal Rise', collection: 'vocals', category: 'vocals', duration: 2.0 }
  ];

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function createNoise(offCtx, duration) {
    const len = offCtx.sampleRate * duration;
    const buf = offCtx.createBuffer(1, len, offCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function applyAmpEnvelope(gainNode, t, a, d, s, r, dur) {
    const g = gainNode.gain;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(1, t + a);
    g.linearRampToValueAtTime(s, t + a + d);
    g.setValueAtTime(s, t + dur - r);
    g.linearRampToValueAtTime(0, t + dur);
  }

  function connectChain(nodes) {
    for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
  }

  // ---------------------------------------------------------------------------
  // Synthesis recipes
  // ---------------------------------------------------------------------------
  const recipes = {};

  // ---- KICK RECIPES ----
  recipes['kick-808'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, 0);
    osc.frequency.exponentialRampToValueAtTime(40, 0.06);
    osc.frequency.exponentialRampToValueAtTime(30, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.7, 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-house'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.03);
    osc.frequency.exponentialRampToValueAtTime(40, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    // click transient
    const click = offCtx.createOscillator();
    const clickGain = offCtx.createGain();
    click.type = 'square';
    click.frequency.value = 1500;
    clickGain.gain.setValueAtTime(0.4, 0);
    clickGain.gain.exponentialRampToValueAtTime(0.001, 0.01);
    click.connect(clickGain).connect(offCtx.destination);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
    click.start(0); click.stop(0.01);
  };

  recipes['kick-dnb'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.02);
    osc.frequency.exponentialRampToValueAtTime(45, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur * 0.7);
    gain.gain.setValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-dubstep'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    const dist = offCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x)); }
    dist.curve = curve;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(35, 0.05);
    osc.frequency.exponentialRampToValueAtTime(28, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(dist).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-deep'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, 0);
    osc.frequency.exponentialRampToValueAtTime(35, 0.08);
    osc.frequency.exponentialRampToValueAtTime(25, dur);
    gain.gain.setValueAtTime(0.9, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-punchy'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.015);
    osc.frequency.exponentialRampToValueAtTime(50, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, 0.15);
    // top layer
    const top = offCtx.createOscillator();
    const tg = offCtx.createGain();
    top.type = 'triangle';
    top.frequency.setValueAtTime(2000, 0);
    top.frequency.exponentialRampToValueAtTime(100, 0.01);
    tg.gain.setValueAtTime(0.3, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.02);
    top.connect(tg).connect(offCtx.destination);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
    top.start(0); top.stop(dur);
  };

  recipes['kick-sub'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, 0);
    osc.frequency.exponentialRampToValueAtTime(30, 0.1);
    osc.frequency.exponentialRampToValueAtTime(22, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-techno'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, 0);
    osc.frequency.exponentialRampToValueAtTime(45, 0.025);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    const click = offCtx.createOscillator();
    const cg = offCtx.createGain();
    click.type = 'square';
    click.frequency.value = 3000;
    cg.gain.setValueAtTime(0.5, 0);
    cg.gain.exponentialRampToValueAtTime(0.001, 0.005);
    click.connect(cg).connect(offCtx.destination);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); click.start(0); click.stop(0.01);
  };

  recipes['kick-distorted'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    const dist = offCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 4); }
    dist.curve = curve;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, 0);
    osc.frequency.exponentialRampToValueAtTime(40, 0.04);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(dist).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-click'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, 0);
    osc.frequency.exponentialRampToValueAtTime(80, 0.008);
    osc.frequency.exponentialRampToValueAtTime(60, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur * 0.8);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['kick-layered'] = function(offCtx, dur) {
    // sub layer
    const sub = offCtx.createOscillator();
    const sg = offCtx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(150, 0);
    sub.frequency.exponentialRampToValueAtTime(40, 0.04);
    sg.gain.setValueAtTime(0.8, 0);
    sg.gain.exponentialRampToValueAtTime(0.001, dur);
    sub.connect(sg).connect(offCtx.destination);
    // mid layer
    const mid = offCtx.createOscillator();
    const mg = offCtx.createGain();
    mid.type = 'triangle';
    mid.frequency.setValueAtTime(800, 0);
    mid.frequency.exponentialRampToValueAtTime(100, 0.02);
    mg.gain.setValueAtTime(0.4, 0);
    mg.gain.exponentialRampToValueAtTime(0.001, 0.1);
    mid.connect(mg).connect(offCtx.destination);
    // noise click
    const nBuf = createNoise(offCtx, 0.02);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'highpass'; filt.frequency.value = 3000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.3, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.015);
    ns.connect(filt).connect(ng).connect(offCtx.destination);
    sub.start(0); sub.stop(dur); mid.start(0); mid.stop(dur); ns.start(0);
  };

  recipes['kick-boom'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(28, 0.15);
    osc.frequency.exponentialRampToValueAtTime(20, dur);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.setValueAtTime(0.8, 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  // ---- SNARE RECIPES ----
  function snareBase(offCtx, dur, toneFreq, toneDecay, noiseFreq, noiseQ, noiseVol, toneVol) {
    // tone body
    const osc = offCtx.createOscillator();
    const og = offCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toneFreq, 0);
    osc.frequency.exponentialRampToValueAtTime(toneFreq * 0.5, dur);
    og.gain.setValueAtTime(toneVol || 0.7, 0);
    og.gain.exponentialRampToValueAtTime(0.001, toneDecay);
    osc.connect(og).connect(offCtx.destination);
    // noise
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = noiseFreq; filt.Q.value = noiseQ || 1;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(noiseVol || 0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.9);
    ns.connect(filt).connect(ng).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); ns.start(0);
  }

  recipes['snare-tight'] = (ctx, d) => snareBase(ctx, d, 220, 0.08, 5000, 1.5, 0.5, 0.6);
  recipes['snare-fat'] = (ctx, d) => snareBase(ctx, d, 180, 0.15, 3500, 0.8, 0.6, 0.7);
  recipes['snare-dnb'] = (ctx, d) => snareBase(ctx, d, 250, 0.06, 6000, 1.2, 0.6, 0.5);

  recipes['snare-clap'] = function(offCtx, dur) {
    // multiple noise bursts for clap texture
    for (let i = 0; i < 3; i++) {
      const nBuf = createNoise(offCtx, dur);
      const ns = offCtx.createBufferSource();
      const ng = offCtx.createGain();
      const filt = offCtx.createBiquadFilter();
      filt.type = 'bandpass'; filt.frequency.value = 2500; filt.Q.value = 0.8;
      ns.buffer = nBuf;
      const offset = i * 0.008;
      ng.gain.setValueAtTime(0, 0);
      ng.gain.setValueAtTime(0.6, offset);
      ng.gain.exponentialRampToValueAtTime(0.001, offset + dur * 0.6);
      ns.connect(filt).connect(ng).connect(offCtx.destination);
      ns.start(0);
    }
  };

  recipes['snare-rimshot'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const og = offCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, 0);
    osc.frequency.exponentialRampToValueAtTime(300, 0.01);
    og.gain.setValueAtTime(0.8, 0);
    og.gain.exponentialRampToValueAtTime(0.001, dur * 0.6);
    osc.connect(og).connect(offCtx.destination);
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const hp = offCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 6000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.3, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.05);
    ns.connect(hp).connect(ng).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); ns.start(0);
  };

  recipes['snare-lofi'] = function(offCtx, dur) {
    snareBase(offCtx, dur, 200, 0.12, 2500, 2.0, 0.4, 0.5);
  };

  recipes['snare-noise'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = 0.6;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.7, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['snare-layered'] = function(offCtx, dur) {
    snareBase(offCtx, dur, 200, 0.1, 4500, 1.0, 0.5, 0.6);
    // extra body
    const osc2 = offCtx.createOscillator();
    const g2 = offCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 150;
    g2.gain.setValueAtTime(0.3, 0);
    g2.gain.exponentialRampToValueAtTime(0.001, 0.08);
    osc2.connect(g2).connect(offCtx.destination);
    osc2.start(0); osc2.stop(dur);
  };

  recipes['snare-breakbeat'] = (ctx, d) => snareBase(ctx, d, 230, 0.1, 5500, 1.0, 0.55, 0.65);

  recipes['snare-electronic'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const og = offCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, 0);
    osc.frequency.exponentialRampToValueAtTime(150, dur);
    og.gain.setValueAtTime(0.5, 0);
    og.gain.exponentialRampToValueAtTime(0.001, dur * 0.7);
    osc.connect(og).connect(offCtx.destination);
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const hp = offCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.4, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(hp).connect(ng).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); ns.start(0);
  };

  // ---- HI-HAT RECIPES ----
  function hihatBase(offCtx, dur, hpFreq, vol, decayMul) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const hp = offCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = hpFreq || 7000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(vol || 0.4, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur * (decayMul || 0.8));
    ns.connect(hp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  }

  recipes['hat-closed'] = (ctx, d) => hihatBase(ctx, d, 8000, 0.4, 0.6);
  recipes['hat-open'] = (ctx, d) => hihatBase(ctx, d, 6000, 0.35, 0.95);
  recipes['hat-pedal'] = (ctx, d) => hihatBase(ctx, d, 9000, 0.3, 0.5);

  recipes['hat-shaker'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8000; bp.Q.value = 2;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.3, 0);
    ng.gain.setValueAtTime(0.35, dur * 0.3);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['hat-metallic'] = function(offCtx, dur) {
    // metallic hats use square waves at inharmonic ratios
    const freqs = [800, 1340, 1640, 3266];
    freqs.forEach(f => {
      const osc = offCtx.createOscillator();
      const g = offCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.1, 0);
      g.gain.exponentialRampToValueAtTime(0.001, dur * 0.7);
      const hp = offCtx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 5000;
      osc.connect(hp).connect(g).connect(offCtx.destination);
      osc.start(0); osc.stop(dur);
    });
  };

  recipes['hat-bright'] = (ctx, d) => hihatBase(ctx, d, 10000, 0.4, 0.6);
  recipes['hat-dark'] = (ctx, d) => hihatBase(ctx, d, 4000, 0.3, 0.6);
  recipes['hat-sizzle'] = (ctx, d) => hihatBase(ctx, d, 6000, 0.3, 0.95);

  recipes['hat-ride'] = function(offCtx, dur) {
    hihatBase(offCtx, dur, 5000, 0.25, 0.9);
    const osc = offCtx.createOscillator();
    const g = offCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 800;
    g.gain.setValueAtTime(0.15, 0);
    g.gain.exponentialRampToValueAtTime(0.001, dur * 0.8);
    osc.connect(g).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['hat-crash'] = function(offCtx, dur) {
    hihatBase(offCtx, dur, 4000, 0.5, 0.98);
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const lp = offCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 8000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.25, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.95);
    ns.connect(lp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  // ---- CLAP RECIPES ----
  function clapBase(offCtx, dur, burstCount, spacing, freq, q, vol) {
    for (let i = 0; i < burstCount; i++) {
      const nBuf = createNoise(offCtx, dur);
      const ns = offCtx.createBufferSource();
      const ng = offCtx.createGain();
      const bp = offCtx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = freq || 2500; bp.Q.value = q || 0.8;
      ns.buffer = nBuf;
      const t = i * (spacing || 0.01);
      ng.gain.setValueAtTime(0, 0);
      ng.gain.linearRampToValueAtTime(vol || 0.5, t);
      ng.gain.setValueAtTime(vol || 0.5, t + 0.002);
      ng.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.5);
      ns.connect(bp).connect(ng).connect(offCtx.destination);
      ns.start(0);
    }
  }

  recipes['clap-house'] = (ctx, d) => clapBase(ctx, d, 4, 0.01, 2200, 0.7, 0.5);
  recipes['clap-tight'] = (ctx, d) => clapBase(ctx, d, 3, 0.005, 3000, 1.0, 0.5);
  recipes['clap-big'] = (ctx, d) => clapBase(ctx, d, 5, 0.012, 2000, 0.6, 0.6);
  recipes['clap-layered'] = function(offCtx, dur) {
    clapBase(offCtx, dur, 4, 0.01, 2200, 0.7, 0.4);
    clapBase(offCtx, dur, 3, 0.008, 4000, 1.2, 0.25);
  };

  recipes['clap-reverb'] = function(offCtx, dur) {
    clapBase(offCtx, dur, 4, 0.01, 2200, 0.7, 0.5);
    // fake reverb tail with filtered noise
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 0.3;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.15, 0.05);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['clap-snap'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5000; bp.Q.value = 3;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.7, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.5);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  // ---- PERCUSSION RECIPES ----
  function tomRecipe(offCtx, dur, startFreq, endFreq) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, 0);
    osc.frequency.exponentialRampToValueAtTime(endFreq, dur * 0.5);
    gain.gain.setValueAtTime(0.8, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  }

  recipes['perc-tom-low'] = (ctx, d) => tomRecipe(ctx, d, 150, 80);
  recipes['perc-tom-mid'] = (ctx, d) => tomRecipe(ctx, d, 250, 150);
  recipes['perc-tom-high'] = (ctx, d) => tomRecipe(ctx, d, 400, 250);

  recipes['perc-bongo'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(300, 0.01);
    gain.gain.setValueAtTime(0.7, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur * 0.8);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['perc-conga'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, 0);
    osc.frequency.exponentialRampToValueAtTime(200, 0.02);
    gain.gain.setValueAtTime(0.8, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['perc-cowbell'] = function(offCtx, dur) {
    const osc1 = offCtx.createOscillator();
    const osc2 = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc1.type = 'square'; osc1.frequency.value = 800;
    osc2.type = 'square'; osc2.frequency.value = 540;
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 3;
    gain.gain.setValueAtTime(0.4, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc1.connect(bp); osc2.connect(bp);
    bp.connect(gain).connect(offCtx.destination);
    osc1.start(0); osc1.stop(dur); osc2.start(0); osc2.stop(dur);
  };

  recipes['perc-tambourine'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const hp = offCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 8000;
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 10000; bp.Q.value = 2;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.4, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(hp).connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['perc-shaker'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 9000; bp.Q.value = 1.5;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.2, 0);
    ng.gain.setValueAtTime(0.3, dur * 0.4);
    ng.gain.exponentialRampToValueAtTime(0.001, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['perc-woodblock'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, 0);
    osc.frequency.exponentialRampToValueAtTime(600, dur);
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 5;
    gain.gain.setValueAtTime(0.6, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur * 0.6);
    osc.connect(bp).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['perc-triangle'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 4000;
    gain.gain.setValueAtTime(0.3, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    const osc2 = offCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 7520;
    const g2 = offCtx.createGain();
    g2.gain.setValueAtTime(0.15, 0);
    g2.gain.exponentialRampToValueAtTime(0.001, dur * 0.8);
    osc.connect(gain).connect(offCtx.destination);
    osc2.connect(g2).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); osc2.start(0); osc2.stop(dur);
  };

  // ---- BASS RECIPES ----
  recipes['bass-sub'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 55;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.8, 0.02);
    gain.gain.setValueAtTime(0.8, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-deep'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const osc2 = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 50;
    osc2.type = 'sine'; osc2.frequency.value = 100;
    const g2 = offCtx.createGain(); g2.gain.value = 0.3;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.7, 0.03);
    gain.gain.setValueAtTime(0.7, dur - 0.15);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain); osc2.connect(g2).connect(gain);
    gain.connect(offCtx.destination);
    osc.start(0); osc.stop(dur); osc2.start(0); osc2.stop(dur);
  };

  recipes['bass-wobble'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    const lfo = offCtx.createOscillator();
    const lfoGain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    filt.type = 'lowpass'; filt.frequency.value = 600; filt.Q.value = 10;
    lfo.type = 'sine'; lfo.frequency.value = 4;
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain).connect(filt.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.6, 0.03);
    gain.gain.setValueAtTime(0.6, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); lfo.start(0); lfo.stop(dur);
  };

  recipes['bass-reese'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.03);
    gain.gain.setValueAtTime(0.5, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    const detunes = [-12, -5, 0, 7, 14];
    detunes.forEach(d => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 55;
      osc.detune.value = d;
      const og = offCtx.createGain();
      og.gain.value = 0.2;
      osc.connect(og).connect(gain);
      osc.start(0); osc.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  recipes['bass-acid'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 65;
    filt.type = 'lowpass'; filt.Q.value = 15;
    filt.frequency.setValueAtTime(3000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, dur * 0.4);
    gain.gain.setValueAtTime(0.6, 0);
    gain.gain.setValueAtTime(0.6, dur - 0.05);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-pluck'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 65;
    filt.type = 'lowpass'; filt.Q.value = 5;
    filt.frequency.setValueAtTime(2000, 0);
    filt.frequency.exponentialRampToValueAtTime(100, 0.15);
    gain.gain.setValueAtTime(0.7, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-saw'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    filt.type = 'lowpass'; filt.frequency.value = 800; filt.Q.value = 2;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.6, 0.02);
    gain.gain.setValueAtTime(0.6, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-square'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 55;
    filt.type = 'lowpass'; filt.frequency.value = 600; filt.Q.value = 1;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.02);
    gain.gain.setValueAtTime(0.5, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-fm'] = function(offCtx, dur) {
    const carrier = offCtx.createOscillator();
    const modulator = offCtx.createOscillator();
    const modGain = offCtx.createGain();
    const gain = offCtx.createGain();
    carrier.type = 'sine'; carrier.frequency.value = 55;
    modulator.type = 'sine'; modulator.frequency.value = 110;
    modGain.gain.setValueAtTime(200, 0);
    modGain.gain.exponentialRampToValueAtTime(10, dur * 0.5);
    modulator.connect(modGain).connect(carrier.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.6, 0.02);
    gain.gain.setValueAtTime(0.6, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    carrier.connect(gain).connect(offCtx.destination);
    carrier.start(0); carrier.stop(dur); modulator.start(0); modulator.stop(dur);
  };

  recipes['bass-808'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, 0);
    osc.frequency.exponentialRampToValueAtTime(45, 0.05);
    osc.frequency.setValueAtTime(45, dur);
    gain.gain.setValueAtTime(0.9, 0);
    gain.gain.setValueAtTime(0.7, 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-rubber'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.15);
    osc.frequency.exponentialRampToValueAtTime(55, dur);
    gain.gain.setValueAtTime(0.7, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['bass-growl'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    const lfo = offCtx.createOscillator();
    const lfoGain = offCtx.createGain();
    const dist = offCtx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 3); }
    dist.curve = curve;
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    filt.type = 'lowpass'; filt.frequency.value = 500; filt.Q.value = 12;
    lfo.type = 'sine'; lfo.frequency.value = 6;
    lfoGain.gain.value = 400;
    lfo.connect(lfoGain).connect(filt.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.03);
    gain.gain.setValueAtTime(0.5, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(dist).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); lfo.start(0); lfo.stop(dur);
  };

  // ---- SYNTH RECIPES ----
  recipes['synth-saw-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 2;
    filt.frequency.setValueAtTime(4000, 0);
    filt.frequency.exponentialRampToValueAtTime(500, dur);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    [261.63, 329.63, 392.00].forEach(f => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const og = offCtx.createGain(); og.gain.value = 0.3;
      osc.connect(og).connect(filt);
      osc.start(0); osc.stop(dur);
    });
    filt.connect(gain).connect(offCtx.destination);
  };

  recipes['synth-supersaw'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.02);
    gain.gain.setValueAtTime(0.4, dur - 0.15);
    gain.gain.linearRampToValueAtTime(0, dur);
    const detunes = [-25, -15, -5, 0, 5, 15, 25];
    detunes.forEach(d => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const og = offCtx.createGain(); og.gain.value = 0.12;
      osc.connect(og).connect(gain);
      osc.start(0); osc.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  recipes['synth-square-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.setValueAtTime(3000, 0);
    filt.frequency.exponentialRampToValueAtTime(400, dur);
    filt.Q.value = 1;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    [261.63, 329.63, 392.00].forEach(f => {
      const osc = offCtx.createOscillator();
      osc.type = 'square'; osc.frequency.value = f;
      const og = offCtx.createGain(); og.gain.value = 0.2;
      osc.connect(og).connect(filt);
      osc.start(0); osc.stop(dur);
    });
    filt.connect(gain).connect(offCtx.destination);
  };

  recipes['synth-chord-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 1;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.setValueAtTime(0.35, dur * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    // Cm7 chord
    [261.63, 311.13, 392.00, 466.16].forEach(f => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const og = offCtx.createGain(); og.gain.value = 0.15;
      osc.connect(og).connect(filt);
      osc.start(0); osc.stop(dur);
    });
    filt.connect(gain).connect(offCtx.destination);
  };

  recipes['synth-organ-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.setValueAtTime(0.35, dur - 0.05);
    gain.gain.linearRampToValueAtTime(0, dur);
    // organ drawbar simulation
    const harmonics = [1, 2, 3, 4, 6];
    const levels = [0.3, 0.2, 0.15, 0.1, 0.05];
    harmonics.forEach((h, i) => {
      const osc = offCtx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 261.63 * h;
      const og = offCtx.createGain(); og.gain.value = levels[i];
      osc.connect(og).connect(gain);
      osc.start(0); osc.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  recipes['synth-brass-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 2;
    filt.frequency.setValueAtTime(200, 0);
    filt.frequency.linearRampToValueAtTime(3000, 0.08);
    filt.frequency.exponentialRampToValueAtTime(800, dur);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.5, 0.05);
    gain.gain.setValueAtTime(0.4, dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    [220, 277.18, 329.63].forEach(f => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const og = offCtx.createGain(); og.gain.value = 0.2;
      osc.connect(og).connect(filt);
      osc.start(0); osc.stop(dur);
    });
    filt.connect(gain).connect(offCtx.destination);
  };

  recipes['synth-pluck'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    filt.type = 'lowpass'; filt.Q.value = 3;
    filt.frequency.setValueAtTime(6000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.15);
    gain.gain.setValueAtTime(0.6, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['synth-bell'] = function(offCtx, dur) {
    const carrier = offCtx.createOscillator();
    const modulator = offCtx.createOscillator();
    const modGain = offCtx.createGain();
    const gain = offCtx.createGain();
    carrier.type = 'sine'; carrier.frequency.value = 880;
    modulator.type = 'sine'; modulator.frequency.value = 880 * 1.4;
    modGain.gain.value = 400;
    modulator.connect(modGain).connect(carrier.frequency);
    gain.gain.setValueAtTime(0.5, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    carrier.connect(gain).connect(offCtx.destination);
    carrier.start(0); carrier.stop(dur); modulator.start(0); modulator.stop(dur);
  };

  recipes['synth-key'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 1;
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(800, 0.2);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.005);
    gain.gain.exponentialRampToValueAtTime(0.15, 0.2);
    gain.gain.setValueAtTime(0.15, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    const osc = offCtx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const osc2 = offCtx.createOscillator();
    osc2.type = 'square'; osc2.frequency.value = 440; osc2.detune.value = 5;
    const og = offCtx.createGain(); og.gain.value = 0.3;
    const og2 = offCtx.createGain(); og2.gain.value = 0.15;
    osc.connect(og).connect(filt); osc2.connect(og2).connect(filt);
    filt.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); osc2.start(0); osc2.stop(dur);
  };

  recipes['synth-poly'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, 0.03);
    gain.gain.setValueAtTime(0.3, dur - 0.15);
    gain.gain.linearRampToValueAtTime(0, dur);
    // major 7th chord, detuned
    [261.63, 329.63, 392.00, 493.88].forEach(f => {
      [-8, 0, 8].forEach(d => {
        const osc = offCtx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const og = offCtx.createGain(); og.gain.value = 0.04;
        osc.connect(og).connect(gain);
        osc.start(0); osc.stop(dur);
      });
    });
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 4000; filt.Q.value = 0.5;
    gain.connect(filt).connect(offCtx.destination);
  };

  // ---- PAD RECIPES ----
  function padBase(offCtx, dur, freqs, waveType, filterFreq, filterQ, detune) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, dur * 0.15);
    gain.gain.setValueAtTime(0.3, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = filterFreq || 2000; filt.Q.value = filterQ || 0.5;
    freqs.forEach(f => {
      const detuneVals = detune || [-10, 0, 10];
      detuneVals.forEach(d => {
        const osc = offCtx.createOscillator();
        osc.type = waveType || 'sawtooth';
        osc.frequency.value = f; osc.detune.value = d;
        const og = offCtx.createGain(); og.gain.value = 0.06;
        osc.connect(og).connect(filt);
        osc.start(0); osc.stop(dur);
      });
    });
    filt.connect(gain).connect(offCtx.destination);
  }

  recipes['pad-warm'] = (ctx, d) => padBase(ctx, d, [220, 277.18, 329.63], 'sawtooth', 1500, 0.5);
  recipes['pad-dark'] = (ctx, d) => padBase(ctx, d, [110, 138.59, 164.81], 'sawtooth', 600, 0.7);

  recipes['pad-ambient'] = function(offCtx, dur) {
    padBase(offCtx, dur, [220, 329.63, 440], 'sine', 3000, 0.3, [-15, 0, 15]);
    // add noise layer
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const lp = offCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1000;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.03, dur * 0.2);
    ng.gain.setValueAtTime(0.03, dur * 0.7);
    ng.gain.linearRampToValueAtTime(0, dur);
    ns.connect(lp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['pad-shimmer'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.25, dur * 0.15);
    gain.gain.setValueAtTime(0.25, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    // high harmonics
    [880, 1108.73, 1318.51, 1760].forEach(f => {
      [-12, 0, 12].forEach(d => {
        const osc = offCtx.createOscillator();
        osc.type = 'sine'; osc.frequency.value = f; osc.detune.value = d;
        const og = offCtx.createGain(); og.gain.value = 0.04;
        osc.connect(og).connect(gain);
        osc.start(0); osc.stop(dur);
      });
    });
    gain.connect(offCtx.destination);
  };

  recipes['pad-string'] = (ctx, d) => padBase(ctx, d, [220, 277.18, 329.63, 440], 'sawtooth', 2500, 0.3, [-7, 0, 7]);

  recipes['pad-glass'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.25, dur * 0.1);
    gain.gain.setValueAtTime(0.2, dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, dur);
    [523.25, 659.25, 783.99].forEach(f => {
      const c = offCtx.createOscillator();
      const m = offCtx.createOscillator();
      const mg = offCtx.createGain();
      c.type = 'sine'; c.frequency.value = f;
      m.type = 'sine'; m.frequency.value = f * 3.5;
      mg.gain.value = 100;
      m.connect(mg).connect(c.frequency);
      const og = offCtx.createGain(); og.gain.value = 0.12;
      c.connect(og).connect(gain);
      c.start(0); c.stop(dur); m.start(0); m.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  recipes['pad-evolving'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 3;
    // slow filter sweep
    filt.frequency.setValueAtTime(300, 0);
    filt.frequency.linearRampToValueAtTime(3000, dur * 0.5);
    filt.frequency.linearRampToValueAtTime(500, dur);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, dur * 0.15);
    gain.gain.setValueAtTime(0.3, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    [110, 164.81, 220, 329.63].forEach(f => {
      [-15, 0, 15].forEach(d => {
        const osc = offCtx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const og = offCtx.createGain(); og.gain.value = 0.04;
        osc.connect(og).connect(filt);
        osc.start(0); osc.stop(dur);
      });
    });
    filt.connect(gain).connect(offCtx.destination);
  };

  recipes['pad-choir'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, dur * 0.2);
    gain.gain.setValueAtTime(0.3, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    // simulated formants
    const formants = [
      { freq: 800, bw: 80 },
      { freq: 1200, bw: 100 },
      { freq: 2500, bw: 120 }
    ];
    [220, 277.18, 329.63].forEach(f => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      formants.forEach(fm => {
        const bp = offCtx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = fm.freq; bp.Q.value = fm.freq / fm.bw;
        const fg = offCtx.createGain(); fg.gain.value = 0.08;
        osc.connect(bp).connect(fg).connect(gain);
      });
      osc.start(0); osc.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  // ---- LEAD RECIPES ----
  recipes['lead-saw'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.setValueAtTime(0.35, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['lead-square'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 440;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, 0.01);
    gain.gain.setValueAtTime(0.3, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['lead-detuned'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.setValueAtTime(0.35, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    [-15, 0, 15].forEach(d => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const og = offCtx.createGain(); og.gain.value = 0.2;
      osc.connect(og).connect(gain);
      osc.start(0); osc.stop(dur);
    });
    gain.connect(offCtx.destination);
  };

  recipes['lead-portamento'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, 0);
    osc.frequency.exponentialRampToValueAtTime(440, 0.2);
    osc.frequency.setValueAtTime(440, dur);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.setValueAtTime(0.35, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['lead-acid'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    filt.type = 'lowpass'; filt.Q.value = 15;
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(400, dur * 0.3);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.45, 0.005);
    gain.gain.setValueAtTime(0.4, dur - 0.05);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['lead-pluck'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const filt = offCtx.createBiquadFilter();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    filt.type = 'lowpass'; filt.Q.value = 4;
    filt.frequency.setValueAtTime(8000, 0);
    filt.frequency.exponentialRampToValueAtTime(300, 0.12);
    gain.gain.setValueAtTime(0.5, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(filt).connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['lead-whistle'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 1200;
    // slight vibrato
    const lfo = offCtx.createOscillator();
    const lfoG = offCtx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    lfoG.gain.value = 15;
    lfo.connect(lfoG).connect(osc.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, 0.05);
    gain.gain.setValueAtTime(0.25, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); lfo.start(0); lfo.stop(dur);
  };

  recipes['lead-hoover'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, 0.02);
    gain.gain.setValueAtTime(0.3, dur - 0.15);
    gain.gain.linearRampToValueAtTime(0, dur);
    // detuned saws with pitch sweep
    [-30, -10, 0, 10, 30].forEach(d => {
      const osc = offCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, 0);
      osc.frequency.exponentialRampToValueAtTime(300, 0.15);
      osc.detune.value = d;
      const og = offCtx.createGain(); og.gain.value = 0.12;
      osc.connect(og).connect(gain);
      osc.start(0); osc.stop(dur);
    });
    const filt = offCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 3000; filt.Q.value = 2;
    gain.connect(filt).connect(offCtx.destination);
  };

  // ---- FX RECIPES ----
  recipes['fx-riser-up'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(4000, dur);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, dur * 0.8);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
    // noise layer
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const hp = offCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(200, 0);
    hp.frequency.exponentialRampToValueAtTime(8000, dur);
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.15, dur * 0.8);
    ng.gain.linearRampToValueAtTime(0, dur);
    ns.connect(hp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['fx-riser-down'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(4000, 0);
    osc.frequency.exponentialRampToValueAtTime(80, dur);
    gain.gain.setValueAtTime(0.4, 0);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['fx-sweep-up'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 5;
    bp.frequency.setValueAtTime(200, 0);
    bp.frequency.exponentialRampToValueAtTime(10000, dur);
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.5, dur * 0.7);
    ng.gain.linearRampToValueAtTime(0, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['fx-sweep-down'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 5;
    bp.frequency.setValueAtTime(10000, 0);
    bp.frequency.exponentialRampToValueAtTime(200, dur);
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.linearRampToValueAtTime(0, dur);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['fx-impact'] = function(offCtx, dur) {
    // low boom
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(20, 0.3);
    gain.gain.setValueAtTime(1, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
    // noise crash
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.6, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.5);
    ns.connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['fx-whitenoise'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.3, 0.02);
    ng.gain.setValueAtTime(0.3, dur - 0.1);
    ng.gain.linearRampToValueAtTime(0, dur);
    ns.connect(ng).connect(offCtx.destination);
    ns.start(0);
  };

  recipes['fx-vinyl'] = function(offCtx, dur) {
    const nBuf = createNoise(offCtx, dur);
    const ns = offCtx.createBufferSource();
    const ng = offCtx.createGain();
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = 0.3;
    ns.buffer = nBuf;
    ng.gain.setValueAtTime(0.08, 0);
    // random crackle effect via amplitude modulation
    const lfo = offCtx.createOscillator();
    const lfoG = offCtx.createGain();
    lfo.type = 'sawtooth'; lfo.frequency.value = 0.3;
    lfoG.gain.value = 0.04;
    lfo.connect(lfoG).connect(ng.gain);
    ns.connect(bp).connect(ng).connect(offCtx.destination);
    ns.start(0); lfo.start(0); lfo.stop(dur);
  };

  recipes['fx-laser'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3000, 0);
    osc.frequency.exponentialRampToValueAtTime(100, dur);
    gain.gain.setValueAtTime(0.4, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['fx-zap'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(5000, 0);
    osc.frequency.exponentialRampToValueAtTime(50, dur * 0.8);
    gain.gain.setValueAtTime(0.35, 0);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['fx-siren'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    const lfo = offCtx.createOscillator();
    const lfoG = offCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 800;
    lfo.type = 'sine'; lfo.frequency.value = 3;
    lfoG.gain.value = 400;
    lfo.connect(lfoG).connect(osc.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.3, 0.1);
    gain.gain.setValueAtTime(0.3, dur - 0.2);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); lfo.start(0); lfo.stop(dur);
  };

  recipes['fx-alarm'] = function(offCtx, dur) {
    const osc = offCtx.createOscillator();
    const gain = offCtx.createGain();
    const lfo = offCtx.createOscillator();
    const lfoG = offCtx.createGain();
    osc.type = 'square'; osc.frequency.value = 1000;
    lfo.type = 'square'; lfo.frequency.value = 6;
    lfoG.gain.value = 300;
    lfo.connect(lfoG).connect(osc.frequency);
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.25, 0.05);
    gain.gain.setValueAtTime(0.25, dur - 0.1);
    gain.gain.linearRampToValueAtTime(0, dur);
    osc.connect(gain).connect(offCtx.destination);
    osc.start(0); osc.stop(dur); lfo.start(0); lfo.stop(dur);
  };

  // ---- VOCAL RECIPES ----
  function formantSynth(offCtx, dur, f1, f2, f3, fundamental) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, dur * 0.1);
    gain.gain.setValueAtTime(0.3, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    const formants = [
      { freq: f1, q: 10, gain: 1.0 },
      { freq: f2, q: 12, gain: 0.7 },
      { freq: f3, q: 14, gain: 0.4 }
    ];
    // source: pulse wave
    const osc = offCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = fundamental || 150;
    formants.forEach(fm => {
      const bp = offCtx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = fm.freq; bp.Q.value = fm.q;
      const fg = offCtx.createGain(); fg.gain.value = fm.gain * 0.15;
      osc.connect(bp).connect(fg).connect(gain);
    });
    osc.start(0); osc.stop(dur);
    gain.connect(offCtx.destination);
  }

  // Formant frequencies: Ah(800,1200,2500), Oh(500,800,2800), Ee(300,2300,3000)
  recipes['vox-ah'] = (ctx, d) => formantSynth(ctx, d, 800, 1200, 2500, 150);
  recipes['vox-oh'] = (ctx, d) => formantSynth(ctx, d, 500, 800, 2800, 150);
  recipes['vox-ee'] = (ctx, d) => formantSynth(ctx, d, 300, 2300, 3000, 180);

  recipes['vox-chop'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    const osc = offCtx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 200;
    const bp1 = offCtx.createBiquadFilter();
    bp1.type = 'bandpass'; bp1.frequency.value = 700; bp1.Q.value = 8;
    const bp2 = offCtx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 1200; bp2.Q.value = 10;
    const g1 = offCtx.createGain(); g1.gain.value = 0.3;
    const g2 = offCtx.createGain(); g2.gain.value = 0.2;
    osc.connect(bp1).connect(g1).connect(gain);
    osc.connect(bp2).connect(g2).connect(gain);
    gain.connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['vox-stab'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.4, 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, dur);
    const osc = offCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, 0);
    osc.frequency.exponentialRampToValueAtTime(180, dur);
    const bp = offCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 12;
    const bp2 = offCtx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 2500; bp2.Q.value = 10;
    const g1 = offCtx.createGain(); g1.gain.value = 0.3;
    const g2 = offCtx.createGain(); g2.gain.value = 0.15;
    osc.connect(bp).connect(g1).connect(gain);
    osc.connect(bp2).connect(g2).connect(gain);
    gain.connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  recipes['vox-rise'] = function(offCtx, dur) {
    const gain = offCtx.createGain();
    gain.gain.setValueAtTime(0, 0);
    gain.gain.linearRampToValueAtTime(0.35, dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, dur);
    const osc = offCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(400, dur);
    // morphing formants
    const bp1 = offCtx.createBiquadFilter();
    bp1.type = 'bandpass'; bp1.Q.value = 8;
    bp1.frequency.setValueAtTime(500, 0);
    bp1.frequency.linearRampToValueAtTime(800, dur);
    const bp2 = offCtx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.Q.value = 10;
    bp2.frequency.setValueAtTime(800, 0);
    bp2.frequency.linearRampToValueAtTime(2300, dur);
    const g1 = offCtx.createGain(); g1.gain.value = 0.25;
    const g2 = offCtx.createGain(); g2.gain.value = 0.15;
    osc.connect(bp1).connect(g1).connect(gain);
    osc.connect(bp2).connect(g2).connect(gain);
    gain.connect(offCtx.destination);
    osc.start(0); osc.stop(dur);
  };

  // ---------------------------------------------------------------------------
  // SoundLibrary object
  // ---------------------------------------------------------------------------
  const SoundLibrary = {
    sounds: SOUNDS,
    cache: new Map(),
    ctx: null,

    init: function(audioCtx) {
      this.ctx = audioCtx;
    },

    getCollections: function() {
      const cols = {};
      this.sounds.forEach(function(s) {
        if (!cols[s.collection]) cols[s.collection] = [];
        cols[s.collection].push(s);
      });
      return cols;
    },

    getSounds: function(category) {
      if (!category) return this.sounds.slice();
      return this.sounds.filter(function(s) { return s.category === category; });
    },

    getSoundById: function(id) {
      return this.sounds.find(function(s) { return s.id === id; }) || null;
    },

    searchSounds: function(query) {
      if (!query) return this.sounds.slice();
      var q = query.toLowerCase();
      return this.sounds.filter(function(s) {
        return s.id.toLowerCase().indexOf(q) !== -1 ||
               s.name.toLowerCase().indexOf(q) !== -1 ||
               s.category.toLowerCase().indexOf(q) !== -1 ||
               s.collection.toLowerCase().indexOf(q) !== -1;
      });
    },

    generateSound: function(id) {
      var self = this;
      if (self.cache.has(id)) {
        return Promise.resolve(self.cache.get(id));
      }
      var sound = self.getSoundById(id);
      if (!sound) {
        return Promise.reject(new Error('Sound not found: ' + id));
      }
      var recipe = recipes[id];
      if (!recipe) {
        return Promise.reject(new Error('No synthesis recipe for: ' + id));
      }
      var sampleRate = (self.ctx && self.ctx.sampleRate) || 44100;
      var offCtx = new OfflineAudioContext(2, Math.ceil(sampleRate * sound.duration), sampleRate);
      try {
        recipe(offCtx, sound.duration);
      } catch (e) {
        return Promise.reject(e);
      }
      return offCtx.startRendering().then(function(buffer) {
        self.cache.set(id, buffer);
        return buffer;
      });
    }
  };

  window.soundLibrary = SoundLibrary;
})();
