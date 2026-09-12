import React, { useState, useMemo } from 'react';
import { SystemStats, Facility, Province } from '../types';
import { 
 Building2, 
 ShieldCheck, 
 AlertTriangle, 
 Users, 
 PieChart as PieIcon, 
 BarChart3, 
 ShieldAlert, 
 CheckCircle2, 
 BellRing, 
 Send, 
 UserCheck, 
 Clock, 
 MapPin, 
 Check, 
 Sparkles,
 Wallet,
 Radio,
 ArrowLeft,
 ArrowRight,
 Receipt,
 FileCheck2,
 ChevronDown,
 ChevronUp,
 Eye,
 EyeOff
} from 'lucide-react';
import {
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 Legend,
 CartesianGrid
} from 'recharts';
import { useLanguageTheme } from '../context/LanguageThemeContext';

interface DashboardStatsProps {
 stats: SystemStats;
 facilities?: Facility[];
 provinces?: Province[];
 onNavigateTab?: (tab: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
 stats,
 facilities = [],
 provinces = [],
 onNavigateTab
}) => {
 const { lang, t } = useLanguageTheme();
 const [activeProvinceFilter, setActiveProvinceFilter] = useState<string>('ALL');

 // Notification Warning States
 const [warnedOwners, setWarnedOwners] = useState<Record<string, { date: string; time: string }>>({});
 const [warnedInspectors, setWarnedInspectors] = useState<Record<string, { inspectorName: string; time: string }>>({});
 const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
 // Facility alerts details toggle (collapsed by default)
 const [showExpiryDetails, setShowExpiryDetails] = useState<boolean>(false);

 // Reference Current Date for Expiry Calculation (Aug 13, 2026)
 const referenceDate = useMemo(() => new Date('2026-08-13T00:00:00'), []);

 // Compute Clinics & Facilities Expiring in the Next 30 Days
 const expiringFacilities = useMemo(() => {
 return facilities.filter(f => {
 if (!f.licenseExpiryDate) return false;
 const expDate = new Date(f.licenseExpiryDate);
 const diffTime = expDate.getTime() - referenceDate.getTime();
 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
 // Include facilities expiring within 30 days (or pending renewal)
 return (diffDays >= 0 && diffDays <= 30) || (f.licenseStatus === 'PENDING' && diffDays <= 30);
 }).map(f => {
 const expDate = new Date(f.licenseExpiryDate);
 const diffTime = expDate.getTime() - referenceDate.getTime();
 const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
 return {
 ...f,
 daysRemaining: diffDays
 };
 }).sort((a, b) => a.daysRemaining - b.daysRemaining);
 }, [facilities, referenceDate]);

 // Helper to determine the assigned zone inspector for a facility
 const getZoneInspector = (facility: Facility) => {
 if (facility.zoneId === 'zone_karkh' || facility.districtArea?.includes('الكرخ') || facility.districtArea?.includes('المنصور')) {
 return {
 id: 'user_5',
 name: lang === 'ar' ? 'المفتش الميداني / علي حسين الكعبي' : 'Inspector / Ali Hussein Al-Kaabi',
 badgeNumber: 'INSP-2026-88',
 phone: '07725556677',
 zoneName: 'Karkh Sector & Neighborhoods'
 };
 }
 if (facility.zoneId === 'zone_rusafa' || facility.districtArea?.includes('الرصافة') || facility.districtArea?.includes('الكرادة')) {
 return {
 id: 'user_6',
 name: lang === 'ar' ? 'المفتشة الميدانية / زينب فاضل الزبيدي' : 'Inspector / Zainab Fadhil Al-Zubaidi',
 badgeNumber: 'INSP-2026-89',
 phone: '07816667788',
 zoneName: 'Rusafa Sector'
 };
 }
 if (facility.provinceId === 'iq_basra') {
 return {
 id: 'user_basra',
 name: lang === 'ar' ? 'المفتش الميداني / عمار جاسم البصري' : 'Inspector / Ammar Jassim Al-Basri',
 badgeNumber: 'INSP-2026-92',
 phone: '07801122334',
 zoneName: 'Basra Center Sector'
 };
 }
 return {
 id: 'user_gen',
 name: lang === 'ar' ? `المفتش المسؤول عن قطاع ${facility.districtArea || 'المحافظة'}` : `Sector Inspector (${facility.districtArea || 'Province'})`,
 badgeNumber: 'INSP-2026-Z',
 phone: '07700001122',
 zoneName: facility.districtArea || 'Inspection Sector'
 };
 };

 // Handlers for sending warnings
 const handleWarnOwner = (facility: Facility) => {
 const now = new Date();
 const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
 const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US');

 setWarnedOwners(prev => ({
 ...prev,
 [facility.id]: { date: dateStr, time: timeStr }
 }));

 setToastMessage({
 text: lang === 'ar' 
 ? `تم إرسال إنذار تجديد الترخيص النهائي لمالك المنشأة (${facility.ownerName}) عبر الرسائل القصيرة والنظام بنجاح 📱`
 : `License renewal warning sent successfully to owner (${facility.ownerName}) via SMS and app 📱`,
 type: 'success'
 });
 setTimeout(() => setToastMessage(null), 5000);
 };

 const handleWarnInspector = (facility: Facility) => {
 const inspector = getZoneInspector(facility);
 const now = new Date();
 const timeStr = now.toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' });

 setWarnedInspectors(prev => ({
 ...prev,
 [facility.id]: { inspectorName: inspector.name, time: timeStr }
 }));

 setToastMessage({
 text: lang === 'ar'
 ? `تم إرسال إشعار وتكليف تفتيشي عاجل للمفتش المكلف بالزون (${inspector.name} - ${inspector.badgeNumber}) لإجراء الكشف الميداني 🛡️`
 : `Urgent inspection task sent to zone inspector (${inspector.name} - ${inspector.badgeNumber}) 🛡️`,
 type: 'info'
 });
 setTimeout(() => setToastMessage(null), 5000);
 };

 // Compute License Status Ratio Data for Pie Chart
 const licenseRatioData = React.useMemo(() => {
 if (!facilities.length) {
 return [
 { name: lang === 'ar' ? 'مرخصة وسارية' : 'Licensed', value: stats.totalLicensed || 12, color: '#10B981' },
 { name: lang === 'ar' ? 'قيد التجديد' : 'Pending', value: 4, color: '#F59E0B' },
 { name: lang === 'ar' ? 'منتهية الترخيص' : 'Expired', value: 3, color: '#EF4444' },
 { name: lang === 'ar' ? 'غير مرخصة' : 'Unlicensed', value: 2, color: '#881337' }
 ];
 }

 const filtered = activeProvinceFilter === 'ALL'
 ? facilities
 : facilities.filter(f => f.provinceId === activeProvinceFilter);

 const licensedCount = filtered.filter(f => f.licenseStatus === 'LICENSED').length;
 const pendingCount = filtered.filter(f => f.licenseStatus === 'PENDING').length;
 const expiredCount = filtered.filter(f => f.licenseStatus === 'EXPIRED').length;
 const unlicensedCount = filtered.filter(f => f.licenseStatus === 'UNLICENSED').length;
 const suspendedCount = filtered.filter(f => f.licenseStatus === 'SUSPENDED').length;

 return [
 { name: lang === 'ar' ? 'مرخصة رسمياً' : 'Licensed', value: licensedCount, color: '#10B981' },
 { name: lang === 'ar' ? 'قيد التجديد' : 'Pending Renewal', value: pendingCount, color: '#F59E0B' },
 { name: lang === 'ar' ? 'منتهية الترخيص' : 'Expired License', value: expiredCount, color: '#F97316' },
 { name: lang === 'ar' ? 'غير مرخصة' : 'Unlicensed', value: unlicensedCount, color: '#EF4444' },
 { name: lang === 'ar' ? 'موقوفة العمل' : 'Suspended', value: suspendedCount, color: '#64748B' }
 ].filter(item => item.value > 0);
 }, [facilities, stats, activeProvinceFilter, lang]);

 // Total facilities count for selected filter
 const currentTotal = licenseRatioData.reduce((acc, curr) => acc + curr.value, 0);
 const licensedTotal = licenseRatioData.find(i => i.name.includes('مرخصة') || i.name.includes('Licensed'))?.value || 0;
 const compliancePercentage = currentTotal > 0 ? Math.round((licensedTotal / currentTotal) * 100) : 0;

 // Compute Inspection Coverage per Province Data for Bar Chart
 const provinceCoverageData = React.useMemo(() => {
 if (!provinces.length || !facilities.length) {
 return [
 { provinceName: lang === 'ar' ? 'بغداد' : 'Baghdad', inspected: 14, needsInspection: 6, violationRecorded: 3 },
 { provinceName: lang === 'ar' ? 'البصرة' : 'Basra', inspected: 8, needsInspection: 4, violationRecorded: 2 },
 { provinceName: lang === 'ar' ? 'نينوى' : 'Nineveh', inspected: 6, needsInspection: 3, violationRecorded: 1 },
 { provinceName: lang === 'ar' ? 'النجف' : 'Najaf', inspected: 5, needsInspection: 2, violationRecorded: 1 },
 { provinceName: lang === 'ar' ? 'كربلاء' : 'Karbala', inspected: 5, needsInspection: 2, violationRecorded: 1 },
 { provinceName: lang === 'ar' ? 'أربيل' : 'Erbil', inspected: 7, needsInspection: 3, violationRecorded: 0 }
 ];
 }

 return provinces.map(p => {
 const pFacilities = facilities.filter(f => f.provinceId === p.id);
 const inspected = pFacilities.filter(f => f.inspectionStatus === 'INSPECTED').length;
 const needsInspection = pFacilities.filter(f => f.inspectionStatus === 'NEEDS_INSPECTION').length;
 const violationRecorded = pFacilities.filter(f => f.inspectionStatus === 'VIOLATION_RECORDED' || f.inspectionStatus === 'CLOSED').length;

 return {
 provinceName: lang === 'ar' ? p.nameAr : p.nameEn,
 inspected,
 needsInspection,
 violationRecorded,
 total: pFacilities.length
 };
 }).filter(p => p.total > 0 || ['iq_baghdad', 'iq_basra', 'iq_ninawa', 'iq_najaf', 'iq_karbala'].includes(p.provinceName));
 }, [provinces, facilities, lang]);

 return (
 <div className="space-y-6" id="high-command-dashboard-section">
 {/* Global Toast Alert Banner */}
 {toastMessage && (
 <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top-3 ${
 toastMessage.type === 'success' 
 ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
 : 'bg-amber-950 border-amber-700 text-amber-200'
 }`}>
 <div className="flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
 <span>{toastMessage.text}</span>
 </div>
 <button 
 type="button" 
 onClick={() => setToastMessage(null)}
 className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700 cursor-pointer"
 >
 {t('close')}
 </button>
 </div>
 )}



 {/* KPI Cards Row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="high-command-stats-bar">
 {/* Total Facilities Card */}
 <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-4 shadow-xs border-r-4 border-r-amber-500 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between text-[var(--theme-text-muted)] text-xs font-bold uppercase tracking-tight">
 <span>{t('statTotalFacilities')}</span>
 <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
 </div>
 <div className="mt-2">
 <div className="text-2xl font-bold text-[var(--theme-text-primary)] font-mono">{stats.totalFacilities}</div>
 <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
 {stats.totalHospitals} {lang === 'ar' ? 'مستشفى' : 'Hospitals'} | {stats.totalClinics} {lang === 'ar' ? 'عيادة ومركز' : 'Clinics'}
 </p>
 </div>
 </div>

 {/* Licensed Card */}
 <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-4 shadow-xs border-r-4 border-r-emerald-500 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between text-[var(--theme-text-muted)] text-xs font-bold uppercase tracking-tight">
 <span>{t('statLicensed')}</span>
 <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 </div>
 <div className="mt-2">
 <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{stats.totalLicensed}</div>
 <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-0.5">
 {lang === 'ar' ? 'منشأة مرخصة ومستوفية الشروط' : 'Fully Compliant Facilities'}
 </p>
 </div>
 </div>

 {/* Active Nurses Card */}
 <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-4 shadow-xs border-r-4 border-r-blue-500 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between text-[var(--theme-text-muted)] text-xs font-bold uppercase tracking-tight">
 <span>{t('statActiveNurses')}</span>
 <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
 </div>
 <div className="mt-2">
 <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 font-mono">{stats.totalActiveNurses}</div>
 <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
 {lang === 'ar' ? 'ممرض جامعي وأخصائي مسجل' : 'Registered Nurses & Staff'}
 </p>
 </div>
 </div>

 {/* Violations Card */}
 <div className="bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-2xl p-4 shadow-xs border-r-4 border-r-red-500 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between text-[var(--theme-text-muted)] text-xs font-bold uppercase tracking-tight">
 <span>{t('statViolationsRecorded')}</span>
 <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
 </div>
 <div className="mt-2">
 <div className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">{stats.totalViolations}</div>
 <p className="text-[11px] text-red-700 dark:text-red-300 font-medium mt-0.5">
 {lang === 'ar' ? 'تتضمن إنذارات وغرامات نقابية' : 'Warnings & Fines Issued'}
 </p>
 </div>
 </div>
 </div>

 {/* Notifications Alert System */}
 <div className="bg-[var(--theme-header-bg)] border border-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl space-y-4" id="expiry-notifications-section">
 <div 
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 cursor-pointer select-none"
 onClick={() => setShowExpiryDetails(prev => !prev)}
 >
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30 relative shrink-0">
 <BellRing className="w-6 h-6 animate-bounce" />
 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
 </div>
 <div>
 <div className="flex items-center flex-wrap gap-2">
 <h3 className="text-base sm:text-lg font-bold text-slate-100">
 {lang === 'ar' ? 'نظام تنبيهات تراخيص العيادات والمنشآت' : 'Facility License Expiry Alerts'}
 </h3>
 <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
 {lang === 'ar' ? 'خلال الـ 30 يوماً القادمة' : 'Next 30 Days'}
 </span>
 </div>
 <p className="text-xs text-slate-400 mt-0.5">
 {lang === 'ar' 
 ? 'قائمة حصر العيادات والمراكز التمريضية التي تنتهي إجازتها قريباً مع ميزة توجيه الإنذارات المباشرة للمالك والمفتش المكلف'
 : 'Facilities near license expiration with instant alert dispatching to owners and inspectors'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
 <span className="bg-red-950 text-red-300 border border-red-800 font-mono font-bold text-xs px-3 py-1.5 rounded-xl shrink-0">
 {expiringFacilities.length} {lang === 'ar' ? 'عيادات تقتضي الإنذار' : 'Facilities Requiring Warning'}
 </span>

 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setShowExpiryDetails(prev => !prev);
 }}
 className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-md ${
 showExpiryDetails 
 ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
 : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
 }`}
 id="toggle-expiry-details-btn"
 >
 {showExpiryDetails ? (
 <>
 <EyeOff className="w-4 h-4" />
 <span>{lang === 'ar' ? 'إخفاء التفاصيل' : 'Hide Details'}</span>
 <ChevronUp className="w-4 h-4" />
 </>
 ) : (
 <>
 <Eye className="w-4 h-4" />
 <span>{lang === 'ar' ? 'رؤية التفاصيل' : 'View Details'}</span>
 <ChevronDown className="w-4 h-4" />
 </>
 )}
 </button>
 </div>
 </div>

 {/* Expanded State: Full clinic list with details and actions */}
 {showExpiryDetails && (
 <div className="space-y-4 pt-1" id="expiry-expanded-details">
 {expiringFacilities.length === 0 ? (
 <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
 <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
 <p className="font-bold text-slate-200">
 {lang === 'ar' ? 'لا توجد عيادات تنتهي إجازتها خلال الـ 30 يوماً القادمة' : 'No facilities expiring in the next 30 days'}
 </p>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="expiring-clinics-list">
 {expiringFacilities.map((f) => {
 const zoneInspector = getZoneInspector(f);
 const isOwnerWarned = Boolean(warnedOwners[f.id]);
 const isInspectorWarned = Boolean(warnedInspectors[f.id]);

 return (
 <div 
 key={f.id} 
 className={`bg-slate-950/80 rounded-2xl p-4 border transition hover:border-slate-700 flex flex-col justify-between space-y-4 shadow-md ${
 f.daysRemaining <= 10 ? 'border-red-900/80 bg-red-950/20' : 'border-amber-900/60'
 }`}
 >
 <div className="space-y-2">
 <div className="flex items-start justify-between gap-2">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
 {t(`type_${f.type}`)}
 </span>
 <h4 className="text-sm font-bold text-slate-100 mt-1.5 flex items-center gap-1.5">
 <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
 <span>{f.name}</span>
 </h4>
 </div>

 <div className="shrink-0 text-start">
 <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
 f.daysRemaining <= 10 
 ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
 : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
 }`}>
 <Clock className="w-3.5 h-3.5" />
 <span>{lang === 'ar' ? `متبقي ${f.daysRemaining} يوماً` : `${f.daysRemaining} Days Left`}</span>
 </span>
 <span className="block text-[10px] text-slate-400 mt-1 font-mono">
 {f.licenseExpiryDate}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
 <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
 <span>{f.districtArea} - {f.neighborhood} ({f.addressDetail})</span>
 </div>

 <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
 <div>
 <span className="text-slate-400 text-[10px] block font-medium">
 {lang === 'ar' ? 'صاحب العيادة / المالك:' : 'Facility Owner:'}
 </span>
 <span className="font-bold text-slate-200 block truncate">{f.ownerName}</span>
 </div>
 <div>
 <span className="text-slate-400 text-[10px] block font-medium">
 {t('phone')}:
 </span>
 <span className="font-mono font-bold text-amber-300 block">{f.ownerPhone}</span>
 </div>
 </div>

 <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
 <div>
 <span className="text-slate-400 text-[10px] block font-medium">
 {lang === 'ar' ? 'المفتش المكلف بالزون:' : 'Zone Inspector:'}
 </span>
 <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
 <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
 <span>{zoneInspector.name}</span>
 </span>
 </div>
 <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">
 {zoneInspector.badgeNumber}
 </span>
 </div>

 {(isOwnerWarned || isInspectorWarned) && (
 <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px]">
 {isOwnerWarned && (
 <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-emerald-400" />
 <span>{lang === 'ar' ? `تم إنذار المالك (${warnedOwners[f.id].time})` : `Owner Warned (${warnedOwners[f.id].time})`}</span>
 </span>
 )}

 {isInspectorWarned && (
 <span className="bg-blue-950 text-blue-300 border border-blue-700 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
 <Check className="w-3 h-3 text-blue-400" />
 <span>{lang === 'ar' ? `تم إشعار المفتش (${warnedInspectors[f.id].time})` : `Inspector Alerted (${warnedInspectors[f.id].time})`}</span>
 </span>
 )}
 </div>
 )}
 </div>

 <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
 <button
 type="button"
 onClick={() => handleWarnOwner(f)}
 className={`flex items-center justify-center gap-1.5 font-bold py-2 px-3 rounded-xl transition text-xs cursor-pointer ${
 isOwnerWarned 
 ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700' 
 : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
 }`}
 >
 <Send className="w-3.5 h-3.5" />
 <span>{isOwnerWarned ? (lang === 'ar' ? 'إعادة إنذار المالك' : 'Re-warn Owner') : (lang === 'ar' ? 'إرسال إنذار للمالك' : 'Send Warning to Owner')}</span>
 </button>

 <button
 type="button"
 onClick={() => handleWarnInspector(f)}
 className={`flex items-center justify-center gap-1.5 font-bold py-2 px-3 rounded-xl transition text-xs cursor-pointer ${
 isInspectorWarned 
 ? 'bg-blue-900/60 text-blue-200 border border-blue-700' 
 : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
 }`}
 >
 <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
 <span>{isInspectorWarned ? (lang === 'ar' ? 'تجديد إشعار المفتش' : 'Re-alert Inspector') : (lang === 'ar' ? 'إرسال إنذار للمفتش' : 'Alert Inspector')}</span>
 </button>
 </div>
 </div>
 );
 })}
 </div>

 <div className="pt-2 flex justify-center">
 <button
 type="button"
 onClick={() => setShowExpiryDetails(false)}
 className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
 >
 <ChevronUp className="w-4 h-4" />
 <span>{lang === 'ar' ? 'إخفاء وطي تفاصيل المنشآت' : 'Collapse Facility Details'}</span>
 </button>
 </div>
 </>
 )}
 </div>
 )}
 </div>

 {/* Analytics Charts Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-recharts-container">
 {/* Chart 1: Ratio of Licensed vs Unlicensed Facilities */}
 <div className="lg:col-span-5 bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-xs p-5 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-card-border)]">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
 <PieIcon className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-sm">
 {lang === 'ar' ? 'نسبة التراخيص النقابية والرسمية' : 'License Compliance Ratio'}
 </h3>
 <p className="text-[11px] text-[var(--theme-text-muted)]">
 {lang === 'ar' ? 'مؤشر الامتثال وحالات التراخيص للمنشآت' : 'Licensing status breakdown'}
 </p>
 </div>
 </div>

 {provinces.length > 0 && (
 <select
 id="chart-province-filter-select"
 value={activeProvinceFilter}
 onChange={(e) => setActiveProvinceFilter(e.target.value)}
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] text-[var(--theme-text-primary)] text-xs font-bold rounded-lg p-1.5 focus:border-amber-500 focus:outline-none"
 >
 <option value="ALL">{t('allProvinces')}</option>
 {provinces.map(p => (
 <option key={p.id} value={p.id}>{lang === 'ar' ? p.nameAr : p.nameEn}</option>
 ))}
 </select>
 )}
 </div>

 <div className="relative my-4 flex items-center justify-center h-64">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={licenseRatioData}
 cx="50%"
 cy="50%"
 innerRadius={65}
 outerRadius={95}
 paddingAngle={3}
 dataKey="value"
 >
 {licenseRatioData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
 ))}
 </Pie>
 <Tooltip
 formatter={(value: any, name: any) => [`${value}`, name]}
 contentStyle={{
 backgroundColor: '#0F172A',
 borderColor: '#334155',
 borderRadius: '0.75rem',
 color: '#F8FAFC',
 fontSize: '12px'
 }}
 />
 </PieChart>
 </ResponsiveContainer>

 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
 <span className="text-2xl font-black text-[var(--theme-text-primary)] font-mono">{compliancePercentage}%</span>
 <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
 {lang === 'ar' ? 'نسبة التراخيص' : 'Compliance'}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--theme-card-border)] text-xs">
 {licenseRatioData.map((item, idx) => {
 const pct = currentTotal > 0 ? Math.round((item.value / currentTotal) * 100) : 0;
 return (
 <div key={idx} className="flex items-center justify-between bg-[var(--theme-canvas)]/60 p-2 rounded-lg border border-[var(--theme-card-border)]">
 <div className="flex items-center gap-1.5">
 <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
 <span className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 truncate text-[11px]">{item.name}</span>
 </div>
 <span className="font-mono font-bold text-[var(--theme-text-primary)] bg-[var(--theme-card-bg)] dark:bg-slate-700 px-1.5 py-0.5 rounded border border-[var(--theme-card-border)] dark:border-slate-600 text-[10px]">
 {item.value} ({pct}%)
 </span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Chart 2: Inspection Coverage Per Province */}
 <div className="lg:col-span-7 bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-xs p-5 flex flex-col justify-between transition-colors">
 <div className="flex items-center justify-between pb-3 border-b border-[var(--theme-card-border)]">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
 <BarChart3 className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-sm">
 {lang === 'ar' ? 'تغطية الكشف والتفتيش الميداني حسب المحافظات' : 'Inspection Coverage by Province'}
 </h3>
 <p className="text-[11px] text-[var(--theme-text-muted)]">
 {lang === 'ar' ? 'توزيع حالة الكشوفات واللجان الميدانية بالمحافظات العراقية' : 'Distribution of inspections across Iraqi governorates'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 text-[11px] font-bold">
 <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800">
 <CheckCircle2 className="w-3 h-3" /> {lang === 'ar' ? 'تم التفتيش' : 'Inspected'}
 </span>
 <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
 <ShieldAlert className="w-3 h-3" /> {lang === 'ar' ? 'بانتظار الكشف' : 'Pending'}
 </span>
 </div>
 </div>

 <div className="my-4 h-72">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart
 data={provinceCoverageData}
 margin={{ top: 15, right: 10, left: 0, bottom: 25 }}
 >
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
 <XAxis
 dataKey="provinceName"
 tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
 interval={0}
 />
 <YAxis
 tick={{ fill: '#94A3B8', fontSize: 10 }}
 allowDecimals={false}
 />
 <Tooltip
 formatter={(value: any, name: any) => {
 const labelMap: Record<string, string> = {
 inspected: lang === 'ar' ? 'تم التفتيش والكشف الميداني' : 'Inspected',
 needsInspection: lang === 'ar' ? 'تتطلب كشف وتفتيش عاجل' : 'Pending Inspection',
 violationRecorded: lang === 'ar' ? 'مخالفات وإجراءات متخذة' : 'Violations Recorded'
 };
 return [`${value}`, labelMap[name] || name];
 }}
 contentStyle={{
 backgroundColor: '#0F172A',
 borderColor: '#334155',
 borderRadius: '0.75rem',
 color: '#F8FAFC',
 fontSize: '12px'
 }}
 />
 <Legend
 verticalAlign="top"
 align="right"
 height={36}
 formatter={(value: string) => {
 const legendMap: Record<string, string> = {
 inspected: lang === 'ar' ? 'تم التفتيش' : 'Inspected',
 needsInspection: lang === 'ar' ? 'بانتظار الكشف' : 'Pending',
 violationRecorded: lang === 'ar' ? 'مخالفات مرصودة' : 'Violations'
 };
 return <span className="text-xs font-bold text-[var(--theme-text-primary)] dark:text-slate-300">{legendMap[value] || value}</span>;
 }}
 />
 <Bar dataKey="inspected" name="inspected" fill="#10B981" radius={[4, 4, 0, 0]} />
 <Bar dataKey="needsInspection" name="needsInspection" fill="#F59E0B" radius={[4, 4, 0, 0]} />
 <Bar dataKey="violationRecorded" name="violationRecorded" fill="#EF4444" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>

 <div className="pt-3 border-t border-[var(--theme-card-border)] flex items-center justify-between text-xs text-[var(--theme-text-muted)] font-medium">
 <span>{lang === 'ar' ? 'تحديث البيانات الميدانية والتحليلات الجغرافية مستمر بالمنظومة' : 'Real-time field analytics updated continuously'}</span>
 <span className="font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
 {lang === 'ar' ? `إجمالي المحافظات المفعلة: ${provinceCoverageData.length} محافظة` : `Active Governorates: ${provinceCoverageData.length}`}
 </span>
 </div>
 </div>
 </div>
 </div>
 );
};
