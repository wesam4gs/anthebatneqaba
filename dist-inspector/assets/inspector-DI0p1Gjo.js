import"./modulepreload-polyfill-B5Qt9EMX.js";import{q as L,c as h,d as y,w as v,g as E,s as M,a as N,o as B,l as S}from"./firebase-CP-E_-_7.js";import{H as _}from"./index-B7hWkOn7.js";function T(s){const n=localStorage.getItem("assignedZones");if(!n)return s;try{const a=JSON.parse(n);return a.length===0?s:s.filter(i=>a.includes(i.facilityBranch)||a.includes(i.facilityGov))}catch{return s}}function $(s,n,a,i=5){if(!s)return[];const t=e=>e*Math.PI/180,o=6371,r=Number(n)||33.315,c=Number(a)||44.351;return s.filter(e=>{const d=e.lat!==void 0?e.lat:e.latitude!==void 0?e.latitude:e.centerLat,l=e.lng!==void 0?e.lng:e.lon!==void 0?e.lon:e.longitude!==void 0?e.longitude:e.centerLng,u=Number(d),p=Number(l);if(isNaN(u)||isNaN(p))return!1;const b=t(u-r),m=t(p-c),g=Math.sin(b/2)*Math.sin(b/2)+Math.sin(m/2)*Math.sin(m/2)*Math.cos(t(r))*Math.cos(t(u)),w=2*Math.atan2(Math.sqrt(g),Math.sqrt(1-g)),x=o*w;return e.distance=x,x<=i}).sort((e,d)=>e.distance-d.distance)}function R(s,n,a=200){return new Promise((i,t)=>{if(!navigator.geolocation)return t("GPS غير مدعوم في هذا الجهاز");navigator.geolocation.getCurrentPosition(o=>{const r=o.coords.latitude,c=o.coords.longitude,e=g=>g*Math.PI/180,d=6371e3,l=e(s-r),u=e(n-c),p=Math.sin(l/2)*Math.sin(l/2)+Math.sin(u/2)*Math.sin(u/2)*Math.cos(e(r))*Math.cos(e(s)),b=2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p)),m=d*b;m<=a?i({success:!0,distance:Math.round(m),myLat:r,myLng:c}):t(`أنت بعيد عن المنشأة! المسافة الحالية: ${Math.round(m)} متر. (المسموح ${a} متر)`)},o=>{t("تعذر الحصول على موقعك. يرجى تفعيل الـ GPS.")},{enableHighAccuracy:!0})})}function P(s,n="report.csv"){if(!s||s.length===0)return alert("لا توجد بيانات للتصدير!");const a=Object.keys(s[0]);let i=a.join(",")+`
`;s.forEach(c=>{const e=a.map(d=>{let l=String(c[d]||"");return l=l.replace(/"/g,'""'),l.search(/("|,|\n)/g)>=0?`"${l}"`:l});i+=e.join(",")+`
`});const t="\uFEFF",o=new Blob([t+i],{type:"text/csv;charset=utf-8;"}),r=document.createElement("a");r.href=URL.createObjectURL(o),r.download=n,r.click()}function I(s,n,a,i){const t=l=>l*Math.PI/180,r=t(a-s),c=t(i-n),e=Math.sin(r/2)*Math.sin(r/2)+Math.cos(t(s))*Math.cos(t(a))*Math.sin(c/2)*Math.sin(c/2);return 6371*(2*Math.atan2(Math.sqrt(e),Math.sqrt(1-e)))}function C(s,n,a){if(!s||!Array.isArray(s))return[];const i=Number(n)||33.315,t=Number(a)||44.351;return[...s].map(o=>{const r=o.lat!==void 0?o.lat:o.latitude!==void 0?o.latitude:o.centerLat,c=o.lng!==void 0?o.lng:o.lon!==void 0?o.lon:o.longitude!==void 0?o.longitude:o.centerLng,e=Number(r),d=Number(c),l=!isNaN(e)&&!isNaN(d)?I(i,t,e,d):1/0;return{...o,distanceKm:l===1/0?null:Number(l.toFixed(2)),distanceMeters:l===1/0?null:Math.round(l*1e3)}}).sort((o,r)=>(o.distanceKm??1/0)-(r.distanceKm??1/0))}async function H(s){if(!s)return[];try{const n=L(h(y,"inspections"),v("facility_id","==",String(s)),B("created_at","desc"),S(10)),a=await E(n),i=[];return a.forEach(t=>{i.push({id:t.id,...t.data()})}),i}catch(n){console.warn("Fallback simple query for facility history:",n);try{const a=L(h(y,"inspections"),v("facility_id","==",String(s))),i=await E(a),t=[];return i.forEach(o=>t.push({id:o.id,...o.data()})),t.sort((o,r)=>new Date(r.created_at||r.date||0).getTime()-new Date(o.created_at||o.date||0).getTime())}catch(a){return console.error("Error fetching facility history:",a),[]}}}function D(s,n=[]){const a=document.getElementById("facility-history-modal");a&&a.remove();const i=s.name||s.facilityName||"منشأة صحية",t=s.address||s.neighborhood||s.facilityGov||"غير محدد";n.length>0&&n[0];let o="";n.length===0?o=`
            <div class="text-center py-8 text-slate-400">
                <p class="text-sm">لا توجد زيارات تفتيشية سابقة مسجلة لهذه المنشأة.</p>
                <span class="inline-block mt-2 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">زيارة استكشافية أولى</span>
            </div>
        `:o=n.map((u,p)=>{const b=u.date||u.created_at||"تاريخ غير محدد",m=u.inspection_type||u.type||"كشف دوري";u.status==="VIOLATION"||u.violations_count>0;const g=u.status==="VIOLATION"||u.violations_count>0?'<span class="px-2 py-0.5 text-xs font-bold rounded bg-red-900/60 text-red-300 border border-red-700">مخالف</span>':'<span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">ملتزم</span>',w=Array.isArray(u.violations)?u.violations.join("، "):u.violations||"لا توجد مخالفات",x=u.inspector_name||"مفتش النقابة";return`
                <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5 text-right">
                    <div class="flex items-center justify-between text-xs text-slate-400">
                        <span>${g}</span>
                        <span class="font-mono text-amber-400">${b}</span>
                    </div>
                    <div class="text-sm font-semibold text-slate-100">${m}</div>
                    <div class="text-xs text-slate-300"><strong class="text-slate-400">المخالفات:</strong> ${w}</div>
                    <div class="text-xs text-slate-400"><strong class="text-slate-500">المفتش:</strong> ${x}</div>
                </div>
            `}).join("");const r=`
        <div id="facility-history-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
            <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                    <div>
                        <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                            <span>📜 سجل الزيارات السابقة (CRM)</span>
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">${i} - ${t}</p>
                    </div>
                    <button id="close-history-modal-btn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg leading-none">✕</button>
                </div>
                <div class="p-4 overflow-y-auto space-y-3 flex-1">
                    ${o}
                </div>
                <div class="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
                    <button id="ok-history-modal-btn" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">إغلاق ومتابعة الكشف</button>
                </div>
            </div>
        </div>
    `;document.body.insertAdjacentHTML("beforeend",r);const c=document.getElementById("close-history-modal-btn"),e=document.getElementById("ok-history-modal-btn"),d=document.getElementById("facility-history-modal"),l=()=>d==null?void 0:d.remove();c==null||c.addEventListener("click",l),e==null||e.addEventListener("click",l)}async function k({name:s="كيان صحي غير مسجل",photoBase64:n="",notes:a="",inspectorId:i="INS-FIELD-CURRENT",inspectorName:t="مفتش ميداني"}){return new Promise((o,r)=>{if(!navigator.geolocation)return r(new Error("نظام تحديد المواقع GPS غير مدعوم في هاتفك"));navigator.geolocation.getCurrentPosition(async c=>{try{const e={entity_name:s,latitude:c.coords.latitude,longitude:c.coords.longitude,accuracy_meters:Math.round(c.coords.accuracy),photo_base64:n,notes:a,inspector_id:i,inspector_name:t,status:"PENDING_TRIAGE",report_type:"UNREGISTERED_FACILITY",created_at:M?M():new Date().toISOString(),timestamp_iso:new Date().toISOString()},d=await N(h(y,"urgent_reports"),e);o({success:!0,id:d.id,...e})}catch(e){console.error("Firestore urgent_reports error:",e),r(e)}},c=>{r(new Error("تعذر جلب إحداثيات GPS الدقيقة: "+c.message))},{enableHighAccuracy:!0,timeout:1e4})})}function F(s){if(document.getElementById("fab-unregistered-entity"))return;const n=document.createElement("button");n.id="fab-unregistered-entity",n.type="button",n.className="fixed bottom-20 left-4 z-40 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-red-400 transition-transform active:scale-95 animate-bounce",n.innerHTML=`
        <span class="text-base leading-none">📍🚨</span>
        <span class="hidden sm:inline">رصد كيان غير مسجل</span>
    `,n.title="رصد كيان تمريضي غير مسجل (Drop a Pin)",n.addEventListener("click",()=>{j(s)}),document.body.appendChild(n)}function j(s){const n=document.getElementById("modal-unregistered-form");n&&n.remove(),document.body.insertAdjacentHTML("beforeend",`
        <div id="modal-unregistered-form" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
            <div class="bg-slate-900 border border-red-800/60 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-base font-bold text-red-400 flex items-center gap-2">
                        <span>🚨 رصد كيان/عيادة غير مسجلة</span>
                    </h3>
                    <button id="close-unreg-form-btn" class="text-slate-400 hover:text-white text-lg">✕</button>
                </div>
                
                <p class="text-xs text-slate-300">
                    سيتم تثبيت موقعك الجغرافي الحالي تلقائياً (Drop a Pin) وإرسال بلاغ طارئ لغرفة العمليات المركزية.
                </p>

                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">اسم الكيان أو اليافطة الظاهرة:</label>
                        <input id="unreg-entity-name" type="text" placeholder="مثال: عيادة تمريضية بدون ترخيص" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-red-500" />
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">صورة الواجهة (التقاط فوري بالكاميرا):</label>
                        <input id="unreg-entity-camera" type="file" accept="image/*" capture="environment" class="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500" />
                        <div id="unreg-photo-preview" class="hidden mt-2 rounded-lg overflow-hidden border border-slate-700 h-28 bg-slate-950 flex items-center justify-center"></div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">ملاحظات المخالفة الميدانية:</label>
                        <textarea id="unreg-entity-notes" rows="2" placeholder="وصف النشاط، كوادر غير معروفة، أدوية منتهية..." class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-red-500"></textarea>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-2">
                    <button id="submit-unreg-report-btn" class="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                        <span>📍 تثبيت الموقع وحفظ البلاغ</span>
                    </button>
                    <button id="cancel-unreg-report-btn" class="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 rounded-xl text-xs font-bold transition">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `);let i="";const t=document.getElementById("unreg-entity-camera"),o=document.getElementById("unreg-photo-preview"),r=document.getElementById("submit-unreg-report-btn"),c=document.getElementById("close-unreg-form-btn"),e=document.getElementById("cancel-unreg-report-btn"),d=document.getElementById("modal-unregistered-form");t==null||t.addEventListener("change",u=>{var m;const p=(m=u.target.files)==null?void 0:m[0];if(!p)return;const b=new FileReader;b.onload=g=>{i=g.target.result,o&&(o.innerHTML=`<img src="${i}" class="w-full h-full object-cover" />`,o.classList.remove("hidden"))},b.readAsDataURL(p)});const l=()=>d==null?void 0:d.remove();c==null||c.addEventListener("click",l),e==null||e.addEventListener("click",l),r==null||r.addEventListener("click",async()=>{var b,m;const u=((b=document.getElementById("unreg-entity-name"))==null?void 0:b.value)||"كيان تمريضي غير مسجل",p=((m=document.getElementById("unreg-entity-notes"))==null?void 0:m.value)||"";r.disabled=!0,r.innerHTML="⏳ جاري التقاط GPS وحفظ البلاغ...";try{const g=await k({name:u,photoBase64:i,notes:p});alert(`✅ تم رصد الكيان وتثبيت الإحداثيات بنجاح! رقم البلاغ: ${g.id}`),l(),s&&s(g)}catch(g){alert("❌ فشل إرسال البلاغ: "+g.message),r.disabled=!1,r.innerHTML="📍 تثبيت الموقع وحفظ البلاغ"}})}function q(s,n,a={}){const i=document.getElementById(s),t=document.getElementById(n);if(!i||!t)return null;const o=window.SpeechRecognition||window.webkitSpeechRecognition;if(!o)return t.title="خاصية التعرف على الصوت غير مدعومة في هذا المتصفح",t.style.opacity="0.5",t.style.cursor="not-allowed",null;const r=new o;r.lang=a.lang||"ar-IQ",r.continuous=a.continuous??!1,r.interimResults=!0;let c=!1;return r.onstart=()=>{c=!0,t.classList.add("animate-pulse"),t.style.backgroundColor="#dc2626",t.title="جاري الاستماع... تحدث الآن"},r.onend=()=>{c=!1,t.classList.remove("animate-pulse"),t.style.backgroundColor="",t.title="انقر للتحدث بالصوت"},r.onresult=e=>{let d="";for(let l=e.resultIndex;l<e.results.length;++l)e.results[l].isFinal&&(d+=e.results[l][0].transcript);if(d){const l=i.value.trim();i.value=l?`${l} ${d}`:d,i.dispatchEvent(new Event("input",{bubbles:!0}))}},r.onerror=e=>{console.warn("Speech recognition error:",e.error),c=!1,t.classList.remove("animate-pulse"),t.style.backgroundColor=""},t.addEventListener("click",e=>{e.preventDefault(),c?r.stop():r.start()}),r}function G(s,n,a=[]){const i=document.getElementById(s),t=document.getElementById(n);if(!i||!t)return;const o=["أدوية منتهية الصلاحية","كوادر غير مرخصة","عدم وجود لوحة ترخيص رسمية","انتحال صفة تمريضية","سوء تعقيم وغياب الأوتوكلاف","غياب حاوية النفايات الحادة (Sharps Box)","تداول أدوية ومواد محظورة","المنشأة ملتزمة بالكامل"],r=a.length>0?a:o;t.innerHTML="",r.forEach(c=>{const e=document.createElement("button");e.type="button",e.className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 hover:bg-emerald-700 text-slate-200 border border-slate-700 transition active:scale-95",e.textContent=`+ ${c}`,e.addEventListener("click",d=>{d.preventDefault();const l=i.value.trim();l?l.includes(c)||(i.value=`${l} | ${c}`):i.value=c,i.dispatchEvent(new Event("input",{bubbles:!0}))}),t.appendChild(e)})}async function A(s,n=10){const a=new Date().toISOString().split("T")[0];try{const i=L(h(y,"inspections"),v("inspector_id","==",String(s)),v("date_string","==",a)),o=(await E(i)).size,r=Math.min(100,Math.round(o/(n||1)*100));return{completedCount:o,zoneTarget:n,percentage:r,todayStr:a}}catch(i){return console.warn("Gamification query fallback:",i),{completedCount:0,zoneTarget:n,percentage:0,todayStr:a}}}function O(s,n={completedCount:0,zoneTarget:10,percentage:0}){const a=document.getElementById(s);if(!a)return;const i=n.percentage>=100?"bg-emerald-500 text-white":n.percentage>=50?"bg-amber-500 text-slate-950":"bg-blue-600 text-white";a.innerHTML=`
        <div class="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-lg text-right" dir="rtl">
            <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-200">🎯 إنجاز خطة التفتيش اليومية:</span>
                    <span class="text-xs font-black px-2 py-0.5 rounded-full ${i}">
                        ${n.completedCount} / ${n.zoneTarget} منشأة (${n.percentage}%)
                    </span>
                </div>
                <span class="text-[11px] text-slate-400 font-mono">${n.todayStr||""}</span>
            </div>
            <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out rounded-full" style="width: ${n.percentage}%;"></div>
            </div>
        </div>
    `}let f=null;async function U(s,n,a){if(f)try{await f.stop()}catch{}f=new _(s);const i={fps:15,qrbox:{width:250,height:250},aspectRatio:1};return f.start({facingMode:"environment"},i,(t,o)=>{n&&n(t,o)},t=>{a&&a(t)})}async function V(){if(f){try{await f.stop()}catch(s){console.warn("Error stopping barcode scanner:",s)}f=null}}window.InspectorModules={calculateHaversineDistance:I,sortFacilitiesByProximity:C,getZoneFacilities:T,getFacilitiesWithinRadius:$,validateGPSCheckIn:R,getFacilityHistory:H,showFacilityHistoryModal:D,reportUnregisteredFacility:k,initUnregisteredEntityFAB:F,setupVoiceToText:q,setupQuickTags:G,getInspectorTodayPerformance:A,renderGamificationProgressBar:O,startBarcodeScanner:U,stopBarcodeScanner:V,exportToCSV:P};
