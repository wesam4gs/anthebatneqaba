import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export type MedicalThemeId = 
  | 'medical-sky'       // السمائي السريري الهادئ (Clinical Sky & Mist)
  | 'clinical-blue'      // الأزرق الطبي الوقائي (Gentle Medical Sapphire)
  | 'pure-white'         // الأبيض الطبي المعقم (Sterilized Clinic White)
  | 'soft-mint'          // الزمردي الصحي المريح (Healing Mint & Sage)
  | 'warm-amber'         // العاجي والعنبري الطبي (Warm Ivory & Clinical Amber)
  | 'slate-pearl'        // الرمادي واللؤلؤي الباستيل (Muted Slate & Pearl)
  | 'executive-night';   // النمط الليلي الرقابي الهادئ (Muted Syndicate Night - التصميم الأصلي)

export interface MedicalThemePreset {
  id: MedicalThemeId;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  badgeAr: string;
  badgeEn: string;
  icon: string;
  isDark: boolean;
  colors: {
    canvas: string;
    card: string;
    sidebar: string;
    sidebarBorder: string;
    primary: string;
    accent: string;
    border: string;
    text: string;
    muted: string;
    onPrimary: string;
    onAccent: string;
  };
}

export function applyMedicalThemeCssVars(target: HTMLElement, preset: MedicalThemePreset) {
  const style = target.style;
  const { colors, id } = preset;
  const panelInk: Record<MedicalThemeId, { link: string; accent: string }> = {
    'medical-sky': { link: '#bfdbfe', accent: '#fde68a' },
    'clinical-blue': { link: '#c7d2fe', accent: '#fde68a' },
    'pure-white': { link: '#99f6e4', accent: '#fdba74' },
    'soft-mint': { link: '#bbf7d0', accent: '#fde68a' },
    'warm-amber': { link: '#fed7aa', accent: '#93c5fd' },
    'slate-pearl': { link: '#e2e8f0', accent: '#fde68a' },
    'executive-night': { link: '#fde68a', accent: '#67e8f9' }
  };
  const ink = panelInk[id];
  style.setProperty('--theme-canvas', colors.canvas);
  style.setProperty('--theme-card-bg', colors.card);
  style.setProperty('--theme-sidebar-bg', colors.sidebar);
  style.setProperty('--theme-sidebar-border', colors.sidebarBorder);
  style.setProperty('--theme-primary', colors.primary);
  style.setProperty('--theme-accent', colors.accent);
  style.setProperty('--theme-card-border', colors.border);
  style.setProperty('--theme-header-bg', colors.card);
  style.setProperty('--theme-header-border', colors.border);
  style.setProperty('--theme-text-primary', colors.text);
  style.setProperty('--theme-text-muted', colors.muted);
  style.setProperty('--theme-on-primary', colors.onPrimary);
  style.setProperty('--theme-on-accent', colors.onAccent);
  style.setProperty('--theme-primary-soft', `color-mix(in srgb, ${colors.primary} 28%, ${colors.card})`);
  style.setProperty('--theme-accent-soft', `color-mix(in srgb, ${colors.accent} 24%, ${colors.card})`);
  style.setProperty('--theme-panel-bg', `color-mix(in srgb, ${colors.sidebar} 78%, ${colors.primary})`);
  style.setProperty('--theme-panel-text', '#f8fafc');
  style.setProperty('--theme-panel-muted', '#e2e8f0');
  style.setProperty('--theme-panel-link', ink.link);
  style.setProperty('--theme-panel-accent', ink.accent);
  style.setProperty('--theme-panel-border', `color-mix(in srgb, ${ink.accent} 42%, ${colors.sidebar})`);
}

