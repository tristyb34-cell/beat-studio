(function() {
'use strict';

// ============ HELPER FUNCTIONS ============

function createNoise(ctx, duration, type) {
  const len = Math.ceil(duration * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function applyEnvelope(ctx, param, attack, decay, sustain, release, duration, peak) {
  peak = peak || 1;
  const now = 0;
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(peak, now + attack);
  param.linearRampToValueAtTime(peak * sustain, now + attack + decay);
  param.linearRampToValueAtTime(peak * sustain, now + duration - release);
  param.linearRampToValueAtTime(0, now + duration);
}

function connectThrough(nodes) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i+1]);
}

function karplusStrong(ctx, freq, duration, noiseLen, filterFreq, gain) {
  noiseLen = noiseLen || 0.002;
  filterFreq = filterFreq || 2000;
  gain = gain || 0.8;
  const sr = ctx.sampleRate;
  const totalSamples = Math.ceil(duration * sr);
  const delaySamples = Math.round(sr / freq);
  const noiseSamples = Math.ceil(noiseLen * sr);
  const buf = ctx.createBuffer(1, totalSamples, sr);
  const data = buf.getChannelData(0);
  for (let i = 0; i < noiseSamples; i++) data[i] = (Math.random() * 2 - 1) * gain;
  for (let i = delaySamples; i < totalSamples; i++) {
    data[i] = (data[i - delaySamples] + (i - delaySamples - 1 >= 0 ? data[i - delaySamples - 1] : 0)) * 0.5 * 0.996;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function createFormantFilter(ctx, source, f1, f2, f3, bw) {
  bw = bw || 100;
  const filters = [f1, f2, f3].map(f => {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = f / bw;
    return bp;
  });
  const merger = ctx.createGain();
  merger.gain.value = 0.33;
  filters.forEach(f => { source.connect(f); f.connect(merger); });
  return merger;
}


// ============ SOUND DEFINITIONS (502 sounds) ============
const SOUNDS = [
  {
    "id": "kick-808",
    "name": "808 Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.8
  },
  {
    "id": "kick-house",
    "name": "House Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.4
  },
  {
    "id": "kick-dnb",
    "name": "DnB Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.3
  },
  {
    "id": "kick-dubstep",
    "name": "Dubstep Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.6
  },
  {
    "id": "kick-deep",
    "name": "Deep Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.7
  },
  {
    "id": "kick-punchy",
    "name": "Punchy Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.25
  },
  {
    "id": "kick-sub",
    "name": "Sub Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.9
  },
  {
    "id": "kick-techno",
    "name": "Techno Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.35
  },
  {
    "id": "kick-distorted",
    "name": "Distorted Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.3
  },
  {
    "id": "kick-click",
    "name": "Click Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.15
  },
  {
    "id": "kick-layered",
    "name": "Layered Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.4
  },
  {
    "id": "kick-boom",
    "name": "Boom Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 1.0
  },
  {
    "id": "kick-trap",
    "name": "Trap Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.6
  },
  {
    "id": "kick-garage",
    "name": "Garage Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.35
  },
  {
    "id": "kick-minimal",
    "name": "Minimal Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.2
  },
  {
    "id": "kick-hard",
    "name": "Hard Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.3
  },
  {
    "id": "kick-soft",
    "name": "Soft Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.5
  },
  {
    "id": "kick-vinyl",
    "name": "Vinyl Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.4
  },
  {
    "id": "kick-compressed",
    "name": "Compressed Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.3
  },
  {
    "id": "kick-tight",
    "name": "Tight Kick",
    "collection": "Drum Machines",
    "category": "kicks",
    "duration": 0.2
  },
  {
    "id": "snare-tight",
    "name": "Tight Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.2
  },
  {
    "id": "snare-fat",
    "name": "Fat Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.35
  },
  {
    "id": "snare-dnb",
    "name": "DnB Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.25
  },
  {
    "id": "snare-clap",
    "name": "Clap Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.3
  },
  {
    "id": "snare-rimshot",
    "name": "Rimshot",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.15
  },
  {
    "id": "snare-lofi",
    "name": "Lo-fi Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.3
  },
  {
    "id": "snare-noise",
    "name": "Noise Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.25
  },
  {
    "id": "snare-layered",
    "name": "Layered Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.3
  },
  {
    "id": "snare-breakbeat",
    "name": "Breakbeat Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.2
  },
  {
    "id": "snare-electronic",
    "name": "Electronic Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.25
  },
  {
    "id": "snare-trap",
    "name": "Trap Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.35
  },
  {
    "id": "snare-garage",
    "name": "Garage Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.22
  },
  {
    "id": "snare-pitched",
    "name": "Pitched Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.2
  },
  {
    "id": "snare-compressed",
    "name": "Compressed Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.18
  },
  {
    "id": "snare-ring",
    "name": "Ring Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.3
  },
  {
    "id": "snare-ghost",
    "name": "Ghost Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.15
  },
  {
    "id": "snare-brush",
    "name": "Brush Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.3
  },
  {
    "id": "snare-crackle",
    "name": "Crackle Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.2
  },
  {
    "id": "snare-reverse",
    "name": "Reverse Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.4
  },
  {
    "id": "snare-gated",
    "name": "Gated Snare",
    "collection": "Drum Machines",
    "category": "snares",
    "duration": 0.15
  },
  {
    "id": "hat-closed",
    "name": "Closed Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.05
  },
  {
    "id": "hat-open",
    "name": "Open Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.4
  },
  {
    "id": "hat-pedal",
    "name": "Pedal Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.08
  },
  {
    "id": "hat-shaker",
    "name": "Shaker Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.1
  },
  {
    "id": "hat-metallic",
    "name": "Metallic Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.12
  },
  {
    "id": "hat-bright",
    "name": "Bright Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.06
  },
  {
    "id": "hat-dark",
    "name": "Dark Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.08
  },
  {
    "id": "hat-sizzle",
    "name": "Sizzle Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.5
  },
  {
    "id": "hat-ride",
    "name": "Ride",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.8
  },
  {
    "id": "hat-crash",
    "name": "Crash",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 1.2
  },
  {
    "id": "hat-splash",
    "name": "Splash",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.6
  },
  {
    "id": "hat-china",
    "name": "China",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 1.0
  },
  {
    "id": "hat-stack",
    "name": "Stack",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.3
  },
  {
    "id": "hat-trashy",
    "name": "Trashy Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.15
  },
  {
    "id": "hat-glitch",
    "name": "Glitch Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.1
  },
  {
    "id": "hat-chopped",
    "name": "Chopped Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.03
  },
  {
    "id": "hat-pitched",
    "name": "Pitched Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.1
  },
  {
    "id": "hat-reverse",
    "name": "Reverse Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.3
  },
  {
    "id": "hat-fizz",
    "name": "Fizz Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.15
  },
  {
    "id": "hat-lofi",
    "name": "Lo-fi Hat",
    "collection": "Drum Machines",
    "category": "hihats",
    "duration": 0.08
  },
  {
    "id": "clap-house",
    "name": "House Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.3
  },
  {
    "id": "clap-tight",
    "name": "Tight Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.15
  },
  {
    "id": "clap-big",
    "name": "Big Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.5
  },
  {
    "id": "clap-layered",
    "name": "Layered Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.35
  },
  {
    "id": "clap-reverb",
    "name": "Reverb Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.8
  },
  {
    "id": "clap-snap",
    "name": "Snap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.1
  },
  {
    "id": "clap-finger",
    "name": "Finger Snap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.08
  },
  {
    "id": "clap-thick",
    "name": "Thick Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.3
  },
  {
    "id": "clap-thin",
    "name": "Thin Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.15
  },
  {
    "id": "clap-distant",
    "name": "Distant Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.6
  },
  {
    "id": "clap-double",
    "name": "Double Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.3
  },
  {
    "id": "clap-trap",
    "name": "Trap Clap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.4
  },
  {
    "id": "perc-tom-low",
    "name": "Tom Low",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.5
  },
  {
    "id": "perc-tom-mid",
    "name": "Tom Mid",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.4
  },
  {
    "id": "perc-tom-high",
    "name": "Tom High",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.35
  },
  {
    "id": "perc-floor-tom",
    "name": "Floor Tom",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.6
  },
  {
    "id": "perc-bongo-high",
    "name": "Bongo High",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.2
  },
  {
    "id": "perc-bongo-low",
    "name": "Bongo Low",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.25
  },
  {
    "id": "perc-conga-slap",
    "name": "Conga Slap",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.15
  },
  {
    "id": "perc-conga-tone",
    "name": "Conga Tone",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-cowbell",
    "name": "Cowbell",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-tambourine",
    "name": "Tambourine",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.25
  },
  {
    "id": "perc-shaker",
    "name": "Shaker",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.15
  },
  {
    "id": "perc-woodblock",
    "name": "Wood Block",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.1
  },
  {
    "id": "perc-triangle",
    "name": "Triangle",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.8
  },
  {
    "id": "perc-agogo",
    "name": "Agogo",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-guiro",
    "name": "Guiro",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.4
  },
  {
    "id": "perc-cabasa",
    "name": "Cabasa",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.12
  },
  {
    "id": "perc-timbale",
    "name": "Timbale",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.25
  },
  {
    "id": "perc-djembe",
    "name": "Djembe",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.35
  },
  {
    "id": "perc-tabla",
    "name": "Tabla",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-cajon",
    "name": "Cajon",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.4
  },
  {
    "id": "perc-claves",
    "name": "Claves",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.08
  },
  {
    "id": "perc-vibraslap",
    "name": "Vibraslap",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.6
  },
  {
    "id": "perc-maracas",
    "name": "Maracas",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.1
  },
  {
    "id": "perc-cuica",
    "name": "Cuica",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-surdo",
    "name": "Surdo",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.5
  },
  {
    "id": "perc-repinique",
    "name": "Repinique",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.2
  },
  {
    "id": "perc-whistle",
    "name": "Whistle Perc",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.3
  },
  {
    "id": "perc-block-hit",
    "name": "Block Hit",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.1
  },
  {
    "id": "perc-rim-click",
    "name": "Rim Click",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.05
  },
  {
    "id": "perc-cross-stick",
    "name": "Cross Stick",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.08
  },
  {
    "id": "bass-sub",
    "name": "Sub Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-deep",
    "name": "Deep Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-wobble",
    "name": "Wobble Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.5
  },
  {
    "id": "bass-reese",
    "name": "Reese Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.2
  },
  {
    "id": "bass-acid",
    "name": "Acid Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.5
  },
  {
    "id": "bass-pluck",
    "name": "Pluck Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.3
  },
  {
    "id": "bass-saw",
    "name": "Saw Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-square",
    "name": "Square Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-fm",
    "name": "FM Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-808",
    "name": "808 Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.5
  },
  {
    "id": "bass-rubber",
    "name": "Rubber Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.4
  },
  {
    "id": "bass-growl",
    "name": "Growl Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-neuro",
    "name": "Neuro Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-rolling",
    "name": "Rolling Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-dirty",
    "name": "Dirty Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.7
  },
  {
    "id": "bass-clean",
    "name": "Clean Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-warm",
    "name": "Warm Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-bright",
    "name": "Bright Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-moog",
    "name": "Moog Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.7
  },
  {
    "id": "bass-analog",
    "name": "Analog Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-digital",
    "name": "Digital Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.5
  },
  {
    "id": "bass-glitch",
    "name": "Glitch Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.4
  },
  {
    "id": "bass-stab",
    "name": "Stab Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.2
  },
  {
    "id": "bass-chord",
    "name": "Chord Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-octave",
    "name": "Octave Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-slide",
    "name": "Slide Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-portamento",
    "name": "Portamento Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-filtered",
    "name": "Filtered Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-distorted",
    "name": "Distorted Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-compressed",
    "name": "Compressed Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.7
  },
  {
    "id": "bass-tape",
    "name": "Tape Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-vinyl",
    "name": "Vinyl Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-lofi",
    "name": "Lo-fi Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-hifi",
    "name": "Hi-fi Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.6
  },
  {
    "id": "bass-punchy",
    "name": "Punchy Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.3
  },
  {
    "id": "bass-sustained",
    "name": "Sustained Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.5
  },
  {
    "id": "bass-short",
    "name": "Short Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.15
  },
  {
    "id": "bass-long",
    "name": "Long Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 2.0
  },
  {
    "id": "bass-detuned",
    "name": "Detuned Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-unison",
    "name": "Unison Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-stereo",
    "name": "Stereo Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-mono",
    "name": "Mono Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "bass-sidechain",
    "name": "Sidechain Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-pumping",
    "name": "Pumping Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-bounce",
    "name": "Bounce Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.5
  },
  {
    "id": "bass-funk",
    "name": "Funk Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.4
  },
  {
    "id": "bass-slap",
    "name": "Slap Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.3
  },
  {
    "id": "bass-finger",
    "name": "Finger Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.5
  },
  {
    "id": "bass-picked",
    "name": "Picked Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.4
  },
  {
    "id": "bass-fretless",
    "name": "Fretless Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "synth-saw-stab",
    "name": "Saw Stab",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "synth-super-saw",
    "name": "Super Saw",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-square-stab",
    "name": "Square Stab",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "synth-chord-stab",
    "name": "Chord Stab",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.4
  },
  {
    "id": "synth-organ-stab",
    "name": "Organ Stab",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "synth-brass-stab",
    "name": "Brass Stab",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.4
  },
  {
    "id": "synth-pluck",
    "name": "Pluck Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "synth-bell",
    "name": "Bell Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "synth-key",
    "name": "Key Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-poly",
    "name": "Poly Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-mono",
    "name": "Mono Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-arp",
    "name": "Arp Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "synth-sequence",
    "name": "Sequence Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "synth-glitch",
    "name": "Glitch Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-bitcrush",
    "name": "Bit Crush Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-noise",
    "name": "Noise Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-grain",
    "name": "Grain Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-wave",
    "name": "Wave Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-fm",
    "name": "FM Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-am",
    "name": "AM Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-ringmod",
    "name": "Ring Mod Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-sync",
    "name": "Sync Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-phase",
    "name": "Phase Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-formant",
    "name": "Formant Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-vowel",
    "name": "Vowel Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-talk",
    "name": "Talk Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-acid",
    "name": "Acid Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-chip",
    "name": "Chip Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.4
  },
  {
    "id": "synth-retro",
    "name": "Retro Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-modern",
    "name": "Modern Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-warm",
    "name": "Warm Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-cold",
    "name": "Cold Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-bright",
    "name": "Bright Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-dark",
    "name": "Dark Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-thin",
    "name": "Thin Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-thick",
    "name": "Thick Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-wide",
    "name": "Wide Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-narrow",
    "name": "Narrow Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.5
  },
  {
    "id": "synth-clean",
    "name": "Clean Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-dirty",
    "name": "Dirty Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.6
  },
  {
    "id": "synth-soft",
    "name": "Soft Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-hard",
    "name": "Hard Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.4
  },
  {
    "id": "synth-attack",
    "name": "Attack Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "synth-decay",
    "name": "Decay Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-sustained",
    "name": "Sustained Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.5
  },
  {
    "id": "synth-staccato",
    "name": "Staccato Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.15
  },
  {
    "id": "synth-legato",
    "name": "Legato Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "synth-portamento",
    "name": "Portamento Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-vibrato",
    "name": "Vibrato Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-tremolo",
    "name": "Tremolo Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "pad-warm",
    "name": "Warm Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-dark",
    "name": "Dark Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-ambient",
    "name": "Ambient Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-shimmer",
    "name": "Shimmer Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-string",
    "name": "String Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-glass",
    "name": "Glass Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-evolving",
    "name": "Evolving Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-choir",
    "name": "Choir Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-analog",
    "name": "Analog Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-digital",
    "name": "Digital Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-lofi",
    "name": "Lo-fi Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-hifi",
    "name": "Hi-fi Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-noise",
    "name": "Noise Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-grain",
    "name": "Grain Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-tape",
    "name": "Tape Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-vinyl",
    "name": "Vinyl Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-detuned",
    "name": "Detuned Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-unison",
    "name": "Unison Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-stereo",
    "name": "Stereo Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-mono",
    "name": "Mono Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-filtered",
    "name": "Filtered Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-sweep",
    "name": "Sweep Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-pulse",
    "name": "Pulse Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-breath",
    "name": "Breath Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-ocean",
    "name": "Ocean Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-wind",
    "name": "Wind Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-space",
    "name": "Space Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-dream",
    "name": "Dream Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-fog",
    "name": "Fog Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "pad-ice",
    "name": "Ice Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 3.0
  },
  {
    "id": "lead-saw",
    "name": "Saw Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-square",
    "name": "Square Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-detuned",
    "name": "Detuned Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-portamento",
    "name": "Portamento Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-acid",
    "name": "Acid Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-pluck",
    "name": "Pluck Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.3
  },
  {
    "id": "lead-whistle",
    "name": "Whistle Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-hoover",
    "name": "Hoover Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-scream",
    "name": "Scream Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-talk",
    "name": "Talk Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-vowel",
    "name": "Vowel Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-formant",
    "name": "Formant Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-sync",
    "name": "Sync Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-fm",
    "name": "FM Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-am",
    "name": "AM Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-ring",
    "name": "Ring Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-phase",
    "name": "Phase Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-filter",
    "name": "Filter Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-wah",
    "name": "Wah Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-auto",
    "name": "Auto Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-glide",
    "name": "Glide Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-bend",
    "name": "Bend Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-vibrato",
    "name": "Vibrato Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-tremolo",
    "name": "Tremolo Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-staccato",
    "name": "Staccato Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.15
  },
  {
    "id": "lead-legato",
    "name": "Legato Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 1.0
  },
  {
    "id": "lead-chip",
    "name": "Chip Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.5
  },
  {
    "id": "lead-retro",
    "name": "Retro Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-modern",
    "name": "Modern Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "lead-bright",
    "name": "Bright Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.6
  },
  {
    "id": "fx-riser-up",
    "name": "Riser Up",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-riser-down",
    "name": "Riser Down",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-sweep-up",
    "name": "Sweep Up",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-sweep-down",
    "name": "Sweep Down",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-impact",
    "name": "Impact",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.8
  },
  {
    "id": "fx-white-noise",
    "name": "White Noise",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-vinyl-crackle",
    "name": "Vinyl Crackle",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-laser",
    "name": "Laser",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.3
  },
  {
    "id": "fx-zap",
    "name": "Zap",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.15
  },
  {
    "id": "fx-siren",
    "name": "Siren",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-alarm",
    "name": "Alarm",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-explosion",
    "name": "Explosion",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-thunder",
    "name": "Thunder",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-rain",
    "name": "Rain",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-wind-fx",
    "name": "Wind",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-ocean-waves",
    "name": "Ocean Waves",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-birds",
    "name": "Birds",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-crickets",
    "name": "Crickets",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-static",
    "name": "Static",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-glitch",
    "name": "Glitch FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-stutter",
    "name": "Stutter FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-tape-stop",
    "name": "Tape Stop",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-vinyl-scratch",
    "name": "Vinyl Scratch",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.3
  },
  {
    "id": "fx-whoosh-up",
    "name": "Whoosh Up",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-whoosh-down",
    "name": "Whoosh Down",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-reverse-cymbal",
    "name": "Reverse Cymbal",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-reverse-clap",
    "name": "Reverse Clap",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-sub-drop",
    "name": "Sub Drop",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-tension-rise",
    "name": "Tension Rise",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-release",
    "name": "Release FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.8
  },
  {
    "id": "fx-sparkle",
    "name": "Sparkle",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-shimmer",
    "name": "Shimmer FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-dark-ambience",
    "name": "Dark Ambience",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-light-ambience",
    "name": "Light Ambience",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "fx-scifi",
    "name": "Sci-fi FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-retro",
    "name": "Retro FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-digital",
    "name": "Digital FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "fx-analog",
    "name": "Analog FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.8
  },
  {
    "id": "fx-phone-ring",
    "name": "Phone Ring",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-heartbeat",
    "name": "Heartbeat",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "guitar-clean-strum-major",
    "name": "Clean Strum Major",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-clean-strum-minor",
    "name": "Clean Strum Minor",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-clean-strum-7th",
    "name": "Clean Strum 7th",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-acoustic-strum",
    "name": "Acoustic Strum",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-power-chord",
    "name": "Power Chord",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-palm-mute",
    "name": "Palm Mute",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.3
  },
  {
    "id": "guitar-single-clean",
    "name": "Single Note Clean",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-single-drive",
    "name": "Single Note Drive",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-overdrive-riff",
    "name": "Overdrive Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-distorted-riff",
    "name": "Distorted Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-blues-riff",
    "name": "Blues Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.2
  },
  {
    "id": "guitar-rock-riff",
    "name": "Rock Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-funk-riff",
    "name": "Funk Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-pop-riff",
    "name": "Pop Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-indie-riff",
    "name": "Indie Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-metal-riff",
    "name": "Metal Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-clean-arpeggio",
    "name": "Clean Arpeggio",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-acoustic-arpeggio",
    "name": "Acoustic Arpeggio",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-nylon-pick",
    "name": "Nylon Pick",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-steel-pick",
    "name": "Steel Pick",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.6
  },
  {
    "id": "guitar-slide",
    "name": "Slide Guitar",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-bend-note",
    "name": "Bend Note",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-hammer-on",
    "name": "Hammer On",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.5
  },
  {
    "id": "guitar-pull-off",
    "name": "Pull Off",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.5
  },
  {
    "id": "guitar-harmonic",
    "name": "Harmonic",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.2
  },
  {
    "id": "guitar-pinch-harmonic",
    "name": "Pinch Harmonic",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-wah",
    "name": "Wah Guitar",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "guitar-tremolo-pick",
    "name": "Tremolo Pick",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-fingerpick",
    "name": "Fingerpick Pattern",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-chord-am",
    "name": "Chord Progression Am",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "guitar-chord-c",
    "name": "Chord Progression C",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "guitar-chord-em",
    "name": "Chord Progression Em",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "guitar-chord-g",
    "name": "Chord Progression G",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "guitar-stab",
    "name": "Guitar Stab",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.2
  },
  {
    "id": "guitar-chop",
    "name": "Guitar Chop",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.15
  },
  {
    "id": "guitar-muted-strum",
    "name": "Muted Strum",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.15
  },
  {
    "id": "guitar-scratch",
    "name": "Guitar Scratch",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.1
  },
  {
    "id": "guitar-clean-lead",
    "name": "Clean Lead Lick",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-distorted-lead",
    "name": "Distorted Lead Lick",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 0.8
  },
  {
    "id": "guitar-acoustic-melody",
    "name": "Acoustic Melody",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.2
  },
  {
    "id": "piano-grand-c",
    "name": "Grand Piano C",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-grand-chord",
    "name": "Grand Piano Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.0
  },
  {
    "id": "piano-upright-note",
    "name": "Upright Piano Note",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-upright-chord",
    "name": "Upright Piano Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-electric",
    "name": "Electric Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-rhodes-clean",
    "name": "Rhodes Clean",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-rhodes-tremolo",
    "name": "Rhodes Tremolo",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-wurlitzer",
    "name": "Wurlitzer",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-clavinet",
    "name": "Clavinet",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 0.6
  },
  {
    "id": "piano-honky-tonk",
    "name": "Honky Tonk",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-bright",
    "name": "Bright Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-dark",
    "name": "Dark Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-soft",
    "name": "Soft Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-hard",
    "name": "Hard Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-staccato",
    "name": "Staccato Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 0.3
  },
  {
    "id": "piano-sustained",
    "name": "Sustained Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.5
  },
  {
    "id": "piano-arpeggio-up",
    "name": "Piano Arpeggio Up",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-arpeggio-down",
    "name": "Piano Arpeggio Down",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-trill",
    "name": "Piano Trill",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-glissando-up",
    "name": "Piano Glissando Up",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-glissando-down",
    "name": "Piano Glissando Down",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-octave",
    "name": "Piano Octave",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-fifth",
    "name": "Piano Fifth",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-minor-chord",
    "name": "Piano Minor Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-major-chord",
    "name": "Piano Major Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-7th-chord",
    "name": "Piano 7th Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-diminished",
    "name": "Piano Diminished",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-augmented",
    "name": "Piano Augmented",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-sus4",
    "name": "Piano Sus4",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-cluster",
    "name": "Piano Cluster",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-broken-slow",
    "name": "Broken Chord Slow",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.0
  },
  {
    "id": "piano-broken-fast",
    "name": "Broken Chord Fast",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-riff-pop",
    "name": "Piano Riff Pop",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-riff-classical",
    "name": "Piano Riff Classical",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-melody-simple",
    "name": "Piano Melody Simple",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.0
  },
  {
    "id": "piano-melody-complex",
    "name": "Piano Melody Complex",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.0
  },
  {
    "id": "piano-bass-note",
    "name": "Piano Bass Note",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-high-note",
    "name": "Piano High Note",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.0
  },
  {
    "id": "piano-mid-range",
    "name": "Piano Mid Range",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.2
  },
  {
    "id": "piano-toy",
    "name": "Toy Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 0.8
  },
  {
    "id": "str-violin-sustained",
    "name": "Violin Sustained",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-violin-staccato",
    "name": "Violin Staccato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.2
  },
  {
    "id": "str-violin-pizzicato",
    "name": "Violin Pizzicato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.4
  },
  {
    "id": "str-violin-tremolo",
    "name": "Violin Tremolo",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.5
  },
  {
    "id": "str-violin-trill",
    "name": "Violin Trill",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.0
  },
  {
    "id": "str-violin-glissando",
    "name": "Violin Glissando",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.0
  },
  {
    "id": "str-violin-vibrato",
    "name": "Violin Vibrato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-violin-spiccato",
    "name": "Violin Spiccato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.15
  },
  {
    "id": "str-violin-col-legno",
    "name": "Violin Col Legno",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.2
  },
  {
    "id": "str-violin-harmonics",
    "name": "Violin Harmonics",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.5
  },
  {
    "id": "str-viola-sustained",
    "name": "Viola Sustained",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-viola-pizzicato",
    "name": "Viola Pizzicato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.4
  },
  {
    "id": "str-cello-sustained",
    "name": "Cello Sustained",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-cello-pizzicato",
    "name": "Cello Pizzicato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.5
  },
  {
    "id": "str-cello-staccato",
    "name": "Cello Staccato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.2
  },
  {
    "id": "str-dbass-sustained",
    "name": "Double Bass Sustained",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-dbass-pizzicato",
    "name": "Double Bass Pizzicato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.6
  },
  {
    "id": "str-ensemble-sustained",
    "name": "String Ensemble Sustained",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-ensemble-staccato",
    "name": "String Ensemble Staccato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.25
  },
  {
    "id": "str-ensemble-tremolo",
    "name": "String Ensemble Tremolo",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-ensemble-pizzicato",
    "name": "String Ensemble Pizzicato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.4
  },
  {
    "id": "str-swell",
    "name": "String Swell",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-fade",
    "name": "String Fade",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-dramatic",
    "name": "Dramatic Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-gentle",
    "name": "Gentle Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-tense",
    "name": "Tense Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-romantic",
    "name": "Romantic Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-action",
    "name": "Action Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.5
  },
  {
    "id": "str-horror",
    "name": "Horror Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-run-up",
    "name": "String Run Up",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.5
  },
  {
    "id": "str-run-down",
    "name": "String Run Down",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.5
  },
  {
    "id": "str-chord-major",
    "name": "String Chord Major",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-chord-minor",
    "name": "String Chord Minor",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-melody-simple",
    "name": "String Melody Simple",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-ostinato",
    "name": "String Ostinato",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-solo-violin",
    "name": "Solo Violin Melody",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "str-solo-cello",
    "name": "Solo Cello Melody",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.5
  },
  {
    "id": "str-chamber",
    "name": "Chamber Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "str-orchestral-hit",
    "name": "Orchestral Hit",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 0.8
  },
  {
    "id": "str-riser",
    "name": "String Riser",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 3.0
  },
  {
    "id": "vox-chop",
    "name": "Vocal Chop",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.3
  },
  {
    "id": "vox-formant-ah",
    "name": "Formant Ah",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-formant-oh",
    "name": "Formant Oh",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-formant-ee",
    "name": "Formant Ee",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-formant-oo",
    "name": "Formant Oo",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-formant-aa",
    "name": "Formant Aa",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-stab",
    "name": "Vocal Stab",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.2
  },
  {
    "id": "vox-rise",
    "name": "Vocal Rise",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "vox-fall",
    "name": "Vocal Fall",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "vox-yeah",
    "name": "Vocal Yeah",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.5
  },
  {
    "id": "vox-hey",
    "name": "Vocal Hey",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.4
  },
  {
    "id": "vox-oh",
    "name": "Vocal Oh",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.6
  },
  {
    "id": "vox-uh",
    "name": "Vocal Uh",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.4
  },
  {
    "id": "vox-whoah",
    "name": "Vocal Whoah",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-breath",
    "name": "Vocal Breath",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.5
  },
  {
    "id": "vox-whisper",
    "name": "Vocal Whisper",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.6
  },
  {
    "id": "vox-shout",
    "name": "Vocal Shout",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.4
  },
  {
    "id": "vox-male-chop",
    "name": "Male Vocal Chop",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.3
  },
  {
    "id": "vox-female-chop",
    "name": "Female Vocal Chop",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.3
  },
  {
    "id": "vox-choir-ah",
    "name": "Choir Ah",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 2.0
  },
  {
    "id": "vox-choir-oh",
    "name": "Choir Oh",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 2.0
  },
  {
    "id": "vox-choir-mm",
    "name": "Choir Mm",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 2.0
  },
  {
    "id": "vox-pad",
    "name": "Vocal Pad",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 3.0
  },
  {
    "id": "vox-talkbox",
    "name": "Talk Box",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-glitch",
    "name": "Vocal Glitch",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.5
  },
  {
    "id": "vox-stutter",
    "name": "Vocal Stutter",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.5
  },
  {
    "id": "vox-reverse",
    "name": "Vocal Reverse",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-processed",
    "name": "Vocal Processed",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-filtered",
    "name": "Vocal Filtered",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-pitched-up",
    "name": "Vocal Pitched Up",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.6
  },
  {
    "id": "vox-pitched-down",
    "name": "Vocal Pitched Down",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.6
  },
  {
    "id": "vox-harmony",
    "name": "Vocal Harmony",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "vox-unison",
    "name": "Vocal Unison",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "vox-echo",
    "name": "Vocal Echo",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.5
  },
  {
    "id": "vox-robot",
    "name": "Robot Voice",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-vocoder",
    "name": "Vocoder Style",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-whistle",
    "name": "Whistle Vocal",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-hum",
    "name": "Hum",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.5
  },
  {
    "id": "vox-scat",
    "name": "Vocal Scat",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "vox-beatbox",
    "name": "Vocal Beatbox",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 1.0
  },
  {
    "id": "perc-caxixi",
    "name": "Caxixi",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.12
  },
  {
    "id": "perc-finger-cymbal",
    "name": "Finger Cymbal",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 0.8
  },
  {
    "id": "perc-bell-tree",
    "name": "Bell Tree",
    "collection": "World Percussion",
    "category": "percussion",
    "duration": 1.5
  },
  {
    "id": "bass-talking",
    "name": "Talking Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 0.8
  },
  {
    "id": "synth-hoover",
    "name": "Hoover Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.8
  },
  {
    "id": "synth-laser",
    "name": "Laser Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 0.3
  },
  {
    "id": "pad-celestial",
    "name": "Celestial Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "pad-aurora",
    "name": "Aurora Pad",
    "collection": "Atmosphere",
    "category": "pads",
    "duration": 4.0
  },
  {
    "id": "lead-distorted",
    "name": "Distorted Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 0.8
  },
  {
    "id": "lead-trance",
    "name": "Trance Lead",
    "collection": "Lead Synths",
    "category": "leads",
    "duration": 1.0
  },
  {
    "id": "fx-cinematic-boom",
    "name": "Cinematic Boom",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 2.0
  },
  {
    "id": "fx-wobble",
    "name": "Wobble FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-pitch-drop",
    "name": "Pitch Drop",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "guitar-12string",
    "name": "12 String Guitar",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "guitar-feedback",
    "name": "Guitar Feedback",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 2.0
  },
  {
    "id": "piano-jazz-chord",
    "name": "Jazz Piano Chord",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 1.5
  },
  {
    "id": "piano-ballad",
    "name": "Ballad Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 2.0
  },
  {
    "id": "str-epic-hit",
    "name": "Epic String Hit",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 1.0
  },
  {
    "id": "str-tremolo-low",
    "name": "Low Tremolo Strings",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 2.0
  },
  {
    "id": "vox-formant-ey",
    "name": "Formant Ey",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 0.8
  },
  {
    "id": "vox-deep-choir",
    "name": "Deep Choir",
    "collection": "Vocal",
    "category": "vocals",
    "duration": 2.5
  },
  {
    "id": "synth-detuned-chord",
    "name": "Detuned Chord",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "synth-wobble",
    "name": "Wobble Synth",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.0
  },
  {
    "id": "bass-dubstep",
    "name": "Dubstep Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.0
  },
  {
    "id": "bass-808-long",
    "name": "808 Bass Long",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 2.0
  },
  {
    "id": "fx-warble",
    "name": "Warble FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.0
  },
  {
    "id": "fx-crunch",
    "name": "Crunch FX",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.3
  },
  {
    "id": "fx-power-down",
    "name": "Power Down",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-power-up",
    "name": "Power Up",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 1.5
  },
  {
    "id": "fx-metal-hit",
    "name": "Metal Hit",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 0.5
  },
  {
    "id": "guitar-harmonics-natural",
    "name": "Natural Harmonics",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.5
  },
  {
    "id": "guitar-octave-riff",
    "name": "Octave Riff",
    "collection": "Guitar",
    "category": "guitar",
    "duration": 1.0
  },
  {
    "id": "piano-ambient",
    "name": "Ambient Piano",
    "collection": "Piano & Keys",
    "category": "piano",
    "duration": 3.0
  },
  {
    "id": "str-cinematic-swell",
    "name": "Cinematic Swell",
    "collection": "Strings & Orchestra",
    "category": "strings",
    "duration": 4.0
  },
  {
    "id": "perc-808-tom",
    "name": "808 Tom",
    "collection": "Drum Machines",
    "category": "percussion",
    "duration": 0.4
  },
  {
    "id": "perc-electronic-tom",
    "name": "Electronic Tom",
    "collection": "Drum Machines",
    "category": "percussion",
    "duration": 0.35
  },
  {
    "id": "perc-snap-808",
    "name": "808 Snap",
    "collection": "Drum Machines",
    "category": "claps",
    "duration": 0.1
  },
  {
    "id": "bass-sine-sub",
    "name": "Sine Sub Bass",
    "collection": "Bass Collection",
    "category": "bass",
    "duration": 1.5
  },
  {
    "id": "fx-riseset",
    "name": "Rise and Set",
    "collection": "FX & Atmosphere",
    "category": "fx",
    "duration": 3.0
  },
  {
    "id": "synth-reso-sweep",
    "name": "Resonant Sweep",
    "collection": "Synthesizers",
    "category": "synths",
    "duration": 1.5
  }
];

// ============ SYNTHESIS RECIPES ============
const RECIPES = {
  'kick-808': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.8);
},
  'kick-house': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.4);
},
  'kick-dnb': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.3);
},
  'kick-dubstep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, 0);
    osc.frequency.exponentialRampToValueAtTime(40, 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.6);
},
  'kick-deep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, 0);
    osc.frequency.exponentialRampToValueAtTime(35, 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.7);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.7);
},
  'kick-punchy': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.25);
    osc.connect(g);
    g.connect(ctx.destination);

    const ns = createNoise(ctx, 0.02, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type='highpass';nf.frequency.value=3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.02);
    ns.connect(nf);nf.connect(ng);ng.connect(ctx.destination);
    ns.start(0);ns.stop(0.02);
    osc.start(0);
    osc.stop(0.25);
},
  'kick-sub': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(30, 0.1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.9);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.9);
},
  'kick-techno': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, 0);
    osc.frequency.exponentialRampToValueAtTime(48, 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.35);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.35);
},
  'kick-distorted': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g);

    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    g.connect(ws);ws.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.3);
},
  'kick-click': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.01);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(g);
    g.connect(ctx.destination);

    const ns = createNoise(ctx, 0.01, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type='highpass';nf.frequency.value=3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.01);
    ns.connect(nf);nf.connect(ng);ng.connect(ctx.destination);
    ns.start(0);ns.stop(0.01);
    osc.start(0);
    osc.stop(0.15);
},
  'kick-layered': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, 0);
    osc.frequency.exponentialRampToValueAtTime(45, 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g);
    g.connect(ctx.destination);

    const ns = createNoise(ctx, 0.04, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type='highpass';nf.frequency.value=3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.04);
    ns.connect(nf);nf.connect(ng);ng.connect(ctx.destination);
    ns.start(0);ns.stop(0.04);
    osc.start(0);
    osc.stop(0.4);
},
  'kick-boom': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, 0);
    osc.frequency.exponentialRampToValueAtTime(32, 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.0);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(1.0);
},
  'kick-trap': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(38, 0.07);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.6);
},
  'kick-garage': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, 0);
    osc.frequency.exponentialRampToValueAtTime(52, 0.035);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.35);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.35);
},
  'kick-minimal': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.025);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.2);
},
  'kick-hard': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.015);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g);
    g.connect(ctx.destination);

    const ns = createNoise(ctx, 0.015, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type='highpass';nf.frequency.value=3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.015);
    ns.connect(nf);nf.connect(ng);ng.connect(ctx.destination);
    ns.start(0);ns.stop(0.015);
    osc.start(0);
    osc.stop(0.3);
},
  'kick-soft': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(45, 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.5);
},
  'kick-vinyl': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(48, 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.4);
},
  'kick-compressed': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(52, 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.3);
},
  'kick-tight': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, 0);
    osc.frequency.exponentialRampToValueAtTime(58, 0.015);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(0);
    osc.stop(0.2);
},
  'snare-tight': async function(ctx) {
    const ns = createNoise(ctx, 0.2, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.2);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(200, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.12);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'snare-fat': async function(ctx) {
    const ns = createNoise(ctx, 0.35, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.35);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, 0);
    osc.frequency.exponentialRampToValueAtTime(180, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.21);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.35);
},
  'snare-dnb': async function(ctx) {
    const ns = createNoise(ctx, 0.25, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 6000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.2);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.25);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, 0);
    osc.frequency.exponentialRampToValueAtTime(220, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.25);
},
  'snare-clap': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 3500;
    nf.Q.value = 38.888888888888886;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, 0);
    osc.frequency.exponentialRampToValueAtTime(160, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.18);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'snare-rimshot': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 7000;
    nf.Q.value = 46.666666666666664;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, 0);
    osc.frequency.exponentialRampToValueAtTime(300, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.09);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'snare-lofi': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 3000;
    nf.Q.value = 42.857142857142854;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, 0);
    osc.frequency.exponentialRampToValueAtTime(170, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.18);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'snare-noise': async function(ctx) {
    const ns = createNoise(ctx, 0.25, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5500;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.2);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.25);
},
  'snare-layered': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4500;
    nf.Q.value = 45.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(270, 0);
    osc.frequency.exponentialRampToValueAtTime(190, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.18);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'snare-breakbeat': async function(ctx) {
    const ns = createNoise(ctx, 0.2, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5000;
    nf.Q.value = 47.61904761904762;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.2);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(290, 0);
    osc.frequency.exponentialRampToValueAtTime(210, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.12);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'snare-electronic': async function(ctx) {
    const ns = createNoise(ctx, 0.25, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 6500;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.2);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.25);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(310, 0);
    osc.frequency.exponentialRampToValueAtTime(230, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.25);
},
  'snare-trap': async function(ctx) {
    const ns = createNoise(ctx, 0.35, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4200;
    nf.Q.value = 49.411764705882355;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.35);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(255, 0);
    osc.frequency.exponentialRampToValueAtTime(175, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.21);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.35);
},
  'snare-garage': async function(ctx) {
    const ns = createNoise(ctx, 0.22, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4800;
    nf.Q.value = 50.526315789473685;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.18);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.22);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(275, 0);
    osc.frequency.exponentialRampToValueAtTime(195, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.132);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.22);
},
  'snare-pitched': async function(ctx) {
    const ns = createNoise(ctx, 0.2, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5200;
    nf.Q.value = 45.21739130434783;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.2);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, 0);
    osc.frequency.exponentialRampToValueAtTime(250, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.12);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'snare-compressed': async function(ctx) {
    const ns = createNoise(ctx, 0.18, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5000;
    nf.Q.value = 47.61904761904762;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.14);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.18);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(285, 0);
    osc.frequency.exponentialRampToValueAtTime(205, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.108);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.18);
},
  'snare-ring': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4000;
    nf.Q.value = 44.44444444444444;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, 0);
    osc.frequency.exponentialRampToValueAtTime(280, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.18);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'snare-ghost': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 4500;
    nf.Q.value = 45.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(270, 0);
    osc.frequency.exponentialRampToValueAtTime(190, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.09);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'snare-brush': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 3000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
},
  'snare-crackle': async function(ctx) {
    const ns = createNoise(ctx, 0.2, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 8000;
    nf.Q.value = 57.142857142857146;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.2);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, 0);
    osc.frequency.exponentialRampToValueAtTime(180, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.12);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'snare-reverse': async function(ctx) {
    const ns = createNoise(ctx, 0.4, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(0.001, 0);
    ng.gain.linearRampToValueAtTime(1, 0.32000000000000006);
    ng.gain.linearRampToValueAtTime(0, 0.4);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.4);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(200, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.24);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'snare-gated': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 5000;
    nf.Q.value = 50.0;
    const ng = ctx.createGain();
    
    ng.gain.setValueAtTime(1, 0);
    ng.gain.setValueAtTime(1, 0.075);
    ng.gain.setValueAtTime(0, 0.0765);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(200, 0.03);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.7, 0);
    tg.gain.exponentialRampToValueAtTime(0.001, 0.09);
    osc.connect(tg); tg.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'hat-closed': async function(ctx) {
    const ns = createNoise(ctx, 0.05, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8000; bp.Q.value = 40.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.05);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.05);
},
  'hat-open': async function(ctx) {
    const ns = createNoise(ctx, 0.4, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7000; bp.Q.value = 46.666666666666664;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.4);
},
  'hat-pedal': async function(ctx) {
    const ns = createNoise(ctx, 0.08, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7500; bp.Q.value = 41.666666666666664;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3750.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.08);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.08);
},
  'hat-shaker': async function(ctx) {
    const ns = createNoise(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 9000; bp.Q.value = 90.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.1);
},
  'hat-metallic': async function(ctx) {
    const ns = createNoise(ctx, 0.12, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6000; bp.Q.value = 20.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.9, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.12);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.12);

    const sq1 = ctx.createOscillator(); sq1.type='square'; sq1.frequency.value=587.3;
    const sq2 = ctx.createOscillator(); sq2.type='square'; sq2.frequency.value=845.1;
    const mg = ctx.createGain(); mg.gain.setValueAtTime(0.15, 0);
    mg.gain.exponentialRampToValueAtTime(0.001, 0.12);
    sq1.connect(mg); sq2.connect(mg); mg.connect(ctx.destination);
    sq1.start(0); sq2.start(0); sq1.stop(0.12); sq2.stop(0.12);
},
  'hat-bright': async function(ctx) {
    const ns = createNoise(ctx, 0.06, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 10000; bp.Q.value = 40.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.06);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.06);
},
  'hat-dark': async function(ctx) {
    const ns = createNoise(ctx, 0.08, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5000; bp.Q.value = 41.666666666666664;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.08);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.08);
},
  'hat-sizzle': async function(ctx) {
    const ns = createNoise(ctx, 0.5, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7000; bp.Q.value = 87.5;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.5);
},
  'hat-ride': async function(ctx) {
    const ns = createNoise(ctx, 0.8, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6500; bp.Q.value = 108.33333333333333;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3250.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.8);
},
  'hat-crash': async function(ctx) {
    const ns = createNoise(ctx, 1.2, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5500; bp.Q.value = 110.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2750.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.9, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.2);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.2);
},
  'hat-splash': async function(ctx) {
    const ns = createNoise(ctx, 0.6, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8000; bp.Q.value = 114.28571428571429;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.6);
},
  'hat-china': async function(ctx) {
    const ns = createNoise(ctx, 1.0, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4500; bp.Q.value = 112.5;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2250.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.0);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.0);

    const sq1 = ctx.createOscillator(); sq1.type='square'; sq1.frequency.value=587.3;
    const sq2 = ctx.createOscillator(); sq2.type='square'; sq2.frequency.value=845.1;
    const mg = ctx.createGain(); mg.gain.setValueAtTime(0.15, 0);
    mg.gain.exponentialRampToValueAtTime(0.001, 1.0);
    sq1.connect(mg); sq2.connect(mg); mg.connect(ctx.destination);
    sq1.start(0); sq2.start(0); sq1.stop(1.0); sq2.stop(1.0);
},
  'hat-stack': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7500; bp.Q.value = 83.33333333333333;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3750.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
},
  'hat-trashy': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = 133.33333333333334;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);

    const sq1 = ctx.createOscillator(); sq1.type='square'; sq1.frequency.value=587.3;
    const sq2 = ctx.createOscillator(); sq2.type='square'; sq2.frequency.value=845.1;
    const mg = ctx.createGain(); mg.gain.setValueAtTime(0.15, 0);
    mg.gain.exponentialRampToValueAtTime(0.001, 0.15);
    sq1.connect(mg); sq2.connect(mg); mg.connect(ctx.destination);
    sq1.start(0); sq2.start(0); sq1.stop(0.15); sq2.stop(0.15);
},
  'hat-glitch': async function(ctx) {
    const ns = createNoise(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 9000; bp.Q.value = 30.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.6, 0);
    for(let t=0;t<0.1;t+=0.015){g.gain.setValueAtTime(Math.random()>0.5?0.6:0,t);}
    g.gain.setValueAtTime(0, 0.1);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.1);
},
  'hat-chopped': async function(ctx) {
    const ns = createNoise(ctx, 0.03, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8000; bp.Q.value = 32.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 4000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.03);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.03);
},
  'hat-pitched': async function(ctx) {
    const ns = createNoise(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6000; bp.Q.value = 30.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.1);
},
  'hat-reverse': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7000; bp.Q.value = 46.666666666666664;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 3500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.001, 0);
    g.gain.linearRampToValueAtTime(0.8, 0.255);
    g.gain.linearRampToValueAtTime(0, 0.3);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
},
  'hat-fizz': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 10000; bp.Q.value = 100.0;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);
},
  'hat-lofi': async function(ctx) {
    const ns = createNoise(ctx, 0.08, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5000; bp.Q.value = 62.5;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2500.0;
    const g = ctx.createGain();
    
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.08);
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.08);
},
  'clap-house': async function(ctx) {
    for (let l = 0; l < 3; l++) {
      const ns = createNoise(ctx, 0.3, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.02;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.21);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.3);
    }
},
  'clap-tight': async function(ctx) {
    for (let l = 0; l < 2; l++) {
      const ns = createNoise(ctx, 0.15, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.01;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.105);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.15);
    }
},
  'clap-big': async function(ctx) {
    for (let l = 0; l < 5; l++) {
      const ns = createNoise(ctx, 0.5, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.025;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.35);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.5);
    }
},
  'clap-layered': async function(ctx) {
    for (let l = 0; l < 4; l++) {
      const ns = createNoise(ctx, 0.35, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.02;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.24499999999999997);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.35);
    }
},
  'clap-reverb': async function(ctx) {
    for (let l = 0; l < 3; l++) {
      const ns = createNoise(ctx, 0.8, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.02;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.5599999999999999);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.8);
    }
},
  'clap-snap': async function(ctx) {
    for (let l = 0; l < 1; l++) {
      const ns = createNoise(ctx, 0.1, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.005;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.06999999999999999);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.1);
    }
},
  'clap-finger': async function(ctx) {
    for (let l = 0; l < 1; l++) {
      const ns = createNoise(ctx, 0.08, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.003;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.055999999999999994);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.08);
    }
},
  'clap-thick': async function(ctx) {
    for (let l = 0; l < 4; l++) {
      const ns = createNoise(ctx, 0.3, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.025;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.21);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.3);
    }
},
  'clap-thin': async function(ctx) {
    for (let l = 0; l < 2; l++) {
      const ns = createNoise(ctx, 0.15, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.01;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.105);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.15);
    }
},
  'clap-distant': async function(ctx) {
    for (let l = 0; l < 3; l++) {
      const ns = createNoise(ctx, 0.6, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.42);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.6);
    }
},
  'clap-double': async function(ctx) {
    for (let l = 0; l < 2; l++) {
      const ns = createNoise(ctx, 0.3, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.02;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.21);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.3);
    }
},
  'clap-trap': async function(ctx) {
    for (let l = 0; l < 3; l++) {
      const ns = createNoise(ctx, 0.4, 'white');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
      const g = ctx.createGain();
      const offset = l * 0.02;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.8, offset + 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, offset + 0.27999999999999997);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
      ns.start(0); ns.stop(0.4);
    }
},
  'perc-tom-low': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, 0);
    osc.frequency.exponentialRampToValueAtTime(80, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'perc-tom-mid': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(120, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'perc-tom-high': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, 0);
    osc.frequency.exponentialRampToValueAtTime(180, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.35);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.35);
},
  'perc-floor-tom': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'perc-bongo-high': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(300, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'perc-bongo-low': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, 0);
    osc.frequency.exponentialRampToValueAtTime(200, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.25);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.25);
},
  'perc-conga-slap': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, 0);
    osc.frequency.exponentialRampToValueAtTime(350, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'perc-conga-tone': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(250, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-cowbell': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(700, 0);
    osc.frequency.exponentialRampToValueAtTime(560, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-tambourine': async function(ctx) {
    const ns = createNoise(ctx, 0.25, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8000; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.25);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.25);
},
  'perc-shaker': async function(ctx) {
    const ns = createNoise(ctx, 0.15, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 9000; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);
},
  'perc-woodblock': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, 0);
    osc.frequency.exponentialRampToValueAtTime(800, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.1);
},
  'perc-triangle': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(4000, 0);
    osc.frequency.exponentialRampToValueAtTime(4000, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'perc-agogo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(900, 0);
    osc.frequency.exponentialRampToValueAtTime(700, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-guiro': async function(ctx) {
    const ns = createNoise(ctx, 0.4, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.4);
},
  'perc-cabasa': async function(ctx) {
    const ns = createNoise(ctx, 0.12, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7000; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.12);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.12);
},
  'perc-timbale': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, 0);
    osc.frequency.exponentialRampToValueAtTime(350, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.25);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.25);
},
  'perc-djembe': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, 0);
    osc.frequency.exponentialRampToValueAtTime(100, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.35);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.35);
},
  'perc-tabla': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(150, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-cajon': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(90, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'perc-claves': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2800, 0);
    osc.frequency.exponentialRampToValueAtTime(2500, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.08);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.08);
},
  'perc-vibraslap': async function(ctx) {
    const ns = createNoise(ctx, 0.6, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.6);
},
  'perc-maracas': async function(ctx) {
    const ns = createNoise(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 8500; bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.1);
},
  'perc-cuica': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, 0);
    osc.frequency.exponentialRampToValueAtTime(400, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-surdo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'perc-repinique': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, 0);
    osc.frequency.exponentialRampToValueAtTime(300, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'perc-whistle': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, 0);
    osc.frequency.exponentialRampToValueAtTime(2800, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'perc-block-hit': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1300, 0);
    osc.frequency.exponentialRampToValueAtTime(1000, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.1);
},
  'perc-rim-click': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2500, 0);
    osc.frequency.exponentialRampToValueAtTime(1800, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.05);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.05);
},
  'perc-cross-stick': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, 0);
    osc.frequency.exponentialRampToValueAtTime(1500, 0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.08);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.08);
},
  'bass-sub': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 40;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.0, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'bass-deep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 35;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-wobble': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 4;
    const lfoG = ctx.createGain(); lfoG.gain.value = 800;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 600; filt.Q.value = 8;
    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.5, 0.8);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.5); lfo.stop(1.5);
},
  'bass-reese': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 45;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 45 * 1.005;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.8, 0.3, 1.2, 0.6);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    osc1.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(1.2); osc2.stop(1.2);
},
  'bass-acid': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 15;
    filt.frequency.setValueAtTime(3000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.25);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.1, 0.5, 0.8);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'bass-pluck': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(4000, 0);
    filt.frequency.exponentialRampToValueAtTime(100, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'bass-saw': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-square': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-fm': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 48 * 2;
    const modG = ctx.createGain(); modG.gain.value = 48 * 3;
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 48;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.1, 0.6, 0.7);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(0.6); car.stop(0.6);
},
  'bass-808': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(152, 0);
    osc.frequency.exponentialRampToValueAtTime(38, 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.5);
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*1.5);}
    ws.curve = curve;
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'bass-rubber': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.08);
    osc.frequency.exponentialRampToValueAtTime(90.0, 0.15);
    osc.frequency.exponentialRampToValueAtTime(60, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'bass-growl': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 45;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 8;
    const lfG = ctx.createGain(); lfG.gain.value = 400;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 500; filt.Q.value = 10;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*3);}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(filt); filt.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'bass-neuro': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const mod = ctx.createOscillator();
    mod.type = 'square'; mod.frequency.value = 50 * 1.5;
    const modG = ctx.createGain(); modG.gain.value = 50;
    mod.connect(modG); modG.connect(osc.frequency);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 1200; filt.Q.value = 5;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); mod.start(0); osc.stop(0.6); mod.stop(0.6);
},
  'bass-rolling': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    const g = ctx.createGain();
    for(let t = 0; t < 1.0; t += 0.25) {
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.2);
    }
    g.gain.setValueAtTime(0, 1.0);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'bass-dirty': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 52;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*5);}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.7, 0.7);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.7);
},
  'bass-clean': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-warm': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle'; osc.frequency.value = 48;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-bright': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.6, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'bass-moog': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 50;
    const osc2 = ctx.createOscillator();
    osc2.type = 'square'; osc2.frequency.value = 50 * 0.998;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 12;
    filt.frequency.setValueAtTime(2000, 0);
    filt.frequency.exponentialRampToValueAtTime(300, 0.27999999999999997);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.7, 0.2, 0.7, 0.7);
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.7); osc2.stop(0.7);
},
  'bass-analog': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-digital': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 52;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.5, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'bass-glitch': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 55;
    for(let t=0;t<0.4;t+=0.05)osc.frequency.setValueAtTime(55*(1+Math.random()),t);
    const g = ctx.createGain();
    for(let t=0;t<0.4;t+=0.03){g.gain.setValueAtTime(Math.random()>0.3?0.7:0,t);}
    g.gain.setValueAtTime(0, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'bass-stab': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'bass-chord': async function(ctx) {
    [48, 48*1.26, 48*1.5].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.2, 0.8, 0.4);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600;
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'bass-octave': async function(ctx) {
    [50, 50*2].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.6, 0.5);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 800;
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.6);
    });
},
  'bass-slide': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, 0);
    osc.frequency.linearRampToValueAtTime(50*1.5, 0.24);
    osc.frequency.linearRampToValueAtTime(50, 0.48);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-portamento': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(48*0.5, 0);
    osc.frequency.exponentialRampToValueAtTime(48, 0.2);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.3, 1.0, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'bass-filtered': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 8;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.5;
    const lfoG = ctx.createGain(); lfoG.gain.value = 400;
    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    filt.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'bass-distorted': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 52;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=(3+10)*x*20*(Math.PI/180)/(Math.PI+10*Math.abs(x));}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.6);
    osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'bass-compressed': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.7, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.7);
},
  'bass-tape': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.3;
    const lfG = ctx.createGain(); lfG.gain.value = 1;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.7, 0.3, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'bass-vinyl': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 45;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 400;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 40;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.3, 0.8, 0.5);
    osc.connect(lp); lp.connect(hp); hp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-lofi': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 350;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.5);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-hifi': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 52;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.6, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'bass-punchy': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55*3, 0);
    osc.frequency.exponentialRampToValueAtTime(55, 0.03);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(3000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'bass-sustained': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.5, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'bass-short': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(2000, 0);
    filt.frequency.exponentialRampToValueAtTime(100, 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'bass-long': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 45;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 2.0, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(2.0);
},
  'bass-detuned': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 50;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 50 * 1.01;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.5);
    osc1.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'bass-unison': async function(ctx) {
    const detunes = [-10, -5, 0, 5, 10];
    detunes.forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 50; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.2);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600;
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'bass-stereo': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 50;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 50 * 1.003;
    const pan1 = ctx.createStereoPanner(); pan1.pan.value = -0.7;
    const pan2 = ctx.createStereoPanner(); pan2.pan.value = 0.7;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.5);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    osc1.connect(pan1); pan1.connect(lp);
    osc2.connect(pan2); pan2.connect(lp);
    lp.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'bass-mono': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'bass-sidechain': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    const g = ctx.createGain();
    for(let t = 0; t < 1.0; t += 0.25) {
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.2);
    }
    g.gain.setValueAtTime(0, 1.0);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'bass-pumping': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 48;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    const g = ctx.createGain();
    for(let t = 0; t < 1.0; t += 0.25) {
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.2);
    }
    g.gain.setValueAtTime(0, 1.0);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'bass-bounce': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 52;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800;
    const g = ctx.createGain();
    for(let t = 0; t < 0.5; t += 0.125) {
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.1);
    }
    g.gain.setValueAtTime(0, 0.5);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'bass-funk': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 6;
    filt.frequency.setValueAtTime(2500, 0);
    filt.frequency.exponentialRampToValueAtTime(400, 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, 0);
    g.gain.linearRampToValueAtTime(0.5, 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'bass-slap': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60*4, 0);
    osc.frequency.exponentialRampToValueAtTime(60, 0.01);
    const ns = createNoise(ctx, 0.02, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'highpass'; nf.frequency.value = 2000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.02);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.02);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(3000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'bass-finger': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 50;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1500, 0);
    lp.frequency.exponentialRampToValueAtTime(200, 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.8, 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'bass-picked': async function(ctx) {
    const src = karplusStrong(ctx, 55, 0.4, 0.003, 2000, 0.8);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    src.connect(lp); lp.connect(ctx.destination);
    src.start(0);
},
  'bass-fretless': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 48;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 2;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.03, 0.1, 0.7, 0.3, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'synth-saw-stab': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(500, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'synth-super-saw': async function(ctx) {
    const detunes = [-30, -20, -10, 0, 10, 20, 30];
    detunes.forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.2);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'synth-square-stab': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(500, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'synth-chord-stab': async function(ctx) {
    [220, 220*1.26, 220*1.5, 220*2].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.4);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.4);
    });
},
  'synth-organ-stab': async function(ctx) {
    [1, 2, 3, 4].forEach((h, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 220 * h;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.3 / (i+1), 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.3);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.3);
    });
},
  'synth-brass-stab': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 2;
    filt.frequency.setValueAtTime(200, 0);
    filt.frequency.linearRampToValueAtTime(3000, 0.05);
    filt.frequency.exponentialRampToValueAtTime(800, 0.4);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.4, 0.8);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'synth-pluck': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(8000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'synth-bell': async function(ctx) {
    const ratios = [1, 2.76, 4.07, 5.98];
    ratios.forEach((r, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 880 * r;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4 / (i+1), 0);
      g.gain.exponentialRampToValueAtTime(0.001, 1.0 * (1 - i*0.15));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(1.0);
    });
},
  'synth-key': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 440 * 2;
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(440 * 2, 0);
    modG.gain.exponentialRampToValueAtTime(1, 0.5);
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 440;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(0.5); car.stop(0.5);
},
  'synth-poly': async function(ctx) {
    [220, 220*1.26, 220*1.5].forEach(f => {
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth'; osc1.frequency.value = f;
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth'; osc2.frequency.value = f * 1.003;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.5, 0.2, 0.8, 0.2);
      osc1.connect(g); osc2.connect(g); g.connect(ctx.destination);
      osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
    });
},
  'synth-mono': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 8;
    filt.frequency.setValueAtTime(4000, 0);
    filt.frequency.exponentialRampToValueAtTime(500, 0.3);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.1, 0.6, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'synth-arp': async function(ctx) {
    const notes = [440, 440*1.26, 440*1.5, 440*2];
    const step = 1.0 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const g = ctx.createGain();
      const t = i * step;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.5, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + step * 0.9);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + step);
    });
},
  'synth-sequence': async function(ctx) {
    const notes = [330, 330*0.75, 330, 330*1.5, 330*0.5, 330, 330*1.26, 330];
    const step = 1.0 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'square'; osc.frequency.value = f;
      const filt = ctx.createBiquadFilter();
      filt.type = 'lowpass'; filt.frequency.value = 2000;
      const g = ctx.createGain();
      const t = i * step;
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + step * 0.8);
      osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + step);
    });
},
  'synth-glitch': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    for(let t=0;t<0.5;t+=0.03) osc.frequency.setValueAtTime(440*(0.5+Math.random()*1.5),t);
    const g = ctx.createGain();
    for(let t=0;t<0.5;t+=0.02) g.gain.setValueAtTime(Math.random()>0.3?0.5:0,t);
    g.gain.setValueAtTime(0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-bitcrush': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const ws = ctx.createWaveShaper();
    const steps = 8;
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*steps)/steps;}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.5, 0.6);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-noise': async function(ctx) {
    const ns = createNoise(ctx, 0.6, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 1000; filt.Q.value = 2;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 2;
    const lfG = ctx.createGain(); lfG.gain.value = 500;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.5, 0.2, 0.6, 0.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(0.6); lfo.stop(0.6);
},
  'synth-grain': async function(ctx) {
    const grainSize = 0.02;
    for(let t = 0; t < 0.8; t += grainSize * 1.5) {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 440 * (0.95 + Math.random()*0.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.3, t + grainSize*0.3);
      g.gain.linearRampToValueAtTime(0, t + grainSize);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + grainSize);
    }
},
  'synth-wave': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.5;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 1500; filt.Q.value = 5;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'synth-fm': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 440 * 3;
    const modG = ctx.createGain(); modG.gain.value = 440 * 2;
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 440;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.1, 0.6, 0.6);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(0.6); car.stop(0.6);
},
  'synth-am': async function(ctx) {
    const car = ctx.createOscillator();
    car.type = 'sawtooth'; car.frequency.value = 440;
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 12;
    const modG = ctx.createGain(); modG.gain.value = 0.5;
    const g = ctx.createGain(); g.gain.value = 0.5;
    mod.connect(modG); modG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.7);
    car.connect(g); g.connect(out); out.connect(ctx.destination);
    car.start(0); mod.start(0); car.stop(0.6); mod.stop(0.6);
},
  'synth-ringmod': async function(ctx) {
    const car = ctx.createOscillator();
    car.type = 'sawtooth'; car.frequency.value = 440;
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 440 * 1.71;
    const modG = ctx.createGain(); modG.gain.value = 1;
    const g = ctx.createGain(); g.gain.value = 0;
    mod.connect(modG); modG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.1, 0.5, 0.1, 0.6, 0.6);
    car.connect(g); g.connect(out); out.connect(ctx.destination);
    car.start(0); mod.start(0); car.stop(0.6); mod.stop(0.6);
},
  'synth-sync': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 220;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 220 * 2.01;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.1, 0.6, 0.4);
    osc1.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.6); osc2.stop(0.6);
},
  'synth-phase': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 330;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 330 * 1.001;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.6, 0.2, 0.8, 0.4);
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'synth-formant': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'synth-vowel': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 300, 2300, 3000, 80);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'synth-talk': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 150;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.frequency.value=800; bp1.Q.value=8;
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.frequency.value=1200; bp2.Q.value=8;
    const lfo = ctx.createOscillator(); lfo.type='sine'; lfo.frequency.value=2;
    const lfG = ctx.createGain(); lfG.gain.value=400;
    lfo.connect(lfG); lfG.connect(bp1.frequency); lfG.connect(bp2.frequency);
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.7);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'synth-acid': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 18;
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(300, 0.2);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.6, 0.1, 0.5, 0.8);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-chip': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*4)/4;}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.5, 0.05, 0.4, 0.5);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'synth-retro': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 330;
    const osc2 = ctx.createOscillator();
    osc2.type = 'square'; osc2.frequency.value = 330 * 1.005;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.4);
    osc.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc2.start(0); osc.stop(0.6); osc2.stop(0.6);
},
  'synth-modern': async function(ctx) {
    const detunes = [-15, -5, 0, 5, 15];
    detunes.forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.15, 0.6, 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.6);
    });
},
  'synth-warm': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1200;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.7, 0.2, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-cold': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 800;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.5, 0.1, 0.6, 0.6);
    osc.connect(hp); hp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'synth-bright': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.6, 0.1, 0.5, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-dark': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 600;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.7, 0.2, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-thin': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 440;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.5, 0.1, 0.5, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-thick': async function(ctx) {
    [-20, -7, 0, 7, 20].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.15, 0.6, 0.15);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.6);
    });
},
  'synth-wide': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 330; osc1.detune.value = -15;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 330; osc2.detune.value = 15;
    const p1 = ctx.createStereoPanner(); p1.pan.value = -0.8;
    const p2 = ctx.createStereoPanner(); p2.pan.value = 0.8;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.5);
    osc1.connect(p1); p1.connect(g); osc2.connect(p2); p2.connect(g);
    g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'synth-narrow': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 440; bp.Q.value = 10;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.5, 0.6);
    osc.connect(bp); bp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'synth-clean': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 440;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 440 * 2;
    const g = ctx.createGain();
    const g2 = ctx.createGain(); g2.gain.value = 0.3;
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.6, 0.1, 0.6, 0.5);
    osc.connect(g); osc2.connect(g2); g2.connect(g); g.connect(ctx.destination);
    osc.start(0); osc2.start(0); osc.stop(0.6); osc2.stop(0.6);
},
  'synth-dirty': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.1, 0.6, 0.5);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'synth-soft': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle'; osc.frequency.value = 330;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.15, 0.6, 0.3, 0.8, 0.5);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-hard': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(6000, 0);
    filt.frequency.exponentialRampToValueAtTime(800, 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'synth-attack': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'synth-decay': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(4000, 0);
    filt.frequency.exponentialRampToValueAtTime(100, 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-sustained': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.7, 0.3, 1.5, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'synth-staccato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'synth-legato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1800;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.08, 0.1, 0.7, 0.3, 1.0, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'synth-portamento': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330 * 0.5, 0);
    osc.frequency.exponentialRampToValueAtTime(330, 0.15);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-vibrato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6;
    const lfG = ctx.createGain(); lfG.gain.value = 8;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.6);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'synth-tremolo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 8;
    const lfG = ctx.createGain(); lfG.gain.value = 0.3;
    const g = ctx.createGain(); g.gain.value = 0.5;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.7);
    osc.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'pad-warm': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1200;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-dark': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 180; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-ambient': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 200; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1500;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 4.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(4.0);
    });
},
  'pad-shimmer': async function(ctx) {
    [1, 2, 3, 5].forEach((h, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 440 * h;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.1 * (i+1);
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.6, 0.3, 0.5, 0.8, 3.0, 0.2 / (i+1));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
    });
},
  'pad-string': async function(ctx) {
    [-8, -3, 0, 3, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.2, 0.6, 0.5, 3.0, 0.12);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
    });
},
  'pad-glass': async function(ctx) {
    const ratios = [1, 2.76, 4.07, 5.98];
    ratios.forEach((r, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 880 * r;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.8, 0.3, 0.4, 1.0, 3.0, 0.15 / (i+1));
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-evolving': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 220;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 220 * 1.005;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 3;
    filt.frequency.setValueAtTime(200, 0);
    filt.frequency.linearRampToValueAtTime(3000, 2.0);
    filt.frequency.linearRampToValueAtTime(200, 4.0);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 4.0, 0.5);
    osc1.connect(filt); osc2.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(4.0); osc2.stop(4.0);
},
  'pad-choir': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 600, 1000, 2500, 120);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.5);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
},
  'pad-analog': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1500;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-digital': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 330; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-lofi': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 200; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 800;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-hifi': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-noise': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 1000; filt.Q.value = 1;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    const lfG = ctx.createGain(); lfG.gain.value = 300.0;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(3.0); lfo.stop(3.0);
},
  'pad-grain': async function(ctx) {
    for(let t = 0; t < 3.0; t += 0.04) {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 330 * (0.9 + Math.random()*0.2);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.15, t + 0.01);
      g.gain.linearRampToValueAtTime(0, t + 0.035);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.035);
    }
},
  'pad-tape': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-vinyl': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 200; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 900;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-detuned': async function(ctx) {
    [-12, -4, 0, 4, 12].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1400;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-unison': async function(ctx) {
    [-12, -4, 0, 4, 12].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1800;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-stereo': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 220; osc1.detune.value = -10;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 220; osc2.detune.value = 10;
    const p1 = ctx.createStereoPanner(); p1.pan.value = -0.8;
    const p2 = ctx.createStereoPanner(); p2.pan.value = 0.8;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.5);
    osc1.connect(p1); p1.connect(lp);
    osc2.connect(p2); p2.connect(lp);
    lp.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(3.0); osc2.stop(3.0);
},
  'pad-mono': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1500;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-filtered': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 800;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-sweep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 5;
    filt.frequency.setValueAtTime(100, 0);
    filt.frequency.linearRampToValueAtTime(5000, 2.8);
    filt.frequency.linearRampToValueAtTime(100, 4.0);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 4.0, 0.5);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(4.0);
},
  'pad-pulse': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.3;
    const lfG = ctx.createGain(); lfG.gain.value = 0.3;
    const g = ctx.createGain(); g.gain.value = 0.4;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.6);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500;
    osc.connect(lp); lp.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
},
  'pad-breath': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 2000; filt.Q.value = 3;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    const lfG = ctx.createGain(); lfG.gain.value = 600.0;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(3.0); lfo.stop(3.0);
},
  'pad-ocean': async function(ctx) {
    const ns = createNoise(ctx, 4.0, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 400; filt.Q.value = 0.5;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    const lfG = ctx.createGain(); lfG.gain.value = 120.0;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 4.0, 0.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(4.0); lfo.stop(4.0);
},
  'pad-wind': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 3000; filt.Q.value = 2;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.2;
    const lfG = ctx.createGain(); lfG.gain.value = 900.0;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(3.0); lfo.stop(3.0);
},
  'pad-space': async function(ctx) {
    [330, 330*1.5, 330*2.01].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.05 * (i+1);
      const lfG = ctx.createGain(); lfG.gain.value = 5;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.8, 0.5, 0.5, 1.0, 4.0, 0.2);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(4.0); lfo.stop(4.0);
    });
},
  'pad-dream': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1200;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-fog': async function(ctx) {
    [-8, 0, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 180; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 500;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.7, 0.8, 3.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'pad-ice': async function(ctx) {
    [660, 660*1.5, 660*2.5].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = f;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.value = 500;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.6, 0.3, 0.4, 0.8, 3.0, 0.15);
      osc.connect(hp); hp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'lead-saw': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.1, 0.8, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-square': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.1, 0.8, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-detuned': async function(ctx) {
    [-15, 0, 15].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.3);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'lead-portamento': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440*0.5, 0);
    osc.frequency.exponentialRampToValueAtTime(440, 0.15);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-acid': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 18;
    filt.frequency.setValueAtTime(6000, 0);
    filt.frequency.exponentialRampToValueAtTime(400, 0.24);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.6, 0.1, 0.6, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'lead-pluck': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.setValueAtTime(8000, 0);
    filt.frequency.exponentialRampToValueAtTime(500, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'lead-whistle': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 880;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 8;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.05, 0.7, 0.15, 0.8, 0.6);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-hoover': async function(ctx) {
    [-30, -10, 0, 10, 30].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 330; osc.detune.value = d;
      osc.frequency.setValueAtTime(330*0.7, 0);
      osc.frequency.exponentialRampToValueAtTime(330, 0.1);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.5, 0.2, 0.8, 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'lead-scream': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*6);}
    ws.curve = curve;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 2000; filt.Q.value = 5;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.1, 0.8, 0.6);
    osc.connect(ws); ws.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-talk': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 80);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-vowel': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const fm = createFormantFilter(ctx, osc, 300, 2300, 3000, 80);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-formant': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const fm = createFormantFilter(ctx, osc, 500, 900, 2500, 80);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-sync': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 440;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 440 * 3.01;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.4);
    osc1.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'lead-fm': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 440 * 3;
    const modG = ctx.createGain(); modG.gain.value = 440 * 4;
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 440;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.6, 0.6);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(0.6); car.stop(0.6);
},
  'lead-am': async function(ctx) {
    const car = ctx.createOscillator();
    car.type = 'sawtooth'; car.frequency.value = 440;
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 15;
    const modG = ctx.createGain(); modG.gain.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0.5;
    mod.connect(modG); modG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.05, 0.7, 0.1, 0.6, 0.7);
    car.connect(g); g.connect(out); out.connect(ctx.destination);
    car.start(0); mod.start(0); car.stop(0.6); mod.stop(0.6);
},
  'lead-ring': async function(ctx) {
    const car = ctx.createOscillator();
    car.type = 'sawtooth'; car.frequency.value = 440;
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 440 * 2.1;
    const modG = ctx.createGain(); modG.gain.value = 1;
    const g = ctx.createGain(); g.gain.value = 0;
    mod.connect(modG); modG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.05, 0.6, 0.1, 0.6, 0.6);
    car.connect(g); g.connect(out); out.connect(ctx.destination);
    car.start(0); mod.start(0); car.stop(0.6); mod.stop(0.6);
},
  'lead-phase': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth'; osc1.frequency.value = 440;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth'; osc2.frequency.value = 440 * 1.002;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.15, 0.8, 0.4);
    osc1.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(0.8); osc2.stop(0.8);
},
  'lead-filter': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 10; filt.frequency.value = 1500;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 2;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-wah': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 10; filt.frequency.value = 1500;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 4;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-auto': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 10; filt.frequency.value = 1500;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.7);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-glide': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440*0.7, 0);
    osc.frequency.linearRampToValueAtTime(440, 0.2);
    osc.frequency.linearRampToValueAtTime(440*1.2, 0.5);
    osc.frequency.linearRampToValueAtTime(440, 0.8);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-bend': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, 0);
    osc.frequency.linearRampToValueAtTime(440*1.5, 0.1);
    osc.frequency.linearRampToValueAtTime(440, 0.3);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-vibrato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6;
    const lfG = ctx.createGain(); lfG.gain.value = 10;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-tremolo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 8;
    const lfG = ctx.createGain(); lfG.gain.value = 0.35;
    const g = ctx.createGain(); g.gain.value = 0.5;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.05, 0.7, 0.15, 0.8, 0.7);
    osc.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'lead-staccato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'lead-legato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.08, 0.1, 0.7, 0.3, 1.0, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'lead-chip': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*4)/4;}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.6, 0.05, 0.5, 0.5);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'lead-retro': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    const osc2 = ctx.createOscillator();
    osc2.type = 'square'; osc2.frequency.value = 440 * 1.005;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.6, 0.4);
    osc.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc.start(0); osc2.start(0); osc.stop(0.6); osc2.stop(0.6);
},
  'lead-modern': async function(ctx) {
    [-12, 0, 12].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.6, 0.1, 0.6, 0.25);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.6);
    });
},
  'lead-bright': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 300;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.7, 0.1, 0.6, 0.7);
    osc.connect(hp); hp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'fx-riser-up': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(5000, 2.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.linearRampToValueAtTime(0.8, 1.8);
    g.gain.linearRampToValueAtTime(0, 2.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(2.0);
},
  'fx-riser-down': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(5000, 0);
    osc.frequency.exponentialRampToValueAtTime(100, 2.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.linearRampToValueAtTime(0, 2.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(2.0);
},
  'fx-sweep-up': async function(ctx) {
    const ns = createNoise(ctx, 1.5, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.Q.value = 5;
    filt.frequency.setValueAtTime(200, 0);
    filt.frequency.exponentialRampToValueAtTime(8000, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.linearRampToValueAtTime(0.7, 1.3);
    g.gain.linearRampToValueAtTime(0, 1.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.5);
},
  'fx-sweep-down': async function(ctx) {
    const ns = createNoise(ctx, 1.5, 'white');
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.Q.value = 5;
    filt.frequency.setValueAtTime(8000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.linearRampToValueAtTime(0, 1.5);
    ns.connect(filt); filt.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.5);
},
  'fx-impact': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, 0);
    osc.frequency.exponentialRampToValueAtTime(20, 0.8);
    const ns = createNoise(ctx, 0.15, 'white');
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(1, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.15);
    ns.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'fx-white-noise': async function(ctx) {
    const ns = createNoise(ctx, 1.0, 'white');
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.8, 0.1, 1.0, 0.5);
    ns.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.0);
},
  'fx-vinyl-crackle': async function(ctx) {
    const sr = ctx.sampleRate;
    const len = Math.ceil(2.0 * sr);
    const buf = ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) {
      data[i] = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.3 : (Math.random() * 2 - 1) * 0.02;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    src.connect(lp); lp.connect(ctx.destination);
    src.start(0);
},
  'fx-laser': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(4000, 0);
    osc.frequency.exponentialRampToValueAtTime(100, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'fx-zap': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(6000, 0);
    osc.frequency.exponentialRampToValueAtTime(50, 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'fx-siren': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 3;
    const lfG = ctx.createGain(); lfG.gain.value = 300;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    osc.frequency.value = 800;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.1, 0.1, 0.7, 0.3, 2.0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
},
  'fx-alarm': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 1000;
    const g = ctx.createGain();
    for(let t = 0; t < 1.5; t += 0.3) {
      g.gain.setValueAtTime(0.5, t);
      g.gain.setValueAtTime(0, t + 0.15);
    }
    g.gain.setValueAtTime(0, 1.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'fx-explosion': async function(ctx) {
    const ns = createNoise(ctx, 1.5, 'white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(8000, 0);
    lp.frequency.exponentialRampToValueAtTime(100, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.5);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(20, 1.0);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.8, 0);
    og.gain.exponentialRampToValueAtTime(0.001, 1.0);
    osc.connect(og); og.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
    ns.connect(lp); lp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.5);
},
  'fx-thunder': async function(ctx) {
    const ns = createNoise(ctx, 2.0, 'white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.9, 0.02);
    g.gain.exponentialRampToValueAtTime(0.3, 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, 2.0);
    ns.connect(lp); lp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(2.0);
},
  'fx-rain': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 6000; bp.Q.value = 0.5;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.2, 0.6, 0.8, 3.0, 0.3);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(3.0);
},
  'fx-wind-fx': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 2;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.3;
    const lfG = ctx.createGain(); lfG.gain.value = 400;
    lfo.connect(lfG); lfG.connect(bp.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.5, 1.0, 3.0, 0.4);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(3.0); lfo.stop(3.0);
},
  'fx-ocean-waves': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 800;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.15;
    const lfG = ctx.createGain(); lfG.gain.value = 0.3;
    const g = ctx.createGain(); g.gain.value = 0.3;
    lfo.connect(lfG); lfG.connect(g.gain);
    ns.connect(lp); lp.connect(g); g.connect(ctx.destination);
    ns.start(0); lfo.start(0); ns.stop(3.0); lfo.stop(3.0);
},
  'fx-birds': async function(ctx) {
    for(let t = 0; t < 2.0; t += 0.15 + Math.random() * 0.2) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const base = 2000 + Math.random() * 3000;
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.linearRampToValueAtTime(base * 1.2, t + 0.05);
      osc.frequency.linearRampToValueAtTime(base * 0.9, t + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.1);
    }
},
  'fx-crickets': async function(ctx) {
    for(let t = 0; t < 2.0; t += 0.08) {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 4500 + Math.random() * 1000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.15, t);
      g.gain.setValueAtTime(0, t + 0.03);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.04);
    }
},
  'fx-static': async function(ctx) {
    const ns = createNoise(ctx, 1.0, 'white');
    const g = ctx.createGain();
    g.gain.value = 0.4;
    ns.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.0);
},
  'fx-glitch': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 440;
    for(let t = 0; t < 0.5; t += 0.02) osc.frequency.setValueAtTime(100 + Math.random() * 2000, t);
    const g = ctx.createGain();
    for(let t = 0; t < 0.5; t += 0.015) g.gain.setValueAtTime(Math.random() > 0.4 ? 0.5 : 0, t);
    g.gain.setValueAtTime(0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'fx-stutter': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const g = ctx.createGain();
    for(let t = 0; t < 0.5; t += 0.04) {
      g.gain.setValueAtTime(0.6, t);
      g.gain.setValueAtTime(0, t + 0.02);
    }
    g.gain.setValueAtTime(0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'fx-tape-stop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, 0);
    osc.frequency.exponentialRampToValueAtTime(20, 1.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.linearRampToValueAtTime(0, 1.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'fx-vinyl-scratch': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 3;
    bp.frequency.setValueAtTime(1000, 0);
    bp.frequency.linearRampToValueAtTime(5000, 0.1);
    bp.frequency.linearRampToValueAtTime(1000, 0.2);
    bp.frequency.linearRampToValueAtTime(3000, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
},
  'fx-whoosh-up': async function(ctx) {
    const ns = createNoise(ctx, 0.5, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(500, 0);
    bp.frequency.exponentialRampToValueAtTime(6000, 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.linearRampToValueAtTime(0.6, 0.3);
    g.gain.linearRampToValueAtTime(0, 0.5);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.5);
},
  'fx-whoosh-down': async function(ctx) {
    const ns = createNoise(ctx, 0.5, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.Q.value = 3;
    bp.frequency.setValueAtTime(6000, 0);
    bp.frequency.exponentialRampToValueAtTime(500, 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.linearRampToValueAtTime(0, 0.5);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.5);
},
  'fx-reverse-cymbal': async function(ctx) {
    const ns = createNoise(ctx, 1.5, 'white');
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 5000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.exponentialRampToValueAtTime(0.8, 1.4);
    g.gain.linearRampToValueAtTime(0, 1.5);
    ns.connect(hp); hp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(1.5);
},
  'fx-reverse-clap': async function(ctx) {
    const ns = createNoise(ctx, 0.5, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.exponentialRampToValueAtTime(0.8, 0.45);
    g.gain.linearRampToValueAtTime(0, 0.5);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.5);
},
  'fx-sub-drop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, 0);
    osc.frequency.exponentialRampToValueAtTime(20, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'fx-tension-rise': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, 0);
    osc.frequency.exponentialRampToValueAtTime(2000, 3.0);
    const ns = createNoise(ctx, 3.0, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'highpass';
    nf.frequency.setValueAtTime(2000, 0);
    nf.frequency.linearRampToValueAtTime(8000, 3.0);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, 0);
    ng.gain.linearRampToValueAtTime(0.4, 3.0);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(3.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, 0);
    g.gain.linearRampToValueAtTime(0.7, 2.8);
    g.gain.linearRampToValueAtTime(0, 3.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(3.0);
},
  'fx-release': async function(ctx) {
    const ns = createNoise(ctx, 0.8, 'white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(8000, 0);
    lp.frequency.exponentialRampToValueAtTime(200, 0.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    ns.connect(lp); lp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.8);
},
  'fx-sparkle': async function(ctx) {
    for(let t = 0; t < 1.0; t += 0.05) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 3000 + Math.random() * 5000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.05);
    }
},
  'fx-shimmer': async function(ctx) {
    for(let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2000 + i * 500;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.2 * (i+1);
      const lfG = ctx.createGain(); lfG.gain.value = 5;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.4, 0.5, 1.5, 0.12);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(1.5); lfo.stop(1.5);
    }
},
  'fx-dark-ambience': async function(ctx) {
    const ns = createNoise(ctx, 3.0, 'white');
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 300;
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 50;
    const og = ctx.createGain();
    applyEnvelope(ctx, og.gain, 0.5, 0.3, 0.5, 1.0, 3.0, 0.3);
    osc.connect(og); og.connect(ctx.destination);
    osc.start(0); osc.stop(3.0);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.5, 1.0, 3.0, 0.2);
    ns.connect(lp); lp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(3.0);
},
  'fx-light-ambience': async function(ctx) {
    [440, 660, 880, 1320].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = f;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.8, 0.5, 0.4, 1.0, 3.0, 0.1);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'fx-scifi': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 300;
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 50;
    const modG = ctx.createGain(); modG.gain.value = 200;
    mod.connect(modG); modG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.2, 1.0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); mod.start(0); osc.stop(1.0); mod.stop(1.0);
},
  'fx-retro': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    const notes = [440, 550, 660, 440];
    const step = 0.5 / notes.length;
    notes.forEach((f, i) => { osc.frequency.setValueAtTime(f, i * step); });
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*4)/4;}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.5, 0.05, 0.5, 0.4);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'fx-digital': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 1000;
    for(let t = 0; t < 0.5; t += 0.01) osc.frequency.setValueAtTime(500 + Math.random() * 3000, t);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.001, 0.05, 0.5, 0.05, 0.5, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'fx-analog': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 200;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 10;
    filt.frequency.setValueAtTime(5000, 0);
    filt.frequency.exponentialRampToValueAtTime(200, 0.8);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.5, 0.2, 0.8, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'fx-phone-ring': async function(ctx) {
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine'; osc1.frequency.value = 440;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 480;
    const g = ctx.createGain();
    for(let t = 0; t < 1.0; t += 0.4) {
      g.gain.setValueAtTime(0.3, t);
      g.gain.setValueAtTime(0, t + 0.2);
    }
    g.gain.setValueAtTime(0, 1.0);
    osc1.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc1.start(0); osc2.start(0); osc1.stop(1.0); osc2.stop(1.0);
},
  'fx-heartbeat': async function(ctx) {
    for(let t = 0; t < 1.5; t += 0.75) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.7, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      // Second beat
      g.gain.linearRampToValueAtTime(0.5, t + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.5);
    }
},
  'guitar-clean-strum-major': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.5, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.5);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-clean-strum-minor': async function(ctx) {
    const freqs = [261.63, 311.13, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.5, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.5);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-clean-strum-7th': async function(ctx) {
    const freqs = [261.63, 329.63, 392, 466.16];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.5, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.5);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-acoustic-strum': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.5, 0.003, 3500, 0.65);
      const g = ctx.createGain();
      const offset = i * 0.012;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, 1.5);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-power-chord': async function(ctx) {
    const freqs = [130.81, 196, 261.63];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 1.0, 0.005, 1500, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-palm-mute': async function(ctx) {
    const freqs = [130.81, 196];
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.3, 0.002, 800, 0.6);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.3);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(0);
    });
},
  'guitar-single-clean': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 0.8, 0.003, 3000, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.6, 0.005);
    g.gain.exponentialRampToValueAtTime(0.01, 0.8);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'guitar-single-drive': async function(ctx) {
    const freqs = [329.63];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 0.8, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.8, 0.004, 2000, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-overdrive-riff': async function(ctx) {
    const freqs = [164.81, 196, 220, 196];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 1.0, 0.004, 1800, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-distorted-riff': async function(ctx) {
    const freqs = [130.81, 146.83, 164.81, 130.81];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 1.0, 0.005, 1500, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-blues-riff': async function(ctx) {
    const freqs = [196, 233.08, 261.63, 293.66, 261.63];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.2, 0.003, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.2);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-rock-riff': async function(ctx) {
    const freqs = [164.81, 196, 220, 246.94];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 1.0, 0.004, 2000, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-funk-riff': async function(ctx) {
    const freqs = [329.63, 0, 329.63, 0, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 0.8, 0.003, 3000, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 0.8);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-pop-riff': async function(ctx) {
    const freqs = [261.63, 329.63, 392, 329.63];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.0, 0.003, 3000, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-indie-riff': async function(ctx) {
    const freqs = [329.63, 440, 392, 329.63];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 1.0, 0.003, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 1.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-metal-riff': async function(ctx) {
    const freqs = [82.41, 98, 82.41, 110];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 0.8, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.8, 0.005, 1200, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-clean-arpeggio': async function(ctx) {
    const freqs = [261.63, 329.63, 392, 523.25];
    const step = 0.375;
    
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.003, 3000, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'guitar-acoustic-arpeggio': async function(ctx) {
    const freqs = [261.63, 329.63, 392, 523.25];
    const step = 0.375;
    
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.003, 3500, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'guitar-nylon-pick': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 0.8, 0.002, 2000, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.6, 0.005);
    g.gain.exponentialRampToValueAtTime(0.01, 0.8);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'guitar-steel-pick': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 0.6, 0.003, 4000, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.6, 0.005);
    g.gain.exponentialRampToValueAtTime(0.01, 0.6);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'guitar-slide': async function(ctx) {
    const src = karplusStrong(ctx, 220, 1.0, 0.003, 2500, 0.7);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.6);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
    // Simulate slide with second note
    const src2 = karplusStrong(ctx, 220 * 1.5, 0.6, 0.003, 2500, 0.5);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, 0);
    g2.gain.setValueAtTime(0, 0.3);
    g2.gain.linearRampToValueAtTime(0.5, 0.35);
    g2.gain.exponentialRampToValueAtTime(0.001, 1.0);
    src2.connect(g2); g2.connect(ctx.destination);
    src2.start(0.3);
},
  'guitar-bend-note': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 0.8, 0.003, 2500, 0.7);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.15, 0.8, 0.6);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
    const src2 = karplusStrong(ctx, 329.63 * 1.122, 0.4, 0.003, 2500, 0.5);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, 0);
    g2.gain.setValueAtTime(0, 0.16000000000000003);
    g2.gain.linearRampToValueAtTime(0.5, 0.27999999999999997);
    g2.gain.exponentialRampToValueAtTime(0.001, 0.6400000000000001);
    src2.connect(g2); g2.connect(ctx.destination);
    src2.start(0.16000000000000003);
},
  'guitar-hammer-on': async function(ctx) {
    const src1 = karplusStrong(ctx, 329.63, 0.25, 0.003, 2800, 0.7);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.6, 0);
    g1.gain.exponentialRampToValueAtTime(0.1, 0.125);
    src1.connect(g1); g1.connect(ctx.destination);
    src1.start(0);
    const src2 = karplusStrong(ctx, 392, 0.25, 0.0015, 2800, 0.5);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, 0);
    g2.gain.setValueAtTime(0.5, 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, 0.5);
    src2.connect(g2); g2.connect(ctx.destination);
    src2.start(0.1);
},
  'guitar-pull-off': async function(ctx) {
    const src1 = karplusStrong(ctx, 392, 0.25, 0.003, 2800, 0.7);
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.6, 0);
    g1.gain.exponentialRampToValueAtTime(0.1, 0.125);
    src1.connect(g1); g1.connect(ctx.destination);
    src1.start(0);
    const src2 = karplusStrong(ctx, 329.63, 0.25, 0.0009, 2800, 0.4);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0, 0);
    g2.gain.setValueAtTime(0.4, 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, 0.5);
    src2.connect(g2); g2.connect(ctx.destination);
    src2.start(0.1);
},
  'guitar-harmonic': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 659.26;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.5, 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, 1.2);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.2);
},
  'guitar-pinch-harmonic': async function(ctx) {
    const freqs = [659.26];
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*4);}
    ws.curve = curve;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.2, 1.0, 0.4);
    ws.connect(lp); lp.connect(g); g.connect(ctx.destination);
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 1.0, 0.001, 6000, 0.5);
      src.connect(ws);
      src.start(0);
    });
},
  'guitar-wah': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 1.0, 0.004, 2000, 0.7);
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.Q.value = 5;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 3;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    filt.frequency.value = 1500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.1, 0.6, 0.15, 1.0, 0.6);
    src.connect(filt); filt.connect(g); g.connect(ctx.destination);
    src.start(0); lfo.start(0); lfo.stop(1.0);
},
  'guitar-tremolo-pick': async function(ctx) {
    const src = karplusStrong(ctx, 329.63, 0.8, 0.003, 3000, 0.7);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 12;
    const lfG = ctx.createGain(); lfG.gain.value = 0.3;
    const g = ctx.createGain(); g.gain.value = 0.5;
    lfo.connect(lfG); lfG.connect(g.gain);
    src.connect(g); g.connect(ctx.destination);
    src.start(0); lfo.start(0); lfo.stop(0.8);
},
  'guitar-fingerpick': async function(ctx) {
    const freqs = [261.63, 329.63, 392, 329.63, 261.63, 329.63];
    const step = 0.25;
    
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.002, 2500, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'guitar-chord-am': async function(ctx) {
    const freqs = [220, 261.63, 329.63];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 2.0, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 2.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-chord-c': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 2.0, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 2.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-chord-em': async function(ctx) {
    const freqs = [164.81, 246.94, 329.63];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 2.0, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 2.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-chord-g': async function(ctx) {
    const freqs = [196, 246.94, 392];
    freqs.forEach((f, i) => {
      const src = karplusStrong(ctx, f, 2.0, 0.004, 2500, 0.6);
      const g = ctx.createGain();
      const offset = i * 0.015;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, offset);
      g.gain.linearRampToValueAtTime(0.5, offset + 0.005);
      g.gain.exponentialRampToValueAtTime(0.01, 2.0);
      src.connect(g); g.connect(ctx.destination);
      src.start(offset);
    });
},
  'guitar-stab': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.2, 0.004, 2000, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.2);
      src.connect(g); g.connect(ctx.destination);
      src.start(0);
    });
},
  'guitar-chop': async function(ctx) {
    const freqs = [329.63, 392];
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.15, 0.003, 2500, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.15);
      src.connect(g); g.connect(ctx.destination);
      src.start(0);
    });
},
  'guitar-muted-strum': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach(f => {
      const src = karplusStrong(ctx, f, 0.15, 0.002, 800, 0.6);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 600;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.15);
      src.connect(lp); lp.connect(g); g.connect(ctx.destination);
      src.start(0);
    });
},
  'guitar-scratch': async function(ctx) {
    const ns = createNoise(ctx, 0.1, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.1);
},
  'guitar-clean-lead': async function(ctx) {
    const freqs = [440, 523.25, 587.33, 659.26];
    const step = 0.2;
    
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.003, 3500, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'guitar-distorted-lead': async function(ctx) {
    const freqs = [440, 523.25, 587.33, 659.26];
    const step = 0.2;
    
    const ws = ctx.createWaveShaper();
    const dcurve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;dcurve[i]=Math.tanh(x*3);}
    ws.curve = dcurve;
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.004, 2000, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(ws); ws.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'guitar-acoustic-melody': async function(ctx) {
    const freqs = [329.63, 392, 440, 392, 329.63];
    const step = 0.24;
    
    freqs.forEach((f, i) => {
      if (f === 0) return;
      const src = karplusStrong(ctx, f, step * 0.95, 0.003, 3000, 0.7);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.6, i * step + 0.003);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      src.connect(g);
      g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'piano-grand-c': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.7, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-grand-chord': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.6);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.9);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(2.0); car.stop(2.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.6);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.9);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(2.0); car.stop(2.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 1.6);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.9);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(2.0); car.stop(2.0);
    })();
},
  'piano-upright-note': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 1.2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.2);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.2);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
},
  'piano-upright-chord': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-electric': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 1;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 0.8, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.0);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.0);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-rhodes-clean': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 261.63 * 1;
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(261.63 * 0.7, 0);
    modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2);
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 261.63;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.6, 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, 1.2);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
},
  'piano-rhodes-tremolo': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 261.63;
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(261.63 * 0.7, 0);
    modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.5);
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 261.63;
    mod.connect(modG); modG.connect(car.frequency);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 0.25;
    const g = ctx.createGain(); g.gain.value = 0.4;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, 0);
    out.gain.linearRampToValueAtTime(1, 0.01);
    out.gain.exponentialRampToValueAtTime(0.001, 1.5);
    car.connect(g); g.connect(out); out.connect(ctx.destination);
    mod.start(0); car.start(0); lfo.start(0);
    mod.stop(1.5); car.stop(1.5); lfo.stop(1.5);
},
  'piano-wurlitzer': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 3;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 1, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.0);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.0);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-clavinet': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square'; osc.frequency.value = 261.63;
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 261.63 * 3; filt.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'piano-honky-tonk': async function(ctx) {
    [0, 3].forEach(d => {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.2);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63; car.detune.value = d;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.2);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    });
},
  'piano-bright': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 3, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.2);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.7, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.2);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
},
  'piano-dark': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 0.8, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-soft': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 0.5, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-hard': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 3.5, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 1.0);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.8, 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, 1.0);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-staccato': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 0.3);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.7, 0.002);
      g.gain.exponentialRampToValueAtTime(0.001, 0.3);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(0.3); car.stop(0.3);
    })();
},
  'piano-sustained': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.1, 2.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.5, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 2.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(2.5); car.stop(2.5);
    })();
},
  'piano-arpeggio-up': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0.0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 0.9600000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.1400000000000001);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0); mod.stop(1.2000000000000002); car.stop(1.2000000000000002);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0.15);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.11);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.15);
      g.gain.linearRampToValueAtTime(0.4, 0.155);
      g.gain.exponentialRampToValueAtTime(0.001, 1.29);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.15); car.start(0.15); mod.stop(1.35); car.stop(1.35);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 2, 0.3);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 1.2600000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.3);
      g.gain.linearRampToValueAtTime(0.4, 0.305);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4400000000000002);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.3); car.start(0.3); mod.stop(1.5000000000000002); car.stop(1.5000000000000002);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.26 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(523.26 * 2, 0.44999999999999996);
      modG.gain.exponentialRampToValueAtTime(523.26 * 0.05, 1.4100000000000001);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.26;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.44999999999999996);
      g.gain.linearRampToValueAtTime(0.4, 0.45499999999999996);
      g.gain.exponentialRampToValueAtTime(0.001, 1.59);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.44999999999999996); car.start(0.44999999999999996); mod.stop(1.6500000000000001); car.stop(1.6500000000000001);
    })();
},
  'piano-arpeggio-down': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.25 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(523.25 * 2, 0.0);
      modG.gain.exponentialRampToValueAtTime(523.25 * 0.05, 0.9600000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.25;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.1400000000000001);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0); mod.stop(1.2000000000000002); car.stop(1.2000000000000002);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.4375 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.4375 * 2, 0.15);
      modG.gain.exponentialRampToValueAtTime(392.4375 * 0.05, 1.11);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.4375;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.15);
      g.gain.linearRampToValueAtTime(0.4, 0.155);
      g.gain.exponentialRampToValueAtTime(0.001, 1.29);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.15); car.start(0.15); mod.stop(1.35); car.stop(1.35);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6475 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6475 * 2, 0.3);
      modG.gain.exponentialRampToValueAtTime(329.6475 * 0.05, 1.2600000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6475;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.3);
      g.gain.linearRampToValueAtTime(0.4, 0.305);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4400000000000002);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.3); car.start(0.3); mod.stop(1.5000000000000002); car.stop(1.5000000000000002);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.625 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.625 * 2, 0.44999999999999996);
      modG.gain.exponentialRampToValueAtTime(261.625 * 0.05, 1.4100000000000001);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.625;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.44999999999999996);
      g.gain.linearRampToValueAtTime(0.4, 0.45499999999999996);
      g.gain.exponentialRampToValueAtTime(0.001, 1.59);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.44999999999999996); car.start(0.44999999999999996); mod.stop(1.6500000000000001); car.stop(1.6500000000000001);
    })();
},
  'piano-trill': async function(ctx) {
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 261.63;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.1125);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.0); mod.start(0.0);
      osc.stop(0.125); mod.stop(0.125);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 293.54886000000005;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.54886000000005 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.54886000000005;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.125);
      g.gain.exponentialRampToValueAtTime(0.01, 0.2375);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.125); mod.start(0.125);
      osc.stop(0.25); mod.stop(0.25);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 261.63;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, 0.3625);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.25); mod.start(0.25);
      osc.stop(0.375); mod.stop(0.375);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 293.54886000000005;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.54886000000005 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.54886000000005;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.375);
      g.gain.exponentialRampToValueAtTime(0.01, 0.4875);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.375); mod.start(0.375);
      osc.stop(0.5); mod.stop(0.5);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 261.63;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.5);
      g.gain.exponentialRampToValueAtTime(0.01, 0.6125);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.5); mod.start(0.5);
      osc.stop(0.625); mod.stop(0.625);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 293.54886000000005;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.54886000000005 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.54886000000005;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.625);
      g.gain.exponentialRampToValueAtTime(0.01, 0.7375);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.625); mod.start(0.625);
      osc.stop(0.75); mod.stop(0.75);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 261.63;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.75);
      g.gain.exponentialRampToValueAtTime(0.01, 0.8625);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.75); mod.start(0.75);
      osc.stop(0.875); mod.stop(0.875);
    })();
    (function() {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 293.54886000000005;
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.54886000000005 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.54886000000005;
      mod.connect(modG); modG.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.875);
      g.gain.exponentialRampToValueAtTime(0.01, 0.9875);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0.875); mod.start(0.875);
      osc.stop(1.0); mod.stop(1.0);
    })();
},
  'piano-glissando-up': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.1);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.125); car.stop(0.125);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.66 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.66 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.66;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.125);
      g.gain.exponentialRampToValueAtTime(0.01, 0.225);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.125); car.start(0.125);
      mod.stop(0.25); car.stop(0.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, 0.35);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.25); car.start(0.25);
      mod.stop(0.375); car.stop(0.375);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 349.23 * 2;
      const modG = ctx.createGain(); modG.gain.value = 349.23 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 349.23;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.375);
      g.gain.exponentialRampToValueAtTime(0.01, 0.475);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.375); car.start(0.375);
      mod.stop(0.5); car.stop(0.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.5);
      g.gain.exponentialRampToValueAtTime(0.01, 0.6);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.5); car.start(0.5);
      mod.stop(0.625); car.stop(0.625);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 440 * 2;
      const modG = ctx.createGain(); modG.gain.value = 440 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 440;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.625);
      g.gain.exponentialRampToValueAtTime(0.01, 0.725);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.625); car.start(0.625);
      mod.stop(0.75); car.stop(0.75);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 493.88 * 2;
      const modG = ctx.createGain(); modG.gain.value = 493.88 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 493.88;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.75);
      g.gain.exponentialRampToValueAtTime(0.01, 0.85);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.75); car.start(0.75);
      mod.stop(0.875); car.stop(0.875);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.25 * 2;
      const modG = ctx.createGain(); modG.gain.value = 523.25 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.25;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.875);
      g.gain.exponentialRampToValueAtTime(0.01, 0.975);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.875); car.start(0.875);
      mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-glissando-down': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 1046.5 * 2;
      const modG = ctx.createGain(); modG.gain.value = 1046.5 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 1046.5;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.1);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.125); car.stop(0.125);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 987.77 * 2;
      const modG = ctx.createGain(); modG.gain.value = 987.77 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 987.77;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.125);
      g.gain.exponentialRampToValueAtTime(0.01, 0.225);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.125); car.start(0.125);
      mod.stop(0.25); car.stop(0.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 880 * 2;
      const modG = ctx.createGain(); modG.gain.value = 880 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 880;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, 0.35);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.25); car.start(0.25);
      mod.stop(0.375); car.stop(0.375);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 783.99 * 2;
      const modG = ctx.createGain(); modG.gain.value = 783.99 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 783.99;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.375);
      g.gain.exponentialRampToValueAtTime(0.01, 0.475);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.375); car.start(0.375);
      mod.stop(0.5); car.stop(0.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 698.46 * 2;
      const modG = ctx.createGain(); modG.gain.value = 698.46 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 698.46;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.5);
      g.gain.exponentialRampToValueAtTime(0.01, 0.6);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.5); car.start(0.5);
      mod.stop(0.625); car.stop(0.625);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 659.26 * 2;
      const modG = ctx.createGain(); modG.gain.value = 659.26 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 659.26;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.625);
      g.gain.exponentialRampToValueAtTime(0.01, 0.725);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.625); car.start(0.625);
      mod.stop(0.75); car.stop(0.75);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 587.33 * 2;
      const modG = ctx.createGain(); modG.gain.value = 587.33 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 587.33;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.75);
      g.gain.exponentialRampToValueAtTime(0.01, 0.85);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.75); car.start(0.75);
      mod.stop(0.875); car.stop(0.875);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.25 * 2;
      const modG = ctx.createGain(); modG.gain.value = 523.25 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.25;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0.875);
      g.gain.exponentialRampToValueAtTime(0.01, 0.975);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.875); car.start(0.875);
      mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-octave': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 0.96);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.14);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.26 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(523.26 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(523.26 * 0.05, 0.96);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.26;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.14);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
},
  'piano-fifth': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 0.96);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.14);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 0.96);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.14);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
},
  'piano-minor-chord': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 311.07807 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(311.07807 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(311.07807 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 311.07807;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 391.92174 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(391.92174 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(391.92174 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 391.92174;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-major-chord': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 391.92174 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(391.92174 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(391.92174 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 391.92174;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-7th-chord': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 391.92174 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(391.92174 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(391.92174 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 391.92174;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 466.22466 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(466.22466 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(466.22466 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 466.22466;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-diminished': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 311.07807 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(311.07807 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(311.07807 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 311.07807;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 369.94482 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(369.94482 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(369.94482 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 369.94482;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-augmented': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 415.20680999999996 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(415.20680999999996 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(415.20680999999996 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 415.20680999999996;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-sus4': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 349.27605 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(349.27605 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(349.27605 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 349.27605;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 391.92174 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(391.92174 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(391.92174 * 0.05, 1.2000000000000002);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 391.92174;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.4249999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-cluster': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 0.8);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 0.95);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 277.06617 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(277.06617 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(277.06617 * 0.05, 0.8);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 277.06617;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 0.95);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.54886000000005 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(293.54886000000005 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(293.54886000000005 * 0.05, 0.8);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.54886000000005;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 0.95);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 311.07807 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(311.07807 * 2, 0);
      modG.gain.exponentialRampToValueAtTime(311.07807 * 0.05, 0.8);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 311.07807;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 0.95);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-broken-slow': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0.0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 1.1199999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.3299999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0); mod.stop(1.4); car.stop(1.4);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0.25);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 1.3699999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.25);
      g.gain.linearRampToValueAtTime(0.4, 0.255);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5799999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.25); car.start(0.25); mod.stop(1.65); car.stop(1.65);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 2, 0.5);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 1.6199999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.5);
      g.gain.linearRampToValueAtTime(0.4, 0.505);
      g.gain.exponentialRampToValueAtTime(0.001, 1.8299999999999998);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.5); car.start(0.5); mod.stop(1.9); car.stop(1.9);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.26 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(523.26 * 2, 0.75);
      modG.gain.exponentialRampToValueAtTime(523.26 * 0.05, 1.8699999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.26;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.75);
      g.gain.linearRampToValueAtTime(0.4, 0.755);
      g.gain.exponentialRampToValueAtTime(0.001, 2.08);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.75); car.start(0.75); mod.stop(2.15); car.stop(2.15);
    })();
},
  'piano-broken-fast': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(261.63 * 2, 0.0);
      modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 0.5599999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.0);
      g.gain.linearRampToValueAtTime(0.4, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 0.6649999999999999);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0); mod.stop(0.7); car.stop(0.7);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.6538 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(329.6538 * 2, 0.08);
      modG.gain.exponentialRampToValueAtTime(329.6538 * 0.05, 0.6399999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.6538;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.08);
      g.gain.linearRampToValueAtTime(0.4, 0.085);
      g.gain.exponentialRampToValueAtTime(0.001, 0.7449999999999999);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.08); car.start(0.08); mod.stop(0.7799999999999999); car.stop(0.7799999999999999);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392.445 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(392.445 * 2, 0.16);
      modG.gain.exponentialRampToValueAtTime(392.445 * 0.05, 0.72);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392.445;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.16);
      g.gain.linearRampToValueAtTime(0.4, 0.165);
      g.gain.exponentialRampToValueAtTime(0.001, 0.825);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.16); car.start(0.16); mod.stop(0.86); car.stop(0.86);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.26 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(523.26 * 2, 0.24);
      modG.gain.exponentialRampToValueAtTime(523.26 * 0.05, 0.7999999999999999);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.26;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, 0.24);
      g.gain.linearRampToValueAtTime(0.4, 0.245);
      g.gain.exponentialRampToValueAtTime(0.001, 0.9049999999999999);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.24); car.start(0.24); mod.stop(0.94); car.stop(0.94);
    })();
},
  'piano-riff-pop': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.2125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.25); car.stop(0.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, 0.4625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.25); car.start(0.25);
      mod.stop(0.5); car.stop(0.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.5);
      g.gain.exponentialRampToValueAtTime(0.01, 0.7125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.5); car.start(0.5);
      mod.stop(0.75); car.stop(0.75);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.75);
      g.gain.exponentialRampToValueAtTime(0.01, 0.9625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.75); car.start(0.75);
      mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.0);
      g.gain.exponentialRampToValueAtTime(0.01, 1.2125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.0); car.start(1.0);
      mod.stop(1.25); car.stop(1.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.25);
      g.gain.exponentialRampToValueAtTime(0.01, 1.4625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.25); car.start(1.25);
      mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-riff-classical': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.18214285714285713);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.21428571428571427); car.stop(0.21428571428571427);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.66 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.66 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.66;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.21428571428571427);
      g.gain.exponentialRampToValueAtTime(0.01, 0.3964285714285714);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.21428571428571427); car.start(0.21428571428571427);
      mod.stop(0.42857142857142855); car.stop(0.42857142857142855);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.42857142857142855);
      g.gain.exponentialRampToValueAtTime(0.01, 0.6107142857142857);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.42857142857142855); car.start(0.42857142857142855);
      mod.stop(0.6428571428571428); car.stop(0.6428571428571428);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.66 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.66 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.66;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.6428571428571428);
      g.gain.exponentialRampToValueAtTime(0.01, 0.825);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.6428571428571428); car.start(0.6428571428571428);
      mod.stop(0.8571428571428571); car.stop(0.8571428571428571);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.8571428571428571);
      g.gain.exponentialRampToValueAtTime(0.01, 1.0392857142857141);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.8571428571428571); car.start(0.8571428571428571);
      mod.stop(1.0714285714285714); car.stop(1.0714285714285714);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 246.94 * 2;
      const modG = ctx.createGain(); modG.gain.value = 246.94 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 246.94;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.0714285714285714);
      g.gain.exponentialRampToValueAtTime(0.01, 1.2535714285714286);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.0714285714285714); car.start(1.0714285714285714);
      mod.stop(1.2857142857142856); car.stop(1.2857142857142856);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.2857142857142856);
      g.gain.exponentialRampToValueAtTime(0.01, 1.4678571428571427);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.2857142857142856); car.start(1.2857142857142856);
      mod.stop(1.4999999999999998); car.stop(1.4999999999999998);
    })();
},
  'piano-melody-simple': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.2833333333333333);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.3333333333333333); car.stop(0.3333333333333333);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.66 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.66;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.66;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.3333333333333333);
      g.gain.exponentialRampToValueAtTime(0.01, 0.6166666666666667);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.3333333333333333); car.start(0.3333333333333333);
      mod.stop(0.6666666666666666); car.stop(0.6666666666666666);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.6666666666666666);
      g.gain.exponentialRampToValueAtTime(0.01, 0.95);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.6666666666666666); car.start(0.6666666666666666);
      mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.0);
      g.gain.exponentialRampToValueAtTime(0.01, 1.2833333333333332);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.0); car.start(1.0);
      mod.stop(1.3333333333333333); car.stop(1.3333333333333333);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.3333333333333333);
      g.gain.exponentialRampToValueAtTime(0.01, 1.6166666666666667);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.3333333333333333); car.start(1.3333333333333333);
      mod.stop(1.6666666666666665); car.stop(1.6666666666666665);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.6666666666666665);
      g.gain.exponentialRampToValueAtTime(0.01, 1.9499999999999997);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.6666666666666665); car.start(1.6666666666666665);
      mod.stop(1.9999999999999998); car.stop(1.9999999999999998);
    })();
},
  'piano-melody-complex': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 261.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 261.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 261.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.0);
      g.gain.exponentialRampToValueAtTime(0.01, 0.2125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.0); car.start(0.0);
      mod.stop(0.25); car.stop(0.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 329.63 * 2;
      const modG = ctx.createGain(); modG.gain.value = 329.63 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 329.63;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.25);
      g.gain.exponentialRampToValueAtTime(0.01, 0.4625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.25); car.start(0.25);
      mod.stop(0.5); car.stop(0.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 293.66 * 2;
      const modG = ctx.createGain(); modG.gain.value = 293.66 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 293.66;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.5);
      g.gain.exponentialRampToValueAtTime(0.01, 0.7125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.5); car.start(0.5);
      mod.stop(0.75); car.stop(0.75);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 0.75);
      g.gain.exponentialRampToValueAtTime(0.01, 0.9625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0.75); car.start(0.75);
      mod.stop(1.0); car.stop(1.0);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 349.23 * 2;
      const modG = ctx.createGain(); modG.gain.value = 349.23 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 349.23;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.0);
      g.gain.exponentialRampToValueAtTime(0.01, 1.2125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.0); car.start(1.0);
      mod.stop(1.25); car.stop(1.25);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 440 * 2;
      const modG = ctx.createGain(); modG.gain.value = 440 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 440;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.25);
      g.gain.exponentialRampToValueAtTime(0.01, 1.4625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.25); car.start(1.25);
      mod.stop(1.5); car.stop(1.5);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 392 * 2;
      const modG = ctx.createGain(); modG.gain.value = 392 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 392;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.5);
      g.gain.exponentialRampToValueAtTime(0.01, 1.7125);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.5); car.start(1.5);
      mod.stop(1.75); car.stop(1.75);
    })();
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 523.25 * 2;
      const modG = ctx.createGain(); modG.gain.value = 523.25 * 1.5;
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 523.25;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, 1.75);
      g.gain.exponentialRampToValueAtTime(0.01, 1.9625);
      car.connect(g); g.connect(ctx.destination);
      mod.start(1.75); car.start(1.75);
      mod.stop(2.0); car.stop(2.0);
    })();
},
  'piano-bass-note': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 130.81 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(130.81 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(130.81 * 0.1, 1.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 130.81;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    })();
},
  'piano-high-note': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 1046.5 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(1046.5 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(1046.5 * 0.1, 1.0);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 1046.5;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.0);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.0); car.stop(1.0);
    })();
},
  'piano-mid-range': async function(ctx) {
    (function() {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = 440 * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(440 * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(440 * 0.1, 1.2);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = 440;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.6, 0.003);
      g.gain.exponentialRampToValueAtTime(0.001, 1.2);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.2); car.stop(1.2);
    })();
},
  'piano-toy': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 523.25;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 523.25 * 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.3, 0);
    g2.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc2.connect(g2); g2.connect(ctx.destination);
    osc.start(0); osc2.start(0); osc.stop(0.8); osc2.stop(0.8);
},
  'str-violin-sustained': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1760;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.7, 0.5, 2.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    });
},
  'str-violin-staccato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1760;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.7, 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'str-violin-pizzicato': async function(ctx) {
    const src = karplusStrong(ctx, 440, 0.4, 0.001, 1320, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'str-violin-tremolo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 12;
    const lfG = ctx.createGain(); lfG.gain.value = 0.35;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1760;
    const g = ctx.createGain(); g.gain.value = 0.4;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.2, 0.2, 0.7, 0.4, 1.5, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.5); lfo.stop(1.5);
},
  'str-violin-trill': async function(ctx) {
    const step = 1.0 / 12;
    for (let i = 0; i < 12; i++) {
      const f = i % 2 === 0 ? 440 : 440 * 1.122;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1760;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, i * step);
      g.gain.exponentialRampToValueAtTime(0.05, i * step + step * 0.9);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); osc.stop(i * step + step);
    }
},
  'str-violin-glissando': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, 0);
    osc.frequency.linearRampToValueAtTime(440 * 2, 1.0);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 4;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.15, 0.1, 0.7, 0.2, 1.0, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
},
  'str-violin-vibrato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 6;
    const lfG = ctx.createGain(); lfG.gain.value = 6;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1760;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.7, 0.5, 2.0, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
},
  'str-violin-spiccato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.7, 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, 0.15);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.15);
},
  'str-violin-col-legno': async function(ctx) {
    const ns = createNoise(ctx, 0.01, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 440; nf.Q.value = 10;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.6, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.2);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.2);
},
  'str-violin-harmonics': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 880;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.15, 0.2, 0.5, 0.4, 1.5, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'str-viola-sustained': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 330; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 1320;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.7, 0.5, 2.0, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    });
},
  'str-viola-pizzicato': async function(ctx) {
    const src = karplusStrong(ctx, 330, 0.4, 0.001, 990, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'str-cello-sustained': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 880;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.7, 0.5, 2.5, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.5); lfo.stop(2.5);
    });
},
  'str-cello-pizzicato': async function(ctx) {
    const src = karplusStrong(ctx, 220, 0.5, 0.001, 660, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.5);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'str-cello-staccato': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 880;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.7, 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'str-dbass-sustained': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 110; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 440;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.3, 0.2, 0.7, 0.5, 2.5, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.5); lfo.stop(2.5);
    });
},
  'str-dbass-pizzicato': async function(ctx) {
    const src = karplusStrong(ctx, 110, 0.6, 0.001, 330, 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.6);
    src.connect(g); g.connect(ctx.destination);
    src.start(0);
},
  'str-ensemble-sustained': async function(ctx) {
    const voices = 8;
    for (let v = 0; v < voices; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < voices/2 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 20;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3 + Math.random() * 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.3, 0.6, 0.6, 3.0, 0.08);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
    }
},
  'str-ensemble-staccato': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < 3 ? 1 : 2);
      osc.detune.value = (v - 3) * 5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.12, 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, 0.25);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.25);
    }
},
  'str-ensemble-tremolo': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < 3 ? 1 : 2);
      osc.detune.value = (v - 3) * 5;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 10 + Math.random() * 4;
      const lfG = ctx.createGain(); lfG.gain.value = 0.3;
      const g = ctx.createGain(); g.gain.value = 0.3;
      lfo.connect(lfG); lfG.connect(g.gain);
      const out = ctx.createGain();
      applyEnvelope(ctx, out.gain, 0.2, 0.2, 0.6, 0.5, 2.0, 0.12);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      osc.connect(lp); lp.connect(g); g.connect(out); out.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    }
},
  'str-ensemble-pizzicato': async function(ctx) {
    [220, 220*1.26, 220*1.5, 220*2].forEach(f => {
      const src = karplusStrong(ctx, f, 0.4, 0.001, 3000, 0.5);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.4);
      src.connect(g); g.connect(ctx.destination);
      src.start(0);
    });
},
  'str-swell': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.25, 2.0999999999999996);
      g.gain.linearRampToValueAtTime(0, 3.0);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'str-fade': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, 0);
      g.gain.linearRampToValueAtTime(0, 3.0);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'str-dramatic': async function(ctx) {
    [220, 220*1.5, 220*2].forEach((f, i) => {
      [-8, 0, 8].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 4000;
        const g = ctx.createGain();
        applyEnvelope(ctx, g.gain, 0.1, 0.2, 0.7, 0.4, 2.5, 0.06);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(2.5);
      });
    });
},
  'str-gentle': async function(ctx) {
    [-3, 0, 3].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 330; osc.detune.value = d;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.5, 0.8, 3.0, 0.15);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
    });
},
  'str-tense': async function(ctx) {
    [220, 220*1.059].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 7;
      const lfG = ctx.createGain(); lfG.gain.value = 8;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.2, 0.2, 0.7, 0.3, 2.0, 0.3);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    });
},
  'str-romantic': async function(ctx) {
    [330, 330*1.26, 330*1.5].forEach((f, i) => {
      [-5, 0, 5].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 5;
        const lfG = ctx.createGain(); lfG.gain.value = 3;
        lfo.connect(lfG); lfG.connect(osc.frequency);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 2500;
        const g = ctx.createGain();
        applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.6, 0.8, 3.0, 0.05);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
      });
    });
},
  'str-action': async function(ctx) {
    [220, 220*1.5, 220*2].forEach(f => {
      [-10, 0, 10].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 4000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.06, 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, 1.5);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(1.5);
      });
    });
},
  'str-horror': async function(ctx) {
    [220, 220*1.059, 220*1.414].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.5 + i * 0.3;
      const lfG = ctx.createGain(); lfG.gain.value = 10;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 2000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.6, 0.5, 2.5, 0.2);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.5); lfo.stop(2.5);
    });
},
  'str-run-up': async function(ctx) {
    const notes = [220, 220*1.122, 220*1.26, 220*1.335, 220*1.498, 220*1.682, 220*1.888, 220*2];
    const step = 1.5 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, i * step);
      g.gain.exponentialRampToValueAtTime(0.05, i * step + step * 0.9);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); osc.stop(i * step + step);
    });
},
  'str-run-down': async function(ctx) {
    const notes = [880, 880*0.891, 880*0.794, 880*0.749, 880*0.667, 880*0.595, 880*0.53, 880*0.5];
    const step = 1.5 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, i * step);
      g.gain.exponentialRampToValueAtTime(0.05, i * step + step * 0.9);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); osc.stop(i * step + step);
    });
},
  'str-chord-major': async function(ctx) {
    [220, 220*1.26, 220*1.5, 220*2].forEach(f => {
      [-5, 0, 5].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const g = ctx.createGain();
        applyEnvelope(ctx, g.gain, 0.3, 0.3, 0.6, 0.6, 2.5, 0.04);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(2.5);
      });
    });
},
  'str-chord-minor': async function(ctx) {
    [220, 220*1.189, 220*1.498, 220*2].forEach(f => {
      [-5, 0, 5].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const g = ctx.createGain();
        applyEnvelope(ctx, g.gain, 0.3, 0.3, 0.6, 0.6, 2.5, 0.04);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(2.5);
      });
    });
},
  'str-melody-simple': async function(ctx) {
    const notes = [440, 523.25, 587.33, 523.25, 440, 392];
    const step = 2.0 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.05, 0.05, 0.6, 0.08, step, 0.5);
      // Offset the envelope
      const delay = ctx.createDelay();
      delay.delayTime.value = 0;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.5, i * step + 0.05);
      g.gain.setValueAtTime(0.4, i * step + step * 0.7);
      g.gain.linearRampToValueAtTime(0, i * step + step * 0.95);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); lfo.start(i * step);
      osc.stop(i * step + step); lfo.stop(i * step + step);
    });
},
  'str-ostinato': async function(ctx) {
    const notes = [220, 220*1.26, 220*1.5, 220*1.26];
    const step = 2.0 / 8;
    for (let r = 0; r < 2; r++) {
      notes.forEach((f, i) => {
        const idx = r * 4 + i;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, 0);
        g.gain.setValueAtTime(0, idx * step);
        g.gain.linearRampToValueAtTime(0.4, idx * step + 0.02);
        g.gain.exponentialRampToValueAtTime(0.01, idx * step + step * 0.85);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(idx * step); osc.stop(idx * step + step);
      });
    }
},
  'str-solo-violin': async function(ctx) {
    const notes = [440, 523.25, 659.26, 587.33, 523.25, 440];
    const step = 2.0 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.05, 0.05, 0.6, 0.08, step, 0.5);
      // Offset the envelope
      const delay = ctx.createDelay();
      delay.delayTime.value = 0;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.5, i * step + 0.05);
      g.gain.setValueAtTime(0.4, i * step + step * 0.7);
      g.gain.linearRampToValueAtTime(0, i * step + step * 0.95);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); lfo.start(i * step);
      osc.stop(i * step + step); lfo.stop(i * step + step);
    });
},
  'str-solo-cello': async function(ctx) {
    const notes = [220, 261.63, 293.66, 261.63, 220, 196];
    const step = 2.5 / notes.length;
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5.5;
      const lfG = ctx.createGain(); lfG.gain.value = 4;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.05, 0.05, 0.6, 0.08, step, 0.5);
      // Offset the envelope
      const delay = ctx.createDelay();
      delay.delayTime.value = 0;
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.5, i * step + 0.05);
      g.gain.setValueAtTime(0.4, i * step + step * 0.7);
      g.gain.linearRampToValueAtTime(0, i * step + step * 0.95);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(i * step); lfo.start(i * step);
      osc.stop(i * step + step); lfo.stop(i * step + step);
    });
},
  'str-chamber': async function(ctx) {
    const voices = 5;
    for (let v = 0; v < voices; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < voices/2 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 20;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3 + Math.random() * 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 3000;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.3, 0.6, 0.6, 3.0, 0.12);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(3.0); lfo.stop(3.0);
    }
},
  'str-orchestral-hit': async function(ctx) {
    [220, 220*1.26, 220*1.5, 220*2, 220*3].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.8);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
    const ns = createNoise(ctx, 0.05, 'white');
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.05);
    ns.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.05);
},
  'str-riser': async function(ctx) {
    [-5, 0, 5].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, 0);
      osc.frequency.exponentialRampToValueAtTime(220 * 4, 3.0);
      osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.2, 2.55);
      g.gain.linearRampToValueAtTime(0, 3.0);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    });
},
  'vox-chop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.3, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.3); lfo.stop(0.3);
},
  'vox-formant-ah': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-formant-oh': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 500, 900, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-formant-ee': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 300, 2300, 3000, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-formant-oo': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 300, 800, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-formant-aa': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 700, 1100, 2400, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-stab': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.2);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.2);
},
  'vox-rise': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, 0);
    osc.frequency.exponentialRampToValueAtTime(220 * 2, 1.0);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.7, 0.8);
    g.gain.linearRampToValueAtTime(0, 1.0);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'vox-fall': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, 0);
    osc.frequency.exponentialRampToValueAtTime(440 * 0.5, 1.0);
    const fm = createFormantFilter(ctx, osc, 500, 900, 2500, 100);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.linearRampToValueAtTime(0, 1.0);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'vox-yeah': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=8;
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.Q.value=8;
    bp1.frequency.setValueAtTime(300, 0); bp1.frequency.linearRampToValueAtTime(800, 0.15);
    bp2.frequency.setValueAtTime(2300, 0); bp2.frequency.linearRampToValueAtTime(1200, 0.15);
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.1, 0.5, 0.7);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'vox-hey': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=8;
    bp1.frequency.setValueAtTime(300, 0); bp1.frequency.linearRampToValueAtTime(800, 0.08000000000000002);
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.Q.value=8;
    bp2.frequency.value = 2300;
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'vox-oh': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 500, 900, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.6, 0.1, 0.6, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.6);
},
  'vox-uh': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 150;
    const fm = createFormantFilter(ctx, osc, 600, 1000, 2400, 120);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.6, 0.1, 0.4, 0.6);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'vox-whoah': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=8;
    bp1.frequency.setValueAtTime(300, 0); bp1.frequency.linearRampToValueAtTime(500, 0.4); bp1.frequency.linearRampToValueAtTime(800, 0.8);
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.Q.value=8;
    bp2.frequency.setValueAtTime(800, 0); bp2.frequency.linearRampToValueAtTime(900, 0.4); bp2.frequency.linearRampToValueAtTime(1200, 0.8);
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.6, 0.2, 0.8, 0.7);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'vox-breath': async function(ctx) {
    const ns = createNoise(ctx, 0.5, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 1;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.4, 0.15, 0.5, 0.3);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.5);
},
  'vox-whisper': async function(ctx) {
    const ns = createNoise(ctx, 0.6, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 5000; bp.Q.value = 1;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.4, 0.15, 0.6, 0.3);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.6);
},
  'vox-shout': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*2);}
    ws.curve = curve;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2800, 80);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    fm.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'vox-male-chop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 130;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.3, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.3); lfo.stop(0.3);
},
  'vox-female-chop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 330;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.3, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.3); lfo.stop(0.3);
},
  'vox-choir-ah': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < 3 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 15;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 120);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.3, 0.6, 0.5, 2.0, 0.1);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    }
},
  'vox-choir-oh': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < 3 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 15;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const fm = createFormantFilter(ctx, osc, 500, 900, 2500, 120);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.3, 0.6, 0.5, 2.0, 0.1);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    }
},
  'vox-choir-mm': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220 * (v < 3 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 15;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const fm = createFormantFilter(ctx, osc, 300, 600, 2000, 120);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.4, 0.3, 0.6, 0.5, 2.0, 0.1);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
    }
},
  'vox-pad': async function(ctx) {
    for (let v = 0; v < 4; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 220; osc.detune.value = (v - 2) * 8;
      const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 120);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.6, 0.8, 3.0, 0.12);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(3.0);
    }
},
  'vox-talkbox': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=10;
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.Q.value=10;
    const lfo1 = ctx.createOscillator(); lfo1.type='sine'; lfo1.frequency.value=1.5;
    const lfG1 = ctx.createGain(); lfG1.gain.value=300;
    lfo1.connect(lfG1); lfG1.connect(bp1.frequency); lfG1.connect(bp2.frequency);
    bp1.frequency.value = 600; bp2.frequency.value = 1500;
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.6, 0.2, 0.8, 0.7);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo1.start(0); osc.stop(0.8); lfo1.stop(0.8);
},
  'vox-glitch': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    for(let t = 0; t < 0.5; t += 0.03) g.gain.setValueAtTime(Math.random() > 0.4 ? 0.6 : 0, t);
    g.gain.setValueAtTime(0, 0.5);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'vox-stutter': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    for(let t = 0; t < 0.5; t += 0.05) {
      g.gain.setValueAtTime(0.6, t);
      g.gain.setValueAtTime(0, t + 0.025);
    }
    g.gain.setValueAtTime(0, 0.5);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.5);
},
  'vox-reverse': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.7, 0.68);
    g.gain.linearRampToValueAtTime(0, 0.8);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'vox-processed': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*8)/8;}
    ws.curve = curve;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.6, 0.1, 0.8, 0.5);
    fm.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'vox-filtered': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.Q.value = 5;
    lp.frequency.setValueAtTime(500, 0);
    lp.frequency.linearRampToValueAtTime(3000, 0.4);
    lp.frequency.linearRampToValueAtTime(500, 0.8);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.6, 0.15, 0.8, 0.6);
    fm.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'vox-pitched-up': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.6, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.6); lfo.stop(0.6);
},
  'vox-pitched-down': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 110;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5.5;
    const lfG = ctx.createGain(); lfG.gain.value = 3;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.7, 0.1, 0.6, 0.7);
    fm.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.6); lfo.stop(0.6);
},
  'vox-harmony': async function(ctx) {
    [220, 220*1.26, 220*1.5].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 5;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.6, 0.2, 1.0, 0.25);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
    });
},
  'vox-unison': async function(ctx) {
    [-8, -3, 0, 3, 8].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.6, 0.2, 1.0, 0.12);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(1.0);
    });
},
  'vox-echo': async function(ctx) {
    [0, 0.2, 0.4, 0.6].forEach((t, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220;
      const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 100);
      const g = ctx.createGain();
      const vol = 0.6 * Math.pow(0.5, i);
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.35);
    });
},
  'vox-robot': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const mod = ctx.createOscillator();
    mod.type = 'square'; mod.frequency.value = 30;
    const modG = ctx.createGain(); modG.gain.value = 1;
    const g = ctx.createGain(); g.gain.value = 0;
    mod.connect(modG); modG.connect(g.gain);
    const fm = createFormantFilter(ctx, osc, 800, 1200, 2500, 80);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.01, 0.05, 0.6, 0.1, 0.8, 0.7);
    fm.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); mod.start(0); osc.stop(0.8); mod.stop(0.8);
},
  'vox-vocoder': async function(ctx) {
    const ns = createNoise(ctx, 0.8, 'white');
    [300, 800, 1200, 2500, 3500].forEach(f => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 10;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.5, 0.1, 0.8, 0.1);
      ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    });
    ns.start(0); ns.stop(0.8);
},
  'vox-whistle': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 880;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 10;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.05, 0.6, 0.15, 0.8, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(0.8); lfo.stop(0.8);
},
  'vox-hum': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 2;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.2, 0.1, 0.7, 0.3, 1.5, 0.5);
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.5); lfo.stop(1.5);
},
  'vox-scat': async function(ctx) {
    const formants = [
      [800, 1200, 2500], [300, 2300, 3000], [500, 900, 2500], [800, 1200, 2500]
    ];
    const step = 1.0 / formants.length;
    formants.forEach((fmts, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220 * (1 + i * 0.1);
      const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.frequency.value=fmts[0]; bp1.Q.value=8;
      const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.frequency.value=fmts[1]; bp2.Q.value=8;
      const mix = ctx.createGain(); mix.gain.value = 0.5;
      osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.setValueAtTime(0, i * step);
      g.gain.linearRampToValueAtTime(0.5, i * step + 0.01);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.9);
      mix.connect(g); g.connect(ctx.destination);
      osc.start(i * step); osc.stop(i * step + step);
    });
},
  'vox-beatbox': async function(ctx) {
    // Kick at 0
    const k = ctx.createOscillator();
    k.type = 'sine';
    k.frequency.setValueAtTime(300, 0);
    k.frequency.exponentialRampToValueAtTime(50, 0.05);
    const kg = ctx.createGain();
    kg.gain.setValueAtTime(0.8, 0);
    kg.gain.exponentialRampToValueAtTime(0.001, 0.2);
    k.connect(kg); kg.connect(ctx.destination);
    k.start(0); k.stop(0.2);
    // Snare at 0.25
    const sn = createNoise(ctx, 0.15, 'white');
    const sf = ctx.createBiquadFilter();
    sf.type = 'bandpass'; sf.frequency.value = 5000; sf.Q.value = 2;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0, 0);
    sg.gain.setValueAtTime(0.6, 0.25);
    sg.gain.exponentialRampToValueAtTime(0.001, 0.4);
    sn.connect(sf); sf.connect(sg); sg.connect(ctx.destination);
    sn.start(0); sn.stop(1.0);
    // Hat at 0.5
    const hn = createNoise(ctx, 0.05, 'white');
    const hf = ctx.createBiquadFilter();
    hf.type = 'highpass'; hf.frequency.value = 8000;
    const hg = ctx.createGain();
    hg.gain.setValueAtTime(0, 0);
    hg.gain.setValueAtTime(0.4, 0.5);
    hg.gain.exponentialRampToValueAtTime(0.001, 0.55);
    hn.connect(hf); hf.connect(hg); hg.connect(ctx.destination);
    hn.start(0); hn.stop(1.0);
    // Kick at 0.75
    const k2 = ctx.createOscillator();
    k2.type = 'sine';
    k2.frequency.setValueAtTime(300, 0.75);
    k2.frequency.exponentialRampToValueAtTime(50, 0.8);
    const kg2 = ctx.createGain();
    kg2.gain.setValueAtTime(0, 0);
    kg2.gain.setValueAtTime(0.7, 0.75);
    kg2.gain.exponentialRampToValueAtTime(0.001, 0.95);
    k2.connect(kg2); kg2.connect(ctx.destination);
    k2.start(0.75); k2.stop(1.0);
},
  'perc-caxixi': async function(ctx) {
    const ns = createNoise(ctx, 0.12, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 7500; bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.12);
    ns.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.12);
},
  'perc-finger-cymbal': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 5000;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine'; osc2.frequency.value = 6300;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.8);
    osc.connect(g); osc2.connect(g); g.connect(ctx.destination);
    osc.start(0); osc2.start(0); osc.stop(0.8); osc2.stop(0.8);
},
  'perc-bell-tree': async function(ctx) {
    for(let i = 0; i < 12; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 2000 + i * 300;
      const g = ctx.createGain();
      const t = i * 0.08;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.5);
    }
},
  'bass-talking': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 55;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=8;
    bp1.frequency.setValueAtTime(400, 0);
    bp1.frequency.linearRampToValueAtTime(800, 0.4);
    bp1.frequency.linearRampToValueAtTime(400, 0.8);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 0.8, 0.7);
    osc.connect(bp1); bp1.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'synth-hoover': async function(ctx) {
    [-30, -15, 0, 15, 30].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      osc.frequency.setValueAtTime(150, 0);
      osc.frequency.exponentialRampToValueAtTime(220, 0.1);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.5, 0.2, 0.8, 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.8);
    });
},
  'synth-laser': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3000, 0);
    osc.frequency.exponentialRampToValueAtTime(100, 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.3);
},
  'pad-celestial': async function(ctx) {
    [440, 554.37, 659.26, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = f;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.1 * (i + 1);
      const lfG = ctx.createGain(); lfG.gain.value = 5;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.8, 0.5, 0.5, 1.0, 4.0, 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(4.0); lfo.stop(4.0);
    });
},
  'pad-aurora': async function(ctx) {
    [-15, -5, 0, 5, 15].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 220; osc.detune.value = d;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(300, 0);
      lp.frequency.linearRampToValueAtTime(2000, 2.0);
      lp.frequency.linearRampToValueAtTime(300, 4.0);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.8, 0.5, 0.6, 1.0, 4.0, 0.12);
      osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(4.0);
    });
},
  'lead-distorted': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 440;
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*5);}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.005, 0.05, 0.7, 0.1, 0.8, 0.6);
    osc.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'lead-trance': async function(ctx) {
    [-20, -7, 0, 7, 20].forEach(d => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth'; osc.frequency.value = 440; osc.detune.value = d;
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.6, 0.15, 1.0, 0.15);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(1.0);
    });
},
  'fx-cinematic-boom': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, 0);
    osc.frequency.exponentialRampToValueAtTime(15, 2.0);
    const ns = createNoise(ctx, 0.3, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass'; nf.frequency.value = 500;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.8, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 2.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(2.0);
},
  'fx-wobble': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 80;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 3;
    const lfG = ctx.createGain(); lfG.gain.value = 600;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 500; filt.Q.value = 12;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.0, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
},
  'fx-pitch-drop': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2000, 0);
    osc.frequency.exponentialRampToValueAtTime(30, 1.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 1.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.0);
},
  'guitar-12string': async function(ctx) {
    const freqs = [261.63, 329.63, 392];
    freqs.forEach((f, idx) => {
      [f, f * 2.01].forEach((freq, pair) => {
        const src = karplusStrong(ctx, freq, 2.0, 0.003, 3000, 0.45);
        const g = ctx.createGain();
        const offset = idx * 0.015;
        g.gain.setValueAtTime(0, 0);
        g.gain.setValueAtTime(0, offset);
        g.gain.linearRampToValueAtTime(0.35, offset + 0.005);
        g.gain.exponentialRampToValueAtTime(0.01, 2.0);
        src.connect(g); g.connect(ctx.destination);
        src.start(offset);
      });
    });
},
  'guitar-feedback': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 1200;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 4;
    const lfG = ctx.createGain(); lfG.gain.value = 20;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.5, 0.5);
    g.gain.setValueAtTime(0.5, 1.5);
    g.gain.linearRampToValueAtTime(0, 2.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
},
  'piano-jazz-chord': async function(ctx) {
    [261.63, 329.63, 415.30, 493.88].forEach(f => {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = f * 2;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(f * 1.5, 0);
      modG.gain.exponentialRampToValueAtTime(f * 0.1, 1.5);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = f;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.35, 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, 1.5);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(1.5); car.stop(1.5);
    });
},
  'piano-ballad': async function(ctx) {
    const mod = ctx.createOscillator();
    mod.type = 'sine'; mod.frequency.value = 261.63;
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(261.63 * 0.8, 0);
    modG.gain.exponentialRampToValueAtTime(261.63 * 0.05, 2.0);
    const car = ctx.createOscillator();
    car.type = 'sine'; car.frequency.value = 261.63;
    mod.connect(modG); modG.connect(car.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.5, 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, 2.0);
    car.connect(g); g.connect(ctx.destination);
    mod.start(0); car.start(0); mod.stop(2.0); car.stop(2.0);
},
  'str-epic-hit': async function(ctx) {
    [220, 277.18, 329.63, 440, 659.26].forEach(f => {
      [-10, 0, 10].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.06, 0);
        g.gain.exponentialRampToValueAtTime(0.001, 1.0);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 5000;
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(1.0);
      });
    });
    const ns = createNoise(ctx, 0.08, 'white');
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.08);
    ns.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.08);
},
  'str-tremolo-low': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 130.81;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 10;
    const lfG = ctx.createGain(); lfG.gain.value = 0.35;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2000;
    const g = ctx.createGain(); g.gain.value = 0.4;
    lfo.connect(lfG); lfG.connect(g.gain);
    const out = ctx.createGain();
    applyEnvelope(ctx, out.gain, 0.2, 0.2, 0.7, 0.4, 2.0, 0.6);
    osc.connect(lp); lp.connect(g); g.connect(out); out.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(2.0); lfo.stop(2.0);
},
  'vox-formant-ey': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const bp1 = ctx.createBiquadFilter(); bp1.type='bandpass'; bp1.Q.value=8;
    bp1.frequency.setValueAtTime(300, 0); bp1.frequency.linearRampToValueAtTime(800, 0.4);
    const bp2 = ctx.createBiquadFilter(); bp2.type='bandpass'; bp2.Q.value=8;
    bp2.frequency.setValueAtTime(2300, 0); bp2.frequency.linearRampToValueAtTime(1200, 0.4);
    const mix = ctx.createGain(); mix.gain.value = 0.5;
    osc.connect(bp1); osc.connect(bp2); bp1.connect(mix); bp2.connect(mix);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.02, 0.05, 0.6, 0.1, 0.8, 0.7);
    mix.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.8);
},
  'vox-deep-choir': async function(ctx) {
    for (let v = 0; v < 6; v++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 110 * (v < 3 ? 1 : 2);
      osc.detune.value = (Math.random() - 0.5) * 15;
      const lfo = ctx.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 4.5 + Math.random() * 2;
      const lfG = ctx.createGain(); lfG.gain.value = 3;
      lfo.connect(lfG); lfG.connect(osc.frequency);
      const fm = createFormantFilter(ctx, osc, 600, 1000, 2500, 120);
      const g = ctx.createGain();
      applyEnvelope(ctx, g.gain, 0.5, 0.3, 0.6, 0.5, 2.5, 0.1);
      fm.connect(g); g.connect(ctx.destination);
      osc.start(0); lfo.start(0); osc.stop(2.5); lfo.stop(2.5);
    }
},
  'synth-detuned-chord': async function(ctx) {
    [220, 277.18, 329.63].forEach(f => {
      [-15, 0, 15].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const g = ctx.createGain();
        applyEnvelope(ctx, g.gain, 0.02, 0.1, 0.5, 0.2, 1.0, 0.08);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); osc.stop(1.0);
      });
    });
},
  'synth-wobble': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 5;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 800; filt.Q.value = 10;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.0, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
},
  'bass-dubstep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 50;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 2;
    const lfG = ctx.createGain(); lfG.gain.value = 1000;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 500; filt.Q.value = 15;
    lfo.connect(lfG); lfG.connect(filt.frequency);
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.tanh(x*3);}
    ws.curve = curve;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.0, 0.7);
    osc.connect(filt); filt.connect(ws); ws.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
},
  'bass-808-long': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, 0);
    osc.frequency.exponentialRampToValueAtTime(40, 0.06);
    const g = ctx.createGain();
    g.gain.setValueAtTime(1, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 2.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(2.0);
},
  'fx-warble': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 800;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 8;
    const lfG = ctx.createGain(); lfG.gain.value = 200;
    lfo.connect(lfG); lfG.connect(osc.frequency);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.05, 0.1, 0.5, 0.2, 1.0, 0.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); lfo.start(0); osc.stop(1.0); lfo.stop(1.0);
},
  'fx-crunch': async function(ctx) {
    const ns = createNoise(ctx, 0.3, 'white');
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for(let i=0;i<256;i++){const x=i*2/255-1;curve[i]=Math.round(x*3)/3;}
    ws.curve = curve;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.3);
    ns.connect(ws); ws.connect(bp); bp.connect(g); g.connect(ctx.destination);
    ns.start(0); ns.stop(0.3);
},
  'fx-power-down': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1000, 0);
    osc.frequency.exponentialRampToValueAtTime(10, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.4, 0);
    g.gain.linearRampToValueAtTime(0, 1.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'fx-power-up': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(50, 0);
    osc.frequency.exponentialRampToValueAtTime(2000, 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.4, 1.3);
    g.gain.linearRampToValueAtTime(0, 1.5);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'fx-metal-hit': async function(ctx) {
    [587.3, 845.1, 1174, 1567].forEach(f => {
      const osc = ctx.createOscillator();
      osc.type = 'square'; osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, 0);
      g.gain.exponentialRampToValueAtTime(0.001, 0.5);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(0); osc.stop(0.5);
    });
    const ns = createNoise(ctx, 0.02, 'white');
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.02);
    ns.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.02);
},
  'guitar-harmonics-natural': async function(ctx) {
    [329.63, 659.26, 987.77, 1318.51].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, i * 0.15);
      g.gain.linearRampToValueAtTime(0.3, i * 0.15 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, i * 0.15 + 1.0);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(i * 0.15); osc.stop(i * 0.15 + 1.0);
    });
},
  'guitar-octave-riff': async function(ctx) {
    const notes = [164.81, 329.63, 164.81, 329.63, 196, 392];
    const step = 1.0 / notes.length;
    notes.forEach((f, i) => {
      const src = karplusStrong(ctx, f, step * 0.9, 0.004, 2000, 0.6);
      const ws = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for(let j=0;j<256;j++){const x=j*2/255-1;curve[j]=Math.tanh(x*2);}
      ws.curve = curve;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, i * step);
      g.gain.exponentialRampToValueAtTime(0.01, i * step + step * 0.85);
      src.connect(ws); ws.connect(g); g.connect(ctx.destination);
      src.start(i * step);
    });
},
  'piano-ambient': async function(ctx) {
    [261.63, 392, 523.25].forEach(f => {
      const mod = ctx.createOscillator();
      mod.type = 'sine'; mod.frequency.value = f;
      const modG = ctx.createGain();
      modG.gain.setValueAtTime(f * 0.5, 0);
      modG.gain.exponentialRampToValueAtTime(f * 0.02, 3.0);
      const car = ctx.createOscillator();
      car.type = 'sine'; car.frequency.value = f;
      mod.connect(modG); modG.connect(car.frequency);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, 0);
      g.gain.linearRampToValueAtTime(0.3, 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, 3.0);
      car.connect(g); g.connect(ctx.destination);
      mod.start(0); car.start(0); mod.stop(3.0); car.stop(3.0);
    });
},
  'str-cinematic-swell': async function(ctx) {
    [220, 277.18, 329.63, 440].forEach(f => {
      [-8, 0, 8].forEach(d => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth'; osc.frequency.value = f; osc.detune.value = d;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine'; lfo.frequency.value = 5;
        const lfG = ctx.createGain(); lfG.gain.value = 3;
        lfo.connect(lfG); lfG.connect(osc.frequency);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(0.04, 2.5);
        g.gain.linearRampToValueAtTime(0, 4.0);
        osc.connect(lp); lp.connect(g); g.connect(ctx.destination);
        osc.start(0); lfo.start(0); osc.stop(4.0); lfo.stop(4.0);
      });
    });
},
  'perc-808-tom': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, 0);
    osc.frequency.exponentialRampToValueAtTime(100, 0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.4);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.4);
},
  'perc-electronic-tom': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, 0);
    osc.frequency.exponentialRampToValueAtTime(150, 0.03);
    const ns = createNoise(ctx, 0.02, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'highpass'; nf.frequency.value = 3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.02);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.02);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.8, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.35);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.35);
},
  'perc-snap-808': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, 0);
    osc.frequency.exponentialRampToValueAtTime(800, 0.02);
    const ns = createNoise(ctx, 0.05, 'white');
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 4000; nf.Q.value = 5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, 0);
    ng.gain.exponentialRampToValueAtTime(0.001, 0.05);
    ns.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    ns.start(0); ns.stop(0.05);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, 0);
    g.gain.exponentialRampToValueAtTime(0.001, 0.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(0.1);
},
  'bass-sine-sub': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 35;
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.05, 0.8, 0.3, 1.5, 0.8);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
  'fx-riseset': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, 0);
    osc.frequency.exponentialRampToValueAtTime(3000, 1.5);
    osc.frequency.exponentialRampToValueAtTime(100, 3.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, 0);
    g.gain.linearRampToValueAtTime(0.6, 1.5);
    g.gain.linearRampToValueAtTime(0, 3.0);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(3.0);
},
  'synth-reso-sweep': async function(ctx) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = 220;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.Q.value = 15;
    filt.frequency.setValueAtTime(100, 0);
    filt.frequency.exponentialRampToValueAtTime(5000, 0.75);
    filt.frequency.exponentialRampToValueAtTime(100, 1.5);
    const g = ctx.createGain();
    applyEnvelope(ctx, g.gain, 0.01, 0.1, 0.7, 0.2, 1.5, 0.6);
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(0); osc.stop(1.5);
},
};

