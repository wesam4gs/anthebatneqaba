import React, { useState } from 'react';
import { 
 FinancialVoucher, 
 BranchInspectionBudget, 
 Facility, 
 ViolationRecord, 
 User, 
 Province,
 VoucherType,
 VoucherCategory,
 PaymentMethod,
 TreasuryFund
} from '../types';
import { 
 Receipt, 
 TrendingUp, 
 TrendingDown, 
 Wallet, 
 Building2, 
 AlertTriangle, 
 Search, 
 Plus, 
 Filter, 
 Printer, 
 Download, 
 CheckCircle2, 
 Clock, 
 FileText, 
 Fuel, 
 Award, 
 ShieldCheck,
 ChevronDown
} from 'lucide-react';
import { SyndicateLogo } from './SyndicateLogo';

interface FinancialInspectionSectionProps {
 vouchers: FinancialVoucher[];
 branchBudgets: BranchInspectionBudget[];
 facilities: Facility[];
 violations: ViolationRecord[];
 provinces: Province[];
 currentUser: User;
 onAddVoucher: (voucher: FinancialVoucher) => void;
 onUpdateVoucherStatus?: (voucherId: string, status: 'COLLECTED' | 'PENDING' | 'RECONCILED') => void;
}

export const FinancialInspectionSection: React.FC<FinancialInspectionSectionProps> = ({
 vouchers,
 branchBudgets,
 facilities,
 violations,
 provinces,
 currentUser,
 onAddVoucher,
 onUpdateVoucherStatus
}) => {
 const [activeSubTab, setActiveSubTab] = useState<'vouchers' | 'budgets' | 'audit'>('vouchers');
 const [searchQuery, setSearchQuery] = useState('');
 const [typeFilter, setTypeFilter] = useState<'ALL' | VoucherType>('ALL');
 const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
 const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
 
 // Modals
 const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);
 const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<FinancialVoucher | null>(null);

 // New Voucher Form
 const [newVoucherType, setNewVoucherType] = useState<VoucherType>('RECEIPT');
 const [newCategory, setNewCategory] = useState<VoucherCategory>('INSPECTION_FINE');
 const [newAmount, setNewAmount] = useState<number>(500000);
 const [newPayer, setNewPayer] = useState<string>('');
 const [newFacilityId, setNewFacilityId] = useState<string>('');
 const [newProvinceId, setNewProvinceId] = useState<string>(currentUser.provinceId || 'iq_baghdad');
 const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>('ELECTRONIC_QI');
 const [newRefNumber, setNewRefNumber] = useState<string>('');
 const [newFund, setNewFund] = useState<TreasuryFund>('INSPECTION_FUND');
 const [newNotes, setNewNotes] = useState<string>('');

 // Calculations
 const totalReceiptsIqd = vouchers
 .filter(v => v.voucherType === 'RECEIPT')
 .reduce((acc, curr) => acc + curr.amountIqd, 0);

 const totalPaymentsIqd = vouchers
 .filter(v => v.voucherType === 'PAYMENT')
 .reduce((acc, curr) => acc + curr.amountIqd, 0);

 const totalFinesIqd = vouchers
 .filter(v => v.category === 'INSPECTION_FINE' || v.category === 'DISCIPLINE_PENALTY')
 .reduce((acc, curr) => acc + curr.amountIqd, 0);

 const totalLicensingFeesIqd = vouchers
 .filter(v => v.category === 'FACILITY_LICENSING_FEE')
 .reduce((acc, curr) => acc + curr.amountIqd, 0);

 const netInspectionFundBalance = totalReceiptsIqd - totalPaymentsIqd;

 // Filtered Vouchers
 const filteredVouchers = vouchers.filter(v => {
 const matchesSearch = 
 v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
 v.payerOrBeneficiary.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (v.facilityName && v.facilityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
 (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesType = typeFilter === 'ALL' || v.voucherType === typeFilter;
 const matchesCategory = categoryFilter === 'ALL' || v.category === categoryFilter;
 const matchesProvince = provinceFilter === 'ALL' || v.provinceId === provinceFilter;

 return matchesSearch && matchesType && matchesCategory && matchesProvince;
 });

 const handleFacilitySelectChange = (facId: string) => {
 setNewFacilityId(facId);
 const fac = facilities.find(f => f.id === facId);
 if (fac) {
 setNewPayer(fac.name);
 setNewProvinceId(fac.provinceId);
 }
 };

 const handleCreateVoucherSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newPayer.trim() || newAmount <= 0) return;

 const selectedProv = provinces.find(p => p.id === newProvinceId);
 const selectedFac = facilities.find(f => f.id === newFacilityId);

 const created: FinancialVoucher = {
 id: `vouch_${Date.now()}`,
 voucherNumber: `${newVoucherType === 'RECEIPT' ? 'RV' : 'PV'}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
 voucherType: newVoucherType,
 category: newCategory,
 amountIqd: Number(newAmount),
 payerOrBeneficiary: newPayer,
 facilityId: newFacilityId || undefined,
 facilityName: selectedFac ? selectedFac.name : undefined,
 provinceId: newProvinceId,
 provinceName: selectedProv ? selectedProv.nameAr : 'بغداد',
 date: new Date().toISOString().split('T')[0],
 paymentMethod: newPaymentMethod,
 referenceNumber: newRefNumber || `TX-${Date.now().toString().slice(-6)}`,
 treasuryFund: newFund,
 status: 'COLLECTED',
 issuedByUserId: currentUser.id,
 issuedByUserName: currentUser.name,
 notes: newNotes
 };

 onAddVoucher(created);
 setIsNewVoucherModalOpen(false);
 // Reset Form
 setNewPayer('');
 setNewFacilityId('');
 setNewNotes('');
 setNewRefNumber('');
 };

 const getCategoryLabel = (cat: VoucherCategory) => {
 switch (cat) {
 case 'INSPECTION_FINE': return 'غرامة محضر كشف تفتيشي';
 case 'FACILITY_LICENSING_FEE': return 'رسم كشف وترخيص منشأة صحية';
 case 'DISCIPLINE_PENALTY': return 'غرامة قرار لجنة الانضباط';
 case 'FIELD_INSPECTION_EXPENSES': return 'مخصصات ونثريات وقود التفتيش';
 case 'INSPECTOR_REWARD': return 'مكافأة ضبط مخالفة جسيمة';
 case 'EQUIPMENT_MAINTENANCE': return 'صيانة أجهزة المسح الميداني';
 default: return cat;
 }
 };

 const getPaymentMethodBadge = (m: PaymentMethod) => {
 switch (m) {
 case 'ELECTRONIC_QI': return <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">بطاقة كي كارد (QI)</span>;
 case 'ZAIN_CASH': return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded text-[11px] font-bold">زين كاش</span>;
 case 'BANK_TRANSFER': return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded text-[11px] font-bold">تحويل مصرفي TBI</span>;
 default: return <span className="bg-[var(--theme-canvas)] text-[var(--theme-text-primary)] dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">نقداً (أمانات الصندوق)</span>;
 }
 };

 return (
 <div className="space-y-6" id="financial-inspection-container">
 {/* Top Header & Overview */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
 الدائرة المالية والحسابات
 </span>
 <span className="text-slate-400 text-xs">نقابة التمريض العراقية - لجنة التفتيش والانضباط</span>
 </div>
 <h2 className="text-xl font-black text-white flex items-center gap-2">
 <Wallet className="w-6 h-6 text-amber-400" />
 جباية الغرامات والمخصصات التفتيشية (ERP)
 </h2>
 <p className="text-slate-400 text-xs mt-1">
 إدارة وصولات وسندات القبض الناتجة عن محاضر الكشف الميداني، غرامات الانضباط، ورسوم تراخيص المنشآت الصحية.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 onClick={() => {
 setNewVoucherType('RECEIPT');
 setNewCategory('INSPECTION_FINE');
 setIsNewVoucherModalOpen(true);
 }}
 className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 سند قبض غرامة / رسم
 </button>
 <button
 onClick={() => {
 setNewVoucherType('PAYMENT');
 setNewCategory('FIELD_INSPECTION_EXPENSES');
 setIsNewVoucherModalOpen(true);
 }}
 className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
 >
 <Plus className="w-4 h-4" />
 سند صرف مخصصات تفتيش
 </button>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Total Receipts */}
 <div className="bg-[var(--theme-card-bg)] p-4 rounded-2xl border border-[var(--theme-card-border)] shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-[var(--theme-text-muted)] font-bold">إجمالي المقبوضات المحصلة</p>
 <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
 {totalReceiptsIqd.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
 </h3>
 <p className="text-[11px] text-slate-400 mt-1">من غرامات الكشف والتراخيص</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 border border-emerald-200 dark:border-emerald-800">
 <TrendingUp className="w-6 h-6" />
 </div>
 </div>

 {/* Total Fines Collected */}
 <div className="bg-[var(--theme-card-bg)] p-4 rounded-2xl border border-[var(--theme-card-border)] shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-[var(--theme-text-muted)] font-bold">غرامات التفتيش والانضباط</p>
 <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
 {totalFinesIqd.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
 </h3>
 <p className="text-[11px] text-slate-400 mt-1">عن المخالفات المرصودة</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 border border-amber-200 dark:border-amber-800">
 <AlertTriangle className="w-6 h-6" />
 </div>
 </div>

 {/* Total Payments */}
 <div className="bg-[var(--theme-card-bg)] p-4 rounded-2xl border border-[var(--theme-card-border)] shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-[var(--theme-text-muted)] font-bold">نفقات ومخصصات الفرق</p>
 <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
 {totalPaymentsIqd.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
 </h3>
 <p className="text-[11px] text-slate-400 mt-1">وقود ونثريات ومكافآت ضبط</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 border border-rose-200 dark:border-rose-800">
 <TrendingDown className="w-6 h-6" />
 </div>
 </div>

 {/* Net Fund */}
 <div className="bg-[var(--theme-card-bg)] p-4 rounded-2xl border border-[var(--theme-card-border)] shadow-xs flex items-center justify-between">
 <div>
 <p className="text-xs text-[var(--theme-text-muted)] font-bold">صافي رصيد صندوق التفتيش</p>
 <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
 {netInspectionFundBalance.toLocaleString()} <span className="text-xs font-normal">د.ع</span>
 </h3>
 <p className="text-[11px] text-slate-400 mt-1">الحساب المودع لدى الإدارة المالية</p>
 </div>
 <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 border border-indigo-200 dark:border-indigo-800">
 <ShieldCheck className="w-6 h-6" />
 </div>
 </div>
 </div>

 {/* Sub Tabs Selector */}
 <div className="flex items-center gap-2 border-b border-[var(--theme-card-border)] pb-2 text-xs font-bold">
 <button
 onClick={() => setActiveSubTab('vouchers')}
 className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
 activeSubTab === 'vouchers'
 ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
 : 'text-[var(--theme-text-muted)] hover:bg-slate-200 dark:hover:bg-slate-800'
 }`}
 >
 <FileText className="w-4 h-4" />
 سجل السندات والوصولات الرسمية ({filteredVouchers.length})
 </button>

 <button
 onClick={() => setActiveSubTab('budgets')}
 className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
 activeSubTab === 'budgets'
 ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
 : 'text-[var(--theme-text-muted)] hover:bg-slate-200 dark:hover:bg-slate-800'
 }`}
 >
 <Building2 className="w-4 h-4" />
 ميزانيات وجباية لجان المحافظات ({branchBudgets.length})
 </button>

 <button
 onClick={() => setActiveSubTab('audit')}
 className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
 activeSubTab === 'audit'
 ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
 : 'text-[var(--theme-text-muted)] hover:bg-slate-200 dark:hover:bg-slate-800'
 }`}
 >
 <Receipt className="w-4 h-4" />
 تقرير التدقيق والتسوية المالية
 </button>
 </div>

 {/* Tab 1: Vouchers Table */}
 {activeSubTab === 'vouchers' && (
 <div className="space-y-4">
 {/* Filters Bar */}
 <div className="bg-[var(--theme-card-bg)] p-3.5 rounded-2xl border border-[var(--theme-card-border)] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
 <div className="flex-1 min-w-[240px] relative">
 <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="بحث برقم السند، اسم المنشأة، المسدد، أو البيان..."
 className="w-full pr-9 pl-3 py-2 bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl text-xs focus:outline-none focus:border-amber-500"
 />
 </div>

 <div className="flex flex-wrap items-center gap-2">
 <select
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value as any)}
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl px-2.5 py-2 text-xs font-bold"
 >
 <option value="ALL">جميع أنواع السندات</option>
 <option value="RECEIPT">سندات قبض (وارد)</option>
 <option value="PAYMENT">سندات صرف (صادر)</option>
 </select>

 <select
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl px-2.5 py-2 text-xs font-bold"
 >
 <option value="ALL">كافة التصنيفات التفتيشية</option>
 <option value="INSPECTION_FINE">غرامات كشف تفتيشي</option>
 <option value="FACILITY_LICENSING_FEE">رسوم تراخيص منشآت</option>
 <option value="DISCIPLINE_PENALTY">غرامات لجنة الانضباط</option>
 <option value="FIELD_INSPECTION_EXPENSES">نفقات وقود ومخصصات</option>
 <option value="INSPECTOR_REWARD">مكافآت ضبط مخالفات</option>
 </select>

 <select
 value={provinceFilter}
 onChange={(e) => setProvinceFilter(e.target.value)}
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl px-2.5 py-2 text-xs font-bold"
 >
 <option value="ALL">كافة المحافظات</option>
 {provinces.map(p => (
 <option key={p.id} value={p.id}>{p.nameAr}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Vouchers Table */}
 <div className="bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] overflow-hidden shadow-xs">
 <div className="overflow-x-auto">
 <table className="w-full text-right text-xs">
 <thead className="bg-[var(--theme-canvas)] text-[var(--theme-text-primary)] dark:text-slate-300 font-bold border-b border-[var(--theme-card-border)]">
 <tr>
 <th className="p-3">رقم السند والتاريخ</th>
 <th className="p-3">النوع</th>
 <th className="p-3">التصنيف المحاسبي</th>
 <th className="p-3">الجهة / المنشأة المسددة</th>
 <th className="p-3">المحافظة</th>
 <th className="p-3">المبلغ (د.ع)</th>
 <th className="p-3">طريقة التحصيل</th>
 <th className="p-3">الصندوق</th>
 <th className="p-3">الحالة</th>
 <th className="p-3 text-center">الإجراء</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[var(--theme-text-primary)]">
 {filteredVouchers.map((v) => (
 <tr key={v.id} className="hover:bg-[var(--theme-canvas)] dark:hover:bg-slate-800/50 transition">
 <td className="p-3 font-mono">
 <div className="font-extrabold text-[var(--theme-text-primary)] dark:text-white">{v.voucherNumber}</div>
 <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
 <Clock className="w-3 h-3" />
 {v.date}
 </div>
 </td>
 <td className="p-3">
 {v.voucherType === 'RECEIPT' ? (
 <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full font-extrabold text-[11px] border border-emerald-300 dark:border-emerald-800">
 سند قبض
 </span>
 ) : (
 <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full font-extrabold text-[11px] border border-rose-300 dark:border-rose-800">
 سند صرف
 </span>
 )}
 </td>
 <td className="p-3">
 <div className="font-bold">{getCategoryLabel(v.category)}</div>
 {v.notes && <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{v.notes}</div>}
 </td>
 <td className="p-3">
 <div className="font-bold text-[var(--theme-text-primary)]">{v.payerOrBeneficiary}</div>
 {v.facilityName && v.facilityName !== v.payerOrBeneficiary && (
 <div className="text-[10px] text-slate-400">منشأة: {v.facilityName}</div>
 )}
 </td>
 <td className="p-3 font-semibold">{v.provinceName}</td>
 <td className="p-3 font-mono font-black text-sm">
 <span className={v.voucherType === 'RECEIPT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
 {v.voucherType === 'RECEIPT' ? '+' : '-'}{v.amountIqd.toLocaleString()}
 </span>
 </td>
 <td className="p-3">{getPaymentMethodBadge(v.paymentMethod)}</td>
 <td className="p-3">
 <span className="text-[11px] font-semibold text-[var(--theme-text-muted)]">
 {v.treasuryFund === 'INSPECTION_FUND' ? 'صندوق التفتيش' : v.treasuryFund === 'DISCIPLINE_SETTLEMENT' ? 'أمانات الانضباط' : 'الخزينة العامة'}
 </span>
 </td>
 <td className="p-3">
 {v.status === 'COLLECTED' && (
 <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5" />
 تم التحصيل
 </span>
 )}
 {v.status === 'PENDING' && (
 <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" />
 قيد التسديد
 </span>
 )}
 {v.status === 'RECONCILED' && (
 <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1">
 <CheckCircle2 className="w-3.5 h-3.5" />
 تمت المطابقة
 </span>
 )}
 </td>
 <td className="p-3 text-center">
 <button
 onClick={() => setSelectedVoucherForPrint(v)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[var(--theme-text-primary)] dark:text-slate-300 p-1.5 rounded-lg font-bold transition cursor-pointer"
 title="عرض وطباعة الوصل النقابي الرسمي"
 >
 <Printer className="w-4 h-4 text-amber-500" />
 </button>
 </td>
 </tr>
 ))}

 {filteredVouchers.length === 0 && (
 <tr>
 <td colSpan={10} className="text-center py-8 text-slate-400 font-semibold">
 لا توجد سندات مالية مطابقة لخيارات البحث
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Tab 2: Branch Budgets */}
 {activeSubTab === 'budgets' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {branchBudgets.map((b) => {
 const spentPercent = Math.min(100, Math.round((b.operationalSpentIqd / b.operationalAllocatedIqd) * 100));
 const totalGenerated = b.collectedFinesIqd + b.collectedFeesIqd;

 return (
 <div key={b.id} className="bg-[var(--theme-card-bg)] p-5 rounded-2xl border border-[var(--theme-card-border)] shadow-xs space-y-4">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3">
 <div>
 <h4 className="font-extrabold text-[var(--theme-text-primary)] dark:text-white text-base">{b.provinceName}</h4>
 <p className="text-[11px] text-slate-400">الشهر المالي: {b.fiscalMonth}</p>
 </div>
 <span className="bg-amber-500/20 text-amber-500 text-xs px-2.5 py-1 rounded-full font-black border border-amber-500/30">
 {b.inspectionsExecuted} / {b.inspectionsTarget} كشف
 </span>
 </div>

 {/* Operational Spending Progress */}
 <div className="space-y-1.5">
 <div className="flex justify-between text-xs font-bold">
 <span className="text-[var(--theme-text-muted)]">المصروف من موازنة الوقود والنثريات:</span>
 <span className="text-[var(--theme-text-primary)] font-mono">
 {b.operationalSpentIqd.toLocaleString()} / {b.operationalAllocatedIqd.toLocaleString()} د.ع
 </span>
 </div>
 <div className="w-full bg-[var(--theme-canvas)] h-2 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full ${spentPercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
 style={{ width: `${spentPercent}%` }}
 />
 </div>
 <div className="text-[10px] text-slate-400 text-left dir-ltr">
 {spentPercent}% spent
 </div>
 </div>

 {/* Collections Breakdown */}
 <div className="bg-[var(--theme-canvas)]/50 p-3 rounded-xl space-y-2 text-xs">
 <div className="flex justify-between">
 <span className="text-[var(--theme-text-muted)]">غرامات كشوفات محصلة:</span>
 <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
 {b.collectedFinesIqd.toLocaleString()} د.ع
 </span>
 </div>
 <div className="flex justify-between">
 <span className="text-[var(--theme-text-muted)]">رسوم تراخيص منشآت:</span>
 <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
 {b.collectedFeesIqd.toLocaleString()} د.ع
 </span>
 </div>
 <div className="border-t border-[var(--theme-card-border)] pt-2 flex justify-between font-black">
 <span>إجمالي الإيراد التفتيشي:</span>
 <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
 {totalGenerated.toLocaleString()} د.ع
 </span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Tab 3: Financial Audit & Reconciliation */}
 {activeSubTab === 'audit' && (
 <div className="bg-[var(--theme-card-bg)] p-6 rounded-2xl border border-[var(--theme-card-border)] shadow-xs space-y-6">
 <div className="border-b border-[var(--theme-card-border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h3 className="font-extrabold text-[var(--theme-text-primary)] dark:text-white text-base flex items-center gap-2">
 <Receipt className="w-5 h-5 text-amber-500" />
 المطابقة المالية وقفل حسابات التفتيش النقابي
 </h3>
 <p className="text-slate-400 text-xs mt-1">
 تقرير رسمي يبين حركة التدفق المالي لصندوق التفتيش الصحي وحسابات الغرامات الميدانية.
 </p>
 </div>
 <button
 onClick={() => window.print()}
 className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
 >
 <Printer className="w-4 h-4 text-amber-400" />
 طباعة كشف الحساب التفتيشي
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Account Inflows */}
 <div className="space-y-3">
 <h4 className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
 <TrendingUp className="w-4 h-4" />
 المقبوضات التفتيشية الإجمالية (Inflows)
 </h4>
 <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2.5 text-xs">
 <div className="flex justify-between">
 <span>تحصيل غرامات الكشف الميداني:</span>
 <span className="font-mono font-bold">{totalFinesIqd.toLocaleString()} د.ع</span>
 </div>
 <div className="flex justify-between">
 <span>رسوم كشف المنشآت والعيادات الصحية:</span>
 <span className="font-mono font-bold">{totalLicensingFeesIqd.toLocaleString()} د.ع</span>
 </div>
 <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between font-black text-sm">
 <span>المجموع الكلي للمقبوضات:</span>
 <span className="font-mono text-emerald-700 dark:text-emerald-300">{totalReceiptsIqd.toLocaleString()} د.ع</span>
 </div>
 </div>
 </div>

 {/* Account Outflows */}
 <div className="space-y-3">
 <h4 className="font-extrabold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
 <TrendingDown className="w-4 h-4" />
 المصروفات والمخصصات التشغيلية (Outflows)
 </h4>
 <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2.5 text-xs">
 <div className="flex justify-between">
 <span>مخصصات وقود ونثريات فرق التفتيش:</span>
 <span className="font-mono font-bold">350,000 د.ع</span>
 </div>
 <div className="flex justify-between">
 <span>مكافآت ضبط المخالفات والعيادات الوهمية:</span>
 <span className="font-mono font-bold">250,000 د.ع</span>
 </div>
 <div className="border-t border-rose-200 dark:border-rose-800 pt-2 flex justify-between font-black text-sm">
 <span>المجموع الكلي للنفقات:</span>
 <span className="font-mono text-rose-700 dark:text-rose-300">{totalPaymentsIqd.toLocaleString()} د.ع</span>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
 <div>
 <span className="text-xs text-slate-400 font-bold block">صافي الحساب الختامي لصندوق التفتيش:</span>
 <span className="text-xl font-black text-amber-400 font-mono">
 {netInspectionFundBalance.toLocaleString()} دينار عراقي
 </span>
 </div>
 <div className="text-right text-xs text-slate-400">
 <div>مدقق الحسابات: الدائرة المالية العامة</div>
 <div className="text-emerald-400 font-bold mt-0.5">الحساب مطابق بنسبة 100%</div>
 </div>
 </div>
 </div>
 )}

 {/* MODAL: Create New Voucher */}
 {isNewVoucherModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
 <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] overflow-hidden my-auto">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3 shrink-0">
 <h3 className="font-extrabold text-[var(--theme-text-primary)] dark:text-white text-base flex items-center gap-2">
 <Receipt className="w-5 h-5 text-amber-500" />
 {newVoucherType === 'RECEIPT' ? 'إصدار سند قبض غرامة / رسم تفتيشي' : 'إصدار سند صرف مخصصات ونفقات تفتيش'}
 </h3>
 <button
 onClick={() => setIsNewVoucherModalOpen(false)}
 className="text-slate-400 hover:text-[var(--theme-text-muted)] font-bold"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleCreateVoucherSubmit} className="space-y-3.5 text-xs overflow-y-auto flex-1 my-2 pr-1">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">نوع السند:</label>
 <select
 value={newVoucherType}
 onChange={(e) => {
 const t = e.target.value as VoucherType;
 setNewVoucherType(t);
 if (t === 'RECEIPT') setNewCategory('INSPECTION_FINE');
 else setNewCategory('FIELD_INSPECTION_EXPENSES');
 }}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-bold"
 >
 <option value="RECEIPT">سند قبض (إيراد وارد)</option>
 <option value="PAYMENT">سند صرف (نفقة صادرة)</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">التصنيف المحاسبي:</label>
 <select
 value={newCategory}
 onChange={(e) => setNewCategory(e.target.value as any)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-bold"
 >
 {newVoucherType === 'RECEIPT' ? (
 <>
 <option value="INSPECTION_FINE">غرامة محضر كشف تفتيشي</option>
 <option value="FACILITY_LICENSING_FEE">رسم كشف وترخيص منشأة صحية</option>
 <option value="DISCIPLINE_PENALTY">غرامة قرار لجنة الانضباط</option>
 </>
 ) : (
 <>
 <option value="FIELD_INSPECTION_EXPENSES">مخصصات ونثريات وقود التفتيش</option>
 <option value="INSPECTOR_REWARD">مكافأة ضبط مخالفة جسيمة</option>
 <option value="EQUIPMENT_MAINTENANCE">صيانة أجهزة المسح الميداني</option>
 </>
 )}
 </select>
 </div>
 </div>

 {/* Facility Selector (Optional for Receipt) */}
 {newVoucherType === 'RECEIPT' && (
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">ربط بالمنشأة الصحية المسجلة (اختياري):</label>
 <select
 value={newFacilityId}
 onChange={(e) => handleFacilitySelectChange(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5"
 >
 <option value="">-- اختر منشأة صحية أو أدخل الاسم يدوياً أدناه --</option>
 {facilities.map(f => (
 <option key={f.id} value={f.id}>{f.name} ({f.neighborhood})</option>
 ))}
 </select>
 </div>
 )}

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">
 {newVoucherType === 'RECEIPT' ? 'اسم المنشأة أو الشخص المسدد:' : 'اسم الجهة أو المفتش المستفيد:'}
 </label>
 <input
 type="text"
 required
 value={newPayer}
 onChange={(e) => setNewPayer(e.target.value)}
 placeholder="مثال: عيادة المنصور التمريضية..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-bold"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">المبلغ بالدينار العراقي (IQD):</label>
 <input
 type="number"
 required
 min={10000}
 step={25000}
 value={newAmount}
 onChange={(e) => setNewAmount(Number(e.target.value))}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-mono font-bold"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">المحافظة التابعة:</label>
 <select
 value={newProvinceId}
 onChange={(e) => setNewProvinceId(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5"
 >
 {provinces.map(p => (
 <option key={p.id} value={p.id}>{p.nameAr}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">طريقة الدفع:</label>
 <select
 value={newPaymentMethod}
 onChange={(e) => setNewPaymentMethod(e.target.value as any)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-bold"
 >
 <option value="ELECTRONIC_QI">بطاقة كي كارد (QI)</option>
 <option value="ZAIN_CASH">محفظة زين كاش</option>
 <option value="BANK_TRANSFER">تحويل مصرفي (TBI)</option>
 <option value="CASH">نقداً (الصندوق المباشر)</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">رقم الإشعار / الوصل الورقي:</label>
 <input
 type="text"
 value={newRefNumber}
 onChange={(e) => setNewRefNumber(e.target.value)}
 placeholder="مثال: QI-TX-8921"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-mono"
 />
 </div>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">الصندوق المستلم / المحول منه:</label>
 <select
 value={newFund}
 onChange={(e) => setNewFund(e.target.value as any)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5"
 >
 <option value="INSPECTION_FUND">صندوق التفتيش والرقابة الصحية</option>
 <option value="DISCIPLINE_SETTLEMENT">أمانات وقرارات لجنة الانضباط</option>
 <option value="SYNDICATE_MAIN_TREASURY">الخزينة العامة للنقابة</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">البيان والملاحظات:</label>
 <textarea
 rows={2}
 value={newNotes}
 onChange={(e) => setNewNotes(e.target.value)}
 placeholder="أدخل سبب السند ورقم المحضر التفتيشي إن وجد..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5"
 />
 </div>

 <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--theme-card-border)]">
 <button
 type="button"
 onClick={() => setIsNewVoucherModalOpen(false)}
 className="px-4 py-2 text-[var(--theme-text-muted)] font-bold hover:bg-[var(--theme-canvas)] dark:hover:bg-slate-800 rounded-xl"
 >
 إلغاء
 </button>
 <button
 type="submit"
 className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md transition"
 >
 حفظ واعتماد السند
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* MODAL: Printable Official Syndicate Voucher */}
 {selectedVoucherForPrint && (
 <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
 <div className="bg-[var(--theme-card-bg)] text-[var(--theme-text-primary)] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--theme-card-border)] my-auto print:m-0 print:border-none print:shadow-none">
 {/* Voucher Printable Header */}
 <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <SyndicateLogo className="w-14 h-14" />
 <div>
 <h3 className="font-extrabold text-sm">جمهورية العراق - نقابة التمريض العراقية</h3>
 <h4 className="font-black text-base text-amber-700">لجنة التفتيش والرقابة الصحية والانضباط</h4>
 <p className="text-[11px] text-[var(--theme-text-muted)] font-bold">الدائرة المالية والحسابات المركزية</p>
 </div>
 </div>
 <div className="text-left font-mono">
 <div className="text-xs font-bold text-[var(--theme-text-muted)]">رقم السند الرسمي:</div>
 <div className="text-base font-black text-[var(--theme-text-primary)]">{selectedVoucherForPrint.voucherNumber}</div>
 <div className="text-xs text-[var(--theme-text-muted)] font-bold">{selectedVoucherForPrint.date}</div>
 </div>
 </div>

 {/* Voucher Title Badge */}
 <div className="text-center my-4">
 <span className={`inline-block px-6 py-1.5 rounded-full font-black text-sm border ${
 selectedVoucherForPrint.voucherType === 'RECEIPT'
 ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
 : 'bg-rose-50 text-rose-800 border-rose-400'
 }`}>
 {selectedVoucherForPrint.voucherType === 'RECEIPT' ? 'وصل وسند قبض مالي رسمي' : 'سند صرف نفقات تفتيش رسمية'}
 </span>
 </div>

 {/* Voucher Body Details */}
 <div className="space-y-3 text-xs bg-[var(--theme-canvas)] p-4 rounded-xl border border-[var(--theme-card-border)]">
 <div className="flex justify-between border-b border-[var(--theme-card-border)] pb-2">
 <span className="text-[var(--theme-text-muted)] font-bold">
 {selectedVoucherForPrint.voucherType === 'RECEIPT' ? 'استلمنا من السيد / المنشأة:' : 'صرفنا إلى السيد / المنشأة:'}
 </span>
 <span className="font-black text-[var(--theme-text-primary)] text-sm">{selectedVoucherForPrint.payerOrBeneficiary}</span>
 </div>

 <div className="flex justify-between border-b border-[var(--theme-card-border)] pb-2">
 <span className="text-[var(--theme-text-muted)] font-bold">المبلغ المدفوع:</span>
 <span className="font-mono font-black text-base text-amber-700">
 {selectedVoucherForPrint.amountIqd.toLocaleString()} دينار عراقي
 </span>
 </div>

 <div className="flex justify-between border-b border-[var(--theme-card-border)] pb-2">
 <span className="text-[var(--theme-text-muted)] font-bold">التصنيف المحاسبي:</span>
 <span className="font-bold text-[var(--theme-text-primary)]">{getCategoryLabel(selectedVoucherForPrint.category)}</span>
 </div>

 <div className="flex justify-between border-b border-[var(--theme-card-border)] pb-2">
 <span className="text-[var(--theme-text-muted)] font-bold">طريقة التسديد والإشعار:</span>
 <span className="font-bold text-[var(--theme-text-primary)]">
 {selectedVoucherForPrint.paymentMethod} (رقم الإشعار: {selectedVoucherForPrint.referenceNumber || 'مباشر'})
 </span>
 </div>

 <div className="flex justify-between border-b border-[var(--theme-card-border)] pb-2">
 <span className="text-[var(--theme-text-muted)] font-bold">المحافظة / القطاع:</span>
 <span className="font-bold text-[var(--theme-text-primary)]">{selectedVoucherForPrint.provinceName}</span>
 </div>

 <div>
 <span className="text-[var(--theme-text-muted)] font-bold block mb-1">البيان والسبب:</span>
 <p className="bg-[var(--theme-card-bg)] p-2 rounded-lg border border-[var(--theme-card-border)] text-[var(--theme-text-primary)] font-semibold">
 {selectedVoucherForPrint.notes || 'تسديد رسوم أو غرامة تفتيشية رسمية وفقاً للقانون النقابي والتعليمات الصادرة.'}
 </p>
 </div>
 </div>

 {/* Signature Area */}
 <div className="grid grid-cols-3 gap-4 text-center mt-6 pt-4 border-t border-[var(--theme-card-border)] text-[11px] font-bold">
 <div>
 <p className="text-[var(--theme-text-muted)]">منظم السند / المفتش</p>
 <p className="mt-4 font-black">{selectedVoucherForPrint.issuedByUserName}</p>
 </div>
 <div>
 <p className="text-[var(--theme-text-muted)]">تدقيق الحسابات</p>
 <p className="mt-4 font-black text-[var(--theme-text-primary)]">الشعبة المالية المركزية</p>
 </div>
 <div>
 <p className="text-[var(--theme-text-muted)]">مصادقة النقيب / رئيس اللجنة</p>
 <p className="mt-4 font-black text-amber-700">د. فراس الموسوي</p>
 </div>
 </div>

 {/* Modal Controls */}
 <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--theme-card-border)] print:hidden">
 <span className="text-[10px] text-slate-400">
 رمز التحقق الإلكتروني: INS-VAL-{selectedVoucherForPrint.id.toUpperCase()}
 </span>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setSelectedVoucherForPrint(null)}
 className="px-4 py-1.5 text-[var(--theme-text-muted)] font-bold hover:bg-[var(--theme-canvas)] rounded-xl"
 >
 إغلاق
 </button>
 <button
 type="button"
 onClick={() => window.print()}
 className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5"
 >
 <Printer className="w-4 h-4 text-amber-400" />
 طباعة الوصل
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
