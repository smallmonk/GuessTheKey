import { test } from 'node:test';
import assert from 'node:assert';
import { TIME_SIGNATURES, getRandomTimeSignatures, generateTimeSignatureQuestion } from './timeSignatures.ts';

test('getRandomTimeSignatures returns the correct count of items', () => {
  const count = 3;
  const result = getRandomTimeSignatures(count);
  assert.strictEqual(result.length, count, `Expected ${count} items, got ${result.length}`);
});

test('getRandomTimeSignatures respects the exclude parameter and filters equivalents', () => {
  const exclude = TIME_SIGNATURES.find(ts => ts.name === '4/4')!;
  const result = getRandomTimeSignatures(TIME_SIGNATURES.length, exclude);
  const found = result.find(ts => ts.name === '4/4');
  assert.strictEqual(found, undefined, 'Should not contain the excluded time signature');

  const foundEquivalent = result.find(ts => ts.name === '2/2');
  assert.strictEqual(foundEquivalent, undefined, 'Should not contain mathematically equivalent time signatures');
});

test('getRandomTimeSignatures handles counts exceeding the available list', () => {
  const count = TIME_SIGNATURES.length + 5;
  const result = getRandomTimeSignatures(count);
  assert.strictEqual(result.length, TIME_SIGNATURES.length, `Expected ${TIME_SIGNATURES.length} items, got ${result.length}`);
});

test('getRandomTimeSignatures returns unique items', () => {
  const count = TIME_SIGNATURES.length;
  const result = getRandomTimeSignatures(count);
  const names = result.map(ts => ts.name);
  const uniqueNames = new Set(names);
  assert.strictEqual(uniqueNames.size, names.length, 'All returned time signatures should be unique');
});

test('generateTimeSignatureQuestion returns a valid object structure', () => {
  const question = generateTimeSignatureQuestion('treble');
  assert.ok(question.timeSignature, 'Question should have a timeSignature');
  assert.ok(Array.isArray(question.notes), 'Question should have a notes array');
  assert.ok(question.notes.length > 0, 'Question should have at least one note');

  // Verify timeSignature is one of the valid ones
  const isValidTS = TIME_SIGNATURES.some(ts => ts.name === question.timeSignature.name);
  assert.ok(isValidTS, 'Should be a valid time signature');
});

test('generateTimeSignatureQuestion generates notes correctly for different clefs', () => {
  const clefs = ['treble', 'bass', 'alto', 'tenor'];

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

  clefs.forEach(clef => {
    const question = generateTimeSignatureQuestion(clef);
    const validPitches = pitchMap[clef];
    const restKey = restKeyMap[clef];

    question.notes.forEach(note => {
      note.keys.forEach(key => {
        if (note.duration.endsWith('r')) {
          assert.strictEqual(key, restKey, `Rest key for ${clef} should be ${restKey}, got ${key}`);
        } else {
          assert.ok(validPitches.includes(key), `Pitch ${key} should be valid for clef ${clef}`);
        }
      });
    });
  });
});
