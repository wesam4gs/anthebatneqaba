import React, { useState } from 'react';
import { SQL_DATABASE_SCHEMA, SCHEMA_TABLES_DOCS } from '../data/sqlSchema';
import { Database, Copy, Check, Download, Layers, ShieldCheck, ArrowRightLeft, FileCode } from 'lucide-react';

export const SqlSchemaViewer: React.FC = () => {
 const [copied, setCopied] = useState(false);
 const [activeSubTab, setActiveSubTab] = useState<'tables' | 'workflow' | 'sql'>('tables');

 const handleCopySql = () => {
 navigator.clipboard.writeText(SQL_DATABASE_SCHEMA);
 setCopied(true);
 setTimeout(() => setCopied(false), 2500);
 };

 const handleDownloadSql = () => {
 const element = document.createElement('a');
 const file = new Blob([SQL_DATABASE_SCHEMA], { type: 'text/plain' });
 element.href = URL.createObjectURL(file);
 element.download = 'syndicate_inspection_schema.sql';
 document.body.appendChild(element);
 element.click();
 document.body.removeChild(element);
 };

 return (
 <div className="space-y-6" id="schema-viewer-container">
 {/* Header */}
 <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl" id="schema-hero-banner">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" id="schema-hero-content">
 <div className="flex items-center gap-3.5">
 <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
 <Database className="w-8 h-8" />
 </div>
 <div>
 <h2 className="text-xl font-bold">سجل قاعدة البيانات والربط البرمجي</h2>
 <p className="text-xs text-slate-400">قاعدة البيانات الوطنية لنقابة التمريض العراقية (PostgreSQL DDL)</p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 id="copy-sql-btn"
 onClick={handleCopySql}
 className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition text-xs shadow cursor-pointer"
 >
 {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
 <span>{copied ? 'تم نسخ كود SQL' : 'نسخ سكربت SQL'}</span>
 </button>
 <button
 id="download-sql-btn"
 onClick={handleDownloadSql}
 className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition text-xs shadow cursor-pointer"
 >
 <Download className="w-4 h-4" />
 <span>تحميل ملف SQL (.sql)</span>
 </button>
 </div>
 </div>

 {/* Sub Navigation */}
 <div className="flex items-center gap-4 mt-6 border-b border-slate-800" id="schema-sub-tabs">
 <button
 id="tab-tables-doc"
 onClick={() => setActiveSubTab('tables')}
 className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
 activeSubTab === 'tables'
 ? 'border-amber-400 text-amber-400'
 : 'border-transparent text-slate-400 hover:text-slate-200'
 }`}
 >
 <Layers className="w-4 h-4" />
 <span>قاموس الجداول والهيكل المفهومي ({SCHEMA_TABLES_DOCS.length} جداول)</span>
 </button>

 <button
 id="tab-workflow-doc"
 onClick={() => setActiveSubTab('workflow')}
 className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
 activeSubTab === 'workflow'
 ? 'border-amber-400 text-amber-400'
 : 'border-transparent text-slate-400 hover:text-slate-200'
 }`}
 >
 <ArrowRightLeft className="w-4 h-4" />
 <span>دورة ربط البيانات (Workflow & Relationships)</span>
 </button>

 <button
 id="tab-code-sql"
 onClick={() => setActiveSubTab('sql')}
 className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
 activeSubTab === 'sql'
 ? 'border-amber-400 text-amber-400'
 : 'border-transparent text-slate-400 hover:text-slate-200'
 }`}
 >
 <FileCode className="w-4 h-4" />
 <span>سكربت SQL الكامل للإنشاء (PostgreSQL DDL)</span>
 </button>
 </div>
 </div>

 {/* Content */}
 {activeSubTab === 'tables' && (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="schema-tables-grid">
 {SCHEMA_TABLES_DOCS.map((tb, idx) => (
 <div key={idx} className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-5 shadow-sm space-y-2">
 <div className="flex items-center justify-between">
 <span className="font-mono text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-lg border border-amber-500/20">
 {tb.name}
 </span>
 <ShieldCheck className="w-4 h-4 text-emerald-500" />
 </div>
 <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-medium">
 {tb.desc}
 </p>
 </div>
 ))}
 </div>
 )}

 {activeSubTab === 'sql' && (
 <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto" id="sql-code-block">
 <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap leading-relaxed">
 {SQL_DATABASE_SCHEMA}
 </pre>
 </div>
 )}

 {activeSubTab === 'workflow' && (
 <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-6 space-y-4 text-xs text-[var(--theme-text-primary)] dark:text-slate-300">
 <h3 className="text-sm font-bold text-[var(--theme-text-primary)] dark:text-white">دورة العلاقات والربط الميداني:</h3>
 <p className="leading-relaxed">
 يرتبط المستخدم بصفة رئيس لجنة أو مفتش مع لجان التفتيش (`inspection_committees`). وتصادر اللجان مهام الزيارات (`inspection_assignments`) الموجهة إلى المؤسسات الصحية (`facilities`). في حال وجود خلل يتم تسجيل محضر مخالفة (`violation_records`) مرتبط بالمشفي واللجنة، مع ربط النطاقات الميدانية الخارطة (`district_zones`).
 </p>
 </div>
 )}
 </div>
 );
};
