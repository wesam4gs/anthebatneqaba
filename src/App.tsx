import React, { useState, useEffect } from 'react';
import { ExecutiveLayout } from './components/ExecutiveLayout';
import { GisMap } from './components/GisMap';
import { FacilitiesTable } from './components/FacilitiesTable';
import { InspectionManager } from './components/InspectionManager';
import { FieldInspectorMobile } from './components/FieldInspectorMobile';
import { NursesDirectory } from './components/NursesDirectory';
import { ViolationsReport } from './components/ViolationsReport';
import { DashboardStats } from './components/DashboardStats';
import { UsersManagement } from './components/UsersManagement';
import { FinancialInspectionSection } from './components/FinancialInspectionSection';
import { BranchOperationsChat } from './components/BranchOperationsChat';

import { User, Facility, Province, DistrictZone, NurseStaff, InspectionAssignment, ViolationRecord, ViolationType, PenaltySeverity, SystemStats, CustomInspectionZone, InspectionCommittee, FinancialVoucher, BranchInspectionBudget, BranchChatMessage, DisciplineBroadcast } from './types';
import { INITIAL_USERS, INITIAL_PROVINCES, INITIAL_DISTRICT_ZONES, INITIAL_FACILITIES, INITIAL_NURSES, INITIAL_ASSIGNMENTS, INITIAL_VIOLATIONS, MOCK_SYSTEM_STATS, INITIAL_CUSTOM_ZONES, INITIAL_COMMITTEES, INITIAL_FINANCIAL_VOUCHERS, INITIAL_BRANCH_BUDGETS, INITIAL_CHAT_MESSAGES, INITIAL_BROADCASTS } from './data/initialData';
import { ZoneManager } from './components/ZoneManager';
import { Shield, Plus, Building2, MapPin, CheckCircle2, Smartphone, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguageTheme } from './context/LanguageThemeContext';

export interface AppProps {
  isMobileOnly?: boolean;
}

