import { test, describe } from 'node:test';
import assert from 'node:assert';
import { shuffle } from './arrayUtils.ts';

describe('shuffle', () => {
  test('should maintain the same elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);

    assert.strictEqual(result.length, input.length);
    assert.deepStrictEqual([...result].sort(), [...input].sort());
  });

  test('should return a new array and not mutate the original', () => {
    const input = [1, 2, 3, 4, 5];
    const inputCopy = [...input];
    const result = shuffle(input);

    assert.notStrictEqual(result, input);
    assert.deepStrictEqual(input, inputCopy);
  });

  test('should handle empty arrays', () => {
    const input: number[] = [];
    const result = shuffle(input);
    assert.deepStrictEqual(result, []);
    assert.notStrictEqual(result, input);
  });

  test('should handle single-element arrays', () => {
    const input = [1];
    const result = shuffle(input);
    assert.deepStrictEqual(result, [1]);
    assert.notStrictEqual(result, input);
  });
});
