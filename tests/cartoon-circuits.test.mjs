import test from 'node:test';
import assert from 'node:assert/strict';
import { lampStates } from '../src/cartoon-circuit-state.ts';

test('opening either series lamp interrupts both loads', () => {
  assert.deepEqual(lampStates('series', [true, true]), [true, true]);
  for (const connected of [[false, true], [true, false], [false, false]]) {
    assert.deepEqual(lampStates('series', connected), [false, false]);
  }
});
test('parallel branches remain electrically independent', () => {
  for (const connected of [[true, true], [false, true], [true, false], [false, false]]) {
    assert.deepEqual(lampStates('parallel', connected), connected);
  }
});
