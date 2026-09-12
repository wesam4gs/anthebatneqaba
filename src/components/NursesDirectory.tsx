import React, { useState, useEffect, useRef } from 'react';
import { NurseStaff, User } from '../types';
import { SyndicateLogo } from './SyndicateLogo';
import { 
 Search, 
 UserCheck, 
 ShieldAlert, 
 AlertTriangle, 
 CheckCircle2, 
 Building2, 
 Phone, 
 BadgeCheck, 
 QrCode, 
 Camera, 
 X, 
 GraduationCap, 
 Award, 
 Calendar, 
 User as UserIcon, 
 FileText, 
 Fingerprint, 
 Droplet, 
 Printer, 
 ExternalLink,
 Edit3,
 UserPlus,
 Lock,
 Save
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface NursesDirectoryProps {
 nurses: NurseStaff[];
 currentUser?: User;
 onVerifyNurseSyndicateId: (syndicateId: string) => Promise<any>;
 onUpdateNurse?: (updatedNurse: NurseStaff) => void;
 onAddNurse?: (newNurse: NurseStaff) => void;
}

export const NursesDirectory: React.FC<NursesDirectoryProps> = ({
 nurses,
 currentUser,
 onVerifyNurseSyndicateId,
 onUpdateNurse,
 onAddNurse
}) => {
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('ALL');
 const [syndicateInput, setSyndicateInput] = useState('');
 const [verifyResult, setVerifyResult] = useState<any>(null);

 // Modal States
 const [selectedNurse, setSelectedNurse] = useState<NurseStaff | null>(null);
 const [editingNurse, setEditingNurse] = useState<NurseStaff | null>(null);
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isScannerOpen, setIsScannerOpen] = useState(false);
 const [scanError, setScanError] = useState<string | null>(null);
 const [isScanningActive, setIsScanningActive] = useState(false);

 // Success message toast
 const [toastMessage, setToastMessage] = useState<string | null>(null);

 // Check editing privileges (High Command, Branch Director, Inspection Director)
 const canEdit = currentUser?.role === 'HIGH_COMMAND' || 
 currentUser?.role === 'BRANCH_DIRECTOR' || 
 currentUser?.role === 'INSPECTION_DIRECTOR';

 // New Nurse Form State
 const [newNurseForm, setNewNurseForm] = useState<Partial<NurseStaff>>({
 fullName: '',
 syndicateId: '',
 specializedTitle: 'ممرض جامعي',
 qualificationDegree: 'بكالوريوس علوم التمريض',
 qualificationName: 'كلية التمريض - جامعة بغداد',
 graduationYear: '2022',
 nationalId: '',
 syndicateRegistrationYear: '2022',
 bloodType: 'O+',
 syndicateStatus: 'ACTIVE',
 licenseExpiryDate: '2027-12-31',
 facilityName: 'مستشفى الكرخ الأهلي',
 phone: '',
 notes: ''
 });

 const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 4000);
 };

 const filteredNurses = nurses.filter(n => {
 if (statusFilter !== 'ALL' && n.syndicateStatus !== statusFilter) return false;
 if (searchQuery.trim() !== '') {
 const q = searchQuery.toLowerCase().trim();
 return (
 n.fullName.toLowerCase().includes(q) ||
 n.syndicateId.toLowerCase().includes(q) ||
 n.nationalId.includes(q) ||
 n.facilityName.toLowerCase().includes(q) ||
 (n.qualificationName && n.qualificationName.toLowerCase().includes(q)) ||
 (n.graduationYear && n.graduationYear.toString().includes(q))
 );
 }
 return true;
 });

 const handleVerifySubmit = async (e?: React.FormEvent, customId?: string) => {
 if (e) e.preventDefault();
 const idToVerify = customId || syndicateInput;
 if (!idToVerify.trim()) return;
 const res = await onVerifyNurseSyndicateId(idToVerify);
 setVerifyResult(res);
 if (res && res.found && res.nurse) {
 // Auto open detail modal if verified
 setSelectedNurse(res.nurse);
 }
 };

 // Save Edit Handler
 const handleSaveEditNurse = (e: React.FormEvent) => {
 e.preventDefault();
 if (!editingNurse || !onUpdateNurse) return;
 onUpdateNurse(editingNurse);

 // Update selected nurse view if it's currently open
 if (selectedNurse && selectedNurse.id === editingNurse.id) {
 setSelectedNurse(editingNurse);
 }

 setEditingNurse(null);
 showToast(`تم تحديث بيانات الكادر التمريضي (${editingNurse.fullName}) بنجاح.`);
 };

 // Add New Nurse Handler
 const handleSaveAddNurse = (e: React.FormEvent) => {
 e.preventDefault();
 if (!onAddNurse) return;
 const newNurse: NurseStaff = {
 id: `nurse_${Date.now()}`,
 syndicateId: newNurseForm.syndicateId || `NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
 fullName: newNurseForm.fullName || 'كادر تمريضي جديد',
 nationalId: newNurseForm.nationalId || '1998000000',
 specializedTitle: newNurseForm.specializedTitle || 'ممرض جامعي',
 qualificationDegree: newNurseForm.qualificationDegree || 'بكالوريوس علوم التمريض',
 qualificationName: newNurseForm.qualificationName || 'كلية التمريض',
 graduationYear: newNurseForm.graduationYear || '2022',
 syndicateRegistrationYear: newNurseForm.syndicateRegistrationYear || '2022',
 bloodType: newNurseForm.bloodType || 'O+',
 syndicateStatus: (newNurseForm.syndicateStatus as any) || 'ACTIVE',
 licenseExpiryDate: newNurseForm.licenseExpiryDate || '2027-12-31',
 currentFacilityId: 'fac_1',
 facilityName: newNurseForm.facilityName || 'مستشفى الكرخ الأهلي',
 phone: newNurseForm.phone || '07700000000',
 notes: newNurseForm.notes || ''
 };

 onAddNurse(newNurse);
 setIsAddModalOpen(false);
 showToast(`تم إدراج بيانات الكادر التمريضي الجديد (${newNurse.fullName}) بنجاح.`);
 };

 // Start QR Camera Scanner
 useEffect(() => {
 let html5QrcodeScannerInstance: Html5Qrcode | null = null;

 if (isScannerOpen) {
 setScanError(null);
 setIsScanningActive(true);

 const element = document.getElementById('qr-camera-stream-div');
 if (element) {
 html5QrcodeScannerInstance = new Html5Qrcode('qr-camera-stream-div');
 html5QrcodeRef.current = html5QrcodeScannerInstance;

 html5QrcodeScannerInstance
 .start(
 { facingMode: 'environment' },
 {
 fps: 10,
 qrbox: { width: 220, height: 220 }
 },
 (decodedText) => {
 // Successfully Scanned QR Code!
 setSyndicateInput(decodedText);
 handleVerifySubmit(undefined, decodedText);
 stopScanner();
 },
 () => {
 // Ignore frame errors during active scanning
 }
 )
 .catch((err) => {
 console.warn('Camera initiation failed:', err);
 setScanError('لم يتم الكشف عن كاميرا نشطة أو تم رفض إذن الوصول. يمكنك تجربة اختبار المسح السريع أسفله.');
 setIsScanningActive(false);
 });
 }
 } else {
 stopScanner();
 }

 return () => {
 stopScanner();
 };
 }, [isScannerOpen]);

 const stopScanner = () => {
 if (html5QrcodeRef.current) {
 if (html5QrcodeRef.current.isScanning) {
 html5QrcodeRef.current.stop().catch(() => {});
 }
 html5QrcodeRef.current = null;
 }
 setIsScanningActive(false);
 };

 const handleQuickSimulateScan = (syndicateId: string) => {
 setSyndicateInput(syndicateId);
 handleVerifySubmit(undefined, syndicateId);
 setIsScannerOpen(false);
 };

 return (
 <div className="space-y-6" id="nurses-directory-view">
 {/* Toast Notification */}
 {toastMessage && (
 <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-emerald-400 border border-emerald-500 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
 <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
 <span className="text-xs font-bold">{toastMessage}</span>
 </div>
 )}

 {/* Verification Header */}
 <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
 <BadgeCheck className="w-4 h-4" />
 <span>السجل الوطني المركزي للكوادر التمريضية</span>
 </div>
 <h2 className="text-xl font-bold text-slate-100">فحص سريان الهوية والانتساب النقابي</h2>
 <p className="text-xs text-slate-400 mt-1">
 استعلام فوري ومسح ذكي لهويات التمريض، للحد من الدخلاء وازدواجية العمل بالمستشفيات والعيادات الأهلية
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {/* Add Nurse Button (Admins/Directors Only) */}
 {canEdit && (
 <button
 type="button"
 id="add-nurse-btn"
 onClick={() => setIsAddModalOpen(true)}
 className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-3 rounded-xl transition shadow text-xs cursor-pointer"
 >
 <UserPlus className="w-4 h-4" />
 <span>إضافة كادر تمريضي جديد</span>
 </button>
 )}

 {/* QR Camera Scan Action Button */}
 <button
 id="open-qr-camera-btn"
 type="button"
 onClick={() => setIsScannerOpen(true)}
 className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-3 rounded-xl transition shadow-lg text-xs cursor-pointer"
 >
 <QrCode className="w-5 h-5" />
 <span>مسح QR الكاميرا</span>
 </button>
 </div>
 </div>

 {/* Instant Verification Search */}
 <form onSubmit={(e) => handleVerifySubmit(e)} className="flex gap-2 text-xs">
 <input
 id="syndicate-verify-input"
 type="text"
 value={syndicateInput}
 onChange={(e) => setSyndicateInput(e.target.value)}
 placeholder="أدخل رقم الانتساب النقابي أو امسح الباركود..."
 className="flex-1 bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 text-sm"
 />
 <button
 id="verify-syndicate-btn"
 type="submit"
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow cursor-pointer"
 >
 استعلام فوري
 </button>
 </form>

 {verifyResult && (
 <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in ${
 verifyResult.found && verifyResult.status === 'ACTIVE'
 ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
 : 'bg-red-950 border-red-700 text-red-200'
 }`} id="directory-verify-result">
 <div className="flex items-center justify-between font-bold text-sm">
 <span className="flex items-center gap-2">
 {verifyResult.found && verifyResult.status === 'ACTIVE' ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
 ) : (
 <AlertTriangle className="w-5 h-5 text-red-400" />
 )}
 {verifyResult.message}
 </span>
 <span className="font-mono text-xs bg-slate-900 px-3 py-1 rounded border border-slate-800">
 {verifyResult.status}
 </span>
 </div>

 {verifyResult.found && verifyResult.nurse && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800 text-xs">
 <div><span className="text-slate-400 block">الاسم الثلاثي:</span> <span className="font-bold">{verifyResult.nurse.fullName}</span></div>
 <div><span className="text-slate-400 block">العنوان الوظيفي:</span> <span className="font-bold">{verifyResult.nurse.specializedTitle}</span></div>
 <div><span className="text-slate-400 block">سنة التخرج:</span> <span className="font-bold text-amber-300">{verifyResult.nurse.graduationYear || 'غير مسجل'}</span></div>
 <div><span className="text-slate-400 block">المنشأة الحالية:</span> <span className="font-bold">{verifyResult.nurse.facilityName}</span></div>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Directory Table */}
 <div className="bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-xs overflow-hidden" id="nurses-table-container">
 <div className="p-4 border-b border-[var(--theme-card-border)] flex flex-col md:flex-row md:items-center justify-between gap-3">
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-sm">قائمة الكوادر التمريضية المسجلة والنقابية</h3>
 <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
 {canEdit ? (
 <span className="text-emerald-700 dark:text-emerald-400 font-bold">صلاحية تعديل وتحديث بيانات الكوادر مفعّلة لرؤساء الفروع والمدراء</span>
 ) : (
 <span className="text-slate-400 flex items-center gap-1">
 <Lock className="w-3 h-3 text-slate-400" />
 وضع الاستعلام للعرض فقط (التعديل مقتصر على المدير ومسؤول الفرع)
 </span>
 )}
 </p>
 </div>

 <div className="flex items-center gap-2 text-xs">
 <div className="relative">
 <input
 id="search-nurse-input"
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="بحث بالاسم، سنة التخرج، الكلية..."
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl pr-8 pl-3 py-1.5 focus:outline-none focus:border-amber-500"
 />
 <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
 </div>

 <select
 id="filter-nurse-status"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 text-[var(--theme-text-primary)] rounded-xl p-1.5 font-semibold focus:outline-none"
 >
 <option value="ALL">جميع الحالات</option>
 <option value="ACTIVE">هوية سارية</option>
 <option value="EXPIRED">منتهية الصلاحية</option>
 <option value="SUSPENDED">موقوف عن العمل</option>
 </select>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-right text-xs" id="nurses-table">
 <thead className="bg-[var(--theme-header-bg)] text-slate-200 text-[11px] font-bold uppercase">
 <tr>
 <th className="p-3.5">الاسم واللقب العلمي</th>
 <th className="p-3.5">المؤهل وسنة التخرج</th>
 <th className="p-3.5">رقم الانتساب النقابي</th>
 <th className="p-3.5">حالة الهوية</th>
 <th className="p-3.5">تاريخ الانتهاء</th>
 <th className="p-3.5">المنشأة الحالية</th>
 <th className="p-3.5 text-center">الإجراءات</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
 {filteredNurses.map((n) => (
 <tr key={n.id} className="hover:bg-amber-50/40 dark:hover:bg-slate-800/60 transition group">
 {/* Clickable Name */}
 <td className="p-3.5 font-bold text-[var(--theme-text-primary)]">
 <button
 type="button"
 onClick={() => setSelectedNurse(n)}
 className="text-right hover:text-amber-700 dark:hover:text-amber-400 font-bold transition flex flex-col cursor-pointer"
 >
 <span className="text-sm text-[var(--theme-text-primary)] group-hover:text-amber-800 dark:group-hover:text-amber-400 underline decoration-amber-300 underline-offset-2">
 {n.fullName}
 </span>
 <span className="text-[10px] text-[var(--theme-text-muted)] font-normal mt-0.5">{n.specializedTitle}</span>
 </button>
 </td>

 {/* Qualification & Graduation Year */}
 <td className="p-3.5 text-[var(--theme-text-primary)]">
 <div className="flex items-center gap-1.5 font-semibold text-[var(--theme-text-primary)]">
 <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
 <span>{n.qualificationDegree || 'كلية/معهد التمريض'}</span>
 </div>
 <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--theme-text-muted)]">
 <span>سنة التخرج:</span>
 <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono">
 {n.graduationYear || 'غير محدد'}
 </span>
 </div>
 </td>

 <td className="p-3.5 font-mono font-bold text-amber-800">
 {n.syndicateId}
 </td>

 <td className="p-3.5">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
 n.syndicateStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
 n.syndicateStatus === 'EXPIRED' ? 'bg-amber-100 text-amber-800' :
 'bg-red-100 text-red-800'
 }`}>
 {n.syndicateStatus === 'ACTIVE' ? 'فعال ومجاز' :
 n.syndicateStatus === 'EXPIRED' ? 'منتهي الصلاحية' : 'موقوف عن العمل'}
 </span>
 </td>

 <td className="p-3.5 font-mono text-[var(--theme-text-primary)]">
 {n.licenseExpiryDate}
 </td>

 <td className="p-3.5 font-semibold text-[var(--theme-text-primary)]">
 {n.facilityName}
 </td>

 <td className="p-3.5 text-center">
 <div className="flex items-center justify-center gap-1.5">
 <button
 type="button"
 onClick={() => setSelectedNurse(n)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer"
 >
 <span>عرض</span>
 <ExternalLink className="w-3 h-3" />
 </button>

 {/* EDIT BUTTON (Directors & Branch Managers Only) */}
 {canEdit && (
 <button
 type="button"
 id={`edit-nurse-${n.id}`}
 onClick={() => setEditingNurse(n)}
 className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-2.5 py-1.5 rounded-lg transition text-[11px] inline-flex items-center gap-1 cursor-pointer shadow-xs"
 >
 <Edit3 className="w-3 h-3" />
 <span>تعديل</span>
 </button>
 )}
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* -------------------------------------------------------------------------- */}
 {/* 1. Camera QR Scanner Modal */}
 {/* -------------------------------------------------------------------------- */}
 {isScannerOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
 <div className="flex items-center justify-between pb-3 border-b border-slate-800">
 <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
 <Camera className="w-5 h-5" />
 <span>ماسح الباركود والهوية التمريضية (QR Code)</span>
 </div>
 <button
 type="button"
 onClick={() => setIsScannerOpen(false)}
 className="text-slate-400 hover:text-white p-1 rounded-lg transition"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Video Viewport Area */}
 <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 min-h-[260px] flex items-center justify-center">
 <div id="qr-camera-stream-div" className="w-full"></div>

 {!isScanningActive && !scanError && (
 <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2">
 <QrCode className="w-12 h-12 text-amber-400 animate-pulse" />
 <p className="text-xs text-slate-300 font-medium">جاري تشغيل الكاميرا وتوجيه المستشعر...</p>
 </div>
 )}

 {scanError && (
 <div className="p-4 text-center space-y-2 text-red-300 text-xs">
 <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
 <p>{scanError}</p>
 </div>
 )}
 </div>

 <p className="text-[11px] text-slate-400 text-center">
 قم بتوجيه كاميرا الجهاز نحو رمز الـ QR أو الباركود المطبوع خلف هوية نقابة التمريض العراقية.
 </p>

 {/* Simulated Scan Quick Options for Testing */}
 <div className="pt-3 border-t border-slate-800 space-y-2">
 <span className="text-[10px] text-amber-400 font-bold block">اختبار المسح السريع (بدون كاميرا):</span>
 <div className="grid grid-cols-2 gap-2 text-[11px]">
 {nurses.slice(0, 4).map((nr) => (
 <button
 key={nr.id}
 type="button"
 onClick={() => handleQuickSimulateScan(nr.syndicateId)}
 className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-right p-2 rounded-lg border border-slate-700 transition truncate cursor-pointer"
 >
 <span className="font-bold block truncate">{nr.fullName}</span>
 <span className="font-mono text-[9px] text-amber-300 block">{nr.syndicateId}</span>
 </button>
 ))}
 </div>
 </div>

 <button
 type="button"
 onClick={() => setIsScannerOpen(false)}
 className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition"
 >
 إلغاء وإغلاق
 </button>
 </div>
 </div>
 )}

 {/* -------------------------------------------------------------------------- */}
 {/* 2. Full Nurse Detail & Graduation Profile Modal */}
 {/* -------------------------------------------------------------------------- */}
 {selectedNurse && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-[var(--theme-card-bg)] rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 text-right border border-[var(--theme-card-border)]">
 {/* Header / ID Badge Visual */}
 <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-5 border border-slate-800 relative shadow-inner">
 <button
 type="button"
 onClick={() => setSelectedNurse(null)}
 className="absolute left-4 top-4 bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-1.5 rounded-full transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
 {/* Avatar / Photo */}
 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white shrink-0">
 {selectedNurse.fullName.slice(0, 2)}
 </div>

 <div className="space-y-1 text-center sm:text-right flex-1">
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
 <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full">
 هوية انتساب نقابي رسمية
 </span>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
 selectedNurse.syndicateStatus === 'ACTIVE' ? 'bg-emerald-500 text-slate-950' :
 selectedNurse.syndicateStatus === 'EXPIRED' ? 'bg-amber-500 text-slate-950' : 'bg-red-500 text-white'
 }`}>
 {selectedNurse.syndicateStatus === 'ACTIVE' ? 'فعال ومجاز' :
 selectedNurse.syndicateStatus === 'EXPIRED' ? 'منتهي الصلاحية' : 'موقوف عن العمل'}
 </span>
 </div>

 <h3 className="text-xl font-black text-white">{selectedNurse.fullName}</h3>
 <p className="text-amber-300 text-xs font-semibold">{selectedNurse.specializedTitle}</p>
 <p className="text-slate-400 font-mono text-xs">رقم الانتساب: <span className="text-amber-400 font-bold">{selectedNurse.syndicateId}</span></p>
 </div>

 {/* Syndicate Logo Emblem */}
 <SyndicateLogo className="w-14 h-14 bg-[var(--theme-card-bg)] p-1 rounded-full border-2 border-amber-400 shadow-md hidden sm:block shrink-0" />
 </div>
 </div>

 {/* Academic Qualification & Graduation Year Highlight Card */}
 <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
 <div className="flex items-center gap-2 text-amber-900 font-bold text-xs border-b border-amber-200/60 pb-2">
 <GraduationCap className="w-4 h-4 text-amber-700" />
 <span>المؤهل الأكاديمي وتفاصيل سنة التخرج</span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
 <div className="bg-[var(--theme-card-bg)] p-3 rounded-xl border border-amber-200/80 shadow-2xs">
 <span className="text-[var(--theme-text-muted)] text-[11px] block font-medium">الشهادة / الدرجة العلمية:</span>
 <span className="font-bold text-[var(--theme-text-primary)] text-sm block mt-0.5">
 {selectedNurse.qualificationDegree || 'بكالوريوس علوم التمريض'}
 </span>
 </div>

 <div className="bg-[var(--theme-card-bg)] p-3 rounded-xl border border-amber-200/80 shadow-2xs">
 <span className="text-[var(--theme-text-muted)] text-[11px] block font-medium">سنة التخرج الرسمية:</span>
 <span className="font-black text-amber-900 text-base font-mono block mt-0.5">
 {selectedNurse.graduationYear ? `دفعة عام ${selectedNurse.graduationYear}` : 'غير مسجلة'}
 </span>
 </div>

 <div className="sm:col-span-2 bg-[var(--theme-card-bg)] p-3 rounded-xl border border-amber-200/80 shadow-2xs">
 <span className="text-[var(--theme-text-muted)] text-[11px] block font-medium">الكلية / المعهد / إعدادية التمريض:</span>
 <span className="font-bold text-[var(--theme-text-primary)] text-xs block mt-0.5">
 {selectedNurse.qualificationName || 'جامعة بغداد - كلية التمريض'}
 </span>
 </div>
 </div>
 </div>

 {/* Complete Nurse Information Table */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">الرقم الوطني الموحد</span>
 <span className="font-mono font-bold text-[var(--theme-text-primary)] text-xs mt-0.5 block">{selectedNurse.nationalId}</span>
 </div>

 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">سنة الانتساب النقابي</span>
 <span className="font-mono font-bold text-[var(--theme-text-primary)] text-xs mt-0.5 block">{selectedNurse.syndicateRegistrationYear || '2018'}</span>
 </div>

 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">فصيلة الدم</span>
 <span className="font-bold text-[var(--theme-text-primary)] text-xs mt-0.5 block">{selectedNurse.bloodType || 'O+'}</span>
 </div>

 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">تاريخ انتهاء الترخيص</span>
 <span className="font-mono font-bold text-amber-800 text-xs mt-0.5 block">{selectedNurse.licenseExpiryDate}</span>
 </div>

 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">رقم الهاتف</span>
 <span className="font-mono font-bold text-[var(--theme-text-primary)] text-xs mt-0.5 block">{selectedNurse.phone}</span>
 </div>

 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)]">
 <span className="text-slate-400 block text-[10px] font-bold">المنشأة الحالية المعين بها</span>
 <span className="font-bold text-[var(--theme-text-primary)] text-xs mt-0.5 block truncate">{selectedNurse.facilityName}</span>
 </div>
 </div>

 {/* Notes or Penalties if exists */}
 {selectedNurse.notes && (
 <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
 <span className="font-bold block flex items-center gap-1">
 <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
 ملاحظات تفتيشية / إنذارات سابقة:
 </span>
 <p>{selectedNurse.notes}</p>
 </div>
 )}

 {/* Modal Actions */}
 <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-card-border)]">
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => window.print()}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold px-4 py-2.5 rounded-xl text-xs transition inline-flex items-center gap-2 cursor-pointer"
 >
 <Printer className="w-4 h-4 text-[var(--theme-text-muted)]" />
 <span>طباعة الاستمارة</span>
 </button>

 {canEdit && (
 <button
 type="button"
 onClick={() => {
 setEditingNurse(selectedNurse);
 }}
 className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition inline-flex items-center gap-1.5 cursor-pointer shadow"
 >
 <Edit3 className="w-4 h-4" />
 <span>تعديل بيانات الكادر</span>
 </button>
 )}
 </div>

 <button
 type="button"
 onClick={() => setSelectedNurse(null)}
 className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer"
 >
 إغلاق
 </button>
 </div>
 </div>
 </div>
 )}

 {/* -------------------------------------------------------------------------- */}
 {/* 3. Edit Nurse Modal (Admins / Directors / Branch Managers Only) */}
 {/* -------------------------------------------------------------------------- */}
 {editingNurse && canEdit && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="edit-nurse-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] text-right overflow-hidden my-auto">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3 shrink-0">
 <div className="flex items-center gap-2 text-purple-900">
 <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
 <Edit3 className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base">تعديل سجل الكادر التمريضي النقابي</h3>
 <p className="text-xs text-[var(--theme-text-muted)]">صلاحية المدير / مسؤول الفرع: {editingNurse.fullName}</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setEditingNurse(null)}
 className="text-slate-400 hover:text-[var(--theme-text-primary)] font-bold text-lg cursor-pointer"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleSaveEditNurse} className="space-y-4 text-xs overflow-y-auto flex-1 my-2 pr-1">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الاسم الكامل واللقب:</label>
 <input
 type="text"
 value={editingNurse.fullName}
 onChange={(e) => setEditingNurse({ ...editingNurse, fullName: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">رقم الانتساب النقابي:</label>
 <input
 type="text"
 value={editingNurse.syndicateId}
 onChange={(e) => setEditingNurse({ ...editingNurse, syndicateId: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold text-purple-900 focus:outline-none focus:border-purple-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">العنوان الوظيفي / التخصص:</label>
 <input
 type="text"
 value={editingNurse.specializedTitle}
 onChange={(e) => setEditingNurse({ ...editingNurse, specializedTitle: e.target.value })}
 placeholder="مثال: ممرض جامعي، أخصائي تخدير..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">حالة الهوية النقابية:</label>
 <select
 value={editingNurse.syndicateStatus}
 onChange={(e) => setEditingNurse({ ...editingNurse, syndicateStatus: e.target.value as any })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 >
 <option value="ACTIVE">فعال ومجاز أصولياً (ACTIVE)</option>
 <option value="EXPIRED">منتهي الصلاحية (EXPIRED)</option>
 <option value="SUSPENDED">موقوف عن العمل (SUSPENDED)</option>
 <option value="REVOKED">ملغى الترخيص (REVOKED)</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المؤهل الأكاديمي:</label>
 <select
 value={editingNurse.qualificationDegree || 'بكالوريوس علوم التمريض'}
 onChange={(e) => setEditingNurse({ ...editingNurse, qualificationDegree: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 >
 <option value="بكالوريوس علوم التمريض">بكالوريوس علوم التمريض</option>
 <option value="دبلوم تمريض فني">دبلوم تمريض فني (معهد)</option>
 <option value="إعدادية التمريض">إعدادية التمريض</option>
 <option value="ماجستير تمريض">ماجستير تمريض تخصصي</option>
 <option value="دكتوراه علوم تمريض">دكتوراه علوم تمريض</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الكلية / المعهد:</label>
 <input
 type="text"
 value={editingNurse.qualificationName || ''}
 onChange={(e) => setEditingNurse({ ...editingNurse, qualificationName: e.target.value })}
 placeholder="جامعة بغداد - كلية التمريض"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">سنة التخرج:</label>
 <input
 type="text"
 value={editingNurse.graduationYear || ''}
 onChange={(e) => setEditingNurse({ ...editingNurse, graduationYear: e.target.value })}
 placeholder="2020"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-purple-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الرقم الوطني الموحد:</label>
 <input
 type="text"
 value={editingNurse.nationalId}
 onChange={(e) => setEditingNurse({ ...editingNurse, nationalId: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">سنة الانتساب:</label>
 <input
 type="text"
 value={editingNurse.syndicateRegistrationYear || ''}
 onChange={(e) => setEditingNurse({ ...editingNurse, syndicateRegistrationYear: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">تاريخ انتهاء الهوية:</label>
 <input
 type="date"
 value={editingNurse.licenseExpiryDate}
 onChange={(e) => setEditingNurse({ ...editingNurse, licenseExpiryDate: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-purple-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المنشأة/المستشفى الحالية:</label>
 <input
 type="text"
 value={editingNurse.facilityName}
 onChange={(e) => setEditingNurse({ ...editingNurse, facilityName: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-purple-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">رقم الهاتف:</label>
 <input
 type="text"
 value={editingNurse.phone}
 onChange={(e) => setEditingNurse({ ...editingNurse, phone: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-purple-500"
 />
 </div>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">ملاحظات أو عقوبات إدارية مسجلة:</label>
 <textarea
 rows={2}
 value={editingNurse.notes || ''}
 onChange={(e) => setEditingNurse({ ...editingNurse, notes: e.target.value })}
 placeholder="ملاحظات تفتيشية أو إنذارات سابقة..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 focus:outline-none focus:border-purple-500"
 />
 </div>

 <div className="flex items-center gap-2 pt-2 border-t border-[var(--theme-card-border)]">
 <button
 type="submit"
 className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
 >
 <Save className="w-4 h-4" />
 <span>حفظ وتحديث بيانات الكادر النقابي</span>
 </button>
 <button
 type="button"
 onClick={() => setEditingNurse(null)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer"
 >
 إلغاء
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* -------------------------------------------------------------------------- */}
 {/* 4. Add Nurse Modal (Admins / Directors / Branch Managers Only) */}
 {/* -------------------------------------------------------------------------- */}
 {isAddModalOpen && canEdit && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="add-nurse-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] text-right overflow-hidden my-auto">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3 shrink-0">
 <div className="flex items-center gap-2 text-emerald-800">
 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
 <UserPlus className="w-5 h-5" />
 </div>
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base">تسجيل كادر تمريضي نقابي جديد</h3>
 <p className="text-xs text-[var(--theme-text-muted)]">إدخال البيانات في السجل الوطني المركزي</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 className="text-slate-400 hover:text-[var(--theme-text-primary)] font-bold text-lg cursor-pointer"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleSaveAddNurse} className="space-y-4 text-xs overflow-y-auto flex-1 my-2 pr-1">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الاسم الكامل واللقب:</label>
 <input
 type="text"
 value={newNurseForm.fullName}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, fullName: e.target.value })}
 placeholder="مثال: أحمد جاسم محمد الشمري"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">رقم الانتساب النقابي:</label>
 <input
 type="text"
 value={newNurseForm.syndicateId}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, syndicateId: e.target.value })}
 placeholder="NUR-2026-XXXX"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold text-emerald-900 focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">العنوان الوظيفي / التخصص:</label>
 <input
 type="text"
 value={newNurseForm.specializedTitle}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, specializedTitle: e.target.value })}
 placeholder="مثال: ممرض جامعي، ممرض ماهر..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">حالة الهوية النقابية:</label>
 <select
 value={newNurseForm.syndicateStatus}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, syndicateStatus: e.target.value as any })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 >
 <option value="ACTIVE">فعال ومجاز أصولياً (ACTIVE)</option>
 <option value="EXPIRED">منتهي الصلاحية (EXPIRED)</option>
 <option value="SUSPENDED">موقوف عن العمل (SUSPENDED)</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المؤهل الأكاديمي:</label>
 <select
 value={newNurseForm.qualificationDegree}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, qualificationDegree: e.target.value })}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 >
 <option value="بكالوريوس علوم التمريض">بكالوريوس علوم التمريض</option>
 <option value="دبلوم تمريض فني">دبلوم تمريض فني (معهد)</option>
 <option value="إعدادية التمريض">إعدادية التمريض</option>
 <option value="ماجستير تمريض">ماجستير تمريض تخصصي</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الكلية / المعهد:</label>
 <input
 type="text"
 value={newNurseForm.qualificationName}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, qualificationName: e.target.value })}
 placeholder="جامعة بغداد - كلية التمريض"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">سنة التخرج:</label>
 <input
 type="text"
 value={newNurseForm.graduationYear}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, graduationYear: e.target.value })}
 placeholder="2022"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المنشأة/المستشفى المعين بها:</label>
 <input
 type="text"
 value={newNurseForm.facilityName}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, facilityName: e.target.value })}
 placeholder="اسم المنشأة الحالية..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">رقم الهاتف:</label>
 <input
 type="text"
 value={newNurseForm.phone}
 onChange={(e) => setNewNurseForm({ ...newNurseForm, phone: e.target.value })}
 placeholder="0770XXXXXXX"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>

 <div className="flex items-center gap-2 pt-2 border-t border-[var(--theme-card-border)]">
 <button
 type="submit"
 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
 >
 <UserPlus className="w-4 h-4" />
 <span>إضافة الكادر إلى السجل النقابي</span>
 </button>
 <button
 type="button"
 onClick={() => setIsAddModalOpen(false)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer"
 >
 إلغاء
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};
