// Generator script - run with: node gen-templates.js
// Outputs js/templates.js

const fs = require('fs');

const defs = [
  // DnB
  {n:'Midnight Runner',c:'Drum and Bass',bpm:174,rows:10,p:[[1,'kick-dnb',[0,2.5],8],[2,'snare-dnb',[1],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'hat-open',[1.5,3.5],8,.5],[5,'bass-reese',[0],8,2],[6,'synth-saw-stab',[0,2],4,1],[7,'pad-dark',[0],4,4],[8,'fx-riser-up',[0],2,4],[9,'perc-shaker',[.5,1.5,2.5,3.5],8,.5],[10,'clap-big',[1],4]]},
  {n:'Jungle Warfare',c:'Drum and Bass',bpm:170,rows:10,p:[[1,'kick-dnb',[0,1.75,2.5],8],[2,'snare-tight',[1,3],8],[3,'hat-closed',[0,.25,.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75],8,.25],[4,'perc-bongo-high',[.5,2.5],8,.5],[5,'perc-bongo-low',[1.5,3.5],8,.5],[6,'bass-wobble',[0,2],8,2],[7,'pad-ambient',[0],4,8],[8,'lead-saw',[0,1,2,3],4,1],[9,'fx-impact',[0],1,4],[10,'clap-reverb',[1,3],8]]},
  {n:'Liquid Skies',c:'Drum and Bass',bpm:176,rows:10,p:[[1,'kick-deep',[0,2.5],8],[2,'snare-fat',[1],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-house',[1],8],[5,'bass-sub',[0,2],8,2],[6,'piano-electric',[0,1,2,3],4,2],[7,'pad-warm',[0],4,8],[8,'lead-portamento',[0,2],4,2],[9,'str-violin-sustained',[0],2,8],[10,'vox-chop',[3],4,1]]},
  {n:'Neurofunk Lab',c:'Drum and Bass',bpm:178,rows:10,p:[[1,'kick-distorted',[0,2.5],8],[2,'snare-dnb',[1,3],8],[3,'hat-metallic',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-tom-low',[2.5,3],4],[5,'bass-reese',[0,1,2,3],8,1],[6,'synth-square-stab',[0,2],4,1],[7,'fx-sweep-up',[0],2,4],[8,'lead-acid',[0,.5,2,2.5],4,.5],[9,'clap-tight',[1,3],8],[10,'fx-impact',[0],1,4]]},
  {n:'Amen Break Edit',c:'Drum and Bass',bpm:172,rows:8,p:[[1,'kick-dnb',[0,.75,2.5],8],[2,'snare-tight',[1,2,3.5],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'hat-open',[3.5],8,.5],[5,'bass-deep',[0,2],8,2],[6,'synth-chord-stab',[0],4,4],[7,'pad-shimmer',[0],2,16],[8,'perc-ride',[0,1,2,3],8,1]]},
  {n:'Rollers',c:'Drum and Bass',bpm:174,rows:9,p:[[1,'kick-punchy',[0,2],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-shaker',[.25,.75,1.25,1.75,2.25,2.75,3.25,3.75],8,.25],[5,'bass-wobble',[0,1,2,3],8,1],[6,'synth-super-saw',[0,2],4,2],[7,'pad-dark',[0],4,8],[8,'fx-riser-down',[0],1,8],[9,'clap-layered',[1],8]]},
  {n:'Darkside',c:'Drum and Bass',bpm:172,rows:10,p:[[1,'kick-hard',[0,2.5],8],[2,'snare-dnb',[1],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-tom-mid',[3,3.5],4,.5],[5,'bass-acid',[0,.5,2,2.5],8,.5],[6,'synth-saw-stab',[0],4,1],[7,'pad-ambient',[0],4,8],[8,'lead-detuned',[0,2],4,2],[9,'fx-sweep-down',[0],2,4],[10,'clap-reverb',[1],4]]},
  {n:'Soul Stepper',c:'Drum and Bass',bpm:170,rows:10,p:[[1,'kick-house',[0,2.5],8],[2,'snare-clap',[1],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-conga-high',[.5,2.5],8,.5],[5,'bass-sub',[0],8,4],[6,'piano-grand-chord',[0,2],4,4],[7,'str-cello-sustained',[0],2,16],[8,'vox-female-ooh',[0],2,4],[9,'sax-smooth-jazz',[0,2],4,2],[10,'clap-house',[1],8]]},
  {n:'Steppa Dub',c:'Drum and Bass',bpm:168,rows:10,p:[[1,'kick-808',[0,2],8],[2,'snare-rimshot',[1,3],8],[3,'hat-pedal',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-cowbell',[1.5,3.5],8,.5],[5,'bass-deep',[0,.75,2,2.75],8,.75],[6,'guitar-clean-strum-minor',[0],4,4],[7,'pad-string',[0],4,8],[8,'fx-riser-up',[0],1,8],[9,'vox-male-hey',[0],4,1],[10,'perc-tambourine',[.5,1.5,2.5,3.5],8,.5]]},
  {n:'Tearout',c:'Drum and Bass',bpm:180,rows:8,p:[[1,'kick-distorted',[0,.5,2.5],8],[2,'snare-dnb',[1,3],8],[3,'hat-closed',[0,.25,.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75],8,.25],[4,'perc-tom-high',[2.75,3,3.25,3.5,3.75],4,.25],[5,'bass-reese',[0,.5,1,2,2.5,3],8,.5],[6,'synth-square-stab',[0,2],4,.5],[7,'fx-impact',[0],1,4],[8,'drop-sub-boom',[0],1,4]]},
  // House
  {n:'Deep Groover',c:'House',bpm:126,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-house',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'hat-open',[1.5,3.5],4,.5],[5,'bass-deep',[0,1.5,2.5],8,1],[6,'synth-chord-stab',[0,2],4,2],[7,'pad-warm',[0],4,8],[8,'perc-shaker',[.25,.75,1.25,1.75,2.25,2.75,3.25,3.75],8,.25],[9,'vox-chop',[3.5],4,.5],[10,'piano-electric',[0,2],4,2]]},
  {n:'Sunset Terrace',c:'House',bpm:124,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-tight',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-conga-high',[.5,1,2.5,3],8,.5],[5,'bass-sub',[0,2],8,2],[6,'piano-grand-chord',[0,1.5,2,3.5],4,1],[7,'pad-shimmer',[0],4,8],[8,'str-violin-sustained',[0],2,16],[9,'sax-smooth-jazz',[0,2],4,2],[10,'vox-female-ooh',[0],4,2]]},
  {n:'Tech Minimal',c:'House',bpm:128,rows:8,p:[[1,'kick-techno',[0,1,2,3],8],[2,'clap-tight',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-rimshot',[.5,2.5],8,.5],[5,'bass-acid',[0,.5,1,2,2.5,3],8,.5],[6,'synth-saw-stab',[0,2.5],4,.5],[7,'fx-sweep-up',[0],2,4],[8,'perc-cowbell',[1.5,3.5],8,.5]]},
  {n:'Disco Revival',c:'House',bpm:122,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-big',[1,3],8],[3,'hat-open',[.5,1.5,2.5,3.5],8,.5],[4,'perc-tambourine',[.5,1.5,2.5,3.5],8,.5],[5,'bass-sub',[0,.75,2,2.75],8,.75],[6,'guitar-funky-muted',[0,.5,1,1.5,2,2.5,3,3.5],4,.5],[7,'synth-organ-stab',[0,2],4,2],[8,'str-ensemble-sustain',[0],4,8],[9,'sax-tenor-long',[0],4,4],[10,'vox-female-hey',[3.5],4,.5]]},
  {n:'Garage Swing',c:'House',bpm:130,rows:9,p:[[1,'kick-garage',[0,2.5],8],[2,'snare-tight',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-house',[1,3],8],[5,'bass-deep',[0,2],8,2],[6,'synth-chord-stab',[0,1.5,2.5],4,1],[7,'pad-warm',[0],4,8],[8,'vox-chop',[1.5,3.5],4,.5],[9,'perc-conga-low',[2.5,3.5],8,.5]]},
  {n:'Acid House',c:'House',bpm:126,rows:8,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-tight',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'hat-open',[3.5],8,.5],[5,'bass-acid',[0,.5,1.5,2,3,3.5],8,.5],[6,'synth-saw-stab',[0,2],4,1],[7,'fx-riser-up',[0],2,4],[8,'perc-shaker',[.25,1.25,2.25,3.25],8,.25]]},
  {n:'Afro House',c:'House',bpm:122,rows:10,p:[[1,'kick-deep',[0,2],8],[2,'snare-rimshot',[1.5,3.5],8,.5],[3,'hat-shaker',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-djembe',[0,.75,1.5,2,2.75,3.5],8,.5],[5,'perc-bongo-high',[.5,1,2.5,3],8,.5],[6,'bass-sub',[0,2],8,2],[7,'guitar-acoustic-strum',[0,2],4,2],[8,'pad-ambient',[0],4,8],[9,'vox-male-oh',[0],4,2],[10,'perc-conga-slap',[1,3],8,.5]]},
  {n:'Progressive Layers',c:'House',bpm:128,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-layered',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-shaker',[0,.5,1,1.5,2,2.5,3,3.5],8,.25],[5,'bass-deep',[0,2],8,2],[6,'synth-super-saw',[0],4,4],[7,'pad-shimmer',[0],4,8],[8,'lead-saw',[0,1,2,3],4,1],[9,'buildup-filter-sweep',[0],1,8],[10,'fx-riser-up',[0],1,8]]},
  {n:'Latin Groove',c:'House',bpm:124,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'clap-house',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-conga-high',[0,1,1.5,2.5,3],8,.5],[5,'perc-conga-low',[.5,2],8,.5],[6,'bass-sub',[0,1.5,2.5],8,1],[7,'piano-latin',[0,.5,1.5,2,3],4,.5],[8,'sax-alto-stab',[0,2],4,1],[9,'perc-guiro',[0,1,2,3],8,.5],[10,'vox-female-ah',[0],4,2]]},
  {n:'Warehouse Rave',c:'House',bpm:130,rows:8,p:[[1,'kick-hard',[0,1,2,3],8],[2,'clap-big',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'hat-open',[.5,2.5],8,.5],[5,'bass-wobble',[0,2],8,2],[6,'synth-chord-stab',[0,.5,2,2.5],4,.5],[7,'fx-impact',[0],1,4],[8,'vox-male-yeah',[3],4,1]]},
  // Dubstep
  {n:'Wub Machine',c:'Dubstep',bpm:140,rows:10,p:[[1,'kick-dubstep',[0,2.5],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-big',[1,3],8],[5,'bass-wobble',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[6,'synth-saw-stab',[0,2],4,1],[7,'pad-dark',[0],4,8],[8,'fx-impact',[0],1,4],[9,'drop-sub-boom',[0],1,4],[10,'fx-riser-up',[0],2,4]]},
  {n:'Riddim Bounce',c:'Dubstep',bpm:140,rows:8,p:[[1,'kick-dubstep',[0,2.5],8],[2,'snare-tight',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'clap-tight',[1,3],8],[5,'bass-reese',[0,.5,1,2,2.5,3],8,.5],[6,'synth-square-stab',[0,2],4,.5],[7,'fx-sweep-down',[0],2,4],[8,'drop-impact-hit',[0],1,4]]},
  {n:'Melodic Dub',c:'Dubstep',bpm:140,rows:10,p:[[1,'kick-deep',[0,2.5],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-reverb',[1,3],8],[5,'bass-sub',[0,2],8,2],[6,'lead-portamento',[0,1,2,3],4,1],[7,'pad-shimmer',[0],4,8],[8,'piano-grand-chord',[0,2],4,4],[9,'vox-female-ooh',[0],4,4],[10,'str-violin-sustained',[0],2,16]]},
  {n:'Tearout Bass',c:'Dubstep',bpm:142,rows:8,p:[[1,'kick-distorted',[0,.5,2.5],8],[2,'snare-dnb',[1,3],8],[3,'hat-metallic',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-tom-low',[3,3.25,3.5,3.75],4,.25],[5,'bass-wobble',[0,.25,.5,1,2,2.25,2.5,3],8,.25],[6,'synth-saw-stab',[0],4,1],[7,'drop-hard-kick',[0],1,4],[8,'fx-impact',[0],1,4]]},
  {n:'Chillstep',c:'Dubstep',bpm:138,rows:10,p:[[1,'kick-deep',[0,2.5],8],[2,'snare-clap',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-shaker',[0,.5,1,1.5,2,2.5,3,3.5],8,.25],[5,'bass-sub',[0,2],8,2],[6,'piano-grand-chord',[0,2],4,4],[7,'pad-warm',[0],4,16],[8,'lead-saw',[0,2],4,2],[9,'vox-female-ah',[0],4,4],[10,'str-ensemble-sustain',[0],4,8]]},
  {n:'Brostep Fury',c:'Dubstep',bpm:150,rows:10,p:[[1,'kick-distorted',[0,2.5],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-big',[1,3],8],[5,'bass-wobble',[0,.25,.5,.75,2,2.25,2.5,2.75],8,.25],[6,'bass-reese',[1,3],8,1],[7,'synth-super-saw',[0],4,4],[8,'fx-impact',[0],1,4],[9,'drop-metal-crash',[0],1,4],[10,'buildup-snare-roll',[0],1,4]]},
  {n:'Deep Dub',c:'Dubstep',bpm:140,rows:9,p:[[1,'kick-sub',[0,2.5],8],[2,'snare-clap',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-conga-low',[.5,2.5],8,.5],[5,'bass-deep',[0,1,2,3],8,1],[6,'synth-chord-stab',[0,2],4,2],[7,'pad-dark',[0],4,8],[8,'fx-sweep-up',[0],2,4],[9,'vox-male-hum',[0],4,4]]},
  {n:'Future Bass',c:'Dubstep',bpm:144,rows:10,p:[[1,'kick-808',[0,2.5],8],[2,'snare-clap',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'clap-layered',[1,3],8],[5,'bass-sub',[0,2],8,2],[6,'synth-super-saw',[0,2],4,2],[7,'pad-shimmer',[0],4,8],[8,'lead-detuned',[0,1,2,3],4,1],[9,'vox-chop',[.5,1.5,2.5,3.5],4,.5],[10,'piano-electric',[0,2],4,2]]},
  {n:'Headbanger',c:'Dubstep',bpm:148,rows:8,p:[[1,'kick-dubstep',[0,.5,2.5],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-tom-high',[3,3.25,3.5,3.75],4,.25],[5,'bass-wobble',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[6,'drop-bass-stab',[0,2],4,1],[7,'fx-impact',[0],1,4],[8,'drop-sub-boom',[0],1,4]]},
  {n:'Dub Garden',c:'Dubstep',bpm:136,rows:10,p:[[1,'kick-deep',[0,2.5],8],[2,'snare-rimshot',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-tambourine',[.5,1.5,2.5,3.5],8,.5],[5,'bass-sub',[0,2],8,2],[6,'guitar-clean-strum-major',[0,2],4,2],[7,'pad-ambient',[0],4,16],[8,'lead-square',[0,1,2,3],4,1],[9,'vox-female-hey',[0],4,1],[10,'fx-sweep-up',[0],2,4]]},
  // Electronic
  {n:'Synthwave Drive',c:'Electronic',bpm:118,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'snare-clap',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-tom-low',[3.5],4,.5],[5,'bass-deep',[0,.5,2,2.5],8,.5],[6,'synth-super-saw',[0,2],4,2],[7,'pad-warm',[0],4,8],[8,'lead-portamento',[0,1,2,3],4,1],[9,'synth-organ-stab',[0,2],4,2],[10,'fx-riser-up',[0],2,4]]},
  {n:'Ambient Pulse',c:'Electronic',bpm:100,rows:8,p:[[1,'kick-soft',[0,2],8],[2,'perc-shaker',[.5,1.5,2.5,3.5],8,.25],[3,'hat-closed',[1,3],8,.5],[4,'pad-ambient',[0],4,16],[5,'pad-shimmer',[0],8,8],[6,'piano-grand-c',[0,2],4,2],[7,'str-violin-sustained',[0],4,16],[8,'fx-sweep-up',[0],2,8]]},
  {n:'Trap Lord',c:'Electronic',bpm:140,rows:10,p:[[1,'kick-808',[0,2.5],8],[2,'snare-trap',[1,3],8],[3,'hat-closed',[0,.25,.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.25,3.5,3.75],8,.25],[4,'hat-open',[1.5,3.5],8,.5],[5,'bass-808',[0,2],8,2],[6,'synth-chord-stab',[0,2],4,2],[7,'lead-saw',[0,2],4,2],[8,'clap-big',[1,3],8],[9,'vox-male-hey',[0],4,1],[10,'fx-impact',[0],2,2]]},
  {n:'Lo-Fi Chill',c:'Electronic',bpm:85,rows:10,p:[[1,'kick-vinyl',[0,2.5],8],[2,'snare-rimshot',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-shaker',[0,1,2,3],8,.25],[5,'bass-sub',[0,2],8,2],[6,'piano-electric',[0,1,2,3],4,1],[7,'pad-warm',[0],4,16],[8,'guitar-clean-strum-major',[0,2],4,2],[9,'str-violin-pizzicato',[0,1,2,3],4,1],[10,'vox-female-ooh',[0],4,4]]},
  {n:'Trance Energy',c:'Electronic',bpm:138,rows:10,p:[[1,'kick-techno',[0,1,2,3],8],[2,'clap-tight',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'hat-open',[.5,2.5],8,.5],[5,'bass-deep',[0,.5,2,2.5],8,.5],[6,'synth-super-saw',[0],4,4],[7,'pad-shimmer',[0],4,16],[8,'lead-detuned',[0,1,2,3],4,1],[9,'buildup-white-riser',[0],1,8],[10,'fx-riser-up',[0],2,4]]},
  {n:'Glitch Hop',c:'Electronic',bpm:110,rows:10,p:[[1,'kick-punchy',[0,.75,2.5],8],[2,'snare-fat',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-tom-mid',[.5,2.5],8,.5],[5,'bass-wobble',[0,1,2,3],8,1],[6,'synth-square-stab',[0,.5,2,2.5],4,.5],[7,'lead-acid',[0,2],4,1],[8,'pad-dark',[0],4,8],[9,'vox-chop',[1.5,3.5],4,.5],[10,'fx-sweep-down',[0],2,4]]},
  {n:'Downtempo Bliss',c:'Electronic',bpm:90,rows:10,p:[[1,'kick-soft',[0,2],8],[2,'snare-rimshot',[1,3],8],[3,'hat-closed',[.5,1.5,2.5,3.5],8,.5],[4,'perc-tambourine',[.5,1.5,2.5,3.5],8,.25],[5,'bass-sub',[0,2],8,2],[6,'piano-upright-chord',[0,2],4,2],[7,'pad-warm',[0],4,16],[8,'str-cello-sustained',[0],4,16],[9,'sax-tenor-long',[0],4,4],[10,'vox-female-ah',[0],4,4]]},
  {n:'Electro Funk',c:'Electronic',bpm:120,rows:10,p:[[1,'kick-house',[0,1,2,3],8],[2,'snare-clap',[1,3],8],[3,'hat-open',[.5,1.5,2.5,3.5],8,.5],[4,'clap-house',[1,3],8],[5,'bass-acid',[0,.5,1,2,2.5,3],8,.5],[6,'guitar-funky-muted',[0,.5,1,1.5,2,2.5,3,3.5],4,.5],[7,'synth-organ-stab',[0,2],4,2],[8,'lead-square',[0,1,2,3],4,1],[9,'sax-alto-stab',[0,2],4,1],[10,'vox-male-yeah',[3],4,1]]},
  {n:'Breakbeat Science',c:'Electronic',bpm:132,rows:10,p:[[1,'kick-punchy',[0,.75,2.5],8],[2,'snare-tight',[1,2,3.5],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'hat-open',[3.5],8,.5],[5,'perc-tom-low',[2.75,3],4,.5],[6,'bass-deep',[0,2],8,2],[7,'synth-saw-stab',[0,2],4,1],[8,'pad-ambient',[0],4,8],[9,'lead-detuned',[0,1,2,3],4,1],[10,'fx-riser-up',[0],2,4]]},
  {n:'Techno Bunker',c:'Electronic',bpm:135,rows:8,p:[[1,'kick-techno',[0,1,2,3],8],[2,'clap-tight',[1,3],8],[3,'hat-closed',[0,.5,1,1.5,2,2.5,3,3.5],8,.5],[4,'perc-rimshot',[.5,2.5],8,.5],[5,'bass-acid',[0,.5,1.5,2,3],8,.5],[6,'synth-saw-stab',[0,2],4,.5],[7,'fx-sweep-up',[0],2,4],[8,'perc-cowbell',[1,3],8,.5]]},
];

// Build output
let out = [];
out.push('(function () {');
out.push('  var _bid = 0;');
out.push('  function B(r,s,st,d){_bid++;return{id:"tb"+_bid,rowId:r,soundId:s,startBeat:st,durationBeats:d||1,repeatCount:1,options:{}};}');
out.push('  function makeRows(n){var r=[];for(var i=1;i<=n;i++)r.push({id:"r"+i,number:i,muted:false,solo:false});return r;}');
out.push('  function rep(r,s,beats,bars,d){var bl=[];for(var b=0;b<bars;b++)for(var i=0;i<beats.length;i++)bl.push(B(r,s,b*4+beats[i],d||1));return bl;}');
out.push('  var T=[];');

for (const d of defs) {
  const parts = d.p.map(p => {
    const dur = p.length > 4 ? ','+p[4] : '';
    return `rep("r${p[0]}","${p[1]}",[${p[2]}],${p[3]}${dur})`;
  });
  out.push(`  T.push({name:${JSON.stringify(d.n)},category:${JSON.stringify(d.c)},data:{bpm:${d.bpm},rows:makeRows(${d.rows}),blocks:[].concat(${parts.join(',')})}});`);
}

out.push('  window.templates=T;');
out.push('');
out.push(`  function openTemplateModal(){
    var ex=document.getElementById("template-modal");
    if(ex){ex.remove();var bg=document.getElementById("template-backdrop");if(bg)bg.remove();return;}
    var bd=document.createElement("div");bd.id="template-backdrop";
    bd.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:499;";
    var m=document.createElement("div");m.id="template-modal";
    m.style.cssText="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a2e;border:1px solid #3a3a5c;border-radius:12px;padding:24px;z-index:500;max-height:70vh;overflow-y:auto;width:500px;box-shadow:0 20px 60px rgba(0,0,0,0.6);";
    var h=document.createElement("h2");h.textContent="Templates ("+T.length+")";
    h.style.cssText="color:#00d4aa;margin:0 0 16px;font-size:16px;";m.appendChild(h);
    function close(){m.remove();bd.remove();}
    ["Drum and Bass","House","Dubstep","Electronic"].forEach(function(cat){
      var items=T.filter(function(t){return t.category===cat;});
      if(!items.length)return;
      var ch=document.createElement("h3");ch.textContent=cat+" ("+items.length+")";
      ch.style.cssText="color:#e0e0f0;font-size:13px;margin:12px 0 6px;";m.appendChild(ch);
      items.forEach(function(tmpl){
        var d=document.createElement("div");d.textContent=tmpl.name;
        d.style.cssText="padding:8px 12px;cursor:pointer;border-radius:6px;margin:2px 0;font-size:12px;color:#e0e0f0;transition:background 0.1s;";
        d.onmouseenter=function(){d.style.background="#2a2a4a";};
        d.onmouseleave=function(){d.style.background="transparent";};
        d.onclick=function(){
          if(window.sequencer&&window.sequencer.load)window.sequencer.load(tmpl.data);
          if(tmpl.data.bpm){var bi=document.getElementById("bpm");if(bi)bi.value=tmpl.data.bpm;if(window.audioEngine)window.audioEngine.bpm=tmpl.data.bpm;}
          var ne=document.getElementById("project-name");if(ne)ne.textContent=tmpl.name;
          var badge=document.getElementById("template-badge");if(badge){badge.textContent="Template: "+tmpl.name;badge.style.display="";}
          close();
        };m.appendChild(d);
      });
    });
    var cb=document.createElement("button");cb.textContent="Close";cb.className="action-btn";cb.style.marginTop="16px";cb.onclick=close;m.appendChild(cb);
    bd.onclick=close;document.body.appendChild(bd);document.body.appendChild(m);
  }`);
out.push('');
out.push('  function attach(){');
out.push('    var btn=document.getElementById("btn-templates");');
out.push('    if(btn){btn.addEventListener("click",openTemplateModal);console.log("[TEMPLATES] Ready: "+T.length+" templates");}');
out.push('    else{console.warn("[TEMPLATES] btn-templates not found");}');
out.push('  }');
out.push('  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);');
out.push('  else attach();');
out.push('})();');

fs.writeFileSync('C:/Users/Tristan/Desktop/beat-studio/js/templates.js', out.join('\n'));
console.log('Written ' + out.length + ' lines');
