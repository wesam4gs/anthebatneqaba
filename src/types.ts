export type UserRole = 
  | 'HIGH_COMMAND'       // النقيب / المدير العام
  | 'BRANCH_DIRECTOR'   // مدير الفرع / الزون (مثل الكرخ والرصافة)
  | 'INSPECTION_DIRECTOR'// مدير لجان التفتيش
  | 'FIELD_INSPECTOR';   // مفتش ميداني

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleTitle?: string; // المسمى الوظيفي الدقيق (نقيب، نائب النقيب، مسؤول فرع بغداد، إلخ)
  badgeNumber: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
  nationalId?: string;
  educationQualification?: string; // التحصيل الدراسي (بكالوريوس، ماجستير، دبلوم، إلخ)
  specialization?: string; // التخصص الدقيق
  provinceId?: string; // رمز المحافظة (أو 'all' للمقر العام)
  provinceName?: string; // اسم المحافظة
  canBroadcastNationwide?: boolean; // هل يملك صلاحية التبليغ العام لكافة المحافظات
  canAccessAllProvinces?: boolean; // هل يملك صلاحية الوصول والتنقل بين كافة المحافظات
  assignedZoneId?: string; // e.g. 'zone_karkh', 'zone_rusafa'
  assignedZoneName?: string;
  status?: 'ACTIVE' | 'INACTIVE'; // حالة الحساب
  createdAt?: string;
  avatar?: string;
  notes?: string;
}

export interface Province {
  id: string;
  nameAr: string;
  nameEn: string;
  centerLat: number;
  centerLng: number;
  zoomLevel: number;
}

export interface DistrictZone {
  id: string;
  provinceId: string;
  nameAr: string; // e.g., بغداد - الكرخ, بغداد - الرصافة, البصرة - المركز
  code: string;
  centerLat: number;
  centerLng: number;
  neighborhoods: string[];
}

export interface InspectionCommittee {
  id: string;
  code: string; // e.g. COMM-BAG-01
  name: string; // اسم اللجنة التفتيشية
  headInspectorId: string; // رئيس اللجنة (المفتش المسؤول)
  memberIds: string[]; // أعضاء اللجنة من الممرضين المفتشين (يمكن أن تكون 1 شخص أو أكثر)
  provinceId?: string; // المحافظة المخصصة
  zoneId?: string; // القطاع / الفرع
  status: 'ACTIVE' | 'INACTIVE';
  createdDate: string;
  notes?: string;
}

export interface CustomInspectionZone {
  id: string;
  zoneName: string; // اسم الزون (مثل: زون 1 - الكرخ الشمالي)
  provinceId: string; // المحافظة
  zoneId: string; // الفرع / القطاع
  districtArea: string; // اسم المنطقة / القضاء
  neighborhoods: string[]; // الأحياء والمناطق
  geoPointsDescription: string; // نقاط وإحداثيات الزون الجغرافية (GPS Boundary / Points)
  committeeId?: string; // معرف اللجنة المكلفة إن وجدت
  assignedCommitteeName: string; // اسم اللجنة التفتيشية المكلفة
  assignedInspectorIds: string[]; // المعرفات الخاصة بالمفتشين المكلفين (يمكن أن يكون مفتش واحد أو أكثر)
  notes?: string;
  createdDate: string;
}

export type FacilityType = 'CLINIC' | 'MIDWIFE_CLINIC' | 'HOSPITAL' | 'NURSING_CENTER' | 'LAB_CENTER';
export type LicenseStatus = 'LICENSED' | 'PENDING' | 'EXPIRED' | 'SUSPENDED' | 'UNLICENSED';

export interface Facility {
  id: string;
  licenseNumber: string;
  name: string;
  type: FacilityType;
  provinceId: string; // المحافظة
  zoneId: string; // الفرع / القطاع
  districtArea: string; // اسم المنطقة / القضاء
  neighborhood: string; // الحي / المحلة
  addressDetail: string;
  ownerName: string;
  ownerPhone: string;
  latitude: number;
  longitude: number;
  licenseStatus: LicenseStatus;
  licenseExpiryDate: string;
  lastInspectionDate?: string;
  inspectionStatus: 'INSPECTED' | 'NEEDS_INSPECTION' | 'VIOLATION_RECORDED' | 'CLOSED';
  assignedInspectorId?: string;
  createdDate: string;
}

export type NurseSyndicateStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED' | 'NOT_FOUND';

