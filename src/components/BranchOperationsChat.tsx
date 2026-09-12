import React, { useState, useRef, useEffect } from 'react';
import { 
 BranchChatMessage, 
 DisciplineBroadcast, 
 User, 
 Province, 
 Facility, 
 ViolationRecord 
} from '../types';
import { 
 Send, 
 Radio, 
 ShieldAlert, 
 AlertCircle, 
 Building, 
 MapPin, 
 Search, 
 Bell, 
 Paperclip, 
 Gavel, 
 Users, 
 Lock, 
 FileWarning, 
 Plus, 
 Megaphone,
 ShieldCheck,
 Compass,
 Globe2,
 HelpCircle,
 CheckCircle2,
 Info
} from 'lucide-react';
import { 
 canUserBroadcastNationwide, 
 canUserAccessAllProvinces, 
 getUserGeographicScope,
 getUserRoleTitle 
} from '../utils/rolesAndPermissions';
import { RolesPermissionsModal } from './RolesPermissionsModal';
import { INITIAL_USERS } from '../data/initialData';

interface BranchOperationsChatProps {
 messages: BranchChatMessage[];
 broadcasts: DisciplineBroadcast[];
 currentUser: User;
 provinces: Province[];
 facilities: Facility[];
 violations: ViolationRecord[];
 users?: User[];
 onSendMessage: (message: BranchChatMessage) => void;
 onAddBroadcast: (broadcast: DisciplineBroadcast) => void;
 onSelectUser?: (user: User) => void;
}