export const MEDICAL_THEMES: MedicalThemePreset[] = [
  {
    id: 'medical-sky',
    nameAr: 'سمائي',
    nameEn: 'Sky',
    descAr: 'الهوية الرسمية: كحلي دجلة وذهب سومري.',
    descEn: 'Official identity: Tigris navy and Sumerian gold.',
    badgeAr: 'رسمي',
    badgeEn: 'Official',
    icon: '🩺',
    isDark: false,
    colors: {
      canvas: '#6b93c4',
      card: '#dceaf8',
      sidebar: '#061e3d',
      sidebarBorder: '#0a3a6e',
      primary: '#0a4f96',
      accent: '#c9a227',
      border: '#4d78ab',
      text: '#061427',
      muted: '#3d5873',
      onPrimary: '#ffffff',
      onAccent: '#1a1206'
    }
  },
  {
    id: 'clinical-blue',
    nameAr: 'أزرق',
    nameEn: 'Blue',
    descAr: 'ياقوت أزرق وقائي لهيبة الرقابة الصحية.',
    descEn: 'Deep sapphire for inspection authority.',
    badgeAr: 'أزرق',
    badgeEn: 'Blue',
    icon: '🏥',
    isDark: false,
    colors: {
      canvas: '#4a6fd0',
      card: '#d4defa',
      sidebar: '#04122b',
      sidebarBorder: '#1e3a8a',
      primary: '#1d4ed8',
      accent: '#d4a017',
      border: '#3d5fc4',
      text: '#07122a',
      muted: '#334e7a',
      onPrimary: '#ffffff',
      onAccent: '#1a1206'
    }
  },
  {
    id: 'pure-white',
    nameAr: 'أبيض',
    nameEn: 'White',
    descAr: 'أبيض نقابي صارم مع فيروز وذهب.',
    descEn: 'Strict syndicate white with teal and gold.',
    badgeAr: 'أبيض',
    badgeEn: 'White',
    icon: '🥼',
    isDark: false,
    colors: {
      canvas: '#d1d5db',
      card: '#ffffff',
      sidebar: '#111827',
      sidebarBorder: '#1f2937',
      primary: '#0f766e',
      accent: '#b45309',
      border: '#9ca3af',
      text: '#111827',
      muted: '#4b5563',
      onPrimary: '#ffffff',
      onAccent: '#ffffff'
    }
  },
  {
    id: 'soft-mint',
    nameAr: 'زمردي',
    nameEn: 'Mint',
    descAr: 'أخضر العراق العميق: نخيل وذهب.',
    descEn: 'Deep Iraqi palm green and gold.',
    badgeAr: 'زمردي',
    badgeEn: 'Mint',
    icon: '🌿',
    isDark: false,
    colors: {
      canvas: '#5fa87a',
      card: '#d8f3e5',
      sidebar: '#052e16',
      sidebarBorder: '#14532d',
      primary: '#15803d',
      accent: '#c9a227',
      border: '#2f8a52',
      text: '#052e16',
      muted: '#3f6b4c',
      onPrimary: '#ffffff',
      onAccent: '#1a1206'
    }
  },
  {
    id: 'warm-amber',
    nameAr: 'عنبري',
    nameEn: 'Amber',
    descAr: 'ذهب بابلي وكحلي ملكي.',
    descEn: 'Babylonian gold and royal navy.',
    badgeAr: 'عنبري',
    badgeEn: 'Amber',
    icon: '⚜️',
    isDark: false,
    colors: {
      canvas: '#c9922a',
      card: '#ffe8b0',
      sidebar: '#1a1206',
      sidebarBorder: '#5c430d',
      primary: '#b45309',
      accent: '#0a4f96',
      border: '#a67c1a',
      text: '#1c1308',
      muted: '#6b5428',
      onPrimary: '#ffffff',
      onAccent: '#ffffff'
    }
  },
  {
    id: 'slate-pearl',
    nameAr: 'رمادي',
    nameEn: 'Slate',
    descAr: 'فحم رئاسي ولؤلؤ مع لمسة ذهب.',
    descEn: 'Presidential charcoal with gold.',
    badgeAr: 'رمادي',
    badgeEn: 'Slate',
    icon: '🕊️',
    isDark: false,
    colors: {
      canvas: '#6b7688',
      card: '#d8dde6',
      sidebar: '#0b1220',
      sidebarBorder: '#334155',
      primary: '#1e293b',
      accent: '#c9a227',
      border: '#4b5568',
      text: '#0f172a',
      muted: '#475569',
      onPrimary: '#ffffff',
      onAccent: '#1a1206'
    }
  },
  {
    id: 'executive-night',
    nameAr: 'ليلي',
    nameEn: 'Night',
    descAr: 'غرفة عمليات ليلية: أسود وذهب عراقي.',
    descEn: 'Night operations: black and Iraqi gold.',
    badgeAr: 'ليلي',
    badgeEn: 'Night',
    icon: '🌙',
    isDark: true,
    colors: {
      canvas: '#020617',
      card: '#0a1224',
      sidebar: '#020617',
      sidebarBorder: '#c9a227',
      primary: '#e8b923',
      accent: '#22d3ee',
      border: '#1e3a5f',
      text: '#f8fafc',
      muted: '#94a3b8',
      onPrimary: '#1a1206',
      onAccent: '#020617'
    }
  }
];