export interface NurseStaff {
  id: string;
  syndicateId: string; // رقم الانتساب بنقابة التمريض
  fullName: string;
  nationalId: string;
  specializedTitle: string; // e.g., ممرض جامعي, ممرض ماهر, أخصائي تمريض باطني
  qualificationDegree?: string; // المؤهل الأكاديمي: كلية التمريض (بكالوريوس)، معهد تمريض (دبلوم)، إعدادية التمريض
  qualificationName?: string; // اسم الكلية / المعهد / المدرسة الإعدادية
  graduationYear?: number | string; // سنة التخرج من الكلية أو المعهد أو الإعدادية
  syndicateRegistrationYear?: number | string; // سنة الانتساب للنقابة
  bloodType?: string; // فصيلة الدم
  syndicateStatus: NurseSyndicateStatus;
  licenseExpiryDate: string;
  currentFacilityId: string;
  facilityName: string;
  phone: string;
  photoUrl?: string;
  notes?: string;
}

export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface InspectionAssignment {
  id: string;
  assignmentCode: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  facilityLat: number;
  facilityLng: number;
  assignedInspectorId: string;
  assignedInspectorName: string;
  assignedByUserId: string;
  assignedByUserName: string;
  scheduledDate: string;
  priority: PriorityLevel;
  status: AssignmentStatus;
  notes?: string;
  createdAt: string;
}

export type ViolationType = 
  | 'UNLICENSED_STAFF'       // تشغيل كوادر غير تمريضية أو غير مسجلة
  | 'EXPIRED_SYNDICATE_CARD' // انتهاء هوية النقابة للممرض
  | 'SANITATION_DEFECT'      // خرق الاشتراطات الصحية/التمريضية
  | 'UNAUTHORIZED_PROCEDURE' // إجراء مداخلات تمريضية غير مصرح بها
  | 'EXPIRED_FACILITY_LICENSE'// انتهاء ترخيص المنشأة
  | 'ABSENCE_OF_SUPERVISOR'  // عدم وجود مسؤول التمريض
  | 'OTHER';

export type PenaltySeverity = 'WARNING' | 'FINE' | 'INVESTIGATION_COMMITTEE' | 'TEMPORARY_CLOSURE';

export interface ViolationRecord {
  id: string;
  inspectionReportId: string;
  facilityId: string;
  facilityName: string;
  violationType: ViolationType;
  description: string;
  nurseSyndicateId?: string;
  nurseName?: string;
  severity: PenaltySeverity;
  fineAmountIqd?: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'RESOLVED' | 'APPEALED';
  recordedAt: string;
}

// إضافة قائمة تدقيق تفصيلية لتسهيل عمل المفتش ميدانياً
export interface FacilitySafetyChecklist {
  hasAutoclaveSterilizer?: boolean; // جهاز تعقيم فعال (للعيادات)
  hasSafetyBox?: boolean;           // صندوق التخلص من الحوادث الحادة
  hasExpiredMedications?: boolean;  // وجود أدوية منتهية أو محظورة
  hasUnlicensedForeignStaff?: boolean; // وجود عمالة أجنبية غير مرخصة
  isExceedingScopeOfPractice?: boolean; // تشخيص طبي أو وصف أدوية خارج الصلاحية
}

export interface InspectionReport {
  id: string;
  assignmentId: string;
  facilityId: string;
  inspectorId: string;
  inspectorName: string;
  visitTimestamp: string;
  // GPS verification data
  inspectorLat: number;
  inspectorLng: number;
  facilityLat: number;
  facilityLng: number;
  gpsDistanceMeters: number;
  isGpsValidated: boolean; // true if distance <= threshold (e.g. 150 meters)
  
  // Inspection Details
  generalComplianceScore: number; // 1-100
  checkedNursesCount: number;
  violationsCount: number;
  notes: string;
  photos: string[]; // live photos attached
  
  // Safety Checklist
  safetyChecklist?: FacilitySafetyChecklist;

  // Nurse Check Logs
  checkedNurseIds: string[];
  
  // Decision
  recommendedAction: 'PASS' | 'WARNING_ISSUED' | 'FINE_RECOMMENDED' | 'REFERRAL_TO_INVESTIGATION';
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  templateId?: string;
  answersJson?: Record<string, unknown>;
}

export interface SystemStats {
  totalFacilities: number;
  totalClinics: number;
  totalHospitals: number;
  totalLicensed: number;
  totalPending: number;
  totalViolations: number;
  totalActiveNurses: number;
  inspectionsCompletedThisMonth: number;
  pendingAssignments: number;
}

// ==================== FINANCIAL & FINES ACCOUNTING ====================
export type VoucherType = 'RECEIPT' | 'PAYMENT';
export type VoucherCategory = 
  | 'INSPECTION_FINE'            // غرامة محضر تفتيش
  | 'FACILITY_LICENSING_FEE'     // رسم كشف وترخيص منشأة صحية
  | 'DISCIPLINE_PENALTY'         // غرامة قرار لجنة الانضباط
  | 'FIELD_INSPECTION_EXPENSES'  // مخصصات ونثريات فرق التفتيش الميداني
  | 'INSPECTOR_REWARD'           // مكافأة ضبط مخالفة جسيمة
  | 'EQUIPMENT_MAINTENANCE';     // صيانة أجهزة الفحص الميداني

