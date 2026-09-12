import { User, Province } from '../types';

export interface RolePermissionDetail {
  id: string;
  title: string;
  category: 'LEADERSHIP' | 'BRANCH_MANAGEMENT' | 'INSPECTION' | 'FIELD';
  geographicScope: 'NATIONWIDE' | 'PROVINCE_RESTRICTED';
  scopeDescription: string;
  canBroadcastNationwide: boolean;
  canAccessAllProvinces: boolean;
  canIssueClosureOrders: boolean;
  canManageCommittees: boolean;
  canChatAcrossProvinces: boolean;
  permissionsList: string[];
  badgeColor: string;
}

export const ROLES_PERMISSIONS_DIRECTORY: RolePermissionDetail[] = [
  {
    id: 'SYNDICATE_PRESIDENT',
    title: 'نقيب التمريض العراقي (القيادة العليا)',
    category: 'LEADERSHIP',
    geographicScope: 'NATIONWIDE',
    scopeDescription: 'جمهورية العراق كافة (شامل جميع المحافظات الـ 18)',
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    canIssueClosureOrders: true,
    canManageCommittees: true,
    canChatAcrossProvinces: true,
    badgeColor: 'bg-amber-500 text-slate-950 border-amber-400',
    permissionsList: [
      'صلاحيات إشرافية ورقابية عليا على عموم محافظات العراق',
      'إصدار التبليغات العامة والتعاميم النقابية الملزمة لكافة الفروع',
      'التنقل ومتابعة جميع غرف دردشة وتفتيش المحافظات الـ 18',
      'المصادقة النهائية على قرارات الغلق والتشميع وسحب الإجازات',
      'التحكم المركزي بالموازنات التفتيشية ولجان الانضباط'
    ]
  },
  {
    id: 'DEPUTY_PRESIDENT',
    title: 'نائب نقيب التمريض العراقي',
    category: 'LEADERSHIP',
    geographicScope: 'NATIONWIDE',
    scopeDescription: 'جمهورية العراق كافة (شامل جميع المحافظات)',
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    canIssueClosureOrders: true,
    canManageCommittees: true,
    canChatAcrossProvinces: true,
    badgeColor: 'bg-indigo-600 text-white border-indigo-400',
    permissionsList: [
      'صلاحيات القيادة العليا بالإنابة على مستوى كل المحافظات',
      'إصدار برقيات وتبليغات عامة لجميع الفروع ولجان التفتيش',
      'الإشراف المباشر على التنسيق والربط العملياتي بين الفروع',
      'الاطلاع والمشاركة في قنوات تفتيش كافة المحافظات'
    ]
  },
  {
    id: 'HEAD_OF_BAGHDAD_BRANCH',
    title: 'مسؤول فرع بغداد / المقر العام',
    category: 'BRANCH_MANAGEMENT',
    geographicScope: 'NATIONWIDE',
    scopeDescription: 'فرع بغداد (الكرخ والرصافة) + وصول إداري وتبليغ عام لكافة المحافظات',
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    canIssueClosureOrders: true,
    canManageCommittees: true,
    canChatAcrossProvinces: true,
    badgeColor: 'bg-blue-600 text-white border-blue-400',
    permissionsList: [
      'صلاحية إرسال التبليغات العامة لكافة فروع ولجان المحافظات',
      'إدارة وتنسيق مفرزات وفرق التفتيش في العاصمة بغداد',
      'الربط المباشر مع المقر العام وغرف عمليات المحافظات الأخرى',
      'متابعة البلاغات الطارئة وتوجيه اللجان التفتيشية'
    ]
  },
  {
    id: 'PROVINCE_BRANCH_DIRECTOR',
    title: 'مدير فرع المحافظة (كربلاء، البصرة، نينوى، النجف...)',
    category: 'BRANCH_MANAGEMENT',
    geographicScope: 'PROVINCE_RESTRICTED',
    scopeDescription: 'مقيد بحدود المحافظة التابعة للفرع فقط',
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    canIssueClosureOrders: true,
    canManageCommittees: true,
    canChatAcrossProvinces: false,
    badgeColor: 'bg-emerald-600 text-white border-emerald-400',
    permissionsList: [
      'إدارة وتوجيه مفتشي ولجان التفتيش في محافظته حصراً',
      'التواصل والتنسيق بالشات داخل نطاق محافظته فقط (لا يتعدى لمحافظات أخرى)',
      'استلام التبليغات العامة الصادرة من النقيب أو نائبه أو مسؤول فرع بغداد',
      'اعتماد الكشوفات الميدانية واقتراح الغرامات والإغلاقات المحلية'
    ]
  },
  {
    id: 'INSPECTION_COMMITTEE_HEAD',
    title: 'مسؤول لجنة التفتيش الميداني',
    category: 'INSPECTION',
    geographicScope: 'PROVINCE_RESTRICTED',
    scopeDescription: 'نطاق المحافظة المخصصة للجنة',
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    canIssueClosureOrders: false,
    canManageCommittees: true,
    canChatAcrossProvinces: false,
    badgeColor: 'bg-purple-600 text-white border-purple-400',
    permissionsList: [
      'قيادة فرق ومفارز الكشف الميداني في نطاق المحافظة',
      'التواصل اللحظي مع مفتشي المحافظة فقط وتوزيع المهام',
      'استلام التوجيهات المركزية العامة من المقر العام',
      'رفع طلبات التشميع العاجلة ومحاضر الضبط الميداني'
    ]
  },
  {
    id: 'FIELD_INSPECTOR',
    title: 'مفتش ميداني (Field Inspector)',
    category: 'FIELD',
    geographicScope: 'PROVINCE_RESTRICTED',
    scopeDescription: 'نطاق المحافظة المحددة فقط (كربلاء، البصرة، بغداد...) - لا يمكنه تواصل خارج محافظته',
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    canIssueClosureOrders: false,
    canManageCommittees: false,
    canChatAcrossProvinces: false,
    badgeColor: 'bg-teal-600 text-white border-teal-400',
    permissionsList: [
      'إجراء الكشوفات التفتيشية الميدانية عبر تطبيق الهاتف PWA',
      'التواصل الميداني بالشات محصور حصراً مع مفتشي محافظته فقط (ممنوع تواصل مفتش كربلاء مع مفتش البصرة)',
      'استقبال والالتزام بالتبليغات العامة الواردة من (النقيب / نائبه / مسؤول فرع بغداد المقر العام)',
      'مسح هويات الكوادر التمريضية وتوثيق المخالفات وفحص اشتراطات السلامة'
    ]
  }
];

