import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Star, MapPin, Briefcase, Mail, Phone, Hash, Award, Activity, Calendar, Download, FileText, Lock, CheckCircle2, Search } from 'lucide-react';

interface AccountProfileProps {
  user: User;
  isMobile?: boolean;
  onUpdateUser?: (updatedUser: User) => void;
}

export const AccountProfile: React.FC<AccountProfileProps> = ({ user, isMobile = false, onUpdateUser }) => {
  const [activeSubTab, setActiveSubTab] = useState<'INFO' | 'ACTIVITY' | 'PASSWORD'>('INFO');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const totalInspections = Math.floor(Math.random() * 50) + 120;
  const totalTasks = totalInspections + 45;
  const totalDiscoveries = Math.floor(totalInspections * 0.4);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus('ERROR');
      return;
    }
    setPasswordStatus('SUCCESS');
    if (onUpdateUser) {
      onUpdateUser({ ...user, password: newPassword });
    }
    setTimeout(() => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStatus('IDLE');
    }, 2000);
  };

  const handleExport = (type: 'EXCEL' | 'PDF') => {
    alert(`جاري تصدير نشاطات المفتش بصيغة ${type}...`);
  };

  const renderInfo = () => (
    <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMobile ? 'pb-12 text-slate-200' : ''}`}>
      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800 text-white' : 'bg-white border border-slate-200'} rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-10"></div>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-900 to-slate-800 border-4 border-slate-700 shadow-lg flex items-center justify-center mb-4 relative z-10">
          <UserIcon className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className={`text-xl font-black ${isMobile ? 'text-white' : 'text-slate-800'}`}>{user.name}</h2>
        <p className={`text-sm font-bold ${isMobile ? 'text-emerald-400' : 'text-indigo-600'} mb-2`}>{user.roleTitle || 'مفتش ميداني معتمد'}</p>
        
        <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
          <span className="text-amber-300 font-bold text-sm">{user.rating || '4.9'}</span>
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        </div>
      </div>

      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-5 shadow-sm space-y-4`}>
        <h3 className={`text-sm font-black flex items-center gap-2 border-b pb-2 ${isMobile ? 'text-white border-slate-800' : 'text-slate-800 border-slate-200/50'}`}>
          <Hash className="w-4 h-4 text-emerald-400" />
          المعلومات الوظيفية والاعتماد النقابي
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">اسم المستخدم</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.username || 'غير محدد'}</div>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">الرقم الوظيفي (النقابة)</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-amber-300 font-mono border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.employeeId || `EMP-2025-${user.id}`}</div>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">رقم الهوية النقابية</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-emerald-300 font-mono border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.badgeNumber || 'INSP-IRQ-998'}</div>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">التحصيل الدراسي</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.educationQualification || 'بكالوريوس علوم تمريض'}</div>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-5 shadow-sm space-y-4`}>
        <h3 className={`text-sm font-black flex items-center gap-2 border-b pb-2 ${isMobile ? 'text-white border-slate-800' : 'text-slate-800 border-slate-200/50'}`}>
          <MapPin className="w-4 h-4 text-emerald-400" />
          النطاق الجغرافي والزون المكلف به
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">المحافظة</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.provinceName || user.governorate || 'كافة المحافظات'}</div>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold mb-1">القضاء / المنطقة</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 text-slate-700 border-slate-100'}`}>{user.district || 'الرصافة / الكرخ'}</div>
          </div>
          <div className="col-span-2">
            <span className="block text-[10px] text-slate-400 font-bold mb-1">الزون المخصص</span>
            <div className={`font-semibold text-sm px-3 py-2 rounded-xl border ${isMobile ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>{user.assignedZoneName || 'المنطقة الصحية التخصصية الأولى'}</div>
          </div>
        </div>
      </div>

      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-5 shadow-sm space-y-4`}>
        <h3 className={`text-sm font-black flex items-center gap-2 border-b pb-2 ${isMobile ? 'text-white border-slate-800' : 'text-slate-800 border-slate-200/50'}`}>
          <Phone className="w-4 h-4 text-emerald-400" />
          معلومات التواصل
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 border-slate-100'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/30">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold">رقم الهاتف</span>
              <span className="font-bold text-sm" dir="ltr">{user.phone}</span>
            </div>
          </div>
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMobile ? 'bg-slate-800 text-white border-slate-700' : 'bg-white/50 border-slate-100'}`}>
            <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0 border border-rose-500/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-bold">البريد الإلكتروني</span>
              <span className="font-bold text-sm">{user.email || 'inspector@iraqi-nursing.org'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMobile ? 'pb-12 text-slate-200' : ''}`}>
      
      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-5 shadow-sm`}>
        <h3 className={`text-sm font-black flex items-center gap-2 mb-4 ${isMobile ? 'text-white' : 'text-slate-800'}`}>
          <Calendar className="w-4 h-4 text-emerald-400" />
          تحديد فترة النشاط الميداني
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="block text-[10px] text-slate-400 font-bold mb-1">من تاريخ</span>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${isMobile ? 'bg-slate-800 text-white border-slate-700 focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
            />
          </div>
          <div className="flex-1">
            <span className="block text-[10px] text-slate-400 font-bold mb-1">إلى تاريخ</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs outline-none border ${isMobile ? 'bg-slate-800 text-white border-slate-700 focus:border-emerald-500' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
            />
          </div>
          <div className="pt-4">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md transition cursor-pointer">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <Award className="w-12 h-12 absolute -left-2 -bottom-2 opacity-20" />
          <span className="block text-emerald-100 text-[10px] font-bold mb-1">إجمالي المهام المنجزة</span>
          <span className="block text-3xl font-black">{totalTasks}</span>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
          <Activity className="w-12 h-12 absolute -left-2 -bottom-2 opacity-20" />
          <span className="block text-blue-100 text-[10px] font-bold mb-1">جولات التفتيش</span>
          <span className="block text-3xl font-black">{totalInspections}</span>
        </div>
        <div className="col-span-2 bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
          <div>
            <span className="block text-amber-100 text-[10px] font-bold mb-1">عدد الكشوفات (المنشآت)</span>
            <span className="block text-3xl font-black">{totalDiscoveries}</span>
          </div>
          <FileText className="w-12 h-12 opacity-30" />
        </div>
      </div>

      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-5 shadow-sm space-y-4 mt-4`}>
        <h3 className={`text-sm font-black flex items-center gap-2 mb-2 ${isMobile ? 'text-white' : 'text-slate-800'}`}>
          <Download className="w-4 h-4 text-emerald-400" />
          تصدير التقرير الميداني
        </h3>
        <p className="text-xs text-slate-400 mb-4">يمكنك تصدير السجل الإلكتروني لنشاطاتك خلال الفترة المحددة أعلاه.</p>
        
        <div className="flex gap-3">
          <button 
            onClick={() => handleExport('EXCEL')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            بصيغة Excel
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            بصيغة PDF
          </button>
        </div>
      </div>

    </div>
  );

  const renderPassword = () => (
    <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isMobile ? 'pb-12 text-slate-200' : ''}`}>
      <div className={`${isMobile ? 'bg-slate-900/90 border border-slate-800' : 'bg-white border border-slate-200'} rounded-3xl p-6 shadow-sm`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isMobile ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
          <Lock className="w-8 h-8" />
        </div>
        <h2 className={`text-center text-lg font-black mb-2 ${isMobile ? 'text-white' : 'text-slate-800'}`}>تغيير كلمة المرور</h2>
        <p className="text-center text-xs text-slate-400 mb-6">يرجى إدخال كلمة المرور الحالية ثم تعيين كلمة مرور جديدة قوية لحماية حسابك.</p>

        {passwordStatus === 'SUCCESS' && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 animate-in zoom-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            تم تحديث كلمة المرور بنجاح!
          </div>
        )}
        
        {passwordStatus === 'ERROR' && (
          <div className="bg-rose-500/20 border border-rose-500/40 text-rose-300 p-3 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 animate-in zoom-in">
            كلمة المرور الجديدة غير متطابقة!
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الحالية</label>
            <input 
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition ${isMobile ? 'bg-slate-800 text-white border-slate-700 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`} 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور الجديدة</label>
            <input 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition ${isMobile ? 'bg-slate-800 text-white border-slate-700 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`} 
              placeholder="••••••••" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition ${isMobile ? 'bg-slate-800 text-white border-slate-700 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`} 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            disabled={!oldPassword || !newPassword || !confirmPassword || passwordStatus === 'SUCCESS'}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20 mt-4 cursor-pointer text-sm"
          >
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-full flex flex-col ${isMobile ? 'p-1' : 'p-0'}`}>
      
      <div className={`flex items-center justify-between p-1 rounded-2xl mb-4 shadow-sm border ${
        isMobile ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button 
          onClick={() => setActiveSubTab('INFO')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeSubTab === 'INFO' 
              ? (isMobile ? 'bg-emerald-600 text-white shadow' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/50') 
              : (isMobile ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')
          }`}
        >
          <UserIcon className="w-4 h-4" />
          معلوماتي
        </button>
        <button 
          onClick={() => setActiveSubTab('ACTIVITY')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeSubTab === 'ACTIVITY' 
              ? (isMobile ? 'bg-emerald-600 text-white shadow' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/50') 
              : (isMobile ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')
          }`}
        >
          <Activity className="w-4 h-4" />
          نشاطاتي
        </button>
        <button 
          onClick={() => setActiveSubTab('PASSWORD')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 cursor-pointer ${
            activeSubTab === 'PASSWORD' 
              ? (isMobile ? 'bg-emerald-600 text-white shadow' : 'bg-white text-indigo-700 shadow-sm border border-slate-200/50') 
              : (isMobile ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')
          }`}
        >
          <Lock className="w-4 h-4" />
          الأمان
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
        {activeSubTab === 'INFO' && renderInfo()}
        {activeSubTab === 'ACTIVITY' && renderActivity()}
        {activeSubTab === 'PASSWORD' && renderPassword()}
      </div>

    </div>
  );
};
