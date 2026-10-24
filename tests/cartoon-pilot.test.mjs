import test from 'node:test';
import assert from 'node:assert/strict';
import { aprendiz } from '../src/learning/aprendiz.ts';
import { questions } from '../public/cartoon-pilot/questions.js';

test('cartoon pilot preserves the first five level-one questions and answer mapping', () => {
  assert.deepEqual(questions, aprendiz['aprendiz-1'].questions.slice(0, 5));
});
