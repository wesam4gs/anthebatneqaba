import React, { useMemo } from 'react';
import { InspectionTemplate } from '../types';
import { FormAnswerValue, calculateDynamicComplianceScore, isQuestionVisible } from '../utils/inspectionScore';

interface DynamicInspectionFormProps {
  template: InspectionTemplate;
  answers: Record<string, FormAnswerValue>;
  onChange: (answers: Record<string, FormAnswerValue>, score: number) => void;
}

export const DynamicInspectionForm: React.FC<DynamicInspectionFormProps> = ({ template, answers, onChange }) => {
  const schema = template.schemaJson;
  const score = useMemo(() => calculateDynamicComplianceScore(schema, answers), [schema, answers]);

  const setAnswer = (id: string, value: FormAnswerValue) => {
    const next = { ...answers, [id]: value };
    onChange(next, calculateDynamicComplianceScore(schema, next));
  };

  const categories = [...schema.categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-3" dir="rtl" id="dynamic-inspection-form">
      <div className="bg-slate-900/70 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-white text-xs">{template.nameAr}</h4>
          <p className="text-[10px] text-slate-300">قالب ديناميكي v{template.version} — يُحدَّث من المقر دون تعديل الكود</p>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block">نسبة الالتزام</span>
          <strong className={`font-mono text-sm ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
            {score}%
          </strong>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-2">
          <h5 className="text-[11px] font-black text-cyan-300 px-1">{cat.titleAr}</h5>
          {cat.questions.map((q) => {
            if (!isQuestionVisible(q, schema, answers)) return null;
            const value = answers[q.id];
            return (
              <div key={q.id} className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-white text-xs leading-snug">{q.titleAr}</p>
                    {q.helpAr && <p className="text-[9px] text-slate-400 mt-0.5">{q.helpAr}</p>}
                    {q.required && <span className="text-[9px] text-amber-400">إلزامي</span>}
                  </div>
                  {q.weight > 0 && (
                    <span className="text-[9px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md font-mono">{q.weight} pts</span>
                  )}
                </div>

                {q.inputType === 'PASS_FAIL' && (
                  <div className="flex items-center gap-2">
                    {(['PASS', 'FAIL', 'NA'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setAnswer(q.id, st)}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black ${
                          value === st
                            ? st === 'PASS'
                              ? 'bg-emerald-500 text-slate-950'
                              : st === 'FAIL'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-500 text-white'
                            : 'bg-slate-900 text-slate-200 border border-white/15'
                        }`}
                      >
                        {st === 'PASS' ? 'مطابق' : st === 'FAIL' ? 'مخالف' : 'لا ينطبق'}
                      </button>
                    ))}
                  </div>
                )}

                {q.inputType === 'TOGGLE' && (
                  <button
                    type="button"
                    onClick={() => setAnswer(q.id, value === true ? false : true)}
                    className={`w-full py-2 rounded-xl text-[11px] font-black ${
                      value === true ? 'bg-emerald-500 text-slate-950' : 'bg-rose-950 text-rose-200 border border-rose-600'
                    }`}
                  >
                    {value === true ? 'متوفر / مستوفٍ' : 'غير متوفر'}
                  </button>
                )}

                {q.inputType === 'RADIO' && (
                  <div className="space-y-1.5">
                    {(q.options || []).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.value)}
                        className={`w-full text-right px-3 py-2 rounded-xl text-[11px] font-bold ${
                          value === opt.value ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-200 border border-white/10'
                        }`}
                      >
                        {opt.labelAr}
                      </button>
                    ))}
                  </div>
                )}

                {q.inputType === 'TEXTAREA' && (
                  <textarea
                    value={String(value || '')}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-2 text-xs text-white"
                    placeholder="أدخل الملاحظة الميدانية..."
                  />
                )}

                {q.inputType === 'NUMBER' && (
                  <input
                    type="number"
                    value={value === null || value === undefined ? '' : String(value)}
                    onChange={(e) => setAnswer(q.id, e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-2 text-xs text-white"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
