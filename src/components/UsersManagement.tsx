import React, { useState, useMemo } from 'react';
import { User, UserRole, Province, DistrictZone, CustomInspectionZone, InspectionCommittee } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  GraduationCap, 
  KeyRound, 
  Phone, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Award, 
  MapPin, 
  UserX,
  FileText,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Printer,
  Layers,
  Plus,
  Globe2,
  Megaphone
} from 'lucide-react';
import { SyndicateLogo } from './SyndicateLogo';
import { RolesPermissionsModal } from './RolesPermissionsModal';
import { 
  canUserBroadcastNationwide, 
  canUserAccessAllProvinces, 
  getUserRoleTitle,
  getUserGeographicScope 
} from '../utils/rolesAndPermissions';

interface UsersManagementProps {
  users: User[];
  provinces: Province[];
  zones: DistrictZone[];
  customZones: CustomInspectionZone[];
  currentUser: User;
  committees?: InspectionCommittee[];
  onAddCommittee?: (newComm: InspectionCommittee) => void;
  onUpdateCommittee?: (updatedComm: InspectionCommittee) => void;
  onDeleteCommittee?: (commId: string) => void;
  onAddUser: (newUser: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UsersManagement: React.FC<UsersManagementProps> = ({
  users,
  provinces,
  zones,
  customZones,
  currentUser,
  committees = [],
  onAddCommittee,
  onUpdateCommittee,
  onDeleteCommittee,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  // Sub-tab selection state
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'committees'>('users');

  // Modal states for Users
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [quickCredsUser, setQuickCredsUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRolesModal, setShowRolesModal] = useState<boolean>(false);

  // Modal states for Committees
  const [isAddCommitteeModalOpen, setIsAddCommitteeModalOpen] = useState(false);
  const [editingCommittee, setEditingCommittee] = useState<InspectionCommittee | null>(null);
  const [committeeToDelete, setCommitteeToDelete] = useState<InspectionCommittee | null>(null);
  const [printableCommittee, setPrintableCommittee] = useState<InspectionCommittee | null>(null);

  // Form State for Committee
  const [commName, setCommName] = useState('');
  const [commCode, setCommCode] = useState('');
  const [commHeadInspectorId, setCommHeadInspectorId] = useState('');
  const [commMemberIds, setCommMemberIds] = useState<string[]>([]);
  const [commProvinceId, setCommProvinceId] = useState('iq_baghdad');
  const [commZoneId, setCommZoneId] = useState('zone_karkh');
  const [commStatus, setCommStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [commNotes, setCommNotes] = useState('');

  // Quick credentials edit state
  const [quickUsername, setQuickUsername] = useState('');
  const [quickPassword, setQuickPassword] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Password visibility state in table/modals
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState<{
    name: string;
    role: UserRole;
    badgeNumber: string;
    phone: string;
    email: string;
    username: string;
    password: string;
    nationalId: string;
    educationQualification: string;
    specialization: string;
    provinceId: string;
    assignedZoneId: string;
    status: 'ACTIVE' | 'INACTIVE';
    notes: string;
  }>({
    name: '',
    role: 'FIELD_INSPECTOR',
    badgeNumber: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    nationalId: '',
    educationQualification: 'بكالوريوس علوم تمريض (كلية التمريض)',
    specialization: 'تمريض عام ورقابة تفتيشية',
    provinceId: 'iq_baghdad',
    assignedZoneId: 'zone_karkh',
    status: 'ACTIVE',
    notes: ''
  });

  const [showFormPassword, setShowFormPassword] = useState(false);

  // Notification helper
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to open Add Modal and generate default values
  const handleOpenAddModal = () => {
    const randomBadge = `INSP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const randomUserNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      role: 'FIELD_INSPECTOR',
      badgeNumber: randomBadge,
      phone: '0770',
      email: '',
      username: `insp_${randomUserNum}`,
      password: `Nur2026#${Math.floor(10 + Math.random() * 90)}`,
      nationalId: '',
      educationQualification: 'بكالوريوس علوم تمريض (كلية التمريض)',
      specialization: 'تمريض عام ورقابة تفتيشية',
      provinceId: 'iq_baghdad',
      assignedZoneId: 'zone_karkh',
      status: 'ACTIVE',
      notes: ''
    });
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  // Helper to open Quick Credentials Modal
  const handleOpenQuickCreds = (user: User) => {
    setQuickCredsUser(user);
    setQuickUsername(user.username || '');
    setQuickPassword(user.password || '');
  };

  // Helper to save Quick Credentials
  const handleSaveQuickCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCredsUser) return;
    const finalU = quickUsername.trim() || quickCredsUser.username || `user_${Date.now().toString().slice(-4)}`;
    const finalP = quickPassword.trim() || quickCredsUser.password || 'Nur2026!Pass';
    const updatedUser: User = {
      ...quickCredsUser,
      username: finalU,
      password: finalP
    };
    onUpdateUser(updatedUser);
    showNotification(`تم تحديث اسم المستخدم وكلمة المرور للموظف (${quickCredsUser.name}) بنجاح 🔐`);
    setQuickCredsUser(null);
  };

  // Helper to confirm deletion
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const name = userToDelete.name;
    onDeleteUser(userToDelete.id);
    showNotification(`تم حذف حساب المستخدم (${name}) بنجاح 🗑️`);
    setUserToDelete(null);
  };

