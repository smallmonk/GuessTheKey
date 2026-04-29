import { shuffle } from './arrayUtils.ts';

export interface TimeSignature {
  name: string;
  numBeats: number;
  beatValue: number;
}

export const TIME_SIGNATURES: TimeSignature[] = [
  // Simple
  { name: '2/4', numBeats: 2, beatValue: 4 },
  { name: '3/4', numBeats: 3, beatValue: 4 },
  { name: '4/4', numBeats: 4, beatValue: 4 },
  { name: '2/2', numBeats: 2, beatValue: 2 },
  { name: '3/2', numBeats: 3, beatValue: 2 },
  { name: '4/2', numBeats: 4, beatValue: 2 },
  { name: '3/8', numBeats: 3, beatValue: 8 },
  // Compound
  { name: '6/8', numBeats: 6, beatValue: 8 },
  { name: '9/8', numBeats: 9, beatValue: 8 },
  { name: '12/8', numBeats: 12, beatValue: 8 },
  { name: '6/4', numBeats: 6, beatValue: 4 },
  { name: '9/4', numBeats: 9, beatValue: 4 },
  { name: '12/4', numBeats: 12, beatValue: 4 },
  { name: '6/16', numBeats: 6, beatValue: 16 },
  { name: '9/16', numBeats: 9, beatValue: 16 },
  { name: '12/16', numBeats: 12, beatValue: 16 },
  // Irregular
  { name: '5/8', numBeats: 5, beatValue: 8 },
  { name: '7/8', numBeats: 7, beatValue: 8 },
  { name: '5/4', numBeats: 5, beatValue: 4 },
  { name: '7/4', numBeats: 7, beatValue: 4 },
];

export interface RhythmNote {
  keys: string[];
  duration: string;
}

export interface TimeSignatureQuestion {
  timeSignature: TimeSignature;
  notes: RhythmNote[];
}

export function getRandomTimeSignatures(count: number, exclude?: TimeSignature): TimeSignature[] {
  let available = [...TIME_SIGNATURES];
  if (exclude) {
    available = available.filter(ts => ts.name !== exclude.name);
  }

  return shuffle(available).slice(0, count);
}

// Map beat values to vexflow base durations
const beatValueToDur: Record<number, string> = {
  2: 'h',
  4: 'q',
  8: '8',
  16: '16'
};

// Return note duration fractions relative to whole note (1.0)

function getRhythmForTimeSignature(ts: TimeSignature, clef: string): RhythmNote[] {
  let notes: RhythmNote[] = [];
  const baseKey = clef === 'bass' ? 'c/3' : 'c/4';
  const baseDur = beatValueToDur[ts.beatValue] || 'q';

  // For a basic rhythm generator, we just break it down into beats,
  // and randomly split some beats into two smaller notes.
  for (let i = 0; i < ts.numBeats; i++) {
    const r = Math.random();
    if (r > 0.5 && ts.beatValue !== 16) {
      // Split into two smaller notes
      if (baseDur === 'h') {
        notes.push({ keys: [baseKey], duration: 'q' });
        notes.push({ keys: [baseKey], duration: 'q' });
      } else if (baseDur === 'q') {
        notes.push({ keys: [baseKey], duration: '8' });
        notes.push({ keys: [baseKey], duration: '8' });
      } else if (baseDur === '8') {
        notes.push({ keys: [baseKey], duration: '16' });
        notes.push({ keys: [baseKey], duration: '16' });
      } else {
        notes.push({ keys: [baseKey], duration: baseDur });
      }
    } else {
      notes.push({ keys: [baseKey], duration: baseDur });
    }
  }

  // Also randomise pitch slightly
  const pitchMap: Record<string, string[]> = {
    'treble': ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'],
    'bass': ['c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4'],
    'alto': ['f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4'],
    'tenor': ['d/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4']
  };

  const restKeyMap: Record<string, string> = {
    'treble': 'b/4',
    'bass': 'd/3',
    'alto': 'c/4',
    'tenor': 'a/3'
  };

  const pitches = pitchMap[clef] || pitchMap['treble'];
  const restKey = restKeyMap[clef] || 'b/4';

  notes = notes.map(n => {
    const isRest = Math.random() < 0.2; // 20% chance of rest
    if (isRest) {
      return { ...n, keys: [restKey], duration: n.duration + 'r' };
    }
    const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
    return { ...n, keys: [randomPitch] };
  });

  return notes;
}

export function generateTimeSignatureQuestion(clef: string): TimeSignatureQuestion {
  const ts = TIME_SIGNATURES[Math.floor(Math.random() * TIME_SIGNATURES.length)];
  return {
    timeSignature: ts,
    notes: getRhythmForTimeSignature(ts, clef)
  };
}
