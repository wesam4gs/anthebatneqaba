import React, { useState } from 'react';
import { Facility, Province, DistrictZone } from '../types';
import { Search, Filter, Plus, Calendar, MapPin, Building2, User, Phone, CheckCircle2, AlertTriangle, Clock, ChevronRight, FileSpreadsheet, Printer } from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';
import { SyndicateLogo } from './SyndicateLogo';

interface FacilitiesTableProps {
 facilities: Facility[];
 provinces: Province[];
 zones: DistrictZone[];
 onSelectFacility: (facility: Facility) => void;
 onNewAssignmentRequested: (facility: Facility) => void;
 onAddFacilityModalOpen: () => void;
}

export const FacilitiesTable: React.FC<FacilitiesTableProps> = ({
 facilities,
 provinces,
 zones,
 onSelectFacility,
 onNewAssignmentRequested,
 onAddFacilityModalOpen
}) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedProvinceId, setSelectedProvinceId] = useState('ALL');
 const [selectedZoneId, setSelectedZoneId] = useState('ALL');
 const [selectedNeighborhood, setSelectedNeighborhood] = useState('ALL');
 const [statusFilter, setStatusFilter] = useState('ALL');

 // Print modal state
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

 // Filter zones by province
 const availableZones = selectedProvinceId === 'ALL' 
 ? zones 
 : zones.filter(z => z.provinceId === selectedProvinceId);

 // Get active neighborhoods based on zone
 const activeZone = zones.find(z => z.id === selectedZoneId);
 const availableNeighborhoods = activeZone 
 ? activeZone.neighborhoods 
 : Array.from(new Set(
 selectedProvinceId === 'ALL' 
 ? facilities.map(f => f.neighborhood)
 : facilities.filter(f => f.provinceId === selectedProvinceId).map(f => f.neighborhood)
 ));

 const filteredFacilities = facilities.filter(f => {
 if (selectedProvinceId !== 'ALL' && f.provinceId !== selectedProvinceId) return false;
 if (selectedZoneId !== 'ALL' && f.zoneId !== selectedZoneId) return false;
 if (selectedNeighborhood !== 'ALL' && f.neighborhood !== selectedNeighborhood) return false;
 if (statusFilter !== 'ALL' && f.licenseStatus !== statusFilter && f.inspectionStatus !== statusFilter) return false;

 if (searchQuery.trim() !== '') {
 const q = searchQuery.toLowerCase().trim();
 return (
 f.name.toLowerCase().includes(q) ||
 f.licenseNumber.toLowerCase().includes(q) ||
 f.ownerName.toLowerCase().includes(q) ||
 f.ownerPhone.includes(q) ||
 f.neighborhood.toLowerCase().includes(q)
 );
 }
 return true;
 });

 // Export Filtered Facilities to Excel (CSV)
 const handleExportExcel = () => {
 const headers = [
 'رقم الإجازة النقابية',
 'اسم المنشأة/العيادة',
 'نوع المنشأة',
 'المحافظة',
 'القطاع/الفرع',
 'العنوان والحي',
 'صاحب المنشأة/المالك',
 'رقم الهاتف',
 'حالة الترخيص',
 'حالة التفتيش الميداني',
 'تاريخ الكشف الأخير'
 ];

 const rows = filteredFacilities.map(f => {
 const provName = provinces.find(p => p.id === f.provinceId)?.nameAr || 'بغداد';
 const zoneName = zones.find(z => z.id === f.zoneId)?.nameAr || '';
 return [
 f.licenseNumber,
 f.name,
 f.type === 'HOSPITAL' ? 'مستشفى أهلي' : f.type === 'CLINIC' ? 'عيادة تمريضية' : 'مركز تمريضي',
 provName,
 zoneName,
 `${f.neighborhood} - ${f.address || ''}`,
 f.ownerName,
 f.ownerPhone,
 f.licenseStatus === 'LICENSED' ? 'مرخصة رسمياً' : f.licenseStatus === 'EXPIRED' ? 'ترخيص منتهي' : 'غير مرخصة',
 f.inspectionStatus === 'INSPECTED' ? 'تم الكشف' : f.inspectionStatus === 'VIOLATION_RECORDED' ? 'مخالفة مرصودة' : 'يحتاج كشف',
 f.lastInspectedAt ? new Date(f.lastInspectedAt).toLocaleDateString('ar-IQ') : 'لم يكشف بعد'
 ];
 });

 exportToCSV('سجل_المنشآت_والعيادات_التمريضية_الأهلية', headers, rows);
 };

 // Helper stats for report
 const totalCount = filteredFacilities.length;
 const licensedCount = filteredFacilities.filter(f => f.licenseStatus === 'LICENSED').length;
 const expiredOrUnlicensedCount = filteredFacilities.filter(f => f.licenseStatus === 'EXPIRED' || f.licenseStatus === 'UNLICENSED').length;
 const inspectedCount = filteredFacilities.filter(f => f.inspectionStatus === 'INSPECTED').length;

 // Selected filter text for report header
 const selProvinceName = selectedProvinceId === 'ALL' ? 'جميع المحافظات' : provinces.find(p => p.id === selectedProvinceId)?.nameAr || '';
 const selZoneName = selectedZoneId === 'ALL' ? 'جميع القطاعات' : zones.find(z => z.id === selectedZoneId)?.nameAr || '';

 return (
 <div className="space-y-6" id="facilities-table-view">
 {/* Search & Header Control Bar */}
 <div className="bg-[var(--theme-card-bg)] rounded-2xl p-5 border border-[var(--theme-card-border)] shadow-xs space-y-4" id="facilities-header-bar">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-xl font-bold text-[var(--theme-text-primary)] flex items-center gap-2">
 <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
 سجل المنشآت والعيادات التمريضية الأهلية
 </h2>
 <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">
 عرض جدولي مقسم حسب الأحياء والقطاعات مع محرك بحث فائق السرعة
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {/* Export Buttons */}
 <button
 type="button"
 id="export-facilities-excel-btn"
 onClick={handleExportExcel}
 className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
 >
 <FileSpreadsheet className="w-4 h-4" />
 <span>تصدير إلى Excel</span>
 </button>

 <button
 type="button"
 id="export-facilities-pdf-btn"
 onClick={() => setIsPrintModalOpen(true)}
 className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
 >
 <Printer className="w-4 h-4" />
 <span>طباعة تقرير PDF للوزارة</span>
 </button>

 <button
 type="button"
 id="add-facility-btn"
 onClick={onAddFacilityModalOpen}
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 <span>إضافة منشأة أهلية جديدة</span>
 </button>
 </div>
 </div>

 {/* Filters Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs border-t border-[var(--theme-card-border)] pt-3">
 {/* Province Selector */}
 <div>
 <label className="text-[var(--theme-text-muted)] font-bold block mb-1">المحافظة (18 محافظة):</label>
 <select
 id="select-province"
 value={selectedProvinceId}
 onChange={(e) => {
 setSelectedProvinceId(e.target.value);
 setSelectedZoneId('ALL');
 setSelectedNeighborhood('ALL');
 }}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl p-2 focus:border-amber-500 focus:outline-none"
 >
 <option value="ALL">جميع المحافظات (18)</option>
 {provinces.map(p => (
 <option key={p.id} value={p.id}>{p.nameAr}</option>
 ))}
 </select>
 </div>

 {/* Zone Selector */}
 <div>
 <label className="text-[var(--theme-text-muted)] font-bold block mb-1">القطاع / الفرع:</label>
 <select
 id="select-zone"
 value={selectedZoneId}
 onChange={(e) => {
 setSelectedZoneId(e.target.value);
 setSelectedNeighborhood('ALL');
 }}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl p-2 focus:border-amber-500 focus:outline-none"
 >
 <option value="ALL">جميع قطاعات الفروع</option>
 {availableZones.map(z => (
 <option key={z.id} value={z.id}>{z.nameAr}</option>
 ))}
 </select>
 </div>

 {/* Neighborhood Selector */}
 <div>
 <label className="text-[var(--theme-text-muted)] font-bold block mb-1">الحي / القضاء / الناحية:</label>
 <select
 id="select-neighborhood"
 value={selectedNeighborhood}
 onChange={(e) => setSelectedNeighborhood(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl p-2 focus:border-amber-500 focus:outline-none"
 >
 <option value="ALL">جميع الأحياء والمناطق</option>
 {availableNeighborhoods.map((n, idx) => (
 <option key={idx} value={n}>{n}</option>
 ))}
 </select>
 </div>

 {/* Search Input */}
 <div>
 <label className="text-[var(--theme-text-muted)] font-bold block mb-1">بحث شامل بالبيانات:</label>
 <div className="relative">
 <input
 id="search-facility-input"
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="رقم الإجازة، اسم المالك، الهاتف..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl pr-9 pl-3 py-2 focus:border-amber-500 focus:outline-none"
 />
 <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
 </div>
 </div>

 {/* Status Filter */}
 <div>
 <label className="text-[var(--theme-text-muted)] font-bold block mb-1">حالة الترخيص والتفتيش:</label>
 <select
 id="select-status"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl p-2 focus:border-amber-500 focus:outline-none"
 >
 <option value="ALL">جميع الحالات</option>
 <option value="LICENSED">مرخصة أصولياً</option>
 <option value="EXPIRED">ترخيص منتهي</option>
 <option value="UNLICENSED">غير مرخصة (مخالفة)</option>
 <option value="NEEDS_INSPECTION">تتطلب كشف ميداني</option>
 </select>
 </div>
 </div>
 </div>

 {/* Facilities Table */}
 <div className="bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-xs overflow-hidden" id="facilities-table-container">
 <div className="overflow-x-auto">
 <table className="w-full text-right text-xs" id="facilities-table">
 <thead className="bg-[var(--theme-header-bg)] text-slate-200 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
 <tr>
 <th className="p-3.5">اسم المنشأة والنوع</th>
 <th className="p-3.5">رقم الإجازة النقابية</th>
 <th className="p-3.5">الموقع والحي</th>
 <th className="p-3.5">صاحب المنشأة / المالك</th>
 <th className="p-3.5">حالة الترخيص</th>
 <th className="p-3.5">حالة التفتيش الميداني</th>
 <th className="p-3.5 text-center">الإجراءات</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {filteredFacilities.length === 0 ? (
 <tr>
 <td colSpan={7} className="text-center p-8 text-[var(--theme-text-muted)]">
 لا توجد منشآت مطابقة لمعايير البحث الحالية.
 </td>
 </tr>
 ) : (
 filteredFacilities.map((f) => {
 const zone = zones.find(z => z.id === f.zoneId);
 return (
 <tr key={f.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition">
 <td className="p-3.5 font-bold text-[var(--theme-text-primary)]">
 <div className="flex items-center gap-2">
 <span className="text-lg">{f.type === 'HOSPITAL' ? '🏥' : '🩺'}</span>
 <div>
 <p className="text-[var(--theme-text-primary)] font-bold">{f.name}</p>
 <span className="text-[10px] text-[var(--theme-text-muted)] font-normal">
 {f.type === 'HOSPITAL' ? 'مستشفى أهلي' : f.type === 'CLINIC' ? 'عيادة تمريضية/ضماد' : 'مركز تمريضي'}
 </span>
 </div>
 </div>
 </td>

 <td className="p-3.5 font-mono text-amber-800 dark:text-amber-400 font-bold">
 {f.licenseNumber}
 </td>

 <td className="p-3.5 text-[var(--theme-text-primary)] dark:text-slate-300">
 <div className="flex items-center gap-1 font-bold text-[var(--theme-text-primary)]">
 <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
 <span>{f.neighborhood}</span>
 </div>
 <p className="text-[10px] text-amber-800 font-semibold">{f.districtArea || 'القضاء المركز'}</p>
 <p className="text-[10px] text-slate-400">{provinces.find(p => p.id === f.provinceId)?.nameAr} - {zone ? zone.nameAr : ''}</p>
 </td>

 <td className="p-3.5 text-[var(--theme-text-primary)] font-semibold">
 <p>{f.ownerName}</p>
 <p className="text-[10px] text-[var(--theme-text-muted)] font-mono">{f.ownerPhone}</p>
 </td>

 <td className="p-3.5">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
 f.licenseStatus === 'LICENSED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
 f.licenseStatus === 'EXPIRED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
 f.licenseStatus === 'PENDING' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
 'bg-red-100 text-red-800 border border-red-200'
 }`}>
 {f.licenseStatus === 'LICENSED' ? 'مرخصة رسمياً' :
 f.licenseStatus === 'EXPIRED' ? 'ترخيص منتهي' :
 f.licenseStatus === 'PENDING' ? 'قيد الترخيص' : 'غير مرخصة'}
 </span>
 </td>

 <td className="p-3.5">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
 f.inspectionStatus === 'INSPECTED' ? 'bg-emerald-100 text-emerald-800' :
 f.inspectionStatus === 'VIOLATION_RECORDED' ? 'bg-red-100 text-red-800 font-bold animate-pulse' :
 'bg-amber-100 text-amber-800'
 }`}>
 {f.inspectionStatus === 'INSPECTED' ? 'تم الكشف' :
 f.inspectionStatus === 'VIOLATION_RECORDED' ? 'مخالفة مرصودة' : 'يحتاج كشف ميداني'}
 </span>
 </td>

 <td className="p-3.5 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <button
 id={`view-facility-${f.id}`}
 onClick={() => onSelectFacility(f)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
 >
 <span>تفاصيل</span>
 <ChevronRight className="w-3.5 h-3.5" />
 </button>

 <button
 id={`schedule-facility-${f.id}`}
 onClick={() => onNewAssignmentRequested(f)}
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
 >
 <Calendar className="w-3.5 h-3.5" />
 <span>جدولة كشف</span>
 </button>
 </div>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* FORMAL MINISTRY REPORT PRINTABLE MODAL FOR FACILITIES */}
 {isPrintModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="facilities-print-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-[var(--theme-card-border)] overflow-hidden my-auto printable-report-area text-[var(--theme-text-primary)]">
 {/* Modal Controls (Hidden during print) */}
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-4 shrink-0 no-print">
 <div className="flex items-center gap-2">
 <Printer className="w-5 h-5 text-amber-600" />
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base">معاينة تقرير المنشآت المرفوع لوزارة الصحة والجهات الرسمية</h3>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => window.print()}
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
 >
 <Printer className="w-4 h-4" />
 <span>طباعة التقرير / حفظ PDF</span>
 </button>
 <button
 type="button"
 onClick={() => setIsPrintModalOpen(false)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
 >
 إغلاق
 </button>
 </div>
 </div>

 {/* FORMAL REPORT CONTENT */}
 <div className="space-y-6 text-right dir-rtl overflow-y-auto flex-1 my-2 pr-1">
 {/* Official Iraq Ministry Header */}
 <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 text-xs font-bold">
 <div className="text-right space-y-1">
 <p className="text-sm font-black text-[var(--theme-text-primary)]">جمهورية العراق</p>
 <p className="text-[var(--theme-text-primary)]">وزارة الصحة - دائرة التفتيش والشكاوى</p>
 <p className="text-[var(--theme-text-primary)]">نقابة التمريض العراقية - لجنة حصر المنشآت الأهلية</p>
 <p className="text-amber-800 text-[11px]">تقرير حصر وتقييم الترخيص والتفتيش الميداني</p>
 </div>

 <div className="text-center space-y-1">
 <SyndicateLogo className="w-20 h-20 mx-auto" />
 <p className="text-[10px] text-[var(--theme-text-primary)] font-black">نقابة التمريض العراقية</p>
 </div>

 <div className="text-left font-mono space-y-1 dir-ltr">
 <p><span className="font-bold">العدد:</span> REF-FAC-2026-4029</p>
 <p><span className="font-bold">التاريخ:</span> {new Date().toLocaleDateString('ar-IQ')}</p>

 <p><span className="font-bold">النطاق:</span> {selProvinceName}</p>
 </div>
 </div>

 {/* Title */}
 <div className="text-center py-2 bg-[var(--theme-canvas)] rounded-xl border border-[var(--theme-card-border)]">
 <h2 className="text-lg font-black text-[var(--theme-text-primary)]">سجل حصر المنشآت والعيادات التمريضية الأهلية والمراكز التخصصية</h2>
 <p className="text-xs text-[var(--theme-text-muted)] font-bold mt-0.5">مرفوع إلى وزارة الصحة والأمانة العامة لنقابة التمريض</p>
 </div>

 {/* Summary Stats Cards */}
 <div className="grid grid-cols-4 gap-3 text-xs font-bold text-center">
 <div className="p-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl">
 <span className="text-[var(--theme-text-muted)] block text-[10px]">إجمالي المنشآت المدرجة:</span>
 <span className="text-lg text-[var(--theme-text-primary)] font-mono mt-0.5 block">{totalCount} منشأة</span>
 </div>
 <div className="p-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl">
 <span className="text-[var(--theme-text-muted)] block text-[10px]">المنشآت المرخصة رسمياً:</span>
 <span className="text-lg text-emerald-800 font-mono mt-0.5 block">{licensedCount} منشأة</span>
 </div>
 <div className="p-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl">
 <span className="text-[var(--theme-text-muted)] block text-[10px]">المنتهية وغير المرخصة:</span>
 <span className="text-lg text-red-700 font-mono mt-0.5 block">{expiredOrUnlicensedCount} منشأة</span>
 </div>
 <div className="p-2.5 bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl">
 <span className="text-[var(--theme-text-muted)] block text-[10px]">تم كشفها ميدانياً:</span>
 <span className="text-lg text-blue-800 font-mono mt-0.5 block">{inspectedCount} منشأة</span>
 </div>
 </div>

 {/* Official Table */}
 <div className="border border-[var(--theme-card-border)] rounded-xl overflow-hidden">
 <table className="w-full text-right text-xs">
 <thead className="bg-slate-800 text-white font-bold border-b border-[var(--theme-card-border)]">
 <tr>
 <th className="p-2.5">رقم الإجازة</th>
 <th className="p-2.5">اسم المنشأة والنوع</th>
 <th className="p-2.5">الموقع والحي</th>
 <th className="p-2.5">المالك ورقم الهاتف</th>
 <th className="p-2.5">حالة الترخيص</th>
 <th className="p-2.5">حالة التفتيش</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {filteredFacilities.map((f) => {
 const provName = provinces.find(p => p.id === f.provinceId)?.nameAr || '';
 return (
 <tr key={f.id} className="hover:bg-[var(--theme-canvas)]">
 <td className="p-2.5 font-mono font-bold text-amber-900">{f.licenseNumber}</td>
 <td className="p-2.5 font-bold text-[var(--theme-text-primary)]">
 {f.name} ({f.type === 'HOSPITAL' ? 'مستشفى' : f.type === 'CLINIC' ? 'عيادة' : 'مركز'})
 </td>
 <td className="p-2.5 text-[var(--theme-text-primary)]">
 {provName} - {f.neighborhood}
 </td>
 <td className="p-2.5 font-semibold text-[var(--theme-text-primary)]">
 {f.ownerName} ({f.ownerPhone})
 </td>
 <td className="p-2.5 font-bold">
 {f.licenseStatus === 'LICENSED' ? 'مرخصة رسمياً' : f.licenseStatus === 'EXPIRED' ? 'ترخيص منتهي' : 'غير مرخصة'}
 </td>
 <td className="p-2.5 font-bold">
 {f.inspectionStatus === 'INSPECTED' ? 'تم الكشف' : f.inspectionStatus === 'VIOLATION_RECORDED' ? 'مخالفة مرصودة' : 'تتطلب كشف'}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Signatures & Official Stamp Footer */}
 <div className="grid grid-cols-3 gap-6 pt-10 text-center text-xs font-bold border-t border-[var(--theme-card-border)]">
 <div className="space-y-8">
 <p className="text-[var(--theme-text-primary)]">رئيس لجنة حصر وتفتيش المنشآت</p>
 <p className="text-[var(--theme-text-muted)] font-mono">التوقيع: .....................</p>
 </div>

 <div className="space-y-8">
 <p className="text-[var(--theme-text-primary)]">مدير قسم الرقابة الصحية والنقابية</p>
 <p className="text-[var(--theme-text-muted)] font-mono">التوقيع: .....................</p>
 </div>

 <div className="space-y-8">
 <p className="text-[var(--theme-text-primary)]">نقيب التمريض العراقي</p>
 <div className="w-20 h-20 mx-auto border-2 border-dashed border-amber-600 rounded-full flex items-center justify-center text-[10px] text-amber-900 font-bold bg-amber-50">
 ختم المصادقة الرسمي
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
