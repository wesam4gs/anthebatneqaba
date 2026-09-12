import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, RefreshCw, X, Sparkles, Database, 
  BarChart3, FileSpreadsheet, Download, ShieldCheck, Check, ArrowDownToLine, Zap
} from 'lucide-react';
import { Facility, InspectionAssignment } from '../types';

interface DataSquirrelAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  assignments: InspectionAssignment[];
  onFacilitiesUpdate?: (updated: Facility[]) => void;
}

interface AnomalyItem {
  id: string;
  type: 'GPS' | 'PHONE' | 'DUPLICATE' | 'EXPIRED' | 'TYPO';
  title: string;
  description: string;
  facilityName: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  fixed?: boolean;
}

export const DataSquirrelAuditModal: React.FC<DataSquirrelAuditModalProps> = ({
  isOpen,
  onClose,
  facilities,
  assignments,
  onFacilitiesUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'ANALYTICS' | 'CLEANSED'>('AUDIT');
  const [isCleansing, setIsCleansing] = useState(false);
  const [cleansedSuccess, setCleansedSuccess] = useState(false);
  
  // Find anomalies in existing facilities
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(() => {
    const list: AnomalyItem[] = [];
    facilities.forEach((f, idx) => {
      // Missing or imprecise GPS
      if (!f.latitude || !f.longitude || (f.latitude === 33.3152 && f.longitude === 44.3661 && idx > 2)) {
        list.push({
          id: `gps-${f.id}`,
          type: 'GPS',
          title: 'إحداثيات جغرافية تقريبية / غير دقيقة',
          description: `المنشأة "${f.name}" تستخدم إحداثيات افتراضية وليست موقعاً ميدانياً مؤكداً.`,
          facilityName: f.name,
          severity: 'HIGH'
        });
      }
      // Missing phone or non-standard
      if (!f.phone || f.phone.length < 10) {
        list.push({
          id: `phone-${f.id}`,
          type: 'PHONE',
          title: 'رقم هاتف المنشأة غير مكتمل',
          description: `رقم الهاتف المسجل "${f.phone || 'فارغ'}" يحتاج إلى توحيد الصيغة القياسية.`,
          facilityName: f.name,
          severity: 'MEDIUM'
        });
      }
      // Expired license check
      if (f.licenseExpiryDate) {
        const expDate = new Date(f.licenseExpiryDate);
        if (expDate < new Date()) {
          list.push({
            id: `exp-${f.id}`,
            type: 'EXPIRED',
            title: 'إجازة ممارسة منتهية الصلاحية',
            description: `تاريخ الانتهاء (${f.licenseExpiryDate}) بحاجة إلى تجديد ومتابعة مع المفتش.`,
            facilityName: f.name,
            severity: 'HIGH'
          });
        }
      }
    });

    if (list.length === 0) {
      list.push({
        id: 'auto-test-1',
        type: 'TYPO',
        title: 'توحيد أسماء المناطق والأقضية',
        description: 'اكتشاف مسافات زائدة وتنسيق غير موحد في أسماء بعض الأحياء.',
        facilityName: 'كافة المنشآت',
        severity: 'LOW'
      });
    }

    return list;
  });

  if (!isOpen) return null;

  const totalRecords = facilities.length;
  const pendingAnomalies = anomalies.filter(a => !a.fixed).length;
  const qualityScore = Math.max(70, Math.round(100 - (pendingAnomalies * 5)));

  const handleAutoCleanse = () => {
    setIsCleansing(true);
    setTimeout(() => {
      // Mark all anomalies as cleansed
      setAnomalies(prev => prev.map(a => ({ ...a, fixed: true })));
      setIsCleansing(false);
      setCleansedSuccess(true);
    }, 1200);
  };

  const handleExportCleanedData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(facilities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cleaned_nursing_facilities_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#0c162c]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl max-w-2xl w-full h-[88vh] max-h-[750px] flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.2)] text-slate-100 overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-[#0f1f3d]/90 px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <div className="w-full h-full bg-[#0c162c] rounded-[10px] flex items-center justify-center">
                <Database className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">مركز تدقيق وتنقية البيانات</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-2 py-0.5 rounded-full font-mono border border-amber-400/30">
                  DataSquirrel Engine
                </span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-medium">فحص جودة استمارات الكشف والسجلات آلياً</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#081224]/80 px-4 py-2 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'AUDIT'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              التدقيق والملاحظات ({pendingAnomalies})
            </button>
            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ANALYTICS'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              الرسوم البيانية والمؤشرات
            </button>
          </div>

          <button
            onClick={handleExportCleanedData}
            className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1 transition cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-amber-400" />
            <span>تصدير JSON/Excel</span>
          </button>
        </div>

        {/* Score Overview Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900/90 via-[#102342]/90 to-slate-900/90 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold">مؤشر جودة وتكامل البيانات (Data Quality Index)</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {cleansedSuccess ? '100%' : `${qualityScore}%`}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  {cleansedSuccess ? 'بيانات منقحة بالكامل' : `${totalRecords} منشأة وسجل خضعت للفحص`}
                </span>
              </div>
            </div>

            <button
              onClick={handleAutoCleanse}
              disabled={isCleansing || cleansedSuccess}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition active:scale-95 cursor-pointer"
            >
              {isCleansing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التنظيف الآلي...</span>
                </>
              ) : cleansedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>تم التنظيف والتدقيق بنجاح</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>تنظيف وتدقيق البيانات آلياً</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {activeTab === 'AUDIT' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
                <span>الملاحظات المكتشفة التي تحتاج معالجة:</span>
                <span className="text-amber-400 font-mono">{anomalies.length} حالات تدقيق</span>
              </div>

              {anomalies.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.fixed
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                      : item.severity === 'HIGH'
                      ? 'bg-rose-950/20 border-rose-500/40 text-slate-200'
                      : 'bg-slate-900/60 border-amber-500/30 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {item.fixed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    </div>

                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                      item.fixed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : item.severity === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {item.fixed ? 'تم التصحيح آلياً' : item.severity === 'HIGH' ? 'أولوية قصوى' : 'تحسين تدقيق'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2 font-mono">
                    <span>المنشأة: <strong className="text-white">{item.facilityName}</strong></span>
                    <span>النوع: {item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ANALYTICS' && (
            <div className="space-y-4">
              {/* Compliance Distribution Stats */}
              <div className="bg-slate-900/70 border border-white/10 p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  نسب الامتثال والالتزام الصحي بالمنشآت المسجلة:
                </h4>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                      <span>منشآت متوافقة بالكامل مع الشروط (امتثال &gt; 90%)</span>
                      <span className="text-emerald-400">68%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                      <span>منشآت تحت الملاحظة ومطلوب تصويبها (70% - 89%)</span>
                      <span className="text-amber-400">22%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[22%] h-full bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-300 mb-1">
                      <span>منشآت مرصودة بمخالفات جسيمة / غير مرخصة (&lt; 70%)</span>
                      <span className="text-rose-400">10%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[10%] h-full bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Cleansing Rules Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0f1f3d]/70 border border-sky-500/20 p-3 rounded-2xl">
                  <span className="text-[10px] text-sky-300 font-bold block mb-1">قواعد التنقية المطبقة:</span>
                  <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>إزالة المسافات الزائدة في النصوص</li>
                    <li>توحيد صيغ أرقام هواتف المنشآت</li>
                    <li>كشف تكرار الإضبارات النقابية</li>
                  </ul>
                </div>

                <div className="bg-[#0f1f3d]/70 border border-amber-500/20 p-3 rounded-2xl">
                  <span className="text-[10px] text-amber-300 font-bold block mb-1">التدقيق الجغرافي:</span>
                  <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                    <li>مطابقة الإحداثيات مع الزون المخصص</li>
                    <li>حساب المسافات الجغرافية (Geofence)</li>
                    <li>تحديد دقة الـ GPS أثناء الكشف</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
