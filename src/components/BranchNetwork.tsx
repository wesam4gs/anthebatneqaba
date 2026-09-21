import React, { useMemo, useState } from 'react';
import { Facility, InspectionAssignment, ViolationRecord, FinancialVoucher, User, DistrictZone } from '../types';
import { SYNDICATE_BRANCH_NETWORK, SyndicateBranchCard } from '../data/branchNetwork';
import { facilityTypeLabel } from '../utils/facilityLabels';
import {
  Radio, Landmark, MapPin, Phone, LogIn, RefreshCw, Eye, ChevronRight,
  Wallet, ShieldAlert, Calendar, ArrowRight, CheckCircle2
} from 'lucide-react';

interface BranchNetworkProps {
  facilities: Facility[];
  assignments: InspectionAssignment[];
  violations: ViolationRecord[];
  vouchers: FinancialVoucher[];
  users: User[];
  zones: DistrictZone[];
}

const assignmentStatusLabel = (status: InspectionAssignment['status']) => {
  if (status === 'COMPLETED') return 'مكتملة';
  if (status === 'IN_PROGRESS') return 'قيد التنفيذ';
  if (status === 'CANCELLED') return 'ملغاة';
  return 'مجدولة';
};

const inspectionStatusLabel = (status: Facility['inspectionStatus']) => {
  if (status === 'INSPECTED') return 'تم التفتيش';
  if (status === 'NEEDS_INSPECTION') return 'بانتظار الكشف';
  if (status === 'VIOLATION_RECORDED') return 'مخالفة مرصودة';
  return 'مغلقة';
};

