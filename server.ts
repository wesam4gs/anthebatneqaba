import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { 
  INITIAL_PROVINCES, 
  INITIAL_DISTRICT_ZONES, 
  INITIAL_FACILITIES, 
  INITIAL_NURSES, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_VIOLATIONS, 
  INITIAL_USERS,
  MOCK_SYSTEM_STATS,
  INITIAL_FINANCIAL_VOUCHERS,
  INITIAL_BRANCH_BUDGETS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_BROADCASTS
} from './src/data/initialData';
import { INITIAL_INSPECTION_TEMPLATES } from './src/data/inspectionTemplates';
import { SQL_DATABASE_SCHEMA, SCHEMA_TABLES_DOCS } from './src/data/sqlSchema';
import { User, Facility, NurseStaff, InspectionAssignment, InspectionReport, ViolationRecord, PriorityLevel, FinancialVoucher, BranchInspectionBudget, BranchChatMessage, DisciplineBroadcast, InspectionTemplate, InspectorLiveLocation } from './src/types';

// In-memory data store for server runtime state
let usersStore: User[] = [...INITIAL_USERS];
let facilitiesStore: Facility[] = [...INITIAL_FACILITIES];
let nursesStore: NurseStaff[] = [...INITIAL_NURSES];
let assignmentsStore: InspectionAssignment[] = [...INITIAL_ASSIGNMENTS];
let violationsStore: ViolationRecord[] = [...INITIAL_VIOLATIONS];
let reportsStore: InspectionReport[] = [];
let vouchersStore: FinancialVoucher[] = [...INITIAL_FINANCIAL_VOUCHERS];
let branchBudgetsStore: BranchInspectionBudget[] = [...INITIAL_BRANCH_BUDGETS];
let chatMessagesStore: BranchChatMessage[] = [...INITIAL_CHAT_MESSAGES];
let broadcastsStore: DisciplineBroadcast[] = [...INITIAL_BROADCASTS];
let templatesStore: InspectionTemplate[] = JSON.parse(JSON.stringify(INITIAL_INSPECTION_TEMPLATES));
const inspectorLocations = new Map<string, InspectorLiveLocation>();
const inspectorSseClients = new Set<Response>();
const deviceHeartbeatAt = new Map<string, number>();

function seedInspectorLocations() {
  const inspectors = usersStore.filter((u) => u.role === 'FIELD_INSPECTOR');
  inspectors.forEach((u, i) => {
    const inProv = facilitiesStore.find((f) => f.provinceId === u.provinceId);
    const fac = inProv || facilitiesStore[i % Math.max(facilitiesStore.length, 1)];
    if (!fac) return;
    inspectorLocations.set(u.id, {
      inspectorId: u.id,
      inspectorName: u.name,
      role: u.role,
      provinceId: u.provinceId,
      latitude: Number(fac.latitude) + i * 0.004,
      longitude: Number(fac.longitude) + i * 0.003,
      isActive: true,
      updatedAt: new Date().toISOString()
    });
  });
}

seedInspectorLocations();
setInterval(() => {
  const now = Date.now();
  inspectorLocations.forEach((loc, id) => {
    if (now - (deviceHeartbeatAt.get(id) || 0) < 90000) return;
    inspectorLocations.set(id, { ...loc, updatedAt: new Date().toISOString() });
  });
  broadcastInspectorLocations();
}, 40000);

function broadcastInspectorLocations() {
  const payload = `data: ${JSON.stringify(Array.from(inspectorLocations.values()))}\n\n`;
  inspectorSseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      inspectorSseClients.delete(client);
    }
  });
}

const opsSseClients = new Set<Response>();

function broadcastOps(event: string, data: unknown) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  opsSseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      opsSseClients.delete(client);
    }
  });
}

// Helper function: Haversine distance calculation in meters
function calculateGpsDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

