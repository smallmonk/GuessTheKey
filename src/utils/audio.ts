import { Note } from './intervals';
import { KeySignature } from './keys';
import { RhythmNote } from './timeSignatures';
import { CadenceNote } from './cadences';

const NOTE_OFFSETS: Record<string, number> = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
const ACCIDENTAL_OFFSETS: Record<string, number> = { '': 0, '#': 1, 'b': -1, '##': 2, 'bb': -2, 'n': 0 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let audioCtx: any = null;

export function playInterval(notes: [Note, Note]) {
  if (!AudioContextClass) return;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const playNote = (note: Note, duration: number) => {
    const midi = 12 * (note.octave + 1) + NOTE_OFFSETS[note.name] + ACCIDENTAL_OFFSETS[note.accidental];
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle'; // triangle sounds a bit more musical than sine
    osc.frequency.value = freq;

    const gainNode = audioCtx.createGain();

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + duration - 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  };

  playNote(notes[0], 0.8);
  playNote(notes[1], 0.8);
}

export function playScale(key: KeySignature) {
  if (!AudioContextClass) return;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const [noteStr] = key.name.split(' ');
  const rootNoteName = noteStr.charAt(0);
  const rootAccidental = noteStr.slice(1);

  const baseMidi = 12 * (4 + 1) + NOTE_OFFSETS[rootNoteName] + (ACCIDENTAL_OFFSETS[rootAccidental] || 0);

  const intervals = key.mode === 'major'
    ? [0, 2, 4, 5, 7, 9, 11, 12]
    : [0, 2, 3, 5, 7, 8, 10, 12]; // Natural minor scale matches key signature

  const duration = 0.15;

  intervals.forEach((interval, index) => {
    const midi = baseMidi + interval;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const startTime = audioCtx.currentTime + index * duration;

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gainNode = audioCtx.createGain();

    // Envelope for each note to prevent clicks
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.setValueAtTime(0.3, startTime + duration - 0.01);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

export function playOrnament(notes: RhythmNote[]) {
  if (!AudioContextClass) return;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const durationMap: Record<string, number> = {
    '32': 0.0625,
    '16': 0.125,
    '8': 0.25,
    'q': 0.5,
    'h': 1.0,
    'w': 2.0
  };

  let currentTime = audioCtx.currentTime;

  notes.forEach((note) => {
    // Only play the first key in the rhythm note for ornaments
    if (note.keys.length === 0) return;

    // Parse the key string, e.g. "c/4" or "c#/4"
    const keyStr = note.keys[0];
    const [notePart, octaveStr] = keyStr.split('/');
    const noteName = notePart.charAt(0).toUpperCase();
    const accidental = notePart.slice(1);
    const octave = parseInt(octaveStr, 10);

    const midi = 12 * (octave + 1) + NOTE_OFFSETS[noteName] + (ACCIDENTAL_OFFSETS[accidental] || 0);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Duration in seconds, with a bit of space between notes
    const duration = durationMap[note.duration.replace('r', '')] || 0.25;

    if (note.duration.includes('r')) {
      currentTime += duration;
      return;
    }

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gainNode = audioCtx.createGain();

    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + Math.min(0.01, duration * 0.1));
    gainNode.gain.setValueAtTime(0.3, currentTime + duration - Math.min(0.01, duration * 0.1));
    gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(currentTime);
    osc.stop(currentTime + duration);

    currentTime += duration;
  });
}

export function playCadence(chords: CadenceNote[]) {
  if (!AudioContextClass) return;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  let currentTime = audioCtx.currentTime;

  chords.forEach((chord) => {
    // Half note cadence duration reduced to 0.6 seconds
    const duration = 0.6;

    chord.keys.forEach(keyStr => {
      const [notePart, octaveStr] = keyStr.split('/');
      const noteName = notePart.charAt(0).toUpperCase();
      const accidental = notePart.slice(1);
      const octave = parseInt(octaveStr, 10);

      const midi = 12 * (octave + 1) + NOTE_OFFSETS[noteName] + (ACCIDENTAL_OFFSETS[accidental] || 0);
      const freq = 440 * Math.pow(2, (midi - 69) / 12);

      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gainNode = audioCtx.createGain();

      gainNode.gain.setValueAtTime(0, currentTime);
      // Fade in
      gainNode.gain.linearRampToValueAtTime(0.25, currentTime + 0.05);
      // Sustain
      gainNode.gain.setValueAtTime(0.25, currentTime + duration - 0.05);
      // Fade out
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + duration);
    });

    // Move time forward for the next chord, add a tiny gap
    currentTime += duration + 0.05;
  });
}
