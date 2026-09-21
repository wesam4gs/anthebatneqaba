import { InspectionTemplate } from '../types';

/** القالب الافتراضي مطابق لبنود الاستمارة الميدانية الحالية (11 بنداً). */
export const DEFAULT_INSPECTION_FORM_TEMPLATE: InspectionTemplate = {
  id: 'tpl_national_nursing_v1',
  code: 'NURSE-FIELD-CORE',
  nameAr: 'استمارة الكشف النقابي الأساسية',
  nameEn: 'Core Nursing Field Inspection Form',
  facilityType: 'ALL',
  isActive: true,
  version: 1,
  createdBy: 'system',
  createdAt: '2026-01-01',
  updatedAt: '2026-09-20',
  schemaJson: {
    version: 1,
    categories: [
      {
        id: 'cat_licenses',
        titleAr: 'التراخيص والسجلات',
        titleEn: 'Licenses',
        sortOrder: 1,
        questions: [
          {
            id: 'c1',
            titleAr: 'توفر إجازة ممارسة المهنة والفتح نافذة المفعول',
            inputType: 'PASS_FAIL',
            weight: 15,
            required: true
          },
          {
            id: 'c2',
            titleAr: 'عرض شهادات الترخيص والتخصص النقابي بارزة للعيان',
            inputType: 'PASS_FAIL',
            weight: 10,
            required: true
          },
          {
            id: 'c3',
            titleAr: 'سجل استقبال المرضى وتدوين المداخلات التمريضية',
            inputType: 'PASS_FAIL',
            weight: 10,
            required: false
          }
        ]
      },
      {
        id: 'cat_staffing',
        titleAr: 'الكادر التمريضي',
        titleEn: 'Staffing',
        sortOrder: 2,
        questions: [
          {
            id: 'c4',
            titleAr: 'حضور مسؤول الكادر التمريض المجاز والمسجل أصولياً',
            inputType: 'PASS_FAIL',
            weight: 15,
            required: true
          },
          {
            id: 'c5',
            titleAr: 'حمل الموظفين لهويات الانتساب النقابي والباج التجاري',
            inputType: 'PASS_FAIL',
            weight: 10,
            required: true
          },
          {
            id: 'c6',
            titleAr: 'خلو العيادة من أفراد غير مرخصين ممارسين للتمريض',
            inputType: 'PASS_FAIL',
            weight: 15,
            required: true,
            branchOn: { when: 'FAIL', showQuestionIds: ['c6_note'] }
          },
          {
            id: 'c6_note',
            titleAr: 'وصف العمالة غير المرخصة المرصودة',
            helpAr: 'يظهر عند رصد مخالفة الكادر غير المرخص',
            inputType: 'TEXTAREA',
            weight: 0,
            required: false
          }
        ]
      },
      {
        id: 'cat_sanitation',
        titleAr: 'الإصحاح ومكافحة العدوى',
        titleEn: 'Sanitation',
        sortOrder: 3,
        questions: [
          {
            id: 'c7',
            titleAr: 'توفر جهاز التعقيم (Autoclave) واختبار كفاءته',
            inputType: 'TOGGLE',
            weight: 10,
            required: true
          },
          {
            id: 'c8',
            titleAr: 'التخلص الآمن من الحاويات الطبية الحادة (Safety Box)',
            inputType: 'TOGGLE',
            weight: 10,
            required: true
          },
          {
            id: 'c9',
            titleAr: 'توفر المطهرات والمعقمات المعتمدة وارتداء القفازات',
            inputType: 'PASS_FAIL',
            weight: 5,
            required: false
          }
        ]
      },
      {
        id: 'cat_drugs',
        titleAr: 'الأدوية والطوارئ',
        titleEn: 'Drugs',
        sortOrder: 4,
        questions: [
          {
            id: 'c10',
            titleAr: 'سلامة الأدوية والمستلزمات وعدم وجود مواد منتهية الصلاحية',
            inputType: 'PASS_FAIL',
            weight: 10,
            required: true
          },
          {
            id: 'c11',
            titleAr: 'توفر حقيبة الطوارئ والإنعاش التمريضي الأولي',
            inputType: 'RADIO',
            weight: 10,
            required: true,
            options: [
              { value: 'PASS', labelAr: 'متوفرة وكاملة' },
              { value: 'FAIL', labelAr: 'ناقصة أو غير موجودة' },
              { value: 'NA', labelAr: 'لا ينطبق على نوع المنشأة' }
            ]
          }
        ]
      }
    ]
  }
};

export const INITIAL_INSPECTION_TEMPLATES: InspectionTemplate[] = [DEFAULT_INSPECTION_FORM_TEMPLATE];
