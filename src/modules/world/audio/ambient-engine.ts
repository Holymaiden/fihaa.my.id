// Fantasy music and nature sounds, made live with the Web Audio API (no
// files to download, nothing to license). A slow pad plays a dreamy chord
// loop, a harp-like voice picks notes over it, and wind, rain, birds or
// crickets sit underneath. No three.js and no React here.

export interface AmbientMood {
  night: boolean;
  rain: number;
  mist: number;
}

const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12);

// D major with a lydian lift: Dmaj9 – Bm9 – Gmaj7(#11) – Asus.
const CHORDS = [
  [50, 57, 64, 66, 69],
  [47, 54, 61, 62, 66],
  [43, 50, 59, 61, 66],
  [45, 52, 59, 62, 64],
];
// Notes the harp picks from (D major pentatonic, two octaves).
const MELODY = [74, 76, 78, 81, 83, 86, 88, 90, 93];

const BEAT = 60 / 66;
const BEATS_PER_CHORD = 8;
const LOOKAHEAD = 1.2;

const noiseBuffer = (context: AudioContext, seconds: number) => {
  const buffer = context.createBuffer(
    1,
    context.sampleRate * seconds,
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  // Brownish noise: softer than white, closer to wind and rain.
  let last = 0;
  for (let index = 0; index < data.length; index++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.04 * white) / 1.04;
    data[index] = last * 3.5;
  }
  return buffer;
};

// A long, dark hall built from decaying noise.
const reverbImpulse = (context: AudioContext) => {
  const seconds = 4.5;
  const length = context.sampleRate * seconds;
  const impulse = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let index = 0; index < length; index++) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3;
    }
  }
  return impulse;
};

