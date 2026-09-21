import React, { useState } from 'react';
import { User } from '../types';
import { Shield, MapPin, ClipboardList, Database, Users, AlertTriangle, UserCheck, Layers, UserCog, Sun, Moon, Globe, LogOut, User as UserIcon, LayoutDashboard, Wallet, Radio, Smartphone, ExternalLink, Network, FileJson } from 'lucide-react';
import { SyndicateLogo } from './SyndicateLogo';
import { ThemeSelectorPopover } from './ThemeSelectorPopover';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { INITIAL_USERS } from '../data/initialData';

interface NavbarProps {
 currentUser: User;
 onUserChange: (user: User) => void;
 activeTab: string;
 onTabChange: (tab: string) => void;
 pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
 currentUser,
 onUserChange,
 activeTab,
 onTabChange,
 pendingCount
}) => {
 const { lang, theme, toggleLanguage, toggleTheme, t } = useLanguageTheme();
 const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

 return (
 <header className="bg-[var(--theme-header-bg)] text-white border-b border-slate-800 shadow-lg sticky top-0 z-50 transition-colors duration-200" id="main-header">
 {/* Header Top Row: Logo & Title on Start | Controls on End */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3" id="header-container">
 {/* Logo & Title: جمهورية العراق - نقابة التمريض العراقية - شعار النقابة */}
 <div 
 className="flex items-center gap-3 cursor-pointer select-none group" 
 onClick={() => onTabChange('gis_map')} 
 id="logo-section"
 title="جمهورية العراق - نقابة التمريض العراقية"
 >
 {/* شعار النقابة الرسمي */}
 <div className="relative shrink-0">
 <img
 src="/logo.png"
 alt="شعار نقابة التمريض العراقية"
 className="w-12 h-12 rounded-full bg-[var(--theme-card-bg)] object-contain p-0.5 border-2 border-amber-400 shadow-md group-hover:scale-105 transition-transform"
 referrerPolicy="no-referrer"
 />
 <span className="absolute -bottom-1 -left-1 bg-emerald-600 text-[8px] font-black text-white px-1.5 py-0.2 rounded-full border border-slate-900 shadow-xs">
 العراق
 </span>
 </div>

 <div className="flex flex-col leading-tight">
 <div className="flex items-center gap-1.5">
 <span className="text-[11px] font-extrabold text-amber-400 tracking-wider">
 {lang === 'ar' ? 'جمهورية العراق' : 'Republic of Iraq'}
 </span>
 <span className="text-[9px] text-slate-400 font-mono hidden md:inline-block">
 {lang === 'ar' ? '• المقر العام' : '• HQ'}
 </span>
 </div>

 <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2" id="app-title">
 <span>{lang === 'ar' ? 'نقابة التمريض العراقية' : 'Iraqi Nursing Syndicate'}</span>
 <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30 hidden sm:inline-block" id="version-tag">
 {t('versionTag')}
 </span>
 </h1>

 <p className="text-[10.5px] text-slate-300 font-medium flex items-center gap-1.5" id="sub-title">
 <span className="text-amber-400/90 font-bold">{lang === 'ar' ? 'شعار النقابة الرسمي' : 'Official Syndicate Emblem'}</span>
 <span className="text-[var(--theme-text-muted)]">•</span>
 <span>{lang === 'ar' ? 'المنصة الوطنية للرقابة والتفتيش الصحي' : 'National Health Inspection Platform'}</span>
 </p>
 </div>
 </div>

 {/* Action Controls: Globe Language (EN/AR), Theme Icon, Active User Name, Logout Icon */}
 <div className="flex items-center gap-2 shrink-0" id="header-controls">
 {/* Language Switcher: Globe Icon + EN or AR text */}
 <button
 type="button"
 id="btn-language-switcher"
 onClick={toggleLanguage}
 className="bg-slate-800/90 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-1.5 transition text-xs cursor-pointer shadow-xs"
 title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
 >
 <Globe className="w-4 h-4 text-amber-400 shrink-0" />
 <span className="font-mono font-extrabold text-xs uppercase">{lang === 'ar' ? 'EN' : 'AR'}</span>
 </button>

 {/* 7 Calm Medical Themes Selector Popover */}
 <ThemeSelectorPopover compact />

 {/* Current User Name Only */}
 <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-slate-100 font-bold text-xs shadow-xs">
 <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
 <span className="truncate max-w-[150px] sm:max-w-[220px]">{currentUser.name}</span>
 </div>

 {/* Logout Icon Only Button */}
 <div className="relative">
 <button
 type="button"
 id="btn-logout-icon"
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 className="bg-slate-800/90 hover:bg-red-500/20 hover:text-red-400 text-slate-300 p-2 rounded-xl border border-slate-700/80 transition cursor-pointer flex items-center justify-center shadow-xs"
 title={lang === 'ar' ? 'تسجيل الخروج / تبديل الحساب' : 'Logout / Switch User'}
 >
 <LogOut className="w-4 h-4" />
 </button>

 {/* Switch User Dropdown */}
 {isUserMenuOpen && (
 <div 
 className="absolute left-0 dir-rtl:right-0 dir-rtl:left-auto mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs"
 id="user-logout-dropdown"
 >
 <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px] font-bold">
 <span>{lang === 'ar' ? 'تبديل الحساب الحالي واختبار الصلاحيات' : 'Switch Active Account & Permissions'}</span>
 <span className="text-[10px] text-amber-400">({INITIAL_USERS.length} مستخدمين)</span>
 </div>
 <div className="py-1 space-y-1 max-h-80 overflow-y-auto">
 {INITIAL_USERS.map((u) => (
 <button
 key={u.id}
 onClick={() => {
 onUserChange(u);
 setIsUserMenuOpen(false);
 }}
 className={`w-full text-right p-2.5 rounded-xl flex flex-col transition cursor-pointer ${
 currentUser.id === u.id
 ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
 : 'hover:bg-slate-800 text-slate-200'
 }`}
 >
 <div className="flex items-center justify-between">
 <span className="font-bold text-xs">{u.name}</span>
 <span className="text-[9px] font-mono text-slate-400">{u.badgeNumber}</span>
 </div>
 <div className="flex items-center justify-between mt-1 text-[10px]">
 <span className="text-amber-400 font-bold">{u.roleTitle || t(`role_${u.role}`)}</span>
 <span className={`px-1.5 py-0.2 rounded font-mono ${
 u.canAccessAllProvinces 
 ? 'bg-amber-500/30 text-amber-300' 
 : 'bg-blue-500/30 text-blue-300'
 }`}>
 {u.canAccessAllProvinces ? '🌐 عموم العراق' : `📍 ${u.provinceName || 'محلي'}`}
 </span>
 </div>
 </button>
 ))}
 </div>
 <div className="pt-2 mt-1 border-t border-slate-800">
 <button
 type="button"
 onClick={() => {
 localStorage.removeItem('username');
 localStorage.removeItem('userFullName');
 localStorage.removeItem('userRole');
 localStorage.removeItem('userGov');
 window.location.href = '/login.html';
 }}
 className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs"
 >
 <LogOut className="w-3.5 h-3.5 text-red-400" />
 <span>{lang === 'ar' ? 'تسجيل الخروج الرسمي (العودة لصفحة الدخول)' : 'Official Logout (Return to Login)'}</span>
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Navigation Bar */}
 <div className="border-t border-slate-800/80 bg-slate-900/95 dark:bg-slate-950/95 px-3 sm:px-6 py-2">
 <div className="max-w-7xl mx-auto">
 <nav className="flex flex-wrap items-center justify-start lg:justify-between gap-1 sm:gap-1.5 text-[11px] lg:text-xs font-semibold overflow-x-auto scrollbar-none pb-0.5" id="main-navigation">
 <button
 id="nav-tab-schema"
 onClick={() => onTabChange('sql_schema')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'sql_schema'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <LayoutDashboard className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-schema" />
 <span>{t('tab_sql_schema')}</span>
 </button>

 <button
 id="nav-tab-gis"
 onClick={() => onTabChange('gis_map')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'gis_map'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <MapPin className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-gis" />
 <span>{t('tab_gis_map')}</span>
 </button>

 <button
 id="nav-tab-branch-network"
 onClick={() => onTabChange('branch_network')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'branch_network'
 ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
 : 'text-cyan-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <Network className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-cyan-400 shrink-0" id="icon-branch-network" />
 <span>{t('tab_branch_network')}</span>
 </button>

 <button
 id="nav-tab-form-engine"
 onClick={() => onTabChange('form_engine')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'form_engine'
 ? 'bg-violet-500 text-white font-black shadow-md'
 : 'text-violet-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <FileJson className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-violet-400 shrink-0" />
 <span>{t('tab_form_engine')}</span>
 </button>

 <button
 id="nav-tab-zones"
 onClick={() => onTabChange('zone_manager')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'zone_manager'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <Shield className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-zones" />
 <span>{t('tab_zone_manager')}</span>
 </button>

 <button
 id="nav-tab-users"
 onClick={() => onTabChange('users_management')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'users_management'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <UserCog className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-users-mgt" />
 <span>{t('tab_users_management')}</span>
 </button>

 <button
 id="nav-tab-facilities"
 onClick={() => onTabChange('facilities')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'facilities'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <Layers className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-facilities" />
 <span>{t('tab_facilities')}</span>
 </button>

 <button
 id="nav-tab-assignments"
 onClick={() => onTabChange('assignments')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all relative cursor-pointer shrink-0 ${
 activeTab === 'assignments'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <ClipboardList className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-assignments" />
 <span>{t('tab_assignments')}</span>
 {pendingCount > 0 && (
 <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full" id="pending-badge">
 {pendingCount}
 </span>
 )}
 </button>

 <button
 id="nav-tab-inspector"
 onClick={() => onTabChange('field_inspector')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'field_inspector'
 ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
 : 'text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30'
 }`}
 >
 <UserCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-400 shrink-0" id="icon-field" />
 <span>{t('tab_field_inspector')}</span>
 </button>

 <a
   id="nav-link-mobile-app"
   href="/mobile"
   target="_blank"
   rel="noopener noreferrer"
   title="فتح تطبيق المفتش الميداني في رابط مستقل مخصص"
   className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md border border-emerald-400/40 transition-all cursor-pointer shrink-0"
 >
   <Smartphone className="w-3.5 h-3.5 text-white shrink-0" />
   <span className="hidden sm:inline">تطبيق المفتش (رابط مستقل)</span>
   <span className="sm:hidden">المفتش 📱</span>
   <ExternalLink className="w-3 h-3 text-emerald-200 shrink-0" />
 </a>

 <button
 id="nav-tab-nurses"
 onClick={() => onTabChange('nurses')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'nurses'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <Users className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-nurses" />
 <span>{t('tab_nurses')}</span>
 </button>

 <button
 id="nav-tab-violations"
 onClick={() => onTabChange('violations')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'violations'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-slate-300 hover:bg-slate-800 hover:text-white'
 }`}
 >
 <AlertTriangle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-violations" />
 <span>{t('tab_violations')}</span>
 </button>

 <button
 id="nav-tab-finance"
 onClick={() => onTabChange('finance')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'finance'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30'
 }`}
 >
 <Wallet className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" id="icon-finance" />
 <span>{t('tab_finance')}</span>
 <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
 جديد
 </span>
 </button>

 <button
 id="nav-tab-operations-chat"
 onClick={() => onTabChange('operations_chat')}
 className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
 activeTab === 'operations_chat'
 ? 'bg-amber-500 text-slate-950 font-black shadow-md'
 : 'text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30'
 }`}
 >
 <Radio className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-cyan-400 shrink-0" id="icon-operations-chat" />
 <span>{t('tab_operations_chat')}</span>
 <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
 مباشر
 </span>
 </button>
 </nav>
 </div>
 </div>
 </header>
 );
};

