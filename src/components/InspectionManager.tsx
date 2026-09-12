import React, { useState } from 'react';
import { InspectionAssignment, Facility, User, PriorityLevel } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { ClipboardList, Plus, Calendar, UserCheck, ShieldAlert, CheckCircle2, Clock, MapPin, Send } from 'lucide-react';

interface InspectionManagerProps {
 assignments: InspectionAssignment[];
 facilities: Facility[];
 currentUser: User;
 onCreateAssignment: (newAssignmentData: any) => void;
 preselectedFacility?: Facility | null;
 onNavigateToZones?: () => void;
}

export const InspectionManager: React.FC<InspectionManagerProps> = ({
 assignments,
 facilities,
 currentUser,
 onCreateAssignment,
 preselectedFacility,
 onNavigateToZones
}) => {
 const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
 preselectedFacility ? preselectedFacility.id : facilities[0]?.id || ''
 );
 const [assignedInspectorId, setAssignedInspectorId] = useState<string>('user_5'); // Ali Al-Kaabi
 const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
 const [priority, setPriority] = useState<PriorityLevel>('HIGH');
 const [notes, setNotes] = useState<string>('');
 const [isModalOpen, setIsModalOpen] = useState<boolean>(!!preselectedFacility);

 const inspectors = INITIAL_USERS.filter(u => u.role === 'FIELD_INSPECTOR');

 const handleSubmitNewAssignment = (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedFacilityId) return;

 onCreateAssignment({
 facilityId: selectedFacilityId,
 assignedInspectorId,
 scheduledDate,
 priority,
 notes,
 assignedByUserId: currentUser.id
 });

 setNotes('');
 setIsModalOpen(false);
 };

 return (
 <div className="space-y-6" id="inspection-manager-view">
 {/* Top Banner */}
 <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
 <ClipboardList className="w-4 h-4" />
 <span>نظام الجدولة والتوزيع الجغرافي للمهمات</span>
 </div>
 <h2 className="text-xl font-bold text-slate-100">إدارة خطط لجان التفتيش الميداني</h2>
 <p className="text-xs text-slate-400 mt-1">
 جدولة وتوزيع خطط التفتيش على المفتشين الميدانيين مع التحديد الجغرافي المسبق للإحداثيات
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {onNavigateToZones && (
 <button
 id="open-zones-mgr-btn"
 onClick={onNavigateToZones}
 className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-2 transition border border-slate-700"
 >
 <ShieldAlert className="w-4 h-4 text-amber-400" />
 <span>إدارة وتسمية الزونات واللجان</span>
 </button>
 )}

 <button
 id="open-schedule-modal-btn"
 onClick={() => setIsModalOpen(true)}
 className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
 >
 <Plus className="w-4 h-4" />
 <span>جدولة مَهمّة كشف ميداني جديدة</span>
 </button>
 </div>
 </div>

 {/* Assignments List Table */}
 <div className="bg-[var(--theme-card-bg)] rounded-2xl border border-[var(--theme-card-border)] shadow-sm overflow-hidden" id="assignments-table-container">
 <div className="p-4 border-b border-[var(--theme-card-border)] flex items-center justify-between">
 <h3 className="font-bold text-[var(--theme-text-primary)] text-sm flex items-center gap-2">
 <Clock className="w-4 h-4 text-amber-600" />
 جدول المهمات التفتيشية المجدولة والأنشطة الميدانية ({assignments.length})
 </h3>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-right text-xs" id="assignments-table">
 <thead className="bg-slate-900 text-slate-200 text-[11px] font-bold uppercase">
 <tr>
 <th className="p-3.5">رمز المهمة</th>
 <th className="p-3.5">المنشأة والحي المستهدف</th>
 <th className="p-3.5">المفتش المكلف</th>
 <th className="p-3.5">تاريخ التفتيش</th>
 <th className="p-3.5">الأولوية</th>
 <th className="p-3.5">حالة التنفيذ</th>
 <th className="p-3.5">التوجيهات والتعليمات</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {assignments.map((a) => (
 <tr key={a.id} className="hover:bg-amber-50/30 transition">
 <td className="p-3.5 font-mono font-bold text-amber-800">
 {a.assignmentCode}
 </td>

 <td className="p-3.5">
 <p className="font-bold text-[var(--theme-text-primary)]">{a.facilityName}</p>
 <p className="text-[10px] text-[var(--theme-text-muted)] flex items-center gap-1">
 <MapPin className="w-3 h-3 text-amber-600" />
 {a.facilityAddress}
 </p>
 </td>

 <td className="p-3.5 font-semibold text-[var(--theme-text-primary)]">
 <div className="flex items-center gap-1.5">
 <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
 <span>{a.assignedInspectorName}</span>
 </div>
 </td>

 <td className="p-3.5 font-mono text-[var(--theme-text-primary)]">
 {a.scheduledDate}
 </td>

 <td className="p-3.5">
 <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
 a.priority === 'URGENT' ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' :
 a.priority === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
 'bg-blue-100 text-blue-800'
 }`}>
 {a.priority === 'URGENT' ? 'طارئة جداً' : a.priority === 'HIGH' ? 'عالية' : 'عادية'}
 </span>
 </td>

 <td className="p-3.5">
 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
 a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
 a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 animate-pulse' :
 'bg-[var(--theme-canvas)] text-[var(--theme-text-primary)]'
 }`}>
 {a.status === 'COMPLETED' ? 'مكتملة الميدان' :
 a.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : 'معلقة (بانتظار المفتش)'}
 </span>
 </td>

 <td className="p-3.5 text-[var(--theme-text-muted)] max-w-xs truncate text-[11px]">
 {a.notes || 'لا توجد ملاحظات إضافية'}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Schedule Assignment Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="schedule-assignment-modal">
 <div className="bg-[var(--theme-card-bg)] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col p-5 sm:p-6 shadow-2xl border border-[var(--theme-card-border)] overflow-hidden my-auto">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3 shrink-0">
 <h3 className="font-bold text-[var(--theme-text-primary)] text-base flex items-center gap-2">
 <Send className="w-5 h-5 text-amber-600" />
 تخصيص وصدور أمر تفتيش ميداني
 </h3>
 <button
 id="close-modal-x"
 onClick={() => setIsModalOpen(false)}
 className="text-slate-400 hover:text-[var(--theme-text-primary)] text-lg font-bold cursor-pointer"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleSubmitNewAssignment} className="space-y-4 text-xs overflow-y-auto flex-1 my-2 pr-1">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">اختيار المنشأة المستهدفة:</label>
 <select
 id="modal-facility-select"
 value={selectedFacilityId}
 onChange={(e) => setSelectedFacilityId(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
 >
 {facilities.map((f) => (
 <option key={f.id} value={f.id}>
 {f.name} ({f.neighborhood} - إجازة: {f.licenseNumber})
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">المفتش الميداني المكلف حصراً:</label>
 <select
 id="modal-inspector-select"
 value={assignedInspectorId}
 onChange={(e) => setAssignedInspectorId(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
 >
 {inspectors.map((ins) => (
 <option key={ins.id} value={ins.id}>
 {ins.name} ({ins.badgeNumber})
 </option>
 ))}
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">تاريخ الزيارة المقررة:</label>
 <input
 id="modal-scheduled-date"
 type="date"
 value={scheduledDate}
 onChange={(e) => setScheduledDate(e.target.value)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">مستوى الأولوية:</label>
 <select
 id="modal-priority-select"
 value={priority}
 onChange={(e) => setPriority(e.target.value as PriorityLevel)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 font-semibold focus:border-amber-500 focus:outline-none"
 >
 <option value="LOW">عادية</option>
 <option value="MEDIUM">متوسطة</option>
 <option value="HIGH">عالية</option>
 <option value="URGENT">طارئة جداً</option>
 </select>
 </div>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] block mb-1">التوجيهات والمهام المطلوبة من المفتش:</label>
 <textarea
 id="modal-notes-input"
 rows={3}
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="مثال: فحص هوية التمريضيين ومطابقة أكياس النفايات الطبية وتدقيق الترخيص النقابي..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
 />
 </div>

 <div className="flex items-center gap-2 pt-2 border-t border-[var(--theme-card-border)]">
 <button
 id="submit-assignment-btn"
 type="submit"
 className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition"
 >
 إرسال أمر التفتيش للمفتش الميداني
 </button>
 <button
 id="cancel-assignment-btn"
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="bg-[var(--theme-canvas)] hover:bg-slate-200 text-[var(--theme-text-primary)] font-bold py-2.5 px-4 rounded-xl text-xs transition"
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