export class AmbientEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private windGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private timer = 0;
  private nextBeat = 0;
  private beat = 0;
  private mood: AmbientMood = { night: false, rain: 0, mist: 0 };

  // Must be called from a click or key press (browsers block audio
  // until the visitor does something).
  start() {
    if (this.context) {
      void this.context.resume();
      this.fade(1);
      return;
    }
    const context = new AudioContext();
    this.context = context;
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    this.master = master;

    const reverb = context.createConvolver();
    reverb.buffer = reverbImpulse(context);
    const wet = context.createGain();
    wet.gain.value = 0.55;
    reverb.connect(wet).connect(master);
    this.reverb = reverb;

    const music = context.createGain();
    music.gain.value = 0.5;
    music.connect(master);
    music.connect(reverb);
    this.music = music;

    this.windGain = this.loopNoise({
      type: 'bandpass',
      frequency: 420,
      q: 0.7,
    });
    this.rainGain = this.loopNoise({
      type: 'highpass',
      frequency: 900,
      q: 0.3,
    });
    this.applyMood();

    this.nextBeat = context.currentTime + 0.3;
    this.timer = window.setInterval(() => this.schedule(), 250);
    this.fade(1);
  }

  stop() {
    this.fade(0);
  }

  dispose() {
    window.clearInterval(this.timer);
    void this.context?.close();
    this.context = null;
  }

  get running() {
    return this.context?.state === 'running';
  }

  // Rushing air for a camera move: falling in pitch when diving onto the
  // island, rising when flying back out. A shimmer of harp on top.
  whoosh(kind: 'enter' | 'exit' | 'intro') {
    const context = this.context;
    if (!context || context.state !== 'running' || !this.master) {
      return;
    }
    const now = context.currentTime;
    const length = kind === 'intro' ? 4 : 2.8;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer(context, length);
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    const [high, low] = [1900, 260];
    filter.frequency.setValueAtTime(kind === 'exit' ? low : high, now);
    filter.frequency.exponentialRampToValueAtTime(
      kind === 'exit' ? high : low,
      now + length * 0.9,
    );
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(
      kind === 'intro' ? 0.16 : 0.22,
      now + length * 0.45,
    );
    gain.gain.linearRampToValueAtTime(0, now + length);
    source.connect(filter).connect(gain);
    gain.connect(this.master);
    if (this.reverb) {
      gain.connect(this.reverb);
    }
    source.start(now);
    source.stop(now + length);
    // Landing (or arriving): a rising arpeggio as the move settles.
    const notes = kind === 'exit' ? [86, 81, 78, 74] : [74, 78, 81, 86, 90];
    notes.forEach((note, index) =>
      this.harp(midiToHz(note), now + length * 0.55 + index * 0.11),
    );
  }

  // A rising sparkle, for finding a crystal.
  chime() {
    const context = this.context;
    if (!context || context.state !== 'running') {
      return;
    }
    const now = context.currentTime;
    [81, 86, 90, 93].forEach((note, index) =>
      this.harp(midiToHz(note), now + index * 0.09),
    );
  }

  setMood(mood: AmbientMood) {
    this.mood = mood;
    this.applyMood();
  }

  private fade(to: number) {
    const { context, master } = this;
    if (!context || !master) {
      return;
    }
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(to * 0.8, context.currentTime, 0.8);
  }

  private applyMood() {
    const { context, windGain, rainGain, music } = this;
    if (!context || !windGain || !rainGain || !music) {
      return;
    }
    const now = context.currentTime;
    const { rain, mist, night } = this.mood;
    windGain.gain.setTargetAtTime(0.05 + rain * 0.08 + mist * 0.03, now, 2);
    rainGain.gain.setTargetAtTime(rain * 0.16, now, 2);
    // Quieter, softer music at night and in the rain.
    music.gain.setTargetAtTime((night ? 0.38 : 0.5) * (1 - rain * 0.3), now, 2);
  }

  private loopNoise({
    type,
    frequency,
    q,
  }: {
    type: BiquadFilterType;
    frequency: number;
    q: number;
  }) {
    const context = this.context as AudioContext;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer(context, 6);
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    // Slow swell, like gusts.
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.07 + Math.random() * 0.05;
    const depth = context.createGain();
    depth.gain.value = frequency * 0.35;
    lfo.connect(depth).connect(filter.frequency);
    const gain = context.createGain();
    gain.gain.value = 0;
    source
      .connect(filter)
      .connect(gain)
      .connect(this.master as GainNode);
    source.start();
    lfo.start();
    return gain;
  }

  private schedule() {
    const context = this.context;
    if (!context) {
      return;
    }
    while (this.nextBeat < context.currentTime + LOOKAHEAD) {
      this.playBeat(this.beat, this.nextBeat);
      this.beat++;
      this.nextBeat += BEAT;
    }
  }

  private playBeat(beat: number, time: number) {
    const chord = CHORDS[Math.floor(beat / BEATS_PER_CHORD) % CHORDS.length];
    if (beat % BEATS_PER_CHORD === 0) {
      chord.forEach((note, index) =>
        this.pad(midiToHz(note), time + index * 0.08),
      );
    }
    // A sparse harp line: not every beat, and gentler at night.
    const chance = this.mood.night ? 0.35 : 0.55;
    if (Math.random() < chance) {
      const note = MELODY[Math.floor(Math.random() * MELODY.length)];
      this.harp(midiToHz(note - (this.mood.night ? 12 : 0)), time);
      if (Math.random() < 0.25) {
        this.harp(midiToHz(note + 7), time + BEAT / 2);
      }
    }
    // Birds by day, crickets by night (not in the rain).
    if (this.mood.rain < 0.5 && Math.random() < 0.12) {
      if (this.mood.night) {
        this.cricket(time + Math.random() * BEAT);
      } else {
        this.bird(time + Math.random() * BEAT);
      }
    }
  }

  private pad(frequency: number, time: number) {
    const context = this.context as AudioContext;
    const length = BEAT * BEATS_PER_CHORD + 2;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.045, time + 2.5);
    gain.gain.setValueAtTime(0.045, time + length - 3);
    gain.gain.linearRampToValueAtTime(0, time + length);
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    filter.connect(gain).connect(this.music as GainNode);
    for (const detune of [-7, 7]) {
      const oscillator = context.createOscillator();
      oscillator.type = detune < 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      oscillator.detune.value = detune;
      oscillator.connect(filter);
      oscillator.start(time);
      oscillator.stop(time + length);
    }
  }

  private harp(frequency: number, time: number) {
    const context = this.context as AudioContext;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.07, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 2.4);
    gain.connect(this.music as GainNode);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    // A soft octave shimmer, like a celesta.
    const shimmer = context.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = frequency * 2;
    const shimmerGain = context.createGain();
    shimmerGain.gain.value = 0.25;
    oscillator.connect(gain);
    shimmer.connect(shimmerGain).connect(gain);
    for (const source of [oscillator, shimmer]) {
      source.start(time);
      source.stop(time + 2.5);
    }
  }

  private bird(time: number) {
    const context = this.context as AudioContext;
    const gain = context.createGain();
    gain.connect(this.reverb as ConvolverNode);
    gain.connect(this.master as GainNode);
    const base = 2600 + Math.random() * 1600;
    const notes = 2 + Math.floor(Math.random() * 3);
    for (let index = 0; index < notes; index++) {
      const start = time + index * 0.13;
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(base, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        base * 1.5,
        start + 0.07,
      );
      const chirp = context.createGain();
      chirp.gain.setValueAtTime(0, start);
      chirp.gain.linearRampToValueAtTime(0.025, start + 0.02);
      chirp.gain.exponentialRampToValueAtTime(0.0001, start + 0.1);
      oscillator.connect(chirp).connect(gain);
      oscillator.start(start);
      oscillator.stop(start + 0.12);
    }
  }

  private cricket(time: number) {
    const context = this.context as AudioContext;
    for (let index = 0; index < 3; index++) {
      const start = time + index * 0.06;
      const oscillator = context.createOscillator();
      oscillator.frequency.value = 4400;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.012, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
      oscillator.connect(gain).connect(this.master as GainNode);
      oscillator.start(start);
      oscillator.stop(start + 0.05);
    }
  }
}