export type SidebarThemeId = 
  | 'navy'       // كحلي
  | 'charcoal'   // فحمي
  | 'blue'       // أزرق
  | 'emerald'    // زمردي
  | 'white'      // أبيض
  | 'amber'      // عنبري
  | 'slate';     // رمادي

export interface SidebarThemePreset {
  id: SidebarThemeId;
  nameAr: string;
  nameEn: string;
  icon: string;
  bg: string;
  headerBg: string;
  border: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  textColor: string;
  mutedText: string;
  footerBg: string;
  userCardBg: string;
  accent: string;
  isLight?: boolean;
}

export const SIDEBAR_THEMES: SidebarThemePreset[] = [
  {
    id: 'navy',
    nameAr: 'كحلي',
    nameEn: 'Navy',
    icon: '🔷',
    bg: '#091122',
    headerBg: 'radial-gradient(ellipse at top, #132238 0%, #091122 100%)',
    border: '#1e293b',
    activeBg: 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent',
    activeText: 'text-amber-300',
    activeBorder: 'border-amber-400',
    textColor: '#ffffff',
    mutedText: '#94a3b8',
    footerBg: '#060c18',
    userCardBg: 'rgba(15, 23, 42, 0.9)',
    accent: '#f59e0b'
  },
  {
    id: 'charcoal',
    nameAr: 'فحمي',
    nameEn: 'Charcoal',
    icon: '⬛',
    bg: '#11161f',
    headerBg: 'radial-gradient(ellipse at top, #1e2636 0%, #11161f 100%)',
    border: '#253043',
    activeBg: 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent',
    activeText: 'text-sky-300',
    activeBorder: 'border-sky-400',
    textColor: '#ffffff',
    mutedText: '#8ca0b8',
    footerBg: '#0b0f16',
    userCardBg: 'rgba(21, 28, 40, 0.9)',
    accent: '#38bdf8'
  },
  {
    id: 'blue',
    nameAr: 'أزرق',
    nameEn: 'Blue',
    icon: '🏥',
    bg: '#0c2340',
    headerBg: 'radial-gradient(ellipse at top, #13396d 0%, #0c2340 100%)',
    border: '#194477',
    activeBg: 'bg-gradient-to-r from-blue-400/25 via-blue-500/15 to-transparent',
    activeText: 'text-sky-200',
    activeBorder: 'border-sky-300',
    textColor: '#ffffff',
    mutedText: '#9fc0e8',
    footerBg: '#07172b',
    userCardBg: 'rgba(16, 43, 79, 0.9)',
    accent: '#60a5fa'
  },
  {
    id: 'emerald',
    nameAr: 'زمردي',
    nameEn: 'Emerald',
    icon: '🌿',
    bg: '#07241b',
    headerBg: 'radial-gradient(ellipse at top, #104233 0%, #07241b 100%)',
    border: '#114a3a',
    activeBg: 'bg-gradient-to-r from-emerald-500/25 via-emerald-500/15 to-transparent',
    activeText: 'text-emerald-300',
    activeBorder: 'border-emerald-400',
    textColor: '#ffffff',
    mutedText: '#8cd5bc',
    footerBg: '#041711',
    userCardBg: 'rgba(10, 43, 33, 0.9)',
    accent: '#34d399'
  },
  {
    id: 'white',
    nameAr: 'أبيض',
    nameEn: 'White',
    icon: '🥼',
    bg: '#ffffff',
    headerBg: 'radial-gradient(ellipse at top, #f0f7ff 0%, #f8fafc 100%)',
    border: '#cbd5e1',
    activeBg: 'bg-gradient-to-r from-blue-100 via-blue-50 to-transparent',
    activeText: 'text-blue-700 font-bold',
    activeBorder: 'border-blue-600',
    textColor: '#0f172a',
    mutedText: '#475569',
    footerBg: '#f1f5f9',
    userCardBg: '#ffffff',
    accent: '#0284c7',
    isLight: true
  },
  {
    id: 'amber',
    nameAr: 'عنبري',
    nameEn: 'Amber',
    icon: '⚜️',
    bg: '#1f1610',
    headerBg: 'radial-gradient(ellipse at top, #362619 0%, #1f1610 100%)',
    border: '#422f20',
    activeBg: 'bg-gradient-to-r from-amber-600/25 via-amber-600/15 to-transparent',
    activeText: 'text-amber-200',
    activeBorder: 'border-amber-400',
    textColor: '#ffffff',
    mutedText: '#d8bba0',
    footerBg: '#140e0a',
    userCardBg: 'rgba(42, 31, 22, 0.9)',
    accent: '#f59e0b'
  },
  {
    id: 'slate',
    nameAr: 'رمادي',
    nameEn: 'Slate',
    icon: '🕊️',
    bg: '#1e293b',
    headerBg: 'radial-gradient(ellipse at top, #334155 0%, #1e293b 100%)',
    border: '#334155',
    activeBg: 'bg-gradient-to-r from-slate-600/30 via-slate-600/15 to-transparent',
    activeText: 'text-slate-100',
    activeBorder: 'border-slate-300',
    textColor: '#ffffff',
    mutedText: '#cbd5e1',
    footerBg: '#0f172a',
    userCardBg: 'rgba(30, 41, 59, 0.9)',
    accent: '#94a3b8'
  }
];

