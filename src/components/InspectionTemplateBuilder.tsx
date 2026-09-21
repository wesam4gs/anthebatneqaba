import React, { useMemo, useState } from 'react';
import { InspectionCategorySchema, InspectionInputType, InspectionQuestionSchema, InspectionTemplate } from '../types';
import { ChevronDown, ChevronUp, Plus, Save, Trash2, CheckCircle2 } from 'lucide-react';

interface InspectionTemplateBuilderProps {
  templates: InspectionTemplate[];
  onSave: (template: InspectionTemplate) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
}

const emptyQuestion = (id: string): InspectionQuestionSchema => ({
  id,
  titleAr: 'بند جديد',
  inputType: 'PASS_FAIL',
  weight: 10,
  required: true
});

export const InspectionTemplateBuilder: React.FC<InspectionTemplateBuilderProps> = ({
  templates,
  onSave,
  onActivate,
  onDelete
}) => {
  const [selectedId, setSelectedId] = useState<string>(templates.find((t) => t.isActive)?.id || templates[0]?.id || '');
  React.useEffect(() => {
    if (selectedId && templates.some((t) => t.id === selectedId)) return;
    setSelectedId(templates.find((t) => t.isActive)?.id || templates[0]?.id || '');
  }, [templates, selectedId]);
  const selected = templates.find((t) => t.id === selectedId) || templates[0];
  const [draft, setDraft] = useState<InspectionTemplate | null>(null);
  const working = draft && draft.id === selected?.id ? draft : selected;

  const categories = useMemo(
    () => (working ? [...working.schemaJson.categories].sort((a, b) => a.sortOrder - b.sortOrder) : []),
    [working]
  );

  if (!working) {
    return <div className="p-6 text-sm text-slate-500">لا توجد قوالب بعد.</div>;
  }

  const commit = (next: InspectionTemplate) => {
    setDraft({ ...next, updatedAt: new Date().toISOString().slice(0, 10), version: next.version + (draft ? 0 : 0) });
  };

  const updateCats = (cats: InspectionCategorySchema[]) => {
    commit({ ...working, schemaJson: { ...working.schemaJson, categories: cats } });
  };

  const moveCat = (index: number, dir: -1 | 1) => {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    updateCats(next.map((c, i) => ({ ...c, sortOrder: i + 1 })));
  };

  const addCategory = () => {
    const id = `cat_${Date.now()}`;
    updateCats([...categories, { id, titleAr: 'فئة جديدة', sortOrder: categories.length + 1, questions: [emptyQuestion(`${id}_q1`)] }]);
  };

  const addQuestion = (catId: string) => {
    updateCats(
      categories.map((c) =>
        c.id === catId ? { ...c, questions: [...c.questions, emptyQuestion(`q_${Date.now()}`)] } : c
      )
    );
  };

  const patchQuestion = (catId: string, qId: string, patch: Partial<InspectionQuestionSchema>) => {
    updateCats(
      categories.map((c) =>
        c.id !== catId ? c : { ...c, questions: c.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)) }
      )
    );
  };

  const handleSave = () => {
    onSave({ ...working, version: working.version + 1, updatedAt: new Date().toISOString().slice(0, 10) });
    setDraft(null);
  };

  return (
    <div className="space-y-5" dir="rtl" id="inspection-template-builder">
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-black">محرك استمارات الكشف الديناميكي (JSON)</h2>
        <p className="text-xs text-slate-400 mt-1">
          أضف فئات وبنوداً وأوزاناً وأنواع حقول دون تعديل كود التطبيق الميداني. القالب النشط يُعرض فوراً على PWA المفتش.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <aside className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedId(t.id);
                setDraft(null);
              }}
              className={`w-full text-right p-3 rounded-xl text-xs font-bold border ${
                working.id === t.id ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <span className="block">{t.nameAr}</span>
              <span className="text-[10px] text-slate-500">{t.code} · v{t.version}</span>
              {t.isActive && <span className="text-[10px] text-emerald-700 block mt-1">نشط ميدانياً</span>}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="border border-slate-200 rounded-xl p-2 text-sm font-bold"
              value={working.nameAr}
              onChange={(e) => commit({ ...working, nameAr: e.target.value })}
            />
            <input
              className="border border-slate-200 rounded-xl p-2 text-sm font-mono"
              value={working.code}
              onChange={(e) => commit({ ...working, code: e.target.value })}
            />
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> حفظ القالب
              </button>
              <button type="button" onClick={() => onActivate(working.id)} className="px-3 py-2 rounded-xl bg-cyan-700 text-white text-xs font-black flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> تفعيل للمفتشين
              </button>
              <button type="button" onClick={addCategory} className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> فئة جديدة
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = `tpl_${Date.now()}`;
                  onSave({
                    id,
                    code: `TPL-${Date.now()}`,
                    nameAr: 'قالب كشف جديد',
                    facilityType: 'ALL',
                    isActive: false,
                    version: 1,
                    createdAt: new Date().toISOString().slice(0, 10),
                    updatedAt: new Date().toISOString().slice(0, 10),
                    schemaJson: { version: 1, categories: [{ id: `${id}_cat`, titleAr: 'فئة أولى', sortOrder: 1, questions: [emptyQuestion(`${id}_q1`)] }] }
                  });
                  setSelectedId(id);
                  setDraft(null);
                }}
                className="px-3 py-2 rounded-xl bg-violet-700 text-white text-xs font-black flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> قالب جديد
              </button>
              <button
                type="button"
                onClick={() => {
                  if (templates.length <= 1) return;
                  onDelete(working.id);
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black"
              >
                حذف القالب
              </button>
            </div>
          </div>

          {categories.map((cat, idx) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl p-2 text-sm font-black"
                  value={cat.titleAr}
                  onChange={(e) => updateCats(categories.map((c) => (c.id === cat.id ? { ...c, titleAr: e.target.value } : c)))}
                />
                <button type="button" onClick={() => moveCat(idx, -1)} className="p-2 rounded-lg bg-slate-100"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveCat(idx, 1)} className="p-2 rounded-lg bg-slate-100"><ChevronDown className="w-4 h-4" /></button>
                <button
                  type="button"
                  onClick={() => updateCats(categories.filter((c) => c.id !== cat.id))}
                  className="p-2 rounded-lg bg-rose-50 text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {cat.questions.map((q) => (
                <div key={q.id} className="border border-slate-100 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50">
                  <input
                    className="sm:col-span-6 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                    value={q.titleAr}
                    onChange={(e) => patchQuestion(cat.id, q.id, { titleAr: e.target.value })}
                  />
                  <select
                    className="sm:col-span-3 border border-slate-200 rounded-lg p-2 text-xs"
                    value={q.inputType}
                    onChange={(e) => patchQuestion(cat.id, q.id, { inputType: e.target.value as InspectionInputType })}
                  >
                    <option value="PASS_FAIL">مطابق / مخالف</option>
                    <option value="TOGGLE">مفتاح نعم/لا</option>
                    <option value="RADIO">خيارات</option>
                    <option value="TEXTAREA">ملاحظة نصية</option>
                    <option value="NUMBER">رقم</option>
                  </select>
                  <input
                    type="number"
                    className="sm:col-span-2 border border-slate-200 rounded-lg p-2 text-xs font-mono"
                    value={q.weight}
                    onChange={(e) => patchQuestion(cat.id, q.id, { weight: Number(e.target.value) || 0 })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateCats(categories.map((c) => (c.id === cat.id ? { ...c, questions: c.questions.filter((x) => x.id !== q.id) } : c)))
                    }
                    className="sm:col-span-1 p-2 rounded-lg bg-white border border-rose-200 text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <label className="sm:col-span-12 text-[11px] flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => patchQuestion(cat.id, q.id, { required: e.target.checked })}
                    />
                    بند إلزامي
                  </label>
                  {q.inputType === 'RADIO' && (
                    <div className="sm:col-span-12 space-y-1">
                      {(q.options || []).map((opt, oi) => (
                        <div key={`${q.id}_${oi}`} className="flex gap-2">
                          <input
                            className="flex-1 border border-slate-200 rounded-lg p-1.5 text-[11px]"
                            value={opt.labelAr}
                            onChange={(e) => {
                              const options = [...(q.options || [])];
                              options[oi] = { ...opt, labelAr: e.target.value };
                              patchQuestion(cat.id, q.id, { options });
                            }}
                          />
                          <input
                            className="w-28 border border-slate-200 rounded-lg p-1.5 text-[11px] font-mono"
                            value={opt.value}
                            onChange={(e) => {
                              const options = [...(q.options || [])];
                              options[oi] = { ...opt, value: e.target.value };
                              patchQuestion(cat.id, q.id, { options });
                            }}
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-[11px] font-bold text-cyan-800"
                        onClick={() =>
                          patchQuestion(cat.id, q.id, {
                            options: [...(q.options || []), { value: `opt_${Date.now()}`, labelAr: 'خيار جديد' }]
                          })
                        }
                      >
                        + خيار راديو
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button type="button" onClick={() => addQuestion(cat.id)} className="text-xs font-bold text-emerald-800">
                + إضافة بند في هذه الفئة
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
