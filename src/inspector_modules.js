import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';

// =========================================================================
// 1. تصفية منشآت الزون والمسافات (Basic Zone & GPS Helpers)
// =========================================================================
export function getZoneFacilities(allFacilities) {
    const zonesStr = localStorage.getItem('assignedZones');
    if (!zonesStr) return allFacilities; 
    try {
        const myZones = JSON.parse(zonesStr);
        if (myZones.length === 0) return allFacilities;
        return allFacilities.filter(f => 
            myZones.includes(f.facilityBranch) || 
            myZones.includes(f.facilityGov)
        );
    } catch (e) {
        return allFacilities;
    }
}

export function getFacilitiesWithinRadius(facilities, centerLat, centerLng, radiusKm = 5) {
    if (!facilities) return [];
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; 
    const cLat = Number(centerLat) || 33.3150;
    const cLng = Number(centerLng) || 44.3510;
    return facilities.filter(f => {
        const rawLat = f.lat !== undefined ? f.lat : (f.latitude !== undefined ? f.latitude : f.centerLat);
        const rawLng = f.lng !== undefined ? f.lng : (f.lon !== undefined ? f.lon : (f.longitude !== undefined ? f.longitude : f.centerLng));
        const fLat = Number(rawLat);
        const fLng = Number(rawLng);
        if (isNaN(fLat) || isNaN(fLng)) return false;

        const dLat = toRad(fLat - cLat);
        const dLon = toRad(fLng - cLng);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(cLat)) * Math.cos(toRad(fLat));
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        f.distance = distance; 
        return distance <= radiusKm;
    }).sort((a, b) => a.distance - b.distance);
}

export function validateGPSCheckIn(targetLat, targetLng, maxDistanceMeters = 200) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject("GPS غير مدعوم في هذا الجهاز");
        navigator.geolocation.getCurrentPosition((pos) => {
            const myLat = pos.coords.latitude;
            const myLng = pos.coords.longitude;
            const toRad = (value) => (value * Math.PI) / 180;
            const R = 6371000; 
            const dLat = toRad(targetLat - myLat);
            const dLon = toRad(targetLng - myLng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(toRad(myLat)) * Math.cos(toRad(targetLat));
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            if (distance <= maxDistanceMeters) {
                resolve({ success: true, distance: Math.round(distance), myLat, myLng });
            } else {
                reject(`أنت بعيد عن المنشأة! المسافة الحالية: ${Math.round(distance)} متر. (المسموح ${maxDistanceMeters} متر)`);
            }
        }, (err) => {
            reject("تعذر الحصول على موقعك. يرجى تفعيل الـ GPS.");
        }, { enableHighAccuracy: true });
    });
}

export function exportToCSV(dataArray, filename = 'report.csv') {
    if (!dataArray || dataArray.length === 0) return alert("لا توجد بيانات للتصدير!");
    const headers = Object.keys(dataArray[0]);
    let csvContent = headers.join(",") + "\n";
    dataArray.forEach(row => {
        const rowValues = headers.map(header => {
            let val = String(row[header] || "");
            val = val.replace(/"/g, '""');
            return val.search(/("|,|\n)/g) >= 0 ? `"${val}"` : val;
        });
        csvContent += rowValues.join(",") + "\n";
    });
    const bom = "\uFEFF"; 
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// =========================================================================
// الميزة 1: المسار الذكي (Route Optimization & Sorting - Haversine Formula)
// =========================================================================
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // بالكيلومتر
}

export function sortFacilitiesByProximity(facilities, currentLat, currentLng) {
    if (!facilities || !Array.isArray(facilities)) return [];
    const cLat = Number(currentLat) || 33.3150;
    const cLng = Number(currentLng) || 44.3510;

    return [...facilities].map(f => {
        const rawLat = f.lat !== undefined ? f.lat : (f.latitude !== undefined ? f.latitude : f.centerLat);
        const rawLng = f.lng !== undefined ? f.lng : (f.lon !== undefined ? f.lon : (f.longitude !== undefined ? f.longitude : f.centerLng));
        const fLat = Number(rawLat);
        const fLng = Number(rawLng);
        const distKm = (!isNaN(fLat) && !isNaN(fLng)) 
            ? calculateHaversineDistance(cLat, cLng, fLat, fLng)
            : Infinity;

        return {
            ...f,
            distanceKm: distKm === Infinity ? null : Number(distKm.toFixed(2)),
            distanceMeters: distKm === Infinity ? null : Math.round(distKm * 1000)
        };
    }).sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
}

// =========================================================================
// الميزة 2: السجل التاريخي (CRM-like Facility History)
// =========================================================================
export async function getFacilityHistory(facilityId) {
    if (!facilityId) return [];
    try {
        const q = query(
            collection(db, 'inspections'),
            where('facility_id', '==', String(facilityId)),
            orderBy('created_at', 'desc'),
            limit(10)
        );
        const snap = await getDocs(q);
        const records = [];
        snap.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });
        return records;
    } catch (e) {
        console.warn('Fallback simple query for facility history:', e);
        try {
            const qFallback = query(
                collection(db, 'inspections'),
                where('facility_id', '==', String(facilityId))
            );
            const snap = await getDocs(qFallback);
            const records = [];
            snap.forEach(doc => records.push({ id: doc.id, ...doc.data() }));
            return records.sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime());
        } catch (innerErr) {
            console.error('Error fetching facility history:', innerErr);
            return [];
        }
    }
}