type TranslationsMap = {
  [key: string]: {
    ar: string;
    en: string;
  };
};

export const translations: TranslationsMap = {
  // Brand & Header
  republicTag: {
    ar: 'جمهورية العراق - نقابة التمريض العراقية | المنصة الوطنية للرقابة والتفتيش الصحي',
    en: 'Republic of Iraq - Iraqi Nursing Syndicate | National Health Inspection Platform'
  },
  appTitle: {
    ar: 'نقابة التمريض العراقية',
    en: 'Iraqi Nursing Syndicate'
  },
  subTitle: {
    ar: 'نظام الرقابة والتفتيش المركزي - نسخة القيادة العليا',
    en: 'Central Inspection & Control System - Command Edition'
  },
  versionTag: {
    ar: 'GIS v2.6 نواتي',
    en: 'GIS v2.6 Core'
  },

  // Navbar Tabs
  tab_sql_schema: {
    ar: 'الواجهة الرئيسية',
    en: 'Main Dashboard'
  },
  tab_gis_map: {
    ar: 'خريطة GIS التفاعلية',
    en: 'GIS Interactive Map'
  },
  tab_branch_network: {
    ar: 'شبكة الفروع',
    en: 'Branch Network'
  },
  tab_form_engine: {
    ar: 'محرك استمارات الكشف',
    en: 'Dynamic Form Engine'
  },
  tab_users_management: {
    ar: 'إدارة المستخدمين واللجان',
    en: 'Users & Committees'
  },
  tab_facilities: {
    ar: 'سجل المنشآت والعيادات',
    en: 'Facilities & Clinics'
  },
  tab_assignments: {
    ar: 'إدارة المهام والكشوفات',
    en: 'Inspection Tasks'
  },
  tab_field_inspector: {
    ar: 'التطبيق الميداني للمفتش',
    en: 'Inspector Field App'
  },
  tab_nurses: {
    ar: 'سجل هويات التمريض',
    en: 'Nursing IDs Registry'
  },
  tab_violations: {
    ar: 'سجل المخالفات والقرارات',
    en: 'Violations & Penalties'
  },
  tab_finance: {
    ar: 'الحسابات والجباية التفتيشية',
    en: 'Accounts & Inspection ERP'
  },
  tab_operations_chat: {
    ar: 'غرفة العمليات وتواصل الفروع',
    en: 'Branch Ops & Dispatch'
  },

  // Roles
  role_HIGH_COMMAND: {
    ar: 'النقيب / القيادة العليا',
    en: 'Syndicate President / High Command'
  },
  role_BRANCH_DIRECTOR: {
    ar: 'مدير الفرع الجغرافي',
    en: 'Branch Director'
  },
  role_INSPECTION_DIRECTOR: {
    ar: 'مدير لجان التفتيش',
    en: 'Inspection Director'
  },
  role_FIELD_INSPECTOR: {
    ar: 'مفتش ميداني',
    en: 'Field Inspector'
  },

  // Common Controls
  language: {
    ar: 'اللغة',
    en: 'Language'
  },
  theme: {
    ar: 'المظهر',
    en: 'Theme'
  },
  lightMode: {
    ar: 'الوضع الفاتح',
    en: 'Light Mode'
  },
  darkMode: {
    ar: 'الوضع الداكن',
    en: 'Dark Mode'
  },
  switchUserRole: {
    ar: 'تبديل دور المستخدم',
    en: 'Switch Role'
  },
  searchPlaceholder: {
    ar: 'البحث بالحقل، الاسم، الكود أو الرقم...',
    en: 'Search by name, code, or number...'
  },
  filterAll: {
    ar: 'جميع البيانات',
    en: 'All Data'
  },
  filterProvince: {
    ar: 'المحافظة',
    en: 'Province'
  },
  allProvinces: {
    ar: 'جميع المحافظات الـ 15',
    en: 'All 15 Provinces'
  },
  add: {
    ar: 'إضافة',
    en: 'Add'
  },
  edit: {
    ar: 'تعديل',
    en: 'Edit'
  },
  delete: {
    ar: 'حذف',
    en: 'Delete'
  },
  save: {
    ar: 'حفظ',
    en: 'Save'
  },
  cancel: {
    ar: 'إلغاء',
    en: 'Cancel'
  },
  print: {
    ar: 'طباعة',
    en: 'Print'
  },
  active: {
    ar: 'نشط',
    en: 'Active'
  },
  inactive: {
    ar: 'معطل',
    en: 'Inactive'
  },
  status: {
    ar: 'الحالة',
    en: 'Status'
  },
  actions: {
    ar: 'الإجراءات',
    en: 'Actions'
  },
  notes: {
    ar: 'ملاحظات',
    en: 'Notes'
  },
  phone: {
    ar: 'رقم الهاتف',
    en: 'Phone Number'
  },
  address: {
    ar: 'العنوان التفصيلي',
    en: 'Detailed Address'
  },
  badgeNumber: {
    ar: 'رقم الشارة',
    en: 'Badge Number'
  },
  syndicateCard: {
    ar: 'هوية النقابة',
    en: 'Syndicate ID'
  },

  // Stats Dashboard Labels
  statTotalFacilities: {
    ar: 'إجمالي المنشآت والعيادات',
    en: 'Total Facilities & Clinics'
  },
  statLicensed: {
    ar: 'المنشآت المرخصة أصولياً',
    en: 'Fully Licensed Facilities'
  },
  statPendingUnlicensed: {
    ar: 'المنشآت غير المرخصة / القيد',
    en: 'Unlicensed / Pending'
  },
  statActiveNurses: {
    ar: 'الممرضون المسجلون بالنقابة',
    en: 'Registered Nurses'
  },
  statInspectionsCompleted: {
    ar: 'الكشوفات الميدانية المنفذة',
    en: 'Completed Field Inspections'
  },
  statViolationsRecorded: {
    ar: 'المخالفات المرصودة',
    en: 'Recorded Violations'
  },
  statPendingAssignments: {
    ar: 'مهام كشف معلقة',
    en: 'Pending Inspection Tasks'
  },

  // Facility Types
  type_CLINIC: {
    ar: 'عيادة تمريضية / طبية',
    en: 'Nursing / Medical Clinic'
  },
  type_MIDWIFE_CLINIC: {
    ar: 'عيادة قابلات',
    en: 'Midwife Clinic'
  },
  type_HOSPITAL: {
    ar: 'مستشفى / مركز جراحي',
    en: 'Hospital / Surgical Center'
  },
  type_NURSING_CENTER: {
    ar: 'مركز رعاية تمريضية',
    en: 'Nursing Care Center'
  },
  type_LAB_CENTER: {
    ar: 'مختبر تحليلات مرضية',
    en: 'Pathology Lab'
  },

  // Statuses
  status_LICENSED: {
    ar: 'مرخص أصولياً',
    en: 'Licensed'
  },
  status_PENDING: {
    ar: 'قيد التدقيق والتجديد',
    en: 'Pending Renewal'
  },
  status_EXPIRED: {
    ar: 'منتهي الترخيص',
    en: 'Expired License'
  },
  status_SUSPENDED: {
    ar: 'موقوف إدارياً',
    en: 'Suspended'
  },
  status_UNLICENSED: {
    ar: 'غير مرخص / عيادة وهمية',
    en: 'Unlicensed / Illegal'
  }
};