export const BranchNetwork: React.FC<BranchNetworkProps> = ({
  facilities,
  assignments,
  violations,
  vouchers,
  users,
  zones: _zones
}) => {
  const [workspaceProvinceId, setWorkspaceProvinceId] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const statsFor = (provinceId: string) => {
    const facs = facilities.filter((f) => f.provinceId === provinceId);
    const ids = new Set(facs.map((f) => f.id));
    const tasks = assignments.filter((a) => ids.has(a.facilityId) && (a.status === 'PENDING' || a.status === 'IN_PROGRESS'));
    const pending = facs.filter((f) => f.inspectionStatus === 'NEEDS_INSPECTION' || f.inspectionStatus === 'VIOLATION_RECORDED');
    const vchs = vouchers.filter((v) => v.provinceId === provinceId);
    return {
      facilities: facs.length,
      pending: pending.length,
      tasks: tasks.length,
      vouchers: vchs.length,
      voucherTotal: vchs.reduce((s, v) => s + (Number(v.amountIqd) || 0), 0)
    };
  };

  const national = useMemo(() => {
    const pending = facilities.filter((f) => f.inspectionStatus === 'NEEDS_INSPECTION' || f.inspectionStatus === 'VIOLATION_RECORDED').length;
    const tasks = assignments.filter((a) => a.status === 'PENDING' || a.status === 'IN_PROGRESS').length;
    const voucherTotal = vouchers.reduce((s, v) => s + (Number(v.amountIqd) || 0), 0);
    return { pending, tasks, voucherTotal, violations: violations.length };
  }, [facilities, assignments, vouchers, violations]);

  const workspaceBranch = SYNDICATE_BRANCH_NETWORK.find((b) => b.provinceId === workspaceProvinceId) || null;

  const workspaceFacilities = useMemo(() => {
    if (!workspaceProvinceId) return [];
    return facilities.filter((f) => f.provinceId === workspaceProvinceId);
  }, [facilities, workspaceProvinceId]);

  const workspaceIds = useMemo(() => new Set(workspaceFacilities.map((f) => f.id)), [workspaceFacilities]);

  const workspaceAssignments = useMemo(
    () => assignments.filter((a) => workspaceIds.has(a.facilityId)),
    [assignments, workspaceIds]
  );

  const workspaceViolations = useMemo(
    () => violations.filter((v) => workspaceIds.has(v.facilityId)),
    [violations, workspaceIds]
  );

  const workspaceVouchers = useMemo(
    () => vouchers.filter((v) => v.provinceId === workspaceProvinceId),
    [vouchers, workspaceProvinceId]
  );

  const director = users.find(
    (u) => u.role === 'BRANCH_DIRECTOR' && workspaceBranch && (u.provinceId === workspaceBranch.provinceId || u.provinceName?.includes(workspaceBranch.provinceNameAr))
  );

  if (workspaceBranch) {
    const ws = statsFor(workspaceBranch.provinceId);
    return (
      <div className="space-y-5 animate-in fade-in" dir="rtl" id="branch-network-workspace">
        {toast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-2">{toast}</div>
        )}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setWorkspaceProvinceId(null)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mb-2"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة إلى شبكة الفروع
            </button>
            <h2 className="text-lg font-black text-slate-900">{workspaceBranch.name}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {workspaceBranch.address}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              المسؤول: {director?.name || workspaceBranch.manager} — لوحة التفتيش والكشوفات والمهام (بدون هويات)
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block">منشآت</span>
              <strong className="font-mono text-slate-900">{ws.facilities}</strong>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-amber-700 block">تحتاج تفتيش</span>
              <strong className="font-mono text-amber-900">{ws.pending}</strong>
            </div>
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100">
              <span className="text-cyan-700 block">مهام</span>
              <strong className="font-mono text-cyan-900">{ws.tasks}</strong>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 block">كشوفات</span>
              <strong className="font-mono text-emerald-900">{ws.vouchers}</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {workspaceBranch.sectors.map((s) => (
            <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{s}</span>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 font-bold text-sm flex items-center gap-2 text-slate-800">
            <Calendar className="w-4 h-4 text-amber-600" /> المهام المجدولة ({workspaceAssignments.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-200">
                <tr>
                  <th className="p-2.5">رمز المهمة</th>
                  <th className="p-2.5">المنشأة</th>
                  <th className="p-2.5">المفتش المكلف</th>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspaceAssignments.length === 0 && (
                  <tr><td colSpan={5} className="p-4 text-center text-slate-400">لا توجد مهام مجدولة في هذا الفرع</td></tr>
                )}
                {workspaceAssignments.map((a) => (
                  <tr key={a.id}>
                    <td className="p-2.5 font-mono font-bold text-amber-800">{a.assignmentCode}</td>
                    <td className="p-2.5 font-bold">{a.facilityName}</td>
                    <td className="p-2.5">{a.assignedInspectorName}</td>
                    <td className="p-2.5 font-mono">{a.scheduledDate}</td>
                    <td className="p-2.5">{assignmentStatusLabel(a.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 font-bold text-sm flex items-center gap-2 text-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> حالة التفتيش ({workspaceFacilities.length})
          </div>
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5">المنشأة</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">الحي</th>
                  <th className="p-2.5">حالة التفتيش</th>
                  <th className="p-2.5">آخر كشف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workspaceFacilities.slice(0, 50).map((f) => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-bold">{f.name}</td>
                    <td className="p-2.5">{facilityTypeLabel(f.type)}</td>
                    <td className="p-2.5">{f.neighborhood}</td>
                    <td className="p-2.5">{inspectionStatusLabel(f.inspectionStatus)}</td>
                    <td className="p-2.5 font-mono">{f.lastInspectionDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-100 font-bold text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" /> مخالفات التفتيش ({workspaceViolations.length})
            </div>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-2.5">المنشأة</th>
                    <th className="p-2.5">الوصف التشغيلي</th>
                    <th className="p-2.5">الغرامة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workspaceViolations.length === 0 && (
                    <tr><td colSpan={3} className="p-3 text-center text-slate-400">لا توجد مخالفات</td></tr>
                  )}
                  {workspaceViolations.map((v) => (
                    <tr key={v.id}>
                      <td className="p-2.5 font-bold">{v.facilityName}</td>
                      <td className="p-2.5">{v.description}</td>
                      <td className="p-2.5 font-mono">{(v.fineAmountIqd || 0).toLocaleString('ar-IQ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-100 font-bold text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" /> الكشوفات المالية ({workspaceVouchers.length})
            </div>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-200">
                  <tr>
                    <th className="p-2.5">رقم الكشف</th>
                    <th className="p-2.5">المنشأة</th>
                    <th className="p-2.5">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workspaceVouchers.length === 0 && (
                    <tr><td colSpan={3} className="p-3 text-center text-slate-400">لا توجد كشوفات مالية</td></tr>
                  )}
                  {workspaceVouchers.map((v) => (
                    <tr key={v.id}>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{v.voucherNumber}</td>
                      <td className="p-2.5">{v.facilityName || '—'}</td>
                      <td className="p-2.5 font-mono">{v.amountIqd.toLocaleString('ar-IQ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl" id="branch-network-grid">
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-4 py-2">{toast}</div>
      )}

      <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-800/70 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>الشبكة الوطنية الموحدة لنقابة التمريض العراقية</span>
            </div>
            <h2 className="text-xl font-black text-white">شبكة فروع المحافظات ⟵ المقر العام ببغداد (مركز التفتيش والكشوفات)</h2>
            <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed mt-1">
              تتولى الفروع جدولة الكشوفات الميدانية ومتابعة المنشآت، ثم ترفع نتائج التفتيش والكشوفات المالية إلى المقر العام. هذه اللوحة لا تعرض بيانات الهويات أو سجلات الانتساب.
            </p>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-700/50 px-4 py-2.5 rounded-xl text-center shrink-0">
            <span className="text-[11px] text-emerald-300 block">حالة الربط المركزي</span>
            <span className="text-xs font-black text-emerald-100 flex items-center justify-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {SYNDICATE_BRANCH_NETWORK.length} فرع متصل ومزامن
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-800/60 border border-emerald-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-black">
              <span>1. فروع المحافظات</span>
              <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">ميداني</span>
            </div>
            <p className="text-[11px] text-emerald-100">الكشف على العيادات التمريضية وعيادات القبالة والمستشفيات الأهلية.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-800/60 border border-emerald-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-black">
              <span>2. جدولة المهام</span>
              <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">تشغيلي</span>
            </div>
            <p className="text-[11px] text-emerald-100">توزيع أوامر الكشف على المفتشين حسب الحي والقطاع.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-800/60 border border-emerald-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-black">
              <span>3. المقر العام ببغداد</span>
              <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">رقابي</span>
            </div>
            <p className="text-[11px] text-emerald-100">تدقيق نتائج التفتيش والمخالفات واعتماد الإجراءات.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-800/60 border border-emerald-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-emerald-300 font-black">
              <span>4. الكشوفات المالية</span>
              <span className="text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">جباية</span>
            </div>
            <p className="text-[11px] text-emerald-100">وصولات الغرامات ورسوم الكشف المرتبطة بكل فرع.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">إجمالي الفروع المتصلة</span>
          <strong className="text-xl font-black text-slate-800 font-mono">{SYNDICATE_BRANCH_NETWORK.length} / {SYNDICATE_BRANCH_NETWORK.length}</strong>
          <span className="text-[10px] text-emerald-600 block mt-0.5 font-bold">100% ربط سحابي</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">منشآت تحتاج تفتيش</span>
          <strong className="text-xl font-black text-amber-700 font-mono">{national.pending}</strong>
          <span className="text-[10px] text-slate-400 block mt-0.5">من كافة المحافظات</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">مهام مجدولة نشطة</span>
          <strong className="text-xl font-black text-cyan-800 font-mono">{national.tasks}</strong>
          <span className="text-[10px] text-cyan-600 block mt-0.5 font-bold">قيد التنفيذ أو معلّقة</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">مخالفات مرصودة</span>
          <strong className="text-xl font-black text-red-800 font-mono">{national.violations}</strong>
          <span className="text-[10px] text-red-600 block mt-0.5">سجل تشغيلي للمنشآت</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 block">كشوفات مالية (IQD)</span>
          <strong className="text-xl font-black text-emerald-900 font-mono">{national.voucherTotal.toLocaleString('en-US')}</strong>
          <span className="text-[10px] text-emerald-600 block mt-0.5">جباية الفروع</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">مصفوفة فروع المحافظات (حالة الربط ولوحة التفتيش)</h3>
            <p className="text-xs text-slate-500">اضغط الدخول للفرع لاستعراض التفتيش والكشوفات والمهام المجدولة فقط.</p>
          </div>
          <button
            type="button"
            onClick={() => showToast('تمت إعادة مزامنة جميع الفروع مع خادم المقر العام ببغداد')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            مزامنة الشبكة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYNDICATE_BRANCH_NETWORK.map((branch: SyndicateBranchCard) => {
            const st = statsFor(branch.provinceId);
            return (
              <div
                key={branch.provinceId}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md flex flex-col overflow-hidden ${
                  branch.isHq ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'
                }`}
              >
                <div className="relative h-32 w-full bg-slate-800 overflow-hidden group">
                  <img
                    src={branch.landmarkPhoto}
                    alt={branch.landmarkName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-md ${
                      branch.isHq
                        ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                        : 'bg-black/60 text-white border border-white/20'
                    }`}>
                      {branch.isHq ? '⭐ المقر العام المركزي (بغداد)' : `محافظة ${branch.provinceNameAr}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setWorkspaceProvinceId(branch.provinceId)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1 shadow-md"
                    >
                      <LogIn className="w-3 h-3" />
                      الدخول للفرع
                    </button>
                  </div>
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center gap-1.5 text-white">
                    <Landmark className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-xs font-bold drop-shadow truncate">{branch.landmarkName}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <strong className="text-xs font-black text-slate-900 block">{branch.name}</strong>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{branch.address}</span>
                        </span>
                      </div>
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px] shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        متصل
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span><strong>المسؤول:</strong> {branch.manager}</span>
                      <span className="text-slate-500 font-mono text-[10px] flex items-center gap-1" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {branch.phone}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-1">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 block text-[9px]">منشآت</span>
                        <strong className="font-mono text-slate-800">{st.facilities}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                        <span className="text-amber-700 block text-[9px]">تحتاج كشف</span>
                        <strong className="font-mono text-amber-900">{st.pending}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-100">
                        <span className="text-cyan-700 block text-[9px]">مهام</span>
                        <strong className="font-mono text-cyan-900">{st.tasks}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                        <span className="text-emerald-700 block text-[9px]">كشوفات</span>
                        <strong className="font-mono text-emerald-900">{st.vouchers}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={() => setWorkspaceProvinceId(branch.provinceId)}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5 text-amber-300" />
                      الدخول للفرع وتصفحه كمدير
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceProvinceId(branch.provinceId);
                        showToast(`تم فتح لوحة التفتيش لـ ${branch.name}`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      استعراض التفتيش والكشوفات
                      <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