export function showFacilityHistoryModal(facility, historyRecords = []) {
    const existing = document.getElementById('facility-history-modal');
    if (existing) existing.remove();

    const facName = facility.name || facility.facilityName || 'منشأة صحية';
    const facAddress = facility.address || facility.neighborhood || facility.facilityGov || 'غير محدد';
    const lastVisit = historyRecords.length > 0 ? historyRecords[0] : null;

    let historyListHtml = '';
    if (historyRecords.length === 0) {
        historyListHtml = `
            <div class="text-center py-8 text-slate-400">
                <p class="text-sm">لا توجد زيارات تفتيشية سابقة مسجلة لهذه المنشأة.</p>
                <span class="inline-block mt-2 text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">زيارة استكشافية أولى</span>
            </div>
        `;
    } else {
        historyListHtml = historyRecords.map((item, idx) => {
            const visitDate = item.date || item.created_at || 'تاريخ غير محدد';
            const visitType = item.inspection_type || item.type || 'كشف دوري';
            const status = item.status === 'VIOLATION' || item.violations_count > 0 ? 'رصدت مخالفات' : 'مطابق للشروط';
            const statusBadge = item.status === 'VIOLATION' || item.violations_count > 0
                ? '<span class="px-2 py-0.5 text-xs font-bold rounded bg-red-900/60 text-red-300 border border-red-700">مخالف</span>'
                : '<span class="px-2 py-0.5 text-xs font-bold rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">ملتزم</span>';
            const violations = Array.isArray(item.violations) ? item.violations.join('، ') : (item.violations || 'لا توجد مخالفات');
            const inspector = item.inspector_name || 'مفتش النقابة';

            return `
                <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5 text-right">
                    <div class="flex items-center justify-between text-xs text-slate-400">
                        <span>${statusBadge}</span>
                        <span class="font-mono text-amber-400">${visitDate}</span>
                    </div>
                    <div class="text-sm font-semibold text-slate-100">${visitType}</div>
                    <div class="text-xs text-slate-300"><strong class="text-slate-400">المخالفات:</strong> ${violations}</div>
                    <div class="text-xs text-slate-400"><strong class="text-slate-500">المفتش:</strong> ${inspector}</div>
                </div>
            `;
        }).join('');
    }

    const modalHtml = `
        <div id="facility-history-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" dir="rtl">
            <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                    <div>
                        <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
                            <span>📜 سجل الزيارات السابقة (CRM)</span>
                        </h3>
                        <p class="text-xs text-slate-400 mt-0.5">${facName} - ${facAddress}</p>
                    </div>
                    <button id="close-history-modal-btn" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-lg leading-none">✕</button>
                </div>
                <div class="p-4 overflow-y-auto space-y-3 flex-1">
                    ${historyListHtml}
                </div>
                <div class="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
                    <button id="ok-history-modal-btn" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">إغلاق ومتابعة الكشف</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const closeBtn = document.getElementById('close-history-modal-btn');
    const okBtn = document.getElementById('ok-history-modal-btn');
    const modalEl = document.getElementById('facility-history-modal');
    const dismiss = () => modalEl?.remove();
    closeBtn?.addEventListener('click', dismiss);
    okBtn?.addEventListener('click', dismiss);
}

// =========================================================================
// الميزة 3: الإبلاغ عن العيادات الشبحية (Drop a Pin - Unregistered Facilities)
// =========================================================================
export async function reportUnregisteredFacility({
    name = 'كيان صحي غير مسجل',
    photoBase64 = '',
    notes = '',
    inspectorId = 'INS-FIELD-CURRENT',
    inspectorName = 'مفتش ميداني'
}) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("نظام تحديد المواقع GPS غير مدعوم في هاتفك"));
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const reportData = {
                    entity_name: name,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy_meters: Math.round(pos.coords.accuracy),
                    photo_base64: photoBase64,
                    notes: notes,
                    inspector_id: inspectorId,
                    inspector_name: inspectorName,
                    status: 'PENDING_TRIAGE',
                    report_type: 'UNREGISTERED_FACILITY',
                    created_at: serverTimestamp ? serverTimestamp() : new Date().toISOString(),
                    timestamp_iso: new Date().toISOString()
                };

                const docRef = await addDoc(collection(db, 'urgent_reports'), reportData);
                resolve({ success: true, id: docRef.id, ...reportData });
            } catch (err) {
                console.error('Firestore urgent_reports error:', err);
                reject(err);
            }
        }, (geoErr) => {
            reject(new Error("تعذر جلب إحداثيات GPS الدقيقة: " + geoErr.message));
        }, { enableHighAccuracy: true, timeout: 10000 });
    });
}

export function initUnregisteredEntityFAB(onReportCreated) {
    if (document.getElementById('fab-unregistered-entity')) return;

    const fabBtn = document.createElement('button');
    fabBtn.id = 'fab-unregistered-entity';
    fabBtn.type = 'button';
    fabBtn.className = 'fixed bottom-20 left-4 z-40 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs p-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-red-400 transition-transform active:scale-95 animate-bounce';
    fabBtn.innerHTML = `
        <span class="text-base leading-none">📍🚨</span>
        <span class="hidden sm:inline">رصد كيان غير مسجل</span>
    `;
    fabBtn.title = 'رصد كيان تمريضي غير مسجل (Drop a Pin)';

    fabBtn.addEventListener('click', () => {
        showUnregisteredEntityFormModal(onReportCreated);
    });

    document.body.appendChild(fabBtn);
}

function showUnregisteredEntityFormModal(onSuccessCallback) {
    const existing = document.getElementById('modal-unregistered-form');
    if (existing) existing.remove();

    const modalHtml = `
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
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    let capturedPhotoBase64 = '';
    const fileInput = document.getElementById('unreg-entity-camera');
    const previewBox = document.getElementById('unreg-photo-preview');
    const submitBtn = document.getElementById('submit-unreg-report-btn');
    const closeBtn = document.getElementById('close-unreg-form-btn');
    const cancelBtn = document.getElementById('cancel-unreg-report-btn');
    const modalEl = document.getElementById('modal-unregistered-form');

    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
            capturedPhotoBase64 = loadEvt.target.result;
            if (previewBox) {
                previewBox.innerHTML = `<img src="${capturedPhotoBase64}" class="w-full h-full object-cover" />`;
                previewBox.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    });

    const closeModal = () => modalEl?.remove();
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);

    submitBtn?.addEventListener('click', async () => {
        const entityName = document.getElementById('unreg-entity-name')?.value || 'كيان تمريضي غير مسجل';
        const notes = document.getElementById('unreg-entity-notes')?.value || '';

        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ جاري التقاط GPS وحفظ البلاغ...';

        try {
            const res = await reportUnregisteredFacility({
                name: entityName,
                photoBase64: capturedPhotoBase64,
                notes: notes
            });
            alert(`✅ تم رصد الكيان وتثبيت الإحداثيات بنجاح! رقم البلاغ: ${res.id}`);
            closeModal();
            if (onSuccessCallback) onSuccessCallback(res);
        } catch (err) {
            alert('❌ فشل إرسال البلاغ: ' + err.message);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '📍 تثبيت الموقع وحفظ البلاغ';
        }
    });
}