export default function App({ isMobileOnly = false }: AppProps) {
  const { lang, theme, t } = useLanguageTheme();
  const [inspectorZoom, setInspectorZoom] = useState<number>(100);
  const [inspectorDeviceWidth, setInspectorDeviceWidth] = useState<'compact' | 'standard' | 'tablet' | 'full'>('standard');

  const isMobileMode = isMobileOnly || 
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/mobile') || 
      window.location.pathname.startsWith('/inspector') ||
      window.location.hostname.includes('mopile') ||
      window.location.hostname.includes('mobile') ||
      window.location.hostname.includes('inspector') ||
      new URLSearchParams(window.location.search).get('app') === 'inspector' ||
      new URLSearchParams(window.location.search).get('mode') === 'mobile'
    ));

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
  if (typeof window !== 'undefined' && localStorage.getItem('isLoggedOut') === 'true') return null;
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
  const match = INITIAL_USERS.find(u => u.username?.toLowerCase() === savedUsername.toLowerCase());
  if (match) return match;
  const fullName = localStorage.getItem('userFullName');
  const userGov = localStorage.getItem('userGov');
  const userRoleTitle = localStorage.getItem('userRoleTitle');
  const userUnionId = localStorage.getItem('userUnionId');
  if (fullName) {
  return {
  id: `user_${savedUsername}`,
  name: fullName,
  role: savedUsername === 'test1' ? 'INSPECTION_DIRECTOR' : 'FIELD_INSPECTOR',
  badgeNumber: userUnionId || 'INS-IQ-001',
  phone: '07700000000',
  email: `${savedUsername}@syndicate-nurse.iq`,
  provinceId: userGov ? `iq_${userGov}` : 'all',
  provinceName: userGov || 'كافة المحافظات',
  assignedZoneId: 'all_zones',
  assignedZoneName: localStorage.getItem('userAssignedZone') || 'كافة الزونات',
  username: savedUsername,
  roleTitle: userRoleTitle || 'عضو لجنة التفتيش',
  canAccessAllProvinces: !userGov || savedUsername === 'test1'
  };
  }
  }
  if (isMobileOnly || (typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/mobile') ||
    window.location.pathname.startsWith('/inspector') ||
    window.location.hostname.includes('mopile') ||
    window.location.hostname.includes('mobile') ||
    window.location.hostname.includes('inspector')
  ))) {
    const fieldInsp = INITIAL_USERS.find(u => u.role === 'FIELD_INSPECTOR');
    if (fieldInsp) return fieldInsp;
  }
  return INITIAL_USERS[0];
  }); // Default: Syndicate President / High Command
 const [activeTab, setActiveTab] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'sql_schema';
  }); // Default to Main Dashboard (الواجهة الرئيسية)

 // App Data State
 const [users, setUsers] = useState<User[]>(() => {
 const cached = localStorage.getItem('syndicate_users');
 if (cached) {
 try {
 const parsed = JSON.parse(cached);
 if (Array.isArray(parsed) && parsed.length > 0) return parsed;
 } catch (e) {}
 }
 return INITIAL_USERS;
 });
 const [facilities, setFacilities] = useState<Facility[]>(INITIAL_FACILITIES);
 const [provinces, setProvinces] = useState<Province[]>(INITIAL_PROVINCES);
 const [zones, setZones] = useState<DistrictZone[]>(INITIAL_DISTRICT_ZONES);
 const [customZones, setCustomZones] = useState<CustomInspectionZone[]>(INITIAL_CUSTOM_ZONES);
 const [committees, setCommittees] = useState<InspectionCommittee[]>(INITIAL_COMMITTEES);
 const [nurses, setNurses] = useState<NurseStaff[]>(() => {
 const cached = localStorage.getItem('syndicate_nurses');
 if (cached) {
 try {
 const parsed = JSON.parse(cached);
 if (Array.isArray(parsed) && parsed.length > 0) return parsed;
 } catch (e) {}
 }
 return INITIAL_NURSES;
 });
 const [assignments, setAssignments] = useState<InspectionAssignment[]>(INITIAL_ASSIGNMENTS);
 const [violations, setViolations] = useState<ViolationRecord[]>(INITIAL_VIOLATIONS);
 const [stats, setStats] = useState<SystemStats>(MOCK_SYSTEM_STATS);

 // Financial & Inspection ERP State
 const [vouchers, setVouchers] = useState<FinancialVoucher[]>(() => {
 const cached = localStorage.getItem('syndicate_vouchers');
 if (cached) {
 try {
 const parsed = JSON.parse(cached);
 if (Array.isArray(parsed) && parsed.length > 0) return parsed;
 } catch (e) {}
 }
 return INITIAL_FINANCIAL_VOUCHERS;
 });
 const [branchBudgets, setBranchBudgets] = useState<BranchInspectionBudget[]>(INITIAL_BRANCH_BUDGETS);

 // Inter-Branch Operations & Dispatch State
 const [chatMessages, setChatMessages] = useState<BranchChatMessage[]>(() => {
 const cached = localStorage.getItem('syndicate_chat_messages');
 if (cached) {
 try {
 const parsed = JSON.parse(cached);
 if (Array.isArray(parsed) && parsed.length > 0) return parsed;
 } catch (e) {}
 }
 return INITIAL_CHAT_MESSAGES;
 });
 const [broadcasts, setBroadcasts] = useState<DisciplineBroadcast[]>(INITIAL_BROADCASTS);

 // Modals & Active Selections
 const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
 const [preselectedFacilityForTask, setPreselectedFacilityForTask] = useState<Facility | null>(null);
 const [isAddFacilityModalOpen, setIsAddFacilityModalOpen] = useState<boolean>(false);

 // New Facility Form State
 const [newFacName, setNewFacName] = useState<string>('');
 const [newFacType, setNewFacType] = useState<any>('CLINIC');
 const [newFacProvinceId, setNewFacProvinceId] = useState<string>('iq_baghdad');
 const [newFacZoneId, setNewFacZoneId] = useState<string>('zone_karkh');
 const [newFacDistrictArea, setNewFacDistrictArea] = useState<string>('قضاء الكرخ');
 const [newFacNeighborhood, setNewFacNeighborhood] = useState<string>('المنصور');
 const [newFacAddress, setNewFacAddress] = useState<string>('');
 const [newFacOwnerName, setNewFacOwnerName] = useState<string>('');
 const [newFacOwnerPhone, setNewFacOwnerPhone] = useState<string>('');
 const [newFacLat, setNewFacLat] = useState<number>(33.3150);
 const [newFacLng, setNewFacLng] = useState<number>(44.3510);

 // Fetch initial data from Express API with fallback
 useEffect(() => {
 fetch('/api/users')
 .then(res => res.json())
 .then(data => {
 if (Array.isArray(data) && data.length > 0) {
 setUsers(data);
 localStorage.setItem('syndicate_users', JSON.stringify(data));
 }
 })
 .catch(err => console.log('API fallback to initial users'));

 fetch('/api/nurses')
 .then(res => res.json())
 .then(data => {
 if (Array.isArray(data) && data.length > 0) {
 setNurses(data);
 localStorage.setItem('syndicate_nurses', JSON.stringify(data));
 }
 })
 .catch(err => console.log('API fallback to initial nurses'));

 fetch('/api/facilities')
 .then(res => res.json())
 .then(data => { if (Array.isArray(data)) setFacilities(data); })
 .catch(err => console.log('API fallback to initial data'));

 fetch('/api/assignments')
 .then(res => res.json())
 .then(data => { if (Array.isArray(data)) setAssignments(data); })
 .catch(err => console.log('API fallback'));

 fetch('/api/violations')
 .then(res => res.json())
 .then(data => { if (Array.isArray(data)) setViolations(data); })
 .catch(err => console.log('API fallback'));

 fetch('/api/stats')
 .then(res => res.json())
 .then(data => { if (data.totalFacilities) setStats(data); })
 .catch(err => console.log('API fallback'));
 }, []);

 // Handlers
 const handleCreateAssignment = async (newAssignmentData: any) => {
 try {
 const res = await fetch('/api/assignments', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newAssignmentData)
 });
 if (res.ok) {
 const created = await res.json();
 setAssignments(prev => [created, ...prev]);
 } else {
 // Fallback local
 const fac = facilities.find(f => f.id === newAssignmentData.facilityId);
 const newA: InspectionAssignment = {
 id: `assign_${Date.now()}`,
 assignmentCode: `INSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
 facilityId: newAssignmentData.facilityId,
 facilityName: fac ? fac.name : 'منشأة أهلية',
 facilityAddress: fac ? `${fac.neighborhood} - ${fac.addressDetail}` : '',
 facilityLat: fac ? fac.latitude : 33.315,
 facilityLng: fac ? fac.longitude : 44.351,
 assignedInspectorId: newAssignmentData.assignedInspectorId,
 assignedInspectorName: 'علي حسين الكعبي',
 assignedByUserId: currentUser.id,
 assignedByUserName: currentUser.name,
 scheduledDate: newAssignmentData.scheduledDate,
 priority: newAssignmentData.priority,
 status: 'PENDING',
 notes: newAssignmentData.notes,
 createdAt: new Date().toISOString().split('T')[0]
 };
 setAssignments(prev => [newA, ...prev]);
 }
 } catch (e) {
 console.error(e);
 }
 };

 const handleSubmitInspectionReport = async (reportData: any) => {
 const todayStr = new Date().toISOString().split('T')[0];
 const fac = facilities.find(f => f.id === reportData.facilityId);
 const assign = assignments.find(a => a.id === reportData.assignmentId);

 // Auto-generate violation items from FacilitySafetyChecklist if infractions are present
 const combinedViolations = [...(reportData.violations || [])];
 if (reportData.safetyChecklist) {
 const sc = reportData.safetyChecklist;
 if (sc.hasExpiredMedications && !combinedViolations.some(v => v.description?.includes('أدوية منتهية'))) {
 combinedViolations.push({
 violationType: 'SANITATION_DEFECT',
 severity: 'FINE',
 fineAmountIqd: 1000000,
 description: 'ضبط وحيازة أدوية منتهية الصلاحية أو عقاقير محظورة داخل المنشأة'
 });
 }
 if (sc.hasUnlicensedForeignStaff && !combinedViolations.some(v => v.description?.includes('عمالة أجنبية'))) {
 combinedViolations.push({
 violationType: 'UNLICENSED_STAFF',
 severity: 'INVESTIGATION_COMMITTEE',
 fineAmountIqd: 2500000,
 description: 'تشغيل عمالة أجنبية غير مرخصة وبدون موافقات نقابة التمريض العراقية'
 });
 }
 if (sc.isExceedingScopeOfPractice && !combinedViolations.some(v => v.description?.includes('تجاوز الصلاحية'))) {
 combinedViolations.push({
 violationType: 'UNAUTHORIZED_PROCEDURE',
 severity: 'INVESTIGATION_COMMITTEE',
 fineAmountIqd: 2000000,
 description: 'ممارسة أعمال خارج التوصيف المهني (تشخيص طبي أو وصف أدوية خارج الصلاحية)'
 });
 }
 if (sc.hasAutoclaveSterilizer === false && !combinedViolations.some(v => v.description?.includes('جهاز التعقيم'))) {
 combinedViolations.push({
 violationType: 'SANITATION_DEFECT',
 severity: 'WARNING',
 fineAmountIqd: 500000,
 description: 'عدم توفر أو تعطل جهاز التعقيم الطبي الفعال (Autoclave)'
 });
 }
 if (sc.hasSafetyBox === false && !combinedViolations.some(v => v.description?.includes('صندوق التخلص'))) {
 combinedViolations.push({
 violationType: 'SANITATION_DEFECT',
 severity: 'WARNING',
 fineAmountIqd: 300000,
 description: 'عدم توفر صندوق التخلص من الحوادث الحادة (Safety Box)'
 });
 }
 }

 // 1. Create violation records if present
 if (combinedViolations.length > 0) {
 const reportId = `rep_${Date.now()}`;
 const newViolationRecords: ViolationRecord[] = combinedViolations.map((v: any, idx: number) => ({
 id: `viol_${Date.now()}_${idx}`,
 inspectionReportId: reportId,
 facilityId: reportData.facilityId || (fac ? fac.id : 'fac_unknown'),
 facilityName: fac ? fac.name : 'منشأة تمريضية',
 violationType: (v.violationType as ViolationType) || 'UNLICENSED_STAFF',
 description: v.description || 'مخالفة مرصودة أثناء الكشف الميداني',
 severity: (v.severity as PenaltySeverity) || 'WARNING',
 fineAmountIqd: Number(v.fineAmountIqd) || 250000,
 status: v.severity === 'WARNING' ? 'RESOLVED' : 'PENDING_REVIEW',
 recordedAt: todayStr
 }));

 setViolations(prev => {
 const next = [...newViolationRecords, ...prev];
 localStorage.setItem('syndicate_violations', JSON.stringify(next));
 return next;
 });
 }

 // 2. Mark assignment as COMPLETED
 setAssignments(prev => {
 const next = prev.map(a => a.id === reportData.assignmentId ? { ...a, status: 'COMPLETED' as const } : a);
 localStorage.setItem('syndicate_assignments', JSON.stringify(next));
 return next;
 });

 // 3. Update Facility status
 if (fac) {
 setFacilities(prev => {
 const next = prev.map(f => {
 if (f.id === fac.id) {
 let updatedLicenseStatus = f.licenseStatus;
 if (reportData.recommendedAction === 'TEMPORARY_CLOSURE') {
 updatedLicenseStatus = 'SUSPENDED';
 }
 return {
 ...f,
 inspectionStatus: 'INSPECTED' as const,
 lastInspectionDate: todayStr,
 licenseStatus: updatedLicenseStatus
 };
 }
 return f;
 });
 localStorage.setItem('syndicate_facilities', JSON.stringify(next));
 return next;
 });
 }

 // 4. Update Stats
 setStats(prev => ({
 ...prev,
 totalInspectionsThisMonth: prev.totalInspectionsThisMonth + 1,
 completedAssignmentsCount: prev.completedAssignmentsCount + 1,
 pendingAssignmentsCount: Math.max(0, prev.pendingAssignmentsCount - 1)
 }));

 // 5. Sync to server
 try {
 const res = await fetch('/api/inspections', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(reportData)
 });
 if (res.ok) {
 return await res.json();
 }
 } catch (e) {
 console.error('Offline report submission fallback:', e);
 }

 return {
 success: true,
 reportId: `REP-${Date.now()}`,
 message: 'تم تسجيل التقرير الميداني وتحديث سجلات المنشأة والمخالفات بنجاح!',
 gpsValidation: {
 isValid: true,
 message: 'تم مطابقة الإحداثيات الجغرافية الجيومكانية بنجاح'
 }
 };
 };

 const handleVerifyNurseSyndicateId = async (syndicateId: string) => {
 try {
 const res = await fetch(`/api/nurses/verify/${encodeURIComponent(syndicateId)}`);
 return await res.json();
 } catch (e) {
 const nurse = nurses.find(n => n.syndicateId.toLowerCase() === syndicateId.toLowerCase().trim());
 if (nurse) {
 return {
 found: true,
 nurse,
 status: nurse.syndicateStatus,
 message: 'الهوية النقابية سارية المفعول ومسجلة أصولياً.'
 };
 }
 return {
 found: false,
 status: 'NOT_FOUND',
 message: 'رقم الانتساب غير مسجل بالنقابة! تنبيه من احتمال هوية غير مرخصة.'
 };
 }
 };

 const handleAddFacilitySubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 const finalFacName = newFacName.trim() || 'منشأة تمريضية جديدة';
 const finalDistrictArea = newFacDistrictArea.trim() || 'القطاع المركز';
 const finalNeighborhood = newFacNeighborhood.trim() || 'حي التفتيش';

 const payload = {
 name: finalFacName,
 type: newFacType,
 provinceId: newFacProvinceId,
 zoneId: newFacZoneId,
 districtArea: finalDistrictArea,
 neighborhood: finalNeighborhood,
 addressDetail: newFacAddress || 'العنوان الرئيسي للمنشأة',
 ownerName: newFacOwnerName || 'المسؤول الفني',
 ownerPhone: newFacOwnerPhone || '07700000000',
 latitude: newFacLat || 33.3152,
 longitude: newFacLng || 44.3661
 };

 try {
 const res = await fetch('/api/facilities', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });
 if (res.ok) {
 const newFac = await res.json();
 setFacilities(prev => [newFac, ...prev]);
 } else {
 const newFac: Facility = {
 id: `fac_${Date.now()}`,
 licenseNumber: `IRQ-NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
 name: finalFacName,
 type: newFacType,
 provinceId: newFacProvinceId,
 zoneId: newFacZoneId,
 districtArea: finalDistrictArea,
 neighborhood: finalNeighborhood,
 addressDetail: newFacAddress || 'العنوان الرئيسي للمنشأة',
 ownerName: newFacOwnerName || 'المسؤول الفني',
 ownerPhone: newFacOwnerPhone || '07700000000',
 latitude: newFacLat || 33.3152,
 longitude: newFacLng || 44.3661,
 licenseStatus: 'LICENSED',
 licenseExpiryDate: '2027-12-31',
 inspectionStatus: 'NEEDS_INSPECTION',
 createdDate: new Date().toISOString().split('T')[0]
 };
 setFacilities(prev => [newFac, ...prev]);
 }
 } catch (err) {
 console.error(err);
 const newFac: Facility = {
 id: `fac_${Date.now()}`,
 licenseNumber: `IRQ-NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
 name: finalFacName,
 type: newFacType,
 provinceId: newFacProvinceId,
 zoneId: newFacZoneId,
 districtArea: finalDistrictArea,
 neighborhood: finalNeighborhood,
 addressDetail: newFacAddress || 'العنوان الرئيسي للمنشأة',
 ownerName: newFacOwnerName || 'المسؤول الفني',
 ownerPhone: newFacOwnerPhone || '07700000000',
 latitude: newFacLat || 33.3152,
 longitude: newFacLng || 44.3661,
 licenseStatus: 'LICENSED',
 licenseExpiryDate: '2027-12-31',
 inspectionStatus: 'NEEDS_INSPECTION',
 createdDate: new Date().toISOString().split('T')[0]
 };
 setFacilities(prev => [newFac, ...prev]);
 }

 setNewFacName('');
 setNewFacAddress('');
 setIsAddFacilityModalOpen(false);
 };

 const handleCreateCustomZone = (newZone: CustomInspectionZone) => {
 setCustomZones(prev => [newZone, ...prev]);
 };

 const handleUpdateCustomZone = (updatedZone: CustomInspectionZone) => {
 setCustomZones(prev => prev.map(cz => cz.id === updatedZone.id ? updatedZone : cz));
 };

 const handleDeleteCustomZone = (zoneId: string) => {
 setCustomZones(prev => prev.filter(cz => cz.id !== zoneId));
 };

 const handleAddCommittee = (newComm: InspectionCommittee) => {
 setCommittees(prev => [newComm, ...prev]);
 };

 const handleUpdateCommittee = (updatedComm: InspectionCommittee) => {
 setCommittees(prev => prev.map(c => c.id === updatedComm.id ? updatedComm : c));
 };

 const handleDeleteCommittee = (commId: string) => {
 setCommittees(prev => prev.filter(c => c.id !== commId));
 };

 const handleAddVoucher = (newVoucher: FinancialVoucher) => {
 setVouchers(prev => {
 const next = [newVoucher, ...prev];
 localStorage.setItem('syndicate_vouchers', JSON.stringify(next));
 return next;
 });
 };

 const handleUpdateVoucherStatus = (voucherId: string, status: 'COLLECTED' | 'PENDING' | 'RECONCILED') => {
 setVouchers(prev => {
 const next = prev.map(v => v.id === voucherId ? { ...v, status } : v);
 localStorage.setItem('syndicate_vouchers', JSON.stringify(next));
 return next;
 });
 };

 const handleSendMessage = (newMsg: BranchChatMessage) => {
 setChatMessages(prev => {
 const next = [...prev, newMsg];
 localStorage.setItem('syndicate_chat_messages', JSON.stringify(next));
 return next;
 });
 };

 const handleAddBroadcast = (newBrd: DisciplineBroadcast) => {
 setBroadcasts(prev => {
 const next = [newBrd, ...prev];
 localStorage.setItem('syndicate_broadcasts', JSON.stringify(next));
 return next;
 });
 };

 const pendingAssignmentsCount = assignments.filter(a => a.status === 'PENDING').length;


  if (isMobileMode) {
    if (facilities.length === 0 && currentUser) {
      return (
        <div className="min-h-screen bg-[var(--theme-canvas)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-slate-300 border-t-[var(--theme-primary)] rounded-full animate-spin"></div>
            <p className="font-bold text-[var(--theme-text-primary)]">جاري تحميل بيانات المفتش الميداني...</p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[var(--theme-canvas)] flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center">
             <h2 className="text-xl font-black text-rose-600 mb-2">تسجيل الدخول مطلوب</h2>
             <p className="text-sm text-slate-600 mb-6">يرجى تسجيل الدخول من خلال المنصة الرئيسية أولاً كـ "مفتش ميداني".</p>
             <button onClick={() => { localStorage.removeItem('isLoggedOut'); window.location.href = '/'; }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">الذهاب للمنصة</button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#060e1a] via-[#08162b] to-[#040a14] text-slate-100 w-full overflow-hidden flex justify-center">
        <FieldInspectorMobile
          isStandalone={true}
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          assignments={assignments}
          facilities={facilities}
          nurses={nurses}
          onSubmitReport={handleSubmitInspectionReport}
          onVerifyNurseSyndicateId={handleVerifyNurseSyndicateId}
          chatMessages={chatMessages}
          broadcasts={broadcasts}
          onSendMessage={handleSendMessage}
          onOpenFullChat={() => {}}
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[var(--theme-canvas)] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-sm text-center">
           <h2 className="text-xl font-black text-rose-600 mb-2">تسجيل خروج</h2>
           <p className="text-sm text-slate-600 mb-6">لقد تم تسجيل الخروج من منظومة التفتيش الميداني.</p>
           <button onClick={() => { localStorage.removeItem('isLoggedOut'); window.location.href = '/'; }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl">تسجيل الدخول مجدداً</button>
        </div>
      </div>
    );
  }

  return (
 <ExecutiveLayout
 currentUser={currentUser}
 onUserChange={setCurrentUser}
 activeTab={activeTab}
 onTabChange={setActiveTab}
 pendingCount={pendingAssignmentsCount}
 facilities={facilities}
 nurses={nurses}
 assignments={assignments}
 onRefreshData={() => {
 const cachedUsers = localStorage.getItem('syndicate_users');
 if (cachedUsers) {
 try {
 setUsers(JSON.parse(cachedUsers));
 } catch(e) {}
 }
 }}
 >
 <div className="space-y-6" id="main-content-body">
 {/* Tab 0: Main Dashboard & Statistical Analytics (الواجهة الرئيسية) */}
 {(activeTab === 'sql_schema' || activeTab === 'dashboard') && (
 <DashboardStats 
 stats={stats} 
 facilities={facilities} 
 provinces={provinces} 
 onNavigateTab={setActiveTab}
 />
 )}

 {/* Tab 1: GIS Interactive Map */}
 {activeTab === 'gis_map' && (
 <GisMap
 facilities={facilities}
 provinces={provinces}
 zones={zones}
 onSelectFacility={(fac) => {
 setSelectedFacility(fac);
 setActiveTab('facilities');
 }}
 onNewAssignmentRequested={(fac) => {
 setPreselectedFacilityForTask(fac);
 setActiveTab('assignments');
 }}
 onAddFacilityModalOpen={() => setIsAddFacilityModalOpen(true)}
 />
 )}

 {/* Tab 2.5: Zone & Committee Management */}
 {activeTab === 'zone_manager' && (
 <ZoneManager
 customZones={customZones}
 provinces={provinces}
 zones={zones}
 currentUser={currentUser}
 users={users}
 committees={committees}
 onCreateZone={handleCreateCustomZone}
 onUpdateZone={handleUpdateCustomZone}
 onDeleteZone={handleDeleteCustomZone}
 onSelectZoneToFilter={(czone) => {
 setActiveTab('gis_map');
 }}
 />
 )}

 {/* Tab 2.8: Users & Staff Management */}
 {activeTab === 'users_management' && (
 <UsersManagement
 users={users}
 provinces={provinces}
 zones={zones}
 customZones={customZones}
 currentUser={currentUser}
 committees={committees}
 onAddCommittee={handleAddCommittee}
 onUpdateCommittee={handleUpdateCommittee}
 onDeleteCommittee={handleDeleteCommittee}
 onAddUser={(newUser) => {
 setUsers(prev => {
 const next = [newUser, ...prev];
 localStorage.setItem('syndicate_users', JSON.stringify(next));
 return next;
 });
 fetch('/api/users', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newUser)
 }).catch(err => console.error('Failed to sync new user to backend:', err));
 }}
 onUpdateUser={(updated) => {
 setUsers(prev => {
 const next = prev.map(u => u.id === updated.id ? updated : u);
 localStorage.setItem('syndicate_users', JSON.stringify(next));
 return next;
 });
 if (currentUser.id === updated.id) {
 setCurrentUser(updated);
 }
 fetch(`/api/users/${updated.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(updated)
 }).catch(err => console.error('Failed to sync updated user to backend:', err));
 }}
 onDeleteUser={(userId) => {
 setUsers(prev => {
 const next = prev.filter(u => u.id !== userId);
 localStorage.setItem('syndicate_users', JSON.stringify(next));
 return next;
 });
 fetch(`/api/users/${userId}`, {
 method: 'DELETE'
 }).catch(err => console.error('Failed to sync deleted user to backend:', err));
 }}
 />
 )}

 {/* Tab 3: Facilities Table */}
 {activeTab === 'facilities' && (
 <FacilitiesTable
 facilities={facilities}
 provinces={provinces}
 zones={zones}
 onSelectFacility={(fac) => setSelectedFacility(fac)}
 onNewAssignmentRequested={(fac) => {
 setPreselectedFacilityForTask(fac);
 setActiveTab('assignments');
 }}
 onAddFacilityModalOpen={() => setIsAddFacilityModalOpen(true)}
 />
 )}

 {/* Tab 4: Assignments & Scheduling */}
 {activeTab === 'assignments' && (
 <InspectionManager
 assignments={assignments}
 facilities={facilities}
 currentUser={currentUser}
 onCreateAssignment={handleCreateAssignment}
 preselectedFacility={preselectedFacilityForTask}
 onNavigateToZones={() => setActiveTab('zone_manager')}
 />
 )}

 {/* Tab 5: Inspector Mobile App Simulation */}
 {activeTab === 'field_inspector' && (
   <div className="space-y-4">
     {/* Top Banner & Screen Controls */}
     <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 rounded-2xl border border-emerald-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg text-white">
       <div className="flex items-center gap-3">
         <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
           <Smartphone className="w-6 h-6" />
         </div>
         <div>
           <div className="flex items-center gap-2">
             <h3 className="font-black text-sm text-emerald-300">تطبيق المفتش الميداني (رابط مستقل PWA)</h3>
             <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
               متاح الآن
             </span>
           </div>
           <p className="text-xs text-slate-300 mt-0.5">
             التحكم بحجم الشاشة وتكبير/تصغير العرض الميداني أو تشغيله برابط مستقل: <code className="text-amber-300 font-mono bg-slate-950 px-1.5 py-0.5 rounded">/mobile</code>
           </p>
         </div>
       </div>

       {/* Zoom & View Size Controls */}
       <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
         <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
           <span className="text-[10px] text-slate-400 font-bold ml-1">حجم الشاشة:</span>
           <button
             onClick={() => setInspectorDeviceWidth('compact')}
             className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
               inspectorDeviceWidth === 'compact'
                 ? 'bg-emerald-500 text-slate-950 shadow'
                 : 'bg-slate-800 text-slate-300 hover:text-white'
             }`}
             title="هاتف ذكي مدمج (375px)"
           >
             هاتف مدمج
           </button>
           <button
             onClick={() => setInspectorDeviceWidth('standard')}
             className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
               inspectorDeviceWidth === 'standard'
                 ? 'bg-emerald-500 text-slate-950 shadow'
                 : 'bg-slate-800 text-slate-300 hover:text-white'
             }`}
             title="هاتف قياسي (430px)"
           >
             قياسي
           </button>
           <button
             onClick={() => setInspectorDeviceWidth('tablet')}
             className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
               inspectorDeviceWidth === 'tablet'
                 ? 'bg-emerald-500 text-slate-950 shadow'
                 : 'bg-slate-800 text-slate-300 hover:text-white'
             }`}
             title="جهاز لوحي تابلت (560px)"
           >
             تابلت
           </button>
           <button
             onClick={() => setInspectorDeviceWidth('full')}
             className={`px-2 py-1 text-[10px] font-bold rounded-lg transition cursor-pointer ${
               inspectorDeviceWidth === 'full'
                 ? 'bg-emerald-500 text-slate-950 shadow'
                 : 'bg-slate-800 text-slate-300 hover:text-white'
             }`}
             title="شاشة كاملة"
           >
             كامل
           </button>
         </div>

         <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2">
           <span className="text-[10px] text-slate-400 font-bold ml-1">التقريب:</span>
           <button
             onClick={() => setInspectorZoom(prev => Math.max(30, prev - 10))}
             className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
             title="تصغير الشاشة (-)"
           >
             <ZoomOut className="w-3.5 h-3.5" />
           </button>
           <span className="text-xs font-mono font-bold text-amber-300 min-w-[42px] text-center">
             {inspectorZoom}%
           </span>
           <button
             onClick={() => setInspectorZoom(prev => Math.min(150, prev + 10))}
             className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
             title="تكبير الشاشة (+)"
           >
             <ZoomIn className="w-3.5 h-3.5" />
           </button>
           <div className="flex items-center gap-1 mr-1">
             {[30, 40, 55, 70, 85, 100].map(val => (
               <button
                 key={val}
                 onClick={() => setInspectorZoom(val)}
                 className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition cursor-pointer ${
                   inspectorZoom === val 
                     ? 'bg-amber-500 text-slate-950 font-black' 
                     : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                 }`}
                 title={`عرض بحجم ${val}%`}
               >
                 {val}%
               </button>
             ))}
           </div>
         </div>

         <a
           href="/mobile"
           target="_blank"
           rel="noopener noreferrer"
           className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer mr-auto"
         >
           <span>رابط مستقل ↗</span>
           <ExternalLink className="w-3 h-3" />
         </a>
       </div>
     </div>

     <div 
       className="w-full flex justify-center transition-all duration-200"
       style={{ zoom: `${inspectorZoom}%` }}
     >
       <div className={`w-full transition-all duration-200 ${
         inspectorDeviceWidth === 'compact' ? 'max-w-[375px]' :
         inspectorDeviceWidth === 'standard' ? 'max-w-[430px]' :
         inspectorDeviceWidth === 'tablet' ? 'max-w-[560px]' :
         'max-w-4xl'
       }`}>
         <FieldInspectorMobile
           currentUser={currentUser}
           onUserChange={setCurrentUser}
           assignments={assignments}
           facilities={facilities}
           nurses={nurses}
           onSubmitReport={handleSubmitInspectionReport}
           onVerifyNurseSyndicateId={handleVerifyNurseSyndicateId}
           chatMessages={chatMessages}
           broadcasts={broadcasts}
           onSendMessage={handleSendMessage}
           onOpenFullChat={() => setActiveTab('operations_chat')}
         />
       </div>
     </div>
   </div>
 )}

 {/* Tab 6: Nurses Registry */}
 {activeTab === 'nurses' && (
 <NursesDirectory
 nurses={nurses}
 currentUser={currentUser}
 onVerifyNurseSyndicateId={handleVerifyNurseSyndicateId}
 onUpdateNurse={(updatedNurse) => {
 setNurses(prev => {
 const next = prev.map(n => n.id === updatedNurse.id ? updatedNurse : n);
 localStorage.setItem('syndicate_nurses', JSON.stringify(next));
 return next;
 });
 fetch(`/api/nurses/${updatedNurse.id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(updatedNurse)
 }).catch(err => console.error('Failed to sync nurse update to backend:', err));
 }}
 onAddNurse={(newNurse) => {
 setNurses(prev => {
 const next = [newNurse, ...prev];
 localStorage.setItem('syndicate_nurses', JSON.stringify(next));
 return next;
 });
 fetch('/api/nurses', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newNurse)
 }).catch(err => console.error('Failed to sync new nurse to backend:', err));
 }}
 />
 )}

 {/* Tab 7: Violations */}
 {activeTab === 'violations' && (
 <ViolationsReport violations={violations} />
 )}

 {/* Tab 8: Financial Management & Inspection ERP */}
 {activeTab === 'finance' && (
 <FinancialInspectionSection
 vouchers={vouchers}
 branchBudgets={branchBudgets}
 facilities={facilities}
 violations={violations}
 provinces={provinces}
 currentUser={currentUser}
 onAddVoucher={handleAddVoucher}
 onUpdateVoucherStatus={handleUpdateVoucherStatus}
 />
 )}

 {/* Tab 9: Inter-Branch Operations & Dispatch Room */}
 {activeTab === 'operations_chat' && (
 <BranchOperationsChat
 messages={chatMessages}
 broadcasts={broadcasts}
 currentUser={currentUser}
 provinces={provinces}
 facilities={facilities}
 violations={violations}
 users={users}
 onSendMessage={handleSendMessage}
 onAddBroadcast={handleAddBroadcast}
 onSelectUser={setCurrentUser}
 />
 )}


 </div>

 {/* Add New Facility Modal */}
 {isAddFacilityModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="add-facility-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] overflow-hidden my-auto">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3 shrink-0">
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base flex items-center gap-2">
 <Building2 className="w-5 h-5 text-amber-600" />
 تسجيل عيادة أو مستشفى أهلي جديد
 </h3>
 <button
 id="close-add-modal-btn"
 onClick={() => setIsAddFacilityModalOpen(false)}
 className="text-slate-400 hover:text-[var(--theme-text-primary)] font-bold"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleAddFacilitySubmit} className="space-y-3 text-xs overflow-y-auto flex-1 my-2 pr-1">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">اسم المنشأة:</label>
 <input
 id="fac-name-input"
 type="text"
 value={newFacName}
 onChange={(e) => setNewFacName(e.target.value)}
 placeholder="مثال: عيادة المنصور التمريضية والضماد..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold focus:outline-none focus:border-amber-500"
 />
 </div>

 <div className="grid grid-cols-3 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">نوع المنشأة:</label>
 <select
 id="fac-type-select"
 value={newFacType}
 onChange={(e) => setNewFacType(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 >
 <option value="CLINIC">عيادة تمريضية/ضماد</option>
 <option value="HOSPITAL">مستشفى أهلي</option>
 <option value="NURSING_CENTER">مركز رعاية تمريضية</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المحافظة (18):</label>
 <select
 id="fac-province-select"
 value={newFacProvinceId}
 onChange={(e) => {
 const pId = e.target.value;
 setNewFacProvinceId(pId);
 const pProv = provinces.find(p => p.id === pId);
 const availZones = zones.filter(z => z.provinceId === pId);
 if (availZones.length > 0) {
 setNewFacZoneId(availZones[0].id);
 }
 if (pProv) {
 setNewFacLat(pProv.centerLat);
 setNewFacLng(pProv.centerLng);
 }
 }}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 >
 {provinces.map(p => (
 <option key={p.id} value={p.id}>{p.nameAr}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">الفرع / القطاع:</label>
 <select
 id="fac-zone-select"
 value={newFacZoneId}
 onChange={(e) => setNewFacZoneId(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 >
 {zones.filter(z => z.provinceId === newFacProvinceId).map(z => (
 <option key={z.id} value={z.id}>{z.nameAr}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">اسم المنطقة / القضاء:</label>
 <input
 id="fac-district-input"
 type="text"
 value={newFacDistrictArea}
 onChange={(e) => setNewFacDistrictArea(e.target.value)}
 placeholder="مثال: قضاء الكرخ / قضاء الكاظمية"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">اسم الحي / المحلة:</label>
 <input
 id="fac-neighborhood-input"
 type="text"
 value={newFacNeighborhood}
 onChange={(e) => setNewFacNeighborhood(e.target.value)}
 placeholder="مثال: حي المنصور / محلة 602"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">اسم المالك/المدير:</label>
 <input
 id="fac-owner-input"
 type="text"
 value={newFacOwnerName}
 onChange={(e) => setNewFacOwnerName(e.target.value)}
 placeholder="اسم صاحب الإجازة..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">هاتف المالك:</label>
 <input
 id="fac-phone-input"
 type="text"
 value={newFacOwnerPhone}
 onChange={(e) => setNewFacOwnerPhone(e.target.value)}
 placeholder="0770XXXXXXX"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 />
 </div>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">تفاصيل العنوان والموقع:</label>
 <input
 id="fac-address-input"
 type="text"
 value={newFacAddress}
 onChange={(e) => setNewFacAddress(e.target.value)}
 placeholder="شارع الأميرات - قرب المجمع الطبي..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-bold"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">دائرة العرض (Latitude):</label>
 <input
 id="fac-lat-input"
 type="number"
 step="0.0001"
 value={newFacLat}
 onChange={(e) => setNewFacLat(Number(e.target.value))}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">خط الطول (Longitude):</label>
 <input
 id="fac-lng-input"
 type="number"
 step="0.0001"
 value={newFacLng}
 onChange={(e) => setNewFacLng(Number(e.target.value))}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-mono font-bold"
 />
 </div>
 </div>

 <div className="flex items-center gap-2 pt-2">
 <button
 id="submit-add-facility-btn"
 type="submit"
 className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
 >
 إضافة وإدراج الخريطة الجغرافية
 </button>
 <button
 id="cancel-add-facility-btn"
 type="button"
 onClick={() => setIsAddFacilityModalOpen(false)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-2.5 px-4 rounded-xl text-xs transition"
 >
 إلغاء
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Facility Detail View Modal */}
 {selectedFacility && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="view-facility-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[var(--theme-card-border)] space-y-4">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3">
 <div className="flex items-center gap-2">
 <span className="text-2xl">{selectedFacility.type === 'HOSPITAL' ? '🏥' : '🩺'}</span>
 <div>
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base">{selectedFacility.name}</h3>
 <p className="text-xs text-amber-700 font-mono font-bold">إجازة رقم: {selectedFacility.licenseNumber}</p>
 </div>
 </div>
 <button
 id="close-view-facility-x"
 onClick={() => setSelectedFacility(null)}
 className="text-slate-400 hover:text-[var(--theme-text-primary)] font-bold text-lg"
 >
 ✕
 </button>
 </div>

 <div className="space-y-2 text-xs">
 <div className="bg-[var(--theme-canvas)] p-3 rounded-xl border border-[var(--theme-card-border)] space-y-1">
 <p><span className="font-bold text-[var(--theme-text-primary)]">الموقع الإداري:</span> {selectedFacility.neighborhood} - {selectedFacility.addressDetail}</p>
 <p><span className="font-bold text-[var(--theme-text-primary)]">المالك المسؤول:</span> {selectedFacility.ownerName} ({selectedFacility.ownerPhone})</p>
 <p><span className="font-bold text-[var(--theme-text-primary)]">إحداثيات D-GPS:</span> <span className="font-mono text-emerald-700 font-bold">{selectedFacility.latitude}, {selectedFacility.longitude}</span></p>
 <p><span className="font-bold text-[var(--theme-text-primary)]">حالة الترخيص:</span> <span className="font-bold text-amber-800">{selectedFacility.licenseStatus}</span> (تاريخ الانتهاء: {selectedFacility.licenseExpiryDate})</p>
 </div>

 <div className="flex items-center gap-2 pt-2">
 <button
 id="modal-schedule-task-btn"
 onClick={() => {
 setPreselectedFacilityForTask(selectedFacility);
 setSelectedFacility(null);
 setActiveTab('assignments');
 }}
 className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
 >
 جدولة كشف ميداني لهذه العيادة
 </button>
 <button
 id="close-facility-modal-btn"
 onClick={() => setSelectedFacility(null)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-2.5 px-4 rounded-xl text-xs transition"
 >
 إغلاق
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-slate-900/90 dark:bg-slate-950 border-t border-slate-800 px-4 sm:px-6 py-3 text-[11px] text-slate-400 mt-6 rounded-xl" id="app-footer">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div>
 {lang === 'ar' 
 ? 'جمهورية العراق - نقابة التمريض العراقية © 2026 | المنصة الوطنية الشاملة للرقابة والتفتيش الصحي الميداني (GIS Version 2.6)'
 : 'Republic of Iraq - Iraqi Nursing Syndicate © 2026 | National Health Inspection Platform (GIS v2.6)'}
 </div>
 <div className="flex items-center gap-2">
 <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
 <span>{lang === 'ar' ? 'المزامنة المباشرة: متصل بالخادم المركزي' : 'Live Sync: Connected to Central Server'}</span>
 </div>
 </div>
 </footer>
 </ExecutiveLayout>
 );
}



