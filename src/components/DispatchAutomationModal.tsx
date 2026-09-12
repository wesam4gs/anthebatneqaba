import React, { useState } from 'react';
import { 
  Send, Mail, Bell, CheckCircle2, Clock, AlertTriangle, X, Sparkles, 
  Users, Smartphone, Calendar, FileText, Check, ShieldAlert, Radio, RefreshCw
} from 'lucide-react';
import { Facility, User } from '../types';

interface DispatchAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  currentUser: User;
}

interface DispatchLog {
  id: string;
  recipient: string;
  type: 'LICENSE_RENEWAL' | 'EMERGENCY_BROADCAST' | 'GENERAL_DIRECTIVE';
  channel: 'SMS' | 'EMAIL' | 'PUSH';
  subject: string;
  status: 'DELIVERED' | 'SENDING' | 'SCHEDULED';
  timestamp: string;
}

export const DispatchAutomationModal: React.FC<DispatchAutomationModalProps> = ({
  isOpen,
  onClose,
  facilities,
  currentUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'WATCHDOG' | 'BROADCAST' | 'LOGS'>('WATCHDOG');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [customBroadcastText, setCustomBroadcastText] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<'SMS' | 'EMAIL' | 'PUSH'>('SMS');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentNoticeSuccess, setSentNoticeSuccess] = useState<string | null>(null);

  // Expiring facilities (&lt; 60 days or expired)
  const expiringFacilities = facilities.filter(f => {
    if (!f.licenseExpiryDate) return false;
    const exp = new Date(f.licenseExpiryDate);
    const diffDays = Math.ceil((exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 60;
  });

  const [dispatchLogs, setDispatchLogs] = useState<DispatchLog[]>([
    {
      id: 'log-1',
      recipient: 'مركز الشفاء التمريضي - بغداد',
      type: 'LICENSE_RENEWAL',
      channel: 'SMS',
      subject: 'إنذار اقتراب انتهاء إجازة ممارسة المهنة (متبقي 14 يوم)',
      status: 'DELIVERED',
      timestamp: 'اليوم، 10:30 ص'
    },
    {
      id: 'log-2',
      recipient: 'كافة مفتشي قطاع الرصافة الأولى',
      type: 'EMERGENCY_BROADCAST',
      channel: 'PUSH',
      subject: 'حملة تفتيشية مسائية مشتركة للعيادات غير المرخصة',
      status: 'DELIVERED',
      timestamp: 'اليوم، 09:15 ص'
    },
    {
      id: 'log-3',
      recipient: 'عيادة الأمل التمريضية - الكرخ',
      type: 'LICENSE_RENEWAL',
      channel: 'EMAIL',
      subject: 'إشعار مراجعة النقابة لتجديد تصريح النفايات الطبية',
      status: 'DELIVERED',
      timestamp: 'أمس، 02:40 م'
    }
  ]);

  if (!isOpen) return null;

  const handleSendSingleRenewalNotice = (facility: Facility) => {
    setIsSending(true);
    setTimeout(() => {
      const newLog: DispatchLog = {
        id: `log-${Date.now()}`,
        recipient: facility.name,
        type: 'LICENSE_RENEWAL',
        channel: 'SMS',
        subject: `إنذار أوتوماتيكي لتجديد إجازة المنشأة رقم (${facility.licenseNumber || 'N/A'})`,
        status: 'DELIVERED',
        timestamp: 'الآن'
      };
      setDispatchLogs(prev => [newLog, ...prev]);
      setIsSending(false);
      setSentNoticeSuccess(`تم إرسال إشعار التجديد التلقائي إلى ${facility.name}`);
      setTimeout(() => setSentNoticeSuccess(null), 3000);
    }, 800);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBroadcastText.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const targetLabel = selectedGovernorate === 'all' ? 'عموم المحافظات' : `محافظة ${selectedGovernorate}`;
      const newLog: DispatchLog = {
        id: `log-${Date.now()}`,
        recipient: `لجان التفتيش (${targetLabel})`,
        type: 'EMERGENCY_BROADCAST',
        channel: selectedChannel,
        subject: customBroadcastText.substring(0, 45) + '...',
        status: 'DELIVERED',
        timestamp: 'الآن'
      };
      setDispatchLogs(prev => [newLog, ...prev]);
      setCustomBroadcastText('');
      setIsSending(false);
      setSentNoticeSuccess(`تم بث التوجيه بنجاح إلى فرق ${targetLabel}`);
      setTimeout(() => setSentNoticeSuccess(null), 3000);
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#091528]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl max-w-2xl w-full h-[88vh] max-h-[750px] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.2)] text-slate-100 overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-[#0d1e38]/90 px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <div className="w-full h-full bg-[#091528] rounded-[10px] flex items-center justify-center">
                <Send className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">أتمتة الإشعارات والتنبيهات الميدانية</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
                  GMPlus Dispatch
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 font-medium">مراقبة التراخيص وبث البرقيات التلقائي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="bg-[#071120]/80 px-4 py-2 border-b border-white/5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('WATCHDOG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'WATCHDOG'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              مراقبة التراخيص ({expiringFacilities.length})
            </button>
            <button
              onClick={() => setActiveSubTab('BROADCAST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'BROADCAST'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              بث برقية أو توجيه ميداني
            </button>
            <button
              onClick={() => setActiveSubTab('LOGS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeSubTab === 'LOGS'
                  ? 'bg-emerald-600 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              سجل الإرسال ({dispatchLogs.length})
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {sentNoticeSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-200 flex items-center gap-2 font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{sentNoticeSuccess}</span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {activeSubTab === 'WATCHDOG' && (
            <div className="space-y-3">
              <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-white">المنشآت التي تتطلب إنذار تجديد فوري:</h4>
                  <p className="text-[10px] text-slate-300">يتم إرسال رسائل نصية أو بريد آلي عند بقاء أقل من 60 يوماً على انتهاء الترخيص.</p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                  {expiringFacilities.length} منشأة
                </span>
              </div>

              {expiringFacilities.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-white">كافة المنشآت تملك تراخيص سارية المفعول!</p>
                </div>
              ) : (
                expiringFacilities.map(f => (
                  <div key={f.id} className="bg-slate-900/70 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{f.name}</h5>
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">
                          {f.governorate || 'بغداد'}
                        </span>
                      </div>
                      <p className="text-[10px] text-amber-300 font-mono">
                        انتهاء الإجازة: {f.licenseExpiryDate}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        رقم الهاتف: {f.phone || '07701234567'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSendSingleRenewalNotice(f)}
                      disabled={isSending}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5 rotate-180" />
                      <span>إرسال إنذار آلي</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeSubTab === 'BROADCAST' && (
            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div className="bg-slate-900/70 border border-white/10 p-3.5 rounded-2xl space-y-3">
                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">الجهة المستهدفة بالبث:</label>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="all">كافة لجان التفتيش بعموم العراق (بث شامل)</option>
                    <option value="بغداد">لجان تفتيش بغداد (الكرخ والرصافة)</option>
                    <option value="البصرة">لجان تفتيش البصرة</option>
                    <option value="النجف">لجان تفتيش النجف الأشرف</option>
                    <option value="نينوى">لجان تفتيش نينوى</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">قناة الإرسال:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['SMS', 'EMAIL', 'PUSH'] as const).map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setSelectedChannel(ch)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          selectedChannel === ch
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                            : 'bg-slate-950 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {ch === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                        {ch === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                        {ch === 'PUSH' && <Bell className="w-3.5 h-3.5" />}
                        <span>{ch}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1.5">نص البرقية / التوجيه الميداني:</label>
                  <textarea
                    rows={4}
                    value={customBroadcastText}
                    onChange={(e) => setCustomBroadcastText(e.target.value)}
                    placeholder="اكتب التوجيه الرقابي أو تفاصيل الحملة المشتركة..."
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSending || !customBroadcastText.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
                    <span>بث البرقية فوراً لكافة الفرق</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeSubTab === 'LOGS' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>سجل المراسلات والبرقيات المرسلة آلياً:</span>
                <span>{dispatchLogs.length} سجلات</span>
              </div>

              {dispatchLogs.map(log => (
                <div key={log.id} className="bg-slate-900/70 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{log.recipient}</span>
                      <span className="text-[9px] bg-slate-800 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                        {log.channel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{log.subject}</p>
                    <span className="text-[9px] font-mono text-slate-400 block">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded-xl border border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التسليم</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
