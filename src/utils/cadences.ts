import type { KeySignature } from './keys.ts';
import { KEYS } from './keys.ts';
import { shuffle } from './arrayUtils.ts';

export interface CadenceNote {
  keys: string[]; // e.g. ["c/4", "e/4", "g/4"]
  duration: string; // "h" for half note
}

export interface Cadence {
  name: string; // "Perfect", "Plagal", "Imperfect"
}

export interface CadenceQuestion {
  cadence: Cadence;
  chords: CadenceNote[];
  key: KeySignature;
  clef: string;
}

export const CADENCES: Cadence[] = [
  { name: 'Perfect' },
  { name: 'Plagal' },
  { name: 'Imperfect' }
];

const VALID_KEYS = KEYS.filter(k => k.accidentals <= 6);

// Returns an array of options to show (all 3 cadences, shuffled)
export function getCadenceOptions(): Cadence[] {
  return shuffle([...CADENCES]);
}

// Diatonic scales relative to C major
const DIATONIC_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Map of key signatures to accidentals to apply to each note.
// E.g. D Major -> F: #, C: #
function getKeyAccidentals(key: KeySignature): Record<string, string> {
  const result: Record<string, string> = {};
  const orderOfSharps = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
  const orderOfFlats = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];

  if (key.type === 'sharp') {
    for (let i = 0; i < key.accidentals; i++) {
      result[orderOfSharps[i]] = '#';
    }
  } else if (key.type === 'flat') {
    for (let i = 0; i < key.accidentals; i++) {
      result[orderOfFlats[i]] = 'b';
    }
  }
  return result;
}

// Get scale degrees for a key. Returns array of { name: 'C', accidental: '' }
function getScale(key: KeySignature): { name: string; accidental: string }[] {
  const [rootNoteStr] = key.name.split(' ');
  const rootNoteName = rootNoteStr.charAt(0);

  const keyAccidentals = getKeyAccidentals(key);

  const rootIdx = DIATONIC_NOTES.indexOf(rootNoteName);

  const scale = [];
  for (let i = 0; i < 7; i++) {
    const noteName = DIATONIC_NOTES[(rootIdx + i) % 7];
    let accidental = keyAccidentals[noteName] || '';

    // In harmonic minor, raise the 7th degree
    if (key.mode === 'minor' && i === 6) {
      if (accidental === 'b') accidental = 'n';
      else if (accidental === '') accidental = '#';
      else if (accidental === '#') accidental = '##';
    }

    scale.push({ name: noteName, accidental });
  }
  return scale;
}

// Helper to construct a chord from scale degrees
function buildChord(scale: { name: string; accidental: string }[], rootDegree: number, inversion: number, baseOctave: number): string[] {
  // rootDegree is 1-indexed (1=tonic, 4=subdominant, 5=dominant)
  const degrees = [rootDegree - 1, (rootDegree + 1) % 7, (rootDegree + 3) % 7];

  // Apply inversion (shift array)
  for (let i = 0; i < inversion; i++) {
    degrees.push(degrees.shift() as number);
  }

  const notes = [];
  let currentOctave = baseOctave;
  let lastDiatonicIdx = -1;

  for (let i = 0; i < 3; i++) {
    const degreeIdx = degrees[i];
    const note = scale[degreeIdx];

    const diatonicIdx = DIATONIC_NOTES.indexOf(note.name);

    // In scientific pitch notation, the octave increments at C (index 0 in DIATONIC_NOTES)
    // If we wrap around B (index 6) to C (index 0) or any higher note that crosses C, we increment
    if (lastDiatonicIdx !== -1) {
      // If the current note index is lower than the previous note index, we crossed C
      if (diatonicIdx < lastDiatonicIdx) {
        currentOctave++;
      }
    }

    const keyStr = `${note.name.toLowerCase()}${note.accidental}/${currentOctave}`;
    notes.push(keyStr);

    lastDiatonicIdx = diatonicIdx;
  }

  // Return exactly 2 notes: the lowest note and the highest note of the triad
  // This ensures the interval between them is at most an octave (typically a 5th, 6th, etc.)
  return [notes[0], notes[2]];
}

export function generateCadenceQuestion(clef: string): CadenceQuestion {
  // Random key (major or minor)
  const key = VALID_KEYS[Math.floor(Math.random() * VALID_KEYS.length)];

  const scale = getScale(key);

  let baseOctave = 4;
  if (clef === 'bass') baseOctave = 3;
  else if (clef === 'alto') baseOctave = 4; // C4 is middle line
  else if (clef === 'tenor') baseOctave = 3; // C4 is second space from top

  const cadenceType = CADENCES[Math.floor(Math.random() * CADENCES.length)];

  let chord1Degrees: { root: number, inv: number };
  let chord2Degrees: { root: number, inv: number };

  // 1-indexed: 1=I, 4=IV, 5=V
  if (cadenceType.name === 'Perfect') {
    chord1Degrees = { root: 5, inv: 0 }; // V
    chord2Degrees = { root: 1, inv: 0 }; // I
  } else if (cadenceType.name === 'Plagal') {
    chord1Degrees = { root: 4, inv: 0 }; // IV
    chord2Degrees = { root: 1, inv: 0 }; // I
  } else { // Imperfect
    // Imperfect can be I->V, II->V, or IV->V. Let's stick to I->V or IV->V
    const firstChordRoot = Math.random() < 0.5 ? 1 : 4;
    chord1Degrees = { root: firstChordRoot, inv: 0 };
    chord2Degrees = { root: 5, inv: 0 }; // V
  }

  const chord1Keys = buildChord(scale, chord1Degrees.root, chord1Degrees.inv, baseOctave);
  const chord2Keys = buildChord(scale, chord2Degrees.root, chord2Degrees.inv, baseOctave);

  const chords: CadenceNote[] = [
    { keys: chord1Keys, duration: 'h' },
    { keys: chord2Keys, duration: 'h' }
  ];

  return {
    cadence: cadenceType,
    chords,
    key,
    clef
  };
}
