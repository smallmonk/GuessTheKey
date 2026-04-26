import { Note } from './intervals';

const NOTE_OFFSETS: Record<string, number> = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
const ACCIDENTAL_OFFSETS: Record<string, number> = { '': 0, '#': 1, 'b': -1, '##': 2, 'bb': -2 };

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
