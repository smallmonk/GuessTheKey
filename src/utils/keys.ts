import { shuffle } from './arrayUtils.ts';

export const KEYS = [
  // 0 accidentals
  { name: 'C Major', vexKey: 'C', accidentals: 0, type: 'none', mode: 'major' },
  { name: 'A Minor', vexKey: 'Am', accidentals: 0, type: 'none', mode: 'minor' },
  // 1 sharp
  { name: 'G Major', vexKey: 'G', accidentals: 1, type: 'sharp', mode: 'major' },
  { name: 'E Minor', vexKey: 'Em', accidentals: 1, type: 'sharp', mode: 'minor' },
  // 2 sharps
  { name: 'D Major', vexKey: 'D', accidentals: 2, type: 'sharp', mode: 'major' },
  { name: 'B Minor', vexKey: 'Bm', accidentals: 2, type: 'sharp', mode: 'minor' },
  // 3 sharps
  { name: 'A Major', vexKey: 'A', accidentals: 3, type: 'sharp', mode: 'major' },
  { name: 'F# Minor', vexKey: 'F#m', accidentals: 3, type: 'sharp', mode: 'minor' },
  // 4 sharps
  { name: 'E Major', vexKey: 'E', accidentals: 4, type: 'sharp', mode: 'major' },
  { name: 'C# Minor', vexKey: 'C#m', accidentals: 4, type: 'sharp', mode: 'minor' },
  // 5 sharps
  { name: 'B Major', vexKey: 'B', accidentals: 5, type: 'sharp', mode: 'major' },
  { name: 'G# Minor', vexKey: 'G#m', accidentals: 5, type: 'sharp', mode: 'minor' },
  // 6 sharps
  { name: 'F# Major', vexKey: 'F#', accidentals: 6, type: 'sharp', mode: 'major' },
  { name: 'D# Minor', vexKey: 'D#m', accidentals: 6, type: 'sharp', mode: 'minor' },

  // 1 flat
  { name: 'F Major', vexKey: 'F', accidentals: 1, type: 'flat', mode: 'major' },
  { name: 'D Minor', vexKey: 'Dm', accidentals: 1, type: 'flat', mode: 'minor' },
  // 2 flats
  { name: 'Bb Major', vexKey: 'Bb', accidentals: 2, type: 'flat', mode: 'major' },
  { name: 'G Minor', vexKey: 'Gm', accidentals: 2, type: 'flat', mode: 'minor' },
  // 3 flats
  { name: 'Eb Major', vexKey: 'Eb', accidentals: 3, type: 'flat', mode: 'major' },
  { name: 'C Minor', vexKey: 'Cm', accidentals: 3, type: 'flat', mode: 'minor' },
  // 4 flats
  { name: 'Ab Major', vexKey: 'Ab', accidentals: 4, type: 'flat', mode: 'major' },
  { name: 'F Minor', vexKey: 'Fm', accidentals: 4, type: 'flat', mode: 'minor' },
  // 5 flats
  { name: 'Db Major', vexKey: 'Db', accidentals: 5, type: 'flat', mode: 'major' },
  { name: 'Bb Minor', vexKey: 'Bbm', accidentals: 5, type: 'flat', mode: 'minor' },
  // 6 flats
  { name: 'Gb Major', vexKey: 'Gb', accidentals: 6, type: 'flat', mode: 'major' },
  { name: 'Eb Minor', vexKey: 'Ebm', accidentals: 6, type: 'flat', mode: 'minor' },
];

export const CLEFS = [
  { id: 'treble', label: 'Treble Clef' },
  { id: 'bass', label: 'Bass Clef' },
  { id: 'alto', label: 'Alto Clef' },
  { id: 'tenor', label: 'Tenor Clef' },
];

export interface KeySignature {
  name: string;
  vexKey: string;
  accidentals: number;
  type: string;
  mode: string;
}

export function getRandomItems(array: KeySignature[], n: number, currentItem: KeySignature): KeySignature[] {
  // Exclude keys with the same key signature (same number of accidentals and type)
  // This guarantees we don't accidentally offer the relative major/minor as an incorrect option.
  const filtered = array.filter(item =>
    !(item.accidentals === currentItem.accidentals && item.type === currentItem.type)
  );
  const shuffled = shuffle(filtered);
  const selected = shuffled.slice(0, n);
  const result = shuffle([...selected, currentItem]);
  return result;
}
