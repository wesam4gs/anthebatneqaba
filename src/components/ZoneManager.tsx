import React, { useState } from 'react';
import { CustomInspectionZone, Province, DistrictZone, User, InspectionCommittee } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { 
  MapPin, 
  Plus, 
  ShieldCheck, 
  Users, 
  Layers, 
  Tag, 
  Navigation, 
  FileText, 
  CheckCircle2, 
  UserPlus, 
  Search, 
  Printer, 
  Building2, 
  Phone, 
  UserCheck,
  ShieldAlert,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { SyndicateLogo } from './SyndicateLogo';

interface ZoneManagerProps {
  customZones: CustomInspectionZone[];
  provinces: Province[];
  zones: DistrictZone[];
  currentUser: User;
  users?: User[];
  committees?: InspectionCommittee[];
  onCreateZone: (newZoneData: CustomInspectionZone) => void;
  onUpdateZone?: (updatedZone: CustomInspectionZone) => void;
  onDeleteZone?: (zoneId: string) => void;
  onSelectZoneToFilter?: (zone: CustomInspectionZone) => void;
}

export const ZoneManager: React.FC<ZoneManagerProps> = ({
  customZones,
  provinces,
  zones,
  currentUser,
  users,
  committees = [],
  onCreateZone,
  onUpdateZone,
  onDeleteZone,
  onSelectZoneToFilter
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<CustomInspectionZone | null>(null);
  const [zoneToDelete, setZoneToDelete] = useState<CustomInspectionZone | null>(null);

  const [filterProvinceId, setFilterProvinceId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [printableZone, setPrintableZone] = useState<CustomInspectionZone | null>(null);

  // Form State for Adding/Editing Committee Plan
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string>('');
  const [committeeName, setCommitteeName] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState(provinces[0]?.id || 'iq_baghdad');
  const [selectedBranchId, setSelectedBranchId] = useState('zone_karkh');
  const [districtArea, setDistrictArea] = useState('');
  const [neighborhoodsText, setNeighborhoodsText] = useState('');
  const [geoPointsDescription, setGeoPointsDescription] = useState('');
  const [committeeHeadId, setCommitteeHeadId] = useState<string>('user_5');
  const [selectedInspectorIds, setSelectedInspectorIds] = useState<string[]>(['user_5']);
  const [notes, setNotes] = useState('');

  // Combined Inspectors List
  const allInspectors = (users && users.length > 0 ? users : INITIAL_USERS).filter(
    u => u.role === 'FIELD_INSPECTOR' || u.role === 'INSPECTION_DIRECTOR' || u.role === 'BRANCH_DIRECTOR'
  );

  const availableBranches = zones.filter(z => z.provinceId === selectedProvinceId);

  const handleInspectorToggle = (id: string) => {
    if (selectedInspectorIds.includes(id)) {
      if (selectedInspectorIds.length === 1) {
        return;
      }
      setSelectedInspectorIds(selectedInspectorIds.filter(i => i !== id));
    } else {
      setSelectedInspectorIds([...selectedInspectorIds, id]);
    }
  };

  const handleCommitteeSelectChange = (commId: string) => {
    setSelectedCommitteeId(commId);
    if (commId) {
      const selectedComm = committees.find(c => c.id === commId);
      if (selectedComm) {
        setCommitteeName(selectedComm.name);
        setSelectedProvinceId(selectedComm.provinceId);
        setCommitteeHeadId(selectedComm.headInspectorId);
        setSelectedInspectorIds(selectedComm.memberIds && selectedComm.memberIds.length > 0 ? selectedComm.memberIds : [selectedComm.headInspectorId]);
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingZone(null);
    setSelectedCommitteeId('');
    setCommitteeName('');
    setSelectedProvinceId(provinces[0]?.id || 'iq_baghdad');
    setSelectedBranchId('zone_karkh');
    setDistrictArea('');
    setNeighborhoodsText('');
    setGeoPointsDescription('');
    setCommitteeHeadId('user_5');
    setSelectedInspectorIds(['user_5']);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cz: CustomInspectionZone) => {
    setEditingZone(cz);
    setSelectedCommitteeId(cz.committeeId || '');
    setCommitteeName(cz.assignedCommitteeName);
    setSelectedProvinceId(cz.provinceId);
    setSelectedBranchId(cz.zoneId);
    setDistrictArea(cz.districtArea);
    setNeighborhoodsText(cz.neighborhoods.join(', '));
    setGeoPointsDescription(cz.geoPointsDescription || '');
    setCommitteeHeadId(cz.assignedInspectorIds[0] || 'user_5');
    setSelectedInspectorIds(cz.assignedInspectorIds);
    setNotes(cz.notes || '');
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCommitteeName = committeeName.trim() || `لجنة التفتيش الميداني (${new Date().toLocaleDateString('ar-IQ')})`;
    const finalDistrictArea = districtArea.trim() || 'القضاء والقطاع المركز';

    const nList = neighborhoodsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const finalInspectors = Array.from(new Set([committeeHeadId, ...selectedInspectorIds])).filter(Boolean);

    if (editingZone) {
      const updatedZone: CustomInspectionZone = {
        ...editingZone,
        committeeId: selectedCommitteeId || editingZone.committeeId,
        zoneName: `${finalCommitteeName} - ${finalDistrictArea}`,
        provinceId: selectedProvinceId,
        zoneId: selectedBranchId,
        districtArea: finalDistrictArea,
        neighborhoods: nList.length > 0 ? nList : ['حي المركز', 'الأحياء الرئيسية'],
        geoPointsDescription: geoPointsDescription.trim() || 'نطاق تفتيشي جغرافي محدد بالخريطة',
        assignedCommitteeName: finalCommitteeName,
        assignedInspectorIds: finalInspectors,
        notes: notes.trim(),
      };

      if (onUpdateZone) {
        onUpdateZone(updatedZone);
      }
      setToastMessage(`تم تحديث خطة وتوزيع "${finalCommitteeName}" بنجاح! 🛡️`);
    } else {
      const newZone: CustomInspectionZone = {
        id: `czone_${Date.now()}`,
        committeeId: selectedCommitteeId || undefined,
        zoneName: `${finalCommitteeName} - ${finalDistrictArea}`,
        provinceId: selectedProvinceId,
        zoneId: selectedBranchId,
        districtArea: finalDistrictArea,
        neighborhoods: nList.length > 0 ? nList : ['حي المركز', 'الأحياء الرئيسية'],
        geoPointsDescription: geoPointsDescription.trim() || 'نطاق تفتيشي جغرافي محدد بالخريطة',
        assignedCommitteeName: finalCommitteeName,
        assignedInspectorIds: finalInspectors,
        notes: notes.trim(),
        createdDate: new Date().toISOString().split('T')[0]
      };

      onCreateZone(newZone);
      setToastMessage(`تم إضافة وتوزيع خريطة "${finalCommitteeName}" بنجاح! 🛡️`);
    }

    setTimeout(() => setToastMessage(null), 4000);
    setIsModalOpen(false);
  };

  const handleConfirmDeleteZone = () => {
    if (zoneToDelete) {
      if (onDeleteZone) {
        onDeleteZone(zoneToDelete.id);
      }
      setToastMessage(`تم حذف خطة وتوزيع اللجنة (${zoneToDelete.assignedCommitteeName}) بنجاح.`);
      setTimeout(() => setToastMessage(null), 3000);
      setZoneToDelete(null);
    }
  };

  // Filtered Zones/Committees
  const filteredCustomZones = customZones.filter(cz => {
    const matchesProvince = filterProvinceId === 'ALL' || cz.provinceId === filterProvinceId;
    const matchesSearch = !searchQuery.trim() || 
      cz.assignedCommitteeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cz.districtArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cz.neighborhoods.some(n => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cz.assignedInspectorIds.some(id => {
        const ins = allInspectors.find(u => u.id === id);
        return ins && ins.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

    return matchesProvince && matchesSearch;
  });

  return (
    <div className="space-y-6" id="zone-manager-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-emerald-100 px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2.5 text-amber-400 text-xs font-black">
            <SyndicateLogo className="w-8 h-8 p-0.5 bg-white/10 rounded-full border border-amber-400/40" />
            <span>جمهورية العراق - نقابة التمريض العراقية | المقر العام</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-amber-500 shrink-0" />
            إدارة خطط لجان التفتيش الميداني
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            تشكيل وإدارة لجان الكشف والرقابة الميدانية، وتعيين الكوادر التمريضية المفتشة، وتحديد مناطق التفتيش المخصصة على مستوى المحافظة، الفرع/القطاع، والأحياء السكنية.
          </p>
        </div>

        <button
          id="btn-open-create-committee-modal"
          onClick={() => setIsModalOpen(true)}
          className="z-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xl hover:shadow-2xl cursor-pointer shrink-0 border border-amber-300 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة لجنة تفتيش جديدة</span>
        </button>
      </div>

      {/* Overview Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold block mb-1">إجمالي لجان التفتيش:</span>
            <span className="text-2xl font-black text-slate-900">{customZones.length}</span>
            <span className="text-[10px] text-amber-700 block mt-1 font-semibold">لجان ميدانية معتمدة بالنقابة</span>
          </div>
          <div className="p-3.5 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold block mb-1">المحافظات المغطاة:</span>
            <span className="text-2xl font-black text-slate-900">
              {new Set(customZones.map(z => z.provinceId)).size} / 18
            </span>
            <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">محافظة تحت التفتيش الفعال</span>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold block mb-1">الممرضون المفتشون المكلفون:</span>
            <span className="text-2xl font-black text-slate-900">
              {allInspectors.length}
            </span>
            <span className="text-[10px] text-blue-700 block mt-1 font-semibold">مفتش معتمد بنقابة التمريض</span>
          </div>
          <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 font-bold block mb-1">الأحياء المشمولة بالتفتيش:</span>
            <span className="text-2xl font-black text-slate-900">
              {customZones.reduce((acc, z) => acc + z.neighborhoods.length, 0)}
            </span>
            <span className="text-[10px] text-purple-700 block mt-1 font-semibold">حي ومحلة سكنية مغطاة</span>
          </div>
          <div className="p-3.5 bg-purple-50 rounded-2xl text-purple-600 border border-purple-100">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            id="search-committee-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم اللجنة، الممرض المفتش، القضاء، أو الحي السكني..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pr-9 pl-3 py-2.5 font-semibold text-slate-900 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <span className="font-bold text-slate-700 shrink-0">تصفية بالمحافظة:</span>
          <select
            id="filter-province-committees"
            value={filterProvinceId}
            onChange={(e) => setFilterProvinceId(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">جميع المحافظات الـ 18</option>
            {provinces.map(p => (
              <option key={p.id} value={p.id}>{p.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Committee Plans Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            سجل لجان التفتيش الميدانية ومناطق تغطيتها ({filteredCustomZones.length})
          </h3>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة لجنة جديدة</span>
          </button>
        </div>

        {filteredCustomZones.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-sm">لا توجد لجان تفتيش مسجلة مطابقة للبحث أو التصفية.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء وتأليف لجنة تفتيش ميداني</span>
            </button>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCustomZones.map((cz) => {
              const prov = provinces.find(p => p.id === cz.provinceId);
              const branch = zones.find(z => z.id === cz.zoneId);

              // Get inspectors details
              const committeeInspectors = cz.assignedInspectorIds.map(id => allInspectors.find(u => u.id === id)).filter(Boolean) as User[];

              return (
                <div
                  key={cz.id}
                  className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 hover:border-amber-400 transition-all shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Committee Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                          {cz.assignedCommitteeName}
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">رمز اللجنة: {cz.id}</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                        لجنة معتمدة
                      </span>
                    </div>

                    {/* Committee Nurse Inspectors */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        الممرضون المفتشون المكلفون باللجنة ({committeeInspectors.length}):
                      </span>

                      <div className="space-y-1.5">
                        {committeeInspectors.length > 0 ? (
                          committeeInspectors.map((ins, idx) => (
                            <div key={ins.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-[11px]">{ins.name}</p>
                                  <p className="text-[9px] text-slate-500 font-mono">شعار النقابة / الشارة: {ins.badgeNumber}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200 dir-ltr">
                                {ins.phone}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[11px] text-amber-700 italic">مفتش معتمد بنقابة التمريض</p>
                        )}
                      </div>
                    </div>

                    {/* Geographic Area & Boundaries */}
                    <div className="text-xs space-y-2 text-slate-700">
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-[11px]">
                        <div>
                          <span className="font-bold text-slate-500 block text-[10px]">المافظة:</span>
                          <span className="font-black text-slate-900">{prov?.nameAr || 'جميع المحافظات'}</span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500 block text-[10px]">الفرع / القطاع:</span>
                          <span className="font-bold text-amber-900">{branch?.nameAr || 'القطاع العام'}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-600 block mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          القضاء والحي / الأحياء المشمولة:
                        </span>
                        <p className="font-bold text-slate-900 text-xs mb-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          {cz.districtArea}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {cz.neighborhoods.map((nh, idx) => (
                            <span key={idx} className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {nh}
                            </span>
                          ))}
                        </div>
                      </div>

                      {cz.geoPointsDescription && (
                        <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600">
                          <span className="font-bold font-sans text-slate-800 block mb-0.5">النطاق والإحداثيات (GPS):</span>
                          {cz.geoPointsDescription}
                        </div>
                      )}

                      {cz.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                          ملاحظات وتوجيهات الخطة: {cz.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-1 text-xs">
                    <button
                      onClick={() => setPrintableZone(cz)}
                      className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 flex items-center gap-1 transition text-[11px] cursor-pointer"
                      title="طباعة الأمر الرسمي للتوزيع الجغرافي"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>الأمر الرسمي</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(cz)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2.5 py-1.5 rounded-xl border border-amber-300 text-[11px] flex items-center gap-1 cursor-pointer transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => setZoneToDelete(cz)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold p-1.5 rounded-xl border border-red-200 cursor-pointer transition"
                        title="حذف خطة التوزيع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {onSelectZoneToFilter && (
                        <button
                          onClick={() => onSelectZoneToFilter(cz)}
                          className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-2.5 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>خريطة</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Inspection Zone Distribution Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="add-committee-modal">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-slate-200 overflow-hidden my-auto text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <SyndicateLogo className="w-9 h-9" />
                <div>
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    {editingZone ? 'تعديل خطة توزيع لجنة التفتيش الميداني' : 'تأليف وتوزيع لجنة تفتيش ميداني على المناطق'}
                  </h3>
                  <p className="text-[11px] text-slate-500">ربط اللجان بالممرضين المفتشين ونطاق التغطية الجغرافية (المحافظة والفرع والحي)</p>
                </div>
              </div>
              <button
                id="close-committee-modal-x"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 text-lg font-bold rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrUpdateSubmit} className="space-y-4 text-xs overflow-y-auto flex-1 my-3 pr-1">
              
              {/* Option to Select Pre-Formed Committee */}
              {committees.length > 0 && (
                <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-1.5">
                  <label className="font-black text-slate-900 text-xs block">
                    اختيار من اللجان المسجلة مسبقاً (اختياري):
                  </label>
                  <select
                    value={selectedCommitteeId}
                    onChange={(e) => handleCommitteeSelectChange(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">-- إنشاء توزيع لجنة جديد / مخصص --</option>
                    {committees.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - {provinces.find(p => p.id === c.provinceId)?.nameAr || ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Committee Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  اسم لجنة التفتيش <span className="text-red-500">*</span>
                </label>
                <input
                  id="committee-name-input"
                  type="text"
                  required
                  value={committeeName}
                  onChange={(e) => setCommitteeName(e.target.value)}
                  placeholder="مثال: لجنة التفتيش والرقابة الميدانية - الرصافة الأولى"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Province, Branch Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">المحافظة (الـ 18 محافظة):</label>
                  <select
                    id="committee-province-select"
                    value={selectedProvinceId}
                    onChange={(e) => setSelectedProvinceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">الفرع النقابي / القطاع:</label>
                  <select
                    id="committee-branch-select"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    {availableBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District Area & Neighborhoods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">اسم القضاء / المنطقة الفرعية:</label>
                  <input
                    id="committee-district-input"
                    type="text"
                    value={districtArea}
                    onChange={(e) => setDistrictArea(e.target.value)}
                    placeholder="مثال: قضاء الكاظمية المقدسة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">الأحياء والمحلات المشمولة (مفصولة بفارزة):</label>
                  <input
                    id="committee-neighborhoods-input"
                    type="text"
                    value={neighborhoodsText}
                    onChange={(e) => setNeighborhoodsText(e.target.value)}
                    placeholder="مثال: حي الشماسية، حي الزهراء، محلة 301"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Head Inspector Selection */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">
                  رئيس اللجنة / المفتش الرئيسي المسؤول:
                </label>
                <select
                  id="committee-head-select"
                  value={committeeHeadId}
                  onChange={(e) => {
                    const newHead = e.target.value;
                    setCommitteeHeadId(newHead);
                    if (!selectedInspectorIds.includes(newHead)) {
                      setSelectedInspectorIds([...selectedInspectorIds, newHead]);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                >
                  {allInspectors.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - (شارة: {u.badgeNumber}) - {u.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Inspector / Single Inspector Selection */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-900 block">
                  أعضاء اللجنة من الممرضين المفتشين (يمكن اختيار شخص واحد أو أكثر):
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {allInspectors.map(u => {
                    const isSelected = selectedInspectorIds.includes(u.id);
                    const isHead = u.id === committeeHeadId;
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs transition cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-50 border-amber-300 font-bold text-slate-900' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleInspectorToggle(u.id)}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                          />
                          <span>{u.name}</span>
                          {isHead && (
                            <span className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.2 rounded">
                              رئيس
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
                <label className="font-bold text-slate-800 block mb-1">توجيهات وملاحظات خطة التفتيش:</label>
                <textarea
                  id="committee-notes-textarea"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات توجيهية خاصة بالمهمة والموقع الجغرافي..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  id="submit-create-committee-btn"
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md cursor-pointer"
                >
                  {editingZone ? 'حفظ وتحديث خطة التوزيع' : 'اعتماد وتكليف اللجنة بالخطة الجغرافية'}
                </button>
                <button
                  id="cancel-create-committee-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Zone Distribution Plan */}
      {zoneToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4 text-right">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">تأكيد حذف خطة وتوزيع اللجنة</h3>
                <p className="text-xs text-slate-500">إجراء غير قابل للتراجع</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-100 font-bold">
              هل أنت متأكد من حذف خطة وتوزيع اللجنة الجغرافية ({zoneToDelete.assignedCommitteeName}) في ({zoneToDelete.districtArea})؟
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteZone}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                نعم، إطراح وحذف الخطة
              </button>
              <button
                type="button"
                onClick={() => setZoneToDelete(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Commission Order Printable Modal */}
      {printableZone && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 shadow-2xl border border-slate-300 overflow-hidden my-auto text-slate-900 text-right dir-rtl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">أمر تشكيل لجنة تفتيشية ميدانية رسمية</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الأمر</span>
                </button>
                <button
                  onClick={() => setPrintableZone(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto flex-1 my-3 pr-1">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 text-xs font-bold">
                <div className="text-right space-y-1">
                  <p>جمهورية العراق</p>
                  <p>نقابة التمريض العراقية</p>
                  <p className="text-amber-900">أمانة الشؤون الميدانية والرقابة</p>
                </div>
                <div className="text-center">
                  <SyndicateLogo className="w-16 h-16 mx-auto" />
                  <p className="text-[10px] text-slate-800 font-black">نقابة التمريض العراقية</p>
                </div>
                <div className="text-left font-mono space-y-1 dir-ltr">
                  <p>Ref: INSP-CMD-{printableZone.id.replace('czone_', '')}</p>
                  <p>Date: {printableZone.createdDate}</p>
                </div>
              </div>

              <div className="text-center my-4">
                <h2 className="text-base font-black underline text-slate-900">أمر إداري بتشكيل لجنة تفتيش ميداني</h2>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                <p>
                  استناداً إلى الصلاحيات المخولة لنقابة التمريض العراقية بموجب قانون النقابة والأحكام والتعليمات الصحية النافذة، تقرر تشكيل لجنة تفتيشية ميدانية باسم:
                  <strong className="text-amber-950 font-black px-1">({printableZone.assignedCommitteeName})</strong>
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-2">
                  <p className="font-bold border-b border-slate-200 pb-1">أولاً: الكوادر والممرضون المفتشون المكلفون باللجنة:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-900 font-semibold">
                    {printableZone.assignedInspectorIds.map(id => {
                      const ins = allInspectors.find(u => u.id === id);
                      return ins ? (
                        <li key={id}>{ins.name} - رقم الشارة والانتساب النقابي: ({ins.badgeNumber})</li>
                      ) : (
                        <li key={id}>مفتش تمريضي معتمد ({id})</li>
                      );
                    })}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-300 space-y-2">
                  <p className="font-bold border-b border-slate-200 pb-1">ثانياً: النطاق الجغرافي ومناطق التفتيش المخصصة:</p>
                  <p><strong>المحافظة والقطاع:</strong> {provinces.find(p => p.id === printableZone.provinceId)?.nameAr || 'عام'} - {printableZone.districtArea}</p>
                  <p><strong>الأحياء السكنية والمحلات:</strong> {printableZone.neighborhoods.join('، ')}</p>
                  {printableZone.geoPointsDescription && (
                    <p className="font-mono text-[11px] text-slate-600"><strong>تحديد النطاق:</strong> {printableZone.geoPointsDescription}</p>
                  )}
                </div>

                <div className="border-t border-slate-300 pt-3">
                  <p className="font-bold">ثالثاً: التوجيهات:</p>
                  <p className="text-slate-700">{printableZone.notes || 'على اللجنة الالتزام بالمهام الموكلة وتدقيق الهويات النقابية وتراخيص فتح العيادات والمنشآت وتزويد النقابة بالتقارير الميدانية فوراً.'}</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs font-bold border-t-2 border-slate-900">
                <div>
                  <p className="text-slate-600">رئيس لجنة التفتيش المكلف</p>
                  <p className="mt-8 text-slate-900 font-black">التوقيع والختم</p>
                </div>
                <div>
                  <p className="text-slate-600">نقيب التمريض العراقي / المقر العام</p>
                  <p className="mt-8 text-slate-900 font-black">التوقيع والختم الرسمي</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
