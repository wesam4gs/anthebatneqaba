import React, { useState } from 'react';
import { User, Province } from '../types';
import { 
 ROLES_PERMISSIONS_DIRECTORY, 
 canUserBroadcastNationwide, 
 canUserAccessAllProvinces, 
 getUserGeographicScope,
 getUserRoleTitle 
} from '../utils/rolesAndPermissions';
import { 
 Shield, 
 CheckCircle2, 
 XCircle, 
 Lock, 
 Globe2, 
 MapPin, 
 Radio, 
 Users, 
 Megaphone, 
 FileText, 
 AlertTriangle,
 ArrowRight,
 Sparkles
} from 'lucide-react';

interface RolesPermissionsModalProps {
 isOpen: boolean;
 onClose: () => void;
 currentUser: User;
 users: User[];
 provinces: Province[];
 onSelectUser?: (user: User) => void;
}

export const RolesPermissionsModal: React.FC<RolesPermissionsModalProps> = ({
 isOpen,
 onClose,
 currentUser,
 users,
 provinces,
 onSelectUser
}) => {
 const [activeTab, setActiveTab] = useState<'MATRIX' | 'USERS_LIST' | 'CHAT_RULES'>('MATRIX');
 const [filterProvince, setFilterProvince] = useState<string>('all');

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto" dir="rtl">
 <div className="bg-[var(--theme-card-bg)] rounded-3xl max-w-4xl w-full border border-[var(--theme-card-border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
 
 {/* Modal Header */}
 <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 border-b border-slate-700 flex items-start justify-between">
 <div className="flex items-center gap-3.5">
 <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
 <Shield className="w-6 h-6" />
 </div>
 <div>
 <div className="text-[11px] font-bold text-amber-400 tracking-wider">جمهورية العراق — نقابة التمريض العراقية</div>
 <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
 مصفوفة الأدوار والصلاحيات النقابية وقواعد التواصل
 </h2>
 <p className="text-xs text-slate-300 mt-0.5">
 توزيع الصلاحيات الجغرافية والرقابية وضوابط حصر تواصل المفتشين ضمن المحافظة الواحدة
 </p>
 </div>
 </div>

 <button
 onClick={onClose}
 className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition text-sm font-bold cursor-pointer"
 title="إغلاق"
 >
 ✕
 </button>
 </div>

 {/* Current User Quick Badge Banner */}
 <div className="bg-[var(--theme-canvas)]/80 px-5 py-3 border-b border-[var(--theme-card-border)] flex flex-wrap items-center justify-between gap-3 text-xs">
 <div className="flex items-center gap-2.5">
 <span className="font-bold text-[var(--theme-text-muted)]">حسابك الحالي:</span>
 <span className="font-black text-[var(--theme-text-primary)] dark:text-white">{currentUser.name}</span>
 <span className="text-[11px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
 {getUserRoleTitle(currentUser)}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <span className="text-[11px] font-bold text-[var(--theme-text-muted)]">النطاق الجغرافي:</span>
 <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${getUserGeographicScope(currentUser).badgeClass}`}>
 {getUserGeographicScope(currentUser).label}
 </span>
 </div>
 </div>

 {/* Modal Navigation Tabs */}
 <div className="flex items-center gap-2 px-5 pt-3 bg-[var(--theme-card-bg)] border-b border-[var(--theme-card-border)] text-xs font-bold overflow-x-auto">
 <button
 onClick={() => setActiveTab('MATRIX')}
 className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
 activeTab === 'MATRIX'
 ? 'border-amber-500 text-amber-500'
 : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] dark:hover:text-slate-300'
 }`}
 >
 <Shield className="w-4 h-4" />
 <span>مصفوفة الأدوار الستة (المهام والصلاحيات)</span>
 </button>

 <button
 onClick={() => setActiveTab('USERS_LIST')}
 className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
 activeTab === 'USERS_LIST'
 ? 'border-amber-500 text-amber-500'
 : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] dark:hover:text-slate-300'
 }`}
 >
 <Users className="w-4 h-4" />
 <span>قائمة المستخدمين وتوزيع المحافظات ({users.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('CHAT_RULES')}
 className={`pb-3 px-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
 activeTab === 'CHAT_RULES'
 ? 'border-amber-500 text-amber-500'
 : 'border-transparent text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] dark:hover:text-slate-300'
 }`}
 >
 <Radio className="w-4 h-4" />
 <span>قواعد وضوابط التواصل والشات بين المحافظات</span>
 </button>
 </div>

 {/* Modal Content Body */}
 <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
 {/* TAB 1: Roles Directory Matrix */}
 {activeTab === 'MATRIX' && (
 <div className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
 {ROLES_PERMISSIONS_DIRECTORY.map((r) => (
 <div 
 key={r.id}
 className="p-4 rounded-2xl border border-[var(--theme-card-border)] bg-[var(--theme-canvas)] dark:bg-slate-950/60 flex flex-col justify-between hover:border-amber-500/40 transition"
 >
 <div>
 {/* Top Role Header */}
 <div className="flex items-start justify-between gap-2 mb-2">
 <div>
 <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${r.badgeColor}`}>
 {r.title}
 </span>
 <h4 className="font-black text-[var(--theme-text-primary)] dark:text-white text-xs sm:text-sm mt-1.5">
 {r.title}
 </h4>
 </div>
 {r.geographicScope === 'NATIONWIDE' ? (
 <div className="flex items-center gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0">
 <Globe2 className="w-3 h-3" />
 <span>صلاحيات شاملة لكافة المحافظات</span>
 </div>
 ) : (
 <div className="flex items-center gap-1 bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0">
 <Lock className="w-3 h-3" />
 <span>مقيد بالمحافظة فقط</span>
 </div>
 )}
 </div>

 <p className="text-[11px] text-[var(--theme-text-muted)] mb-3 font-semibold">
 نطاق العمل: {r.scopeDescription}
 </p>

 {/* Capabilities Checklist */}
 <div className="space-y-1.5 pt-2 border-t border-[var(--theme-card-border)]">
 {r.permissionsList.map((perm, idx) => (
 <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--theme-text-primary)] dark:text-slate-300">
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
 <span className="leading-snug">{perm}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Footer Highlights */}
 <div className="mt-4 pt-2.5 border-t border-[var(--theme-card-border)] flex items-center justify-between text-[10px] text-slate-400 font-bold">
 <span className="flex items-center gap-1">
 <Megaphone className="w-3 h-3 text-amber-500" />
 تبليغ عام لكل الفروع: {r.canBroadcastNationwide ? '✅ مسموح' : '❌ محظور'}
 </span>
 <span className="flex items-center gap-1">
 <Radio className="w-3 h-3 text-blue-500" />
 شات المحافظات: {r.canChatAcrossProvinces ? 'جميع المحافظات' : 'محافظته فقط'}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 2: Users List with Roles & Geographic Scope */}
 {activeTab === 'USERS_LIST' && (
 <div className="space-y-3">
 {/* Province Filter */}
 <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[var(--theme-canvas)]/60 rounded-xl">
 <span className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300">تصفية حسب المحافظة:</span>
 <div className="flex flex-wrap items-center gap-1.5">
 <button
 onClick={() => setFilterProvince('all')}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
 filterProvince === 'all'
 ? 'bg-amber-500 text-slate-950'
 : 'bg-[var(--theme-card-bg)] dark:bg-slate-700 text-[var(--theme-text-primary)] dark:text-slate-200'
 }`}
 >
 الكل ({users.length})
 </button>
 {provinces.slice(0, 6).map(p => (
 <button
 key={p.id}
 onClick={() => setFilterProvince(p.id)}
 className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
 filterProvince === p.id
 ? 'bg-amber-500 text-slate-950'
 : 'bg-[var(--theme-card-bg)] dark:bg-slate-700 text-[var(--theme-text-primary)] dark:text-slate-200'
 }`}
 >
 {p.nameAr}
 </button>
 ))}
 </div>
 </div>

 {/* Users Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {users
 .filter(u => filterProvince === 'all' || u.provinceId === filterProvince || u.provinceId === 'all')
 .map((u) => {
 const isNationwide = canUserAccessAllProvinces(u);
 const canBroadcast = canUserBroadcastNationwide(u);
 const isCurrent = currentUser.id === u.id;

 return (
 <div 
 key={u.id}
 className={`p-3.5 rounded-2xl border transition flex flex-col justify-between ${
 isCurrent 
 ? 'bg-amber-500/10 border-amber-500/40 shadow-xs' 
 : 'bg-[var(--theme-canvas)]/40 border-[var(--theme-card-border)]'
 }`}
 >
 <div>
 <div className="flex items-start justify-between gap-2">
 <div>
 <div className="flex items-center gap-1.5">
 <h4 className="font-black text-[var(--theme-text-primary)] dark:text-white text-xs sm:text-sm">
 {u.name}
 </h4>
 {isCurrent && (
 <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
 الحساب النشط
 </span>
 )}
 </div>
 <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
 {getUserRoleTitle(u)}
 </div>
 </div>
 <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[var(--theme-text-muted)]">
 {u.badgeNumber}
 </span>
 </div>

 <div className="mt-2.5 space-y-1 text-[11px] text-[var(--theme-text-muted)]">
 <div className="flex items-center justify-between">
 <span className="text-slate-400">النطاق الإداري:</span>
 <span className={`font-bold px-1.5 py-0.2 rounded ${
 isNationwide ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
 }`}>
 {isNationwide ? '🌐 شامل كل المحافظات' : `📍 ${u.provinceName || 'محلي'}`}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-slate-400">التبليغ العام (البرقيات):</span>
 <span className="font-bold">
 {canBroadcast ? '✅ صلاحية تبليغ كافة الفروع' : '❌ مقيد بمحافظته'}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <span className="text-slate-400">نطاق دردشة المفتشين:</span>
 <span className="font-bold">
 {isNationwide ? 'جميع غرف المحافظات الـ 18' : `غرفة ${u.provinceName || 'المحافظة'} فقط`}
 </span>
 </div>
 </div>
 </div>

 {onSelectUser && !isCurrent && (
 <div className="mt-3 pt-2.5 border-t border-[var(--theme-card-border)] flex justify-end">
 <button
 onClick={() => {
 onSelectUser(u);
 onClose();
 }}
 className="text-[10px] font-black bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
 >
 <span>التبديل لهذا الحساب واختباره</span>
 <ArrowRight className="w-3 h-3 rotate-180" />
 </button>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* TAB 3: Chat Architecture & Strict Provincial Isolation Rules */}
 {activeTab === 'CHAT_RULES' && (
 <div className="space-y-4">
 <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 space-y-2">
 <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
 <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
 <span>البروتوكول الأمني النقابي رقم 14: عزل دردشة المحافظات والتبليغ المركزي العام</span>
 </div>
 <p className="text-[var(--theme-text-primary)] dark:text-slate-300 text-xs leading-relaxed">
 تم اعتماد وتطبيق نظام الاتصالات العملياتية في المنصة وفق القواعد الصارمة التالية:
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div className="p-4 rounded-2xl bg-[var(--theme-canvas)]/40 border border-[var(--theme-card-border)] space-y-2">
 <div className="flex items-center gap-2 font-black text-[var(--theme-text-primary)] dark:text-white text-xs sm:text-sm">
 <Lock className="w-4 h-4 text-rose-500" />
 <span>عزل المفتشين الميدانيين على مستوى المحافظة</span>
 </div>
 <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed">
 المفتش الميداني في <strong>محافظة كربلاء المقدسة</strong> (مثل المفتش سجاد كاظم) يتواصل حصراً مع زملائه ومسؤولي فرع كربلاء، ولا يمكنه مطلقاً إرسال رسائل أو قراءة رسائل دردشة مفتشي <strong>محافظة البصرة</strong> (مثل المفتش عمار جاسم) أو أي محافظة أخرى.
 </p>
 </div>

 <div className="p-4 rounded-2xl bg-[var(--theme-canvas)]/40 border border-[var(--theme-card-border)] space-y-2">
 <div className="flex items-center gap-2 font-black text-[var(--theme-text-primary)] dark:text-white text-xs sm:text-sm">
 <Megaphone className="w-4 h-4 text-amber-500" />
 <span>التبليغات العامة والتوجيهات المركزية الشاملة</span>
 </div>
 <p className="text-[var(--theme-text-muted)] text-xs leading-relaxed">
 يمتلك كل من: 
 <br />1. <strong>النقيب العام</strong> (د. فراس الموسوي)
 <br />2. <strong>نائب النقيب</strong> (أ. د. أحمد الحسيني)
 <br />3. <strong>مسؤول فرع بغداد والمقر العام</strong> (م. حيدر الموسوي)
 <br />صلاحية الوصول لكافة المحافظات وإصدار تعميم وتبليغ عام يصل فوراً لجميع فروع ومفتشي العراق الـ 18 عبر القناة المركزية وتطبيق المفتش.
 </p>
 </div>
 </div>

 <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 text-xs">
 <div className="flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
 <span>يمكنك تبديل الحساب في أي لحظة لمعاينة تجربة مفتش كربلاء مقارنة بمفتش البصرة والنقيب!</span>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Modal Footer */}
 <div className="p-4 bg-[var(--theme-canvas)] dark:bg-slate-950 border-t border-[var(--theme-card-border)] flex items-center justify-between text-xs font-bold">
 <span className="text-[var(--theme-text-muted)]">نظام إدارة الصلاحيات — نقابة التمريض العراقية GIS v2.6</span>
 <button
 onClick={onClose}
 className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl transition cursor-pointer shadow-xs"
 >
 فهمت وإغلاق
 </button>
 </div>

 </div>
 </div>
 );
};