/**
 * Check if a user has nationwide broadcast authority
 * (النقيب، نائبه، مسؤول فرع بغداد والمقر العام)
 */
export function canUserBroadcastNationwide(user: User): boolean {
  if (user.canBroadcastNationwide) return true;
  if (user.role === 'HIGH_COMMAND') return true;
  if (user.id === 'user_1' || user.id === 'user_deputy_president' || user.id === 'user_baghdad_branch_head') return true;
  if (user.assignedZoneId === 'all_hq' || user.provinceId === 'all') return true;
  // Baghdad branch head with HQ broadcast authority
  if (user.provinceId === 'iq_baghdad' && (user.name.includes('فرع بغداد') || user.name.includes('المقر العام') || user.roleTitle?.includes('فرع بغداد'))) {
    return true;
  }
  return false;
}

/**
 * Check if a user can access and view all provinces channels
 */
export function canUserAccessAllProvinces(user: User): boolean {
  if (user.canAccessAllProvinces) return true;
  if (user.role === 'HIGH_COMMAND') return true;
  if (user.id === 'user_1' || user.id === 'user_deputy_president' || user.id === 'user_baghdad_branch_head' || user.id === 'user_test1') return true;
  if (user.provinceId === 'all' || user.assignedZoneId === 'all_hq') return true;
  return false;
}

/**
 * Check if an inspector is allowed to communicate with another inspector
 * Rule: Field inspectors must be in the same province!
 */
export function canUsersChatTogether(userA: User, userB: User): boolean {
  if (canUserAccessAllProvinces(userA) || canUserAccessAllProvinces(userB)) return true;
  if (!userA.provinceId || !userB.provinceId) return false;
  return userA.provinceId === userB.provinceId;
}

/**
 * Get geographic scope summary for a user
 */
export function getUserGeographicScope(user: User): {
  isNationwide: boolean;
  label: string;
  detail: string;
  badgeClass: string;
} {
  if (canUserAccessAllProvinces(user)) {
    return {
      isNationwide: true,
      label: 'عموم جمهورية العراق (شامل)',
      detail: 'صلاحيات وصول لكافة المحافظات والـ 18 فرعاً + تبليغ عام شامل',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    };
  }

  const provName = user.provinceName || 'محافظته المحددة';
  return {
    isNationwide: false,
    label: `نطاق محلي: ${provName}`,
    detail: `محصور بالتواصل والتفتيش داخل ${provName} فقط (ممنوع التواصل مع المحافظات الأخرى)`,
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40'
  };
}

/**
 * Get friendly role title for user
 */
export function getUserRoleTitle(user: User): string {
  if (user.roleTitle) return user.roleTitle;
  if (user.id === 'user_1') return 'نقيب التمريض العراقي';
  if (user.id === 'user_deputy_president') return 'نائب نقيب التمريض العراقي';
  if (user.id === 'user_baghdad_branch_head') return 'مسؤول فرع بغداد / المقر العام';
  if (user.id === 'user_karbala_dir') return 'مدير فرع كربلاء المقدسة';
  if (user.id === 'user_basra_insp') return 'مفتش ميداني - البصرة';
  if (user.id === 'user_karbala_insp') return 'مفتش ميداني - كربلاء';
  
  switch (user.role) {
    case 'HIGH_COMMAND':
      return 'القيادة العليا / النقيب';
    case 'BRANCH_DIRECTOR':
      return `مدير فرع ${user.provinceName || ''}`;
    case 'INSPECTION_DIRECTOR':
      return `رئيس لجنة تفتيش ${user.provinceName || ''}`;
    case 'FIELD_INSPECTOR':
      return `مفتش ميداني (${user.provinceName || ''})`;
    default:
      return 'عضو نقابة التمريض';
  }
}
