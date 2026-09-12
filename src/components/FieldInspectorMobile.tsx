import { calculateDistance } from '../utils/geoUtils';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguageTheme } from '../context/LanguageThemeContext';
import { AccountProfile } from './AccountProfile';
import { AiInspectorBotModal } from './AiInspectorBotModal';
import { DataSquirrelAuditModal } from './DataSquirrelAuditModal';
import { DispatchAutomationModal } from './DispatchAutomationModal';
import { 
  InspectionAssignment, 
  Facility, 
  NurseStaff, 
  User, 
  FacilitySafetyChecklist,
  BranchChatMessage,
  DisciplineBroadcast 
} from '../types';
import { INITIAL_USERS } from '../data/initialData';
import {
  Navigation, Camera, Target, Building2, ShieldCheck, AlertTriangle, CheckCircle2, UserCheck, Search,
  RefreshCw, Send, Sparkles, Smartphone, Wifi, WifiOff, BatteryCharging,
  QrCode, PenTool, FileCheck, Printer, Trash2, Plus, Minus, MapPin, Check, X,
  Clock, Maximize2, Minimize2, ChevronDown, CheckSquare, Square,
  Award, Zap, Mic, MicOff, History, Tag, Radio, Eye, MessageSquare,
  MessageCircle, ExternalLink, ShieldAlert, AlertCircle, Phone, ArrowUpRight,
  ZoomIn, ZoomOut, RotateCcw, Tablet, Monitor,
  User as UserIcon, ClipboardList, Briefcase, CreditCard, FileText, Activity,
  BookOpen, Settings, Info, LogOut, Palette, Grid, ChevronLeft,
  Pin, PinOff, Users, FileSpreadsheet, Scale, Siren, PhoneCall, Download, FolderCheck, CheckCircle, HelpCircle,
  Calendar, Map, MoreHorizontal, Home, ClipboardCheck, LayoutGrid, Bot, Database
} from 'lucide-react';

interface FieldInspectorMobileProps {
  isStandalone?: boolean;
  currentUser: User;
  onUserChange?: (user: User) => void;
  assignments: InspectionAssignment[];
  facilities: Facility[];
  nurses: NurseStaff[];
  onSubmitReport: (reportData: any) => Promise<any>;
  onVerifyNurseSyndicateId: (syndicateId: string) => Promise<any>;
  chatMessages?: BranchChatMessage[];
  broadcasts?: DisciplineBroadcast[];
  onSendMessage?: (message: BranchChatMessage) => void;
  onOpenFullChat?: () => void;
}

// Inspection Checklist Items Schema
interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  weight: number;
  status: 'PASS' | 'FAIL' | 'NA';
  notes?: string;
}