interface LanguageThemeContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  medicalTheme: MedicalThemeId;
  setMedicalTheme: (themeId: MedicalThemeId) => void;
  medicalThemePresets: MedicalThemePreset[];
  currentThemePreset: MedicalThemePreset;
  sidebarTheme: SidebarThemeId;
  setSidebarTheme: (themeId: SidebarThemeId) => void;
  sidebarThemePresets: SidebarThemePreset[];
  currentSidebarThemePreset: SidebarThemePreset;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');

  // Load saved medical theme preset or default to calm 'medical-sky'
  const [medicalTheme, setMedicalThemeState] = useState<MedicalThemeId>(() => {
    try {
      const saved = localStorage.getItem('syndicate_medical_theme_id') as MedicalThemeId;
      if (saved && MEDICAL_THEMES.some(t => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return 'medical-sky';
  });

  // Load saved sidebar theme preset or default to 'navy'
  const [sidebarTheme, setSidebarThemeState] = useState<SidebarThemeId>(() => {
    try {
      const saved = localStorage.getItem('syndicate_sidebar_theme') as SidebarThemeId;
      if (saved && SIDEBAR_THEMES.some(t => t.id === saved)) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return 'navy';
  });

  const currentThemePreset = MEDICAL_THEMES.find(t => t.id === medicalTheme) || MEDICAL_THEMES[0];
  const currentSidebarThemePreset = SIDEBAR_THEMES.find(t => t.id === sidebarTheme) || SIDEBAR_THEMES[0];
  const theme: Theme = currentThemePreset.isDark ? 'dark' : 'light';

  useEffect(() => {
    // Update HTML dir and lang attributes
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.body.classList.add('dir-rtl');
      document.body.classList.remove('dir-ltr');
    } else {
      document.body.classList.add('dir-ltr');
      document.body.classList.remove('dir-rtl');
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('syndicate_medical_theme_id', medicalTheme);
    } catch (e) {
      // ignore
    }

    // Set data-theme on root and body
    document.documentElement.setAttribute('data-theme', medicalTheme);
    document.body.setAttribute('data-theme', medicalTheme);

    const isInspectorApp = document.body.getAttribute('data-app') === 'inspector';
    applyMedicalThemeCssVars(document.documentElement, currentThemePreset);

    if (currentThemePreset.isDark) {
      document.documentElement.classList.add('dark');
      if (isInspectorApp) {
        document.body.classList.remove('dark-mode-body', 'light-mode-body');
      } else {
        document.body.classList.add('dark-mode-body');
        document.body.classList.remove('light-mode-body');
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (isInspectorApp) {
        document.body.classList.remove('dark-mode-body', 'light-mode-body');
      } else {
        document.body.classList.remove('dark-mode-body');
        document.body.classList.add('light-mode-body');
      }
    }

    const inspectorFrame = document.getElementById('pwa-mobile-frame');
    if (inspectorFrame) {
      inspectorFrame.setAttribute('data-theme', medicalTheme);
      applyMedicalThemeCssVars(inspectorFrame, currentThemePreset);
    }

    if (isInspectorApp) {
      document.documentElement.setAttribute('data-app', 'inspector');
      document.documentElement.style.setProperty('background-color', '#0b1220', 'important');
      document.body.style.setProperty('background-color', '#0b1220', 'important');
      document.body.style.setProperty('color', '#e2e8f0', 'important');
    }
  }, [medicalTheme, currentThemePreset]);

  useEffect(() => {
    try {
      localStorage.setItem('syndicate_sidebar_theme', sidebarTheme);
    } catch (e) {
      // ignore
    }

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--active-sidebar-bg', currentSidebarThemePreset.bg);
    rootStyle.setProperty('--active-sidebar-border', currentSidebarThemePreset.border);
    rootStyle.setProperty('--active-sidebar-text', currentSidebarThemePreset.textColor);
    rootStyle.setProperty('--active-sidebar-muted', currentSidebarThemePreset.mutedText);
    rootStyle.setProperty('--active-sidebar-header-bg', currentSidebarThemePreset.headerBg);
    rootStyle.setProperty('--active-sidebar-footer-bg', currentSidebarThemePreset.footerBg);
    rootStyle.setProperty('--active-sidebar-user-bg', currentSidebarThemePreset.userCardBg);
    rootStyle.setProperty('--active-sidebar-accent', currentSidebarThemePreset.accent);
  }, [sidebarTheme, currentSidebarThemePreset]);

  const setMedicalTheme = (id: MedicalThemeId) => {
    setMedicalThemeState(id);
  };

  const setSidebarTheme = (id: SidebarThemeId) => {
    setSidebarThemeState(id);
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'dark') {
      setMedicalThemeState('executive-night');
    } else {
      // If currently dark, switch to medical-sky
      setMedicalThemeState('medical-sky');
    }
  };

  const toggleTheme = () => {
    if (currentThemePreset.isDark) {
      setMedicalThemeState('medical-sky');
    } else {
      setMedicalThemeState('executive-night');
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang] || translations[key]['ar'] || key;
    }
    return key;
  };

  return (
    <LanguageThemeContext.Provider value={{
      lang,
      setLang,
      theme,
      setTheme,
      medicalTheme,
      setMedicalTheme,
      medicalThemePresets: MEDICAL_THEMES,
      currentThemePreset,
      sidebarTheme,
      setSidebarTheme,
      sidebarThemePresets: SIDEBAR_THEMES,
      currentSidebarThemePreset,
      toggleTheme,
      toggleLanguage,
      t
    }}>
      {children}
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const context = useContext(LanguageThemeContext);
  if (!context) {
    throw new Error('useLanguageTheme must be used within a LanguageThemeProvider');
  }
  return context;
};
