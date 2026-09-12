import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, X, CheckCircle2, AlertTriangle, BookOpen, 
  HelpCircle, ShieldAlert, FileText, Scale, RefreshCw, MessageSquare, Mic, MicOff, ExternalLink
} from 'lucide-react';
import { User, Facility } from '../types';

interface AiInspectorBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  facilities?: Facility[];
  onNavigateToViolation?: () => void;
  onNavigateToChecklist?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  tags?: string[];
  actionLink?: {
    label: string;
    action: () => void;
  };
}

const PRELOADED_KNOWLEDGE: { query: string; answer: string; tags: string[]; lawRef: string }[] = [
  {
    query: 'ما هي عقوبة مزاولة مهنة التمريض بدون إجازة ممارسة نافذة؟',
    answer: 'وفقاً للمادة (28) من قانون نقابة التمريض العراقية وقانون الصحة العامة رقم (89):\n1. يُعد العمل بدون إجازة ممارسة نافذة مخالفة مهنية جسيمة.\n2. يتم إغلاق المنشأة فورياً وتوجيه إنذار بغرامة مالية.\n3. إحالة المخالف إلى لجنة الانضباط النقابية مع إمكانية الإحالة للقضاء إذا تكررت المخالفة.\n4. يتوجب على المفتش الميداني توثيق ذلك فوراً في محضر الكشف مع التقاط صورة لإجازة الممارسة المنتهية.',
    tags: ['إجازات ممارسة', 'عقوبات', 'قانون النقابة'],
    lawRef: 'المادة 28 - قانون النقابة / قانون الصحة العامة رقم 89'
  },
  {
    query: 'ما هي معايير جهاز التعقيم الأوتوكلاف (Autoclave) المعتمدة؟',
    answer: 'معايير الرقابة الصحية المعتمدة لأجهزة التعقيم في العيادات والمراكز التمريضية:\n1. وجود مؤشر كيميائي/حراري دال على التعقيم (Chemical Indicator).\n2. وصول درجة الحرارة إلى 121°C لمدة 15-20 دقيقة أو 134°C للتعقيم السريع.\n3. وجود سجل ورقي/إلكتروني دوري لتوثيق دورات التعقيم وتوقيع المسؤول.\n4. عدم تكديس الأدوات داخل الغرفة والسماح بتدوير البخار.\n• في حال عدم توفر شهادة صيانة أو وجود عطل، يُسجل مؤشر "سلبي" في بند السلامة.',
    tags: ['التعقيم', 'السلامة المهنية', 'استمارة الكشف'],
    lawRef: 'دليل مكافحة العدوى والرقابة الصحية العراقي - البند 4'
  },
  {
    query: 'كيف أتعامل ميدانياً مع رصد عيادة وهمية أو غير مسجلة بالنقابة؟',
    answer: 'إجراءات التعامل الفوري مع الكيانات الوهمية أو غير المرخصة:\n1. قم بفتح نافذة "رصد عيادة غير مسجلة" من الشاشة الرئيسية للتطبيق.\n2. التقط الإحداثيات الجغرافية (GPS) للعيادة بشكل دقيق.\n3. التقط صوراً واضحة للواجهة الخارجية واللافتة التعريفية والمعدات.\n4. لا تدخل في احتكاك مباشر مع القائمين عليها، وأرسل برقية طوارئ عبر "شات غرفة العمليات".\n5. سيتم تحويل المحضر تلقائياً إلى شعبة التفتيش واللجان المشتركة مع وزارة الصحة وقيادة الشرطة لاتخاذ الإجراء الأمني القانوني.',
    tags: ['كيان وهمي', 'طوارئ', 'إجراءات تفتيش'],
    lawRef: 'التعليمات التنفيذية المشتركة لمكافحة العيادات الوهمية 2024'
  },
  {
    query: 'ما هي شروط تشغيل الكوادر الأجنبية (ممرضين/ممرضات) في المراكز؟',
    answer: 'شروط تشغيل الكوادر التمريضية الأجنبية في المنشآت الطبية:\n1. الحصول على إقامة عمل رسمية سارية المفعول من وزارة الداخلية.\n2. معادلة الشهادة الأكاديمية والمهنية وتصديقها من وزارة التعليم والصحة.\n3. التسجيل الإلزامي بنقابة التمريض العراقية والحصول على باج مزاولة مؤقت.\n4. خضوع الكادر لفحص اللياقة الصحية والسلامة من الأمراض المعدية.\n• يُحظر تماماً تشغيل أي كادر أجنبي بجواز سياحي أو دون تسجيل نقابي معتمد، وتترتب على المنشأة غرامة فورية.',
    tags: ['كوادر أجنبية', 'إقامات', 'ممارسة مهنة'],
    lawRef: 'ضوابط تشغيل العمالة الصحية الأجنبية - وزارة الصحة والنقابة'
  },
  {
    query: 'ما هي مستويات الإنذار والمخالفات في جولات التفتيش؟',
    answer: 'مستويات المخالفات المعتمدة:\n• تنبيه أولي (شفهي/مسجل): للمخالفات الإدارية البسيطة مع مهلة 7 أيام لتصحيح المسار.\n• إنذار مسجل وغرامة: للمخالفات الإنشائية، انتهاء الترخيص، أو تدني شروط النظافة مع مهلة 72 ساعة.\n• غلق فوري وإحالة للقضاء: للعيادات الوهمية، تشغيل كادر غير مؤهل، أو ارتكاب تجاوزات طبية خطرة على حياة المواطنين.',
    tags: ['تصنيف المخالفات', 'إنذارات', 'غلق منشأة'],
    lawRef: 'لائحة التدرج العقابي بلجان التفتيش والرقابة'
  }
];

