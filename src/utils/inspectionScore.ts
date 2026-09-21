import { InspectionFormSchema, InspectionQuestionSchema } from '../types';

export type FormAnswerValue = string | boolean | number | 'PASS' | 'FAIL' | 'NA' | null;

export function isQuestionVisible(
  question: InspectionQuestionSchema,
  schema: InspectionFormSchema,
  answers: Record<string, FormAnswerValue>
): boolean {
  for (const cat of schema.categories) {
    for (const q of cat.questions) {
      if (!q.branchOn?.showQuestionIds.includes(question.id)) continue;
      const raw = answers[q.id];
      const expected = q.branchOn.when;
      if (String(raw) === String(expected) || (expected === 'true' && raw === true) || (expected === 'false' && raw === false)) {
        return true;
      }
      return false;
    }
  }
  return true;
}

export function calculateDynamicComplianceScore(
  schema: InspectionFormSchema,
  answers: Record<string, FormAnswerValue>
): number {
  let passed = 0;
  let total = 0;

  schema.categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((cat) => {
      cat.questions.forEach((q) => {
        if (q.weight <= 0) return;
        if (!isQuestionVisible(q, schema, answers)) return;
        const value = answers[q.id];
        if (value === 'NA' || value === null || value === undefined || value === '') return;

        total += q.weight;
        const pass =
          value === 'PASS' ||
          value === true ||
          value === 'true' ||
          (typeof value === 'number' && value > 0);
        if (pass) passed += q.weight;
      });
    });

  if (total === 0) return 100;
  return Math.round((passed / total) * 100);
}
