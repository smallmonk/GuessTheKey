export interface Interval {
  name: string;
  semitones: number;
}

export const INTERVALS: Interval[] = [
  { name: 'Minor 2nd', semitones: 1 },
  { name: 'Major 2nd', semitones: 2 },
  { name: 'Minor 3rd', semitones: 3 },
  { name: 'Major 3rd', semitones: 4 },
  { name: 'Perfect 4th', semitones: 5 },
  { name: 'Tritone', semitones: 6 },
  { name: 'Perfect 5th', semitones: 7 },
  { name: 'Minor 6th', semitones: 8 },
  { name: 'Major 6th', semitones: 9 },
  { name: 'Minor 7th', semitones: 10 },
  { name: 'Major 7th', semitones: 11 },
  { name: 'Perfect 8ve', semitones: 12 },
];

export interface Note {
  name: string; // e.g., 'C', 'C#', 'Db'
  accidental: string; // '', '#', 'b'
  octave: number;
}

export interface IntervalQuestion {
  notes: [Note, Note];
  interval: Interval;
  clef: string;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];



function valueToNoteStr(value: number): string {
  // Simple mapping, prioritizes sharps.
  // Realistically we might want a mix of flats and sharps but this is a start.
  return NOTE_NAMES[((value % 12) + 12) % 12];
}

export function generateInterval(clef: string): IntervalQuestion {
  // Pick a base note based on clef to ensure it stays somewhat on staff
  let baseOctave = 4;
  if (clef === 'bass') baseOctave = 2;
  else if (clef === 'alto') baseOctave = 3;
  else if (clef === 'tenor') baseOctave = 3;

  // Sometimes offset octave
  baseOctave += Math.floor(Math.random() * 2);

  const baseNoteIdx = Math.floor(Math.random() * 12);
  const baseNoteName = NOTE_NAMES[baseNoteIdx];

  const accidental = baseNoteName.length > 1 ? baseNoteName[1] : '';

  const note1: Note = {
    name: baseNoteName[0],
    accidental: accidental,
    octave: baseOctave
  };

  const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

  const targetNoteValue = baseNoteIdx + interval.semitones;
  const targetNoteStr = valueToNoteStr(targetNoteValue);
  const targetAccidental = targetNoteStr.length > 1 ? targetNoteStr[1] : '';

  const targetOctave = baseOctave + Math.floor(targetNoteValue / 12);

  const note2: Note = {
    name: targetNoteStr[0],
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
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, n);
  return [...selected, current].sort(() => 0.5 - Math.random());
}