export const AiInspectorBotModal: React.FC<AiInspectorBotModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateToViolation,
  onNavigateToChecklist
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `مرحباً بك زميلي المفتش ${currentUser.name || 'المعتمد'}. أنا المساعد الذكي للاستعلامات الميدانية (ChatSimple AI) المطور لنقابة التمريض العراقية.\n\nأنا جاهز للإجابة على أي استفسار قانوني، تدقيق صلاحيات التراخيص، أو احتساب الغرامات وفق لوائح النقابة ووزارة الصحة 24/7.`,
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      tags: ['استعلامات', 'لوائح', 'دعم ميداني']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendQuery = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI intelligent inference matching local regulation knowledgebase
    setTimeout(() => {
      const lowerQ = query.toLowerCase();
      const matched = PRELOADED_KNOWLEDGE.find(k => 
        lowerQ.includes(k.query.toLowerCase()) ||
        k.tags.some(tag => lowerQ.includes(tag.toLowerCase())) ||
        (lowerQ.includes('عقوبة') && k.query.includes('عقوبة')) ||
        (lowerQ.includes('تعقيم') && k.query.includes('التعقيم')) ||
        (lowerQ.includes('وهمي') && k.query.includes('وهمية')) ||
        (lowerQ.includes('أجنبي') && k.query.includes('الأجنبية')) ||
        (lowerQ.includes('غرام') && k.query.includes('عقوبة')) ||
        (lowerQ.includes('مخالف') && k.query.includes('المخالفات'))
      );

      let replyText = '';
      let replyTags: string[] = ['استعلام ذكي'];

      if (matched) {
        replyText = `${matched.answer}\n\n📌 المرجع القانوني: ${matched.lawRef}`;
        replyTags = matched.tags;
      } else {
        replyText = `بناءً على لوائح نقابة التمريض العراقية وضوابط الرقابة الصحية المعتمدة بوزارة الصحة:\n\nبخصوص استفسارك عن ("${query}"):\n• يتوجب تدوين الحالة في محضر الكشف الإلكتروني مع ذكر السند الرقابي.\n• يمكنك مراجعة دليل اللوائح من تبويب "المزيد" أو طلب استشارة مباشرة من مسؤول اللجنة عبر شات العمليات.\n• للمخالفات الصريحة، يرجى التوثيق بالصور وإرفاق إحداثيات GPS لتفادي الطعون.`;
        replyTags = ['إرشاد رقابي', 'توجيه ميداني'];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
        tags: replyTags
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate voice capture
      setTimeout(() => {
        setIsListening(false);
        setInputQuery('ما هي عقوبة مزاولة مهنة التمريض بدون إجازة ممارسة نافذة؟');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#0b172a]/95 backdrop-blur-2xl border border-sky-500/30 rounded-3xl max-w-lg w-full h-[85vh] max-h-[700px] flex flex-col shadow-[0_0_50px_rgba(56,189,248,0.2)] text-slate-100 overflow-hidden ring-1 ring-white/10 animate-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="bg-[#0f203c]/90 px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <div className="w-full h-full bg-[#0b172a] rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-white">المساعد الذكي الميداني</h3>
                <span className="bg-sky-500/20 text-sky-300 text-[9px] px-2 py-0.5 rounded-full font-mono border border-sky-400/30">
                  ChatSimple AI
                </span>
              </div>
              <p className="text-[10px] text-sky-300/80 font-medium">اللوائح النقابية والرقابة الصحية 24/7</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Question Chips */}
        <div className="bg-[#081224]/80 px-3 py-2 border-b border-white/5 shrink-0 overflow-x-auto scrollbar-none flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            استفسارات شائعة:
          </span>
          {PRELOADED_KNOWLEDGE.slice(0, 4).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(item.query)}
              className="text-[10px] font-bold text-sky-200 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-500/30 px-2.5 py-1 rounded-full whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {item.query.substring(0, 26)}...
            </button>
          ))}
        </div>

        {/* Chat Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                <span className={`text-[10px] font-bold ${msg.sender === 'user' ? 'text-amber-300' : 'text-sky-300'}`}>
                  {msg.sender === 'user' ? currentUser.name || 'المفتش' : 'المساعد الذكي للنقابة'}
                </span>
              </div>

              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-amber-600/25 border border-amber-400/40 text-amber-100 rounded-tr-none'
                    : 'bg-[#112340]/90 border border-sky-500/30 text-slate-100 rounded-tl-none shadow-[0_0_15px_rgba(56,189,248,0.1)]'
                }`}
              >
                {msg.text}

                {msg.tags && msg.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-white/10">
                    {msg.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[9px] px-2 py-0.5 rounded-md font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex flex-col items-end">
              <div className="bg-[#112340]/80 border border-sky-500/30 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-sky-300 font-bold mr-1">جاري تدقيق اللائحة النقابية...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-[#0a1628]/95 p-3 border-t border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/30 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-white/10'
              }`}
              title="إملاء صوتي"
            >
              {isListening ? <Mic className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="اكتب استفسارك الرقابي أو ابحث عن مادة قانونية..."
              className="flex-1 bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400/60 transition"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-black p-2.5 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.4)] transition cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