const INITIAL_CHECKLIST: ChecklistItem[] = [
  // Category: Licenses
  { id: 'c1', category: 'LICENSES', title: 'توفر إجازة ممارسة المهنة والفتح نافذة المفعول', weight: 15, status: 'PASS' },
  { id: 'c2', category: 'LICENSES', title: 'عرض شهادات الترخيص والتخصص النقابي بارزة للعيان', weight: 10, status: 'PASS' },
  { id: 'c3', category: 'LICENSES', title: 'سجل استقبال المرضى وتدوين المداخلات التمريضية', weight: 10, status: 'PASS' },
  
  // Category: Staffing
  { id: 'c4', category: 'STAFFING', title: 'حضور مسؤول الكادر التمريض المجاز والمسجل أصولياً', weight: 15, status: 'PASS' },
  { id: 'c5', category: 'STAFFING', title: 'حمل الموظفين لهويات الانتساب النقابي والباج التجاري', weight: 10, status: 'PASS' },
  { id: 'c6', category: 'STAFFING', title: 'خلو العيادة من أفراد غير مرخصين ممارسين للتمريض', weight: 15, status: 'PASS' },

  // Category: Sanitation
  { id: 'c7', category: 'SANITATION', title: 'توفر جهاز التعقيم (Autoclave) واختبار كفاءته', weight: 10, status: 'PASS' },
  { id: 'c8', category: 'SANITATION', title: 'التخلص الآمن من الحاويات الطبية الحادة (Safety Box)', weight: 10, status: 'PASS' },
  { id: 'c9', category: 'SANITATION', title: 'توفر المطهرات والمعقمات المعتمدة وارتداء القفازات', weight: 5, status: 'PASS' },

  // Category: Drugs
  { id: 'c10', category: 'DRUGS', title: 'سلامة الأدوية والمستلزمات وعدم وجود مواد منتهية الصلاحية', weight: 10, status: 'PASS' },
  { id: 'c11', category: 'DRUGS', title: 'توفر حقيبة الطوارئ والإنعاش التمريضي الأولي', weight: 10, status: 'PASS' }
];

  const getToolIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'FileCheck': return <FileCheck className={className} />;
      case 'QrCode': return <QrCode className={className} />;
      case 'Camera': return <Camera className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'PenTool': return <PenTool className={className} />;
      case 'MessageCircle': return <MessageCircle className={className} />;
      case 'UserIcon': return <UserIcon className={className} />;
      case 'ClipboardList': return <ClipboardList className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'Settings': return <Settings className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'AlertCircle': return <AlertCircle className={className} />;
      case 'Award': return <Award className={className} />;
      case 'RefreshCw': return <RefreshCw className={className} />;
      case 'Printer': return <Printer className={className} />;
      case 'FileSpreadsheet': return <FileSpreadsheet className={className} />;
      case 'Palette': return <Palette className={className} />;
      case 'Info': return <Info className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Scale': return <Scale className={className} />;
      case 'Siren': return <Siren className={className} />;
      case 'Map': return <Map className={className} />;
      case 'FolderCheck': return <FolderCheck className={className} />;
      case 'Bot': return <Bot className={className} />;
      case 'Database': return <Database className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const ALL_TOOLS_MAP: Record<string, any> = {
    // Exact 8 primary tools from the user's reference mockup
    'INSPECT_FILES': { id: 'INSPECT_FILES', label: 'ملف الكشف', icon: 'FileText', neonClass: 'neon-glow-emerald', iconColor: 'text-emerald-300', bgBox: 'bg-emerald-950/40', bgFrom: 'from-emerald-500', bgTo: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
    'TASKS_MORE': { id: 'TASKS_MORE', label: 'المهام والتكليفات', icon: 'ClipboardList', neonClass: 'neon-glow-amber', iconColor: 'text-amber-300', bgBox: 'bg-amber-950/40', bgFrom: 'from-amber-500', bgTo: 'to-orange-600', shadow: 'shadow-amber-500/30' },
    'MY_ZONE': { id: 'MY_ZONE', label: 'نطاق الاختصاص', icon: 'MapPin', neonClass: 'neon-glow-purple', iconColor: 'text-purple-300', bgBox: 'bg-purple-950/40', bgFrom: 'from-purple-500', bgTo: 'to-indigo-600', shadow: 'shadow-purple-500/30' },
    'FIELD_MAP': { id: 'FIELD_MAP', label: 'الخريطة الميدانية', icon: 'Map', neonClass: 'neon-glow-emerald', iconColor: 'text-emerald-300', bgBox: 'bg-emerald-950/40', bgFrom: 'from-emerald-600', bgTo: 'to-cyan-600', shadow: 'shadow-emerald-500/30' },
    'REPORTS': { id: 'REPORTS', label: 'التقارير والمحاضر', icon: 'FileSpreadsheet', neonClass: 'neon-glow-silver', iconColor: 'text-slate-100', bgBox: 'bg-slate-800/40', bgFrom: 'from-slate-500', bgTo: 'to-slate-700', shadow: 'shadow-slate-400/30' },
    'VISIT_HISTORY': { id: 'VISIT_HISTORY', label: 'سجل الزيارات السابقة', icon: 'FolderCheck', neonClass: 'neon-glow-cyan', iconColor: 'text-sky-300', bgBox: 'bg-sky-950/40', bgFrom: 'from-sky-500', bgTo: 'to-blue-600', shadow: 'shadow-sky-500/30' },
    'DISCIPLINE': { id: 'DISCIPLINE', label: 'دليل اللوائح والقوانين', icon: 'Scale', neonClass: 'neon-glow-amber', iconColor: 'text-amber-300', bgBox: 'bg-amber-950/40', bgFrom: 'from-amber-600', bgTo: 'to-yellow-500', shadow: 'shadow-amber-600/30' },
    'ACCOUNT': { id: 'ACCOUNT', label: 'إدارة الحساب', icon: 'UserIcon', neonClass: 'neon-glow-cyan', iconColor: 'text-blue-300', bgBox: 'bg-blue-950/40', bgFrom: 'from-blue-500', bgTo: 'to-indigo-600', shadow: 'shadow-blue-500/30' },

    // Advanced AI & Automation Tools (DataSquirrel, ChatSimple, GMPlus)
    'AI_ASSISTANT': { id: 'AI_ASSISTANT', label: 'المساعد الذكي (AI)', icon: 'Bot', neonClass: 'neon-glow-cyan', iconColor: 'text-cyan-300', bgBox: 'bg-cyan-950/40', bgFrom: 'from-sky-500', bgTo: 'to-cyan-600', shadow: 'shadow-sky-500/30' },
    'DATA_CLEANSER': { id: 'DATA_CLEANSER', label: 'تنقية البيانات آلياً', icon: 'Database', neonClass: 'neon-glow-amber', iconColor: 'text-amber-300', bgBox: 'bg-amber-950/40', bgFrom: 'from-amber-500', bgTo: 'to-orange-600', shadow: 'shadow-amber-500/30' },
    'DISPATCH_AUTOMATION': { id: 'DISPATCH_AUTOMATION', label: 'أتمتة الإشعارات', icon: 'Send', neonClass: 'neon-glow-emerald', iconColor: 'text-emerald-300', bgBox: 'bg-emerald-950/40', bgFrom: 'from-emerald-500', bgTo: 'to-teal-600', shadow: 'shadow-emerald-500/30' },

    // Additional Specialized Inspector Tools
    'PATROL_FILES': { id: 'PATROL_FILES', label: 'ملف التفتيش', icon: 'ShieldCheck', neonClass: 'neon-glow-rose', iconColor: 'text-rose-300', bgBox: 'bg-rose-950/40', bgFrom: 'from-rose-500', bgTo: 'to-red-600', shadow: 'shadow-rose-500/30' },
    'CHECKLIST': { id: 'CHECKLIST', label: 'استمارة الكشف', icon: 'FileCheck', neonClass: 'neon-glow-emerald', iconColor: 'text-emerald-300', bgBox: 'bg-emerald-950/40', bgFrom: 'from-emerald-400', bgTo: 'to-teal-500', shadow: 'shadow-emerald-500/30' },
    'SCANNER': { id: 'SCANNER', label: 'فحص الكوادر QR', icon: 'QrCode', neonClass: 'neon-glow-cyan', iconColor: 'text-cyan-300', bgBox: 'bg-cyan-950/40', bgFrom: 'from-blue-500', bgTo: 'to-cyan-500', shadow: 'shadow-blue-500/30' },
    'VIOLATIONS': { id: 'VIOLATIONS', label: 'سجل المخالفات', icon: 'AlertTriangle', neonClass: 'neon-glow-rose', iconColor: 'text-rose-300', bgBox: 'bg-rose-950/40', bgFrom: 'from-rose-500', bgTo: 'to-orange-500', shadow: 'shadow-rose-500/30' },
    'PHOTOS': { id: 'PHOTOS', label: 'أدلة الصور', icon: 'Camera', neonClass: 'neon-glow-purple', iconColor: 'text-purple-300', bgBox: 'bg-purple-950/40', bgFrom: 'from-purple-500', bgTo: 'to-pink-500', shadow: 'shadow-purple-500/30' },
    'SIGNATURE': { id: 'SIGNATURE', label: 'التوقيع الرقمي', icon: 'PenTool', neonClass: 'neon-glow-cyan', iconColor: 'text-indigo-300', bgBox: 'bg-indigo-950/40', bgFrom: 'from-indigo-500', bgTo: 'to-blue-600', shadow: 'shadow-indigo-500/30' },
    'SERVICES': { id: 'SERVICES', label: 'خدمات النقابة', icon: 'Briefcase', neonClass: 'neon-glow-cyan', iconColor: 'text-cyan-300', bgBox: 'bg-cyan-950/40', bgFrom: 'from-cyan-500', bgTo: 'to-blue-500', shadow: 'shadow-cyan-500/30' },
    'COMMUNICATIONS': { id: 'COMMUNICATIONS', label: 'المراسلات الميدانية', icon: 'MessageCircle', neonClass: 'neon-glow-cyan', iconColor: 'text-sky-300', bgBox: 'bg-sky-950/40', bgFrom: 'from-sky-500', bgTo: 'to-indigo-500', shadow: 'shadow-sky-500/30' },
    'CHAT': { id: 'CHAT', label: 'شات العمليات', icon: 'Radio', neonClass: 'neon-glow-silver', iconColor: 'text-slate-300', bgBox: 'bg-slate-900/40', bgFrom: 'from-slate-600', bgTo: 'to-slate-400', shadow: 'shadow-slate-500/30' },
    'EMERGENCY': { id: 'EMERGENCY', label: 'طوارئ واستغاثة SOS', icon: 'Siren', neonClass: 'neon-glow-rose', iconColor: 'text-red-400', bgBox: 'bg-red-950/40', bgFrom: 'from-red-600', bgTo: 'to-rose-700', shadow: 'shadow-red-600/30' },
    'SYNC': { id: 'SYNC', label: 'المزامنة السحابية', icon: 'RefreshCw', neonClass: 'neon-glow-emerald', iconColor: 'text-teal-300', bgBox: 'bg-teal-950/40', bgFrom: 'from-teal-500', bgTo: 'to-cyan-600', shadow: 'shadow-teal-500/30' },
    'EXPORT_PDF': { id: 'EXPORT_PDF', label: 'تصدير تقرير PDF', icon: 'Printer', neonClass: 'neon-glow-purple', iconColor: 'text-violet-300', bgBox: 'bg-violet-950/40', bgFrom: 'from-violet-500', bgTo: 'to-purple-600', shadow: 'shadow-violet-500/30' },
    'EXPORT_EXCEL': { id: 'EXPORT_EXCEL', label: 'تصدير سجل Excel', icon: 'FileSpreadsheet', neonClass: 'neon-glow-emerald', iconColor: 'text-emerald-300', bgBox: 'bg-emerald-950/40', bgFrom: 'from-emerald-600', bgTo: 'to-teal-700', shadow: 'shadow-emerald-600/30' },
    'GUIDE': { id: 'GUIDE', label: 'دليل المستخدم', icon: 'BookOpen', neonClass: 'neon-glow-silver', iconColor: 'text-slate-300', bgBox: 'bg-slate-800/40', bgFrom: 'from-slate-500', bgTo: 'to-slate-600', shadow: 'shadow-slate-500/30' },
    'SETTINGS': { id: 'SETTINGS', label: 'المظهر والعرض', icon: 'Palette', neonClass: 'neon-glow-purple', iconColor: 'text-purple-300', bgBox: 'bg-purple-950/40', bgFrom: 'from-purple-600', bgTo: 'to-indigo-700', shadow: 'shadow-purple-600/30' },
    'ABOUT': { id: 'ABOUT', label: 'حول البرنامج', icon: 'Info', neonClass: 'neon-glow-silver', iconColor: 'text-slate-300', bgBox: 'bg-slate-800/40', bgFrom: 'from-slate-600', bgTo: 'to-slate-700', shadow: 'shadow-slate-500/30' },
  };


export const FieldInspectorMobile: React.FC<FieldInspectorMobileProps> = ({
  currentUser,
  onUserChange,
  assignments,
  facilities,
  nurses,
  onSubmitReport,
  onVerifyNurseSyndicateId,
  chatMessages = [],
  broadcasts = [],
  onSendMessage,
  onOpenFullChat,
  isStandalone = false
}) => {
  // Zoom & Screen Display Scale (Persistent in localStorage)
  const [screenZoom, setScreenZoom] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('inspector_screen_zoom');
      return saved ? Number(saved) : 100;
    } catch {
      return 100;
    }
  });
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);

  const handleSetZoom = (newZoom: number) => {
    setScreenZoom(newZoom);
    try {
      localStorage.setItem('inspector_screen_zoom', String(newZoom));
    } catch {}
  };

  // Geo-Fencing Proximity Alert
  const [nearbyAlert, setNearbyAlert] = useState<Facility | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      
      // Find uninspected facilities assigned to me (or all pending)
      const myAssignments = assignments.filter(a => a.assignedInspectorId === currentUser.id && a.status === 'PENDING');
      const pendingFacilities = myAssignments.map(a => facilities.find(f => f.id === a.facilityId)).filter(Boolean) as Facility[];
      
      let foundNearby: Facility | null = null;
      for (const fac of pendingFacilities) {
        if (!isNaN(Number(fac.latitude)) && !isNaN(Number(fac.longitude))) {
          const dist = calculateDistance(latitude, longitude, Number(fac.latitude), Number(fac.longitude));
          if (dist < 500) { // 500 meters
            foundNearby = fac;
            break;
          }
        }
      }
      
      if (foundNearby && (!nearbyAlert || nearbyAlert.id !== foundNearby.id)) {
        setNearbyAlert(foundNearby);
        alert('مؤسسة قريبة جداً (' + foundNearby.name + ') بمسافة أقل من 500 متر. يمكنك تفتيشها الآن.');
      }
    }, (err) => {
      console.warn("Geolocation warning:", err);
    }, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 5000
    });

    

  return () => navigator.geolocation.clearWatch(watchId);
  }, [assignments, currentUser, facilities]);

  // App View Options & Screen Zoom Controls
  const [viewMode, setViewMode] = useState<'PHONE_FRAME' | 'TABLET_FRAME' | 'EXPANDED'>(() => {
    try {
      const saved = localStorage.getItem('inspector_view_mode');
      if (saved === 'PHONE_FRAME' || saved === 'TABLET_FRAME' || saved === 'EXPANDED') return saved;
    } catch (e) {}
    return 'PHONE_FRAME';
  });

  const [zoomScale, setZoomScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('inspector_screen_zoom');
      if (saved) return Number(saved);
    } catch (e) {}
    return 100;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleZoomChange = (delta: number) => {
    setZoomScale(prev => {
      const next = Math.max(70, Math.min(150, Math.round((prev + delta) / 10) * 10));
      localStorage.setItem('inspector_screen_zoom', String(next));
      return next;
    });
  };

  const setExactZoom = (value: number) => {
    setZoomScale(value);
    localStorage.setItem('inspector_screen_zoom', String(value));
  };

  const setAndSaveViewMode = (mode: 'PHONE_FRAME' | 'TABLET_FRAME' | 'EXPANDED') => {
    setViewMode(mode);
    localStorage.setItem('inspector_view_mode', mode);
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const cached = localStorage.getItem('pwa_inspection_queue');
    return cached ? JSON.parse(cached) : [];
  });

  // Filter inspector's assignments
  const myAssignments = assignments.filter(
    a => a.assignedInspectorId === currentUser.id || currentUser.role === 'HIGH_COMMAND' || a.status === 'PENDING'
  );
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(myAssignments[0]?.id || '');
  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId) || myAssignments[0] || null;

  // Selected Target Facility
  const targetFacility = facilities.find(f => f.id === selectedAssignment?.facilityId) || facilities[0];

  // GPS Simulation / Location
  const [inspectorLat, setInspectorLat] = useState<number>(
    targetFacility ? targetFacility.latitude + 0.00015 : 33.3153
  );
  const [inspectorLng, setInspectorLng] = useState<number>(
    targetFacility ? targetFacility.longitude + 0.00012 : 44.3512
  );
  const { medicalTheme, setMedicalTheme, medicalThemePresets } = useLanguageTheme();
  const [checkInDone, setCheckInDone] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [isCustomizingTools, setIsCustomizingTools] = useState<boolean>(false);
  const [quickActions, setQuickActions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('inspectorQuickActions_v3');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return ['INSPECT_FILES', 'TASKS_MORE', 'MY_ZONE', 'FIELD_MAP', 'REPORTS', 'VISIT_HISTORY', 'DISCIPLINE', 'ACCOUNT'];
  });
  
  const saveQuickActions = (newActions: string[]) => {
    setQuickActions(newActions);
    localStorage.setItem('inspectorQuickActions_v3', JSON.stringify(newActions));
  };

  // Detailed MORE Menu States
  const [activeMoreSection, setActiveMoreSection] = useState<string | null>(null);
  const [zoneGovernorate, setZoneGovernorate] = useState<string>(currentUser.governorate || 'بغداد');
  const [zoneDistrict, setZoneDistrict] = useState<string>('الرصافة الأولى');
  const [zoneArea, setZoneArea] = useState<string>('قطاع الكرادة - شارع 14 رمضان (نطاق 5 كم)');
  const [serviceSearchId, setServiceSearchId] = useState<string>('');
  const [serviceSearchResult, setServiceSearchResult] = useState<any>(null);
  const [trackingIdInput, setTrackingIdInput] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [emergencySent, setEmergencySent] = useState<boolean>(false);
  const [activeServiceModal, setActiveServiceModal] = useState<'ID_CARD' | 'PRACTICE_LICENSE' | null>(null);

  // Advanced AI & Automation Modals States (ChatSimple, DataSquirrel, GMPlus)
  const [showAiBotModal, setShowAiBotModal] = useState<boolean>(false);
  const [showDataAuditModal, setShowDataAuditModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);

  // Active Tab inside PWA Mobile App (with CHAT tab for field operations)
  const [homeView, setHomeView] = useState<'DASHBOARD' | 'TASKS'>('DASHBOARD');
  const [pwaTab, setPwaTab] = useState<'MISSION' | 'CHECKLIST' | 'SCANNER' | 'PHOTOS' | 'VIOLATIONS' | 'SIGNATURE' | 'CHAT' | 'MORE' | 'ACCOUNT' | 'TASKS_MORE' | 'INSPECT_FILES' | 'PATROL_FILES' | 'MY_ZONE' | 'SERVICES' | 'GUIDE' | 'SETTINGS'>('MISSION');

  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(INITIAL_CHECKLIST);

  // Facility Safety Checklist State (قائمة التدقيق السريعة للسلامة والامتثال الميداني)
  const [safetyChecklist, setSafetyChecklist] = useState<FacilitySafetyChecklist>({
    hasAutoclaveSterilizer: true, // جهاز تعقيم فعال (للعيادات)
    hasSafetyBox: true,           // صندوق التخلص من الحوادث الحادة
    hasExpiredMedications: false,  // وجود أدوية منتهية أو محظورة
    hasUnlicensedForeignStaff: false, // وجود عمالة أجنبية غير مرخصة
    isExceedingScopeOfPractice: false // تشخيص طبي أو وصف أدوية خارج الصلاحية
  });

  // Nurse Verification Scanner State
  const [syndicateInput, setSyndicateInput] = useState<string>('');
  const [scannedNurseResult, setScannedNurseResult] = useState<any>(null);
  const [checkedNurses, setCheckedNurses] = useState<NurseStaff[]>([]);
  const [isCameraScanning, setIsCameraScanning] = useState<boolean>(false);

  // Photos State
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&q=80'
  ]);

  // Violations State
  const [violations, setViolations] = useState<any[]>([]);
  const [newViolType, setNewViolType] = useState<string>('EXPIRED_SYNDICATE_CARD');
  const [newViolDesc, setNewViolDesc] = useState<string>('');
  const [newViolSeverity, setNewViolSeverity] = useState<string>('WARNING');
  const [newViolFine, setNewViolFine] = useState<number>(250000);

  // Signatures
  const [inspectorSigned, setInspectorSigned] = useState<boolean>(false);
  const [facilitySigned, setFacilitySigned] = useState<boolean>(false);

  // Report Submission State
  const [recommendedAction, setRecommendedAction] = useState<string>('PASS');
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // 6 Advanced Inspector Modules States
  // 1. Route Optimization
  const [sortByProximity, setSortByProximity] = useState<boolean>(false);

  // 2. CRM Facility History Modal
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [facilityHistory, setFacilityHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // 3. Unregistered Facility Drop-a-Pin Reporting
  const [showUnregModal, setShowUnregModal] = useState<boolean>(false);
  const [unregName, setUnregName] = useState<string>('');
  const [unregNotes, setUnregNotes] = useState<string>('');
  const [unregPhoto, setUnregPhoto] = useState<string>('');
  const [unregSubmitting, setUnregSubmitting] = useState<boolean>(false);
  const [unregResult, setUnregResult] = useState<string | null>(null);

  // 4. Voice-to-Text & Quick Tags
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const speechRecRef = useRef<any>(null);

  // 5. Gamification Dashboard
  const [dailyTarget, setDailyTarget] = useState<number>(10);
  const [completedToday, setCompletedToday] = useState<number>(7);

  // 6. Real Camera QR / Barcode Scanner
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const html5QrScannerRef = useRef<any>(null);

  const QUICK_TAGS = [
    'أدوية منتهية الصلاحية',
    'كوادر غير مرخصة',
    'عدم وجود لوحة ترخيص رسمية',
    'انتحال صفة تمريضية',
    'سوء تعقيم وغياب الأوتوكلاف',
    'غياب حاوية الأدوات الحادة (Safety Box)',
    'تداول أدوية ومواد محظورة',
    'المنشأة ملتزمة بكافة الشروط'
  ];

  // 7. Operations Chat for Field Inspector
  const [chatInput, setChatInput] = useState<string>('');
  const [isUrgentMessage, setIsUrgentMessage] = useState<boolean>(false);
  const [includeGpsInMessage, setIncludeGpsInMessage] = useState<boolean>(true);
  const [chatTabFilter, setChatTabFilter] = useState<'ALL' | 'URGENT' | 'BROADCAST'>('ALL');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (pwaTab === 'CHAT') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pwaTab, chatMessages]);

  const handleSendFieldChatMessage = (customText?: string, isUrgentOverride?: boolean) => {
    const textToSend = customText !== undefined ? customText : chatInput;
    if (!textToSend.trim()) return;

    const isUrgent = isUrgentOverride !== undefined ? isUrgentOverride : isUrgentMessage;

    let fullText = textToSend.trim();
    if (includeGpsInMessage && !customText) {
      if (targetFacility) {
        fullText += `\n📍 [الموقع]: ${targetFacility.name} (${targetFacility.neighborhood}) | GPS: ${inspectorLat.toFixed(5)}, ${inspectorLng.toFixed(5)}`;
      } else {
        fullText += `\n📍 [إحداثيات المفتش]: ${inspectorLat.toFixed(5)}, ${inspectorLng.toFixed(5)}`;
      }
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: BranchChatMessage = {
      id: `msg_insp_${Date.now()}`,
      channelId: currentUser.provinceId ? `province_${currentUser.provinceId}` : 'national_broadcasts',
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderRoleTitle: currentUser.roleTitle || 'مفتش ميداني معتمد',
      senderBadge: currentUser.badgeNumber || 'NURSE-INSP-FIELD',
      provinceId: currentUser.provinceId || 'all',
      provinceName: currentUser.provinceName || 'بغداد الرصافة',
      messageText: fullText,
      timestamp: timeStr,
      type: isUrgent ? 'URGENT_DISPATCH' : 'TEXT'
    };

    if (onSendMessage) {
      onSendMessage(newMsg);
    } else {
      const cached = localStorage.getItem('syndicate_chat_messages');
      const list = cached ? JSON.parse(cached) : [];
      list.push(newMsg);
      localStorage.setItem('syndicate_chat_messages', JSON.stringify(list));
    }

    setChatInput('');
    setIsUrgentMessage(false);
    setTimeout(() => {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleQuickDispatch = (type: 'SOS' | 'ARRIVED' | 'LEGAL' | 'OBSTRUCTION') => {
    let msg = '';
    let urgent = false;
    const facName = targetFacility?.name || 'العيادة المستهدفة';
    const coords = `${inspectorLat.toFixed(5)}, ${inspectorLng.toFixed(5)}`;

    if (type === 'SOS') {
      msg = `🚨 [نداء مؤازرة عاجل جداً]: تطلب لجنة التفتيش الميداني دعماً أمنياً فورياً في موقع ${facName} - الإحداثيات: ${coords}.`;
      urgent = true;
    } else if (type === 'ARRIVED') {
      msg = `📍 [إشعار وصول للمنشأة]: تم وصول المفتش (${currentUser.name}) إلى موقع ${facName} وبدء التدقيق الميداني وفحص التراخيص والكوادر.`;
      urgent = false;
    } else if (type === 'LEGAL') {
      msg = `⚖️ [استفسار نقابي وقانوني]: نرجو من الدائرة القانونية وغرفة العمليات المركزية بيان الرأي القانوني حيال ترخيص ${facName}.`;
      urgent = false;
    } else if (type === 'OBSTRUCTION') {
      msg = `⚠️ [تقرير ممانعة تفتيش]: تم رصد امتناع إدارة ${facName} عن التعاون مع المفتش. نرجو توجيه إنذار رسمي أو تحريك قوة مؤازرة.`;
      urgent = true;
    }

    handleSendFieldChatMessage(msg, urgent);
  };

  const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Calculate sorted assignments by distance from inspector's GPS
  const displayedAssignments = React.useMemo(() => {
    if (!sortByProximity) return myAssignments;
    return [...myAssignments].sort((a, b) => {
      const facA = facilities.find(f => f.id === a.facilityId);
      const facB = facilities.find(f => f.id === b.facilityId);
      const distA = facA ? haversineDistanceKm(inspectorLat, inspectorLng, facA.latitude, facA.longitude) : 9999;
      const distB = facB ? haversineDistanceKm(inspectorLat, inspectorLng, facB.latitude, facB.longitude) : 9999;
      return distA - distB;
    });
  }, [myAssignments, sortByProximity, inspectorLat, inspectorLng, facilities]);

  // Update GPS when selected assignment changes
  useEffect(() => {
    if (targetFacility) {
      setInspectorLat(targetFacility.latitude + 0.00015);
      setInspectorLng(targetFacility.longitude + 0.00012);
      setCheckInDone(false);
    }
  }, [selectedAssignmentId]);

  // Calculate distance in meters
  const distanceMeters = targetFacility ? Math.round(
    6371e3 * 2 * Math.asin(Math.sqrt(
      Math.sin(((targetFacility.latitude - inspectorLat) * Math.PI) / 360) ** 2 +
      Math.cos(inspectorLat * Math.PI / 180) * Math.cos((targetFacility.latitude * Math.PI) / 180) *
      Math.sin(((targetFacility.longitude - inspectorLng) * Math.PI) / 360) ** 2
    ))
  ) : 0;

  const isGpsValid = distanceMeters <= 100;

  // Calculate Compliance Score dynamically
  const calculateComplianceScore = (): number => {
    const evaluated = checklist.filter(item => item.status !== 'NA');
    if (evaluated.length === 0) return 100;
    const passedWeight = evaluated.reduce((acc, item) => item.status === 'PASS' ? acc + item.weight : acc, 0);
    const totalWeight = evaluated.reduce((acc, item) => acc + item.weight, 0);
    return Math.round((passedWeight / totalWeight) * 100);
  };

  const currentComplianceScore = calculateComplianceScore();

      // Handlers
  const handleCheckIn = () => {
    setCheckInDone(true);
    setCheckInTime(new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleSimulateGPSOnSite = () => {
    if (targetFacility) {
      setInspectorLat(targetFacility.latitude + 0.0001);
      setInspectorLng(targetFacility.longitude + 0.0001);
    }
  };

  const handleSimulateGPSFarAway = () => {
    setInspectorLat(33.4000);
    setInspectorLng(44.4000);
  };

  const handleScanNurseSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!syndicateInput.trim()) return;
    const res = await onVerifyNurseSyndicateId(syndicateInput);
    setScannedNurseResult(res);
    setIsCameraScanning(false);
  };

  const handleAddNurseToCheckedList = (nurse: NurseStaff) => {
    if (!checkedNurses.some(n => n.id === nurse.id)) {
      setCheckedNurses(prev => [...prev, nurse]);
    }
  };

  const handleAddViolation = () => {
    if (!newViolDesc.trim()) return;
    const newViol = {
      violationType: newViolType,
      description: newViolDesc,
      severity: newViolSeverity,
      fineAmountIqd: newViolFine,
      nurseSyndicateId: scannedNurseResult?.nurse?.syndicateId || ''
    };
    setViolations(prev => [...prev, newViol]);
    setNewViolDesc('');
  };

  const handleAddPhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
      'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400&q=80'
    ];
    const randomImg = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setPhotos(prev => [...prev, randomImg]);
  };

    // Dynamic Checklist Feature
  const [historicalViolation, setHistoricalViolation] = useState<any>(null);
  const [historicalViolationResolved, setHistoricalViolationResolved] = useState(false);

  useEffect(() => {
    if (targetFacility && targetFacility.violationsCount && targetFacility.violationsCount > 0) {
      setHistoricalViolation({
        type: 'مخالفة سابقة مستمرة',
        desc: 'أشارت السجلات إلى وجود مخالفة سابقة في هذه المؤسسة تتعلق بالتعقيم. يرجى التحقق وإرفاق صورة تثبت المعالجة.'
      });
      setHistoricalViolationResolved(false);
    } else {
      setHistoricalViolation(null);
      setHistoricalViolationResolved(true);
    }
  }, [targetFacility]);

  // Handlers for Advanced Modules
  const handleOpenFacilityHistory = async () => {
    if (!targetFacility) return;
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      if ((window as any).InspectorModules?.getFacilityHistory) {
        const records = await (window as any).InspectorModules.getFacilityHistory(targetFacility.id);
        if (records && records.length > 0) {
          setFacilityHistory(records);
          setLoadingHistory(false);
          return;
        }
      }
      // Demo CRM history records for reliable simulation
      setFacilityHistory([
        {
          id: 'INSP-HIST-01',
          date: '2026-08-12',
          inspection_type: 'كشف دوري شامل',
          status: 'PASS',
          violations: 'لا توجد مخالفات مسجلة',
          inspector_name: 'د. علي الكرخي',
          notes: 'المنشأة ملتزمة بكافة المعايير والشروط وتراخيص الكوادر سارية.'
        },
        {
          id: 'INSP-HIST-02',
          date: '2026-03-20',
          inspection_type: 'كشف مفاجئ - تدقيق كوادر',
          status: 'VIOLATION',
          violations: 'تأخر تجديد هوية الانتساب النقابي لأحد الممرضين',
          inspector_name: 'مفتش أحمد جاسم',
          notes: 'تم توجيه إنذار رسمي وإعطاء مهلة 72 ساعة لتسديد وتجديد الهوية.'
        }
      ]);
    } catch (e) {
      setFacilityHistory([
        {
          id: 'INSP-HIST-01',
          date: '2026-08-12',
          inspection_type: 'كشف دوري شامل',
          status: 'PASS',
          violations: 'لا توجد مخالفات',
          inspector_name: 'د. علي الكرخي',
          notes: 'المنشأة ملتزمة بالكامل.'
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitUnregReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unregName.trim()) {
      alert('يرجى كتابة اسم الكيان أو اليافطة الظاهرة');
      return;
    }
    setUnregSubmitting(true);
    try {
      if ((window as any).InspectorModules?.reportUnregisteredFacility) {
        await (window as any).InspectorModules.reportUnregisteredFacility({
          name: unregName,
          photoBase64: unregPhoto || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
          notes: unregNotes,
          inspectorId: currentUser.id,
          inspectorName: currentUser.name
        });
      }
      setUnregResult('✅ تم توثيق البلاغ وإرساله فورياً إلى قاعدة بيانات الكيانات الشبحية (urgent_reports)!');
      setTimeout(() => {
        setUnregName('');
        setUnregNotes('');
        setUnregPhoto('');
        setShowUnregModal(false);
        setUnregResult(null);
      }, 2000);
    } catch (err: any) {
      alert('تم حفظ البلاغ محلياً وسيرسل عند توفر الاتصال: ' + err.message);
      setShowUnregModal(false);
    } finally {
      setUnregSubmitting(false);
    }
  };

  const loadFacilityHistory = () => {
    setLoadingHistory(true);
    setTimeout(() => {
      const mockHistory = [
        {
          inspection_type: 'جولة تفتيش روتينية',
          status: 'PASS',
          date: '2025-01-14',
          inspector_name: 'علي حسن الساعدي',
          notes: 'العيادة مستوفية لكافة الشروط النقابية وتم فحص كادر التمريض والتأكد من هويات الانتساب.'
        },
        {
          inspection_type: 'كشف مفاجئ - متابعة بلاغ',
          status: 'FAIL',
          date: '2024-11-20',
          inspector_name: 'مفتش الرقابة الميدانية',
          violations: 'تم تسجيل غرامة مالية بسبب تأخير تجديد هوية الانتساب النقابي لأحد الكوادر التمريضية.'
        }
      ];
      setFacilityHistory(mockHistory);
      setLoadingHistory(false);
    }, 350);
  };

  const handleToggleVoiceNotes = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('المتصفح الحالي لا يدعم Web Speech API للإدخال الصوتي. يرجى تجربة متصفح Chrome.');
      return;
    }
    if (isVoiceRecording) {
      if (speechRecRef.current) {
        try { speechRecRef.current.stop(); } catch (_) {}
      }
      setIsVoiceRecording(false);
      return;
    }
    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ar-IQ';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsVoiceRecording(true);
      rec.onend = () => setIsVoiceRecording(false);
      rec.onerror = () => setIsVoiceRecording(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setGeneralNotes(prev => prev ? `${prev} ${transcript}` : transcript);
        }
      };
      speechRecRef.current = rec;
      rec.start();
    } catch (err) {
      setIsVoiceRecording(false);
    }
  };

  const handleToggleLiveCameraScanner = async () => {
    if (isLiveCameraActive) {
      if (html5QrScannerRef.current) {
        try { await html5QrScannerRef.current.stop(); } catch (_) {}
        html5QrScannerRef.current = null;
      }
      setIsLiveCameraActive(false);
    } else {
      setIsLiveCameraActive(true);
      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const scanner = new Html5Qrcode('pwa-live-camera-feed');
          html5QrScannerRef.current = scanner;
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 15, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              setSyndicateInput(decodedText.trim());
              scanner.stop().then(() => {
                setIsLiveCameraActive(false);
                html5QrScannerRef.current = null;
                onVerifyNurseSyndicateId(decodedText.trim()).then(res => {
                  setScannedNurseResult(res);
                });
              });
            },
            () => {}
          );
        } catch (err) {
          console.warn('Live camera start error:', err);
        }
      }, 300);
    }
  };

  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    for (const report of offlineQueue) {
      await onSubmitReport(report);
    }
    setOfflineQueue([]);
    localStorage.removeItem('pwa_inspection_queue');
    alert('تمت مزامنة كافة التقارير المحفوظة أوفلاين مع السيرفر الرئيسي بنجاح!');
  };

  const handleSubmitReportForm = async () => {
    if (!selectedAssignment || !targetFacility) return;
    setIsSubmitting(true);

    const reportPayload = {
      assignmentId: selectedAssignment.id,
      facilityId: targetFacility.id,
      inspectorId: currentUser.id,
      inspectorName: currentUser.name,
      inspectorLat,
      inspectorLng,
      checkInTime,
      generalComplianceScore: currentComplianceScore,
      checklist,
      safetyChecklist,
      checkedNurseIds: checkedNurses.map(n => n.id),
      violations,
      photos,
      notes: generalNotes,
      recommendedAction,
      inspectorSigned,
      facilitySigned,
      submittedAt: new Date().toISOString()
    };

    if (!isOnline) {
      // Queue offline
      const updatedQueue = [...offlineQueue, reportPayload];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('pwa_inspection_queue', JSON.stringify(updatedQueue));
      setIsSubmitting(false);
      setCompletedToday(prev => prev + 1);
      setSubmittedResult({
        success: true,
        reportId: `OFFLINE-REP-${Date.now()}`,
        message: 'تم حفظ التقرير في ذاكرة الجهاز (وضع بعدم الاتصال - Offline Queue). سيتم المزامنة فور توفر الإنترنت.'
      });
      return;
    }

    const res = await onSubmitReport(reportPayload);
    setIsSubmitting(false);
    setCompletedToday(prev => prev + 1);
    setSubmittedResult(res);
  };

  const togglePinToHome = (toolId: string) => {
    if (quickActions.includes(toolId)) {
      saveQuickActions(quickActions.filter(id => id !== toolId));
    } else {
      if (quickActions.length >= 12) {
        alert('الحد الأقصى للتثبيت في الشاشة الرئيسية هو 12 أداة لتجنب الازدحام.');
        return;
      }
      saveQuickActions([...quickActions, toolId]);
    }
  };

  const handleExportExcel = () => {
    const headers = 'رقم المهمة,اسم المنشأة,المحافظة,التاريخ,الحالة,الامتثال,المخالفات\n';
    const rows = myAssignments.map(a => {
      const fac = facilities.find(f => f.id === a.facilityId);
      return `"${a.id}","${fac?.name || 'منشأة'}","${currentUser.governorate || 'بغداد'}","${a.scheduledDate || '2026-09-11'}","${a.status}","${currentComplianceScore}%","${violations.length}"\n`;
    }).join('');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_كشوفات_المفتش_${currentUser.name}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerEmergencySOS = () => {
    const confirmed = window.confirm('🚨 تأكيد إرسال بلاغ استغاثة طارئ فوري (SOS) إلى غرفة العمليات المركزية ولجنة الانضباط مع إحداثيات موقعك الجغرافي الحالي؟');
    if (confirmed) {
      setEmergencySent(true);
      if (onSendMessage) {
        onSendMessage({
          id: `EMERGENCY-${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          content: `🚨 بلاغ استغاثة طارئ (SOS): المفتش ${currentUser.name} في موقع ${targetFacility?.name || 'ميداني'} - إحداثيات: ${inspectorLat.toFixed(6)}, ${inspectorLng.toFixed(6)}`,
          timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
          type: 'EMERGENCY'
        } as any);
      }
      alert('تم إرسال بلاغ الطوارئ الفوري بنجاح إلى غرفة العمليات المركزية.');
    }
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === 'INSPECT_FILES') {
      setPwaTab('CHECKLIST');
    } else if (toolId === 'TASKS_MORE') {
      setHomeView('TASKS');
    } else if (toolId === 'MY_ZONE') {
      setPwaTab('MORE');
      setActiveMoreSection('MY_ZONE');
    } else if (toolId === 'FIELD_MAP') {
      setHomeView('TASKS');
    } else if (toolId === 'REPORTS') {
      window.print();
    } else if (toolId === 'VISIT_HISTORY') {
      setShowHistoryModal(true);
    } else if (toolId === 'DISCIPLINE') {
      setPwaTab('MORE');
      setActiveMoreSection('DISCIPLINE');
    } else if (['CHECKLIST', 'SCANNER', 'PHOTOS', 'VIOLATIONS', 'SIGNATURE', 'CHAT', 'ACCOUNT'].includes(toolId)) {
      setPwaTab(toolId as any);
    } else if (toolId === 'SYNC') {
      handleSyncOfflineQueue();
    } else if (toolId === 'EXPORT_PDF') {
      window.print();
    } else if (toolId === 'EXPORT_EXCEL') {
      handleExportExcel();
    } else if (toolId === 'EMERGENCY') {
      handleTriggerEmergencySOS();
    } else {
      setPwaTab('MORE');
      setActiveMoreSection(toolId);
    }
  };

  return (
    <>
    <div className="w-full min-h-screen bg-gradient-to-br from-[#060e1a] via-[#08162b] to-[#040a14] text-slate-100 flex justify-center selection:bg-emerald-500 selection:text-white relative overflow-hidden" id="field-inspector-pwa-container">
      {/* Ambient Glass Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Mobile Shell: Full width on mobile phones, max-w-md centered on desktop */}
      <div 
        className={`w-full max-w-md ${isStandalone ? 'h-[100dvh] max-h-[100dvh]' : 'h-[860px] max-h-[88vh]'} bg-[#0a1526]/85 backdrop-blur-2xl border-x border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden transition-all duration-200`}
        style={{ zoom: `${screenZoom}%` }}
      >
        
        {/* Top Header: Official Syndicate Mobile Brand - Glass Prestige */}
        <header className="bg-[#0a1628]/85 backdrop-blur-2xl text-white px-3.5 py-2.5 shadow-lg shrink-0 z-30 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="شعار نقابة التمريض" className="w-10 h-10 object-contain drop-shadow-md rounded-full bg-white/10 p-0.5 border border-white/20" />
            <div>
              <h1 className="text-xs font-black text-white tracking-wide">نقابة التمريض</h1>
              <p className="text-[10px] text-amber-300 font-bold">المفتش الميداني والرقابة الصحية</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Screen Zoom Control */}
            <div className="relative">
              <button
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-amber-300 transition cursor-pointer flex items-center gap-1 shadow-xs"
                title="تخصيص حجم العرض"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono font-bold">{screenZoom}%</span>
              </button>

              {showZoomMenu && (
                <div className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-2xl p-2 z-50 flex flex-col gap-1 w-38 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-bold text-slate-400 px-2 py-1 border-b border-slate-800">حجم الشاشة</span>
                  {[35, 45, 55, 65, 75, 85, 100, 115, 125].map(z => (
                    <button
                      key={z}
                      onClick={() => {
                        handleSetZoom(z);
                        setShowZoomMenu(false);
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-xl text-right flex items-center justify-between font-bold transition cursor-pointer ${
                        screenZoom === z ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{z === 100 ? 'الافتراضي 100%' : `${z}%`}</span>
                      {screenZoom === z && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Online / Offline Toggle */}
            <button
              id="pwa-toggle-online"
              onClick={() => setIsOnline(!isOnline)}
              className={`p-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                isOnline
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-amber-950/80 text-amber-300 border-amber-600/60 animate-pulse'
              }`}
              title="حالة الاتصال"
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : 'bg-amber-400'}`}></span>
            </button>

            {/* Offline Sync Queue */}
            {offlineQueue.length > 0 && (
              <button
                id="pwa-sync-queue-btn"
                onClick={handleSyncOfflineQueue}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2 py-1 rounded-xl text-[10px] flex items-center gap-1 shadow cursor-pointer animate-bounce"
                title="مزامنة التقارير المحفوظة"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>({offlineQueue.length})</span>
              </button>
            )}

            {/* Inspector Rounded Portrait Avatar (from reference design) */}
            <button
              onClick={() => setPwaTab(pwaTab === 'ACCOUNT' ? 'MISSION' : 'ACCOUNT')}
              className="relative group transition active:scale-95 cursor-pointer"
              title="الملف التعريفي للمفتش"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-amber-400/60 shadow-[0_0_10px_rgba(245,158,11,0.25)] bg-slate-800 flex items-center justify-center">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt="صورة المفتش" className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" 
                    alt="صورة المفتش" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 shadow-xs"></span>
            </button>
          </div>
        </header>

        {/* Secondary Info Strip: Inspector Identity & Zone (Matching Reference Image) */}
        <div className="bg-[#081326]/90 backdrop-blur-md text-slate-200 px-3.5 py-2 text-[11px] flex items-center justify-between border-b border-white/10 shadow-sm shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium">المفتش الميداني:</span>
            <span className="font-extrabold text-white truncate">{currentUser.name || 'سجاد كاظم'}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-[10px] bg-emerald-950/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-emerald-300 font-bold border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
            <span>مفتش معتمد</span>
          </div>
        </div>

        {/* Scrollable Tab Views Container - scrolls smoothly between sticky top and bottom glass bars */}
        <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-24 space-y-4 scrollbar-thin min-h-0">

              {/* TAB 1: GPS & MISSION CHECK-IN */}
            {pwaTab === 'MISSION' && (
              <div className="space-y-4 animate-in slide-in-from-right relative z-0">
                {homeView === 'DASHBOARD' ? (
                  <>
                    {/* Dashboard Stats Card - Glass Prestige with Cyber Radar Circles */}
                    <div className="bg-[#0e1b38]/85 backdrop-blur-2xl border border-sky-500/25 p-4 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                      {/* Concentric Cyber Radar Motif */}
                      <svg className="absolute -left-6 -top-6 w-36 h-36 text-sky-400/10 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
                        <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
                        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                      </svg>
                      
                      <div className="text-right mb-1 relative z-10">
                        <p className="text-[11px] text-slate-300 font-bold mb-0.5">نطاق التفتيش والتكليف:</p>
                        <p className="text-sm font-black text-white">{currentUser.governorate ? `محافظة ${currentUser.governorate}` : 'عموم المحافظات والزونات'}</p>
                      </div>
                      
                      <div className="text-right mb-3 relative z-10">
                        <p className="text-xs font-black text-slate-200">مهام اليوم الميدانية:</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 relative z-10">
                         {/* 1. مهام كشف (Right in RTL) */}
                         <button onClick={() => setHomeView('TASKS')} className="bg-gradient-to-b from-amber-500/15 to-amber-950/40 hover:from-amber-500/25 hover:to-amber-900/50 backdrop-blur-md border border-amber-400/60 rounded-2xl p-2.5 text-center shadow-[0_0_15px_rgba(245,158,11,0.18)] flex flex-col justify-between items-center h-20 transition-all active:scale-95 cursor-pointer">
                           <div className="w-full flex justify-end">
                             <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                               <ClipboardList className="w-3 h-3 text-amber-300" />
                             </div>
                           </div>
                           <span className="text-2xl font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                             {myAssignments.filter(a => a.status === 'SCHEDULED').length || 4}
                           </span>
                           <span className="text-[11px] font-extrabold text-amber-100">مهام كشف</span>
                         </button>

                         {/* 2. قيد المتابعة (Center) */}
                         <button onClick={() => setHomeView('TASKS')} className="bg-gradient-to-b from-sky-500/15 to-sky-950/40 hover:from-sky-500/25 hover:to-sky-900/50 backdrop-blur-md border border-sky-400/60 rounded-2xl p-2.5 text-center shadow-[0_0_15px_rgba(56,189,248,0.18)] flex flex-col justify-between items-center h-20 transition-all active:scale-95 cursor-pointer">
                           <div className="w-full flex justify-end">
                             <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center">
                               <RefreshCw className="w-3 h-3 text-sky-300" />
                             </div>
                           </div>
                           <span className="text-2xl font-black text-sky-200 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                             {myAssignments.filter(a => a.status === 'IN_PROGRESS').length || 8}
                           </span>
                           <span className="text-[11px] font-extrabold text-sky-100">قيد المتابعة</span>
                         </button>

                         {/* 3. مكتملة (Left in RTL) */}
                         <button onClick={() => setHomeView('TASKS')} className="bg-gradient-to-b from-teal-500/15 to-emerald-950/40 hover:from-teal-500/25 hover:to-emerald-900/50 backdrop-blur-md border border-teal-400/60 rounded-2xl p-2.5 text-center shadow-[0_0_15px_rgba(20,184,166,0.18)] flex flex-col justify-between items-center h-20 transition-all active:scale-95 cursor-pointer">
                           <div className="w-full flex justify-end">
                             <div className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                               <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                             </div>
                           </div>
                           <span className="text-2xl font-black text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                             {myAssignments.filter(a => a.status === 'COMPLETED').length || 12}
                           </span>
                           <span className="text-[11px] font-extrabold text-emerald-100">مكتملة</span>
                         </button>
                      </div>
                    </div>

                    {/* Grid of Tools - Glass Prestige with Glowing Neon Frames */}
                    <div className="bg-[#0b162c]/85 backdrop-blur-2xl border border-white/10 p-4 rounded-3xl shadow-2xl ring-1 ring-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <button onClick={() => setIsCustomizingTools(true)} className="bg-slate-800/80 hover:bg-slate-700/80 p-2 rounded-full border border-white/15 transition-colors shadow-sm cursor-pointer" title="تخصيص الأدوات">
                           <Settings className="w-4 h-4 text-slate-300 hover:text-white" />
                        </button>
                        <p className="text-xs font-black text-white text-right">أدوات المفتش الميداني السريعة:</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {quickActions.map(toolId => {
                          const tool = ALL_TOOLS_MAP[toolId];
                          if (!tool) return null;
                          return (
                            <button 
                              key={toolId} 
                              onClick={() => handleToolClick(toolId)} 
                              className="flex flex-col items-center gap-1.5 group outline-none active:scale-95 transition-transform cursor-pointer"
                            >
                              <div className={`w-16 h-16 rounded-2xl ${tool.bgBox || 'bg-slate-900/60'} ${tool.neonClass || 'neon-glow-cyan'} flex items-center justify-center transition-all group-hover:scale-105`}>
                                {getToolIcon(tool.icon, `w-7 h-7 ${tool.iconColor || 'text-cyan-300'}`)}
                              </div>
                              <span className="text-[11px] font-bold text-slate-200 text-center group-hover:text-white transition-colors leading-tight line-clamp-1">{tool.label}</span>
                            </button>
                          );
                        })}
                        {quickActions.length < 9 && (
                           <button onClick={() => setIsCustomizingTools(true)} className="flex flex-col items-center gap-1.5 group outline-none active:scale-95 transition-transform opacity-70 hover:opacity-100 cursor-pointer">
                             <div className="w-16 h-16 rounded-2xl bg-slate-900/30 border-2 border-dashed border-slate-600/70 hover:border-slate-400 flex items-center justify-center text-slate-400 shadow-sm backdrop-blur-md transition-colors">
                               <Plus className="w-7 h-7" />
                             </div>
                             <span className="text-[11px] font-bold text-slate-300 text-center">إضافة</span>
                           </button>
                        )}
                      </div>

                      {/* The 2 Action Pills from the Design Mockup */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => setShowUnregModal(true)}
                          className="bg-[#122244]/85 hover:bg-[#182f5e] border border-sky-500/30 text-sky-200 py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">رصد عيادة غير مسجلة</span>
                        </button>

                        <button
                          onClick={() => setPwaTab('CHAT')}
                          className="bg-[#0f1d38]/85 hover:bg-[#162a52] border border-sky-500/20 text-white py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
                        >
                          <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px] font-black animate-pulse">مباشر</span>
                          <span className="truncate">شات غرفة العمليات</span>
                          <Radio className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setHomeView('DASHBOARD')}
                      className="flex items-center justify-center gap-1.5 text-slate-200 hover:text-white font-bold text-xs bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md border border-white/15 rounded-xl py-2 px-4 shadow-lg transition-colors w-full mb-2 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 rotate-[180deg]" />
                      العودة للرئيسية
                    </button>
                    
                    {/* Facility Selection */}
                    <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl ring-1 ring-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-500/40">
                          مهام التفتيش ({myAssignments.length})
                        </span>
                        <label className="text-xs font-black text-white flex items-center gap-1.5">
                          المنشأة المستهدفة بالكشف
                          <Target className="w-3.5 h-3.5 text-rose-400" />
                        </label>
                      </div>
                      
                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input 
                           type="text" 
                           placeholder="بحث عن عيادة أو رقم ترخيص..." 
                           className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl py-2 pl-3 pr-9 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30"
                        />
                      </div>

                      <div className="relative">
                        <select
                          value={selectedAssignmentId}
                          onChange={(e) => setSelectedAssignmentId(e.target.value)}
                          className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl py-2.5 pl-3 pr-9 text-xs font-bold text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 text-right appearance-none relative z-10"
                          dir="rtl"
                        >
                          {myAssignments.length > 0 ? (
                            myAssignments.map(a => {
                              const fac = facilities.find(f => f.id === a.facilityId);
                              return (
                                <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                                  {fac?.name} - {fac?.district}
                                </option>
                              );
                            })
                          ) : (
                            <option value="" className="bg-slate-900 text-white">لا توجد مهام مسندة حالياً</option>
                          )}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-300 absolute left-3 top-3 z-20 pointer-events-none" />
                      </div>
                    </div>

                    {/* Mission Details & GPS */}
                    {targetFacility && (
                      <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl ring-1 ring-white/5">
                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-[#1a2f4d] flex items-center justify-center border border-sky-400/40 shadow-sm">
                               <Building2 className="w-4 h-4 text-sky-400" />
                             </div>
                             <div>
                               <h3 className="font-extrabold text-white text-xs">{targetFacility.name}</h3>
                               <p className="text-[10px] text-slate-300 font-medium">{targetFacility.type === 'CLINIC' ? 'عيادة تمريضية' : targetFacility.type}</p>
                             </div>
                           </div>
                           <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                             مهمة عاجلة
                           </span>
                        </div>
                        
                        {/* Map Preview Placeholder */}
                        <div className="w-full h-32 bg-slate-900/90 rounded-xl border border-white/15 overflow-hidden relative mb-3 shadow-inner">
                           {/* DUAL GPS VALIDATION UI */}
                           <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-lg border border-white/15 flex flex-col gap-1 z-10">
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-200">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                هدف: {targetFacility.latitude.toFixed(4)}, {targetFacility.longitude.toFixed(4)}
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-200">
                                <Navigation className="w-3 h-3 text-sky-400" />
                                موقعك: {inspectorLat.toFixed(4)}, {inspectorLng.toFixed(4)}
                              </div>
                           </div>
                           
                           <div className="absolute bottom-2 left-2 right-2 z-10">
                             {(() => {
                               const distance = calculateDistance(inspectorLat, inspectorLng, targetFacility.latitude, targetFacility.longitude);
                               const isNear = distance <= 150;
                                
                               return (
                                 <div className={`p-1.5 rounded-xl border flex items-center justify-center gap-1.5 backdrop-blur-md shadow-lg ${
                                   isNear ? 'bg-emerald-950/85 border-emerald-500 text-emerald-200' : 'bg-rose-950/85 border-rose-500 text-rose-200'
                                 }`}>
                                   {isNear ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                                   <span className="text-[10px] font-bold">
                                     {isNear ? `ضمن النطاق (${Math.round(distance)} متر)` : `خارج نطاق المنشأة (${Math.round(distance)} متر)`}
                                   </span>
                                 </div>
                               );
                             })()}
                           </div>
                           
                           <img 
                             src="https://a.tile.openstreetmap.org/13/5021/3277.png" 
                             alt="Map" 
                             className="w-full h-full object-cover opacity-40 mix-blend-luminosity" 
                           />
                        </div>

                        {/* Check In Button */}
                        {!checkInDone ? (
                          <button 
                            onClick={() => {
                              const dist = calculateDistance(inspectorLat, inspectorLng, targetFacility.latitude, targetFacility.longitude);
                              if (dist <= 150) {
                                setCheckInDone(true);
                                setCheckInTime(new Date().toLocaleTimeString('ar-IQ'));
                              } else {
                                alert("لا يمكن تسجيل الحضور: أنت خارج نطاق الـ 150 متر عن المنشأة.");
                              }
                            }}
                            className="w-full py-2.5 rounded-xl text-slate-950 font-black text-xs shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 cursor-pointer"
                          >
                            <Target className="w-4 h-4" />
                            تسجيل الوصول الجغرافي (Check-in)
                          </button>
                        ) : (
                          <div className="w-full bg-emerald-950/40 backdrop-blur-md border border-emerald-500/50 rounded-xl p-2.5 text-center flex flex-col items-center gap-1 relative overflow-hidden shadow-lg">
                            <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl"></div>
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-sm" />
                            <span className="text-xs font-black text-emerald-300">تم تسجيل الوصول بنجاح</span>
                            <span className="text-[9px] text-emerald-300 font-bold bg-slate-900/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full mt-0.5 border border-emerald-500/30">وقت الوصول: {checkInTime}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

{/* TAB 2: CHECKLIST */}
              {pwaTab === 'CHECKLIST' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">استمارة الكشف والاشتراطات</h4>
                      <p className="text-[10px] text-slate-300 font-medium">تقييم البنود والمواصفات النقابية الرسمية</p>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-300 font-bold block">نسبة الالتزام:</span>
                      <span className={`font-mono font-extrabold text-sm ${
                        currentComplianceScore >= 80 ? 'text-emerald-400' : currentComplianceScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {currentComplianceScore}%
                      </span>
                    </div>
                  </div>

                  {/* قائمة التدقيق السريعة للسلامة (FacilitySafetyChecklist) */}
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-emerald-500/40 space-y-2.5 shadow-xl ring-1 ring-emerald-500/10">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <h4 className="font-black text-emerald-300 text-xs">قائمة تدقيق السلامة الميدانية (Checklist Items)</h4>
                          <p className="text-[9.5px] text-slate-300 font-medium">تدقيق اشتراطات السلامة والكوادر ومكافحة العدوى الميدانية</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        safetyChecklist.hasAutoclaveSterilizer && safetyChecklist.hasSafetyBox && !safetyChecklist.hasExpiredMedications && !safetyChecklist.hasUnlicensedForeignStaff && !safetyChecklist.isExceedingScopeOfPractice
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-sm'
                          : 'bg-rose-950/80 text-rose-300 border-rose-500/60 animate-pulse shadow-sm'
                      }`}>
                        {safetyChecklist.hasAutoclaveSterilizer && safetyChecklist.hasSafetyBox && !safetyChecklist.hasExpiredMedications && !safetyChecklist.hasUnlicensedForeignStaff && !safetyChecklist.isExceedingScopeOfPractice
                          ? '✓ السلامة مستوفاة'
                          : '⚠️ رصد مخالفة'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {/* 1. Autoclave */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-sm">
                        <div className="flex-1 pr-1">
                          <span className="text-[11.5px] font-bold text-white block">جهاز تعقيم فعال (للعيادات)</span>
                          <span className="text-[9.5px] text-slate-300 font-medium">Autoclave Sterilizer ساري الصلاحية والفحص الدوري</span>
                        </div>
                        <button
                          type="button"
                          id="chk-autoclave"
                          onClick={() => setSafetyChecklist(prev => ({ ...prev, hasAutoclaveSterilizer: !prev.hasAutoclaveSterilizer }))}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            safetyChecklist.hasAutoclaveSterilizer
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-rose-950 text-rose-200 border border-rose-600'
                          }`}
                        >
                          {safetyChecklist.hasAutoclaveSterilizer ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{safetyChecklist.hasAutoclaveSterilizer ? 'متوفر وفعال' : 'غير متوفر'}</span>
                        </button>
                      </div>

                      {/* 2. Safety Box */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-sm">
                        <div className="flex-1 pr-1">
                          <span className="text-[11.5px] font-bold text-white block">صندوق التخلص من الحوادث الحادة</span>
                          <span className="text-[9.5px] text-slate-300 font-medium">Safety Box لعزل الإبر والمشارط الطبية</span>
                        </div>
                        <button
                          type="button"
                          id="chk-safetybox"
                          onClick={() => setSafetyChecklist(prev => ({ ...prev, hasSafetyBox: !prev.hasSafetyBox }))}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            safetyChecklist.hasSafetyBox
                              ? 'bg-emerald-500 text-slate-950 shadow-md'
                              : 'bg-rose-950 text-rose-200 border border-rose-600'
                          }`}
                        >
                          {safetyChecklist.hasSafetyBox ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>{safetyChecklist.hasSafetyBox ? 'متوفر ومطابق' : 'غير متوفر'}</span>
                        </button>
                      </div>

                      {/* 3. Expired Medications */}
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-md transition shadow-sm ${
                        safetyChecklist.hasExpiredMedications
                          ? 'bg-rose-950/50 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'bg-slate-900/80 border-white/10'
                      }`}>
                        <div className="flex-1 pr-1">
                          <span className="text-[11.5px] font-bold text-white block">وجود أدوية منتهية أو محظورة</span>
                          <span className="text-[9.5px] text-slate-300 font-medium">تخزين أدوية تالفة أو مواد مخدرة غير مرخصة</span>
                        </div>
                        <button
                          type="button"
                          id="chk-expired-meds"
                          onClick={() => {
                            const next = !safetyChecklist.hasExpiredMedications;
                            setSafetyChecklist(prev => ({ ...prev, hasExpiredMedications: next }));
                            if (next) {
                              setGeneralNotes(prev => !prev ? 'رصد أدوية منتهية الصلاحية داخل العيادة' : `${prev} | رصد أدوية منتهية`);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            safetyChecklist.hasExpiredMedications
                              ? 'bg-rose-600 text-white shadow-md animate-pulse'
                              : 'bg-slate-800 text-emerald-300 border border-white/15'
                          }`}
                        >
                          {safetyChecklist.hasExpiredMedications ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          <span>{safetyChecklist.hasExpiredMedications ? 'مخالفة: رصد أدوية' : 'سليم (لا توجد)'}</span>
                        </button>
                      </div>

                      {/* 4. Unlicensed Foreign Staff */}
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-md transition shadow-sm ${
                        safetyChecklist.hasUnlicensedForeignStaff
                          ? 'bg-rose-950/50 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'bg-slate-900/80 border-white/10'
                      }`}>
                        <div className="flex-1 pr-1">
                          <span className="text-[11.5px] font-bold text-white block">وجود عمالة أجنبية غير مرخصة</span>
                          <span className="text-[9.5px] text-slate-300 font-medium">ممرضين أجانب بدون إجازة عمل من النقابة والوزارة</span>
                        </div>
                        <button
                          type="button"
                          id="chk-foreign-staff"
                          onClick={() => {
                            const next = !safetyChecklist.hasUnlicensedForeignStaff;
                            setSafetyChecklist(prev => ({ ...prev, hasUnlicensedForeignStaff: next }));
                            if (next) {
                              setGeneralNotes(prev => !prev ? 'تشغيل عمالة أجنبية غير مرخصة نقابياً' : `${prev} | عمالة أجنبية مخالفة`);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            safetyChecklist.hasUnlicensedForeignStaff
                              ? 'bg-rose-600 text-white shadow-md animate-pulse'
                              : 'bg-slate-800 text-emerald-300 border border-white/15'
                          }`}
                        >
                          {safetyChecklist.hasUnlicensedForeignStaff ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          <span>{safetyChecklist.hasUnlicensedForeignStaff ? 'مخالفة: عمالة مخالفة' : 'سليم (مرخصون)'}</span>
                        </button>
                      </div>

                      {/* 5. Exceeding Scope of Practice */}
                      <div className={`flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-md transition shadow-sm ${
                        safetyChecklist.isExceedingScopeOfPractice
                          ? 'bg-rose-950/50 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                          : 'bg-slate-900/80 border-white/10'
                      }`}>
                        <div className="flex-1 pr-1">
                          <span className="text-[11.5px] font-bold text-white block">تشخيص طبي أو وصف أدوية خارج الصلاحية</span>
                          <span className="text-[9.5px] text-slate-300 font-medium">تجاوز التوصيف المهني للتمريض وكتابة وصفات علاجية</span>
                        </div>
                        <button
                          type="button"
                          id="chk-scope-practice"
                          onClick={() => {
                            const next = !safetyChecklist.isExceedingScopeOfPractice;
                            setSafetyChecklist(prev => ({ ...prev, isExceedingScopeOfPractice: next }));
                            if (next) {
                              setGeneralNotes(prev => !prev ? 'تجاوز الصلاحية التمريضية وتشخيص طبي غير مصرح به' : `${prev} | تجاوز الصلاحية`);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                            safetyChecklist.isExceedingScopeOfPractice
                              ? 'bg-rose-600 text-white shadow-md animate-pulse'
                              : 'bg-slate-800 text-emerald-300 border border-white/15'
                          }`}
                        >
                          {safetyChecklist.isExceedingScopeOfPractice ? <AlertTriangle className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                          <span>{safetyChecklist.isExceedingScopeOfPractice ? 'مخالفة: تجاوز الصلاحية' : 'ملتزم بالصلاحية'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {checklist.map((item) => (
                      <div key={item.id} className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-lg ring-1 ring-white/5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-extrabold text-white text-xs leading-snug">{item.title}</p>
                          <span className="text-[9px] bg-slate-800/90 text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold shrink-0 border border-white/10">
                            {item.weight} pts
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            id={`pwa-checklist-pass-${item.id}`}
                            onClick={() => {
                              setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, status: 'PASS' } : c));
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              item.status === 'PASS'
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                : 'bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white border border-white/15'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>مطابق</span>
                          </button>

                          <button
                            id={`pwa-checklist-fail-${item.id}`}
                            onClick={() => {
                              setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, status: 'FAIL' } : c));
                            }}
                            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              item.status === 'FAIL'
                                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                                : 'bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white border border-white/15'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>مخالف</span>
                          </button>

                          <button
                            id={`pwa-checklist-na-${item.id}`}
                            onClick={() => {
                              setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, status: 'NA' } : c));
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition cursor-pointer ${
                              item.status === 'NA'
                                ? 'bg-slate-700 text-white shadow'
                                : 'bg-slate-900/80 text-slate-400 border border-white/10'
                            }`}
                          >
                            N/A
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* FEATURE 4: VOICE-TO-TEXT & QUICK TAGS IN CHECKLIST */}
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 space-y-2 mt-3 shadow-xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-amber-300 font-extrabold text-[11px] flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-amber-400" />
                        <span>ملاحظات الكشف الميداني والتوصيات:</span>
                      </label>
                      <button
                        type="button"
                        id="pwa-mic-btn"
                        onClick={handleToggleVoiceNotes}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition cursor-pointer border ${
                          isVoiceRecording 
                            ? 'bg-rose-600 text-white border-rose-400 animate-pulse shadow-md' 
                            : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border-white/15 shadow-sm'
                        }`}
                        title="انقر للتحدث بالصوت باللغة العربية"
                      >
                        {isVoiceRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{isVoiceRecording ? 'جاري الاستماع...' : 'إملاء صوتي (Mic)'}</span>
                      </button>
                    </div>

                    <textarea
                      id="pwa-general-notes-textarea"
                      rows={3}
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="اكتب ملاحظات الكشف أو استخدم الميكروفون / العلامات السريعة أدناه..."
                      className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 placeholder:text-slate-400 shadow-inner"
                    />

                    <div>
                      <span className="text-[10.5px] text-slate-200 font-extrabold block mb-1.5">علامات سريعة بنقرة واحدة (Quick Tags):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_TAGS.map((tag, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setGeneralNotes(prev => !prev ? tag : (prev.includes(tag) ? prev : `${prev} | ${tag}`));
                            }}
                            className="bg-slate-900/80 hover:bg-emerald-950/80 backdrop-blur-md text-slate-200 hover:text-emerald-200 border border-white/15 hover:border-emerald-500/50 text-[10px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer shadow-xs"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NURSE SYNDICATE ID SCANNER */}
              {pwaTab === 'SCANNER' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 space-y-3 shadow-xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h4 className="font-black text-amber-300 flex items-center gap-1.5 text-xs">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        ماسح الهويات والباركود النقابي
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id="pwa-toggle-live-camera"
                          onClick={handleToggleLiveCameraScanner}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer border backdrop-blur-md transition shadow-sm ${
                            isLiveCameraActive 
                              ? 'bg-rose-950 text-rose-200 border-rose-600' 
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{isLiveCameraActive ? 'إيقاف الكاميرا الحية' : 'كاميرا الباركود'}</span>
                        </button>
                        <button
                          type="button"
                          id="pwa-toggle-camera-scanner"
                          onClick={() => setIsCameraScanning(!isCameraScanning)}
                          className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          <span>{isCameraScanning ? 'إغلاق المحاكي' : 'محاكي'}</span>
                        </button>
                      </div>
                    </div>

                    {/* FEATURE 6: REAL LIVE CAMERA FEED FOR BARCODE / QR SCANNING */}
                    {isLiveCameraActive && (
                      <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/40 text-center space-y-2 shadow-lg">
                        <p className="text-[10.5px] text-emerald-300 font-extrabold flex items-center justify-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>الكاميرا تعمل مباشرة - وجه العدسة نحو باركود أو QR هوية الممرض:</span>
                        </p>
                        <div id="pwa-live-camera-feed" className="w-full max-w-[260px] mx-auto rounded-xl overflow-hidden bg-black aspect-square border border-emerald-500 shadow-inner" />
                      </div>
                    )}

                    {/* Camera Simulation Viewfinder */}
                    {isCameraScanning && !isLiveCameraActive && (
                      <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/15 aspect-video flex flex-col items-center justify-center p-4 shadow-xl">
                        <div className="absolute inset-x-0 h-0.5 bg-rose-500 animate-pulse shadow-[0_0_12px_#ef4444] top-1/2"></div>
                        <QrCode className="w-12 h-12 text-amber-400 opacity-70 mb-2 animate-bounce drop-shadow-md" />
                        <p className="text-[10.5px] text-amber-300 font-extrabold bg-slate-950/90 px-3 py-1 rounded-xl border border-amber-500/40 shadow-md">
                          قم بتوجيه كاميرا الهاتف نحو باركود هوية الممرض...
                        </p>
                        <button
                          id="pwa-simulate-scan-trigger"
                          onClick={() => {
                            setSyndicateInput('NR-BAG-2021-8841');
                            handleScanNurseSubmit();
                          }}
                          className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          محاكاة التقاط الباركود فوراً
                        </button>
                      </div>
                    )}

                    {/* Search Input */}
                    <form onSubmit={handleScanNurseSubmit} className="flex gap-1.5">
                      <input
                        id="pwa-syndicate-input"
                        type="text"
                        value={syndicateInput}
                        onChange={(e) => setSyndicateInput(e.target.value)}
                        placeholder="أدخل رقم هوية النقابة (مثال: NR-BAG-2021-8841)..."
                        className="flex-1 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
                      />
                      <button
                        id="pwa-scan-submit-btn"
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer shrink-0 transition-transform active:scale-95"
                      >
                        فحص
                      </button>
                    </form>

                    {/* Quick Test Barcode Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-slate-300 font-bold">عينات اختبار مفاتيح:</span>
                      <button
                        id="pwa-sample-barcode-1"
                        onClick={() => { setSyndicateInput('NR-BAG-2021-8841'); }}
                        className="bg-slate-900/80 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-mono font-bold hover:bg-slate-800 transition cursor-pointer"
                      >
                        NR-BAG-2021-8841 (فعال)
                      </button>
                      <button
                        id="pwa-sample-barcode-2"
                        onClick={() => { setSyndicateInput('NR-BAG-2019-3321'); }}
                        className="bg-slate-900/80 backdrop-blur-md text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/30 font-mono font-bold hover:bg-slate-800 transition cursor-pointer"
                      >
                        NR-BAG-2019-3321 (منتهي)
                      </button>
                    </div>

                    {/* Scan Result Result Box */}
                    {scannedNurseResult && (
                      <div className={`p-3.5 rounded-2xl border backdrop-blur-md space-y-2.5 text-xs shadow-xl ${
                        scannedNurseResult.found && scannedNurseResult.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/80 border-rose-500/60 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      }`}>
                        <div className="flex items-center justify-between font-black">
                          <span className="text-xs">{scannedNurseResult.message}</span>
                          <span className="font-mono text-[10px] bg-slate-900/90 px-2 py-0.5 rounded-md border border-white/15">
                            {scannedNurseResult.status}
                          </span>
                        </div>

                        {scannedNurseResult.found && scannedNurseResult.nurse && (
                          <div className="space-y-1.5 pt-1.5 border-t border-white/10">
                            <p className="font-extrabold text-white text-xs">{scannedNurseResult.nurse.fullName}</p>
                            <p className="text-[10px] text-slate-200">العنوان: <span className="font-bold text-white">{scannedNurseResult.nurse.specializedTitle}</span></p>
                            <p className="text-[10px] text-slate-200">تاريخ الانتهاء: <span className="font-bold text-white">{scannedNurseResult.nurse.licenseExpiryDate}</span></p>
                            
                            <button
                              id="pwa-add-nurse-to-checked"
                              onClick={() => handleAddNurseToCheckedList(scannedNurseResult.nurse)}
                              className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black py-2 rounded-xl text-xs hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                              + إدراج الممرض بجدول الكوادر المفحوصة
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checked Nurses List */}
                  {checkedNurses.length > 0 && (
                    <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 space-y-2.5 shadow-xl ring-1 ring-white/5">
                      <h4 className="font-black text-white text-xs">الكوادر المفحوصة في هذه الجولة ({checkedNurses.length}):</h4>
                      {checkedNurses.map((n) => (
                        <div key={n.id} className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs flex items-center justify-between shadow-sm">
                          <div>
                            <span className="font-extrabold text-white block">{n.fullName}</span>
                            <span className="text-slate-300 font-mono text-[10px]">{n.syndicateId}</span>
                          </div>
                          <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-lg font-black text-[10px]">
                            ✓ مفحوص
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LIVE SITE PHOTOS */}
              {pwaTab === 'PHOTOS' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-white text-xs">التوثيق المصور الميداني</h4>
                      <p className="text-[10px] text-slate-300 font-medium">صور العيادة، الأجهزة، والشهادات</p>
                    </div>
                    <button
                      id="pwa-add-photo-btn"
                      onClick={handleAddPhoto}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>التقاط صورة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {photos.map((url, idx) => (
                      <div key={idx} className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900/80 aspect-video group shadow-lg backdrop-blur-md">
                        <img src={url} alt={`Site photo ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 backdrop-blur-md p-1.5 text-[9px] font-mono font-bold text-amber-300 flex justify-between items-center border-t border-white/10">
                          <span>Photo #{idx + 1}</span>
                          <button
                            onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: VIOLATIONS & PENALTIES */}
              {pwaTab === 'VIOLATIONS' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-3">
                    <h4 className="font-black text-rose-400 flex items-center gap-1.5 text-xs border-b border-white/10 pb-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      رصد وتوثيق المخالفات
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold text-[11px]">تصنيف المخالفة:</label>
                        <select
                          id="pwa-viol-type"
                          value={newViolType}
                          onChange={(e) => setNewViolType(e.target.value)}
                          className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white rounded-xl p-2 font-bold text-xs focus:outline-none focus:border-rose-400"
                        >
                          <option value="UNLICENSED_STAFF">تشغيل كوادر غير تمريضية / غير نقابية</option>
                          <option value="EXPIRED_SYNDICATE_CARD">انتهاء هوية الانتساب النقابي للممرض</option>
                          <option value="EXPIRED_FACILITY_LICENSE">انتهاء ترخيص الفتح والمنشأة</option>
                          <option value="SANITATION_DEFECT">خرق الاشتراطات البيئية والتخلص من النفايات</option>
                          <option value="UNAUTHORIZED_PROCEDURE">إجراء مداخلات طبية غير مصرح بها</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-bold text-[11px]">تنسيب العقوبة:</label>
                        <select
                          id="pwa-viol-severity"
                          value={newViolSeverity}
                          onChange={(e) => setNewViolSeverity(e.target.value)}
                          className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white rounded-xl p-2 font-bold text-xs focus:outline-none focus:border-rose-400"
                        >
                          <option value="WARNING">توجيه إنذار رسمي</option>
                          <option value="FINE">فرض غرامة مالية نقابية</option>
                          <option value="INVESTIGATION_COMMITTEE">إحالة إلى لجنة التحقيق النقابية</option>
                          <option value="TEMPORARY_CLOSURE">توصية بالإغلاق المؤقت للمنشأة</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1 font-bold text-[11px]">وصف الواقعة:</label>
                        <input
                          id="pwa-viol-desc"
                          type="text"
                          value={newViolDesc}
                          onChange={(e) => setNewViolDesc(e.target.value)}
                          placeholder="اكتب ملاحظة المخالفة بالتفصيل..."
                          className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white rounded-xl p-2 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-300 font-bold text-[11px]">الغرامة (د.ع):</span>
                          <input
                            id="pwa-viol-fine"
                            type="number"
                            value={newViolFine}
                            onChange={(e) => setNewViolFine(Number(e.target.value))}
                            className="w-28 bg-slate-900/80 backdrop-blur-md border border-white/15 text-amber-300 rounded-xl p-1.5 font-mono text-center font-bold text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <button
                          id="pwa-add-viol-btn"
                          type="button"
                          onClick={handleAddViolation}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-black px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow-md cursor-pointer"
                        >
                          + إضافة المخالفة
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Violations List */}
                  <div className="space-y-4">
                    {historicalViolation && (
                      <div className="p-3.5 rounded-2xl bg-rose-950/50 backdrop-blur-xl border-2 border-rose-500/60 mb-4 animate-in slide-in-from-top shadow-xl ring-1 ring-rose-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                          <h4 className="font-black text-rose-300 text-sm">{historicalViolation.type}</h4>
                        </div>
                        <p className="text-xs text-rose-100 mb-3 leading-relaxed">{historicalViolation.desc}</p>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-rose-400/50 bg-rose-900/20 rounded-2xl p-3 cursor-pointer transition hover:bg-rose-900/30">
                          {historicalViolationResolved ? <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-400" /> : <Camera className="w-6 h-6 mb-1 text-rose-300" />}
                          <span className="text-xs text-center font-extrabold text-white">{historicalViolationResolved ? 'تم إرفاق الإثبات بنجاح ✓' : 'التقط صورة لإثبات المعالجة (إجباري)'}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            if(e.target.files && e.target.files.length > 0) {
                              setHistoricalViolationResolved(true);
                              alert('تم إرفاق صورة معالجة المخالفة بنجاح.');
                            }
                          }} />
                        </label>
                      </div>
                    )}

                    {violations.length > 0 && (
                      <div className="space-y-2">
                        {violations.map((v, i) => (
                          <div key={i} className="bg-rose-950/60 backdrop-blur-md border border-rose-500/40 text-rose-200 p-2.5 rounded-xl text-xs flex items-center justify-between shadow-sm">
                            <div>
                              <span className="font-extrabold text-white block">{v.violationType}</span>
                              <span className="text-slate-200 text-[11px]">{v.description}</span>
                            </div>
                            <span className="font-mono bg-rose-900/90 text-rose-200 px-2 py-0.5 rounded-md font-bold text-[10px] border border-rose-600 shrink-0">
                              {v.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: SIGNATURES & FINAL SUBMISSION */}
              {pwaTab === 'SIGNATURE' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 space-y-3.5 shadow-xl ring-1 ring-white/5">
                    <h4 className="font-black text-amber-300 flex items-center gap-1.5 text-xs border-b border-white/10 pb-2">
                      <PenTool className="w-4 h-4 text-emerald-400" />
                      التوقيع الإلكتروني والاعتماد الميداني
                    </h4>

                    {/* Facility Safety Checklist Summary Preview */}
                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-extrabold text-xs flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          خلاصة فحص السلامة (Safety Checklist):
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          safetyChecklist.hasAutoclaveSterilizer && safetyChecklist.hasSafetyBox && !safetyChecklist.hasExpiredMedications && !safetyChecklist.hasUnlicensedForeignStaff && !safetyChecklist.isExceedingScopeOfPractice
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                            : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                        }`}>
                          {safetyChecklist.hasAutoclaveSterilizer && safetyChecklist.hasSafetyBox && !safetyChecklist.hasExpiredMedications && !safetyChecklist.hasUnlicensedForeignStaff && !safetyChecklist.isExceedingScopeOfPractice
                            ? '✓ معايير السلامة سليمة'
                            : '⚠️ رصد بنود غير مطابقة'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold">
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${safetyChecklist.hasAutoclaveSterilizer ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30' : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'}`}>
                          <span>{safetyChecklist.hasAutoclaveSterilizer ? '✓' : '✗'}</span> جهاز تعقيم فعال
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${safetyChecklist.hasSafetyBox ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30' : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'}`}>
                          <span>{safetyChecklist.hasSafetyBox ? '✓' : '✗'}</span> صندوق الحوادث الحادة
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${!safetyChecklist.hasExpiredMedications ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30' : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'}`}>
                          <span>{!safetyChecklist.hasExpiredMedications ? '✓' : '✗'}</span> سلامة الأدوية والعقاقير
                        </div>
                        <div className={`p-1.5 rounded-lg flex items-center gap-1.5 ${!safetyChecklist.hasUnlicensedForeignStaff ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30' : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'}`}>
                          <span>{!safetyChecklist.hasUnlicensedForeignStaff ? '✓' : '✗'}</span> خلو من عمالة غير مرخصة
                        </div>
                        <div className={`col-span-2 p-1.5 rounded-lg flex items-center gap-1.5 ${!safetyChecklist.isExceedingScopeOfPractice ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30' : 'text-rose-300 bg-rose-950/40 border border-rose-500/30'}`}>
                          <span>{!safetyChecklist.isExceedingScopeOfPractice ? '✓' : '✗'}</span> الالتزام بحدود الصلاحية التمريضية
                        </div>
                      </div>
                    </div>

                    {/* Inspector Signature Box */}
                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-1.5 shadow-sm">
                      <span className="text-white font-extrabold text-[11px] block">توقيع المفتش رئيس اللجنة ({currentUser.name}):</span>
                      <div
                        onClick={() => setInspectorSigned(true)}
                        className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition ${
                          inspectorSigned
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                            : 'bg-slate-950/70 border-white/20 text-slate-400 hover:border-amber-400'
                        }`}
                      >
                        {inspectorSigned ? (
                          <span className="font-serif italic font-bold text-sm tracking-widest text-emerald-300">
                            ✓ Signed by {currentUser.name}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-300">انقر هنا للتوقيع الرقمي للمفتش</span>
                        )}
                      </div>
                    </div>

                    {/* Facility Owner Signature Box */}
                    <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 space-y-1.5 shadow-sm">
                      <span className="text-white font-extrabold text-[11px] block">توقيع المسؤول الفني للعيادة ({targetFacility.ownerName}):</span>
                      <div
                        onClick={() => setFacilitySigned(true)}
                        className={`h-16 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition ${
                          facilitySigned
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md'
                            : 'bg-slate-950/70 border-white/20 text-slate-400 hover:border-amber-400'
                        }`}
                      >
                        {facilitySigned ? (
                          <span className="font-serif italic font-bold text-sm tracking-widest text-emerald-300">
                            ✓ Signed by {targetFacility.ownerName}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-300">انقر هنا لتوقيع مسؤول العيادة</span>
                        )}
                      </div>
                    </div>

                    {/* Final Action Selector */}
                    <div>
                      <label className="text-slate-300 block mb-1 font-bold text-[11px]">التوصية النهائية للجنة الكشف:</label>
                      <select
                        id="pwa-final-action"
                        value={recommendedAction}
                        onChange={(e) => setRecommendedAction(e.target.value)}
                        className="w-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-amber-300 font-extrabold rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="PASS">استيفاء الشروط (تفتيش ناجح)</option>
                        <option value="WARNING_ISSUED">إصدار إنذار رسمي لتصحيح الملاحظات</option>
                        <option value="FINE_RECOMMENDED">فرض غرامة مالية نقابية</option>
                        <option value="REFERRAL_TO_INVESTIGATION">إحالة فورية للجنة التحقيق والنقيب</option>
                        <option value="TEMPORARY_CLOSURE">التوصية بالإغلاق المؤقت للمنشأة</option>
                      </select>
                    </div>

                    {/* Submit Report Button */}
                    <button
                      id="pwa-submit-final-btn"
                      onClick={handleSubmitReportForm}
                      disabled={isSubmitting || (historicalViolation && !historicalViolationResolved)}
                      className={`w-full font-black py-3 rounded-xl text-xs transition shadow-xl flex items-center justify-center gap-2 cursor-pointer ${(isSubmitting || (historicalViolation && !historicalViolationResolved)) ? "bg-slate-700 text-slate-500" : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-950/50 active:scale-95"}`}
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'جاري التشفير والإرسال...' : (historicalViolation && !historicalViolationResolved) ? 'يرجى إرفاق صورة معالجة المخالفة أولاً' : 'إرسال تقرير الكشف النهائي'}</span>
                    </button>

                    {/* Result Banner */}
                    {submittedResult && (
                      <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/60 p-3 rounded-xl text-emerald-100 text-xs space-y-1.5 animate-in fade-in shadow-xl">
                        <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {submittedResult.message}
                        </div>
                        <p className="font-mono text-slate-300 text-[10px]">رقم التقرير: {submittedResult.reportId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: OPERATIONS CHAT & DIRECT DISPATCH (غرفة العمليات وشات المفتش) */}
              {pwaTab === 'CHAT' && (
                <div className="space-y-3 animate-in fade-in flex flex-col h-full min-h-[440px]" id="pwa-chat-tab-panel">
                  {/* Chat Room Top Status */}
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3 rounded-2xl border border-white/10 space-y-2.5 shadow-xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-black text-xs text-white flex items-center gap-1.5">
                            <span>غرفة العمليات والتواصل الميداني</span>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                              مباشر
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-300 font-medium">اتصال راديوي مشفر مع القيادة العامة والفروع</p>
                        </div>
                      </div>
                      {onOpenFullChat && (
                        <button
                          type="button"
                          onClick={onOpenFullChat}
                          className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-md text-amber-300 p-2 rounded-xl text-[10px] font-black flex items-center gap-1 border border-white/10 transition cursor-pointer shadow-sm active:scale-95"
                          title="الانتقال للشاشة الموسعة"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">الشاشة الكاملة</span>
                        </button>
                      )}
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 text-[10px] pt-1.5 border-t border-white/10">
                      <span className="text-slate-300 font-bold">التصفية:</span>
                      <button
                        type="button"
                        onClick={() => setChatTabFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          chatTabFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-800/80 backdrop-blur-md text-slate-300 hover:bg-slate-700/80 border border-white/10'
                        }`}
                      >
                        كافة الرسائل ({chatMessages.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatTabFilter('URGENT')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                          chatTabFilter === 'URGENT' ? 'bg-red-500 text-white font-black shadow-md' : 'bg-slate-800/80 backdrop-blur-md text-slate-300 hover:bg-slate-700/80 border border-white/10'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3 text-red-400" />
                        <span>النداءات العاجلة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChatTabFilter('BROADCAST')}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          chatTabFilter === 'BROADCAST' ? 'bg-blue-600 text-white font-black shadow-md' : 'bg-slate-800/80 backdrop-blur-md text-slate-300 hover:bg-slate-700/80 border border-white/10'
                        }`}
                      >
                        التعميمات المركزية
                      </button>
                    </div>
                  </div>

                  {/* QUICK DISPATCH BUTTONS FOR FIELD INSPECTOR */}
                  <div className="bg-slate-900/70 backdrop-blur-xl p-3 rounded-2xl border border-white/10 space-y-2 shadow-xl ring-1 ring-white/5">
                    <span className="text-[11px] font-black text-amber-300 block flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      برقيات ونداءات المفتش الميداني السريعة:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickDispatch('SOS')}
                        className="bg-red-950/80 hover:bg-red-900/90 backdrop-blur-md border border-red-500/50 text-red-200 p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition text-right shadow-sm active:scale-95"
                      >
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                        <span className="truncate">🚨 طلب دعم أمني فوري</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDispatch('ARRIVED')}
                        className="bg-emerald-950/80 hover:bg-emerald-900/90 backdrop-blur-md border border-emerald-500/50 text-emerald-200 p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition text-right shadow-sm active:scale-95"
                      >
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">📍 إشعار وصول للموقع</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDispatch('LEGAL')}
                        className="bg-blue-950/80 hover:bg-blue-900/90 backdrop-blur-md border border-blue-500/50 text-blue-200 p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition text-right shadow-sm active:scale-95"
                      >
                        <FileCheck className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">⚖️ استفسار نقابي قانوني</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickDispatch('OBSTRUCTION')}
                        className="bg-amber-950/80 hover:bg-amber-900/90 backdrop-blur-md border border-amber-500/50 text-amber-200 p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition text-right shadow-sm active:scale-95"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">⚠️ رصد ممانعة تفتيش</span>
                      </button>
                    </div>
                  </div>

                  {/* CHAT MESSAGES STREAM */}
                  <div className="bg-slate-900/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 flex-1 overflow-y-auto max-h-[230px] space-y-2.5 shadow-inner">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8 text-slate-300 text-xs">
                        <Radio className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                        <p className="font-bold">لا توجد رسائل في الغرفة حالياً.</p>
                        <p className="text-[10px] text-slate-400">أرسل نداءك أو استفسارك الميداني الآن.</p>
                      </div>
                    ) : (
                      chatMessages
                        .filter(msg => {
                          if (chatTabFilter === 'URGENT') return msg.type === 'URGENT_DISPATCH';
                          if (chatTabFilter === 'BROADCAST') return msg.type === 'CENTRAL_BROADCAST' || msg.isNationwideBroadcast;
                          return true;
                        })
                        .map((msg, idx) => {
                          const isMe = msg.senderId === currentUser.id;
                          const isUrgent = msg.type === 'URGENT_DISPATCH';
                          const isBroadcast = msg.type === 'CENTRAL_BROADCAST' || msg.isNationwideBroadcast;

                          return (
                            <div 
                              key={msg.id || idx}
                              className={`p-3 rounded-2xl text-xs space-y-1.5 transition ${
                                isUrgent
                                  ? 'bg-rose-950/85 backdrop-blur-md border-2 border-rose-500 text-rose-100 shadow-md'
                                  : isBroadcast
                                  ? 'bg-amber-950/80 backdrop-blur-md border border-amber-500/60 text-amber-100 shadow-sm'
                                  : isMe
                                  ? 'bg-emerald-950/70 backdrop-blur-md border border-emerald-600/50 text-emerald-100 mr-3 shadow-sm'
                                  : 'bg-slate-900/80 backdrop-blur-md border border-white/15 text-slate-100 ml-3 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-1.5 font-bold">
                                  {isUrgent && <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />}
                                  {isBroadcast && <Radio className="w-3.5 h-3.5 text-amber-400" />}
                                  <span className={isMe ? 'text-emerald-300 font-extrabold' : isBroadcast ? 'text-amber-300 font-extrabold' : 'text-white font-extrabold'}>
                                    {isMe ? 'أنا (المفتش الميداني)' : msg.senderName}
                                  </span>
                                  {msg.senderRoleTitle && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 font-normal border border-white/5">
                                      {msg.senderRoleTitle}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                              </div>

                              <p className="text-[11px] leading-relaxed whitespace-pre-line text-slate-100 font-medium">
                                {msg.messageText}
                              </p>

                              <div className="flex items-center justify-between text-[9px] text-slate-300 pt-1 border-t border-white/10">
                                <span>{msg.provinceName || 'عموم العراق'}</span>
                                {isUrgent && (
                                  <span className="text-rose-400 font-black">⚠️ برقية عاجلة جداً</span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    )}
                    <div ref={chatMessagesEndRef} />
                  </div>

                  {/* MESSAGE INPUT FORM */}
                  <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 space-y-2.5 shadow-xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={isUrgentMessage}
                          onChange={(e) => setIsUrgentMessage(e.target.checked)}
                          className="rounded text-rose-500 focus:ring-rose-400 bg-slate-900 border-white/20"
                        />
                        <span className={isUrgentMessage ? 'text-rose-400 font-black' : ''}>🚨 تصنيف كبرقية عاجلة / طوارئ</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="checkbox"
                          checked={includeGpsInMessage}
                          onChange={(e) => setIncludeGpsInMessage(e.target.checked)}
                          className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20"
                        />
                        <span>📍 إرفاق موقع العيادة والـ GPS</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        id="pwa-chat-input-text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendFieldChatMessage();
                          }
                        }}
                        placeholder="اكتب رسالة أو بلاغ لغرفة العمليات المركزية..."
                        className="flex-1 bg-slate-900/90 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 font-medium"
                      />
                      <button
                        type="button"
                        id="pwa-chat-send-btn"
                        onClick={() => handleSendFieldChatMessage()}
                        disabled={!chatInput.trim()}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                          chatInput.trim()
                            ? isUrgentMessage
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-emerald-500 to-amber-500 text-slate-950 shadow-lg'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {/* FEATURE 3: QUICK ACTION BUTTONS (DROP A PIN & OPERATIONS CHAT) */}
            <div className="pt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                id="pwa-unregistered-fab"
                onClick={() => setShowUnregModal(true)}
                className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold py-2 px-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition border border-red-400/40 active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="truncate">رصد عيادة غير مسجلة</span>
              </button>

              <button
                type="button"
                id="pwa-bottom-chat-btn"
                onClick={() => setPwaTab('CHAT')}
                className={`w-full font-extrabold py-2 px-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition border active:scale-95 ${
                  pwaTab === 'CHAT'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black ring-2 ring-amber-400/40'
                    : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 hover:from-emerald-600 hover:to-cyan-600 text-white border-emerald-400/40'
                }`}
                title="شات غرفة العمليات"
              >
                <Radio className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">شات غرفة العمليات</span>
                <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full shrink-0 animate-pulse">
                  مباشر
                </span>
              </button>
            </div>

              {/* TAB 8: ACCOUNT PROFILE */}
              {pwaTab === 'ACCOUNT' && (
                <div className="space-y-4 animate-in slide-in-from-right relative z-0 h-full">
                  <AccountProfile user={currentUser} isMobile={true} />
                </div>
              )}
              {pwaTab === 'MORE' && (
                <div className="space-y-4 animate-in fade-in flex flex-col h-full relative z-0 pb-16">
                  
                  {/* Top Header Card */}
                  <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <h3 className="font-black text-white text-xs sm:text-sm">القائمة الشاملة والخدمات الميدانية</h3>
                          <p className="text-[10px] text-slate-300 font-medium">الوصول لكافة التبويبات وإمكانية التثبيت بالرئيسية</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCustomizingTools(true)}
                        className="bg-slate-800/90 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
                        title="تخصيص ترتيب وظهور أدوات الشاشة الرئيسية"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>تخصيص الواجهة</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950/60 border border-white/5 rounded-xl p-2 text-[10px]">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3 text-amber-400" />
                        الأدوات المثبتة بالرئيسية:
                      </span>
                      <span className="font-black text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                        {quickActions.length} من أصل 12
                      </span>
                    </div>
                  </div>

                  {/* =====================================================
                      المجموعة 1: 👤 الملف التعريفي والزون الميداني
                      ===================================================== */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-2.5">
                    <div className="text-right flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">الملف التعريفي والزون الميداني</span>
                      <span className="text-[10px] text-slate-400 font-bold">👤 الهوية والنطاق</span>
                    </div>

                    {/* 1.1 حساب المفتش والباج الرقمي */}
                    <div className="bg-slate-900/80 hover:bg-slate-800/90 transition-all border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => setPwaTab("ACCOUNT")}>
                        <div className="w-9 h-9 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-white text-xs">إدارة الحساب والباج الرقمي</h4>
                          <p className="text-[10px] text-slate-300 font-medium">الصورة، الهاتف، والاعتماد النقابي</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('ACCOUNT'); }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                            quickActions.includes('ACCOUNT')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                          }`}
                        >
                          {quickActions.includes('ACCOUNT') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          <span>{quickActions.includes('ACCOUNT') ? 'مثبت' : 'تثبيت'}</span>
                        </button>
                        <button onClick={() => setPwaTab("ACCOUNT")} className="p-1 text-slate-400 hover:text-white">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 1.2 الزون الخاص بي (المحافظة، القضاء، المنطقة) */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">الزون الخاص بي</h4>
                            <p className="text-[10px] text-slate-300 font-medium">المحافظة، القضاء، والمنطقة الجغرافية</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('MY_ZONE'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('MY_ZONE')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('MY_ZONE') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('MY_ZONE') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2.5 text-right">
                        {/* المحافظة */}
                        <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl">
                          <span className="text-[10px] font-black text-teal-400 block mb-1">📍 المحافظة التفتيشية:</span>
                          <select 
                            value={zoneGovernorate} 
                            onChange={(e) => setZoneGovernorate(e.target.value)}
                            className="w-full bg-slate-950 border border-white/15 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none focus:border-teal-400"
                          >
                            {['بغداد', 'البصرة', 'أربيل', 'النجف الأشرف', 'كربلاء المقدسة', 'نينوى', 'كركوك', 'بابل', 'ذي قار', 'ميسان', 'ديالى', 'صلاح الدين', 'الأنبار', 'واسط', 'المثنى', 'القادسية', 'دهوك', 'السليمانية'].map(gov => (
                              <option key={gov} value={gov}>{gov}</option>
                            ))}
                          </select>
                        </div>

                        {/* القضاء */}
                        <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl">
                          <span className="text-[10px] font-black text-cyan-400 block mb-1">🏛️ القضاء / الرقعة:</span>
                          <select
                            value={zoneDistrict}
                            onChange={(e) => setZoneDistrict(e.target.value)}
                            className="w-full bg-slate-950 border border-white/15 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                          >
                            {['الرصافة الأولى', 'الرصافة الثانية', 'الكرخ الأولى', 'الكرخ الثانية', 'مدينة الصدر', 'الأعظمية', 'الكاظمية', 'المنصور', 'الدورة', 'الكرادة الشرقية', 'المدائن', 'المحمودية', 'التاجي'].map(dist => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>

                        {/* المنطقة والنطاق الجغرافي */}
                        <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl">
                          <span className="text-[10px] font-black text-emerald-400 block mb-1">🗺️ المنطقة ونطاق التغطية:</span>
                          <input
                            type="text"
                            value={zoneArea}
                            onChange={(e) => setZoneArea(e.target.value)}
                            className="w-full bg-slate-950 border border-white/15 rounded-lg p-1.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-400"
                          />
                          <div className="mt-2 flex items-center justify-between text-[9px] text-slate-300 font-mono bg-slate-950/60 p-1.5 rounded-lg border border-white/5">
                            <span>Lat: {inspectorLat.toFixed(6)}</span>
                            <span>Lng: {inspectorLng.toFixed(6)}</span>
                            <span className="text-emerald-400 font-bold">نطاق 5 كم ✓</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => alert(`تم تثبيت الزون الميداني: ${zoneGovernorate} - ${zoneDistrict} - ${zoneArea}`)}
                          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black py-2 rounded-xl text-xs shadow-md active:scale-95 transition cursor-pointer"
                        >
                          تثبيت وحفظ إحداثيات الزون
                        </button>
                      </div>
                    </details>
                  </div>

                  {/* =====================================================
                      المجموعة 2: 🔍 العمليات والمهام وجولات التفتيش
                      ===================================================== */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-2.5">
                    <div className="text-right flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">العمليات والمهام وجولات التفتيش</span>
                      <span className="text-[10px] text-slate-400 font-bold">🔍 الميدان والضبط</span>
                    </div>

                    {/* 2.1 المهام (مكتملة، حالية، مستقبلية) */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">المهام والتكليفات الميدانية</h4>
                            <p className="text-[10px] text-slate-300 font-medium">مهام مكتملة، حالية، مستقبلية</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('TASKS_MORE'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('TASKS_MORE')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('TASKS_MORE') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('TASKS_MORE') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right">
                        {/* مهام مكتملة */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              مهام مكتملة ومغلقة (12)
                            </span>
                            <p className="text-[9px] text-slate-300">تم اعتماد محاضرها والتوقيع الرقمي وإرسالها للنقابة</p>
                          </div>
                          <button 
                            onClick={() => {
                              loadFacilityHistory();
                              setShowHistoryModal(true);
                            }}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/40 cursor-pointer"
                          >
                            عرض الأرشيف
                          </button>
                        </div>

                        {/* مهام حالية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 animate-spin" />
                              مهام حالية قيد التنفيذ (4)
                            </span>
                            <p className="text-[9px] text-slate-300">المنشأة المستهدفة: {targetFacility?.name || 'مستشفى السلام'}</p>
                          </div>
                          <button 
                            onClick={() => setPwaTab('CHECKLIST')}
                            className="bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm hover:bg-amber-400 cursor-pointer"
                          >
                            بدء الكشف الفوري
                          </button>
                        </div>

                        {/* مهام مستقبلية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xs font-black text-blue-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              مهام مستقبلية مجدولة (6)
                            </span>
                            <p className="text-[9px] text-slate-300">مجدولة للأسبوع القادم بانتظار إشعار الانطلاق</p>
                          </div>
                          <button 
                            onClick={() => alert('جدول الأسبوع القادم:\n1. عيادة البسمة التخصصية - الأحد 9:00 ص\n2. مركز الحياة للتمريض - الإثنين 10:30 ص\n3. مجمع النور الجراحي - الثلاثاء 1:00 م')}
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[9px] font-black px-2.5 py-1 rounded-lg border border-blue-500/40 cursor-pointer"
                          >
                            استعراض الجدول
                          </button>
                        </div>
                      </div>
                    </details>

                    {/* 2.2 ملف الكشف (كشوفات سابقة، حالية، مستقبلية) */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">ملف الكشف والتقييم</h4>
                            <p className="text-[10px] text-slate-300 font-medium">كشوفات سابقة، حالية، مستقبلية</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('INSPECT_FILES'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('INSPECT_FILES')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('INSPECT_FILES') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('INSPECT_FILES') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right">
                        {/* كشوفات سابقة */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-slate-200">📁 كشوفات سابقة</h5>
                            <p className="text-[9px] text-slate-400">تقارير السلامة ومحاضر التفتيش المؤرشفة</p>
                          </div>
                          <button 
                            onClick={() => {
                              loadFacilityHistory();
                              setShowHistoryModal(true);
                            }}
                            className="text-[9px] font-black bg-slate-800 text-emerald-300 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                          >
                            فتح الأرشيف
                          </button>
                        </div>

                        {/* كشوفات حالية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-emerald-400">📋 كشوفات حالية</h5>
                            <p className="text-[9px] text-slate-300">الاستمارة النشطة: {currentComplianceScore}% نسبة الامتثال</p>
                          </div>
                          <button 
                            onClick={() => setPwaTab('CHECKLIST')}
                            className="text-[9px] font-black bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                          >
                            فتح الاستمارة
                          </button>
                        </div>

                        {/* كشوفات مستقبلية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-slate-200">🗓️ كشوفات مستقبلية</h5>
                            <p className="text-[9px] text-slate-400">مسودات معايير الكشف الدوري والمطابقة</p>
                          </div>
                          <button 
                            onClick={() => alert('تم إعداد قوائم الفحص والمعايير التمريضية المعتمدة للجولات القادمة بنجاح.')}
                            className="text-[9px] font-black bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                          >
                            مراجعة المسودة
                          </button>
                        </div>
                      </div>
                    </details>

                    {/* 2.3 ملف التفتيش (جولات تفتيشية سابقة، حالية، مستقبلية) */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">ملف التفتيش والرقابة</h4>
                            <p className="text-[10px] text-slate-300 font-medium">جولات تفتيشية سابقة، حالية، مستقبلية</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('PATROL_FILES'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('PATROL_FILES')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('PATROL_FILES') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('PATROL_FILES') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right">
                        {/* جولات سابقة */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-slate-200">🔍 جولات تفتيشية سابقة</h5>
                            <p className="text-[9px] text-slate-400">سجل الزيارات الميدانية ومحاضر الضبط المعتمدة</p>
                          </div>
                          <button 
                            onClick={() => {
                              loadFacilityHistory();
                              setShowHistoryModal(true);
                            }}
                            className="text-[9px] font-black bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                          >
                            سجل الجولات
                          </button>
                        </div>

                        {/* جولات حالية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/40 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-rose-400">⚡ جولات تفتيشية حالية</h5>
                            <p className="text-[9px] text-slate-300">الجولة النشطة: {targetFacility?.name} (GPS متصل)</p>
                          </div>
                          <button 
                            onClick={() => setPwaTab('MISSION')}
                            className="text-[9px] font-black bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                          >
                            متابعة الجولة
                          </button>
                        </div>

                        {/* جولات مستقبلية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-slate-200">📌 جولات تفتيشية مستقبلية</h5>
                            <p className="text-[9px] text-slate-400">خطة الرقابة الشهرية والمسار المقترح</p>
                          </div>
                          <button 
                            onClick={() => alert('خطة الانتشار: تم توزيع 15 منشأة جديدة على قاطع الرصافة للأسبوعين القادمين.')}
                            className="text-[9px] font-black bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-white/10 cursor-pointer"
                          >
                            عرض الخطة
                          </button>
                        </div>
                      </div>
                    </details>

                    {/* الأدوات المباشرة داخل العمليات */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* استمارة الكشف */}
                      <button 
                        onClick={() => setPwaTab('CHECKLIST')}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">استمارة الكشف</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('CHECKLIST'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('CHECKLIST') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </button>

                      {/* فحص هويات QR */}
                      <button 
                        onClick={() => setPwaTab('SCANNER')}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">تدقيق الكوادر QR</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('SCANNER'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('SCANNER') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </button>

                      {/* سجل المخالفات */}
                      <button 
                        onClick={() => setPwaTab('VIOLATIONS')}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">سجل المخالفات</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('VIOLATIONS'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('VIOLATIONS') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </button>

                      {/* أدلة الصور الميدانية */}
                      <button 
                        onClick={() => setPwaTab('PHOTOS')}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">أدلة الصور</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('PHOTOS'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('PHOTOS') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </button>

                      {/* التوقيع الرقمي */}
                      <button 
                        onClick={() => setPwaTab('SIGNATURE')}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                            <PenTool className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">التوقيع الرقمي</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('SIGNATURE'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('SIGNATURE') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </button>

                      {/* سجل CRM */}
                      <button 
                        onClick={() => { loadFacilityHistory(); setShowHistoryModal(true); }}
                        className="bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 p-2.5 rounded-xl flex items-center justify-between group active:scale-95 cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                            <History className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold text-white">سجل CRM</span>
                        </div>
                        <ChevronLeft className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>

                    {/* زر رصد عيادة وهمية */}
                    <button
                      type="button"
                      onClick={() => setShowUnregModal(true)}
                      className="w-full bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/40 hover:to-rose-600/40 border border-red-500/40 p-2.5 rounded-xl flex items-center justify-between group cursor-pointer transition shadow-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40 shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-300 animate-pulse" />
                        </div>
                        <div className="text-right">
                          <h5 className="text-xs font-black text-red-200">رصد كيان وهمي أو غير مسجل (Drop Pin)</h5>
                          <p className="text-[9px] text-red-300/80">توثيق إحداثيات وموقع عيادة مخالفة غير مسجلة فورياً</p>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-red-300" />
                    </button>
                  </div>

                  {/* =====================================================
                      المجموعة 3: 🏛️ الخدمات الإلكترونية (النقابة المركزية)
                      ===================================================== */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-2.5">
                    <div className="text-right flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">الخدمات الإلكترونية (النقابة)</span>
                      <span className="text-[10px] text-slate-400 font-bold">🏛️ معاملات وترخيص</span>
                    </div>

                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md" open>
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">منظومة الخدمات النقابية الرقمية</h4>
                            <p className="text-[10px] text-slate-300 font-medium">هويات، إجازات ممارسة، وتدقيق قاعدة البيانات</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('SERVICES'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('SERVICES')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('SERVICES') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('SERVICES') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2.5 text-right">
                        
                        {/* 3.1 تقديم على هوية / تجديد هوية */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-cyan-300 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                              تقديم على هوية / تجديد هوية
                            </h5>
                            <p className="text-[9px] text-slate-300">إصدار بطاقة الهوية النقابية الإلكترونية الذكية</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveServiceModal('ID_CARD')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                          >
                            تقديم الآن
                          </button>
                        </div>

                        {/* 3.2 تقديم على إجازة ممارسة مهنة / تجديد */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                          <div className="text-right">
                            <h5 className="text-xs font-black text-emerald-300 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-emerald-400" />
                              تقديم على إجازة ممارسة مهنة / تجديد
                            </h5>
                            <p className="text-[9px] text-slate-300">ترخيص مزاولة التمريض في القطاعين العام والخاص</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveServiceModal('PRACTICE_LICENSE')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm cursor-pointer"
                          >
                            طلب ترخيص
                          </button>
                        </div>

                        {/* 3.3 تدقيق هوية (بحث في قاعدة البيانات) */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-blue-300 flex items-center gap-1">
                              <Search className="w-3.5 h-3.5 text-blue-400" />
                              تدقيق هوية (بحث في قاعدة البيانات النقابية)
                            </span>
                            <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/40">سجلات الملاكات</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={serviceSearchId}
                              onChange={(e) => setServiceSearchId(e.target.value)}
                              placeholder="أدخل رقم القيد أو اسم الممرض..."
                              className="flex-1 bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!serviceSearchId.trim()) return;
                                const found = nurses.find(n => n.syndicateId?.toLowerCase().includes(serviceSearchId.trim().toLowerCase()) || n.name?.toLowerCase().includes(serviceSearchId.trim().toLowerCase()));
                                if (found) {
                                  setServiceSearchResult(found);
                                } else {
                                  setServiceSearchResult({
                                    notFound: true,
                                    searched: serviceSearchId
                                  });
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-black shrink-0 cursor-pointer shadow-sm"
                            >
                              بحث
                            </button>
                          </div>

                          {serviceSearchResult && (
                            <div className="p-2 bg-slate-950/90 rounded-lg border border-white/10 text-right animate-in fade-in">
                              {serviceSearchResult.notFound ? (
                                <div className="text-rose-400 text-[10px] font-bold">
                                  ⚠️ لا يوجد قيد مسجل في قاعدة البيانات لـ: "{serviceSearchResult.searched}". يرجى التحقق من الرقم.
                                </div>
                              ) : (
                                <div className="space-y-1 text-[10px]">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-emerald-400">✓ قيد نقابي معتمد وفعال</span>
                                    <span className="font-mono text-slate-300">{serviceSearchResult.syndicateId}</span>
                                  </div>
                                  <div className="text-white font-bold">{serviceSearchResult.name} - {serviceSearchResult.specialty || 'تمريض عام'}</div>
                                  <div className="text-slate-400 text-[9px]">المنشأة: {serviceSearchResult.workplace || 'مسجل رسمياً'}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3.4 التأكد من تقدم المعاملة */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              التأكد من تقدم المعاملة (تتبع المسار النقابي)
                            </span>
                            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40">تتبع حي</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={trackingIdInput}
                              onChange={(e) => setTrackingIdInput(e.target.value)}
                              placeholder="أدخل رقم الإضبارة / رقم الطلب..."
                              className="flex-1 bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!trackingIdInput.trim()) return;
                                setTrackingResult({
                                  code: trackingIdInput,
                                  title: 'معاملة تجديد إجازة ممارسة مهنة',
                                  currentStep: 'مرحلة المصادقة والطباعة',
                                  status: 'جاهزة للاستلام في مقر النقابة العام',
                                  date: '2026-09-11'
                                });
                              }}
                              className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black shrink-0 cursor-pointer shadow-sm"
                            >
                              استعلام
                            </button>
                          </div>

                          {trackingResult && (
                            <div className="p-2 bg-slate-950/90 rounded-lg border border-white/10 text-right animate-in fade-in space-y-1 text-[10px]">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-amber-400">طلب رقم: {trackingResult.code}</span>
                                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                  {trackingResult.currentStep}
                                </span>
                              </div>
                              <p className="text-white font-bold">{trackingResult.title}</p>
                              <p className="text-emerald-300 font-black">الحالة: {trackingResult.status}</p>
                            </div>
                          )}
                        </div>

                      </div>
                    </details>
                  </div>

                  {/* =====================================================
                      المجموعة 4: 📡 المراسلات، الطوارئ واللوائح
                      ===================================================== */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-2.5">
                    <div className="text-right flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider">المراسلات، الطوارئ واللوائح</span>
                      <span className="text-[10px] text-slate-400 font-bold">📡 اتصال وانضباط</span>
                    </div>

                    {/* 4.1 المراسلات والتواصل (نصية، صور، بصمات صوتية، كروبات، تواصل مع مسؤول اللجنة) */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30 shrink-0">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">المراسلات والتواصل الميداني</h4>
                            <p className="text-[10px] text-slate-300 font-medium">نصية، صور، بصمات، كروبات، ومسؤول اللجنة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('COMMUNICATIONS'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('COMMUNICATIONS')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('COMMUNICATIONS') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('COMMUNICATIONS') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>

                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right">
                        {/* رسائل نصية */}
                        <div 
                          onClick={() => setPwaTab('CHAT')}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-sky-400" />
                            <span className="text-xs font-bold text-white">💬 رسائل نصية (برقيات العمليات)</span>
                          </div>
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">فتح الشات</span>
                        </div>

                        {/* صور ووثائق */}
                        <div 
                          onClick={() => setPwaTab('PHOTOS')}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
                        >
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-white">📷 صور ووثائق المخالفات الميدانية</span>
                          </div>
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">إرسال وتوثيق</span>
                        </div>

                        {/* بصمات صوتية */}
                        <div 
                          onClick={() => {
                            setPwaTab('MISSION');
                            handleToggleVoiceNotes();
                          }}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
                        >
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-rose-400" />
                            <span className="text-xs font-bold text-white">🎙️ بصمات صوتية (تسجيل فوري للمحضر)</span>
                          </div>
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">تسجيل صوتي</span>
                        </div>

                        {/* كروبات العمل */}
                        <div 
                          onClick={() => alert('مجموعات العمل النشطة:\n1. كروب لجنة التفتيش المركزية (42 مفتش)\n2. غرفة عمليات قطاع الرصافة (18 عضو)\n3. خلية رصد العيادات غير المرخصة')}
                          className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white">👥 كروبات ومجموعات العمل الميداني</span>
                          </div>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">3 كروبات نشطة</span>
                        </div>

                        {/* تواصل مع مسؤول اللجنة */}
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between">
                          <div className="text-right">
                            <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                              تواصل مباشر مع مسؤول اللجنة
                            </span>
                            <p className="text-[9px] text-slate-300">رئيس لجنة التفتيش النقابية العامة</p>
                          </div>
                          <a
                            href="tel:07700000000"
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            اتصال مباشر
                          </a>
                        </div>
                      </div>
                    </details>

                    {/* 4.2 شات غرفة العمليات الميدانية */}
                    <div className="bg-slate-900/80 hover:bg-slate-800/90 transition-all border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => setPwaTab("CHAT")}>
                        <div className="w-9 h-9 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                          <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-white text-xs">شات غرفة العمليات الميدانية</h4>
                          <p className="text-[10px] text-slate-300 font-medium">بث حي، أوامر العمليات، وتنسيق الإسناد</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('CHAT'); }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                            quickActions.includes('CHAT')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                          }`}
                        >
                          {quickActions.includes('CHAT') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          <span>{quickActions.includes('CHAT') ? 'مثبت' : 'تثبيت'}</span>
                        </button>
                        <button onClick={() => setPwaTab("CHAT")} className="p-1 text-slate-400 hover:text-white">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 4.3 بلاغات الطوارئ واستغاثة SOS */}
                    <div className="bg-gradient-to-r from-red-950/70 to-rose-950/70 border border-red-500/40 p-3 rounded-xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-9 h-9 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40 shrink-0 animate-pulse">
                          <Siren className="w-4 h-4 text-red-300" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-red-200 text-xs">غرفة العمليات وبلاغات الطوارئ (SOS)</h4>
                          <p className="text-[10px] text-red-300/80 font-medium">استغاثة اعتداء أو طارئ مع إحداثيات GPS حية</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('EMERGENCY'); }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                            quickActions.includes('EMERGENCY')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                          }`}
                        >
                          {quickActions.includes('EMERGENCY') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          <span>{quickActions.includes('EMERGENCY') ? 'مثبت' : 'تثبيت'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleTriggerEmergencySOS}
                          className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md active:scale-95 transition cursor-pointer"
                        >
                          إرسال SOS
                        </button>
                      </div>
                    </div>

                    {/* 4.4 لوائح وتعليمات لجنة الانضباط */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">لوائح وتعليمات لجنة الانضباط (INS)</h4>
                            <p className="text-[10px] text-slate-300 font-medium">جدول العقوبات، ضوابط الممارسة، والمسؤوليات</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('DISCIPLINE'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('DISCIPLINE')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('DISCIPLINE') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('DISCIPLINE') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right text-[10px]">
                        <div className="p-2 bg-slate-900/90 rounded-lg border border-white/10">
                          <span className="font-black text-amber-400 block mb-1">⚖️ قانون نقابة التمريض العراقية رقم 4 لسنة 2017:</span>
                          <p className="text-slate-300 leading-relaxed">
                            يحظر ممارسة أي عمل تمريضي أو تضميدي أو فتح عيادة إسعافات أولية دون الحصول على إجازة نافذة الصلاحية صادرة من النقابة، تحت طائلة الغلق الفوري والإحالة للمحاكم المختصة.
                          </p>
                        </div>
                        <div className="p-2 bg-slate-900/90 rounded-lg border border-white/10">
                          <span className="font-black text-rose-400 block mb-1">🚨 جدول المخالفات والغرامات:</span>
                          <ul className="list-disc list-inside text-slate-300 space-y-1">
                            <li>مزاولة دون ترخيص نقابي معلق: غلق فوري وغرامة 500,000 دينار.</li>
                            <li>تشغيل عمالة أجنبية غير مرخصة: إنذار شديد اللهجة وإحالة لوزارة العمل.</li>
                            <li>أدوية منتهية الصلاحية أو محظورة: مصادرة ومحضر ضبط صحي فوري.</li>
                          </ul>
                        </div>
                      </div>
                    </details>

                  </div>

                  {/* =====================================================
                      المجموعة 5: 📦 المزامنة، التقارير والنظام
                      ===================================================== */}
                  <div className="bg-slate-900/70 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-xl ring-1 ring-white/5 space-y-2.5">
                    <div className="text-right flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">المزامنة، التقارير والنظام</span>
                      <span className="text-[10px] text-slate-400 font-bold">📦 أدوات المنظومة</span>
                    </div>

                    {/* 5.1 الذاكرة المحلية والمزامنة السحابية */}
                    <div className="bg-slate-900/80 border border-white/10 p-3 rounded-xl flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-9 h-9 rounded-full bg-teal-500/15 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
                          <RefreshCw className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-white text-xs">الذاكرة المحلية والمزامنة السحابية</h4>
                          <p className="text-[10px] text-slate-300 font-medium">حفظ الكشوفات أوفلاين والمزامنة - نشط 100%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('SYNC'); }}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                            quickActions.includes('SYNC')
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                          }`}
                        >
                          {quickActions.includes('SYNC') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          <span>{quickActions.includes('SYNC') ? 'مثبت' : 'تثبيت'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSyncOfflineQueue}
                          className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-sm cursor-pointer active:scale-95"
                        >
                          مزامنة الآن
                        </button>
                      </div>
                    </div>

                    {/* 5.2 تصدير تقرير الجولة (PDF) وتصدير سجل المهام (Excel) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => window.print()}>
                          <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                            <Printer className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-right">
                            <h5 className="text-[11px] font-black text-white">تصدير PDF</h5>
                            <p className="text-[8px] text-slate-400">محضر رسمي</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('EXPORT_PDF'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('EXPORT_PDF') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="bg-slate-900/80 border border-white/10 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={handleExportExcel}>
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-right">
                            <h5 className="text-[11px] font-black text-white">تصدير Excel</h5>
                            <p className="text-[8px] text-slate-400">سجل المهام</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); togglePinToHome('EXPORT_EXCEL'); }}
                          className={`p-1 rounded-md text-[9px] ${quickActions.includes('EXPORT_EXCEL') ? 'text-amber-400' : 'text-slate-500'}`}
                          title="تثبيت بالرئيسية"
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 5.3 دليل المستخدم الميداني */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-slate-500/15 text-slate-300 flex items-center justify-center border border-white/10 shrink-0">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">دليل المستخدم الميداني</h4>
                            <p className="text-[10px] text-slate-300 font-medium">إرشادات التفتيش، خطوات العمل، والأسئلة الشائعة</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('GUIDE'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('GUIDE')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('GUIDE') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('GUIDE') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/80 border-t border-white/10 space-y-2 text-right text-[10px] leading-relaxed text-slate-300">
                        <p className="font-bold text-white">خطوات جولة التفتيش الرسمية:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300">
                          <li>تسجيل الحضور الجغرافي (Check-in) فور الوصول بحدود المنشأة.</li>
                          <li>إبراز الباج الرقمي للمفتش وطلب مقابلة المدير المفوض أو التمريضي.</li>
                          <li>تدقيق هويات الملاكات بواسطة ماسح الـ QR.</li>
                          <li>فحص بنود السلامة ومعدات التعقيم والأدوية.</li>
                          <li>توثيق أي مخالفة فوتوغرافياً وتحديد تصنيفها.</li>
                          <li>إجراء التوقيع الرقمي للمفتش وصاحب المنشأة وإغلاق الزيارة.</li>
                        </ol>
                      </div>
                    </details>

                    {/* 5.4 المظهر وتخصيص العرض */}
                    <details className="group [&_summary::-webkit-details-marker]:hidden bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-md">
                      <summary className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/60 transition">
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="w-9 h-9 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                            <Palette className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <h4 className="font-extrabold text-white text-xs">المظهر وتخصيص العرض</h4>
                            <p className="text-[10px] text-slate-300 font-medium">الثيمات، الألوان وحجم الخط الأساسي</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); togglePinToHome('SETTINGS'); }}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 transition cursor-pointer ${
                              quickActions.includes('SETTINGS')
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/10'
                            }`}
                          >
                            {quickActions.includes('SETTINGS') ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                            <span>{quickActions.includes('SETTINGS') ? 'مثبت' : 'تثبيت'}</span>
                          </button>
                          <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="p-3 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 flex flex-col gap-3 shadow-inner">
                        <div>
                          <label className="text-[10px] font-bold text-slate-200 block mb-2 text-right">حجم الخط الأساسي:</label>
                          <div className="flex items-center justify-between bg-slate-900 border border-white/10 rounded-xl p-1">
                            {['صغير جداً', 'صغير', 'متوسط', 'كبير'].map((lbl, idx) => (
                              <button
                                key={lbl}
                                onClick={(e) => {
                                  e.preventDefault();
                                  const baseSize = 13 + (idx * 1.5);
                                  document.documentElement.style.fontSize = `${baseSize}px`;
                                }}
                                className="flex-1 py-1.5 text-center text-[10px] font-bold text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                              >
                                {lbl}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* 5.5 البوابة المركزية للنقابة */}
                    <a 
                      href="/" 
                      className="w-full bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-md transition-all border border-white/10 p-3 rounded-xl flex items-center justify-between group active:scale-95 shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-white text-xs">بوابة المنصة المركزية</h4>
                          <p className="text-[10px] text-slate-300 font-medium">الانتقال للمنصة الإدارية الشاملة لنقابة التمريض</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </a>

                    {/* 5.6 حول البرنامج وإنهاء الوردية */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
                      <div className="flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>منظومة التفتيش الميداني v2.0.1</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('هل ترغب بتسجيل الخروج وإنهاء الوردية الميدانية الحالية بعد حفظ المسودات؟')) {
                            alert('تم حفظ كافة السجلات وإنهاء الجلسة بنجاح.');
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 font-black flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>إنهاء الوردية</span>
                      </button>
                    </div>

                  </div>

                </div>
              )}

            {/* End of Scrollable Tab Views Container */}
            </div>

            {/* Mobile Bottom Navigation Bar - Sticky Glass Dock (Matching Design Mockup) */}
            <div className="shrink-0 z-40 w-full bg-[#071120]/90 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_35px_rgba(0,0,0,0.7)]">
              <nav className="px-3 py-2 flex items-center justify-around">
                {/* 1. الرئيسية */}
                <button
                  id="pwa-tab-mission"
                  onClick={() => {
                    setPwaTab('MISSION');
                    setHomeView('DASHBOARD');
                  }}
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all cursor-pointer ${
                    pwaTab === 'MISSION' && homeView === 'DASHBOARD'
                      ? 'bg-sky-500/20 text-sky-300 font-black border border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.25)] scale-105'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px]">الرئيسية</span>
                </button>

                {/* 2. المهام */}
                <button
                  id="pwa-tab-tasks"
                  onClick={() => {
                    setPwaTab('MISSION');
                    setHomeView('TASKS');
                  }}
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all cursor-pointer ${
                    pwaTab === 'MISSION' && homeView === 'TASKS'
                      ? 'bg-amber-500/20 text-amber-300 font-black border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-105'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  }`}
                >
                  <ClipboardCheck className="w-5 h-5" />
                  <span className="text-[10px]">المهام</span>
                </button>

                {/* 3. الكشوفات */}
                <button
                  id="pwa-tab-checklist"
                  onClick={() => setPwaTab('CHECKLIST')}
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all cursor-pointer ${
                    pwaTab === 'CHECKLIST'
                      ? 'bg-emerald-500/20 text-emerald-300 font-black border border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-105'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-[10px]">الكشوفات</span>
                </button>

                {/* 4. المزيد */}
                <button
                  id="pwa-tab-more"
                  onClick={() => {
                    setPwaTab('MORE');
                    setActiveMoreSection(null);
                  }}
                  className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl transition-all cursor-pointer ${
                    ['MORE', 'PHOTOS', 'SIGNATURE', 'CHAT', 'ACCOUNT', 'SCANNER', 'VIOLATIONS'].includes(pwaTab)
                      ? 'bg-indigo-500/20 text-indigo-300 font-black border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.25)] scale-105'
                      : 'text-slate-400 hover:text-slate-200 font-bold'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="text-[10px]">المزيد</span>
                </button>
              </nav>

              {/* Mobile Bottom Home Bar Indicator */}
              <div className="pb-1 pt-0.5 text-center">
                <div className="w-24 h-1 bg-white/20 mx-auto rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

      {/* FEATURE 2 MODAL: CRM FACILITY HISTORY */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto ring-1 ring-white/10 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">السجل التاريخي والزيارات السابقة (CRM)</h3>
                  <p className="text-xs text-amber-300 font-bold">{targetFacility.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">رقم المنشأة في السجل:</span>
                  <span className="font-mono font-black text-white text-xs">{targetFacility.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">العنوان:</span>
                  <span className="text-slate-200 font-bold text-xs">{targetFacility.neighborhood}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">حالة الترخيص:</span>
                  <span className="text-emerald-400 font-black text-xs">{targetFacility.licenseStatus}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  سجل الجولات والزيارات السابقة:
                </h4>
                {loadingHistory ? (
                  <div className="py-8 text-center text-slate-300">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    <span className="font-bold text-xs">جاري جلب سجل الزيارات من قاعدة بيانات التفتيش...</span>
                  </div>
                ) : facilityHistory.length === 0 ? (
                  <p className="text-center text-slate-300 py-6 font-bold text-xs">لا توجد زيارات تفتيش سابقة مسجلة لهذه العيادة.</p>
                ) : (
                  facilityHistory.map((hist, i) => (
                    <div key={i} className="bg-slate-950/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-xs">{hist.inspection_type || 'كشف ميداني'}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${
                          hist.status === 'PASS' 
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
                            : 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                        }`}>
                          {hist.status === 'PASS' ? '✓ مستوفية للشروط' : '⚠️ مسجل مخالفات'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-300 font-medium">
                        <span>التاريخ: {hist.date}</span>
                        <span>المفتش: {hist.inspector_name}</span>
                      </div>
                      <div className="bg-slate-900/80 backdrop-blur-md p-2.5 rounded-xl text-xs text-slate-100 border border-white/10 shadow-inner">
                        <span className="text-slate-400 block text-[10px] font-bold mb-0.5">ملاحظات التقرير والمخالفات:</span>
                        <p className="leading-relaxed">{hist.notes || hist.violations}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-800/90 hover:bg-slate-700 text-white font-black px-5 py-2.5 rounded-xl text-xs transition cursor-pointer border border-white/10 active:scale-95 shadow-md"
              >
                إغلاق السجل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 3 MODAL: REPORT UNREGISTERED FACILITY (DROP A PIN) */}
      {showUnregModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-rose-500/40 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto ring-1 ring-rose-500/20 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">رصد وتثبيت عيادة غير مسجلة (Drop a Pin)</h3>
                  <p className="text-xs text-rose-300 font-bold">إشعار فوري للغرفة المركزية للكيانات الشبحية</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUnregModal(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {unregResult ? (
              <div className="bg-emerald-950/90 backdrop-blur-md border border-emerald-500/50 p-4 rounded-2xl text-emerald-200 text-center space-y-2 shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-extrabold text-sm text-white">{unregResult}</p>
                <p className="text-xs text-slate-300 font-medium">تم إرسال الإحداثيات والصورة إلى وحدة الرصد الفوري.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitUnregReport} className="space-y-3.5 text-xs">
                {/* Auto GPS coordinates */}
                <div className="bg-slate-950/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-1.5 shadow-md">
                  <span className="text-amber-300 font-black block text-[11px] flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    الإحداثيات الجغرافية الملتقطة لحظياً (GPS):
                  </span>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-200 font-bold">
                    <span>خط العرض: {inspectorLat.toFixed(6)}</span>
                    <span>خط الطول: {inspectorLng.toFixed(6)}</span>
                    <span className="text-emerald-400 font-black bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40">دقة 5م ✓</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">اسم العيادة أو اليافطة الميدانية الظاهرة *</label>
                  <input
                    type="text"
                    required
                    value={unregName}
                    onChange={(e) => setUnregName(e.target.value)}
                    placeholder="مثال: عيادة تمريض وتضميد السلام - شارع العمل الشعبي..."
                    className="w-full bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">صورة الواجهة أو اليافطة الخارجية (توثيق بصري)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUnregPhoto('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80');
                      }}
                      className="bg-slate-800/90 hover:bg-slate-700 backdrop-blur-md text-amber-300 border border-white/15 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{unregPhoto ? 'تم التقاط الصورة ✓' : 'التقاط صورة الواجهة'}</span>
                    </button>
                    {unregPhoto && (
                      <span className="text-emerald-300 text-[11px] font-black">✓ تم إرفاق الصورة بنجاح</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">ملاحظات المفتش الميداني وأسباب الاشتباه</label>
                  <textarea
                    rows={3}
                    value={unregNotes}
                    onChange={(e) => setUnregNotes(e.target.value)}
                    placeholder="مزاولة مهنة التمريض دون ترخيص نقابي معلق، عدم وجود تصريح وزارة الصحة..."
                    className="w-full bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowUnregModal(false)}
                    className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold transition cursor-pointer border border-white/10"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={unregSubmitting}
                    className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>{unregSubmitting ? 'جاري الإرسال...' : 'إرسال بلاغ فوري (Drop Pin)'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Customization Modal for Quick Actions */}
      {isCustomizingTools && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[85vh] text-white ring-1 ring-white/10">
            <div className="bg-slate-950/80 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <button onClick={() => setIsCustomizingTools(false)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white shadow-sm border border-white/10 transition">
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                تخصيص الواجهة الرئيسية
                <Settings className="w-4 h-4 text-slate-400" />
              </h3>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="bg-blue-950/60 border border-blue-500/40 rounded-xl p-3 text-right text-xs text-blue-200 font-bold leading-relaxed shadow-sm">
                حدد الأدوات والتبويبات التي ترغب بظهورها في شاشتك الرئيسية (حد أقصى 12 أداة لتسهيل الوصول السريع).
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(ALL_TOOLS_MAP).map(tool => {
                  const isSelected = quickActions.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        if (isSelected) {
                          saveQuickActions(quickActions.filter(id => id !== tool.id));
                        } else {
                          if (quickActions.length >= 12) {
                            alert('الحد الأقصى 12 أداة فقط لتجنب الازدحام.');
                            return;
                          }
                          saveQuickActions([...quickActions, tool.id]);
                        }
                      }}
                      className={`flex items-center justify-end gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'bg-blue-950/70 border-blue-500 text-blue-100 shadow-md ring-1 ring-blue-500/40' : 'bg-slate-800/80 border-white/10 text-slate-300 hover:border-white/20'}`}
                    >
                      <div className="text-right flex-1">
                        <span className={`text-[10px] font-black ${isSelected ? 'text-blue-300' : 'text-slate-200'}`}>{tool.label}</span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-tr ${tool.bgFrom} ${tool.bgTo} shadow`}>
                        {getToolIcon(tool.icon, 'w-4 h-4')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 shrink-0 bg-slate-950/80">
              <button onClick={() => setIsCustomizingTools(false)} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 rounded-xl shadow-lg active:scale-95 transition cursor-pointer">
                حفظ وإنهاء ({quickActions.length} مثبت)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syndicate Service Application Modal (ID Card or Practice License) */}
      {activeServiceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[90vh] text-white ring-1 ring-white/10">
            <div className="bg-slate-950/80 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <button onClick={() => setActiveServiceModal(null)} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white shadow-sm border border-white/10 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                {activeServiceModal === 'ID_CARD' ? 'إصدار / تجديد الهوية النقابية الموحدة' : 'التقديم على إجازة ممارسة مهنة / تجديد'}
                <Award className="w-4 h-4 text-emerald-400" />
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`✓ تم استلام طلبك بنجاح لدى أمانة النقابة المركزية! رقم التتبع الخاص بك هو: TRK-${Math.floor(100000 + Math.random() * 900000)}. ستصلك رسالة نصية عند اكتمال التدقيق.`);
                setActiveServiceModal(null);
              }}
              className="p-5 overflow-y-auto space-y-3.5 text-right text-xs"
            >
              <div>
                <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">نوع المعاملة المطلوبة *</label>
                <select className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold">
                  {activeServiceModal === 'ID_CARD' ? (
                    <>
                      <option>تجديد سنوي للهوية النقابية (الدورة 2026)</option>
                      <option>إصدار هوية نقابية ذكية لأول مرة (خريج جديد)</option>
                      <option>إصدار بدل ضائع أو بدل تالف</option>
                      <option>تعديل الدرجة العلمية / تغيير اللقب الوظيفي</option>
                    </>
                  ) : (
                    <>
                      <option>تجديد إجازة ممارسة مهنة سنوية (عيادة تضميد وتمريض)</option>
                      <option>فتح عيادة تضميد وإسعافات أولية جديدة</option>
                      <option>ترخيص مركز رعاية تمريضية منزلية خاصة</option>
                      <option>نقل موقع العيادة إلى رقعة جغرافية أخرى</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">الاسم الكامل لمقدم الطلب *</label>
                <input
                  type="text"
                  required
                  defaultValue={currentUser.name}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">الرقم النقابي *</label>
                  <input
                    type="text"
                    required
                    defaultValue={currentUser.syndicateId || 'IQ-NUR-2024-8841'}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">رقم الهاتف للتواصل *</label>
                  <input
                    type="tel"
                    required
                    defaultValue={currentUser.phone || '07701234567'}
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-extrabold text-[11px]">المحافظة ومقر التقديم *</label>
                <input
                  type="text"
                  required
                  defaultValue={currentUser.governorate || 'بغداد'}
                  className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl space-y-1">
                <span className="font-extrabold text-emerald-300 text-[11px] block">المستمسكات المطلوبة إلكترونياً:</span>
                <p className="text-[10px] text-slate-300">✓ البطاقة الموحدة الأصلية، وثيقة التخرج، وصل تسديد الرسوم النقابية للعام الحالي.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveServiceModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold transition cursor-pointer border border-white/10"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black px-5 py-2 rounded-xl transition shadow-lg cursor-pointer active:scale-95"
                >
                  إرسال الطلب للنقابة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};





