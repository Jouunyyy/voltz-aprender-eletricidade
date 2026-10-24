import type { Check } from '../curriculum.ts';

export type LearningUnit = {
  context: string;
  example: string;
  reasoning: string;
  misconception: string;
  questions: Check[];
};
// Authoring tuple: question, correct option, two plausible distractors, explanation.
export type QuestionRow = [string, string, string, string, string];
export function unit(context: string, example: string, reasoning: string, misconception: string, rows: QuestionRow[]): LearningUnit {
  return { context, example, reasoning, misconception,
    questions: rows.map(([q, correct, second, third, explanation]) => ({ q, options: [correct, second, third], answer: 0, explanation })) };
}
