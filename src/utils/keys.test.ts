import { test, describe } from 'node:test';
import assert from 'node:assert';
import { KEYS, getRandomItems } from './keys.ts';

describe('getRandomItems for Keys', () => {
  const currentKey = KEYS.find(k => k.name === 'C Major')!; // 0 accidentals, none

  test('should return n + 1 items', () => {
    const n = 3;
    const result = getRandomItems(KEYS, n, currentKey);
    assert.strictEqual(result.length, n + 1);
  });

  test('should include the current item', () => {
    const result = getRandomItems(KEYS, 3, currentKey);
    assert.ok(result.some(k => k.name === 'C Major'));
  });

  test('should exclude keys with the same key signature', () => {
    // A Minor has the same signature as C Major (0 accidentals)
    const result = getRandomItems(KEYS, KEYS.length, currentKey);

    assert.ok(!result.some(k => k.name === 'A Minor'), 'Should not include A Minor when C Major is the current key');
    // Also should not have duplicate C Major
    const cMajorCount = result.filter(k => k.name === 'C Major').length;
    assert.strictEqual(cMajorCount, 1, 'Should include C Major exactly once');
  });

  test('should handle n larger than available filtered items', () => {
    const result = getRandomItems(KEYS, 100, currentKey);
    // KEYS has 26 items. 2 have 0 accidentals (C Major, A Minor).
    // Filtered should have 24 items.
    // Result should have 24 + 1 = 25 items.
    assert.strictEqual(result.length, 25);
  });

  test('returned items should be unique', () => {
     const result = getRandomItems(KEYS, 5, currentKey);
     const names = result.map(k => k.name);
     const uniqueNames = new Set(names);
     assert.strictEqual(uniqueNames.size, names.length, 'All returned keys should be unique');
  });
});
