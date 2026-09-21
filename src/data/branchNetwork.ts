export interface SyndicateBranchCard {
  provinceId: string;
  provinceNameAr: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
  isHq: boolean;
  sectors: string[];
  landmarkName: string;
  landmarkPhoto: string;
  centerLat: number;
  centerLng: number;
}

/**
 * بيانات الفروع من منصة Nursing Gate (nursing-gate.web.app)
 * مع إبقاء قطاعات التفتيش لربط الكشوفات والمهام.
 */
export const SYNDICATE_BRANCH_NETWORK: SyndicateBranchCard[] = [
  {
    provinceId: 'iq_baghdad',
    provinceNameAr: 'بغداد',
    name: 'المقر العام - بغداد (القيادة المركزية)',
    address: 'باب المعظم - محلة 302، شارع 12، بناية رقم 21، قرب المستشفى الدولي الأهلي',
    phone: '07700011223',
    manager: 'د. نقيب التمريض العراقي',
    isHq: true,
    sectors: ['قطاع الكرخ', 'قطاع الرصافة', 'قطاع مدينة الصدر', 'قطاع الكاظمية', 'قطاع المحمودية', 'قطاع التاجي'],
    landmarkName: 'نصب الحرية ونهر دجلة والقشلة',
    landmarkPhoto: 'https://images.unsplash.com/photo-1578895210405-907db486c111?w=800&auto=format&fit=crop&q=80',
    centerLat: 33.3152,
    centerLng: 44.3661
  },
  {
    provinceId: 'iq_basra',
    provinceNameAr: 'البصرة',
    name: 'فرع البصرة',
    address: 'الجبيلة - قرب تقاطع المستشفى التعليمي',
    phone: '07801234501',
    manager: 'أ. حيدر كاظم التميمي',
    isHq: false,
    sectors: ['قطاع المركز', 'قطاع الزبير', 'قطاع القرنة', 'قطاع أبي الخصيب', 'قطاع الفاو'],
    landmarkName: 'شط العرب وشناشيل البصرة التراثية',
    landmarkPhoto: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
    centerLat: 30.5081,
    centerLng: 47.7835
  },
  {
    provinceId: 'iq_nineveh',
    provinceNameAr: 'نينوى',
    name: 'فرع نينوى (الموصل)',
    address: 'الموصل - الجانب الأيسر - حي السكر',
    phone: '07709876502',
    manager: 'أ. عمر فاروق الحمداني',
    isHq: false,
    sectors: ['قطاع الموصل الأيمن', 'قطاع الموصل الأيسر', 'قطاع تلعفر', 'قطاع الحمدانية', 'قطاع سنجار'],
    landmarkName: 'منارة الحدباء وجامع النوري وآثار نينوى',
    landmarkPhoto: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    centerLat: 36.34,
    centerLng: 43.13
  },
  {
    provinceId: 'iq_najaf',
    provinceNameAr: 'النجف الأشرف',
    name: 'فرع النجف الأشرف',
    address: 'شارع الكوفة - مجاور دائرة الصحة',
    phone: '07802345603',
    manager: 'أ. كرار عبد الرضا الشمري',
    isHq: false,
    sectors: ['قطاع المركز', 'قطاع الكوفة', 'قطاع المناذرة', 'قطاع المشخاب'],
    landmarkName: 'المرقد العلوي المطهر وبحر النجف التاريخي',
    landmarkPhoto: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
    centerLat: 32.0289,
    centerLng: 44.3789
  },
  {
    provinceId: 'iq_karbala',
    provinceNameAr: 'كربلاء المقدسة',
    name: 'فرع كربلاء المقدسة',
    address: 'حي المعلمين - قرب مستشفى الإمام الحسين التعليمي',
    phone: '07803456704',
    manager: 'أ. مصطفى حميد الحسيني',
    isHq: false,
    sectors: ['قطاع المركز', 'قطاع الهندية', 'قطاع الحسينية', 'قطاع عين التمر'],
    landmarkName: 'العتبة الحسينية والعباسية ومنطقة بين الحرمين',
    landmarkPhoto: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
    centerLat: 32.616,
    centerLng: 44.0249
  },
  {
    provinceId: 'iq_kirkuk',
    provinceNameAr: 'كركوك',
    name: 'فرع كركوك',
    address: 'طريق بغداد - حي القادسية الثانية',
    phone: '07707890108',
    manager: 'أ. برهان تحسين البياتي',
    isHq: false,
    sectors: ['قطاع المركز', 'قطاع الحويجة', 'قطاع داقوق', 'قطاع الدبس'],
    landmarkName: 'قلعة كركوك التاريخية وقشلة كركوك العثمانية',
    landmarkPhoto: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=800&auto=format&fit=crop&q=80',
    centerLat: 35.4674,
    centerLng: 44.3833
  },
  {
    provinceId: 'iq_babel',
    provinceNameAr: 'بابل',
    name: 'فرع بابل',
    address: 'الحلة - شارع 40 - قرب مستشفى مرجان',
    phone: '07808901209',
    manager: 'أ. فلاح حسن المعموري',
    isHq: false,
    sectors: ['قطاع الحلة', 'قطاع المحاويل', 'قطاع المسيب', 'قطاع الهاشمية', 'قطاع القاسم'],
    landmarkName: 'بوابة عشتار وأسد بابل وآثار بابل التاريخية',
    landmarkPhoto: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    centerLat: 32.482,
    centerLng: 44.4344
  },
  {
    provinceId: 'iq_anbar',
    provinceNameAr: 'الأنبار',
    name: 'فرع الأنبار (الرمادي)',
    address: 'الرمادي - شارع 17 تموز - مجاور مبنى النقابات',
    phone: '07709012310',
    manager: 'أ. بلال إبراهيم الدليمي',
    isHq: false,
    sectors: ['قطاع الرمادي', 'قطاع الفلوجة', 'قطاع هيت', 'قطاع القائم', 'قطاع حديثة'],
    landmarkName: 'نواعير هيت التراثية على نهر الفرات وبحيرة الحبانية',
    landmarkPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    centerLat: 33.4219,
    centerLng: 43.3076
  },
  {
    provinceId: 'iq_diyala',
    provinceNameAr: 'ديالى',
    name: 'فرع ديالى (بعقوبة)',
    address: 'بعقوبة - حي المعلمين - قرب مستشفى بعقوبة التعليمي',
    phone: '07700123411',
    manager: 'أ. جاسم محمد الخالدي',
    isHq: false,
    sectors: ['قطاع بعقوبة', 'قطاع الخالص', 'قطاع المقدادية', 'قطاع خانقين', 'قطاع بلدروز'],
    landmarkName: 'بساتين النخيل والبرتقال وبحيرة حمرين',
    landmarkPhoto: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80',
    centerLat: 33.7483,
    centerLng: 44.6243
  },
  {
    provinceId: 'iq_wasit',
    provinceNameAr: 'واسط',
    name: 'فرع واسط (الكوت)',
    address: 'الكوت - حي الزهراء - شارع المحافظة',
    phone: '07801234512',
    manager: 'أ. عباس غريب اللامي',
    isHq: false,
    sectors: ['قطاع الكوت', 'قطاع الصويرة', 'قطاع العزيزية', 'قطاع النعمانية', 'قطاع الحي'],
    landmarkName: 'سدة الكوت التاريخية على نهر دجلة',
    landmarkPhoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80',
    centerLat: 32.5056,
    centerLng: 45.8247
  },
  {
    provinceId: 'iq_dhi_qar',
    provinceNameAr: 'ذي قار',
    name: 'فرع ذي قار (الناصرية)',
    address: 'الناصرية - شارع المحافظة القديم - قرب مستشفى الحبوبي',
    phone: '07802345613',
    manager: 'أ. ضياء صالح الإبراهيمي',
    isHq: false,
    sectors: ['قطاع الناصرية', 'قطاع الشطرة', 'قطاع الرفاعي', 'قطاع سوق الشيوخ', 'قطاع الجبايش'],
    landmarkName: 'زقورة أور السومرية وأهوار الجبايش',
    landmarkPhoto: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
    centerLat: 31.058,
    centerLng: 46.2573
  },
  {
    provinceId: 'iq_maysan',
    provinceNameAr: 'ميسان',
    name: 'فرع ميسان (العمارة)',
    address: 'العمارة - حي الحسين - قرب مستشفى الصدر',
    phone: '07803456714',
    manager: 'أ. سامر جبار البهادلي',
    isHq: false,
    sectors: ['قطاع العمارة', 'قطاع المجر الكبير', 'قطاع الميمونة', 'قطاع علي الغربي'],
    landmarkName: 'أهوار ميسان التراثية (هور الحويزة) وشط الكحلاء',
    landmarkPhoto: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
    centerLat: 31.8415,
    centerLng: 47.1424
  },
  {
    provinceId: 'iq_muthanna',
    provinceNameAr: 'المثنى',
    name: 'فرع المثنى (السماوة)',
    address: 'السماوة - شارع باتا - مجاور المركز التخصصي',
    phone: '07804567815',
    manager: 'أ. منتظر كريم الزيادي',
    isHq: false,
    sectors: ['قطاع السماوة', 'قطاع الرميثة', 'قطاع الخضر', 'قطاع الوركاء'],
    landmarkName: 'آثار الوركاء مهد الكتابة وبحيرة ساوة الطبيعية',
    landmarkPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    centerLat: 31.3197,
    centerLng: 45.2828
  },
  {
    provinceId: 'iq_qadisiyyah',
    provinceNameAr: 'القادسية',
    name: 'فرع القادسية (الديوانية)',
    address: 'الديوانية - حي الفرات - قرب مستشفى الأطفال',
    phone: '07805678916',
    manager: 'أ. علاء تركي البديري',
    isHq: false,
    sectors: ['قطاع المركز', 'قطاع الشامية', 'قطاع عفك', 'قطاع الحمزة'],
    landmarkName: 'آثار مدينة نيبور (نَفَّر) المقدسة وهور الدلمج',
    landmarkPhoto: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
    centerLat: 31.9902,
    centerLng: 44.9256
  },
  {
    provinceId: 'iq_saladin',
    provinceNameAr: 'صلاح الدين',
    name: 'فرع صلاح الدين (تكريت)',
    address: 'تكريت - شارع الأطباء - قرب المستشفى التعليمي',
    phone: '07706789017',
    manager: 'أ. وسام شاكر التكريتي',
    isHq: false,
    sectors: ['قطاع تكريت', 'قطاع سامراء', 'قطاع بيجي', 'قطاع بلد', 'قطاع الطوز'],
    landmarkName: 'مئذنة الملوية بسامراء وقصر العاشق',
    landmarkPhoto: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    centerLat: 34.6071,
    centerLng: 43.6782
  }
];
