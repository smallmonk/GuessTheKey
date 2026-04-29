import { shuffle } from './arrayUtils';

export interface Interval {
  name: string;
  semitones: number;
  diatonicSteps: number; // 0 for unison, 1 for 2nd, etc.
}

export const INTERVALS: Interval[] = [
  { name: 'Diminished 2nd', semitones: 0, diatonicSteps: 1 },
  { name: 'Minor 2nd', semitones: 1, diatonicSteps: 1 },
  { name: 'Major 2nd', semitones: 2, diatonicSteps: 1 },
  { name: 'Augmented 2nd', semitones: 3, diatonicSteps: 1 },
  { name: 'Diminished 3rd', semitones: 2, diatonicSteps: 2 },
  { name: 'Minor 3rd', semitones: 3, diatonicSteps: 2 },
  { name: 'Major 3rd', semitones: 4, diatonicSteps: 2 },
  { name: 'Augmented 3rd', semitones: 5, diatonicSteps: 2 },
  { name: 'Diminished 4th', semitones: 4, diatonicSteps: 3 },
  { name: 'Perfect 4th', semitones: 5, diatonicSteps: 3 },
  { name: 'Augmented 4th', semitones: 6, diatonicSteps: 3 },
  { name: 'Diminished 5th', semitones: 6, diatonicSteps: 4 },
  { name: 'Perfect 5th', semitones: 7, diatonicSteps: 4 },
  { name: 'Augmented 5th', semitones: 8, diatonicSteps: 4 },
  { name: 'Diminished 6th', semitones: 7, diatonicSteps: 5 },
  { name: 'Minor 6th', semitones: 8, diatonicSteps: 5 },
  { name: 'Major 6th', semitones: 9, diatonicSteps: 5 },
  { name: 'Augmented 6th', semitones: 10, diatonicSteps: 5 },
  { name: 'Diminished 7th', semitones: 9, diatonicSteps: 6 },
  { name: 'Minor 7th', semitones: 10, diatonicSteps: 6 },
  { name: 'Major 7th', semitones: 11, diatonicSteps: 6 },
  { name: 'Augmented 7th', semitones: 12, diatonicSteps: 6 },
  { name: 'Diminished 8ve', semitones: 11, diatonicSteps: 7 },
  { name: 'Perfect 8ve', semitones: 12, diatonicSteps: 7 },
  { name: 'Augmented 8ve', semitones: 13, diatonicSteps: 7 },
];

export interface Note {
  name: string; // e.g., 'C', 'D'
  accidental: string; // '', '#', 'b', '##', 'bb'
  octave: number;
}

export interface IntervalQuestion {
  notes: [Note, Note];
  interval: Interval;
  clef: string;
}

const DIATONIC_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const DIATONIC_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

const ACCIDENTAL_TO_VAL: Record<string, number> = {
  '': 0, '#': 1, 'b': -1, '##': 2, 'bb': -2
};

const VAL_TO_ACCIDENTAL: Record<number, string> = {
  0: '', 1: '#', [-1]: 'b', 2: '##', [-2]: 'bb'
};

function getSemitoneDifference(baseNoteName: string, baseAccidental: string, baseOctave: number, targetNoteName: string, targetAccidental: string, targetOctave: number): number {
    const baseDiatonic = NOTE_TO_SEMITONE[baseNoteName] ?? 0;
    const targetDiatonic = NOTE_TO_SEMITONE[targetNoteName] ?? 0;

    const baseAccidentalVal = ACCIDENTAL_TO_VAL[baseAccidental] ?? 0;
    const targetAccidentalVal = ACCIDENTAL_TO_VAL[targetAccidental] ?? 0;

    const baseTotal = baseDiatonic + baseAccidentalVal + (baseOctave * 12);
    const targetTotal = targetDiatonic + targetAccidentalVal + (targetOctave * 12);

    return targetTotal - baseTotal;
}

function getAccidentalForTarget(targetNoteName: string, targetOctave: number, baseNoteName: string, baseAccidental: string, baseOctave: number, requiredSemitones: number): string {
    const semitonesWithoutAccidental = getSemitoneDifference(baseNoteName, baseAccidental, baseOctave, targetNoteName, '', targetOctave);
    const accidentalDiff = requiredSemitones - semitonesWithoutAccidental;

    return VAL_TO_ACCIDENTAL[accidentalDiff] ?? '';
}

export function generateInterval(clef: string): IntervalQuestion {
  // Pick a base note based on clef to ensure it stays somewhat on staff
  let baseOctave = 4;
  if (clef === 'bass') baseOctave = 2;
  else if (clef === 'alto') baseOctave = 3;
  else if (clef === 'tenor') baseOctave = 3;

  // Sometimes offset octave
  baseOctave += Math.floor(Math.random() * 2);

  const baseNoteIdx = Math.floor(Math.random() * 7);
  const baseNoteName = DIATONIC_NOTES[baseNoteIdx];

  // Keep base notes simple (mostly naturals, some simple sharps/flats)
  const accidentals = ['', '', '', '#', 'b'];
  const baseAccidental = accidentals[Math.floor(Math.random() * accidentals.length)];

  const note1: Note = {
    name: baseNoteName,
    accidental: baseAccidental,
    octave: baseOctave
  };

  const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

  // Calculate target note name based on diatonic steps
  const targetNoteIdx = (baseNoteIdx + interval.diatonicSteps) % 7;
  const targetNoteName = DIATONIC_NOTES[targetNoteIdx];

  // Calculate target octave
  const octaveCrossings = Math.floor((baseNoteIdx + interval.diatonicSteps) / 7);
  const targetOctave = baseOctave + octaveCrossings;

  // Calculate target accidental to match the required semitone distance
  const targetAccidental = getAccidentalForTarget(targetNoteName, targetOctave, baseNoteName, baseAccidental, baseOctave, interval.semitones);

  const note2: Note = {
    name: targetNoteName,
    accidental: targetAccidental,
    octave: targetOctave
  };

  return {
    notes: [note1, note2],
    interval,
    clef
  };
}

export function getRandomIntervals(n: number, current: Interval): Interval[] {
  const filtered = INTERVALS.filter(i => i.name !== current.name);
  const shuffled = shuffle(filtered);
  const selected = shuffled.slice(0, n);
  return shuffle([...selected, current]);
}
