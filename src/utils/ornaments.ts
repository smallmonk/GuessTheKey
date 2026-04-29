import { shuffle } from './arrayUtils.ts';
import { RhythmNote } from './timeSignatures.ts';

export interface OrnamentVoiceConfig {
  numBeats: number;
  beatValue: number;
}

export interface Ornament {
  name: string;
  voiceConfig: OrnamentVoiceConfig;
}

export const ORNAMENTS: Ornament[] = [
  { name: 'Trill', voiceConfig: { numBeats: 1, beatValue: 4 } },
  { name: 'Upper Mordent', voiceConfig: { numBeats: 1, beatValue: 4 } },
  { name: 'Lower Mordent', voiceConfig: { numBeats: 1, beatValue: 4 } },
  { name: 'Turn', voiceConfig: { numBeats: 1, beatValue: 4 } },
  { name: 'Appoggiatura', voiceConfig: { numBeats: 1, beatValue: 4 } },
  { name: 'Acciaccatura', voiceConfig: { numBeats: 3, beatValue: 16 } },
];

export interface OrnamentQuestion {
  ornament: Ornament;
  notes: RhythmNote[];
  clef: string;
}

export function getRandomOrnaments(count: number, exclude?: Ornament): Ornament[] {
  let available = [...ORNAMENTS];
  if (exclude) {
    available = available.filter(o => o.name !== exclude.name);
  }

  return shuffle(available).slice(0, count);
}

// Maps clef to the available base keys in a C major diatonic scale
const CLEF_DIATONIC: Record<string, string[]> = {
  'treble': ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5'],
  'bass': ['c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4'],
  'alto': ['f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4'],
  'tenor': ['d/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4']
};

export function generateOrnamentQuestion(clef: string): OrnamentQuestion {
  const ornament = ORNAMENTS[Math.floor(Math.random() * ORNAMENTS.length)];

  const diatonic = CLEF_DIATONIC[clef] || CLEF_DIATONIC['treble'];

  // Pick an index from 1 to diatonic.length - 2 to ensure we have an upper and lower note
  const baseNoteIdx = Math.floor(Math.random() * (diatonic.length - 2)) + 1;
  const principalKey = diatonic[baseNoteIdx];
  const upperKey = diatonic[baseNoteIdx + 1];
  const lowerKey = diatonic[baseNoteIdx - 1];

  let notes: RhythmNote[] = [];

  switch (ornament.name) {
    case 'Trill':
      notes = [
        { keys: [upperKey], duration: '32' },
        { keys: [principalKey], duration: '32' },
        { keys: [upperKey], duration: '32' },
        { keys: [principalKey], duration: '32' },
        { keys: [upperKey], duration: '32' },
        { keys: [principalKey], duration: '32' },
        { keys: [upperKey], duration: '32' },
        { keys: [principalKey], duration: '32' }
      ];
      break;
    case 'Upper Mordent':
      notes = [
        { keys: [principalKey], duration: '16' },
        { keys: [upperKey], duration: '16' },
        { keys: [principalKey], duration: '8' }
      ];
      break;
    case 'Lower Mordent':
      notes = [
        { keys: [principalKey], duration: '16' },
        { keys: [lowerKey], duration: '16' },
        { keys: [principalKey], duration: '8' }
      ];
      break;
    case 'Turn':
      notes = [
        { keys: [upperKey], duration: '16' },
        { keys: [principalKey], duration: '16' },
        { keys: [lowerKey], duration: '16' },
        { keys: [principalKey], duration: '16' }
      ];
      break;
    case 'Appoggiatura':
      notes = [
        { keys: [upperKey], duration: '8' },
        { keys: [principalKey], duration: '8' }
      ];
      break;
    case 'Acciaccatura':
      // 16th note followed by an 8th note. Total 3 sixteenths (numBeats: 3, beatValue: 16)
      notes = [
        { keys: [upperKey], duration: '16' },
        { keys: [principalKey], duration: '8' }
      ];
      break;
  }

  return {
    ornament,
    notes,
    clef
  };
}