// =========================================================================
// الميزة 4: الإدخال الصوتي والعلامات السريعة (Voice-to-Text & Quick Tags)
// =========================================================================
export function setupVoiceToText(textareaId, micBtnId, options = {}) {
    const textarea = document.getElementById(textareaId);
    const micBtn = document.getElementById(micBtnId);
    if (!textarea || !micBtn) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        micBtn.title = 'خاصية التعرف على الصوت غير مدعومة في هذا المتصفح';
        micBtn.style.opacity = '0.5';
        micBtn.style.cursor = 'not-allowed';
        return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = options.lang || 'ar-IQ'; // تدعم اللهجة العراقية والعربية
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = true;

    let isListening = false;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('animate-pulse');
        micBtn.style.backgroundColor = '#dc2626';
        micBtn.title = 'جاري الاستماع... تحدث الآن';
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('animate-pulse');
        micBtn.style.backgroundColor = '';
        micBtn.title = 'انقر للتحدث بالصوت';
    };

    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                transcript += event.results[i][0].transcript;
            }
        }
        if (transcript) {
            const curVal = textarea.value.trim();
            textarea.value = curVal ? `${curVal} ${transcript}` : transcript;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        isListening = false;
        micBtn.classList.remove('animate-pulse');
        micBtn.style.backgroundColor = '';
    };

    micBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    return recognition;
}

