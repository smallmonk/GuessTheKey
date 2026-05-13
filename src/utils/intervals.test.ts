import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateInterval, getRandomIntervals, INTERVALS } from './intervals.ts';
import type { Note } from './intervals.ts';

const NOTE_TO_SEMITONE: Record<string, number> = {
  'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
};

const ACCIDENTAL_TO_VAL: Record<string, number> = {
  '': 0, '#': 1, 'b': -1, '##': 2, 'bb': -2
};

const DIATONIC_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function calculateSemitones(note: Note): number {
  return (NOTE_TO_SEMITONE[note.name] ?? 0) + (ACCIDENTAL_TO_VAL[note.accidental] ?? 0) + (note.octave * 12);
}

function calculateDiatonicDistance(note1: Note, note2: Note): number {
  const idx1 = DIATONIC_NOTES.indexOf(note1.name);
  const idx2 = DIATONIC_NOTES.indexOf(note2.name);
  const totalSteps1 = idx1 + note1.octave * 7;
  const totalSteps2 = idx2 + note2.octave * 7;
  return totalSteps2 - totalSteps1;
}

describe('generateInterval', () => {
  const clefs = ['treble', 'bass', 'alto', 'tenor'];

  clefs.forEach(clef => {
    test(`should generate valid IntervalQuestion for clef: ${clef}`, () => {
      const question = generateInterval(clef);

      assert.strictEqual(question.clef, clef);
      assert.ok(question.notes.length === 2);
      assert.ok(INTERVALS.includes(question.interval));

      const [note1, note2] = question.notes;

      // Verify diatonic distance
      const actualDiatonicDistance = calculateDiatonicDistance(note1, note2);
      assert.strictEqual(actualDiatonicDistance, question.interval.diatonicSteps,
        `Diatonic distance mismatch for ${question.interval.name}. Expected ${question.interval.diatonicSteps}, got ${actualDiatonicDistance}`);

      // Verify semitone distance
      const semitones1 = calculateSemitones(note1);
      const semitones2 = calculateSemitones(note2);
      const actualSemitoneDistance = semitones2 - semitones1;
      assert.strictEqual(actualSemitoneDistance, question.interval.semitones,
        `Semitone distance mismatch for ${question.interval.name}. Expected ${question.interval.semitones}, got ${actualSemitoneDistance}`);
    });
  });

  test('should generate notes within reasonable octave range for each clef', () => {
    // Treble: baseOctave 4 or 5
    const trebleQuestion = generateInterval('treble');
    assert.ok(trebleQuestion.notes[0].octave >= 4 && trebleQuestion.notes[0].octave <= 5);

    // Bass: baseOctave 2 or 3
    const bassQuestion = generateInterval('bass');
    assert.ok(bassQuestion.notes[0].octave >= 2 && bassQuestion.notes[0].octave <= 3);

    // Alto/Tenor: baseOctave 3 or 4
    const altoQuestion = generateInterval('alto');
    assert.ok(altoQuestion.notes[0].octave >= 3 && altoQuestion.notes[0].octave <= 4);
    const tenorQuestion = generateInterval('tenor');
    assert.ok(tenorQuestion.notes[0].octave >= 3 && tenorQuestion.notes[0].octave <= 4);
  });
});

describe('getRandomIntervals', () => {
  const currentInterval = INTERVALS[0]; // Diminished 2nd

  test('should return n + 1 items', () => {
    const n = 3;
    const result = getRandomIntervals(n, currentInterval);
    assert.strictEqual(result.length, n + 1);
  });

  test('should include the current interval', () => {
    const result = getRandomIntervals(3, currentInterval);
    assert.ok(result.some(i => i.name === currentInterval.name));
  });

  test('returned intervals should be unique', () => {
    const result = getRandomIntervals(5, currentInterval);
    const names = result.map(i => i.name);
    const uniqueNames = new Set(names);
    assert.strictEqual(uniqueNames.size, names.length, 'All returned intervals should be unique');
  });

  test('should handle n larger than available intervals', () => {
    const result = getRandomIntervals(100, currentInterval);
    assert.strictEqual(result.length, INTERVALS.length);
  });
});
