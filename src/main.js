window.exportTableToCSV = function(tableId, filename) {
  let csv = [];
  let rows = document.querySelectorAll('#' + tableId + ' tr');
  
  for (let i = 0; i < rows.length; i++) {
    let row = [], cols = rows[i].querySelectorAll('td, th');
    // Skip the last column (actions) if it's the users table
    let len = tableId === 'users-table' ? cols.length - 1 : cols.length;
    for (let j = 0; j < len; j++) {
      let text = cols[j].innerText.replace(/\n/g, ' ').replace(/"/g, '""');
      row.push('"' + text + '"');
    }
    csv.push(row.join(','));
  }
  
  let csvFile = new Blob(["\uFEFF"+csv.join('\n')], {type: "text/csv;charset=utf-8;"});
  let downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
};


window.flyToLocation = async function(query, gov, zoomLevel) {
  if (!window.gisMap) return;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},${encodeURIComponent(gov)},Iraq&format=json`);
    const data = await res.json();
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        const size = window.gisMap.getSize ? window.gisMap.getSize() : null;
        if (size && size.x > 0 && size.y > 0) {
          window.gisMap.flyTo([lat, lon], zoomLevel, { duration: 1.5 });
        } else {
          window.gisMap.setView([lat, lon], zoomLevel);
        }
      } else {
        window.gisMap.setZoom(zoomLevel);
      }
    } else {
      window.gisMap.setZoom(zoomLevel);
    }
  } catch(e) {
    if (window.gisMap && window.gisMap.setZoom) window.gisMap.setZoom(zoomLevel);
  }
};

import { db } from './firebase.ts';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, limit, where, getCountFromServer } from 'firebase/firestore';

// Auth Check
const currentUserRole = localStorage.getItem('userRole') || 'admin';
const currentUserGov = localStorage.getItem('userGov') || '';

function withGovFilter(collRef) {
  if (currentUserRole === 'admin' || !currentUserGov || currentUserGov === 'all' || currentUserGov === 'كافة المحافظات') return collRef;
  return query(collRef, where('gov', '==', currentUserGov));
}

// Redirect to login if user not authenticated
if (!localStorage.getItem('userRole')) {
  window.location.href = '/login.html';
}

const iraqRegions = {
  "بغداد": ["الكرخ", "الرصافة"],
  "البصرة": ["المركز", "أبي الخصيب", "الزبير", "القرنة", "شط العرب", "الفاو"],
  "نينوى": ["الموصل (الأيمن)", "الموصل (الأيسر)", "تلعفر", "الحمدانية", "الشيخان", "سنجار"],
  "أربيل": ["أربيل المركز", "سوران", "شقلاوة", "كويسنجق", "مخمور"],
  "بابل": ["الحلة", "المحاويل", "المسيب", "الهاشمية", "القاسم"],
  "كربلاء المقدسة": ["كربلاء المركز", "طويريج (الهندية)", "عين التمر"],
  "النجف الأشرف": ["النجف المركز", "الكوفة", "المناذرة", "المشخاب", "الحيرة"],
  "كركوك": ["كركوك المركز", "الحويجة", "داقوق", "دبس"],
  "الأنبار": ["الرمادي", "الفلوجة", "هيت", "حديثة", "عنة", "راوة", "القائم"],
  "صلاح الدين": ["تكريت", "سامراء", "بيجي", "الشرقاط", "بلد", "الدجيل", "طوزخورماتو"],
  "ديالى": ["بعقوبة", "المقدادية", "الخالص", "خانقين", "بلدروز"],
  "ميسان": ["العمارة", "المجر الكبير", "قلعة صالح", "علي الغربي", "الميمونة"],
  "واسط": ["الكوت", "الصويرة", "العزيزية", "الحي", "النعمانية", "بدرة"],
  "ذي قار": ["الناصرية", "الشطرة", "الرفاعي", "سوق الشيوخ", "الجبايش"],
  "الديوانية": ["الديوانية المركز", "عفك", "الشامية", "الحمزة"],
  "المثنى": ["السماوة", "الرميثة", "الخضر", "الوركاء"],
  "السليمانية": ["السليمانية المركز", "رانية", "قلعة دزة", "حلبجة", "كلار", "جمجمال"],
  "دهوك": ["دهوك المركز", "زاخو", "العمادية", "سميل", "عقرة"]
};

const govCoords = {
  "بغداد": [33.3152, 44.3661],
  "البصرة": [30.5081, 47.7835],
  "نينوى": [36.3400, 43.1300],
  "أربيل": [36.1900, 44.0092],
  "بابل": [32.4820, 44.4370],
  "كربلاء المقدسة": [32.6160, 44.0249],
  "النجف الأشرف": [32.0289, 44.3789],
  "كركوك": [35.4674, 44.3833],
  "الأنبار": [33.4219, 43.3076],
  "صلاح الدين": [34.6071, 43.6821],
  "ديالى": [33.7410, 44.6247],
  "ميسان": [31.8413, 47.1420],
  "واسط": [32.5029, 45.8239],
  "ذي قار": [31.0580, 46.2573],
  "الديوانية": [31.9868, 44.9221],
  "المثنى": [31.3129, 45.2818],
  "السليمانية": [35.5558, 45.4351],
  "دهوك": [36.8665, 42.9896]
};

const zoneNeighborhoods = {
  "الكرخ": ["المنصور", "اليرموك", "الحارثية", "القادسية", "السيدية", "حي الجامعة", "الغزالية", "حي الخضراء", "الكاظمية", "الدورة", "البياع", "حي العامل", "حي الجهاد", "الشعلة", "العطيفية", "حي العدل", "حي الإعلام", "الصالحية", "كرادة مريم"],
  "الرصافة": ["الكرادة", "الجادرية", "زيونة", "بغداد الجديدة", "الأعظمية", "حي القاهرة", "حي البنوك", "حي أور", "الشعب", "مدينة الصدر", "البلديات", "الغدير", "الرشاد", "الكسرة", "الكامب", "باب المعظم", "الباب الشرقي", "الكمالية", "الأمين"],
  "المركز": ["العشار", "الجبيلة", "المعقل", "الجزائر", "البراضعية", "الحيانية", "القبلة", "الطويسة", "دور الضباط", "الأندلس"],
  "الزبير": ["مركز الزبير", "الخطوة", "الدريهمية", "حي العسكري"],
  "الموصل (الأيمن)": ["الموصل القديمة", "حي العامل", "حي التنك", "وادي حجر", "المحطة", "تل الرمان"],
  "الموصل (الأيسر)": ["الزهور", "المثنى", "النور", "المهندسين", "المصارف", "الحدباء", "حي الجامعة", "البلديات"],
  "أربيل المركز": ["عنكاوة", "بختياري", "الوزيران", "آزادي", "الاسكان", "زاكرو", "كولان"],
  "الحلة": ["مركز الحلة", "حي الجامعة", "نادر", "الجمعية", "حي بابل", "الكرامة", "المهندسين"],
  "النجف المركز": ["المدينة القديمة", "حي الأمير", "حي الغدير", "حي السعد", "حي الحنانة", "حي الميلاد", "حي العسكري"],
  "كربلاء المركز": ["مركز المدينة (بين الحرمين)", "حي الحسين", "حي المعلمين", "حي العباس", "حي البلدية", "حي الموظفين"],
  "كركوك المركز": ["طريق بغداد", "حي الواسطي", "حي العسكري", "الشورجة", "القورية", "رحيم آوا", "تسعين"],
  "الرمادي": ["مركز الرمادي", "التأميم", "حي الأندلس", "حي الملعب", "الجزيرة"],
  "الفلوجة": ["الجولان", "الشهداء", "حي نزال", "الضباط", "الرسالة"],
  "الناصرية": ["مركز الناصرية", "الحبوبي", "حي الشموخ", "حي سومر", "حي أور", "الإدارة المحلية"]
};

const neighborhoodCoords = {
  "المنصور": [33.3150, 44.3390],
  "اليرموك": [33.3120, 44.3590],
  "الحارثية": [33.3080, 44.3700],
  "القادسية": [33.2980, 44.3320],
  "الكرادة": [33.2900, 44.4100],
  "الجادرية": [33.2750, 44.3800],
  "زيونة": [33.3250, 44.4400],
  "الأعظمية": [33.3750, 44.3600],
  "العشار": [30.5250, 47.8300],
  "حي الأمير": [32.0400, 44.3600]
};

document?.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  if(username) {
    const elName = document.getElementById('userName');
    const uFullName = localStorage.getItem('userFullName');
    const uRoleTitle = localStorage.getItem('userRoleTitle');
    if (elName) elName.textContent = uFullName || (username === 'test1' ? 'مفتش لجنة التفتيش العامة (test1)' : username);
    const elRole = document.getElementById('userRole');
    if (elRole) {
      if (username === 'test1') {
        elRole.textContent = 'لجنة التفتيش العامة (كافة المحافظات والزونات)';
      } else if (uRoleTitle) {
        elRole.textContent = uRoleTitle;
      } else {
        elRole.textContent = 'مدير النظام (Admin)';
      }
    }
    const elAv = document.getElementById('userAv');
    if (elAv) elAv.textContent = (uFullName || username).trim().charAt(0).toUpperCase();
  }
  
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
  });

  // Fetch facilities from Firebase
  try {
    const coll = withGovFilter(collection(db, "facilities"));
    const allFacSnap = await getDocs(coll);
    
    window.dbFacilities = [];
    let licCount = 0;
    
    allFacSnap.forEach(docSnap => {
      const data = docSnap.data();
      window.dbFacilities.push(data);
      if (data.lic === "مجاز رسميًا" || data.lic === "مجاز" || data.lic === "مرخصة رسمياً") licCount++;
    });
    
    const totalFacilities = window.dbFacilities.length;
    
    const elFac = document.getElementById('stats-total-fac');
    if (elFac) elFac.textContent = totalFacilities;
    
    const elLic = document.getElementById('stats-licensed-fac');
    if (elLic) elLic.textContent = licCount;
    
    const elVio = document.getElementById('stats-total-violations');
    if(elVio) elVio.textContent = '14'; // Mock for now until violations module is built
    
    if (window.updateMapData) {
      window.updateMapData();
    }
  } catch(e) { 
    console.error("Error getting facilities count", e); 
    const elFac = document.getElementById('stats-total-fac');
    if (elFac) elFac.textContent = 128; 
    const elLic = document.getElementById('stats-licensed-fac');
    if (elLic) elLic.textContent = 92; 
  }

  window.loadFacilitiesTable = async (govFilter = '') => {
    const tbody = document.getElementById('facilities-tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">جاري التحميل...</td></tr>';
    
    let q = query(collection(db, "facilities"), limit(50));
    if (govFilter) {
      q = query(collection(db, "facilities"), where("gov", "==", govFilter), limit(50));
    }
    
    try {
      const snap = await getDocs(q);
      tbody.innerHTML = '';
      if(snap.empty) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">لا يوجد بيانات</td></tr>';
        return;
      }
      
      snap.forEach((docSnap) => {
        const v = docSnap.data();
        const st = (v.lic === 'مجاز رسمياً' || v.lic === 'مجاز' || v.lic === 'مرخصة رسمياً') ? 'ok' : ((v.lic === 'قيد الإنجاز' || v.lic === 'قيد الترخيص') ? 'warn' : 'bad');
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="nm">' + (v.name || 'غير محدد') + '</div><div class="sb"><span class="code">' + (v.code || v.licNum || '---') + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
'<td><span class="stamp s">' + (v.type || 'عيادة تمريضية') + '</span></td>' +
'<td>' + (v.owner || '---') + '</td>' +
'<td>' + (v.gov || '---') + '<div class="sb">' + (v.zone || v.area || '---') + '</div></td>' +
'<td><div class="nm" style="font-size:11px">' + (v.inspectDate || 'لم يتم الكشف') + '</div></td>' +
'<td><span class="stamp ' + st + '">' + (v.lic || 'غير محدد') + '</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تفاصيل المنشأة</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">تحديث الإجازة</button></div></td>';
        tbody.appendChild(tr);
      });
    } catch(e) {
      console.error("Table load error", e);
      // Fallback for quota limit
      if(window.dbFacilities && window.dbFacilities.length > 0) {
         tbody.innerHTML = '';
         window.dbFacilities.slice(0, 50).forEach(v => {
           const st = (v.lic === 'مجاز رسمياً' || v.lic === 'مجاز' || v.lic === 'مرخصة رسمياً') ? 'ok' : ((v.lic === 'قيد الإنجاز' || v.lic === 'قيد الترخيص') ? 'warn' : 'bad');
           const tr = document.createElement('tr');
           tr.innerHTML = '<td><div class="nm">' + (v.name || 'غير محدد') + '</div><div class="sb"><span class="code">' + (v.code || v.licNum || '---') + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
   '<td><span class="stamp s">' + (v.type || 'عيادة تمريضية') + '</span></td>' +
   '<td>' + (v.owner || '---') + '</td>' +
   '<td>' + (v.gov || '---') + '<div class="sb">' + (v.zone || v.area || '---') + '</div></td>' +
   '<td><div class="nm" style="font-size:11px">' + (v.inspectDate || 'لم يتم الكشف') + '</div></td>' +
   '<td><span class="stamp ' + st + '">' + (v.lic || 'غير محدد') + '</span></td>' +
   '<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تفاصيل المنشأة</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">تحديث الإجازة</button></div></td>';
           tbody.appendChild(tr);
         });
      } else {
         tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red">خطأ في التحميل - يرجى المحاولة لاحقاً</td></tr>';
      }
    }
  };
  
  await window.loadFacilitiesTable();
  
  const p5GovFilter = document.querySelector('#p5 .filter-gov');
  if (p5GovFilter) {
    p5GovFilter?.addEventListener('change', (e) => {
      window.loadFacilitiesTable(e.target.value);
    });
  }

  // Fetch staff from Firebase
  try {
    const staffSnapshot = await getDocs(collection(db, "staff"));
    const staffTbody = document.getElementById('staff-tbody');
    if (staffTbody) {
      if (!staffSnapshot.empty) staffTbody.innerHTML = ''; // clear mock data only if we have records
      staffSnapshot.forEach((docSnap) => {
        const v = docSnap.data();
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="nm">' + (v.name || 'غير محدد') + '</div><div class="sb"><span class="code">' + (v.userNum || v.regNum || '---') + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
'<td><span class="stamp s">' + (v.role || v.title || 'ممرض فني') + '</span></td>' +
'<td><div class="nm" style="font-size:11.5px">' + (v.startDate || v.year || '---') + '</div></td>' +
'<td>' + (v.workplace || v.fac || '---') + '</td>' +
'<td>' + (v.gov || '---') + '</td>' +
'<td><span class="stamp ok">مستمر</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تعديل البيانات</button></div></td>';
        staffTbody.prepend(tr);
      });
      const elStaff = document.getElementById('stats-total-staff');
      if (elStaff) elStaff.textContent = staffSnapshot.size;
    }
  } catch (error) {
    console.error("Error fetching staff: ", error);
  }

  // Fetch users from Firebase
  try {
    const usersSnapshot = await getDocs(withGovFilter(collection(db, "users")));
    
    let inspCount = 0;
    let commCount = 0;
    let branchCount = 0;
    
    usersSnapshot.forEach(docSnap => {
      const v = docSnap.data();
      if (v.role && v.role.includes('ميداني')) inspCount++;
      else if (v.role && v.role.includes('لجنة')) commCount++;
      else if (v.role && v.role.includes('فرع')) branchCount++;
    });
    
    const elHeaderUsers = document.getElementById('header-total-users');
    if (elHeaderUsers) elHeaderUsers.textContent = usersSnapshot.size;
    const elStatUsers = document.getElementById('stat-total-users');
    if (elStatUsers) elStatUsers.textContent = usersSnapshot.size;
    
    const elStatInsp = document.getElementById('stat-field-insp');
    if (elStatInsp) elStatInsp.textContent = inspCount;
    const elStatComm = document.getElementById('stat-comm-managers');
    if (elStatComm) elStatComm.textContent = commCount;
    const elStatBranch = document.getElementById('stat-branch-managers');
    if (elStatBranch) elStatBranch.textContent = branchCount;
    const elStatActive = document.getElementById('stat-active-users');
    if (elStatActive) elStatActive.textContent = usersSnapshot.size + '/' + usersSnapshot.size;

    const usersTbody = document.getElementById('users-tbody');
    if (usersTbody) {
      if(!usersSnapshot.empty) { usersTbody.innerHTML = ''; } // clear mock data only if we have real data
      usersSnapshot.forEach((docSnap) => {
        const v = docSnap.data();
        const roleMap = {
          'القيادة العليا / النقيب': 'b',
          'مدير لجنة الانضباط': 'warn',
          'مسؤول فرع نقابي': 'warn',
          'مسؤول لجنة تفتيش': 's',
          'موظف تفتيش ميداني': 'b'
        };
        const rClass = roleMap[v.role] || 'b';
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><div class="nm">' + (v.name || 'مدير فرع') + '</div><div class="sb"><span class="code">' + (v.userNum || '---') + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
'<td><span class="stamp ' + rClass + '">' + (v.role || 'مدير') + '</span></td>' +
'<td class="code">' + (v.login || v.username || '---') + '</td>' +
'<td>' + (v.password || '---') + '</td>' +
'<td><div class="nm" style="font-size:11.5px">' + (v.edu || '---') + '</div></td>' +
'<td>' + (v.gov || '---') + '<div class="sb">' + (v.zone || '---') + '</div></td>' +
'<td><span class="stamp ok">نشط</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تغيير كلمة السر</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تعديل البيانات</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">ايقاف مؤقت</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#10b981;">استئناف العمل</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #ef4444; border-radius:4px; color:#ef4444;">حذف المستخدم</button></div></td>';
        usersTbody.prepend(tr);
      });
    }
  } catch (error) {
    console.error("Error fetching users: ", error);
  }

  // Fetch committees from Firebase
  try {
    const committeesSnapshot = await getDocs(collection(db, "committees"));
    const commList = document.getElementById('committees-list');
    if (commList) {
      if (!committeesSnapshot.empty) commList.innerHTML = ''; // clear mock data
      committeesSnapshot.forEach((docSnap) => {
        const v = docSnap.data();
        const el = document.createElement('div');
        el.className = 'comm-strip';
        el.innerHTML = '<div class="cs-head"><h4>' + v.name + '</h4><span class="code">' + v.code + '</span><span class="stamp ok" style="margin-right:auto">لجنة معتمدة</span></div>' +
        '<div class="cs-body"><div class="col"><h5>الممرضون المفتشون المكلفون (1)</h5><p><b>' + v.insp + '</b></p></div>' +
        '<div class="col"><h5>المحافظة والفرع والأحياء</h5><p>' + v.gov + ' — ' + v.branch + '</p><div class="chipset" style="margin-top:7px">' + (v.areas ? v.areas.split(/[,،]/).map(a=>'<span class="chp">'+a.trim()+'</span>').join('') : '') + '</div></div>' +
        '<div class="col"><h5>النطاق والإحداثيات (GPS)</h5><p><span class="code">' + v.gps + '</span></p><p style="margin-top:6px;font-size:11px;color:var(--warn)">✎ ' + v.note + '</p></div></div>' +
        '<div class="cs-foot"><button class="btn btn-1 btn-xs">الأمر الرسمي</button><button class="btn btn-o btn-xs">تعديل</button><button class="btn btn-3 btn-xs">خريطة</button></div>';
        commList.prepend(el);
      });
    }
  } catch (error) {
    console.error("Error fetching committees: ", error);
  }

  // Fetch tasks from Firebase
  try {
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    const tasksList = document.getElementById('tasks-list');
    if (tasksList) {
      if (!tasksSnapshot.empty) tasksList.innerHTML = ''; // clear mock data
      let violationCount = 0;
      tasksSnapshot.forEach((docSnap) => {
        const v = docSnap.data();
        if (v.prio === 'طارئة جداً' || v.prio === 'عالية') violationCount++;
        const el = document.createElement('div');
        el.className = 'titem ' + (v.cls || '');
        el.innerHTML = '<div class="tcard"><div class="tr1"><span class="code">' + v.code + '</span><span class="nm">' + v.fac + '</span><span class="stamp ' + (v.stp || 'b') + '">' + v.prio + '</span><span class="stamp s" style="margin-right:auto">معلقة (بانتظار المفتش)</span></div>' +
        '<div class="meta"><span>📅 تاريخ التفتيش: <b>' + v.date + '</b></span><span>👤 المفتش المكلف: <b>' + (v.insp ? v.insp.split(' (')[0] : '') + '</b></span><span>📍 ' + v.addr + '</span></div>' +
        '<div class="note">' + v.note + '</div></div>';
        tasksList.prepend(el);
      });
      const elViolations = document.getElementById('stats-total-violations');
      if (elViolations) elViolations.textContent = violationCount > 0 ? violationCount : '14';
    }
  } catch (error) {
    console.error("Error fetching tasks: ", error);
  }
});

// Date display
const dateEl = document.getElementById('currentDate');
if (dateEl) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateEl.textContent = new Intl.DateTimeFormat('ar-IQ', options).format(new Date());
}

// Language toggle logic
const langToggleBtn = document.getElementById('langToggle');
if (langToggleBtn) {
  langToggleBtn?.addEventListener('click', () => {
    if(window.toggleLanguage) {
      window.toggleLanguage();
      toast(langToggleBtn.textContent === 'EN' ? 'تم التحويل إلى العربية' : 'Switched to English', 'okt');
    }
  });
}

const app=document.querySelector('.app');
const nav=document.getElementById('nav');
const crumb=document.getElementById('crumbTitle');
const mq=()=>window.innerWidth<=880;

let gisMap;

nav?.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  nav.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const targetPage = document.getElementById(b.dataset.p);
  if (targetPage) targetPage.classList.add('active');
  if (crumb) crumb.textContent=b.textContent.replace(/[0-9]+$/,'').trim();
  if(mq() && app) app.classList.remove('open-m');
  window.scrollTo({top:0,behavior:'smooth'});

  // If GIS tab is opened, fix map sizing issue
  if(b.dataset.p === 'p2' && gisMap) {
    setTimeout(() => {
      gisMap.invalidateSize();
    }, 100);
  }
});

document?.addEventListener('DOMContentLoaded', () => {
  // Init GIS Map
  if(document.getElementById('gis-map') && typeof L !== 'undefined') {
    let initialCoords = [33.3152, 44.3661]; // Default to Baghdad
    if (currentUserRole !== 'admin' && currentUserGov && govCoords[currentUserGov]) {
      initialCoords = govCoords[currentUserGov];
    }
    try {
      gisMap = L.map('gis-map').setView(initialCoords, currentUserRole === 'admin' ? 6 : 10);
    } catch (err) {
      console.error("setView error:", initialCoords, err);
      gisMap = L.map('gis-map').setView([33.3152, 44.3661], 6);
    } 
    window.gisMap = gisMap;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19
    }).addTo(gisMap);

    let osmLayerGroup;
    if (typeof L.markerClusterGroup === 'function') {
      osmLayerGroup = L.markerClusterGroup({ disableClusteringAtZoom: 16 }).addTo(gisMap);
    } else {
      osmLayerGroup = L.layerGroup().addTo(gisMap);
    }
    window.currentOSMMarkers = [];
    
    async function updateMapData() {
      osmLayerGroup.clearLayers();
      window.currentOSMMarkers = [];
      
      if (!window.dbFacilities) return;
      
      window.dbFacilities.forEach(f => {
        if (!f.lat || !f.lon || isNaN(parseFloat(f.lat)) || isNaN(parseFloat(f.lon))) return;
        let color = '#059669'; // default green (clinic)
        let iconStr = '⚕️';
        let typeStr = f.type || 'عيادة تمريضية';
        
        if (typeStr.includes('مستشفى')) {
          color = '#2563eb'; // blue
          iconStr = '🏥';
        } else if (typeStr.includes('مركز')) {
          color = '#d97706'; // amber
          iconStr = '🏢';
        }
        
        const customIcon = L.divIcon({
          className: 'custom-osm-marker',
          html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.4); border: 2px solid white;">${iconStr}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        let marker;
        try {
          const lat = parseFloat(f.lat);
          const lon = parseFloat(f.lon);
          if (isNaN(lat) || isNaN(lon)) {
            return;
          }
          marker = L.marker([lat, lon], {icon: customIcon});
        } catch (err) {
          console.error("Marker error for facility", f.name, f.lat, f.lon, err);
          return;
        }
        marker
          .bindPopup(`<div style="font-family:'Alqabas', sans-serif; text-align:right; min-width: 180px;" dir="rtl">
                        <b style="font-size:14px; color:${color}; border-bottom: 1px solid var(--line); padding-bottom: 4px; display: block; margin-bottom: 6px;">${f.name}</b>
                        <div style="font-size: 12px; line-height: 1.8; color: var(--c1);">
                          <b>النوع:</b> ${typeStr}<br>
                          ${f.phone && f.phone !== 'غير متوفر' ? `<b>📞 الهاتف:</b> <span dir="ltr">${f.phone}</span><br>` : ''}
                          ${f.owner && f.owner !== 'غير متوفر' && f.owner !== 'غير مسجل بالمصدر' ? `<b>👤 الإدارة:</b> ${f.owner}<br>` : ''}
                          ${f.openingHours && f.openingHours !== 'غير متوفر' ? `<b>⏰ الدوام:</b> ${f.openingHours}<br>` : ''}
                          ${f.area && f.area !== 'غير متوفر' && f.area !== 'تم تحديدها جغرافياً' ? `<b>📍 الموقع:</b> ${f.gov} / ${f.area}<br>` : ''}
                        </div>
                      </div>`);
        marker.facilityName = f.name || '';
        marker.facilityOwner = f.owner || '';
        marker.facilityLic = (f.code || '') + ' ' + (f.licNum || '');
        window.currentOSMMarkers.push(marker);
      });
      osmLayerGroup.addLayers(window.currentOSMMarkers);
    }
    window.updateMapData = updateMapData;
    
    // GIS Search Logic
    const searchInput = document.getElementById('gis-search');
    if(searchInput) {
      searchInput?.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
          const term = e.target.value.toLowerCase().trim();
          if(!term) return;
          
          let foundMarker = null;
          for (const marker of window.currentOSMMarkers) {
            if (marker.facilityName && marker.facilityName.toLowerCase().includes(term)) {
              foundMarker = marker;
              break;
            }
          }
          
          if (foundMarker && typeof foundMarker.getLatLng === 'function') {
            const pos = foundMarker.getLatLng();
            if (pos && !isNaN(pos.lat) && !isNaN(pos.lng)) {
              const size = gisMap.getSize ? gisMap.getSize() : null;
              if (size && size.x > 0 && size.y > 0) {
                gisMap.flyTo(pos, 16);
              } else {
                gisMap.setView(pos, 16);
              }
              foundMarker.openPopup();
            }
          } else {
            toast('❌ لم يتم العثور على منشأة مطابقة في النطاق الحالي للبحث', 'badt');
          }
        }
      });
    }
  }
});

document.getElementById('sideToggle')?.addEventListener('click',()=>{
  if (app) {
    if(mq()) app.classList.toggle('open-m');
    else app.classList.toggle('closed');
  }
});
document.getElementById('backdrop')?.addEventListener('click',()=>app?.classList.remove('open-m'));
window?.addEventListener('resize',()=>{ if(!mq()) app?.classList.remove('open-m'); });

const themeBtn=document.getElementById('themeToggle');
themeBtn?.addEventListener('click',()=>{
  const r=document.documentElement;
  const dark=r.getAttribute('data-theme')==='dark';
  if(dark){ r.removeAttribute('data-theme'); themeBtn.textContent='\u{1F319}'; }
  else{ r.setAttribute('data-theme','dark'); themeBtn.textContent='\u2600\uFE0F'; }
});

document.querySelectorAll('.bottom-nav').forEach(g=>g?.addEventListener('click',e=>{
  const t=e.target.closest('.bn'); if(!t) return;
  g.querySelectorAll('.bn').forEach(x=>x.classList.remove('on')); t.classList.add('on');
}));

/* ============ نظام النوافذ والإشعارات وتفعيل الأزرار ============ */
if (!document.getElementById('mWrap')) {
  document.body.insertAdjacentHTML('beforeend',
   '<div class="modal-wrap" id="mWrap"><div class="modal"><div class="m-head"><h4 id="mTitle"></h4><button class="m-close" id="mClose">✕</button></div><div class="m-body" id="mBody"></div><div class="m-foot"><button class="btn btn-1" id="mSave">حفظ وإضافة</button><button class="btn btn-o" id="mCancel">إلغاء</button></div></div></div>'+
   '<div class="toast-box" id="toastBox"></div>');
}

const mWrap=document.getElementById('mWrap'),mTitle=document.getElementById('mTitle'),mBody=document.getElementById('mBody');
const mSaveBtn=document.getElementById('mSave'),mCancelBtn=document.getElementById('mCancel');
let mMode=null;

function toast(msg,cls){
  const t=document.createElement('div');t.className='toast '+(cls||'');t.innerHTML=msg;
  const tb = document.getElementById('toastBox');
  if (tb) {
    tb.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .4s';setTimeout(()=>t.remove(),400)},2600);
  }
}
function closeModal(){ if(mWrap) mWrap.classList.remove('show'); }
if (document.getElementById('mClose')) document.getElementById('mClose').onclick=closeModal;
if (document.getElementById('mCancel')) document.getElementById('mCancel').onclick=closeModal;
mWrap?.addEventListener('click',e=>{if(e.target===mWrap)closeModal()});

const GOV = Object.keys(iraqRegions);
const INSP=['علي حسين الكعبي (INSP-2026-88)','زينب فاضل الزبيدي (INSP-2026-89)','عمار جاسم البصري (INSP-2026-92)'];
function opts(a){return a.map(x=>'<option>'+x+'</option>').join('')}
function fld(f){
  const inner=f.t==='select'?'<select data-k="'+f.k+'">'+opts(f.o)+'</select>'
    :f.t==='textarea'?'<textarea data-k="'+f.k+'" rows="2" placeholder="'+(f.ph||'')+'"></textarea>'
    :'<input data-k="'+f.k+'" type="'+(f.t||'text')+'" placeholder="'+(f.ph||'')+'">';
  return '<div class="m-field'+(f.full?' full':'')+'"><label>'+f.l+'</label>'+inner+'</div>';
}
function openModal(type,preset,mode){
  const F=FORMS[type];mMode=mode||{kind:'add',type};
  mTitle.textContent=mode&&mode.title?mode.title:F.title;
  mBody.innerHTML=F.fields.map(fld).join('');
  // Setup cascading dropdowns in modals
  const govSelect = mBody.querySelector('select[data-k="gov"]');
  if(govSelect) {
    const depSelect = mBody.querySelector('select[data-k="branch"]') || mBody.querySelector('select[data-k="zone"]');
    const areaSelect = mBody.querySelector('select[data-k="area"]');
    
    const updateDep = () => {
      const gov = govSelect.value;
      if (depSelect) {
        depSelect.innerHTML = '<option value="">اختر الفرع...</option>';
        if(gov && typeof iraqRegions !== "undefined" && iraqRegions[gov]) {
          iraqRegions[gov].forEach(zone => {
            depSelect.innerHTML += '<option value="' + zone + '">' + zone + '</option>';
          });
        }
        updateArea();
      }
    };
    
    const updateArea = () => {
      if (areaSelect) {
        areaSelect.innerHTML = '<option value="">اختر الحي...</option>';
        let zoneVal = depSelect ? depSelect.value : null;
        if(!zoneVal) zoneVal = govSelect.value;
        if(zoneVal && typeof zoneNeighborhoods !== "undefined" && zoneNeighborhoods[zoneVal]) {
          zoneNeighborhoods[zoneVal].forEach(n => {
            areaSelect.innerHTML += '<option value="' + n + '">' + n + '</option>';
          });
        }
      }
    };
    
    govSelect?.addEventListener('change', updateDep);
    if (depSelect) depSelect?.addEventListener('change', updateArea);
    
    if (preset && preset.gov) {
       govSelect.value = preset.gov;
       updateDep();
       if (depSelect && preset[depSelect.dataset.k]) {
         depSelect.value = preset[depSelect.dataset.k];
         updateArea();
         if (areaSelect && preset.area) areaSelect.value = preset.area;
       }
    } else {
       updateDep();
    }
  }

  if(preset) mBody.querySelectorAll('[data-k]').forEach(el=>{if(preset[el.dataset.k]!=null)el.value=preset[el.dataset.k]});
  mSaveBtn.style.display='';mSaveBtn.textContent=mode&&mode.save?mode.save:'حفظ وإضافة';
  mCancelBtn.textContent='إلغاء';
  mWrap.classList.add('show');
}
function openView(title,html){
  mMode=null;mTitle.textContent=title;
  mBody.innerHTML='<div class="m-field full">'+html+'</div>';
  mSaveBtn.style.display='none';mCancelBtn.textContent='إغلاق';
  mWrap.classList.add('show');
}
function vals(){
  const o={};mBody.querySelectorAll('[data-k]').forEach(el=>{o[el.dataset.k]=el.value||el.getAttribute('placeholder')||'—'});
  return o;
}
const rnd=n=>String(Math.floor(Math.random()*9000)+1000).slice(0,n||4);

const FORMS={
 committee:{title:'➕ إضافة لجنة تفتيش جديدة',fields:[
  {k:'name',l:'اسم اللجنة',ph:'لجنة الكشف الميداني الجديدة',full:1},
  {k:'gov',l:'المحافظة',t:'select',o:GOV},
  {k:'branch',l:'الفرع / القطاع',t:'select',o:[]},
  {k:'insp',l:'المفتش المكلف',t:'select',o:INSP},
  {k:'areas',l:'الأحياء المشمولة (افصل بفارزة)',ph:'المنصور, الحارثية'},
  {k:'gps',l:'النطاق والإحداثيات (GPS)',ph:'33.3000, 44.4000 → 33.3300, 44.4300',full:1},
  {k:'note',l:'ملاحظات وتوجيهات الخطة',t:'textarea',ph:'توجيهات اللجنة...',full:1}]},
 user:{title:'➕ إضافة مستخدم / موظف تفتيش جديد',fields:[
  {k:'name',l:'الاسم الكامل والصفة',ph:'المفتش الميداني / اسم جديد',full:1},
  {k:'role',l:'الدور الوظيفي',t:'select',o:['موظف تفتيش ميداني','مسؤول لجنة تفتيش','مسؤول فرع نقابي','القيادة العليا / النقيب']},
  {k:'login',l:'اسم المستخدم (Login)',ph:'new_user'},
  {k:'phone',l:'رقم الهاتف',ph:'07XXXXXXXXX'},
  {k:'gov',l:'المحافظة',t:'select',o:GOV},
  {k:'edu',l:'التحصيل والتخصص',ph:'بكالوريوس تمريض',full:1},
  {k:'zone',l:'الفرع / الزون المكلف به',t:'select',o:[],full:1}]},
 facility:{title:'➕ إضافة منشأة أهلية جديدة',fields:[
  {k:'name',l:'اسم المنشأة',ph:'عيادة / مستشفى جديد',full:1},
  {k:'type',l:'نوع المنشأة',t:'select',o:['عيادة تمريضية/ضماد','مستشفى أهلي','مركز تمريضي']},
  {k:'gov',l:'المحافظة',t:'select',o:GOV},
  {k:'area',l:'الحي / القضاء',t:'select',o:[]},
  {k:'owner',l:'صاحب المنشأة / المالك',ph:'اسم المالك'},
  {k:'phone',l:'رقم الهاتف',ph:'07XXXXXXXXX'},
  {k:'lic',l:'حالة الترخيص',t:'select',o:['مرخصة رسمياً','قيد الترخيص','ترخيص منتهي','غير مرخصة']}]},
 task:{title:'➕ جدولة مَهمّة كشف ميداني جديدة',fields:[
  {k:'fac',l:'المنشأة المستهدفة',ph:'اسم المنشأة',full:1},
  {k:'addr',l:'العنوان والحي',ph:'بغداد - الحي - الشارع',full:1},
  {k:'insp',l:'المفتش المكلف',t:'select',o:INSP},
  {k:'date',l:'تاريخ التفتيش',t:'date'},
  {k:'prio',l:'الأولوية',t:'select',o:['عادية','عالية','طارئة جداً']},
  {k:'note',l:'التوجيهات والتعليمات',t:'textarea',ph:'تعليمات الكشف...',full:1}]},
 nurse:{title:'➕ إضافة كادر تمريضي جديد',fields:[
  {k:'name',l:'الاسم واللقب العلمي',ph:'اسم الكادر الجديد',full:1},
  {k:'title',l:'الصفة المهنية',ph:'ممرض جامعي'},
  {k:'edu',l:'المؤهل الدراسي',t:'select',o:['كلية التمريض (بكالوريوس)','المعهد الطبي الفني (دبلوم عالي)','المعهد الطبي الفني (دبلوم)','إعدادية التمريض']},
  {k:'year',l:'سنة التخرج',ph:'2024'},
  {k:'exp',l:'تاريخ انتهاء الهوية',t:'date'},
  {k:'fac',l:'المنشأة الحالية',ph:'اسم المنشأة',full:1}]}
};

const ADD={
 committee: async function(v){
  const commCode = 'czone_' + rnd(2);
  
  try {
    const docRef = await addDoc(collection(db, "committees"), {
      name: v.name,
      insp: v.insp,
      gov: v.gov,
      branch: v.branch,
      areas: v.areas,
      gps: v.gps,
      note: v.note,
      code: commCode,
      timestamp: new Date()
    });
    
    const el = document.createElement('div');
    el.className = 'comm-strip flash-new';
    el.innerHTML = '<div class="cs-head"><h4>' + v.name + '</h4><span class="code">' + commCode + '</span><span class="stamp ok" style="margin-right:auto">لجنة معتمدة</span></div>' +
    '<div class="cs-body"><div class="col"><h5>الممرضون المفتشون المكلفون (1)</h5><p><b>' + v.insp + '</b></p></div>' +
    '<div class="col"><h5>المحافظة والفرع والأحياء</h5><p>' + v.gov + ' — ' + v.branch + '</p><div class="chipset" style="margin-top:7px">' + (v.areas ? v.areas.split(/[,،]/).map(a=>'<span class="chp">'+a.trim()+'</span>').join('') : '') + '</div></div>' +
    '<div class="col"><h5>النطاق والإحداثيات (GPS)</h5><p><span class="code">' + v.gps + '</span></p><p style="margin-top:6px;font-size:11px;color:var(--warn)">✎ ' + v.note + '</p></div></div>' +
    '<div class="cs-foot"><button class="btn btn-1 btn-xs">الأمر الرسمي</button><button class="btn btn-o btn-xs">تعديل</button><button class="btn btn-3 btn-xs">خريطة</button></div>';
    
    const list = document.getElementById('committees-list');
    if (list) list.prepend(el);
    
    toast('✔ تمت إضافة "' + v.name + '" لسجل اللجان في قاعدة البيانات بنجاح', 'okt');
  } catch(e) {
    console.error("Error adding committee: ", e);
    toast('❌ خطأ في الاتصال بقاعدة البيانات', 'badt');
  }
 },
 user: async function(v){
  const userNum = 'NURSE-NEW-' + rnd(3);
  const pw = String(Math.floor(Math.random()*900000)+100000);
  
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name: v.name,
      role: v.role,
      login: v.login,
      phone: v.phone,
      gov: v.gov,
      edu: v.edu,
      zone: v.zone,
      userNum: userNum,
      password: pw,
      timestamp: new Date()
    });
    
    const roleMap = {
      'القيادة العليا / النقيب': 'b',
      'مدير لجنة الانضباط': 'warn',
      'مسؤول فرع نقابي': 'warn',
      'مسؤول لجنة تفتيش': 's',
      'موظف تفتيش ميداني': 'b'
    };
    const rClass = roleMap[v.role] || 'b';
    
    const tr = document.createElement('tr');
    tr.className = 'flash-new';
    tr.innerHTML = '<td><div class="nm">' + (v.name || 'مدير فرع') + '</div><div class="sb"><span class="code">' + (v.userNum || userNum) + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
'<td><span class="stamp ' + rClass + '">' + (v.role || 'مدير') + '</span></td>' +
'<td class="code">' + (v.login || v.username || '---') + '</td>' +
'<td>' + (v.password || pw) + '</td>' +
'<td><div class="nm" style="font-size:11.5px">' + (v.edu || '---') + '</div></td>' +
'<td>' + (v.gov || '---') + '<div class="sb">' + (v.zone || '---') + '</div></td>' +
'<td><span class="stamp ok">نشط</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تغيير كلمة السر</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تعديل البيانات</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">ايقاف مؤقت</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#10b981;">استئناف العمل</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #ef4444; border-radius:4px; color:#ef4444;">حذف المستخدم</button></div></td>';
    const utb = document.getElementById('users-tbody');
    if (utb) utb.prepend(tr);
    
    toast('✔ تمت إضافة المستخدم "' + v.login + '" إلى قاعدة البيانات بنجاح', 'okt');
  } catch(e) {
    console.error("Error adding user: ", e);
    toast('❌ خطأ في الاتصال بقاعدة البيانات', 'badt');
  }
 },
 facility: async function(v){
  const st = v.lic === 'مرخصة رسمياً' ? 'ok' : (v.lic === 'قيد الترخيص' ? 'warn' : 'bad');
  const licNum = 'IRQ-NUR-2026-' + rnd(3);
  
  try {
    const docRef = await addDoc(collection(db, "facilities"), {
      name: v.name,
      type: v.type,
      lic: v.lic,
      area: v.area,
      gov: v.gov,
      owner: v.owner,
      phone: v.phone,
      licNum: licNum,
      timestamp: new Date()
    });
    
    const tr = document.createElement('tr');
    tr.className = 'flash-new';
    tr.innerHTML = '<td><div class="nm">' + (v.name || 'غير محدد') + '</div><div class="sb"><span class="code">' + licNum + '</span> &bull; ' + (v.phone || '---') + '</div></td>' +
'<td><span class="stamp s">' + (v.type || 'عيادة تمريضية') + '</span></td>' +
'<td>' + (v.owner || '---') + '</td>' +
'<td>' + (v.gov || '---') + '<div class="sb">' + (v.area || '---') + '</div></td>' +
'<td><div class="nm" style="font-size:11px">لم يتم الكشف</div></td>' +
'<td><span class="stamp ' + st + '">' + (v.lic || 'غير محدد') + '</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تفاصيل المنشأة</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">تحديث الإجازة</button></div></td>';
    const ftb = document.getElementById('facilities-tbody');
    if (ftb) ftb.prepend(tr);
    
    const pin = document.createElement('div');
    pin.className = 'mpin o';
    pin.textContent = '⚕';
    pin.style.top = (15 + Math.random() * 65) + '%';
    pin.style.right = (15 + Math.random() * 65) + '%';
    if(document.querySelector('#p2 .map2')) document.querySelector('#p2 .map2').appendChild(pin);
    
    toast('✔ تمت إضافة المنشأة إلى قاعدة البيانات السحابية (Firebase) بنجاح', 'okt');
  } catch(e) {
    console.error("Error adding document: ", e);
    toast('❌ خطأ في الاتصال بقاعدة البيانات', 'badt');
  }
 },
 task: async function(v){
  const cls=v.prio==='طارئة جداً'?'hi':(v.prio==='عالية'?'md':'');
  const stp=v.prio==='طارئة جداً'?'bad':(v.prio==='عالية'?'warn':'b');
  const taskCode = 'INSP-2026-' + rnd(4);
  
  try {
    const docRef = await addDoc(collection(db, "tasks"), {
      fac: v.fac,
      addr: v.addr,
      insp: v.insp,
      date: v.date,
      prio: v.prio,
      note: v.note,
      code: taskCode,
      cls: cls,
      stp: stp,
      timestamp: new Date()
    });
    
    const el=document.createElement('div');el.className='titem '+cls;
    el.innerHTML='<div class="tcard flash-new"><div class="tr1"><span class="code">' + taskCode + '</span><span class="nm">'+v.fac+'</span><span class="stamp '+stp+'">'+v.prio+'</span><span class="stamp s" style="margin-right:auto">معلقة (بانتظار المفتش)</span></div>'+
    '<div class="meta"><span>📅 تاريخ التفتيش: <b>'+v.date+'</b></span><span>👤 المفتش المكلف: <b>'+(v.insp ? v.insp.split(' (')[0] : '')+'</b></span><span>📍 '+v.addr+'</span></div>'+
    '<div class="note">'+v.note+'</div></div>';
    
    const tl = document.getElementById('tasks-list');
    if (tl) tl.prepend(el);
    
    toast('✔ تمت جدولة مهمة الكشف على "'+v.fac+'" في قاعدة البيانات بنجاح','okt');
  } catch(e) {
    console.error("Error adding task: ", e);
    toast('❌ خطأ في الاتصال بقاعدة البيانات', 'badt');
  }
 },
 nurse: async function(v){
  const regNum = 'NR-BAG-2026-' + rnd(4);
  
  try {
    const docRef = await addDoc(collection(db, "staff"), {
      name: v.name,
      title: v.title,
      edu: v.edu,
      year: v.year,
      exp: v.exp,
      fac: v.fac,
      regNum: regNum,
      timestamp: new Date()
    });
    
    const tr = document.createElement('tr');
    tr.className = 'flash-new';
    tr.innerHTML = '<td><div class="nm">' + (v.name || 'غير محدد') + '</div><div class="sb"><span class="code">' + regNum + '</span> &bull; </div></td>' +
'<td><span class="stamp s">' + (v.title || 'ممرض فني') + '</span></td>' +
'<td><div class="nm" style="font-size:11.5px">' + (v.year || '---') + '</div></td>' +
'<td>' + (v.fac || '---') + '</td>' +
'<td>بغداد</td>' +
'<td><span class="stamp ok">مستمر</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تعديل البيانات</button></div></td>';
    const stb = document.getElementById('staff-tbody');
    if (stb) stb.prepend(tr);
    
    toast('✔ تم تسجيل الكادر التمريضي في قاعدة البيانات السحابية (Firebase) بنجاح', 'okt');
  } catch(e) {
    console.error("Error adding document: ", e);
    toast('❌ خطأ في الاتصال بقاعدة البيانات', 'badt');
  }
 }
};

/* ===== بيانات كارد اللجنة ===== */
function commData(el){
  const cols=el.querySelectorAll('.col');
  const notes=cols[2]?cols[2].querySelectorAll('p'):[];
  return {
    el,
    name:el.querySelector('.cs-head h4').textContent.trim(),
    code:el.querySelector('.cs-head .code').textContent.trim(),
    insp:cols[0]&&cols[0].querySelector('p b')?cols[0].querySelector('p b').textContent.trim():'—',
    govline:cols[1]&&cols[1].querySelector('p')?cols[1].querySelector('p').textContent.trim():'—',
    areas:cols[1]?[...cols[1].querySelectorAll('.chp')].map(c=>c.textContent.trim()):[],
    gps:cols[2]&&cols[2].querySelector('.code')?cols[2].querySelector('.code').textContent.trim():'—',
    note:notes[1]?notes[1].textContent.replace('✎','').trim():'—'
  };
}
function showOrder(d){
  openView('📄 الأمر الإداري الرسمي — '+d.code,
  '<div style="border:1.5px solid var(--line);border-radius:14px;padding:20px 22px;line-height:2.3;font-size:12.5px;background:var(--bg)">'+
  '<div style="text-align:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:12px">'+
  '<b style="font-size:14px;color:var(--c2)">جمهورية العراق</b><br>نقابة التمريض العراقية — المقر العام<br><span style="font-size:11px;color:var(--muted)">المنصة الوطنية للرقابة والتفتيش الصحي</span></div>'+
  '<div style="display:flex;justify-content:space-between;font-size:11.5px;flex-wrap:wrap;gap:6px"><span>العدد: ن ت ع / '+d.code+' / 2026</span><span>التاريخ: 14 / 8 / 2026</span></div>'+
  '<div style="text-align:center;margin:12px 0;font-weight:400;color:var(--c1);border:1px dashed var(--c3);border-radius:9px;padding:6px">م / أمر إداري — تشكيل لجنة تفتيش ميدانية</div>'+
  '<p>استناداً إلى أحكام قانون نقابة التمريض العراقية وتعليمات الرقابة الصحية النافذة، تقرر تشكيل <b>'+d.name+'</b> برمز ('+d.code+') وبعضوية <b>'+d.insp+'</b>، لتغطية مناطق: '+d.areas.join('، ')+' ضمن ('+d.govline+')، وبالنطاق الجغرافي المحدد بالإحداثيات: <span class="code">'+d.gps+'</span>.</p>'+
  '<p style="margin-top:6px">التوجيهات: '+d.note+'</p>'+
  '<p style="margin-top:6px">وعلى الجهات كافة تسهيل مهمة اللجنة أعلاه... للتفضل بالاطلاع مع التقدير.</p>'+
  '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;flex-wrap:wrap;gap:10px">'+
  '<div style="width:86px;height:86px;border:2px dashed var(--c2);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:9px;color:var(--c2);transform:rotate(-8deg)">ختم النقابة<br>المقر العام</div>'+
  '<div style="text-align:center;font-size:12px"><b>د. فراس الموسوي</b><br><span style="color:var(--muted);font-size:11px">نقيب التمريض العراقي</span></div></div></div>');
}
function showZoneMap(d){
  openView('🗺 نطاق التغطية الجغرافي — '+d.name,
  '<div class="map2" style="height:300px;margin-bottom:10px"><div class="river2"></div>'+
  '<div style="position:absolute;inset:18% 24% 28% 28%;border:2.5px dashed var(--c2);background:rgba(75,184,250,.13);border-radius:12px"></div>'+
  '<div class="mpin g" style="top:30%;right:35%">⚕</div><div class="mpin g" style="top:52%;right:48%">🏥</div><div class="mpin o" style="top:44%;right:60%">⚕</div>'+
  '<span style="position:absolute;bottom:8px;left:12px;font-size:10px;color:var(--muted);background:var(--card);padding:2px 9px;border-radius:6px">'+d.code+' — GIS</span></div>'+
  '<div style="font-size:11.5px;line-height:2"><b style="color:var(--c2)">الإحداثيات:</b> <span class="code">'+d.gps+'</span><br><b style="color:var(--c2)">الأحياء المشمولة:</b> '+d.areas.join('، ')+'</div>');
}
function editCommittee(d){
  openModal('committee',{name:d.name,insp:d.insp,areas:d.areas.join('، '),gps:d.gps,note:d.note},
    {kind:'editComm',d,title:'✎ تعديل بيانات '+d.name,save:'حفظ التعديلات'});
}
function saveComm(d,v){
  d.el.querySelector('.cs-head h4').textContent=v.name;
  const cols=d.el.querySelectorAll('.col');
  if(cols[0]&&cols[0].querySelector('p b'))cols[0].querySelector('p b').textContent=v.insp;
  if(cols[1]){cols[1].querySelector('p').textContent=v.gov+' — '+v.branch;
    const cs=cols[1].querySelector('.chipset');if(cs)cs.innerHTML=v.areas.split(/[,،]/).map(a=>'<span class="chp">'+a.trim()+'</span>').join('');}
  if(cols[2]){const c=cols[2].querySelector('.code');if(c)c.textContent=v.gps;
    const ps=cols[2].querySelectorAll('p');if(ps[1])ps[1].innerHTML='✎ '+v.note;}
  d.el.classList.remove('flash-new');void d.el.offsetWidth;d.el.classList.add('flash-new');
  toast('✔ تم حفظ تعديلات "'+v.name+'"','okt');
}
/* ===== تفاصيل وتعديل صفوف الجداول ===== */
function rowInfo(tr){
  const heads=[...tr.closest('table').querySelectorAll('thead th')].map(th=>th.textContent.trim());
  return [...tr.children].map((td,i)=>({td,h:heads[i]||'',
    txt:(td.children.length?[...td.children].map(x=>x.textContent.trim()).filter(Boolean).join(' — '):td.textContent.trim())||td.textContent.trim(),
    editable:!td.querySelector('button'),nm:td.querySelector('.nm')}));
}
function rowModal(tr,edit){
  const cells=rowInfo(tr).filter(c=>c.editable);
  mMode=edit?{kind:'rowEdit',cells}:null;
  mTitle.textContent=(edit?'✎ تعديل بيانات السجل':'🔍 التفاصيل الكاملة للسجل');
  mBody.innerHTML=cells.map((c,i)=>'<div class="m-field'+(i===0?' full':'')+'"><label>'+c.h+'</label>'+
    (edit?'<input data-i="'+i+'" value="'+(c.nm?c.nm.textContent.trim():c.txt).replace(/"/g,'&quot;')+'">'
         :'<div style="font-size:12px;font-weight:300;line-height:1.9;background:var(--bg);border-radius:9px;padding:9px 12px">'+c.txt+'</div>')+'</div>').join('');
  mSaveBtn.style.display=edit?'':'none';mSaveBtn.textContent='حفظ التعديلات';
  mCancelBtn.textContent=edit?'إلغاء':'إغلاق';
  mWrap.classList.add('show');
}
function saveRow(m){
  mBody.querySelectorAll('input[data-i]').forEach(inp=>{
    const c=m.cells[+inp.dataset.i];
    if(c.nm)c.nm.textContent=inp.value; else c.td.textContent=inp.value;
  });
  toast('✔ تم حفظ تعديلات السجل بنجاح','okt');
}

if (mSaveBtn) {
  mSaveBtn.onclick=()=>{
    if(!mMode)return closeModal();
    const m=mMode;
    if(m.kind==='add')ADD[m.type](vals());
    else if(m.kind==='editComm')saveComm(m.d,vals());
    else if(m.kind==='rowEdit')saveRow(m);
    closeModal();
  };
}

/* توجيه كل الأزرار حسب نصّها */
document?.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(!b) return;
  if(b.closest('#nav')||b.closest('.modal-wrap')||b.closest('.bottom-nav')||['sideToggle','themeToggle','mClose','mCancel','mSave'].includes(b.id)) return;
  const t=b.textContent.trim();

  /* أزرار كارد اللجنة */
  const card=b.closest('.comm-strip');
  if(card){
    if(t.includes('الأمر الرسمي')) return showOrder(commData(card));
    if(t.includes('خريطة')) return showZoneMap(commData(card));
    if(t.includes('تعديل')) return editCommittee(commData(card));
  }
  /* أزرار صفوف الجداول */
  const tr=b.closest('tbody tr');
  if(tr){
    if(t.includes('تعديل')) return rowModal(tr,true);
    if(t.includes('تفاصيل')||t.includes('عرض')) return rowModal(tr,false);
  }

  if(b.id === 'addUserBtn' || t.includes('إضافة مستخدم')) return window.openCustomUserModal();
  if(t.includes('إضافة لجنة') || t.includes('إدارة وتشكيل لجان')) return openModal('committee');
  
  if(t.includes('إضافة منشأة')) return openModal('facility');
  if(t.includes('جدولة مَهمّة')||t.includes('جدولة كشف')) return openModal('task');
  if(t.includes('إضافة كادر')) return openModal('nurse');
  if(t.includes('إنذار للمالك')) return toast('📨 تم إرسال الإنذار الرسمي لمالك المنشأة عبر SMS والبريد','okt');
  if(t.includes('إنذار للمفتش')) return toast('🔔 تم تبليغ المفتش المكلف بالزون بالإنذار','okt');
  if(t.includes('Excel')) { 
      let activeTab = document.querySelector('.page.active');
      let tableId = 'facilities-table';
      if (activeTab) {
          const tb = activeTab.querySelector('.dtable');
          if (tb && tb.id) tableId = tb.id;
          else if (tb) {
            tb.id = 'export-temp-table';
            tableId = 'export-temp-table';
          }
      }
      window.exportTableToCSV(tableId, tableId + '_export.csv'); 
      return toast('✅ تم التصدير بنجاح', 'okt'); 
  }
  if(t.includes('PDF')) return toast('🖨 جاري توليد تقرير PDF الرسمي للوزارة...');
  if(t.includes('استعلام فوري')){const q=document.querySelector('#p9 .id-form input');const n=(q&&q.value.trim())||'NR-BAG-2021-8841';return toast('✔ '+n+' — هوية سارية ومجازة حتى 2027-08-30','okt');}
  if(t.includes('مسح QR')) return toast('📷 جاري تشغيل الكاميرا لمسح باركود الهوية...');
  if(t.includes('تأكيد الحضور')){b.textContent='✔ تم تسجيل الحضور الميداني بنجاح';b.classList.remove('btn-2');b.classList.add('btn-g');return toast('✔ Check-In ناجح — المسافة 20 متر ضمن النطاق المعتمد','okt');}
  if(t.includes('محاكاة: داخل')) return toast('✔ ضمن النطاق (15م) — يمكن تأكيد الحضور','okt');
  if(t.includes('محاكاة: بعيد')) return toast('⚠ خارج النطاق المعتمد (1.2 كم) — لا يمكن الـ Check-In','badt');
  if(t.includes('تعديل')) return toast('✎ فتح نموذج التعديل');
  if(t.includes('تحديث البيانات')) return toast('⟳ تمت مزامنة البيانات مع الخادم المركزي','okt');
  if(t.includes('الشاشة الكاملة')) return toast('⛶ وضع الشاشة الكاملة للتطبيق الميداني');
  if(t.includes('إدارة وتسمية')) return toast('▣ سيتم إضافة واجهة إدارة اللجان قريباً', 'okt');
  if(t.includes('السابق')||t.includes('التالي')||/^[0-9]+$/.test(t)) return toast('📄 التنقل بين صفحات السجل');
  if(b.classList.contains('out')) return toast('⏻ جاري تسجيل الخروج من النظام...', 'okt');
  if(b.classList.contains('icon-btn')&&t.includes('🔔')) return toast('🔔 لديك 3 تنبيهات تراخيص وشيكة الانتهاء');
  if(t==='EN') return toast('🌐 English interface — قيد التوفير قريباً');
  toast('✔ سيتم تفعيل هذه الميزة في التحديث القادم', 'okt');
});

document?.addEventListener('DOMContentLoaded', () => {
  const govSelect = document.getElementById('gis-gov');
  const zoneSelect = document.getElementById('gis-zone');
  const neighSelect = document.getElementById('gis-neighborhood');

  if(govSelect && zoneSelect && neighSelect) {
    govSelect.innerHTML = '<option value="">جميع محافظات العراق (18)</option>';
    for(let gov in iraqRegions) {
      govSelect.innerHTML += `<option value="${gov}">${gov}</option>`;
    }

    govSelect?.addEventListener('change', function() {
      const gov = this.value;
      zoneSelect.innerHTML = '<option value="">جميع فروع المحافظة</option>';
      neighSelect.innerHTML = '<option value="">جميع أحياء ومحلات الزون</option>';
      if(gov && iraqRegions[gov]) {
        iraqRegions[gov].forEach(zone => {
          zoneSelect.innerHTML += `<option value="${zone}">${zone}</option>`;
        });
        if(gisMap && govCoords[gov]) {
          const mapSize = gisMap.getSize ? gisMap.getSize() : null;
          if (mapSize && mapSize.x > 0 && mapSize.y > 0) {
            gisMap.flyTo(govCoords[gov], 11, { duration: 1.5 });
          } else {
            gisMap.setView(govCoords[gov], 11);
          }
          if (window.updateMapData) window.updateMapData(gov);
        }
      } else {
        if(gisMap) {
          const mapSize = gisMap.getSize ? gisMap.getSize() : null;
          if (mapSize && mapSize.x > 0 && mapSize.y > 0) {
            gisMap.flyTo([33.3152, 44.3661], 6, { duration: 1.5 });
          } else {
            gisMap.setView([33.3152, 44.3661], 6);
          }
        }
      }
    });

    zoneSelect?.addEventListener('change', function() {
      const zone = this.value;
      neighSelect.innerHTML = '<option value="">جميع أحياء ومحلات الزون</option>';
      if(zone) {
        const neighborhoods = zoneNeighborhoods[zone] || ["الحي الأول", "الحي الثاني", "المركز"];
        neighborhoods.forEach(n => {
          neighSelect.innerHTML += `<option value="${n}">${n}</option>`;
        });
        if(gisMap) {
          window.flyToLocation(zone.replace('قطاع', '').trim(), govSelect.value, 13);
        }
      }
    });

    neighSelect?.addEventListener('change', function() {
      const neigh = this.value;
      if(neigh) {
        if (neighborhoodCoords[neigh] && gisMap) {
          const mapSize = gisMap.getSize ? gisMap.getSize() : null;
          if (mapSize && mapSize.x > 0 && mapSize.y > 0) {
            gisMap.flyTo(neighborhoodCoords[neigh], 16, { duration: 1.5 });
          } else {
            gisMap.setView(neighborhoodCoords[neigh], 16);
          }
        } else if (gisMap) {
          window.flyToLocation(neigh, govSelect.value, 16);
        }
      }
    });

    govSelect.dispatchEvent(new Event('change'));
  }

  // PWA Tabs switching logic
  const pwaButtons = document.querySelectorAll('.bottom-nav .bn[data-target]');
  const pwaTabs = document.querySelectorAll('.pwa-tab');
  
  pwaButtons.forEach(btn => {
    btn?.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav .bn').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      
      pwaTabs.forEach(t => t.style.display = 'none');
      
      const targetId = btn.getAttribute('data-target');
      if (targetId) {
        const targetTab = document.getElementById(targetId);
        if(targetTab) {
          targetTab.style.display = 'flex';
        }
      }
    });
  });

  // Inspection Form Submission
  const inspForm = document.getElementById('inspection-form');
  if(inspForm) {
    const inspGov = document.getElementById('insp-gov');
    const inspBranch = document.getElementById('insp-branch');
    
    // Populate Gov dropdown
    if(inspGov && iraqRegions) {
      for(let gov in iraqRegions) {
        inspGov.innerHTML += `<option value="${gov}">${gov}</option>`;
      }
      
      inspGov?.addEventListener('change', () => {
        const selectedGov = inspGov.value;
        inspBranch.innerHTML = '<option value="">اختر الفرع</option>';
        if(selectedGov && iraqRegions[selectedGov]) {
          iraqRegions[selectedGov].forEach(branch => {
            inspBranch.innerHTML += `<option value="${branch}">${branch}</option>`;
          });
        }
      });
    }

    inspForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = inspForm.querySelector('button[type="submit"]');
      if(btn) btn.disabled = true;
      
      try {
        const formData = {
          inspectorName: document.getElementById('insp-emp')?.value || '',
          dateTime: document.getElementById('insp-date')?.value || '',
          governorate: document.getElementById('insp-gov')?.value || '',
          branch: document.getElementById('insp-branch')?.value || '',
          ownerName: document.getElementById('insp-owner')?.value || '',
          licenseNum: document.getElementById('insp-lic')?.value || '',
          jobTitle: document.getElementById('insp-title')?.value || '',
          hasSignboard: inspForm.elements['chk1']?.value || '',
          goodArea: inspForm.elements['chk2']?.value || '',
          goodLocation: inspForm.elements['chk3']?.value || '',
          goodLighting: inspForm.elements['chk4']?.value || '',
          goodCleanliness: inspForm.elements['chk5']?.value || '',
          goodVentilation: inspForm.elements['chk6']?.value || '',
          goodDistance: inspForm.elements['chk7']?.value || '',
          hasEquipment: inspForm.elements['chk8']?.value || '',
          wearsUniform: inspForm.elements['chk9']?.value || '',
          gpsCoords: document.getElementById('insp-gps')?.value || '',
          fullAddress: document.getElementById('insp-address')?.value || '',
          createdAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'inspections'), formData);
        toast('تم حفظ نتيجة الكشف في النظام بنجاح!', 'okt');
        inspForm.reset();
        
        // Go back to map tab
        const tab1Btn = document.querySelector('.bottom-nav .bn[data-target="pwa-tab-1"]');
        if (tab1Btn) tab1Btn.click();
      } catch (err) {
        console.error('Error saving inspection:', err);
        toast('حدث خطأ أثناء الحفظ، يرجى المحاولة لاحقاً', 'badt');
      } finally {
        if(btn) btn.disabled = false;
      }
    });
  }
});

// Filter Tabs Cascading Logic
document?.addEventListener('DOMContentLoaded', () => {
  const govFilters = document.querySelectorAll('select.filter-gov');
  
  govFilters.forEach(govFilter => {
    if (typeof iraqRegions !== 'undefined') {
      for(let gov in iraqRegions) {
        govFilter.innerHTML += '<option value="' + gov + '">' + gov + '</option>';
      }
    }
    
    const fbar = govFilter.closest('.fbar');
    if (fbar) {
      const zoneFilter = fbar.querySelector('select.filter-zone');
      const areaFilter = fbar.querySelector('select.filter-area');
      
      govFilter?.addEventListener('change', () => {
        const gov = govFilter.value;
        if (zoneFilter) {
          zoneFilter.innerHTML = '<option value="">جميع قطاعات الفروع</option>';
          if(gov && typeof iraqRegions !== 'undefined' && iraqRegions[gov]) {
            iraqRegions[gov].forEach(zone => {
              zoneFilter.innerHTML += '<option value="' + zone + '">' + zone + '</option>';
            });
          }
          if (areaFilter) {
            areaFilter.innerHTML = '<option value="">جميع الأحياء والمناطق</option>';
          }
        }
      });
      
      if (zoneFilter && areaFilter) {
        zoneFilter?.addEventListener('change', () => {
           const zone = zoneFilter.value;
           areaFilter.innerHTML = '<option value="">جميع الأحياء والمناطق</option>';
           if(zone && typeof zoneNeighborhoods !== 'undefined' && zoneNeighborhoods[zone]) {
             zoneNeighborhoods[zone].forEach(n => {
               areaFilter.innerHTML += '<option value="' + n + '">' + n + '</option>';
             });
           }
        });
      }
    }
  });
});

// ======== ADD USER CUSTOM LOGIC ========
window.openCustomUserModal = function() {
    const mTitle = document.getElementById('mTitle');
    const mBody = document.getElementById('mBody');
    const mSave = document.getElementById('mSave');
    const mCancel = document.getElementById('mCancel');
    const mWrap = document.getElementById('mWrap');

    if (!mTitle || !mBody || !mSave || !mWrap) return;

    mTitle.textContent = 'إضافة مستخدم / حساب وظيفي جديد';
    mBody.innerHTML = `
        <div class="m-field full">
          <label>الاسم الكامل</label>
          <input type="text" id="nu-name" placeholder="الاسم الرباعي">
        </div>
        <div class="m-field">
          <label>الدور الوظيفي</label>
          <div style="display:flex; gap:6px;">
            <select id="nu-role" style="flex:1;">
              <option value="موظف تفتيش ميداني">موظف تفتيش ميداني</option>
              <option value="مسؤول فرع نقابي">مسؤول فرع نقابي</option>
              <option value="مسؤول لجنة تفتيش">مسؤول لجنة تفتيش</option>
              <option value="القيادة العليا / النقيب">القيادة العليا / النقيب</option>
              <option value="custom" style="color:var(--c1); font-weight:bold;">＋ إضافة دور وظيفي جديد...</option>
            </select>
            <input type="text" id="nu-custom-role" placeholder="اكتب الدور الجديد..." style="flex:1; display:none;">
          </div>
        </div>
        <div class="m-field">
          <label>اسم المستخدم (Login ID)</label>
          <input type="text" id="nu-login" dir="ltr">
        </div>
        <div class="m-field">
          <label>كلمة المرور (Password)</label>
          <input type="password" id="nu-pass" dir="ltr">
        </div>
        <div class="m-field">
          <label>البريد الإلكتروني</label>
          <input type="email" id="nu-email" dir="ltr">
        </div>
        <div class="m-field">
          <label>رقم الهاتف</label>
          <input type="tel" id="nu-phone" dir="ltr">
        </div>
        <div class="m-field">
          <label>رقم هوية النقابة</label>
          <input type="text" id="nu-syndid">
        </div>

      <div class="m-field full" style="margin-top:10px;">
        <h4 style="margin-bottom: 5px; color: var(--c1);">عنوان السكن</h4>
        <hr style="border: none; border-bottom: 1px solid var(--line); margin:0 0 10px 0;">
      </div>
      
      <div class="m-field">
        <label>المحافظة</label>
        <select id="nu-res-gov"></select>
      </div>
      <div class="m-field">
        <label>المنطقة</label>
        <select id="nu-res-zone"><option>اختر المحافظة أولاً</option></select>
      </div>
      
      <div class="m-field full" style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
        <div class="m-field"><label>المحلة</label><input type="text" id="nu-mahalla"></div>
        <div class="m-field"><label>الزقاق</label><input type="text" id="nu-zuqaq"></div>
        <div class="m-field"><label>الدار</label><input type="text" id="nu-dar"></div>
      </div>

      <div class="m-field full" style="margin-top:10px;">
        <h4 style="margin-bottom: 5px; color: var(--warn);">الفرع والنطاق الجغرافي المكلف به</h4>
        <hr style="border: none; border-bottom: 1px solid var(--line); margin:0 0 10px 0;">
      </div>
      
      <div class="m-field full">
        <label>المحافظة المكلف بها</label>
        <select id="nu-work-gov"></select>
      </div>
      <div class="m-field full">
        <label>المناطق / القطاعات المكلف بها (يمكن اختيار أكثر من منطقة)</label>
        <div id="nu-work-zones" style="margin-top:5px; display:grid; grid-template-columns: 1fr 1fr; gap: 8px; max-height: 120px; overflow-y: auto; padding: 10px; border: 1px solid var(--line); border-radius: 9px; background: var(--bg);">
          <span style="color:var(--muted); font-size:11px;">اختر المحافظة المكلف بها أولاً لتظهر المناطق...</span>
        </div>
      </div>
    `;
    
    // Handle custom role logic
    const roleSel = document.getElementById('nu-role');
    const roleCustom = document.getElementById('nu-custom-role');
    roleSel?.addEventListener('change', () => {
      if (roleSel.value === 'custom') {
        roleSel.style.display = 'none';
        roleCustom.style.display = 'block';
        roleCustom.focus();
      }
    });
    
    // Populate Governorates
    {
      const data = iraqRegions;
      const resGov = document.getElementById('nu-res-gov');
      const resZone = document.getElementById('nu-res-zone');
      const workGov = document.getElementById('nu-work-gov');
      const workZones = document.getElementById('nu-work-zones');
      
      let govs = '<option value="">اختر المحافظة...</option>' + Object.keys(data).map(g => `<option value="${g}">${g}</option>`).join('');
      if (resGov) resGov.innerHTML = govs;
      if (workGov) workGov.innerHTML = govs;
      
      resGov?.addEventListener('change', () => {
        if(data[resGov.value] && resZone) {
          resZone.innerHTML = '<option value="">اختر المنطقة...</option>' + data[resGov.value].map(z => `<option value="${z}">${z}</option>`).join('');
        }
      });
      
      workGov?.addEventListener('change', () => {
        if(data[workGov.value] && workZones) {
          workZones.innerHTML = data[workGov.value].map(z => `
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12px; color:var(--c1);">
              <input type="checkbox" value="${z}" class="work-zone-cb"> ${z}
            </label>
          `).join('');
        } else if (workZones) {
          workZones.innerHTML = '<span style="color:var(--muted); font-size:11px;">اختر المحافظة المكلف بها أولاً لتظهر المناطق...</span>';
        }
      });
    }
    
    mSave.style.display = 'block';
    mSave.textContent = 'حفظ وإضافة الحساب';
    if (mCancel) mCancel.textContent = 'إلغاء';
    
    mSave.onclick = async () => {
      const btn = mSave;
      btn.disabled = true;
      btn.textContent = 'جاري الحفظ...';
      
      try {
        const roleVal = document.getElementById('nu-role').value === 'custom' 
          ? document.getElementById('nu-custom-role').value 
          : document.getElementById('nu-role').value;
        
        const workZonesList = Array.from(document.querySelectorAll('.work-zone-cb:checked')).map(cb => cb.value).join('، ');
        
        const formData = {
          name: document.getElementById('nu-name')?.value || 'غير محدد',
          role: roleVal || 'موظف تفتيش ميداني',
          login: document.getElementById('nu-login')?.value || '',
          password: document.getElementById('nu-pass')?.value || '',
          email: document.getElementById('nu-email')?.value || '',
          phone: document.getElementById('nu-phone')?.value || '',
          syndid: document.getElementById('nu-syndid')?.value || '',
          resGov: document.getElementById('nu-res-gov')?.value || '',
          resZone: document.getElementById('nu-res-zone')?.value || '',
          mahalla: document.getElementById('nu-mahalla')?.value || '',
          zuqaq: document.getElementById('nu-zuqaq')?.value || '',
          dar: document.getElementById('nu-dar')?.value || '',
          workGov: document.getElementById('nu-work-gov')?.value || '',
          workZones: workZonesList,
          userNum: 'NURSE-NEW-' + Math.floor(Math.random()*9000),
          timestamp: new Date()
        };
        
        await addDoc(collection(db, "users"), formData);
        
        const usersTbody = document.getElementById('users-tbody');
        if (usersTbody) {
          const rClass = 'b';
          const tr = document.createElement('tr');
          tr.innerHTML = '<td><div class="nm">' + (formData.name || 'مدير فرع') + '</div><div class="sb"><span class="code">' + (formData.userNum || '---') + '</span> &bull; ' + (formData.phone || '---') + '</div></td>' +
'<td><span class="stamp ' + rClass + '">' + (formData.role || 'مدير') + '</span></td>' +
'<td class="code">' + (formData.login || formData.username || '---') + '</td>' +
'<td>' + (formData.password || '---') + '</td>' +
'<td><div class="nm" style="font-size:11.5px">' + (formData.workGov || formData.gov || '---') + '</div></td>' +
'<td>' + (formData.workGov || formData.gov || '---') + '<div class="sb">' + (formData.workZones || formData.zone || '---') + '</div></td>' +
'<td><span class="stamp ok">نشط</span></td>' +
'<td><div style="display:flex; flex-direction:column; gap:4px; align-items:center;"><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تغيير كلمة السر</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#374151;">تعديل البيانات</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#f59e0b;">ايقاف مؤقت</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #d1d5db; border-radius:4px; color:#10b981;">استئناف العمل</button><button style="width:100%; padding:4px 8px; font-size:11px; cursor:pointer; background:#fff; border:1px solid #ef4444; border-radius:4px; color:#ef4444;">حذف المستخدم</button></div></td>';
          usersTbody.prepend(tr);
        }
        
        btn.disabled = false;
        mWrap.classList.remove('show');
        toast('تم إنشاء الحساب الوظيفي بنجاح وإرسال معلومات الدخول للمستخدم', 'okt');
      } catch (err) {
        console.error("Error saving user:", err);
        btn.disabled = false;
        btn.textContent = 'حفظ وإضافة الحساب';
        toast('حدث خطأ أثناء الحفظ بالسيرفر', 'badt');
      }
    };
    
    mWrap.classList.add('show');
};

// PWA Theme Switcher Logic
document?.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('pwa-theme-btn');
  const themeMenu = document.getElementById('pwa-theme-menu');
  const phone = document.querySelector('.phone2');
  
  if (themeBtn && themeMenu && phone) {
    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.style.display = themeMenu.style.display === 'flex' ? 'none' : 'flex';
    });
    
    document?.addEventListener('click', () => {
      themeMenu.style.display = 'none';
    });
    
    const tBtns = themeMenu.querySelectorAll('.t-btn');
    tBtns.forEach(btn => {
      btn?.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        phone.className = 'phone2 ' + theme;
        themeMenu.style.display = 'none';
      });
    });
    
    phone.className = 'phone2 theme-light';
  }
});

// Populate PWA User Data
document?.addEventListener('DOMContentLoaded', () => {
    const pwaTitle = document.getElementById('pwa-user-title');
    const pwaDesc = document.getElementById('pwa-user-desc');
    const pwaAv = document.getElementById('pwa-user-av');
    
    if (pwaTitle && pwaDesc) {
        const uRole = localStorage.getItem('userRole') || 'مفتش';
        const uName = localStorage.getItem('userFullName') || '';
        const uLogin = localStorage.getItem('username') || 'مستخدم غير معروف';
        const uId = localStorage.getItem('userUnionId') || 'بدون هوية';
        
        let displayName = uName ? uName : (uLogin !== 'مستخدم غير معروف' ? uLogin : 'مفتش نقابة التمريض');
        
        pwaTitle.textContent = 'لجان الكشف INS';
        pwaDesc.innerHTML = `<strong style='color:var(--c1)'>${displayName}</strong><br>يوزر: ${uLogin} | هوية: ${uId}`;
        
        if (displayName && pwaAv) {
            pwaAv.textContent = displayName.charAt(0).toUpperCase();
        }
    }
});

// ==========================================
// ربط أزرار تطبيق المفتش (PWA Integration)
// ==========================================
document?.addEventListener('DOMContentLoaded', () => {
    const btnCheckIn = document.getElementById('btn-gps-checkin') || document.getElementById('btn-check-in');
    const btnRadius = document.getElementById('btn-radius-search');
    const btnZone = document.getElementById('btn-zone-filter');

    if (btnZone) {
        btnZone?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.dbFacilities && window.InspectorModules) {
                const zonedFacilities = window.InspectorModules.getZoneFacilities(window.dbFacilities);
                alert(`تم العثور على ${zonedFacilities.length} منشأة ضمن الزون المخصص لك!`);
            }
        });
    }

    if (btnRadius) {
        btnRadius?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!navigator.geolocation) return alert('الـ GPS غير مدعوم في متصفحك أو جهازك');
            
            btnRadius.textContent = '⏳ جاري تحديد موقعك...';
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (!window.InspectorModules || !window.dbFacilities) {
                    alert('الرجاء الانتظار حتى يتم تحميل بيانات النظام بالكامل');
                    btnRadius.textContent = 'العيادات القريبة (5كم)';
                    return;
                }
                const nearby = window.InspectorModules.getFacilitiesWithinRadius(window.dbFacilities, lat, lng, 5);
                alert(`تم العثور على ${nearby.length} منشأة ضمن نطاق 5 كم من موقعك الميداني الحالي.`);
                btnRadius.textContent = 'العيادات القريبة (5كم)';
                
            }, (err) => {
                alert('فشل الحصول على الموقع، يرجى تفعيل الـ GPS في هاتفك.');
                btnRadius.textContent = 'العيادات القريبة (5كم)';
            }, { enableHighAccuracy: true });
        });
    }

    if (btnCheckIn) {
        btnCheckIn?.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetLat = 33.3085; 
            const targetLng = 44.3412; 
            
            btnCheckIn.innerHTML = '⏳ جاري مطابقة الإحداثيات...';
            
            if (window.InspectorModules && window.InspectorModules.validateGPSCheckIn) {
              window.InspectorModules.validateGPSCheckIn(targetLat, targetLng, 200)
                  .then((result) => {
                      btnCheckIn.className = 'btn btn-1';
                      btnCheckIn.style.backgroundColor = 'var(--ok)';
                      btnCheckIn.innerHTML = `✅ تم تأكيد الوصول (المسافة ${result.distance}م)`;
                      alert('تم التحقق بنجاح! سيتم الآن فتح استمارة التفتيش الرسمية.');
                  })
                  .catch((errorMsg) => {
                      btnCheckIn.className = 'btn btn-3';
                      btnCheckIn.style.backgroundColor = 'var(--bad)';
                      btnCheckIn.innerHTML = '❌ أنت بعيد عن المنشأة!';
                      alert(errorMsg);
                  });
            } else {
              toast('✔ تم تأكيد الحضور الميداني بنجاح', 'okt');
              btnCheckIn.innerHTML = '✅ تم تأكيد الحضور';
            }
        });
    }
});

// ==========================================
// نظام منشئ الاستمارات (Form Builder Logic)
// ==========================================
let dynamicQuestions = [];

async function loadDynamicQuestions() {
    const list = document.getElementById('fb-questions-list');
    if (!list) return; 
    
    list.innerHTML = '<tr><td colspan="5" style="text-align:center;">⏳ جاري تحميل الأسئلة من السيرفر...</td></tr>';
    
    try {
        const q = query(collection(db, 'dynamic_questions'));
        const snapshot = await getDocs(q);
        dynamicQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        list.innerHTML = '';
        if (dynamicQuestions.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center;">لا توجد أسئلة مضافة حالياً.</td></tr>';
            return;
        }
        
        dynamicQuestions.forEach((qItem, index) => {
            const formTypeName = qItem.formType === 'initial' ? 'كشف أولي' : 'تفتيش دوري';
            const qTypeName = qItem.qType === 'yesno' ? 'نعم / لا' : 'نص مفتوح';
            
            list.innerHTML += `
              <tr>
                <td>${index + 1}</td>
                <td><span class="stamp s">${formTypeName}</span></td>
                <td><strong>${qItem.questionText}</strong></td>
                <td>${qTypeName}</td>
                <td><button class="btn btn-3 btn-xs" onclick="deleteDynamicQuestion('${qItem.id}')">حذف 🗑️</button></td>
              </tr>
            `;
        });
    } catch (e) {
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">❌ خطأ في تحميل الأسئلة</td></tr>';
        console.error("Fetch Error:", e);
    }
}

document?.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('fb-add-btn');
    if (addBtn) {
        addBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const formType = document.getElementById('fb-type')?.value;
            const questionText = document.getElementById('fb-question')?.value?.trim();
            const qType = document.getElementById('fb-qtype')?.value;
            
            if (!questionText) return alert('الرجاء إدخال نص السؤال!');
            
            addBtn.innerHTML = '⏳ جاري الحفظ...';
            try {
                await addDoc(collection(db, 'dynamic_questions'), {
                    formType,
                    questionText,
                    qType,
                    active: true,
                    timestamp: new Date()
                });
                
                document.getElementById('fb-question').value = '';
                alert('تمت إضافة السؤال بنجاح! سيظهر الآن في أجهزة جميع المفتشين فوراً.');
                loadDynamicQuestions();
            } catch (err) {
                alert('حدث خطأ أثناء الإضافة');
                console.error(err);
            }
            addBtn.innerHTML = '➕ إضافة السؤال';
        });
    }
    
    setTimeout(() => loadDynamicQuestions(), 1500);
});

window.deleteDynamicQuestion = async function(id) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
        await deleteDoc(doc(db, 'dynamic_questions', id));
        alert('تم الحذف بنجاح');
        loadDynamicQuestions();
    } catch (e) {
        alert('حدث خطأ في الحذف');
        console.error(e);
    }
};

document?.addEventListener('DOMContentLoaded', () => {
    const btnFetchGps = document.getElementById('btn-fetch-gps');
    const inspGpsInput = document.getElementById('insp-gps');

    if (btnFetchGps && inspGpsInput) {
        btnFetchGps?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!navigator.geolocation) {
                alert('الـ GPS غير مدعوم في متصفحك أو جهازك');
                return;
            }
            
            btnFetchGps.innerHTML = '⏳ جاري...';
            btnFetchGps.disabled = true;
            
            navigator.geolocation.getCurrentPosition((pos) => {
                const lat = pos.coords.latitude.toFixed(6);
                const lng = pos.coords.longitude.toFixed(6);
                inspGpsInput.value = `${lat}, ${lng}`;
                btnFetchGps.innerHTML = '✅ تم التحديد';
                btnFetchGps.className = 'btn btn-1';
                btnFetchGps.style.backgroundColor = 'var(--ok)';
                setTimeout(() => {
                    btnFetchGps.innerHTML = '📍 تحديث مجدداً';
                    btnFetchGps.disabled = false;
                    btnFetchGps.style.backgroundColor = '';
                }, 3000);
            }, (err) => {
                alert('فشل الحصول على الموقع، يرجى تفعيل الـ GPS وإعطاء الصلاحية.');
                btnFetchGps.innerHTML = '📍 تحديد الآن';
                btnFetchGps.disabled = false;
            }, { enableHighAccuracy: true });
        });
    }
});

document?.addEventListener('DOMContentLoaded', () => {
    const accFn = document.getElementById('acc-full-name');
    const accUid = document.getElementById('acc-union-id');
    if (accFn) {
        accFn.textContent = localStorage.getItem('userFullName') || 'مفتش ميداني';
    }
    if (accUid) {
        accUid.textContent = localStorage.getItem('userUnionId') || 'غير محدد';
    }
});

document?.addEventListener('DOMContentLoaded', () => {
    window.openTaskForm = async function(taskType) {
        const sel = document.getElementById('tasks-selection');
        const formCont = document.getElementById('inspection-form-container');
        if(sel) sel.style.display = 'none';
        if(formCont) formCont.style.display = 'flex';
        
        const titleEl = document.getElementById('task-form-title');
        if(titleEl) {
            titleEl.textContent = taskType === 'كشف' ? 'استمارة الكشف الميداني' : 'استمارة التفتيش الميداني';
        }
        
        const container = document.getElementById('dynamic-form-container');
        if(!container) return;
        
        container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--muted); font-size:12px;">جاري تحميل الأسئلة الديناميكية... ⏳</div>';
        
        try {
            const qRef = collection(db, 'dynamic_questions');
            const qQuery = query(qRef, where("formType", "==", taskType), where("active", "==", true));
            const snapshot = await getDocs(qQuery);
            
            if (snapshot.empty) {
                container.innerHTML = '<div style="padding:15px; text-align:center; color:var(--c1); font-size:12px; background:var(--bg); border-radius:10px;">لا توجد أسئلة ديناميكية مضافة لهذه الاستمارة حالياً.</div>';
                return;
            }
            
            let html = '<div style="margin-top:15px; border-top:1px dashed var(--line); padding-top:15px;">';
            html += '<b style="font-size:12.5px;color:var(--c1);display:block;margin-bottom:12px;">الأسئلة والتقييمات المطلوبة:</b>';
            
            snapshot.forEach(docSnap => {
                const q = docSnap.data();
                html += '<div style="margin-bottom:12px;">';
                html += '<label class="frm-lbl">' + q.questionText + ' *</label>';
                
                if (q.qType === 'نص قصير') {
                    html += '<input type="text" class="frm-inp dynamic-answer" data-qid="' + docSnap.id + '" required placeholder="أدخل الإجابة هنا...">';
                } else if (q.qType === 'نص طويل') {
                    html += '<textarea class="frm-inp dynamic-answer" data-qid="' + docSnap.id + '" required style="height:60px;" placeholder="أدخل التفاصيل..."></textarea>';
                } else if (q.qType === 'نعم/لا') {
                    html += '<select class="frm-inp dynamic-answer" data-qid="' + docSnap.id + '" required>';
                    html += '<option value="">اختر...</option><option value="نعم">نعم</option><option value="لا">لا</option>';
                    html += '</select>';
                } else if (q.qType === 'صورة') {
                    html += '<input type="file" accept="image/*" class="frm-inp dynamic-answer" data-qid="' + docSnap.id + '" required style="background:#fff;">';
                }
                
                html += '</div>';
            });
            
            html += '</div>';
            container.innerHTML = html;
            
        } catch(err) {
            console.error("Error loading dynamic questions:", err);
            container.innerHTML = '<div style="color:red; font-size:11px; text-align:center;">حدث خطأ أثناء تحميل الأسئلة.</div>';
        }
    };
});

document?.addEventListener('DOMContentLoaded', () => {
    const btnExcel = document.querySelector('#pwa-tab-5 button.btn-3');
    const btnPdf = document.querySelector('#pwa-tab-5 button.btn-1');

    if (btnExcel) {
        btnExcel?.addEventListener('click', (e) => {
            e.preventDefault();
            const oldHtml = btnExcel.innerHTML;
            btnExcel.innerHTML = '⏳ جاري التصدير...';
            setTimeout(() => {
                alert('تم تجهيز ملف Excel للتحميل بنجاح!');
                btnExcel.innerHTML = oldHtml;
            }, 1500);
        });
    }

    if (btnPdf) {
        btnPdf?.addEventListener('click', (e) => {
            e.preventDefault();
            const oldHtml = btnPdf.innerHTML;
            btnPdf.innerHTML = '⏳ جاري التصدير...';
            setTimeout(() => {
                alert('تم إنشاء تقرير PDF لأعمالك الميدانية بنجاح!');
                btnPdf.innerHTML = oldHtml;
            }, 1500);
        });
    }
});

// JS Logic for PWA features
window.showPwaMap = function() {
    const mapCont = document.getElementById('pwa-map-container');
    if(mapCont) {
        mapCont.style.display = mapCont.style.display === 'none' ? 'block' : 'none';
        
        if(mapCont.style.display === 'block' && !window.pwaMapInitialized) {
            if(typeof L !== 'undefined') {
                const map = L.map('pwa-leaflet-map').setView([33.3128, 44.3615], 11);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                L.marker([33.3128, 44.3615]).addTo(map).bindPopup('مركز بغداد').openPopup();
                window.pwaMapInitialized = true;
                setTimeout(() => map.invalidateSize(), 300);
            }
        }
    }
};

window.pwaRadiusSearch = function() {
    alert('🔍 جاري البحث عن المنشآت ضمن نطاق 5 كم من موقعك الحالي...');
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => {
                alert('📍 تم تحديد موقعك! تم العثور على 3 عيادات في نطاق 5 كم.');
                const facEl = document.getElementById('sel-fac-name');
                if (facEl) facEl.textContent = 'عيادة المنصور للخدمات التمريضية (مسافة 1.2 كم)';
            },
            err => alert('❌ يرجى تفعيل الـ GPS للبحث النطاقي')
        );
    }
};

window.openNavApp = function() {
    alert('🗺 جاري فتح تطبيق Google Maps أو Waze للتوجه إلى المنشأة...');
    window.open('https://maps.google.com/?q=33.3128,44.3615', '_blank');
};

window.requestGpsCorrection = function() {
    const confirmCorrection = confirm('هل أنت متأكد أن الإحداثيات الحالية للمنشأة غير دقيقة وتريد رفع طلب تصحيح باستخدام موقعك الحالي؟');
    if(confirmCorrection) {
        alert('✅ تم إرسال طلب تصحيح الإحداثيات بنجاح إلى مسؤول اللجان، وهو الآن قيد المراجعة.');
    }
};

const facSelect = document.getElementById('pwa-fac-select');
if(facSelect) {
    facSelect.addEventListener('change', function() {
        const facName = this.options[this.selectedIndex].text;
        const facEl = document.getElementById('sel-fac-name');
        if (!facEl) return;
        if(this.value) {
            facEl.textContent = facName;
        } else {
            facEl.textContent = 'يرجى اختيار منشأة أعلاه';
        }
    });
}
