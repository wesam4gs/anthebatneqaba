import React, { useState } from 'react';
import { ViolationRecord } from '../types';
import { AlertTriangle, Download, Printer, FileSpreadsheet, FileText, CheckCircle2, Building2, ShieldAlert } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { SyndicateLogo } from './SyndicateLogo';

interface ViolationsReportProps {
  violations: ViolationRecord[];
}

export const ViolationsReport: React.FC<ViolationsReportProps> = ({ violations }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const headers = [
      'رقم المخالفة',
      'اسم المنشأة/العيادة',
      'تاريخ الرصد',
      'نوع الإجراء/الدرجة',
      'تفاصيل وتوصيف المخالفة',
      'مبلغ الغرامة الموصى به (د.ع)',
      'حالة المتابعة'
    ];

    const rows = violations.map(v => [
      v.id,
      v.facilityName,
      new Date(v.recordedAt).toLocaleDateString('ar-IQ'),
      v.severity === 'TEMPORARY_CLOSURE' ? 'توصية بالإغلاق' : v.severity === 'FINE' ? 'غرامة مالية' : 'إنذار رسمي',
      v.description,
      v.fineAmountIqd || 0,
      v.status === 'PENDING' ? 'قيد المتابعة' : v.status === 'RESOLVED' ? 'تمت التسوية' : 'محالة للجهات القضائية'
    ]);

    exportToCSV('تقرير_المخالفات_الميدانية_والإنذارات', headers, rows);
  };

  // Total calculated fines
  const totalFines = violations.reduce((acc, v) => acc + (v.fineAmountIqd || 0), 0);
  const closuresCount = violations.filter(v => v.severity === 'TEMPORARY_CLOSURE').length;
  const finesCount = violations.filter(v => v.severity === 'FINE').length;

  return (
    <div className="space-y-6" id="violations-report-view">
      {/* Header & Export Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold mb-1">
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>السجل الوطني للمخالفات والعقوبات النقابية</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">سجل المخالفات الميدانية والإنذارات</h2>
          <p className="text-xs text-slate-400 mt-1">
            توثيق المخالفات الميدانية بحق المستشفيات والعيادات الأهلية والكوادر غير المرخصة
          </p>
        </div>

        {/* Action Buttons & Counter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Export Buttons */}
          <button
            type="button"
            id="export-violations-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إلى Excel</span>
          </button>

          <button
            type="button"
            id="export-violations-pdf-btn"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs shadow transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة تقرير PDF للوزارة</span>
          </button>

          <div className="bg-red-950/60 border border-red-800/80 px-4 py-1.5 rounded-xl text-center shrink-0">
            <span className="text-slate-400 text-[10px] block font-semibold">إجمالي المخالفات:</span>
            <span className="text-xl font-black text-red-400 font-mono">{violations.length}</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="violations-cards-grid">
        {violations.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:shadow-md transition">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2">
              <div>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1">
                  مخالفة مرصودة
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{v.facilityName}</h3>
              </div>

              <span className="font-mono text-xs font-black text-slate-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                {v.severity === 'TEMPORARY_CLOSURE' ? 'توصية بالإغلاق' : v.severity === 'FINE' ? 'غرامة مالية' : 'إنذار رسمي'}
              </span>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {v.description}
            </p>

            {v.fineAmountIqd > 0 && (
              <div className="flex items-center justify-between text-xs bg-red-50 text-red-900 p-2.5 rounded-lg border border-red-200 font-bold">
                <span>مبلغ الغرامة الموصى به:</span>
                <span className="font-mono text-sm">{v.fineAmountIqd.toLocaleString()} دينار عراقي</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <span>تاريخ الرصد: {new Date(v.recordedAt).toLocaleDateString('ar-IQ')}</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{v.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* FORMAL MINISTRY REPORT PRINTABLE MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="violations-print-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-slate-300 overflow-hidden my-auto printable-report-area text-slate-900">
            {/* Modal Controls (Hidden during print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">معاينة التقرير الرسمي لوزارة الصحة والجهات القضائية</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة أو حفظ كـ PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* FORMAL REPORT CONTENT (Printed Area) */}
            <div className="space-y-6 text-right dir-rtl overflow-y-auto flex-1 my-2 pr-1">
              {/* Official Iraq Ministry Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 text-xs font-bold">
                <div className="text-right space-y-1">
                  <p className="text-sm font-black text-slate-900">جمهورية العراق</p>
                  <p className="text-slate-800">وزارة الصحة - الأمانة العامة</p>
                  <p className="text-slate-800">نقابة التمريض العراقية - المركز الرئيسي</p>
                  <p className="text-amber-800 text-[11px]">قسم التفتيش والرقابة الميدانية</p>
                </div>

                <div className="text-center space-y-1">
                  <SyndicateLogo className="w-20 h-20 mx-auto" />
                  <p className="text-[10px] text-slate-700 font-black">نقابة التمريض العراقية</p>
                </div>

                <div className="text-left font-mono space-y-1 dir-ltr">
                  <p><span className="font-bold">العدد:</span> REF-VIOL-2026-9081</p>
                  <p><span className="font-bold">التاريخ:</span> {new Date().toLocaleDateString('ar-IQ')}</p>
                  <p><span className="font-bold">التصنيف:</span> سري للغاية وشخصي</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2 bg-slate-100 rounded-xl border border-slate-300">
                <h2 className="text-lg font-black text-slate-900">تقرير المتابعة التفتيشية والمخالفات الميدانية المرصودة</h2>
                <p className="text-xs text-slate-600 font-bold mt-0.5">مرفوع إلى وزارة الصحة واللجان القضائية المختصة</p>
              </div>

              {/* Summary Stats Cards */}
              <div className="grid grid-cols-3 gap-3 text-xs font-bold text-center">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-slate-600 block text-[10px]">إجمالي المخالفات المرصودة:</span>
                  <span className="text-lg text-slate-900 font-mono mt-0.5 block">{violations.length} مخالفة</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-slate-600 block text-[10px]">مجموع الغرامات الموصى بها:</span>
                  <span className="text-lg text-emerald-800 font-mono mt-0.5 block">{totalFines.toLocaleString()} د.ع</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-slate-600 block text-[10px]">التوصيات بالإغلاق والتوقف:</span>
                  <span className="text-lg text-red-700 font-mono mt-0.5 block">{closuresCount} منشأة</span>
                </div>
              </div>

              {/* Official Data Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-800 text-white font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">اسم المنشأة/العيادة</th>
                      <th className="p-2.5">نوع الإجراء الموصى به</th>
                      <th className="p-2.5">توصيف المخالفة</th>
                      <th className="p-2.5">مبلغ الغرامة (د.ع)</th>
                      <th className="p-2.5">تاريخ الرصد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {violations.map((v, index) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-500">{index + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">{v.facilityName}</td>
                        <td className="p-2.5 font-bold">
                          {v.severity === 'TEMPORARY_CLOSURE' ? 'إغلاق تحفظي' : v.severity === 'FINE' ? 'فرض غرامة' : 'إنذار رسمي'}
                        </td>
                        <td className="p-2.5 text-slate-800 leading-snug">{v.description}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {v.fineAmountIqd ? `${v.fineAmountIqd.toLocaleString()} د.ع` : '-'}
                        </td>
                        <td className="p-2.5 font-mono">{new Date(v.recordedAt).toLocaleDateString('ar-IQ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Official Stamp Footer */}
              <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-bold border-t border-slate-300">
                <div className="space-y-8">
                  <p className="text-slate-800">رئيس لجنة التفتيش المركزية</p>
                  <p className="text-slate-500 font-mono">التوقيع: .....................</p>
                </div>

                <div className="space-y-8">
                  <p className="text-slate-800">مدير القسم القانوني والنقابي</p>
                  <p className="text-slate-500 font-mono">التوقيع: .....................</p>
                </div>

                <div className="space-y-8">
                  <p className="text-slate-800">نقيب التمريض العراقي</p>
                  <div className="w-20 h-20 mx-auto border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center text-[10px] text-amber-900 font-bold bg-amber-50">
                    ختم المصادقة
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