  // Helper to open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      role: user.role || 'FIELD_INSPECTOR',
      badgeNumber: user.badgeNumber || '',
      phone: user.phone || '',
      email: user.email || '',
      username: user.username || '',
      password: user.password || '',
      nationalId: user.nationalId || '',
      educationQualification: user.educationQualification || 'بكالوريوس علوم تمريض',
      specialization: user.specialization || 'تمريض عام ورقابة صحية',
      provinceId: user.provinceId || 'iq_baghdad',
      assignedZoneId: user.assignedZoneId || 'zone_karkh',
      status: user.status || 'ACTIVE',
      notes: user.notes || ''
    });
    setIsAddModalOpen(true);
  };

  // Handle Form Submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = formData.name.trim() || 'مستخدم جديد';
    const finalBadge = formData.badgeNumber.trim() || `INSP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const finalUsername = formData.username.trim() || `user_${Date.now().toString().slice(-4)}`;
    const finalPassword = formData.password.trim() || 'Nur2026!Pass';

    const selProvince = provinces.find(p => p.id === formData.provinceId);
    const selZone = zones.find(z => z.id === formData.assignedZoneId) || customZones.find(cz => cz.id === formData.assignedZoneId);

    if (editingUser) {
      // Update existing user
      const updated: User = {
        ...editingUser,
        name: finalName,
        role: formData.role,
        badgeNumber: finalBadge,
        phone: formData.phone || '07700000000',
        email: formData.email || `${finalUsername}@syndicate-nurse.iq`,
        username: finalUsername,
        password: finalPassword,
        nationalId: formData.nationalId,
        educationQualification: formData.educationQualification,
        specialization: formData.specialization,
        provinceId: formData.provinceId,
        provinceName: selProvince ? selProvince.nameAr : 'بغداد',
        assignedZoneId: formData.assignedZoneId,
        assignedZoneName: selZone ? ('nameAr' in selZone ? selZone.nameAr : selZone.zoneName) : 'قطاع التفتيش',
        status: formData.status,
        notes: formData.notes
      };
      onUpdateUser(updated);
      showNotification(`تم تحديث بيانات المستخدم (${updated.name}) بنجاح ✔️`);
    } else {
      // Add new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: finalName,
        role: formData.role,
        badgeNumber: finalBadge,
        phone: formData.phone || '07700000000',
        email: formData.email || `${finalUsername}@syndicate-nurse.iq`,
        username: finalUsername,
        password: finalPassword,
        nationalId: formData.nationalId,
        educationQualification: formData.educationQualification,
        specialization: formData.specialization,
        provinceId: formData.provinceId,
        provinceName: selProvince ? selProvince.nameAr : 'بغداد',
        assignedZoneId: formData.assignedZoneId,
        assignedZoneName: selZone ? ('nameAr' in selZone ? selZone.nameAr : selZone.zoneName) : 'قطاع التفتيش',
        status: formData.status,
        createdAt: new Date().toISOString().split('T')[0],
        notes: formData.notes
      };
      onAddUser(newUser);
      showNotification(`تمت إضافة المستخدم الجديد (${newUser.name}) وإنشاء حسابه بنجاح 🎉`);
    }

    setIsAddModalOpen(false);
  };

  // Toggle User Status (Active/Inactive)
  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    const updated = { ...user, status: newStatus as 'ACTIVE' | 'INACTIVE' };
    onUpdateUser(updated);
    showNotification(`تم تغيير حالة حساب (${user.name}) إلى (${newStatus === 'ACTIVE' ? 'نشط/مفعل' : 'معطل'})`);
  };

  // Copy password to clipboard
  const handleCopyPassword = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Committee Modal Handlers
  const handleOpenAddCommitteeModal = () => {
    setEditingCommittee(null);
    setCommName('');
    setCommCode(`COMM-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`);
    const defaultHead = users.find(u => u.role === 'INSPECTION_DIRECTOR' || u.role === 'FIELD_INSPECTOR');
    const headId = defaultHead ? defaultHead.id : (users[0]?.id || '');
    setCommHeadInspectorId(headId);
    setCommMemberIds(headId ? [headId] : []);
    setCommProvinceId(provinces[0]?.id || 'iq_baghdad');
    setCommZoneId('zone_karkh');
    setCommStatus('ACTIVE');
    setCommNotes('');
    setIsAddCommitteeModalOpen(true);
  };

  const handleOpenEditCommitteeModal = (comm: InspectionCommittee) => {
    setEditingCommittee(comm);
    setCommName(comm.name);
    setCommCode(comm.code);
    setCommHeadInspectorId(comm.headInspectorId);
    setCommMemberIds(comm.memberIds || []);
    setCommProvinceId(comm.provinceId || provinces[0]?.id || 'iq_baghdad');
    setCommZoneId(comm.zoneId || 'zone_karkh');
    setCommStatus(comm.status);
    setCommNotes(comm.notes || '');
    setIsAddCommitteeModalOpen(true);
  };

  const handleSaveCommitteeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = commName.trim() || 'لجنة تفتيش ميداني جديدة';
    const finalCode = commCode.trim() || `COMM-${Math.floor(100 + Math.random() * 900)}`;

    // Ensure head inspector is included in members
    const finalMembers = Array.from(new Set([commHeadInspectorId, ...commMemberIds])).filter(Boolean);

    if (editingCommittee) {
      const updated: InspectionCommittee = {
        ...editingCommittee,
        name: finalName,
        code: finalCode,
        headInspectorId: commHeadInspectorId,
        memberIds: finalMembers,
        provinceId: commProvinceId,
        zoneId: commZoneId,
        status: commStatus,
        notes: commNotes.trim()
      };
      if (onUpdateCommittee) onUpdateCommittee(updated);
      showNotification(`تم تعديل بيانات لجنة التفتيش (${updated.name}) بنجاح ✔️`);
    } else {
      const newComm: InspectionCommittee = {
        id: `comm_${Date.now()}`,
        code: finalCode,
        name: finalName,
        headInspectorId: commHeadInspectorId,
        memberIds: finalMembers,
        provinceId: commProvinceId,
        zoneId: commZoneId,
        status: commStatus,
        createdDate: new Date().toISOString().split('T')[0],
        notes: commNotes.trim()
      };
      if (onAddCommittee) onAddCommittee(newComm);
      showNotification(`تم تشكيل وإضافة لجنة التفتيش الجديدة (${newComm.name}) بنجاح 🎉`);
    }

    setIsAddCommitteeModalOpen(false);
  };

  const handleToggleCommMember = (inspectorId: string) => {
    if (commMemberIds.includes(inspectorId)) {
      if (commMemberIds.length === 1 && commMemberIds[0] === commHeadInspectorId) {
        // Keep at least head
        return;
      }
      setCommMemberIds(commMemberIds.filter(id => id !== inspectorId));
    } else {
      setCommMemberIds([...commMemberIds, inspectorId]);
    }
  };

  const handleConfirmDeleteCommittee = () => {
    if (committeeToDelete && onDeleteCommittee) {
      onDeleteCommittee(committeeToDelete.id);
      showNotification(`تم حذف لجنة التفتيش (${committeeToDelete.name}) نهائياً`);
      setCommitteeToDelete(null);
    }
  };

  // Filtered Committees
  const filteredCommittees = useMemo(() => {
    return committees.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const headUser = users.find(u => u.id === c.headInspectorId);
      const matchQuery = !q ||
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (headUser && headUser.name.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q));

      const matchProvince = provinceFilter === 'ALL' || c.provinceId === provinceFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchQuery && matchProvince && matchStatus;
    });
  }, [committees, searchQuery, provinceFilter, statusFilter, users]);

  // Inspectors list for committee creation
  const allInspectors = useMemo(() => {
    return users.filter(u => u.role === 'FIELD_INSPECTOR' || u.role === 'INSPECTION_DIRECTOR' || u.role === 'BRANCH_DIRECTOR');
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        u.name.toLowerCase().includes(q) ||
        u.badgeNumber.toLowerCase().includes(q) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.educationQualification && u.educationQualification.toLowerCase().includes(q)) ||
        (u.specialization && u.specialization.toLowerCase().includes(q));

      // Role Filter
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      // Province Filter
      const matchProvince = provinceFilter === 'ALL' || u.provinceId === provinceFilter;

      // Status Filter
      const matchStatus = statusFilter === 'ALL' || (u.status || 'ACTIVE') === statusFilter;

      return matchQuery && matchRole && matchProvince && matchStatus;
    });
  }, [users, searchQuery, roleFilter, provinceFilter, statusFilter]);

  // Statistics counts
  const totalCount = users.length;
  const inspectorsCount = users.filter(u => u.role === 'FIELD_INSPECTOR').length;
  const committeeHeadsCount = users.filter(u => u.role === 'INSPECTION_DIRECTOR').length;
  const branchDirectorsCount = users.filter(u => u.role === 'BRANCH_DIRECTOR').length;
  const activeUsersCount = users.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length;

  return (
    <div className="space-y-6" id="users-management-main-wrapper">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-950 border border-emerald-700 text-emerald-200 p-4 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700 cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Page Title & Main Bar */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">إدارة المستخدمين والحسابات الوظيفية</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  نظام الصلاحيات المركزية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                إضافة وإدارة حسابات موظفي التفتيش الميداني، مسؤولي لجان التفتيش، ومسؤولي الفروع النقابية بكافة المحافظات
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="view-roles-matrix-btn"
              onClick={() => setShowRolesModal(true)}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>مصفوفة وصلاحيات الأدوار النقابية</span>
            </button>

            <button
              type="button"
              id="add-new-committee-btn"
              onClick={() => {
                setActiveSubTab('committees');
                handleOpenAddCommitteeModal();
              }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>إضافة لجنة تفتيش جديدة</span>
            </button>

            <button
              type="button"
              id="add-new-user-btn"
              onClick={() => {
                setActiveSubTab('users');
                handleOpenAddModal();
              }}
              className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم / موظف تفتيش جديد</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px] font-medium">إجمالي الحسابات المسجلة:</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{totalCount} مستخدم</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 border-r-4 border-r-emerald-500">
            <span className="text-slate-400 block text-[11px] font-medium">موظفو التفتيش الميداني:</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">{inspectorsCount} مفتش</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 border-r-4 border-b-blue-500">
            <span className="text-slate-400 block text-[11px] font-medium">مسؤولو لجان التفتيش:</span>
            <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">{committeeHeadsCount} مسؤول</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 border-r-4 border-r-amber-500">
            <span className="text-slate-400 block text-[11px] font-medium">مسؤولو الفروع بالمحافظات:</span>
            <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">{branchDirectorsCount} مدير فرع</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
            <span className="text-slate-400 block text-[11px] font-medium">الحسابات الفعالة:</span>
            <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">{activeUsersCount} / {totalCount}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="bg-slate-200 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-300">
        <button
          type="button"
          id="subtab-users-btn"
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>إدارة الحسابات والمستخدمين ({users.length})</span>
        </button>

        <button
          type="button"
          id="subtab-committees-btn"
          onClick={() => setActiveSubTab('committees')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'committees'
              ? 'bg-slate-900 text-amber-400 shadow-md'
              : 'text-slate-700 hover:bg-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>إدارة وتشكيل لجان التفتيش الميداني ({committees.length})</span>
        </button>
      </div>

      {/* VIEW 1: USERS & ACCOUNTS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="space-y-6" id="users-tab-content">
          {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              id="users-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالاسم، الشارة، اسم المستخدم، التخصص أو الهاتف..."
              className="w-full bg-slate-50 border border-slate-200 pr-9 pl-3 py-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Role Filter */}
          <div className="md:col-span-3">
            <select
              id="users-role-filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع الأدوار والوظائف</option>
              <option value="FIELD_INSPECTOR">موظف تفتيش ميداني</option>
              <option value="INSPECTION_DIRECTOR">مسؤول لجنة تفتيش</option>
              <option value="BRANCH_DIRECTOR">مسؤول فرع نقابي</option>
              <option value="HIGH_COMMAND">القيادة العليا / النقيب</option>
            </select>
          </div>

          {/* Province Filter */}
          <div className="md:col-span-2">
            <select
              id="users-province-filter-select"
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع المحافظات</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.nameAr}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              id="users-status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">جميع الحالات</option>
              <option value="ACTIVE">نشط (مفعل)</option>
              <option value="INACTIVE">معطل</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>عرض {filteredUsers.length} من أصل {users.length} مستخدم</span>
          {(searchQuery || roleFilter !== 'ALL' || provinceFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
                setProvinceFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
            >
              إعادة تعيين الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Users Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="users-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">المستخدم والصفة</th>
                <th className="p-3.5">الدور الوظيفي</th>
                <th className="p-3.5">اسم المستخدم (Login)</th>
                <th className="p-3.5">كلمة المرور</th>
                <th className="p-3.5">التحصيل والتخصص</th>
                <th className="p-3.5">المحافظة والفرع</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">الإجراءات والعمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <UserX className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold">لا يوجد مستخدمون يطابقون خيارات البحث المختارة</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isPasswordVisible = Boolean(visiblePasswords[u.id]);
                  const roleBadge = getRoleBadge(u.role);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Badge */}
                      <td className="p-3.5 font-bold">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${roleBadge.avatarBg}`}>
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold text-sm flex items-center gap-1.5">
                              <span>{u.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                {u.badgeNumber}
                              </span>
                              {u.phone && <span>📞 {u.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        <div>
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg text-[11px] border ${roleBadge.badgeStyle}`}>
                            {roleBadge.icon}
                            <span>{getUserRoleTitle(u)}</span>
                          </span>
                          <div className="mt-1 flex items-center gap-1 flex-wrap">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getUserGeographicScope(u).badgeClass}`}>
                              {getUserGeographicScope(u).label}
                            </span>
                            {canUserBroadcastNationwide(u) && (
                              <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 border border-amber-500/40">
                                📢 تبليغ عام
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="p-3.5 font-mono font-bold text-slate-800 dir-ltr text-right">
                        <span className="bg-slate-100 text-slate-900 border border-slate-200 px-2 py-1 rounded-lg">
                          {u.username || 'غير محدد'}
                        </span>
                      </td>

                      {/* Password */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="bg-slate-900 text-amber-300 px-2 py-1 rounded-lg border border-slate-800 font-bold">
                            {isPasswordVisible ? (u.password || 'Nur2026!') : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title={isPasswordVisible ? 'إخفاء' : 'إظهار كلمة المرور'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {u.password && (
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(u.password!, u.id)}
                              className="p-1 text-slate-400 hover:text-amber-600 rounded transition cursor-pointer"
                              title="نسخ كلمة المرور"
                            >
                              {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Qualification & Spec */}
                      <td className="p-3.5 text-slate-700">
                        <div className="font-bold text-slate-900 truncate max-w-[180px]">
                          {u.educationQualification || 'بكالوريوس تمريض'}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {u.specialization || 'تمريض عام ورقابة'}
                        </div>
                      </td>

                      {/* Province & Zone */}
                      <td className="p-3.5 text-slate-700">
                        <div className="font-bold flex items-center gap-1 text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{u.provinceName || getProvinceName(u.provinceId, provinces)}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                          {u.assignedZoneName || u.assignedZoneId || 'جميع القطاعات'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-xl text-[10px] border cursor-pointer transition ${
                            (u.status || 'ACTIVE') === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                          }`}
                        >
                          {(u.status || 'ACTIVE') === 'ACTIVE' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>نشط</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>معطل</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Edit Username & Password */}
                          <button
                            type="button"
                            onClick={() => handleOpenQuickCreds(u)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold p-1.5 rounded-lg text-[11px] border border-purple-200 transition cursor-pointer"
                            title="تعديل سريع لاسم المستخدم وكلمة المرور"
                          >
                            <KeyRound className="w-4 h-4 text-purple-600" />
                          </button>

                          {/* View Full Profile */}
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 rounded-lg text-[11px] transition cursor-pointer"
                            title="عرض تفاصيل الملف الوظيفي"
                          >
                            <FileText className="w-4 h-4 text-slate-600" />
                          </button>

                          {/* Edit Full User */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold p-1.5 rounded-lg text-[11px] border border-amber-200 transition cursor-pointer"
                            title="تعديل كامل بيانات الحساب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete User */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold p-1.5 rounded-lg text-[11px] border border-red-200 transition cursor-pointer"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
      )}

      {/* VIEW 2: INSPECTION COMMITTEES MANAGEMENT */}
      {activeSubTab === 'committees' && (
        <div className="space-y-6" id="committees-tab-content">
          {/* Committees Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                id="search-committee-users-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم اللجنة، رمز اللجنة، اسم رئيس اللجنة أو الملاحظات..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2.5 font-semibold text-slate-900 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <select
                id="filter-comm-province-select"
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="ALL">جميع المحافظات الـ 18</option>
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.nameAr}</option>
                ))}
              </select>

              <select
                id="filter-comm-status-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشطة وميدانية</option>
                <option value="INACTIVE">معطلة / مؤقتة</option>
              </select>

              <button
                type="button"
                id="btn-add-committee-subtab"
                onClick={handleOpenAddCommitteeModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة لجنة تفتيش جديدة</span>
              </button>
            </div>
          </div>

          {/* Committees Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCommittees.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600 text-sm">لا توجد لجان تفتيش مسجلة مطابقة للبحث.</p>
                <button
                  type="button"
                  onClick={handleOpenAddCommitteeModal}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>تأليف وإضافة لجنة جديدة</span>
                </button>
              </div>
            ) : (
              filteredCommittees.map((comm) => {
                const prov = provinces.find(p => p.id === comm.provinceId);
                const headUser = users.find(u => u.id === comm.headInspectorId);
                const memberUsers = (comm.memberIds || [])
                  .map(id => users.find(u => u.id === id))
                  .filter(Boolean) as User[];

                const isSingleMember = memberUsers.length <= 1;

                return (
                  <div
                    key={comm.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                            {comm.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            الرمز: {comm.code}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          comm.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {comm.status === 'ACTIVE' ? 'نشطة وميدانية' : 'معطلة'}
                        </span>
                      </div>

                      {/* Single vs Team Indicator Badge */}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-bold">نمط تشكيل اللجنة:</span>
                        {isSingleMember ? (
                          <span className="bg-purple-50 text-purple-800 border border-purple-200 font-bold px-2 py-0.5 rounded-md">
                            لجنة فردية (مفتش واحد)
                          </span>
                        ) : (
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-2 py-0.5 rounded-md">
                            لجنة مشتركة ({memberUsers.length} مفتشين)
                          </span>
                        )}
                      </div>

                      {/* Head Inspector */}
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-amber-900 block">رئيس اللجنة / المفتش المسؤول:</span>
                        <p className="font-bold text-slate-900 text-xs">
                          {headUser ? headUser.name : 'مفتش معتمد'}
                        </p>
                        {headUser && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            الشارة: {headUser.badgeNumber} | هاتف: {headUser.phone}
                          </span>
                        )}
                      </div>

                      {/* Members list */}
                      <div className="space-y-1 text-xs">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          أعضاء اللجنة التفتيشية ({memberUsers.length}):
                        </span>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {memberUsers.map((m, idx) => (
                            <div key={m.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <span className="font-bold text-slate-800">{idx + 1}. {m.name}</span>
                              <span className="text-[9px] font-mono text-slate-500">{m.badgeNumber}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Province & Notes */}
                      <div className="text-xs space-y-1 pt-1 text-slate-600">
                        <div className="flex items-center justify-between text-[11px] bg-slate-100 p-2 rounded-lg">
                          <span className="font-bold text-slate-500">المحافظة والفرع:</span>
                          <span className="font-bold text-slate-900">{prov?.nameAr || 'بغداد'}</span>
                        </div>
                        {comm.notes && (
                          <p className="text-[10px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            ملاحظات: {comm.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Committee Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPrintableCommittee(comm)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1.5 transition text-[11px] cursor-pointer"
                        title="طباعة الأمر الرسمي لتشكيل اللجنة"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>أمر التشكيل</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCommitteeModal(comm)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl border border-amber-300 text-[11px] flex items-center gap-1 cursor-pointer transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCommitteeToDelete(comm)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 font-bold p-1.5 rounded-xl border border-red-200 cursor-pointer transition"
                          title="حذف اللجنة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT USER FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="user-form-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingUser ? `تعديل بيانات المستخدم (${editingUser.name})` : 'إضافة مستخدم أو موظف تفتيش جديد'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs overflow-y-auto flex-1 my-2 pr-1">
              {/* Row 1: Role Selection & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    الدور الوظيفي / الصلاحية
                  </label>
                  <select
                    id="form-user-role-select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="FIELD_INSPECTOR">موظف تفتيش ميداني (Field Inspector)</option>
                    <option value="INSPECTION_DIRECTOR">مسؤول لجنة تفتيش (Inspection Committee Lead)</option>
                    <option value="BRANCH_DIRECTOR">مسؤول فرع نقابي (Branch Director)</option>
                    <option value="HIGH_COMMAND">القيادة العليا / النقيب (High Command)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    الرقم الوظيفي / الشارة
                  </label>
                  <input
                    type="text"
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="مثال: INSP-2026-99"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 2: Full Name & National ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    الاسم الكامل المزدوج/الرباعي
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: المفتش الميداني / أحمد عبد القادر الخفاجي"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    رقم البطاقة الوطنية / الهوية:
                  </label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="مثال: 199201827364"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Username & Password (LOGIN CREDENTIALS) */}
              <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-900 border-b border-amber-200 pb-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>بيانات تسجيل الدخول للنظام وتطبيق المفتش</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      اسم المستخدم (Username)
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="insp_ahmed2026"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      كلمة المرور (Password) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="كلمة مرور حماية الحساب"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 pr-9 font-mono font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Education Qualification & Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    التحصيل الدراسي والشهادة الاكاديمية:
                  </label>
                  <select
                    value={formData.educationQualification}
                    onChange={(e) => setFormData({ ...formData, educationQualification: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="دكتوراه علوم تمريض وإدارة صحية">دكتوراه علوم تمريض وإدارة صحية</option>
                    <option value="ماجستير علوم تمريض">ماجستير علوم تمريض</option>
                    <option value="دبلوم عالي تقاني تمريض وطوارئ">دبلوم عالي تقاني تمريض وطوارئ</option>
                    <option value="بكالوريوس علوم تمريض (كلية التمريض)">بكالوريوس علوم تمريض (كلية التمريض)</option>
                    <option value="دبلوم تمريض (المعهد الطبي الفني)">دبلوم تمريض (المعهد الطبي الفني)</option>
                    <option value="إعدادية التمريض الرسمية">إعدادية التمريض الرسمية</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    التخصص التمريضي الدقيق:
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="مثال: عناية مركزة / طوارئ وجراحة / تمريض عام"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              {/* Row 5: Province & Zone Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">المحافظة التابعة:</label>
                  <select
                    value={formData.provinceId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const availZones = zones.filter(z => z.provinceId === pId);
                      setFormData({
                        ...formData,
                        provinceId: pId,
                        assignedZoneId: availZones.length > 0 ? availZones[0].id : 'zone_karkh'
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">الفرع / القطاع المخصص للتفتيش:</label>
                  <select
                    value={formData.assignedZoneId}
                    onChange={(e) => setFormData({ ...formData, assignedZoneId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    {zones.filter(z => z.provinceId === formData.provinceId).map(z => (
                      <option key={z.id} value={z.id}>{z.nameAr}</option>
                    ))}
                    {customZones.filter(cz => cz.provinceId === formData.provinceId).map(cz => (
                      <option key={cz.id} value={cz.id}>زون مخصص: {cz.zoneName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Phone, Email & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0770XXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">البريد الإلكتروني:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@syndicate-nurse.iq"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">حالة الحساب:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                  >
                    <option value="ACTIVE">نشط (مفعل للعمل الميداني)</option>
                    <option value="INACTIVE">معطل (موقوف مؤقتاً)</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">ملاحظات وتوصيات إدارية:</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات وتوجيهات خاصة بتكليف الموظف الميداني..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  {editingUser ? 'حفظ التحديثات والتعديلات' : 'إضافة وإنشاء حساب المستخدم'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW USER PROFILE DRAWER/MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="view-user-modal">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 font-bold flex items-center justify-center text-lg border border-amber-500/30">
                  {viewingUser.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{viewingUser.name}</h3>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    الشارة: {viewingUser.badgeNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">الصفة والدور الوظيفي:</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{getRoleTitle(viewingUser.role)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">حالة الحساب بالنظام:</span>
                  <span className={`font-bold mt-0.5 inline-block ${viewingUser.status === 'INACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {viewingUser.status === 'INACTIVE' ? 'معطل' : 'نشط ومفعل'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5 border-b border-slate-800 pb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>بيانات الدخول للنظام وتطبيق الهاتف:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">اسم المستخدم:</span>
                    <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded border border-slate-700 block mt-0.5">
                      {viewingUser.username || 'غير محدد'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">كلمة المرور:</span>
                    <span className="font-bold text-amber-300 bg-slate-800 px-2 py-1 rounded border border-slate-700 block mt-0.5">
                      {viewingUser.password || 'Nur2026!Pass'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">التحصيل الدراسي:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{viewingUser.educationQualification || 'بكالوريوس علوم تمريض'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">التخصص التمريضي:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{viewingUser.specialization || 'رقابة وتفتيش'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">المحافظة:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{viewingUser.provinceName || 'بغداد'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">القطاع / الزون المخصص:</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{viewingUser.assignedZoneName || 'قطاع التفتيش'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">رقم الهاتف:</span>
                  <span className="font-bold text-slate-800 font-mono block mt-0.5">{viewingUser.phone || 'غير مسجل'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block font-medium">رقم الهوية الوطنية:</span>
                  <span className="font-bold text-slate-800 font-mono block mt-0.5">{viewingUser.nationalId || 'غير مسجل'}</span>
                </div>
              </div>

              {viewingUser.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <span className="font-bold block mb-0.5">ملاحظات إدارية:</span>
                  <p>{viewingUser.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(viewingUser);
                    setViewingUser(null);
                  }}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  تعديل بيانات الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK CREDENTIALS EDIT MODAL */}
      {quickCredsUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="quick-creds-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-900">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">تعديل بيانات الدخول السريع</h3>
                  <p className="text-xs text-slate-500">المستخدم: {quickCredsUser.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickCredsUser(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickCreds} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  اسم المستخدم الجدید (Username):
                </label>
                <input
                  type="text"
                  required
                  value={quickUsername}
                  onChange={(e) => setQuickUsername(e.target.value)}
                  placeholder="اسم المستخدم الجديد"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  كلمة المرور الجديدة (Password):
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    required
                    value={quickPassword}
                    onChange={(e) => setQuickPassword(e.target.value)}
                    placeholder="كلمة المرور الجديدة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 pr-10 font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  حفظ اسم المستخدم وكلمة المرور
                </button>
                <button
                  type="button"
                  onClick={() => setQuickCredsUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD / EDIT COMMITTEE FORM */}
      {isAddCommitteeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="committee-form-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden my-auto text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/20 text-amber-700 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingCommittee ? 'تعديل بيانات وأعضاء لجنة التفتيش' : 'تأليف وإضافة لجنة تفتيش ميدانية جديدة'}
                  </h3>
                  <p className="text-[11px] text-slate-500">تحديد رئيس وأعضاء اللجنة والتوزيع الإداري (لجان فردية أو مشتركة)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCommitteeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 font-bold rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCommitteeSubmit} className="space-y-4 text-xs overflow-y-auto flex-1 my-3 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    اسم اللجنة التفتيشية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    placeholder="مثال: لجنة الرقابة المركزية 01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    رمز اللجنة النقابي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={commCode}
                    onChange={(e) => setCommCode(e.target.value)}
                    placeholder="COMM-BAG-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Province & Sector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">المحافظة التابعة للجنة:</label>
                  <select
                    value={commProvinceId}
                    onChange={(e) => setCommProvinceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">حالة اللجنة:</label>
                  <select
                    value={commStatus}
                    onChange={(e) => setCommStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ACTIVE">نشطة ومكلفة بالميدان</option>
                    <option value="INACTIVE">معطلة / مؤقتة</option>
                  </select>
                </div>
              </div>

              {/* Leader Inspector Selection */}
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 space-y-2">
                <label className="font-black text-slate-900 text-xs block">
                  رئيس اللجنة / المفتش المسؤول الرئيسي:
                </label>
                <select
                  value={commHeadInspectorId}
                  onChange={(e) => {
                    const newHead = e.target.value;
                    setCommHeadInspectorId(newHead);
                    if (!commMemberIds.includes(newHead)) {
                      setCommMemberIds([...commMemberIds, newHead]);
                    }
                  }}
                  className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-600 focus:outline-none"
                >
                  {allInspectors.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - (شارة: {u.badgeNumber}) - {getRoleTitle(u.role)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Members Selection (Checkboxes for 1 or more inspectors) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-900 text-xs block">
                    اختيار أعضاء اللجنة من الممرضين المفتشين (لجان فردية أو متعددة):
                  </label>
                  <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                    المحدد: {commMemberIds.length} مفتش
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  يمكن اختيار شخص واحد فقط (لجنة فردية) أو عدة مفتشين (لجنة تفتيش مشتركة).
                </p>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                  {allInspectors.map(u => {
                    const isChecked = commMemberIds.includes(u.id);
                    const isHead = u.id === commHeadInspectorId;

                    return (
                      <label
                        key={u.id}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer text-xs ${
                          isChecked 
                            ? 'bg-amber-50/80 border-amber-300 font-bold text-slate-900' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCommMember(u.id)}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span>{u.name}</span>
                          {isHead && (
                            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded">
                              رئيس اللجنة
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{u.badgeNumber}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">ملاحظات توجيهية للجنة:</label>
                <textarea
                  rows={2}
                  value={commNotes}
                  onChange={(e) => setCommNotes(e.target.value)}
                  placeholder="ملاحظات وتكليفات خاصة بهذه اللجنة..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  {editingCommittee ? 'تحديث وحفظ بيانات اللجنة' : 'تشكيل وإضافة اللجنة رسمياً'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCommitteeModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DELETE COMMITTEE CONFIRMATION */}
      {committeeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="delete-committee-modal">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 text-right">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">تأكيد حذف لجنة التفتيش</h3>
                <p className="text-xs text-slate-500">إجراء إداري غير قابل للتراجع</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100 font-bold">
              هل أنت متأكد من حذف لجنة التفتيش ({committeeToDelete.name}) ورمزها ({committeeToDelete.code}) نهائياً؟
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteCommittee}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                نعم، إطراح وحذف اللجنة
              </button>
              <button
                type="button"
                onClick={() => setCommitteeToDelete(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PRINTABLE COMMITTEE OFFICIAL DECREE ORDER */}
      {printableCommittee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="print-committee-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 my-auto text-right space-y-4">
            {/* Printable Area */}
            <div className="border-4 border-double border-slate-900 p-6 rounded-2xl space-y-5 bg-amber-50/20 text-slate-900 dir-rtl">
              
              {/* Header with Syndicate Logo */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="text-right space-y-0.5">
                  <h2 className="font-black text-sm text-slate-900">جمهورية العراق</h2>
                  <h3 className="font-bold text-xs text-slate-800">نقابة التمريض العراقية - المقر العام</h3>
                  <p className="text-[10px] text-slate-600">قسم الرقابة والتفتيش الميداني المركزي</p>
                </div>
                <SyndicateLogo className="w-16 h-16 shrink-0" />
                <div className="text-left font-mono text-[10px] space-y-0.5">
                  <p>العدد: <strong>{printableCommittee.code}/2026</strong></p>
                  <p>التاريخ: <strong>{printableCommittee.createdDate || '2026-08-13'}</strong></p>
                  <p>المرفقات: أمر إداري رسمي</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1 my-2">
                <span className="bg-slate-900 text-amber-400 font-black px-6 py-1.5 rounded-full text-xs inline-block shadow-sm">
                  أمر إداري بتشكيل لجنة تفتيش ميدانية
                </span>
              </div>

              {/* Decree Content */}
              <div className="text-xs space-y-3 leading-relaxed font-semibold text-slate-800">
                <p>
                  استناداً إلى الصلاحيات المخولة لنقابة التمريض العراقية وبناءً على مقتضيات المصلحة العامة لتنظيم وضبط الممارسة التمريضية في المؤسسات الصحية والعيادات الخاصة، تقرر ما يلي:
                </p>

                <div className="bg-white p-3 rounded-xl border border-slate-300 space-y-2">
                  <p className="font-black text-amber-900">أولاً: تشكيل ({printableCommittee.name}) برقم رمز ({printableCommittee.code}).</p>
                  <p>ثانياً: تسمية رئيس وأعضاء اللجنة على النحو التالي:</p>
                  
                  <ul className="space-y-1.5 pr-4 list-disc text-xs">
                    {(printableCommittee.memberIds || [printableCommittee.headInspectorId]).map((mId, idx) => {
                      const inspector = users.find(u => u.id === mId);
                      const isHead = mId === printableCommittee.headInspectorId;
                      return (
                        <li key={mId} className="font-bold">
                          {inspector ? inspector.name : 'مفتش معتمد'} - (رقم الشارة: {inspector ? inspector.badgeNumber : '---'})
                          {isHead && <span className="text-amber-800 font-black mr-1">(رئيساً للجنة)</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <p className="bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                  <strong>ثالثاً:</strong> تتولى هذه اللجنة إجراء الجولات الميدانية والرقابة التفتيشية ضمن نطاق محافظة (
                  {provinces.find(p => p.id === printableCommittee.provinceId)?.nameAr || 'بغداد'}) وتنفيذ كافة التعليمات النافذة.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs font-bold gap-4">
                <div>
                  <p className="text-slate-600 text-[10px]">مسؤول قسم التفتيش والرقابة</p>
                  <p className="font-black text-slate-900 mt-6">د. أحمد جاسم الحجامي</p>
                </div>
                <div>
                  <p className="text-slate-600 text-[10px]">نقيب التمريض العراقي</p>
                  <p className="font-black text-slate-900 mt-6">د. فراس الموسوي</p>
                </div>
              </div>
            </div>

            {/* Print Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة القرار الرسمي</span>
              </button>

              <button
                type="button"
                onClick={() => setPrintableCommittee(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Roles & Permissions Modal */}
      <RolesPermissionsModal
        isOpen={showRolesModal}
        onClose={() => setShowRolesModal(false)}
        currentUser={currentUser}
        users={users}
        provinces={provinces}
      />
    </div>
  );
};

// Helper Functions
function getRoleBadge(role: UserRole) {
  switch (role) {
    case 'FIELD_INSPECTOR':
      return {
        title: 'موظف تفتيش ميداني',
        badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        avatarBg: 'bg-emerald-100 text-emerald-900',
        icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
      };
    case 'INSPECTION_DIRECTOR':
      return {
        title: 'مسؤول لجنة تفتيش',
        badgeStyle: 'bg-blue-50 text-blue-800 border-blue-300',
        avatarBg: 'bg-blue-100 text-blue-900',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
      };
    case 'BRANCH_DIRECTOR':
      return {
        title: 'مسؤول فرع نقابي',
        badgeStyle: 'bg-amber-50 text-amber-800 border-amber-300',
        avatarBg: 'bg-amber-100 text-amber-900',
        icon: <Building2 className="w-3.5 h-3.5 text-amber-600" />
      };
    case 'HIGH_COMMAND':
      return {
        title: 'القيادة العليا / النقيب',
        badgeStyle: 'bg-purple-50 text-purple-800 border-purple-300',
        avatarBg: 'bg-purple-100 text-purple-900',
        icon: <Award className="w-3.5 h-3.5 text-purple-600" />
      };
    default:
      return {
        title: 'مستخدم',
        badgeStyle: 'bg-slate-50 text-slate-800 border-slate-300',
        avatarBg: 'bg-slate-100 text-slate-900',
        icon: <Users className="w-3.5 h-3.5" />
      };
  }
}

function getRoleTitle(role: UserRole): string {
  switch (role) {
    case 'FIELD_INSPECTOR': return 'موظف تفتيش ميداني';
    case 'INSPECTION_DIRECTOR': return 'مسؤول لجنة تفتيش';
    case 'BRANCH_DIRECTOR': return 'مسؤول فرع نقابي بالمحافظة';
    case 'HIGH_COMMAND': return 'القيادة العليا / نقيب التمريض العراقي';
    default: return 'مستخدم للنظام';
  }
}

function getProvinceName(pId?: string, provinces: Province[] = []): string {
  if (!pId) return 'بغداد';
  const found = provinces.find(p => p.id === pId);
  return found ? found.nameAr : 'بغداد';
}