export type PaymentMethod = 'CASH' | 'ELECTRONIC_QI' | 'BANK_TRANSFER' | 'ZAIN_CASH';
export type TreasuryFund = 'INSPECTION_FUND' | 'SYNDICATE_MAIN_TREASURY' | 'DISCIPLINE_SETTLEMENT';

export interface FinancialVoucher {
  id: string;
  voucherNumber: string; // e.g. RV-2026-0041
  voucherType: VoucherType;
  category: VoucherCategory;
  amountIqd: number;
  payerOrBeneficiary: string;
  facilityId?: string;
  facilityName?: string;
  violationId?: string;
  provinceId: string;
  provinceName: string;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  treasuryFund: TreasuryFund;
  status: 'COLLECTED' | 'PENDING' | 'RECONCILED';
  issuedByUserId: string;
  issuedByUserName: string;
  notes?: string;
}

export interface BranchInspectionBudget {
  id: string;
  provinceId: string;
  provinceName: string;
  fiscalMonth: string;
  operationalAllocatedIqd: number;
  operationalSpentIqd: number;
  collectedFinesIqd: number;
  collectedFeesIqd: number;
  inspectionsTarget: number;
  inspectionsExecuted: number;
}

// ==================== INTER-BRANCH & DISCIPLINE OPERATIONS ====================
export interface BranchChatMessage {
  id: string;
  channelId: string; // e.g. 'province_iq_baghdad', 'province_iq_karbala', 'province_iq_basra', etc.
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderRoleTitle?: string;
  senderBadge: string;
  provinceId?: string;
  provinceName?: string;
  messageText: string;
  timestamp: string;
  type: 'TEXT' | 'URGENT_DISPATCH' | 'CLOSURE_ORDER' | 'LOCATION_ALERT' | 'CENTRAL_BROADCAST';
  isNationwideBroadcast?: boolean; // هل الرسالة تبليغ عام شامل لكل المحافظات صادر من القيادة
  broadcastTarget?: 'ALL_BRANCHES' | 'PROVINCE_ONLY';
  attachment?: {
    type: 'FACILITY_FILE' | 'VIOLATION_EVIDENCE' | 'PDF_DECISION';
    title: string;
    referenceId?: string;
  };
}

export interface DisciplineBroadcast {
  id: string;
  code: string;
  title: string;
  summary: string;
  urgency: 'URGENT' | 'IMPORTANT' | 'REGULAR';
  issuedBy: string;
  targetScope: 'ALL_BRANCHES' | 'PROVINCE_SPECIFIC';
  targetProvinceId?: string;
  issueDate: string;
  actionRequired: string;
  isActive: boolean;
}

export type InspectionInputType = 'PASS_FAIL' | 'TOGGLE' | 'RADIO' | 'TEXTAREA' | 'NUMBER';
export type PassFailValue = 'PASS' | 'FAIL' | 'NA';

export interface InspectionQuestionBranch {
  when: PassFailValue | 'true' | 'false' | string;
  showQuestionIds: string[];
}

export interface InspectionQuestionSchema {
  id: string;
  titleAr: string;
  titleEn?: string;
  helpAr?: string;
  inputType: InspectionInputType;
  weight: number;
  required: boolean;
  options?: { value: string; labelAr: string }[];
  branchOn?: InspectionQuestionBranch;
}

export interface InspectionCategorySchema {
  id: string;
  titleAr: string;
  titleEn?: string;
  sortOrder: number;
  questions: InspectionQuestionSchema[];
}

export interface InspectionFormSchema {
  version: number;
  categories: InspectionCategorySchema[];
}

export interface InspectionTemplate {
  id: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  facilityType?: string;
  schemaJson: InspectionFormSchema;
  isActive: boolean;
  version: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectorLiveLocation {
  inspectorId: string;
  inspectorName: string;
  role?: string;
  provinceId?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isActive: boolean;
  updatedAt: string;
}

export interface OfflineInspectionDraft {
  id: string;
  assignmentId?: string;
  inspectorId?: string;
  inspectorName?: string;
  facilityId: string;
  facilityName: string;
  templateId: string;
  answersJson: Record<string, unknown>;
  photos: string[];
  notes: string;
  complianceScore: number;
  inspectorLat?: number;
  inspectorLng?: number;
  createdAt: string;
  syncStatus: 'DRAFT' | 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  lastError?: string;
}

