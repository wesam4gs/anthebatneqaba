import { FacilityType } from '../types';

export function facilityTypeLabel(type: FacilityType): string {
  switch (type) {
    case 'HOSPITAL':
      return 'مستشفى أهلي';
    case 'MIDWIFE_CLINIC':
      return 'عيادة قابلات';
    case 'NURSING_CENTER':
      return 'مركز رعاية تمريضية';
    case 'LAB_CENTER':
      return 'مختبر تحليلات مرضية';
    case 'CLINIC':
    default:
      return 'عيادة تمريضية';
  }
}

export function facilityTypeEmoji(type: FacilityType): string {
  if (type === 'HOSPITAL') return '🏥';
  if (type === 'MIDWIFE_CLINIC') return '👶';
  if (type === 'NURSING_CENTER') return '🏨';
  return '🩺';
}
