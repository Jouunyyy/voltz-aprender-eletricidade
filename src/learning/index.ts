import { aprendiz } from './aprendiz.ts';
import { ajudante } from './ajudante.ts';
import { instalador } from './instalador.ts';
import { tecnico } from './tecnico.ts';
import { especialista } from './especialista.ts';
import type { LearningUnit } from './types.ts';

// Stable curriculum IDs also identify existing saved progress and Live levels.
export const learningUnits: Record<string, LearningUnit> = {
  ...aprendiz, ...ajudante, ...instalador, ...tecnico, ...especialista,
};
// Retain the existing diagrams where they illustrate the authored question.
const diagrams = [
  ['aprendiz-4', 4, 'ac-wave'],
  ['aprendiz-5', 0, 'open-circuit'],
  ['aprendiz-6', 4, 'series-open'],
  ['aprendiz-6', 5, 'parallel-open'],
] as const;
for (const [id, index, visual] of diagrams) learningUnits[id].questions[index].visual = visual;
