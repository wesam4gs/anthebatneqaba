import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Facility, NurseStaff, InspectionAssignment } from '../types';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { RolesPermissionsModal } from './RolesPermissionsModal';
import { ThemeSelectorPopover } from './ThemeSelectorPopover';
import { SidebarThemePopover } from './SidebarThemePopover';
import { INITIAL_USERS } from '../data/initialData';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Globe, 
  LogOut, 
  Shield, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ChevronRight,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
  Smartphone
} from 'lucide-react';

interface ExecutiveLayoutProps {
 currentUser: User;
 onUserChange: (user: User) => void;
 activeTab: string;
 onTabChange: (tab: string) => void;
 pendingCount?: number;
 facilities?: Facility[];
 nurses?: NurseStaff[];
 assignments?: InspectionAssignment[];
 onRefreshData?: () => void;
 children: React.ReactNode;
}

export const ExecutiveLayout: React.FC<ExecutiveLayoutProps> = ({
 currentUser,
 onUserChange,
 activeTab,
 onTabChange,
 pendingCount = 2,
 facilities = [],
 nurses = [],
 assignments = [],
 onRefreshData,
 children
}) => {
 const { lang, theme, t, toggleLanguage, toggleTheme, currentSidebarThemePreset } = useLanguageTheme();
 const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
 const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
 const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
 const [showRolesModal, setShowRolesModal] = useState<boolean>(false);
 const [globalSearch, setGlobalSearch] = useState<string>('');
 const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
 const [globalToast, setGlobalToast] = useState<{ msg: string; type: 'success' | 'info' | 'warn' } | null>(null);

 const searchContainerRef = useRef<HTMLDivElement>(null);
 const notificationsRef = useRef<HTMLDivElement>(null);
 const userMenuRef = useRef<HTMLDivElement>(null);

 // Close dropdowns on outside click
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
 setShowSearchResults(false);
 }
 if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
 setIsNotificationsOpen(false);
 }
 if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
 setIsUserMenuOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // Format today's date in Iraqi Arabic
 const currentDateStr = useMemo(() => {
 try {
 const options: Intl.DateTimeFormatOptions = { 
 weekday: 'long', 
 year: 'numeric', 
 month: 'long', 
 day: 'numeric' 
 };
 return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-IQ' : 'en-US', options).format(new Date());
 } catch (e) {
 return 'الخميس 10 أيلول 2026';
 }
 }, [lang]);

 // Toast auto-hide
 const triggerToast = (msg: string, type: 'success' | 'info' | 'warn' = 'success') => {
 setGlobalToast({ msg, type });
 setTimeout(() => {
 setGlobalToast(null);
 }, 4000);
 };

 // Nav Items matching the old design
 const navItems = [
 {
 id: 'sql_schema',
 label: lang === 'ar' ? 'الواجهة الرئيسية' : 'Main Dashboard',
 icon: '◧',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'gis_map',
 label: lang === 'ar' ? 'خريطة GIS التفاعلية' : 'GIS Interactive Map',
 icon: '✦',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'zone_manager',
 label: lang === 'ar' ? 'إدارة خطط لجان التفتيش' : 'Inspection Plans & Zones',
 icon: '▣',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'users_management',
 label: lang === 'ar' ? 'إدارة المستخدمين واللجان' : 'Users & Committees',
 icon: '◉',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'facilities',
 label: lang === 'ar' ? 'سجل المنشآت والعيادات' : 'Facilities Directory',
 icon: '☰',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'assignments',
 label: lang === 'ar' ? 'إدارة المهام والكشوفات' : 'Inspection Tasks',
 icon: '✎',
 badge: pendingCount > 0 ? String(pendingCount) : null,
 badgeColor: 'bg-amber-500 text-slate-950 font-bold'
 },
 {
 id: 'field_inspector',
 label: lang === 'ar' ? 'التطبيق الميداني للمفتش' : 'Field Inspector App',
 icon: '▤',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'violations',
 label: lang === 'ar' ? 'سجل المخالفات والقرارات' : 'Violations & Penalties',
 icon: '⚑',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'nurses',
 label: lang === 'ar' ? 'سجل هويات التمريض' : 'Nurses Registry & Badges',
 icon: '✚',
 badge: null,
 badgeColor: ''
 },
 {
 id: 'finance',
 label: lang === 'ar' ? 'الحسابات والجباية التفتيشية' : 'Inspection Revenue & Finance',
 icon: '💳',
 badge: lang === 'ar' ? 'جديد' : 'NEW',
 badgeColor: 'bg-emerald-600 text-white font-bold'
 },
 {
 id: 'operations_chat',
 label: lang === 'ar' ? 'غرفة العمليات وتواصل الفروع' : 'Branch Operations Room',
 icon: '📻',
 badge: lang === 'ar' ? 'مباشر' : 'LIVE',
 badgeColor: 'bg-red-600 text-white font-bold animate-pulse'
 }
 ];

 // Active section title for breadcrumb
 const currentNav = navItems.find(item => item.id === activeTab);
 const crumbTitle = currentNav ? currentNav.label : (lang === 'ar' ? 'الواجهة الرئيسية' : 'Main Dashboard');

 // Global search filtering
 const searchResults = useMemo(() => {
 const q = globalSearch.trim().toLowerCase();
 if (!q || q.length < 2) return { facilities: [], nurses: [], users: [] };

 const matchedFacs = facilities.filter(f => 
 f.name.toLowerCase().includes(q) || 
 f.licenseNumber.toLowerCase().includes(q) ||
 (f.districtArea && f.districtArea.toLowerCase().includes(q))
 ).slice(0, 4);

 const matchedNurses = nurses.filter(n => 
 n.fullName.toLowerCase().includes(q) ||
 n.syndicateBadgeNumber.toLowerCase().includes(q) ||
 n.nationalId.includes(q)
 ).slice(0, 4);

 const matchedUsers = INITIAL_USERS.filter(u => 
 u.name.toLowerCase().includes(q) ||
 (u.badgeNumber && u.badgeNumber.toLowerCase().includes(q)) ||
 (u.provinceName && u.provinceName.toLowerCase().includes(q))
 ).slice(0, 3);

 return {
 facilities: matchedFacs,
 nurses: matchedNurses,
 users: matchedUsers
 };
 }, [globalSearch, facilities, nurses]);

 const hasSearchResults = 
 searchResults.facilities.length > 0 || 
 searchResults.nurses.length > 0 || 
 searchResults.users.length > 0;

 // Active Notifications List
 const notificationsList = useMemo(() => {
 const alerts: Array<{ id: string; title: string; desc: string; type: 'warning' | 'info' | 'danger'; date: string; tab: string }> = [];
 
 // Check expiring facilities
 const expiring = facilities.filter(f => f.licenseStatus === 'PENDING' || f.licenseStatus === 'EXPIRED').slice(0, 3);
 expiring.forEach(f => {
 alerts.push({
 id: `exp_${f.id}`,
 title: `إنذار ترخيص: ${f.name}`,
 desc: `حالة الإجازة (${f.licenseStatus}) - محافظة ${f.provinceName || 'بغداد'}`,
 type: 'warning',
 date: 'منذ يومين',
 tab: 'facilities'
 });
 });

 // Check pending assignments
 const pendingTasks = assignments.filter(a => a.status === 'PENDING').slice(0, 2);
 pendingTasks.forEach(t => {
 alerts.push({
 id: `task_${t.id}`,
 title: `كشف تفتيشي معلق: ${t.facilityName}`,
 desc: `مكلف به المفتش ${t.assignedInspectorName} - أولوية (${t.priority})`,
 type: 'info',
 date: 'اليوم',
 tab: 'assignments'
 });
 });

 // Official broadcast alert
 alerts.push({
 id: 'brd_1',
 title: 'تبليغ عملياتي رسمي من نقيب التمريض',
 desc: 'حملة تفتيشية مسائية شاملة على المراكز التجميلية الأهلية غير المجازة',
 type: 'danger',
 date: 'منذ 3 ساعات',
 tab: 'chat'
 });

 return alerts;
 }, [facilities, assignments]);

 const handleLogout = () => {
 localStorage.removeItem('username');
 localStorage.removeItem('userFullName');
 localStorage.removeItem('userRole');
 localStorage.removeItem('userGov');
 window.location.href = '/login.html';
 };

 return (
 <div 
 className={`min-h-screen flex font-cairo transition-colors duration-200 ${
 theme === 'dark' 
 ? 'bg-slate-950 text-slate-100 dark' 
 : 'bg-[var(--theme-canvas)] text-[var(--theme-text-primary)]'
 }`} 
 dir={lang === 'ar' ? 'rtl' : 'ltr'}
 id="executive-platform-root"
 style={{
 backgroundColor: 'var(--theme-canvas)',
 color: 'var(--theme-text-primary)'
 }}
 >
 {/* Mobile Backdrop Overlay */}
 {sidebarOpen && (
 <div 
 id="backdrop"
 onClick={() => setSidebarOpen(false)}
 className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
 aria-label="إغلاق القائمة الجانبية"
 />
 )}

 {/* ============ الشريط الجانبي الفخم (النموذج الأصلي للنقابة) ============ */}
 <aside 
 className={`fixed top-0 bottom-0 z-50 w-72 flex flex-col justify-between transition-colors duration-300 ease-in-out lg:translate-x-0 ${
 lang === 'ar' 
 ? (sidebarOpen ? 'translate-x-0 right-0' : 'translate-x-full right-0 lg:translate-x-0')
 : (sidebarOpen ? 'translate-x-0 left-0' : '-translate-x-full left-0 lg:translate-x-0')
 } shadow-2xl lg:shadow-none overflow-hidden select-none border-l`}
 id="official-sidebar"
 style={{
 backgroundColor: currentSidebarThemePreset.bg,
 borderColor: currentSidebarThemePreset.border,
 color: currentSidebarThemePreset.textColor
 }}
 >
 <div className="flex flex-col h-full overflow-hidden">
 {/* Top Logo & Syndicate Identity Block */}
 <div 
 className="p-4 text-center border-b transition-colors relative"
 style={{
 background: currentSidebarThemePreset.headerBg,
 borderColor: currentSidebarThemePreset.border
 }}
 >
 {/* Close Button on Mobile */}
 <button
 onClick={() => setSidebarOpen(false)}
 className={`lg:hidden absolute top-3 left-3 p-1.5 rounded-lg transition ${
 currentSidebarThemePreset.isLight 
 ? 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:bg-slate-200' 
 : 'text-slate-400 hover:text-white hover:bg-slate-800'
 }`}
 aria-label="Close Sidebar"
 >
 <X className="w-5 h-5" />
 </button>

 {/* Official Syndicate Circular Emblem */}
 <div 
 className="w-16 h-16 mx-auto mb-2.5 rounded-full p-0.5 bg-[var(--theme-card-bg)] flex items-center justify-center overflow-hidden shadow-lg transition-transform hover:scale-105"
 style={{ border: '2.5px solid #f59e0b', boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)' }}
 >
 <img 
 src="/logo.png" 
 alt="شعار نقابة التمريض العراقية" 
 className="w-full h-full object-contain rounded-full"
 />
 </div>

 <div className={`text-[11.5px] font-extrabold tracking-wide mb-0.5 ${currentSidebarThemePreset.isLight ? 'text-amber-600' : 'text-amber-400'}`}>
 جمهورية العراق
 </div>
 <h1 className={`text-[15px] font-black leading-tight m-0 ${currentSidebarThemePreset.isLight ? 'text-[var(--theme-text-primary)]' : 'text-white'}`}>
 نقابة التمريض العراقية
 </h1>
 
 <div className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
 currentSidebarThemePreset.isLight
 ? 'bg-[var(--theme-canvas)] border-[var(--theme-card-border)] text-[var(--theme-text-primary)]'
 : 'bg-slate-800/90 border-slate-700/60 text-amber-300'
 }`}>
 GIS v2.6 نواتي
 </div>
 </div>

 {/* Vertical Navigation Items (scrollable) */}
 <div className="flex-1 overflow-y-auto py-2.5 px-2.5 space-y-1 scrollbar-thin" id="nav">
 {navItems.map((item) => {
 const isActive = activeTab === item.id;
 const isLight = currentSidebarThemePreset.isLight;
 return (
 <button
 key={item.id}
 id={`nav-${item.id}`}
 onClick={() => {
 onTabChange(item.id);
 if (window.innerWidth <= 1024) setSidebarOpen(false);
 }}
 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
 isActive
 ? (isLight 
 ? 'bg-blue-100 text-blue-700 font-black border-r-3 border-blue-600 shadow-xs'
 : `${currentSidebarThemePreset.activeBg} ${currentSidebarThemePreset.activeText} font-black border-r-3 ${currentSidebarThemePreset.activeBorder} shadow-xs`)
 : (isLight
 ? 'text-[var(--theme-text-primary)] hover:text-slate-950 hover:bg-[var(--theme-canvas)] font-semibold'
 : 'text-slate-300 hover:text-white hover:bg-white/5 font-semibold')
 }`}
 >
 <div className="flex items-center gap-2.5">
 <span className={`text-base leading-none ${
 isActive 
 ? (isLight ? 'text-blue-600 scale-110' : 'text-amber-400 scale-110') 
 : (isLight ? 'text-[var(--theme-text-muted)]' : 'text-slate-400')
 }`}>
 {item.icon}
 </span>
 <span className="truncate">{item.label}</span>
 </div>

 {item.badge && (
 <span className={`px-2 py-0.5 rounded-full text-[10px] shadow-xs ${item.badgeColor || 'bg-amber-500 text-slate-950 font-bold'}`}>
 {item.badge}
 </span>
 )}
 </button>
 );
 })}
 </div>

 {/* Sidebar Footer: Active User & Quick Switch/Logout */}
 <div 
 className="p-3 border-t transition-colors"
 style={{
 backgroundColor: currentSidebarThemePreset.footerBg,
 borderColor: currentSidebarThemePreset.border
 }}
 >
 <div 
 className="border rounded-xl p-2.5 flex items-center justify-between gap-1.5 transition-colors"
 style={{
 backgroundColor: currentSidebarThemePreset.userCardBg,
 borderColor: currentSidebarThemePreset.border
 }}
 >
 <div 
 className="flex items-center gap-2 min-w-0 cursor-pointer flex-1"
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 title="انقر لتبديل الحساب أو استعراض الصلاحيات"
 >
 {/* User Avatar */}
 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
 {currentUser.name.charAt(0)}
 </div>
 {/* User Details */}
 <div className="min-w-0 flex-1 text-right">
 <div className={`text-xs font-bold truncate ${currentSidebarThemePreset.isLight ? 'text-[var(--theme-text-primary)]' : 'text-white'}`}>
 {currentUser.name}
 </div>
 <div className={`text-[10px] truncate flex items-center gap-1 ${currentSidebarThemePreset.isLight ? 'text-blue-700 font-semibold' : 'text-amber-400/90'}`}>
 <span>{currentUser.roleTitle || t(`role_${currentUser.role}`)}</span>
 <span className="opacity-40">•</span>
 <span className={currentSidebarThemePreset.isLight ? 'text-[var(--theme-text-muted)]' : 'text-slate-400'}>{currentUser.canAccessAllProvinces ? 'عموم العراق' : (currentUser.provinceName || 'محلي')}</span>
 </div>
 </div>
 </div>

 {/* Sidebar Theme Selector (Design Icon for this sidebar) */}
 <SidebarThemePopover 
 buttonClassName={`p-1.5 rounded-lg transition cursor-pointer ${
 currentSidebarThemePreset.isLight 
 ? 'text-[var(--theme-text-muted)] hover:text-blue-600 hover:bg-slate-200' 
 : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
 }`}
 />

 {/* Roles Matrix Modal Trigger */}
 <button
 type="button"
 onClick={() => setShowRolesModal(true)}
 className={`p-1.5 rounded-lg transition cursor-pointer ${
 currentSidebarThemePreset.isLight 
 ? 'text-[var(--theme-text-muted)] hover:text-blue-600 hover:bg-slate-200' 
 : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
 }`}
 title="مصفوفة الأدوار والصلاحيات"
 id="sidebar-roles-matrix-btn"
 >
 <Shield className="w-3.5 h-3.5" />
 </button>

 {/* Power / Logout Button */}
 <button
 type="button"
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 className={`p-1.5 rounded-lg transition cursor-pointer ${
 currentSidebarThemePreset.isLight 
 ? 'text-[var(--theme-text-muted)] hover:text-red-600 hover:bg-slate-200' 
 : 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
 }`}
 title="تسجيل الخروج / تبديل الحساب"
 id="sidebar-power-btn"
 >
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </div>

 {/* Quick Switch Dropdown if open */}
 {isUserMenuOpen && (
 <div 
 ref={userMenuRef}
 className="mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 text-xs space-y-1 max-h-60 overflow-y-auto"
 id="sidebar-user-switch-menu"
 >
 <div className="px-2 py-1 text-[10px] font-bold text-slate-400 border-b border-slate-800 flex justify-between">
 <span>تبديل الحساب التنفيذي:</span>
 <span className="text-amber-400 font-mono">({INITIAL_USERS.length} حسابات)</span>
 </div>
 {INITIAL_USERS.map((u) => (
 <button
 key={u.id}
 onClick={() => {
 onUserChange(u);
 setIsUserMenuOpen(false);
 triggerToast(`✔ تم التحويل إلى حساب "${u.name}" بنجاح`, 'success');
 }}
 className={`w-full text-right p-2 rounded-lg flex flex-col transition cursor-pointer ${
 currentUser.id === u.id
 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
 : 'hover:bg-slate-800 text-slate-300'
 }`}
 >
 <div className="flex items-center justify-between text-[11px]">
 <span className="font-bold">{u.name}</span>
 <span className="text-[9px] font-mono text-slate-400">{u.badgeNumber}</span>
 </div>
 <div className="flex items-center justify-between mt-0.5 text-[9px]">
 <span className="text-amber-400">{u.roleTitle}</span>
 <span className="text-slate-400">{u.canAccessAllProvinces ? '🌐 عموم العراق' : `📍 ${u.provinceName}`}</span>
 </div>
 </button>
 ))}
 <div className="pt-1.5 border-t border-slate-800">
 <button
 onClick={handleLogout}
 className="w-full py-1.5 px-2 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-500/30 text-red-300 font-bold text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
 >
 <LogOut className="w-3 h-3" />
 <span>تسجيل الخروج الرسمي (شاشة الدخول)</span>
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </aside>

 {/* ============ العمود الرئيسي والمحتوى ============ */}
 <div className={`flex-1 flex flex-col min-w-0 ${lang === 'ar' ? 'lg:mr-72' : 'lg:ml-72'} transition-all`}>
 {/* ============ الشريط العلوي الفخم (Topbar الأصلي) ============ */}
 <header 
 className="sticky top-0 z-30 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none transition-colors border-b"
 id="official-topbar"
 style={{
 backgroundColor: 'var(--theme-header-bg)',
 borderColor: 'var(--theme-header-border)'
 }}
 >
 {/* Left / Start Section: Hamburger & Breadcrumb */}
 <div className="flex items-center gap-3 min-w-0">
 {/* Sidebar Toggle for Mobile / Small Screens */}
 <button
 id="sideToggle"
 type="button"
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center justify-center shadow-xs"
 title="القائمة الجانبية"
 >
 <Menu className="w-5 h-5" />
 </button>

 {/* Breadcrumb matching old design: المنصة الوطنية / الواجهة الرئيسية */}
 <div className="crumb text-xs sm:text-sm text-slate-400 truncate flex items-center gap-1.5">
 <span className="hidden sm:inline font-medium text-[var(--theme-text-muted)]">المنصة الوطنية</span>
 <span className="hidden sm:inline text-[var(--theme-text-muted)]">/</span>
 <b id="crumbTitle" className="text-white font-bold tracking-tight">
 {crumbTitle}
 </b>
 </div>
 </div>

 {/* Center: Global Search Input with Instant Dropdown */}
 <div className="flex-1 max-w-md mx-2 relative" ref={searchContainerRef}>
 <div className="relative">
 <input
 type="text"
 value={globalSearch}
 onChange={(e) => {
 setGlobalSearch(e.target.value);
 setShowSearchResults(true);
 }}
 onFocus={() => setShowSearchResults(true)}
 placeholder={lang === 'ar' ? 'بحث شامل بالمنصة: منشأة، مفتش، رقم إجازة...' : 'Search facilities, inspectors, licenses...'}
 className="w-full bg-slate-950/80 dark:bg-slate-950 text-slate-200 placeholder-slate-500 text-xs rounded-xl pr-9 pl-4 py-2 border border-slate-700/80 focus:border-amber-400 focus:outline-hidden transition shadow-inner"
 />
 <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
 {globalSearch && (
 <button
 type="button"
 onClick={() => {
 setGlobalSearch('');
 setShowSearchResults(false);
 }}
 className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 {/* Interactive Search Results Dropdown */}
 {showSearchResults && globalSearch.trim().length >= 2 && (
 <div className="absolute top-full right-0 left-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5 z-50 text-xs space-y-2 max-h-80 overflow-y-auto">
 {!hasSearchResults ? (
 <div className="text-center py-4 text-slate-400 text-xs">
 لم يتم العثور على نتائج مطابقة لـ "{globalSearch}"
 </div>
 ) : (
 <>
 {/* Facilities results */}
 {searchResults.facilities.length > 0 && (
 <div>
 <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
 <Building2 className="w-3 h-3" />
 <span>المنشآت والعيادات ({searchResults.facilities.length})</span>
 </div>
 <div className="space-y-1">
 {searchResults.facilities.map((fac) => (
 <button
 key={fac.id}
 type="button"
 onClick={() => {
 onTabChange('facilities');
 setShowSearchResults(false);
 triggerToast(`تم الانتقال إلى سجل "${fac.name}"`, 'info');
 }}
 className="w-full text-right p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition cursor-pointer"
 >
 <div>
 <div className="font-bold text-xs">{fac.name}</div>
 <div className="text-[10px] text-slate-400">{fac.licenseNumber} • {fac.districtArea}</div>
 </div>
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
 {fac.facilityType}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Nurses results */}
 {searchResults.nurses.length > 0 && (
 <div className="border-t border-slate-800 pt-1.5">
 <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
 <UserCheck className="w-3 h-3" />
 <span>الكوادر التمريضية ({searchResults.nurses.length})</span>
 </div>
 <div className="space-y-1">
 {searchResults.nurses.map((nurse) => (
 <button
 key={nurse.id}
 type="button"
 onClick={() => {
 onTabChange('nurses');
 setShowSearchResults(false);
 triggerToast(`تم الانتقال إلى إضبارة "${nurse.fullName}"`, 'info');
 }}
 className="w-full text-right p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition cursor-pointer"
 >
 <div>
 <div className="font-bold text-xs">{nurse.fullName}</div>
 <div className="text-[10px] text-slate-400">{nurse.syndicateBadgeNumber} • {nurse.workplace}</div>
 </div>
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
 {nurse.licenseStatus === 'ACTIVE' ? 'محرّك رسمي' : 'معلق'}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Inspectors results */}
 {searchResults.users.length > 0 && (
 <div className="border-t border-slate-800 pt-1.5">
 <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 px-1 flex items-center gap-1">
 <Shield className="w-3 h-3" />
 <span>المفتشون واللجان ({searchResults.users.length})</span>
 </div>
 <div className="space-y-1">
 {searchResults.users.map((u) => (
 <button
 key={u.id}
 type="button"
 onClick={() => {
 onTabChange('users_management');
 setShowSearchResults(false);
 triggerToast(`تم الانتقال إلى مستخدم "${u.name}"`, 'info');
 }}
 className="w-full text-right p-2 rounded-lg hover:bg-slate-800 text-slate-200 flex items-center justify-between transition cursor-pointer"
 >
 <div>
 <div className="font-bold text-xs">{u.name}</div>
 <div className="text-[10px] text-slate-400">{u.roleTitle} • {u.provinceName}</div>
 </div>
 <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
 {u.badgeNumber}
 </span>
 </button>
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 )}
 </div>

 {/* Right / End Section: Notifications, Language, Theme, Date Chip */}
 <div className="flex items-center gap-2 shrink-0">
  {/* Separate Field Inspector Mobile Link Button */}
  <a
    href="/mobile"
    target="_blank"
    rel="noopener noreferrer"
    title="فتح تطبيق المفتش الميداني في رابط مستقل مخصص"
    className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md border border-emerald-400/40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
    id="btn-open-standalone-mobile"
  >
    <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
    <span className="hidden md:inline">تطبيق المفتش (رابط مستقل)</span>
    <span className="md:hidden">المفتش 📱</span>
    <ExternalLink className="w-3 h-3 text-emerald-200" />
  </a>

  {/* Live Data Refresh Button */}
 <button
 type="button"
 onClick={() => {
 if (onRefreshData) onRefreshData();
 triggerToast('⟳ تمت مزامنة وتحديث كافة البيانات مع الخادم المركزي بنجاح', 'success');
 }}
 className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700 transition cursor-pointer flex items-center justify-center shadow-xs"
 title="تحديث البيانات المباشرة"
 id="topbar-refresh-btn"
 >
 <RefreshCw className="w-4 h-4" />
 </button>

 {/* Notifications Bell */}
 <div className="relative" ref={notificationsRef}>
 <button
 type="button"
 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
 className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition cursor-pointer flex items-center justify-center shadow-xs"
 title="التنبيهات والإشعارات الرقابية"
 id="topbar-notifications-btn"
 >
 <Bell className="w-4 h-4" />
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
 </button>

 {/* Notifications Dropdown Menu */}
 {isNotificationsOpen && (
 <div className="absolute top-full left-0 dir-rtl:right-auto dir-rtl:left-0 mt-2 w-80 sm:w-88 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs">
 <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-bold">
 <span className="text-white flex items-center gap-1.5">
 <Bell className="w-3.5 h-3.5 text-amber-400" />
 <span>التنبيهات والإنذارات الرقابية</span>
 </span>
 <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono">
 {notificationsList.length} تنبيهات
 </span>
 </div>

 <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
 {notificationsList.map((n) => (
 <div 
 key={n.id}
 onClick={() => {
 onTabChange(n.tab);
 setIsNotificationsOpen(false);
 }}
 className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition flex flex-col gap-1"
 >
 <div className="flex items-center justify-between font-bold text-slate-200">
 <span className="truncate">{n.title}</span>
 <span className="text-[9px] text-slate-400 shrink-0">{n.date}</span>
 </div>
 <div className="text-[11px] text-slate-400 leading-snug">
 {n.desc}
 </div>
 </div>
 ))}
 </div>

 <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
 <button 
 onClick={() => {
 onTabChange('violations');
 setIsNotificationsOpen(false);
 }}
 className="text-amber-400 hover:underline font-bold"
 >
 عرض كافة المخالفات والإنذارات ←
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Language Switch Button (EN / AR) */}
 <button
 id="langToggle"
 type="button"
 onClick={() => {
 toggleLanguage();
 triggerToast(lang === 'ar' ? 'Switched to English' : 'تم التحويل إلى اللغة العربية', 'info');
 }}
 className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
 title={lang === 'ar' ? 'التحويل للغة الإنجليزية' : 'Switch to Arabic'}
 >
 <Globe className="w-3.5 h-3.5 text-amber-400" />
 <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
 </button>

 {/* 7 Calm Medical Themes Selector Popover */}
 <ThemeSelectorPopover
 onThemeChanged={(preset) => {
 triggerToast(`تم تفعيل تصميم: ${preset.nameAr}`, 'info');
 }}
 />

 {/* Date Chip matching old design */}
 <div className="date-chip hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium shadow-xs">
 <span className="text-amber-400">📅</span>
 <span id="currentDate">{currentDateStr}</span>
 </div>
 </div>
 </header>

 {/* ============ المحتوى الرئيسي التنفيذي ============ */}
 <main className="flex-1 w-full p-4 sm:p-6 space-y-6" id="main-content-viewport">
 {/* Floating Toast Notification Box */}
 {globalToast && (
 <div 
 className={`fixed bottom-6 left-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold transition-all duration-300 ${
 globalToast.type === 'success'
 ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
 : globalToast.type === 'warn'
 ? 'bg-amber-950 border-amber-500 text-amber-200'
 : 'bg-blue-950 border-blue-500 text-blue-200'
 }`}
 id="global-executive-toast"
 >
 <CheckCircle2 className="w-4 h-4 text-emerald-400" />
 <span>{globalToast.msg}</span>
 </div>
 )}

 {/* Children View (The active tab component) */}
 {children}
 </main>
 </div>

 {/* Roles & Permissions Modal (Available globally) */}
 <RolesPermissionsModal 
 isOpen={showRolesModal} 
 onClose={() => setShowRolesModal(false)} 
 />
 </div>
 );
};