// ============ SOUND LIBRARY API ============
const SoundLibrary = {
  sounds: SOUNDS,
  _cache: new Map(),
  ctx: null,

  init(audioCtx) {
    this.ctx = audioCtx;
  },

  getCollections() {
    const map = {};
    this.sounds.forEach(s => {
      if (!map[s.collection]) map[s.collection] = { id: s.collection.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: s.collection, count: 0 };
      map[s.collection].count++;
    });
    return Object.values(map);
  },

  getSounds(category) {
    if (!category) return this.sounds;
    return this.sounds.filter(s => s.category === category);
  },

  getSoundById(id) {
    return this.sounds.find(s => s.id === id);
  },

  searchSounds(query) {
    if (!query) return this.sounds;
    const q = query.toLowerCase();
    const terms = q.split(/\s+/);
    return this.sounds.filter(s => {
      const name = s.name.toLowerCase();
      const cat = s.category.toLowerCase();
      const col = s.collection.toLowerCase();
      const text = name + ' ' + cat + ' ' + col + ' ' + s.id;
      return terms.every(t => text.includes(t));
    }).sort((a, b) => {
      const aExact = a.name.toLowerCase().includes(q) ? 0 : 1;
      const bExact = b.name.toLowerCase().includes(q) ? 0 : 1;
      return aExact - bExact;
    });
  },

  async generateSound(id) {
    if (this._cache.has(id)) return this._cache.get(id);
    const sound = this.getSoundById(id);
    if (!sound) return null;
    const recipe = RECIPES[id];
    if (!recipe) return null;
    const sampleRate = 44100;
    const length = Math.ceil(sound.duration * sampleRate);
    const offline = new OfflineAudioContext(2, length, sampleRate);
    await recipe(offline);
    const buffer = await offline.startRendering();
    this._cache.set(id, buffer);
    return buffer;
  }
};

window.soundLibrary = SoundLibrary;

})();