export function setupQuickTags(textareaId, containerId, customTags = []) {
    const textarea = document.getElementById(textareaId);
    const container = document.getElementById(containerId);
    if (!textarea || !container) return;

    const defaultTags = [
        'أدوية منتهية الصلاحية',
        'كوادر غير مرخصة',
        'عدم وجود لوحة ترخيص رسمية',
        'انتحال صفة تمريضية',
        'سوء تعقيم وغياب الأوتوكلاف',
        'غياب حاوية النفايات الحادة (Sharps Box)',
        'تداول أدوية ومواد محظورة',
        'المنشأة ملتزمة بالكامل'
    ];

    const tags = customTags.length > 0 ? customTags : defaultTags;
    container.innerHTML = '';

    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 hover:bg-emerald-700 text-slate-200 border border-slate-700 transition active:scale-95';
        btn.textContent = `+ ${tag}`;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentVal = textarea.value.trim();
            if (!currentVal) {
                textarea.value = tag;
            } else if (!currentVal.includes(tag)) {
                textarea.value = `${currentVal} | ${tag}`;
            }
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
        });
        container.appendChild(btn);
    });
}

// =========================================================================
// الميزة 5: لوحة تحفيز الأداء (Gamification Dashboard & Progress)
// =========================================================================
export async function getInspectorTodayPerformance(inspectorId, zoneTarget = 10) {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
        const q = query(
            collection(db, 'inspections'),
            where('inspector_id', '==', String(inspectorId)),
            where('date_string', '==', todayStr)
        );
        const snap = await getDocs(q);
        const completedCount = snap.size;
        const percentage = Math.min(100, Math.round((completedCount / (zoneTarget || 1)) * 100));
        return {
            completedCount,
            zoneTarget,
            percentage,
            todayStr
        };
    } catch (err) {
        console.warn('Gamification query fallback:', err);
        return {
            completedCount: 0,
            zoneTarget,
            percentage: 0,
            todayStr
        };
    }
}

export function renderGamificationProgressBar(containerId, data = { completedCount: 0, zoneTarget: 10, percentage: 0 }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const badgeColor = data.percentage >= 100 
        ? 'bg-emerald-500 text-white' 
        : (data.percentage >= 50 ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white');

    container.innerHTML = `
        <div class="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-lg text-right" dir="rtl">
            <div class="flex items-center justify-between mb-1.5">
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-200">🎯 إنجاز خطة التفتيش اليومية:</span>
                    <span class="text-xs font-black px-2 py-0.5 rounded-full ${badgeColor}">
                        ${data.completedCount} / ${data.zoneTarget} منشأة (${data.percentage}%)
                    </span>
                </div>
                <span class="text-[11px] text-slate-400 font-mono">${data.todayStr || ''}</span>
            </div>
            <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out rounded-full" style="width: ${data.percentage}%;"></div>
            </div>
        </div>
    `;
}

// =========================================================================
// الميزة 6: نظام المسح الضوئي السريع (QR/Barcode & Verification)
// =========================================================================
let html5QrCodeScannerInstance = null;

export async function startBarcodeScanner(readerElementId, onScanSuccess, onScanError) {
    if (html5QrCodeScannerInstance) {
        try {
            await html5QrCodeScannerInstance.stop();
        } catch (_) {}
    }

    html5QrCodeScannerInstance = new Html5Qrcode(readerElementId);
    const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };

    return html5QrCodeScannerInstance.start(
        { facingMode: "environment" },
        config,
        (decodedText, decodedResult) => {
            if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
            if (onScanError) onScanError(errorMessage);
        }
    );
}

export async function stopBarcodeScanner() {
    if (html5QrCodeScannerInstance) {
        try {
            await html5QrCodeScannerInstance.stop();
        } catch (e) {
            console.warn('Error stopping barcode scanner:', e);
        }
        html5QrCodeScannerInstance = null;
    }
}

// =========================================================================
// التصدير وتثبيت الكائن العام window.InspectorModules
// =========================================================================
window.InspectorModules = {
    // 1. المسار الذكي
    calculateHaversineDistance,
    sortFacilitiesByProximity,
    getZoneFacilities,
    getFacilitiesWithinRadius,
    validateGPSCheckIn,

    // 2. السجل التاريخي (CRM)
    getFacilityHistory,
    showFacilityHistoryModal,

    // 3. الإبلاغ عن العيادات الشبحية
    reportUnregisteredFacility,
    initUnregisteredEntityFAB,

    // 4. الإدخال الصوتي والعلامات السريعة
    setupVoiceToText,
    setupQuickTags,

    // 5. لوحة تحفيز الأداء (Gamification)
    getInspectorTodayPerformance,
    renderGamificationProgressBar,

    // 6. نظام المسح الضوئي السريع
    startBarcodeScanner,
    stopBarcodeScanner,

    // أدوات مساعدة
    exportToCSV
};