async function startServer() {
  const app = express();
  const mobileApp = express();
  const apiRouter = express.Router();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  mobileApp.use(express.json({ limit: '15mb' }));

  // ==================== REST API ROUTES ====================

  // 1. Provinces & Zones
  apiRouter.get('/provinces', (req: Request, res: Response) => {
    res.json(INITIAL_PROVINCES);
  });

  apiRouter.get('/zones', (req: Request, res: Response) => {
    const { provinceId } = req.query;
    if (provinceId) {
      res.json(INITIAL_DISTRICT_ZONES.filter(z => z.provinceId === provinceId));
    } else {
      res.json(INITIAL_DISTRICT_ZONES);
    }
  });

  // 1.5 Users Management Endpoints
  apiRouter.get('/users', (req: Request, res: Response) => {
    const { role, provinceId } = req.query;
    let results = [...usersStore];
    if (role && typeof role === 'string') {
      results = results.filter(u => u.role === role);
    }
    if (provinceId && typeof provinceId === 'string') {
      results = results.filter(u => u.provinceId === provinceId);
    }
    res.json(results);
  });

  // 1.5.1 Authentication / Login Endpoint
  app.post(['/api/login', '/api/auth/login'], (req: Request, res: Response) => {
    const { username, password } = req.body || {};
    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    // Check against usersStore (including test1)
    const matched = usersStore.find(
      u => (u.username?.toLowerCase() === cleanUser.toLowerCase() || u.badgeNumber?.toLowerCase() === cleanUser.toLowerCase()) &&
           u.password === cleanPass
    );

    if (matched || (cleanUser.toLowerCase() === 'test1' && cleanPass === 'test1')) {
      const u = matched || {
        id: 'user_test1',
        name: 'مفتش لجنة التفتيش العامة (test1)',
        role: 'INSPECTION_DIRECTOR',
        badgeNumber: 'INSP-TEST-001',
        phone: '07700000001',
        email: 'test1@syndicate-nurse.iq',
        username: 'test1',
        provinceId: 'all',
        provinceName: 'كافة المحافظات (صلاحية شاملة)',
        assignedZoneId: 'all_zones',
        assignedZoneName: 'كافة الزونات والقطاعات في عموم العراق (شامل)'
      };

      const isAllAuthority = u.username === 'test1' || u.role === 'HIGH_COMMAND' || u.role === 'INSPECTION_DIRECTOR' || u.provinceId === 'all';
      
      return res.json({
        success: true,
        user: {
          id: u.id,
          username: u.username,
          name: u.name,
          role: isAllAuthority ? 'admin' : 'branch_manager',
          userRole: isAllAuthority ? 'admin' : 'branch_manager',
          roleTitle: u.username === 'test1' ? 'لجنة التفتيش العامة (كافة المحافظات والزونات)' : (u.role === 'HIGH_COMMAND' ? 'القيادة العليا (النقيب)' : (u.role === 'INSPECTION_DIRECTOR' ? 'مسؤول لجنة التفتيش' : 'مفتش ميداني')),
          gov: isAllAuthority ? '' : (u.provinceName || ''),
          unionId: u.badgeNumber,
          assignedZone: u.assignedZoneName || 'كافة الزونات',
          isAllZones: isAllAuthority
        }
      });
    }

    return res.status(401).json({
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
    });
  });

  apiRouter.post('/forgot-password', (req: Request, res: Response) => {
    const { phone } = req.body || {};
    const cleanPhone = (phone || '').trim();

    if (!cleanPhone) {
        return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
    }

    const user = usersStore.find(u => u.phone === cleanPhone);

    if (user) {
        // Here we would integrate with WhatsApp API
        console.log(`[WHATSAPP SIMULATION] 📞 Message to ${cleanPhone}:`);
        console.log(`مرحباً ${user.name}،\nلقد طلبت استعادة كلمة المرور الخاصة بك في المنصة الوطنية للرقابة والتفتيش الصحي.\nاسم المستخدم: ${user.username}\nكلمة المرور: ${user.password}\n\nنرجو تغييرها بعد تسجيل الدخول حفاظاً على السرية.`);
        
        return res.json({ success: true, message: 'تم إرسال كلمة المرور إلى رقم الواتساب الخاص بك بنجاح' });
    } else {
        return res.status(404).json({ success: false, message: 'رقم الهاتف غير مسجل في النظام' });
    }
  });

  apiRouter.post('/users', (req: Request, res: Response) => {
    const body = req.body;
    const newUser = {
      id: `user_${Date.now()}`,
      name: body.name,
      role: body.role || 'FIELD_INSPECTOR',
      badgeNumber: body.badgeNumber || `INSP-2026-${Math.floor(100 + Math.random() * 900)}`,
      phone: body.phone || '',
      email: body.email || '',
      username: body.username || `user_${Math.floor(1000 + Math.random() * 9000)}`,
      password: body.password || 'Nur2026!Pass',
      nationalId: body.nationalId || '',
      educationQualification: body.educationQualification || 'بكالوريوس علوم تمريض',
      specialization: body.specialization || 'رقابة وتفتيش صحي',
      provinceId: body.provinceId || 'iq_baghdad',
      provinceName: body.provinceName || 'بغداد',
      assignedZoneId: body.assignedZoneId || 'zone_karkh',
      assignedZoneName: body.assignedZoneName || 'قطاع التفتيش',
      status: body.status || 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      notes: body.notes || ''
    };

    usersStore.unshift(newUser);
    res.status(201).json(newUser);
  });

  apiRouter.put('/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = usersStore.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    usersStore[index] = { ...usersStore[index], ...req.body };
    res.json(usersStore[index]);
  });

  apiRouter.delete('/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    usersStore = usersStore.filter(u => u.id !== id);
    res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  });

  // 2. Facilities
  apiRouter.get('/facilities', (req: Request, res: Response) => {
    const { zoneId, provinceId, search, status } = req.query;
    let results = [...facilitiesStore];

    if (zoneId) {
      results = results.filter(f => f.zoneId === zoneId);
    } else if (provinceId) {
      results = results.filter(f => f.provinceId === provinceId);
    }

    if (status) {
      results = results.filter(f => f.licenseStatus === status || f.inspectionStatus === status);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      results = results.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.licenseNumber.toLowerCase().includes(q) ||
        f.ownerName.toLowerCase().includes(q) ||
        f.ownerPhone.includes(q) ||
        f.neighborhood.toLowerCase().includes(q)
      );
    }

    res.json(results);
  });

  apiRouter.get('/facilities/:id', (req: Request, res: Response) => {
    const facility = facilitiesStore.find(f => f.id === req.params.id);
    if (!facility) {
      return res.status(404).json({ error: 'المنشأة غير موجودة' });
    }
    const facilityNurses = nursesStore.filter(n => n.currentFacilityId === facility.id);
    const facilityAssignments = assignmentsStore.filter(a => a.facilityId === facility.id);
    const facilityViolations = violationsStore.filter(v => v.facilityId === facility.id);

    res.json({
      ...facility,
      nurses: facilityNurses,
      assignments: facilityAssignments,
      violations: facilityViolations
    });
  });

  apiRouter.post('/facilities', (req: Request, res: Response) => {
    const body = req.body;
    const newFacility: Facility = {
      id: `fac_${Date.now()}`,
      licenseNumber: body.licenseNumber || `IRQ-NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: body.name,
      type: body.type || 'CLINIC',
      provinceId: body.provinceId || 'iq_baghdad',
      zoneId: body.zoneId || 'zone_karkh',
      districtArea: body.districtArea || 'القضاء المركز',
      neighborhood: body.neighborhood || 'حي عام',
      addressDetail: body.addressDetail || '',
      ownerName: body.ownerName || '',
      ownerPhone: body.ownerPhone || '',
      latitude: Number(body.latitude) || 33.3152,
      longitude: Number(body.longitude) || 44.3661,
      licenseStatus: body.licenseStatus || 'LICENSED',
      licenseExpiryDate: body.licenseExpiryDate || '2027-12-31',
      inspectionStatus: 'NEEDS_INSPECTION',
      createdDate: new Date().toISOString().split('T')[0]
    };

    facilitiesStore.unshift(newFacility);
    res.status(201).json(newFacility);
  });

  // 3. Nurse Verification System
  apiRouter.get('/nurses', (req: Request, res: Response) => {
    const { facilityId, search } = req.query;
    let results = [...nursesStore];

    if (facilityId) {
      results = results.filter(n => n.currentFacilityId === facilityId);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(n =>
        n.fullName.toLowerCase().includes(q) ||
        n.syndicateId.toLowerCase().includes(q) ||
        n.nationalId.includes(q)
      );
    }

    res.json(results);
  });

  apiRouter.put('/nurses/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = nursesStore.findIndex(n => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'الكادر التمريضي غير موجود' });
    }
    nursesStore[index] = { ...nursesStore[index], ...req.body };
    res.json(nursesStore[index]);
  });

  apiRouter.post('/nurses', (req: Request, res: Response) => {
    const body = req.body;
    const newNurse: NurseStaff = {
      id: `nurse_${Date.now()}`,
      syndicateId: body.syndicateId || `NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      fullName: body.fullName,
      nationalId: body.nationalId || '',
      specializedTitle: body.specializedTitle || 'ممرض جامعي',
      qualificationDegree: body.qualificationDegree || 'بكالوريوس علوم التمريض',
      qualificationName: body.qualificationName || 'كلية التمريض',
      graduationYear: body.graduationYear || '2020',
      syndicateRegistrationYear: body.syndicateRegistrationYear || '2020',
      bloodType: body.bloodType || 'O+',
      syndicateStatus: body.syndicateStatus || 'ACTIVE',
      licenseExpiryDate: body.licenseExpiryDate || '2027-12-31',
      currentFacilityId: body.currentFacilityId || 'fac_1',
      facilityName: body.facilityName || 'مستشفى الكرخ التمريضي الأهلي',
      phone: body.phone || '',
      notes: body.notes || ''
    };
    nursesStore.unshift(newNurse);
    res.status(201).json(newNurse);
  });

  apiRouter.get('/nurses/verify/:syndicateId', (req: Request, res: Response) => {
    const { syndicateId } = req.params;
    const nurse = nursesStore.find(n => n.syndicateId.toLowerCase() === syndicateId.toLowerCase().trim());
    
    if (!nurse) {
      return res.json({
        found: false,
        status: 'NOT_FOUND',
        message: 'رقم الانتساب غير مسجل بملفات نقابة التمريض العراقية! تنبيه: احتمال وجود هوية غير مرخصة.'
      });
    }

    const isExpired = new Date(nurse.licenseExpiryDate) < new Date();
    const activeStatus = isExpired ? 'EXPIRED' : nurse.syndicateStatus;

    res.json({
      found: true,
      nurse,
      status: activeStatus,
      isExpired,
      message: activeStatus === 'ACTIVE' 
        ? 'الهوية النقابية سارية المفعول ومسجلة أصولياً.'
        : `تنبيه: حالة الهوية (${activeStatus}) - تاريخ الانتهاء: ${nurse.licenseExpiryDate}`
    });
  });

  // 4. Inspection Assignments
  apiRouter.get('/assignments', (req: Request, res: Response) => {
    const { inspectorId, status } = req.query;
    let results = [...assignmentsStore];

    if (inspectorId) {
      results = results.filter(a => a.assignedInspectorId === inspectorId);
    }
    if (status) {
      results = results.filter(a => a.status === status);
    }

    res.json(results);
  });

  apiRouter.post('/assignments', (req: Request, res: Response) => {
    const { facilityId, assignedInspectorId, scheduledDate, priority, notes, assignedByUserId } = req.body;
    
    const facility = facilitiesStore.find(f => f.id === facilityId);
    const inspector = INITIAL_USERS.find(u => u.id === assignedInspectorId);
    const assigner = INITIAL_USERS.find(u => u.id === assignedByUserId) || INITIAL_USERS[3];

    if (!facility) {
      return res.status(400).json({ error: 'المنشأة غير موجودة' });
    }

    const newAssignment: InspectionAssignment = {
      id: `assign_${Date.now()}`,
      assignmentCode: `INSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: `${facility.neighborhood} - ${facility.addressDetail}`,
      facilityLat: facility.latitude,
      facilityLng: facility.longitude,
      assignedInspectorId: inspector ? inspector.id : assignedInspectorId,
      assignedInspectorName: inspector ? inspector.name : 'مفتش ميداني',
      assignedByUserId: assigner.id,
      assignedByUserName: assigner.name,
      scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
      priority: (priority as PriorityLevel) || 'MEDIUM',
      status: 'PENDING',
      notes: notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    assignmentsStore.unshift(newAssignment);

    // Update facility status
    facility.inspectionStatus = 'NEEDS_INSPECTION';
    facility.assignedInspectorId = inspector?.id;

    broadcastOps('assignments', assignmentsStore);
    res.status(201).json(newAssignment);
  });

  // 5. Submit Inspection Visit Report with DUAL GPS VALIDATION
  apiRouter.post('/inspections', (req: Request, res: Response) => {
    const {
      assignmentId,
      facilityId,
      inspectorId,
      inspectorName,
      inspectorLat,
      inspectorLng,
      generalComplianceScore,
      checkedNurseIds,
      violations,
      notes,
      photos,
      recommendedAction,
      templateId,
      answersJson
    } = req.body;

    const facility = facilitiesStore.find(f => f.id === facilityId);
    if (!facility) {
      return res.status(404).json({ error: 'المنشأة غير موجودة' });
    }

    // Calculate D-GPS distance between current inspector location and target facility location
    const distMeters = calculateGpsDistanceMeters(
      Number(inspectorLat),
      Number(inspectorLng),
      facility.latitude,
      facility.longitude
    );

    // Tolerance threshold: 150 meters
    const isGpsValidated = distMeters <= 150;

    const reportId = `rep_${Date.now()}`;

    // Create Report
    const report: InspectionReport = {
      id: reportId,
      assignmentId: assignmentId || '',
      facilityId: facility.id,
      inspectorId: inspectorId || 'user_5',
      inspectorName: inspectorName || 'علي حسين الكعبي',
      visitTimestamp: new Date().toISOString(),
      inspectorLat: Number(inspectorLat),
      inspectorLng: Number(inspectorLng),
      facilityLat: facility.latitude,
      facilityLng: facility.longitude,
      gpsDistanceMeters: distMeters,
      isGpsValidated,
      generalComplianceScore: Number(generalComplianceScore) || 85,
      checkedNursesCount: Array.isArray(checkedNurseIds) ? checkedNurseIds.length : 0,
      violationsCount: Array.isArray(violations) ? violations.length : 0,
      notes: notes || '',
      photos: Array.isArray(photos) ? photos : [],
      checkedNurseIds: Array.isArray(checkedNurseIds) ? checkedNurseIds : [],
      recommendedAction: recommendedAction || 'PASS',
      status: 'SUBMITTED',
      templateId,
      answersJson: answersJson && typeof answersJson === 'object' ? answersJson : undefined
    };

    reportsStore.unshift(report);

    // Handle Violations
    if (Array.isArray(violations) && violations.length > 0) {
      violations.forEach((v: any) => {
        const newViol: ViolationRecord = {
          id: `viol_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          inspectionReportId: reportId,
          facilityId: facility.id,
          facilityName: facility.name,
          violationType: v.violationType || 'OTHER',
          description: v.description || 'مخالفة مرصودة أثناء التفتيش الميداني',
          nurseSyndicateId: v.nurseSyndicateId,
          nurseName: v.nurseName,
          severity: v.severity || 'WARNING',
          fineAmountIqd: Number(v.fineAmountIqd) || 0,
          status: 'PENDING_REVIEW',
          recordedAt: new Date().toISOString()
        };
        violationsStore.unshift(newViol);
      });
      facility.inspectionStatus = 'VIOLATION_RECORDED';
    } else {
      facility.inspectionStatus = 'INSPECTED';
    }

    facility.lastInspectionDate = new Date().toISOString().split('T')[0];

    // Update assignment if exists
    if (assignmentId) {
      const assignment = assignmentsStore.find(a => a.id === assignmentId);
      if (assignment) {
        assignment.status = 'COMPLETED';
      }
    }

    broadcastOps('assignments', assignmentsStore);
    broadcastOps('violations', violationsStore);

    res.status(201).json({
      success: true,
      report,
      gpsValidation: {
        distanceMeters: distMeters,
        isValidated: isGpsValidated,
        message: isGpsValidated
          ? `تم التحقق الجغرافي بنجاح! المفتش متواجد ضمن نطاق المنشأة (${distMeters} متر).`
          : `تنبيه جغرافي: موقع المفتش يبعد ${distMeters} متر عن الموقع المسجل للمنشأة (التسامح المسموح 150م).`
      }
    });
  });

  // 6. Violations
  apiRouter.get('/violations', (req: Request, res: Response) => {
    res.json(violationsStore);
  });

  // 7. System Stats
  apiRouter.get('/stats', (req: Request, res: Response) => {
    const totalFacilities = facilitiesStore.length;
    const totalClinics = facilitiesStore.filter(f => f.type === 'CLINIC').length;
    const totalHospitals = facilitiesStore.filter(f => f.type === 'HOSPITAL').length;
    const totalLicensed = facilitiesStore.filter(f => f.licenseStatus === 'LICENSED').length;
    const totalPending = facilitiesStore.filter(f => f.licenseStatus === 'PENDING').length;
    const totalViolations = violationsStore.length;
    const pendingAssignments = assignmentsStore.filter(a => a.status === 'PENDING').length;

    res.json({
      totalFacilities,
      totalClinics,
      totalHospitals,
      totalLicensed,
      totalPending,
      totalViolations,
      totalActiveNurses: nursesStore.filter(n => n.syndicateStatus === 'ACTIVE').length,
      inspectionsCompletedThisMonth: reportsStore.length + 48,
      pendingAssignments
    });
  });

  // 8. SQL Schema Endpoint
  apiRouter.get('/schema', (req: Request, res: Response) => {
    res.json({
      sqlScript: SQL_DATABASE_SCHEMA,
      tablesDocs: SCHEMA_TABLES_DOCS
    });
  });

  // 9. Financial Vouchers & Fines
  apiRouter.get('/vouchers', (req: Request, res: Response) => {
    const { provinceId, type, category } = req.query;
    let results = [...vouchersStore];
    if (provinceId && typeof provinceId === 'string') {
      results = results.filter(v => v.provinceId === provinceId);
    }
    if (type && typeof type === 'string') {
      results = results.filter(v => v.voucherType === type);
    }
    if (category && typeof category === 'string') {
      results = results.filter(v => v.category === category);
    }
    res.json(results);
  });

  apiRouter.post('/vouchers', (req: Request, res: Response) => {
    const body = req.body;
    const newVoucher: FinancialVoucher = {
      id: body.id || `vouch_${Date.now()}`,
      voucherNumber: body.voucherNumber || `RV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      voucherType: body.voucherType || 'RECEIPT',
      category: body.category || 'INSPECTION_FINE',
      amountIqd: Number(body.amountIqd) || 0,
      payerOrBeneficiary: body.payerOrBeneficiary || 'المنشأة المسددة',
      facilityId: body.facilityId,
      facilityName: body.facilityName,
      provinceId: body.provinceId || 'iq_baghdad',
      provinceName: body.provinceName || 'بغداد',
      date: body.date || new Date().toISOString().split('T')[0],
      paymentMethod: body.paymentMethod || 'ELECTRONIC_QI',
      referenceNumber: body.referenceNumber || `TX-${Date.now().toString().slice(-6)}`,
      treasuryFund: body.treasuryFund || 'INSPECTION_FUND',
      status: body.status || 'COLLECTED',
      issuedByUserId: body.issuedByUserId || 'user_1',
      issuedByUserName: body.issuedByUserName || 'د. فراس الموسوي',
      notes: body.notes || ''
    };
    vouchersStore.unshift(newVoucher);
    res.status(201).json(newVoucher);
  });

  // 10. Branch Inspection Budgets
  apiRouter.get('/budgets', (req: Request, res: Response) => {
    res.json(branchBudgetsStore);
  });

  // 11. Inter-Branch Chat Messages & Operations Dispatch
  apiRouter.get('/chat/messages', (req: Request, res: Response) => {
    const { channelId } = req.query;
    if (channelId && typeof channelId === 'string') {
      res.json(chatMessagesStore.filter(m => m.channelId === channelId));
    } else {
      res.json(chatMessagesStore);
    }
  });

  apiRouter.post('/chat/messages', (req: Request, res: Response) => {
    const body = req.body || {};
    const newMsg: BranchChatMessage = {
      id: body.id || `msg_${Date.now()}`,
      channelId: body.channelId || 'general-ops',
      senderId: body.senderId || 'user_1',
      senderName: body.senderName || 'النقيب',
      senderRole: body.senderRole || 'HIGH_COMMAND',
      senderRoleTitle: body.senderRoleTitle,
      senderBadge: body.senderBadge || 'INS-001',
      provinceId: body.provinceId,
      provinceName: body.provinceName,
      messageText: body.messageText || '',
      timestamp: body.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 16),
      type: body.type || 'TEXT',
      isNationwideBroadcast: Boolean(body.isNationwideBroadcast),
      broadcastTarget: body.broadcastTarget,
      attachment: body.attachment
    };
    if (!chatMessagesStore.some((m) => m.id === newMsg.id)) {
      chatMessagesStore.push(newMsg);
    }
    broadcastOps('chat', chatMessagesStore);
    res.status(201).json(newMsg);
  });

  apiRouter.get('/ops/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`event: chat\ndata: ${JSON.stringify(chatMessagesStore)}\n\n`);
    res.write(`event: assignments\ndata: ${JSON.stringify(assignmentsStore)}\n\n`);
    res.write(`event: violations\ndata: ${JSON.stringify(violationsStore)}\n\n`);
    res.write(`event: broadcasts\ndata: ${JSON.stringify(broadcastsStore)}\n\n`);
    opsSseClients.add(res);
    req.on('close', () => opsSseClients.delete(res));
  });

  apiRouter.get('/inspections', (_req: Request, res: Response) => {
    res.json(reportsStore);
  });

  // 12. Discipline Broadcasts & Urgent Circulars
  apiRouter.get('/broadcasts', (req: Request, res: Response) => {
    res.json(broadcastsStore);
  });

  apiRouter.post('/broadcasts', (req: Request, res: Response) => {
    const body = req.body;
    const newBrd: DisciplineBroadcast = {
      id: body.id || `brd_${Date.now()}`,
      code: body.code || `CIRC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: body.title,
      summary: body.summary,
      urgency: body.urgency || 'URGENT',
      issuedBy: body.issuedBy || 'مجلس نقابة التمريض العراقية',
      targetScope: body.targetScope || 'ALL_BRANCHES',
      targetProvinceId: body.targetProvinceId,
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      actionRequired: body.actionRequired || 'التنفيذ الفوري للمسح التفتيشي',
      isActive: true
    };
    broadcastsStore.unshift(newBrd);
    broadcastOps('broadcasts', broadcastsStore);
    res.status(201).json(newBrd);
  });

  apiRouter.get('/templates', (_req: Request, res: Response) => {
    res.json(templatesStore);
  });

  apiRouter.get('/templates/active', (_req: Request, res: Response) => {
    const active = templatesStore.find((t) => t.isActive) || templatesStore[0];
    if (!active) return res.status(404).json({ error: 'لا يوجد قالب نشط' });
    res.json(active);
  });

  apiRouter.post('/templates', (req: Request, res: Response) => {
    const body = req.body || {};
    const tpl: InspectionTemplate = {
      id: body.id || `tpl_${Date.now()}`,
      code: body.code || `TPL-${Date.now()}`,
      nameAr: body.nameAr || 'قالب جديد',
      nameEn: body.nameEn,
      facilityType: body.facilityType || 'ALL',
      schemaJson: body.schemaJson || { version: 1, categories: [] },
      isActive: Boolean(body.isActive),
      version: Number(body.version) || 1,
      createdBy: body.createdBy,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    if (tpl.isActive) {
      templatesStore = templatesStore.map((t) => ({ ...t, isActive: false }));
    }
    templatesStore.unshift(tpl);
    res.status(201).json(tpl);
  });

  apiRouter.put('/templates/:id', (req: Request, res: Response) => {
    const idx = templatesStore.findIndex((t) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'القالب غير موجود' });
    const next = { ...templatesStore[idx], ...req.body, id: templatesStore[idx].id, updatedAt: new Date().toISOString().slice(0, 10) };
    if (next.isActive) {
      templatesStore = templatesStore.map((t, i) => (i === idx ? next : { ...t, isActive: false }));
    } else {
      templatesStore[idx] = next;
    }
    res.json(next);
  });

  apiRouter.post('/templates/:id/activate', (req: Request, res: Response) => {
    templatesStore = templatesStore.map((t) => ({ ...t, isActive: t.id === req.params.id }));
    const active = templatesStore.find((t) => t.id === req.params.id);
    if (!active) return res.status(404).json({ error: 'القالب غير موجود' });
    res.json(active);
  });

  apiRouter.delete('/templates/:id', (req: Request, res: Response) => {
    templatesStore = templatesStore.filter((t) => t.id !== req.params.id);
    res.json({ success: true });
  });

  apiRouter.get('/inspectors/locations', (_req: Request, res: Response) => {
    res.json(Array.from(inspectorLocations.values()));
  });

  apiRouter.post('/inspectors/heartbeat', (req: Request, res: Response) => {
    const body = req.body || {};
    const inspectorId = body.inspectorId || body.inspector_id;
    if (!inspectorId || body.latitude == null || body.longitude == null) {
      return res.status(400).json({ error: 'inspectorId و latitude و longitude مطلوبة' });
    }
    const user = usersStore.find((u) => u.id === inspectorId);
    const row: InspectorLiveLocation = {
      inspectorId,
      inspectorName: body.inspectorName || user?.name || 'مفتش ميداني',
      role: user?.role,
      provinceId: body.provinceId || user?.provinceId,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      accuracyMeters: body.accuracyMeters,
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString()
    };
    inspectorLocations.set(inspectorId, row);
    deviceHeartbeatAt.set(inspectorId, Date.now());
    broadcastInspectorLocations();
    res.json(row);
  });

  apiRouter.get('/inspectors/nearest', (req: Request, res: Response) => {
    const facilityId = String(req.query.facilityId || '');
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const facility = facilitiesStore.find((f) => f.id === facilityId);
    const targetLat = facility ? facility.latitude : lat;
    const targetLng = facility ? facility.longitude : lng;
    if (Number.isNaN(targetLat) || Number.isNaN(targetLng)) {
      return res.status(400).json({ error: 'facilityId أو lat/lng مطلوبة' });
    }
    const cutoff = Date.now() - 2 * 60 * 1000;
    const ranked = Array.from(inspectorLocations.values())
      .filter((loc) => loc.isActive && new Date(loc.updatedAt).getTime() >= cutoff)
      .map((loc) => ({
        ...loc,
        distanceMeters: Math.round(calculateGpsDistanceMeters(loc.latitude, loc.longitude, targetLat, targetLng))
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
    res.json({
      target: { latitude: targetLat, longitude: targetLng, facilityId: facility?.id },
      nearest: ranked[0] || null,
      ranked,
      method: 'haversine_fallback_equivalent_to_ST_Distance'
    });
  });

  apiRouter.get('/inspectors/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify(Array.from(inspectorLocations.values()))}\n\n`);
    inspectorSseClients.add(res);
    req.on('close', () => inspectorSseClients.delete(res));
  });

  apiRouter.post('/dispatch/nearest', (req: Request, res: Response) => {
    const { facilityId, scheduledDate, priority, notes, assignedByUserId } = req.body || {};
    const facility = facilitiesStore.find((f) => f.id === facilityId);
    if (!facility) return res.status(404).json({ error: 'المنشأة غير موجودة' });

    const cutoff = Date.now() - 2 * 60 * 1000;
    const live = Array.from(inspectorLocations.values()).filter(
      (loc) => loc.isActive && new Date(loc.updatedAt).getTime() >= cutoff
    );

    const ranked = live
      .map((loc) => ({
        loc,
        distanceMeters: calculateGpsDistanceMeters(loc.latitude, loc.longitude, facility.latitude, facility.longitude)
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const nearest = ranked[0];
    if (!nearest) {
      return res.status(404).json({
        error: 'لا يوجد مفتش نشط على الخريطة',
        postgisEquivalent: `SELECT inspector_id, ST_Distance(geom, ST_SetSRID(ST_MakePoint(${facility.longitude}, ${facility.latitude}), 4326)::geography) AS distance_m FROM inspector_locations WHERE is_active AND updated_at > NOW() - INTERVAL '2 minutes' ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${facility.longitude}, ${facility.latitude}), 4326)::geography LIMIT 1`
      });
    }

    const inspector = usersStore.find((u) => u.id === nearest.loc.inspectorId);
    const commander = usersStore.find((u) => u.id === assignedByUserId) || usersStore[0];
    const newAssignment: InspectionAssignment = {
      id: `asg_${Date.now()}`,
      assignmentCode: `ASN-${new Date().getFullYear()}-${String(assignmentsStore.length + 1).padStart(4, '0')}`,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: `${facility.neighborhood} - ${facility.addressDetail}`,
      facilityLat: facility.latitude,
      facilityLng: facility.longitude,
      assignedInspectorId: nearest.loc.inspectorId,
      assignedInspectorName: nearest.loc.inspectorName,
      assignedByUserId: commander?.id || 'hq',
      assignedByUserName: commander?.name || 'المقر العام',
      scheduledDate: scheduledDate || new Date().toISOString().slice(0, 10),
      priority: (priority as PriorityLevel) || 'URGENT',
      status: 'PENDING',
      notes: notes || `إيفاد جغرافي لأقرب مفتش نشط (حوالي ${nearest.distanceMeters} م)`,
      createdAt: new Date().toISOString()
    };
    assignmentsStore.unshift(newAssignment);
    facility.inspectionStatus = 'NEEDS_INSPECTION';
    facility.assignedInspectorId = nearest.loc.inspectorId;
    broadcastOps('assignments', assignmentsStore);

    res.status(201).json({
      assignment: newAssignment,
      nearestInspector: nearest.loc,
      distanceMeters: nearest.distanceMeters,
      inspectorRole: inspector?.role,
      method: 'haversine_fallback_equivalent_to_ST_Distance'
    });
  });

  app.use('/api', apiRouter);
  mobileApp.use('/api', apiRouter);

  // ==================== VITE & STATIC FILES ====================
  let vite: ViteDevServer | null = null;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
  }

  if (vite) {
    app.use(vite.middlewares);
    mobileApp.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    mobileApp.use(express.static(distPath));
  }

  // SPA Fallback for Mobile App (Port 4000)
  mobileApp.use('*', async (req, res, next) => {
    try {
      if (vite) {
        const filePath = path.join(process.cwd(), 'mobile.html');
        let html = fs.readFileSync(filePath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } else {
        res.sendFile(path.join(process.cwd(), 'dist', 'mobile.html'));
      }
    } catch (err) {
      next(err);
    }
  });

  // SPA Fallback for Main Portal (Port 3000)
  app.use('*', async (req, res, next) => {
    try {
      if (vite) {
        const pathname = req.path;
        if (pathname.startsWith('/login')) {
           const filePath = path.join(process.cwd(), 'login.html');
           let html = fs.readFileSync(filePath, 'utf-8');
           html = await vite.transformIndexHtml(req.originalUrl, html);
           return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
        }
        if (pathname.startsWith('/mobile')) {
           const filePath = path.join(process.cwd(), 'mobile.html');
           let html = fs.readFileSync(filePath, 'utf-8');
           html = await vite.transformIndexHtml(req.originalUrl, html);
           return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
        }
        if (pathname.startsWith('/inspector')) {
           const filePath = path.join(process.cwd(), 'inspector.html');
           let html = fs.readFileSync(filePath, 'utf-8');
           html = await vite.transformIndexHtml(req.originalUrl, html);
           return res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
        }
        const filePath = path.join(process.cwd(), 'index.html');
        let html = fs.readFileSync(filePath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
      } else {
        const pathname = req.path;
        if (pathname.startsWith('/login')) {
           return res.sendFile(path.join(process.cwd(), 'dist', 'login.html'));
        }
        if (pathname.startsWith('/mobile')) {
           return res.sendFile(path.join(process.cwd(), 'dist', 'mobile.html'));
        }
        if (pathname.startsWith('/inspector')) {
           return res.sendFile(path.join(process.cwd(), 'dist', 'inspector.html'));
        }
        res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
      }
    } catch (err) {
      next(err);
    }
  });

  try {
    mobileApp.listen(4000, '0.0.0.0', () => {
      console.log(`Mobile App Simulator running on http://0.0.0.0:4000`);
    });
  } catch (err) {
    console.warn('Could not bind port 4000 (accessible via port 3000 /mobile):', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Iraqi Nursing Syndicate Inspection System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});