export const BranchOperationsChat: React.FC<BranchOperationsChatProps> = ({
 messages,
 broadcasts,
 currentUser,
 provinces,
 facilities,
 violations,
 users = INITIAL_USERS,
 onSendMessage,
 onAddBroadcast,
 onSelectUser
}) => {
 const isNationwide = canUserAccessAllProvinces(currentUser);
 const canBroadcast = canUserBroadcastNationwide(currentUser);

 // Default active channel: user's province channel if field inspector, or national_broadcasts if nationwide
 const userDefaultChannel = currentUser.provinceId && currentUser.provinceId !== 'all' 
 ? `province_${currentUser.provinceId}` 
 : 'national_broadcasts';

 const [activeChannel, setActiveChannel] = useState<string>(userDefaultChannel);
 const [inputText, setInputText] = useState('');
 const [messageType, setMessageType] = useState<'TEXT' | 'URGENT_DISPATCH' | 'CLOSURE_ORDER' | 'LOCATION_ALERT'>('TEXT');
 const [showBroadcastModal, setShowBroadcastModal] = useState(false);
 const [showRolesModal, setShowRolesModal] = useState(false);
 const [chatSearch, setChatSearch] = useState('');
 const [accessDeniedNotice, setAccessDeniedNotice] = useState<string | null>(null);

 // New Broadcast Form State
 const [broadcastTitle, setBroadcastTitle] = useState('');
 const [broadcastSummary, setBroadcastSummary] = useState('');
 const [broadcastUrgency, setBroadcastUrgency] = useState<'URGENT' | 'IMPORTANT' | 'REGULAR'>('URGENT');
 const [broadcastAction, setBroadcastAction] = useState('');

 const messagesEndRef = useRef<HTMLDivElement>(null);

 // Keep channel aligned if user switches account
 useEffect(() => {
 if (!isNationwide && currentUser.provinceId && currentUser.provinceId !== 'all') {
 const allowedProvChannel = `province_${currentUser.provinceId}`;
 if (activeChannel !== 'national_broadcasts' && activeChannel !== allowedProvChannel) {
 setActiveChannel(allowedProvChannel);
 }
 }
 }, [currentUser.id, currentUser.provinceId, isNationwide]);

 // Build Channels List
 // 1. National Broadcasts Channel (Always visible to all inspectors)
 const nationalChannel = {
 id: 'national_broadcasts',
 name: 'القناة المركزية للتعميمات والتبليغات العامة',
 subtitle: 'المقر العام — شامل لكافة المحافظات الـ 18',
 badge: 'HQ-ALL',
 isNational: true,
 provinceId: 'all'
 };

 // 2. Province Channels
 const provinceChannels = provinces.map(p => ({
 id: `province_${p.id}`,
 name: `غرفة تفتيش وعمليات ${p.nameAr}`,
 subtitle: `مفرزة ولجان التفتيش الميداني في ${p.nameAr}`,
 badge: p.nameAr.slice(0, 4),
 isNational: false,
 provinceId: p.id
 }));

 const allChannels = [nationalChannel, ...provinceChannels];

 // Check if current user can view a given channel
 const canAccessChannel = (chId: string, provId: string): boolean => {
 if (chId === 'national_broadcasts') return true; // Everyone can view the national directives
 if (isNationwide) return true; // Syndicate head, deputy, Baghdad HQ can view all
 return currentUser.provinceId === provId;
 };

 const handleChannelSelect = (chId: string, provId: string, chName: string) => {
 if (canAccessChannel(chId, provId)) {
 setActiveChannel(chId);
 setAccessDeniedNotice(null);
 } else {
 const currentProvName = currentUser.provinceName || 'محافظتك المحددة';
 setAccessDeniedNotice(
 `🔒 إجراء أمني نقابي: صلاحيتك كمفتش ميداني محصورة بمحافظة (${currentProvName}) فقط. يمنع النظام تواصلك مع مفتشي (${chName})، لضمان السرية والولاية المكانية للجان التفتيش. يمكنك فقط التواصل مع زملائك في ${currentProvName} واستقبال التبليغات العامة المركزية.`
 );
 }
 };

 // Filter messages for current channel
 const channelMessages = messages.filter(m => {
 if (activeChannel === 'national_broadcasts') {
 return m.channelId === 'national_broadcasts' || m.isNationwideBroadcast === true;
 }
 return m.channelId === activeChannel;
 });

 const filteredMessages = channelMessages.filter(m => 
 !chatSearch.trim() || 
 m.messageText.toLowerCase().includes(chatSearch.toLowerCase()) ||
 m.senderName.toLowerCase().includes(chatSearch.toLowerCase())
 );

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [channelMessages.length, activeChannel]);

 // Handle Send Message
 const handleSend = (e: React.FormEvent) => {
 e.preventDefault();
 if (!inputText.trim()) return;

 // Check if posting to national_broadcasts without authority
 if (activeChannel === 'national_broadcasts' && !canBroadcast) {
 alert('عذراً، التبليغات العامة لكافة المحافظات محصورة بالنقيب العام، نائبه، ومسؤول فرع بغداد/المقر العام. يرجى إرسال التوجيهات ضمن غرفة محافظتك.');
 return;
 }

 const currentChannelObj = allChannels.find(c => c.id === activeChannel);

 const newMsg: BranchChatMessage = {
 id: `msg_${Date.now()}`,
 channelId: activeChannel,
 senderId: currentUser.id,
 senderName: currentUser.name,
 senderRole: currentUser.role,
 senderRoleTitle: getUserRoleTitle(currentUser),
 senderBadge: currentUser.badgeNumber,
 provinceId: currentUser.provinceId,
 provinceName: currentUser.provinceName,
 messageText: inputText.trim(),
 timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
 type: messageType,
 isNationwideBroadcast: activeChannel === 'national_broadcasts',
 broadcastTarget: activeChannel === 'national_broadcasts' ? 'ALL_BRANCHES' : 'PROVINCE_ONLY'
 };

 onSendMessage(newMsg);
 setInputText('');
 setMessageType('TEXT');
 };

 // Handle New General Broadcast
 const handleCreateBroadcast = (e: React.FormEvent) => {
 e.preventDefault();
 if (!broadcastTitle.trim() || !broadcastSummary.trim()) return;

 const newBrd: DisciplineBroadcast = {
 id: `brd_${Date.now()}`,
 code: `CIRC-2026-${Math.floor(100 + Math.random() * 900)}`,
 title: broadcastTitle,
 summary: broadcastSummary,
 urgency: broadcastUrgency,
 issuedBy: `${currentUser.name} (${getUserRoleTitle(currentUser)})`,
 targetScope: 'ALL_BRANCHES',
 issueDate: new Date().toISOString().split('T')[0],
 actionRequired: broadcastAction || 'تعميم نافذ على جميع فروع ولجان التفتيش في المحافظات الـ 18',
 isActive: true
 };

 onAddBroadcast(newBrd);
 setShowBroadcastModal(false);
 setBroadcastTitle('');
 setBroadcastSummary('');
 setBroadcastAction('');

 // Post to National Broadcasts channel
 const dispatchMsg: BranchChatMessage = {
 id: `msg_${Date.now()}_nat`,
 channelId: 'national_broadcasts',
 senderId: currentUser.id,
 senderName: currentUser.name,
 senderRole: currentUser.role,
 senderRoleTitle: getUserRoleTitle(currentUser),
 senderBadge: currentUser.badgeNumber,
 provinceId: 'all',
 provinceName: 'عموم العراق',
 messageText: `📢 [تبليغ عام صادر من المقر العام رقم ${newBrd.code}]: ${newBrd.title}\n\n${newBrd.summary}`,
 timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
 type: 'CENTRAL_BROADCAST',
 isNationwideBroadcast: true,
 broadcastTarget: 'ALL_BRANCHES'
 };
 onSendMessage(dispatchMsg);
 };

 const getRoleBadge = (role: string, roleTitle?: string) => {
 if (roleTitle?.includes('نقيب التمريض')) {
 return <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-400">نقيب التمريض (المقر العام)</span>;
 }
 if (roleTitle?.includes('نائب نقيب')) {
 return <span className="bg-indigo-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-indigo-400">نائب نقيب التمريض</span>;
 }
 if (roleTitle?.includes('فرع بغداد') || roleTitle?.includes('المقر العام')) {
 return <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full border border-blue-400">مسؤول فرع بغداد / المقر العام</span>;
 }
 switch (role) {
 case 'HIGH_COMMAND':
 return <span className="bg-amber-500/20 text-amber-500 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">القيادة العليا</span>;
 case 'BRANCH_DIRECTOR':
 return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">{roleTitle || 'مدير الفرع'}</span>;
 case 'INSPECTION_DIRECTOR':
 return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">{roleTitle || 'مدير التفتيش'}</span>;
 default:
 return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">{roleTitle || 'مفتش ميداني'}</span>;
 }
 };

 const activeBroadcast = broadcasts.find(b => b.isActive && b.urgency === 'URGENT');
 const activeChannelObj = allChannels.find(c => c.id === activeChannel);

 // Active inspectors in current channel's province
 const currentChannelProvinceUsers = users.filter(u => {
 if (activeChannel === 'national_broadcasts') return true;
 return u.provinceId === activeChannelObj?.provinceId;
 });

 return (
 <div className="space-y-4" id="branch-operations-chat-container" dir="rtl">
 {/* 1. TOP ROLES & PERMISSIONS STATUS BAR */}
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
 <div className="flex items-start sm:items-center gap-3.5">
 <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
 <Radio className="w-6 h-6 animate-pulse" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-[11px] font-extrabold text-amber-400">منظومة الاتصالات العملياتية والتنسيق الميداني</span>
 <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-700">
 بروتوكول العزل المكاني
 </span>
 </div>
 <div className="flex items-center gap-2 mt-1 flex-wrap">
 <h3 className="font-black text-sm sm:text-base text-white">{currentUser.name}</h3>
 <span className="text-[11px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40">
 {getUserRoleTitle(currentUser)}
 </span>
 <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${getUserGeographicScope(currentUser).badgeClass}`}>
 {getUserGeographicScope(currentUser).label}
 </span>
 </div>
 <p className="text-xs text-slate-300 mt-1">
 {isNationwide 
 ? '⭐ تملك صلاحية الوصول والتنقل بين جميع غرف المحافظات الـ 18 وإصدار تبليغات عامة لكافة الفروع.' 
 : `🔒 تواصلك محصور داخل نطاق (${currentUser.provinceName}) فقط مع زملائك المفتشين، مع استلام التوجيهات العامة من المقر العام.`}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
 {canBroadcast && (
 <button
 onClick={() => setShowBroadcastModal(true)}
 className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
 title="إصدار تعميم نقابي وتبليغ عام لكافة المحافظات"
 >
 <Megaphone className="w-4 h-4" />
 <span>إرسال تبليغ عام لكافة المحافظات</span>
 </button>
 )}

 <button
 onClick={() => setShowRolesModal(true)}
 className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
 >
 <ShieldCheck className="w-4 h-4 text-amber-400" />
 <span>استعراض مصفوفة الصلاحيات</span>
 </button>
 </div>
 </div>

 {/* Access Denied Warning Toast if field inspector tries to access another province */}
 {accessDeniedNotice && (
 <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500 text-rose-100 flex items-start gap-3 shadow-lg animate-in fade-in duration-200">
 <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
 <div className="flex-1 text-xs">
 <h5 className="font-black text-rose-200 text-sm mb-1">تم حظر الوصول للغرفة — ضابط العزل المكاني</h5>
 <p className="leading-relaxed">{accessDeniedNotice}</p>
 </div>
 <button
 onClick={() => setAccessDeniedNotice(null)}
 className="text-rose-400 hover:text-rose-200 font-bold text-sm px-2 cursor-pointer"
 >
 ✕
 </button>
 </div>
 )}

 {/* Emergency Circulars & Operational Directives Banner */}
 {activeBroadcast && (
 <div className="bg-rose-950/40 border border-rose-600/50 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
 <div className="flex items-start gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
 <Megaphone className="w-4 h-4 animate-pulse" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="font-mono bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded text-[10px]">
 {activeBroadcast.code}
 </span>
 <h4 className="font-black text-rose-200 text-xs sm:text-sm">{activeBroadcast.title}</h4>
 </div>
 <p className="text-slate-300 mt-1 line-clamp-1">{activeBroadcast.summary}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <span className="text-[10px] text-rose-300 font-bold bg-rose-900/60 px-2.5 py-1 rounded-lg">
 صادر عن: {activeBroadcast.issuedBy}
 </span>
 </div>
 </div>
 )}

 {/* Main Split Grid: Channel Selector + Chat Feed */}
 <div className="bg-[var(--theme-card-bg)] rounded-3xl border border-[var(--theme-card-border)] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[620px] max-h-[750px]">
 {/* Right Sidebar: Channels & Operations Control */}
 <div className="w-full md:w-80 bg-[var(--theme-canvas)] dark:bg-slate-950/60 border-b md:border-b-0 md:border-l border-[var(--theme-card-border)] flex flex-col">
 {/* Header */}
 <div className="p-3.5 border-b border-[var(--theme-card-border)] flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
 <span className="font-extrabold text-xs text-[var(--theme-text-primary)]">قنوات وغرف التفتيش</span>
 </div>
 <span className="text-[10px] text-[var(--theme-text-muted)] font-mono">
 {isNationwide ? 'وصول شامل' : 'مقيد بمحافظتك'}
 </span>
 </div>

 {/* Channels List */}
 <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1 text-xs">
 {/* 1. National Broadcasts Channel (Always on top) */}
 <div className="mb-2">
 <div className="text-[10px] font-bold text-slate-400 px-2 py-1">
 القيادة المركزية والتبليغات العامة:
 </div>
 <button
 onClick={() => handleChannelSelect(nationalChannel.id, nationalChannel.provinceId, nationalChannel.name)}
 className={`w-full text-right p-3 rounded-2xl transition cursor-pointer flex items-center justify-between border ${
 activeChannel === nationalChannel.id
 ? 'bg-amber-500 text-slate-950 font-black shadow-md border-amber-400'
 : 'bg-amber-500/10 dark:bg-amber-950/20 text-[var(--theme-text-primary)] border-amber-500/30 hover:bg-amber-500/20'
 }`}
 >
 <div className="flex items-center gap-2.5 truncate">
 <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
 activeChannel === nationalChannel.id ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
 }`}>
 <Globe2 className="w-4 h-4" />
 </div>
 <div className="truncate">
 <div className="font-black text-xs truncate leading-tight">{nationalChannel.name}</div>
 <div className={`text-[10px] truncate mt-0.5 ${
 activeChannel === nationalChannel.id ? 'text-[var(--theme-text-primary)] font-bold' : 'text-[var(--theme-text-muted)]'
 }`}>
 {nationalChannel.subtitle}
 </div>
 </div>
 </div>
 <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
 activeChannel === nationalChannel.id ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
 }`}>
 {messages.filter(m => m.channelId === 'national_broadcasts' || m.isNationwideBroadcast).length}
 </span>
 </button>
 </div>

 {/* 2. Provincial Channels */}
 <div className="text-[10px] font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
 <span>غرف تفتيش المحافظات:</span>
 {!isNationwide && (
 <span className="text-[9px] text-amber-500 font-bold">🔒 تواصلك محصور بمحافظتك</span>
 )}
 </div>

 {provinceChannels.map((ch) => {
 const isActive = activeChannel === ch.id;
 const isAllowed = canAccessChannel(ch.id, ch.provinceId);
 const chMsgCount = messages.filter(m => m.channelId === ch.id).length;
 const isHomeProvince = currentUser.provinceId === ch.provinceId;

 return (
 <button
 key={ch.id}
 onClick={() => handleChannelSelect(ch.id, ch.provinceId, ch.name)}
 className={`w-full text-right p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between ${
 isActive
 ? 'bg-slate-900 text-white font-black shadow-xs border border-slate-700'
 : isHomeProvince
 ? 'bg-blue-500/15 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 border border-blue-500/40 hover:bg-blue-500/25'
 : isAllowed
 ? 'text-[var(--theme-text-primary)] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60'
 : 'opacity-50 text-slate-400 hover:opacity-75 hover:bg-rose-50 dark:hover:bg-rose-950/30'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {!isAllowed ? (
 <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
 ) : isHomeProvince ? (
 <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
 ) : (
 <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
 )}
 <span className="truncate">{ch.name}</span>
 {isHomeProvince && (
 <span className="text-[9px] bg-blue-500 text-white font-black px-1 rounded">فرعك</span>
 )}
 </div>
 <div className="flex items-center gap-1.5 shrink-0">
 {!isAllowed ? (
 <span className="text-[9px] bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-1.5 rounded">
 محظور
 </span>
 ) : (
 <span className={`text-[10px] font-mono font-bold px-1.5 rounded-full ${
 isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-[var(--theme-text-muted)]'
 }`}>
 {chMsgCount}
 </span>
 )}
 </div>
 </button>
 );
 })}
 </div>

 {/* Current User Provincial Status Box */}
 <div className="p-3 border-t border-[var(--theme-card-border)] bg-[var(--theme-canvas)] dark:bg-slate-900/80 text-xs space-y-1">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
 <span className="font-black text-[var(--theme-text-primary)]">المستخدم النشط:</span>
 </div>
 <span className="text-[10px] text-[var(--theme-text-muted)] font-mono">{currentUser.badgeNumber}</span>
 </div>
 <div className="font-black text-amber-600 dark:text-amber-400 truncate">{currentUser.name}</div>
 <div className="text-[11px] text-[var(--theme-text-muted)] flex items-center justify-between pt-1 border-t border-[var(--theme-card-border)]">
 <span>نطاق التفتيش:</span>
 <span className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300">
 {currentUser.provinceName || 'عموم العراق'}
 </span>
 </div>
 </div>
 </div>

 {/* Left Area: Messages Feed and Chat Input */}
 <div className="flex-1 flex flex-col bg-[var(--theme-card-bg)]">
 {/* Feed Top Header */}
 <div className="p-3.5 border-b border-[var(--theme-card-border)] flex items-center justify-between bg-[var(--theme-canvas)]/50 flex-wrap gap-2">
 <div>
 <div className="flex items-center gap-2">
 <h3 className="font-black text-xs sm:text-sm text-[var(--theme-text-primary)] dark:text-white flex items-center gap-2">
 {activeChannel === 'national_broadcasts' ? (
 <Globe2 className="w-4 h-4 text-amber-500" />
 ) : (
 <MapPin className="w-4 h-4 text-blue-500" />
 )}
 {activeChannelObj?.name}
 </h3>
 {activeChannel === 'national_broadcasts' ? (
 <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
 تبليغات عامة لعموم العراق
 </span>
 ) : (
 <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
 محصورة بمفتشي المحافظة
 </span>
 )}
 </div>
 <p className="text-[11px] text-[var(--theme-text-muted)] mt-0.5">
 {activeChannel === 'national_broadcasts' 
 ? 'تبليغات وتوجيهات عليا من النقيب، نائبه، ومسؤول فرع بغداد تصل لكافة مفتشي العراق.' 
 : `تنسيق ميداني مغلق بين أعضاء لجان التفتيش والمفرزات في ${activeChannelObj?.name}.`}
 </p>
 </div>

 <div className="relative w-40 sm:w-56">
 <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
 <input
 type="text"
 value={chatSearch}
 onChange={(e) => setChatSearch(e.target.value)}
 placeholder="بحث في الرسائل..."
 className="w-full pr-8 pl-2 py-1.5 bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-xl text-xs focus:outline-none focus:border-amber-500"
 />
 </div>
 </div>

 {/* Active Members Bar for this Channel */}
 {activeChannel !== 'national_broadcasts' && currentChannelProvinceUsers.length > 0 && (
 <div className="bg-[var(--theme-canvas)]/60 px-3.5 py-1.5 border-b border-[var(--theme-card-border)]/50 flex items-center justify-between text-[11px]">
 <div className="flex items-center gap-2">
 <Users className="w-3.5 h-3.5 text-slate-400" />
 <span className="font-bold text-[var(--theme-text-muted)]">أعضاء مفرزة المحافظة في هذه الغرفة:</span>
 <div className="flex items-center gap-1 overflow-x-auto">
 {currentChannelProvinceUsers.map(u => (
 <span key={u.id} className="bg-[var(--theme-card-bg)] dark:bg-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px] text-[var(--theme-text-primary)] dark:text-slate-200 shrink-0">
 {u.name.split('(')[0].trim()}
 </span>
 ))}
 </div>
 </div>
 <span className="text-[10px] text-slate-400 font-bold shrink-0">
 {currentChannelProvinceUsers.length} مفتشين معتمدين
 </span>
 </div>
 )}

 {/* Messages Feed */}
 <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
 {filteredMessages.map((msg) => {
 const isCurrentUser = msg.senderId === currentUser.id;
 const isCentral = msg.type === 'CENTRAL_BROADCAST' || msg.isNationwideBroadcast;

 return (
 <div
 key={msg.id}
 className={`flex flex-col ${isCurrentUser ? 'items-start' : 'items-end'}`}
 >
 <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs ${
 isCentral
 ? 'bg-amber-950/40 border-2 border-amber-500 text-amber-100 shadow-md'
 : isCurrentUser 
 ? 'bg-amber-500/15 border border-amber-500/30 text-[var(--theme-text-primary)]'
 : msg.type === 'CLOSURE_ORDER'
 ? 'bg-rose-950/40 border border-rose-600/50 text-rose-100'
 : msg.type === 'URGENT_DISPATCH'
 ? 'bg-amber-950/40 border border-amber-600/50 text-amber-100'
 : 'bg-[var(--theme-canvas)] text-[var(--theme-text-primary)]'
 }`}>
 {/* Message Header */}
 <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-black/5 dark:border-white/10 text-[10px]">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="font-black text-[var(--theme-text-primary)] dark:text-white text-xs">{msg.senderName}</span>
 <span className="font-mono text-slate-400">({msg.senderBadge})</span>
 {getRoleBadge(msg.senderRole, msg.senderRoleTitle)}
 {msg.provinceName && (
 <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-[var(--theme-text-muted)]">
 {msg.provinceName}
 </span>
 )}
 </div>
 <span className="text-slate-400 font-mono shrink-0">{msg.timestamp}</span>
 </div>

 {/* Badge for Message Special Types */}
 {isCentral && (
 <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg mb-2 shadow-xs">
 <Megaphone className="w-3.5 h-3.5" />
 <span>📢 تبليغ وتوجيه عام نافذ لكافة محافظات العراق</span>
 </div>
 )}
 {msg.type === 'CLOSURE_ORDER' && (
 <div className="inline-flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-2">
 <Gavel className="w-3 h-3" />
 قرار غلق إداري وتشميع
 </div>
 )}
 {msg.type === 'URGENT_DISPATCH' && (
 <div className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-2">
 <AlertCircle className="w-3 h-3" />
 بلاغ طارئ / اشتباه عيادة وهمية
 </div>
 )}
 {msg.type === 'LOCATION_ALERT' && (
 <div className="inline-flex items-center gap-1 bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md mb-2">
 <MapPin className="w-3 h-3" />
 إشعار انتشار وتنسيق جغرافي للمفرزة
 </div>
 )}

 {/* Message Text */}
 <p className="leading-relaxed whitespace-pre-wrap font-medium text-xs sm:text-[13px]">{msg.messageText}</p>

 {/* Attachment preview */}
 {msg.attachment && (
 <div className="mt-2.5 p-2 rounded-xl bg-black/10 dark:bg-black/30 border border-black/10 dark:border-white/10 flex items-center justify-between text-[11px]">
 <div className="flex items-center gap-2">
 <Paperclip className="w-3.5 h-3.5 text-amber-500" />
 <span className="font-bold">{msg.attachment.title}</span>
 </div>
 <span className="text-[10px] font-mono text-slate-400">
 {msg.attachment.referenceId}
 </span>
 </div>
 )}
 </div>
 </div>
 );
 })}

 {filteredMessages.length === 0 && (
 <div className="text-center py-12 text-slate-400">
 <Radio className="w-8 h-8 mx-auto text-[var(--theme-text-muted)] mb-2 opacity-50" />
 <p className="font-bold text-xs">لا توجد رسائل سابقة في هذه القناة</p>
 <p className="text-[11px] text-[var(--theme-text-muted)] mt-1">ابدأ بكتابة تقرير تفتيشي أو بلاغ عملياتي</p>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Quick Action Shortcuts */}
 <div className="px-3 pt-2 flex items-center gap-1.5 overflow-x-auto text-[11px] border-t border-[var(--theme-card-border)]">
 <span className="text-slate-400 font-bold shrink-0">إجراءات سريعة:</span>
 <button
 type="button"
 onClick={() => {
 setMessageType('URGENT_DISPATCH');
 setInputText(`⚠️ [بلاغ عاجل]: تم رصد نشاط تمريضي غير مجاز في قاطع ${currentUser.provinceName || 'المحافظة'} - `);
 }}
 className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg shrink-0 font-bold transition cursor-pointer"
 >
 🚨 بلاغ عيادة وهمية
 </button>
 <button
 type="button"
 onClick={() => {
 setMessageType('CLOSURE_ORDER');
 setInputText('⚖️ [طلب أمر غلق إداري]: استناداً للكشف الميداني، نطلب مصادقة لجنة الانضباط على غلق وتشميع ');
 }}
 className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-lg shrink-0 font-bold transition cursor-pointer"
 >
 🔒 طلب أمر غلق وتشميع
 </button>
 <button
 type="button"
 onClick={() => {
 setMessageType('LOCATION_ALERT');
 setInputText(`📍 دورية التفتيش متواجدة الآن في قاطع ${currentUser.provinceName || 'المركز'} - جاري فحص المراكز والعيادات...`);
 }}
 className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg shrink-0 font-bold transition cursor-pointer"
 >
 📍 مشاركة موقع المفرزة
 </button>
 </div>

 {/* Chat Input Box */}
 <form onSubmit={handleSend} className="p-3 bg-[var(--theme-canvas)]/90 border-t border-[var(--theme-card-border)] flex items-center gap-2">
 <div className="flex-1 relative">
 <input
 type="text"
 value={inputText}
 onChange={(e) => setInputText(e.target.value)}
 placeholder={
 activeChannel === 'national_broadcasts' && !canBroadcast
 ? '🔒 التبليغ العام محصور بالنقيب، نائبه، ومسؤول فرع بغداد/المقر العام...'
 : `أرسل رسالة إلى ${activeChannelObj?.name}...`
 }
 disabled={activeChannel === 'national_broadcasts' && !canBroadcast}
 className="w-full pr-3 pl-10 py-2.5 bg-[var(--theme-card-bg)] border border-[var(--theme-card-border)] rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold disabled:opacity-50"
 />
 </div>
 <button
 type="submit"
 disabled={!inputText.trim() || (activeChannel === 'national_broadcasts' && !canBroadcast)}
 className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer text-xs shadow-xs"
 >
 <Send className="w-3.5 h-3.5" />
 <span>إرسال</span>
 </button>
 </form>
 </div>
 </div>

 {/* MODAL: Issue Official Discipline Circular / Nationwide Broadcast */}
 {showBroadcastModal && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
 <div className="bg-[var(--theme-card-bg)] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[var(--theme-card-border)] my-auto text-xs space-y-4">
 <div className="flex items-center justify-between border-b border-[var(--theme-card-border)] pb-3">
 <div>
 <span className="text-[10px] font-bold text-amber-500">صلاحية القيادة والمقر العام</span>
 <h3 className="font-extrabold text-[var(--theme-text-primary)] dark:text-white text-sm flex items-center gap-2">
 <Megaphone className="w-5 h-5 text-amber-500" />
 إصدار تبليغ عام وتوجيه مركزي لكافة فروع المحافظات
 </h3>
 </div>
 <button
 onClick={() => setShowBroadcastModal(false)}
 className="text-slate-400 hover:text-[var(--theme-text-muted)] font-bold text-sm cursor-pointer"
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleCreateBroadcast} className="space-y-3.5">
 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">درجة الأهمية والاستعجال:</label>
 <select
 value={broadcastUrgency}
 onChange={(e) => setBroadcastUrgency(e.target.value as any)}
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-bold"
 >
 <option value="URGENT">عاجل جداً وفوري (أمر حظر أو غلق على مستوى العراق)</option>
 <option value="IMPORTANT">مهم وتوجيه تنظيمي (إجراءات تفتيشية مشددة)</option>
 <option value="REGULAR">تعميم إداري اعتيادي</option>
 </select>
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">عنوان التبليغ العام:</label>
 <input
 type="text"
 required
 value={broadcastTitle}
 onChange={(e) => setBroadcastTitle(e.target.value)}
 placeholder="مثال: تعميم فوري بشأن تفتيش عيادات التجميل وسحب الرخص..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-medium"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">نص التوجيه والقرار النقابي:</label>
 <textarea
 required
 rows={3}
 value={broadcastSummary}
 onChange={(e) => setBroadcastSummary(e.target.value)}
 placeholder="اكتب التوجيهات التي تود إبلاغ كافة لجان التفتيش والمفتشين في عموم العراق بها..."
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5 font-medium leading-relaxed"
 />
 </div>

 <div>
 <label className="font-bold text-[var(--theme-text-primary)] dark:text-slate-300 block mb-1">الإجراء التنفيذي المطلوب من الفروع:</label>
 <input
 type="text"
 value={broadcastAction}
 onChange={(e) => setBroadcastAction(e.target.value)}
 placeholder="مثال: مباشرة النزول الميداني الفوري وإحاطة المقر العام بالموقف"
 className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl p-2.5"
 />
 </div>

 <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300">
 ℹ️ سيتم إرسال هذا التبليغ كبرقية فورية في القناة المركزية وسيتلقاه جميع المفتشين في محافظاتهم مع إشعار استعجال.
 </div>

 <div className="flex items-center justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => setShowBroadcastModal(false)}
 className="px-4 py-2 border border-[var(--theme-card-border)] dark:border-slate-700 rounded-xl font-bold cursor-pointer"
 >
 إلغاء
 </button>
 <button
 type="submit"
 className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2 rounded-xl transition cursor-pointer shadow-md"
 >
 تعميم ونشر لكافة المحافظات
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* ROLES & PERMISSIONS MODAL */}
 <RolesPermissionsModal
 isOpen={showRolesModal}
 onClose={() => setShowRolesModal(false)}
 currentUser={currentUser}
 users={users}
 provinces={provinces}
 onSelectUser={onSelectUser}
 />
 </div>
 );
};
