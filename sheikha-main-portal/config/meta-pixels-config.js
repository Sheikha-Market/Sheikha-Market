/**
 * =========================================================
 * SHEIKHA META PIXELS CONFIGURATION
 * ملف إعدادات البيكسلات الخمسة المنفصلة
 * =========================================================
 */

module.exports = {
  // السوق الأولى: سوق شيخة للمعادن
  metals: {
    pixel_id: process.env.META_PIXEL_ID_METALS || '4383900581880844',
    name: 'Sheikha_Pixel_Metals',
    market_path: '/metals',
    description: 'سوق شيخة للمعادن - B2B صناعي',
    currency: 'SAR',
    primary_device: 'desktop',
    target_audience: ['مصانع', 'شركات إنشاءات', 'تجار جملة'],
    key_events: ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase', 'Lead'],
  },

  // السوق الثانية: سوق شيخة للسكراب
  scrap: {
    pixel_id: process.env.META_PIXEL_ID_SCRAP || process.env.META_PIXEL_ID,
    name: 'Sheikha_Pixel_Scrap',
    market_path: '/scrap',
    description: 'سوق شيخة للسكراب - مصانع تدوير',
    currency: 'SAR',
    primary_device: 'mobile',
    target_audience: ['مصانع تدوير', 'تجار خردة', 'مزادات'],
    key_events: ['ViewContent', 'SubmitApplication', 'Lead', 'Purchase'],
  },

  // السوق الثالثة: سوق شيخة للمعادن الثمينة
  precious: {
    pixel_id: process.env.META_PIXEL_ID_PRECIOUS || process.env.META_PIXEL_ID,
    name: 'Sheikha_Pixel_Precious',
    market_path: '/precious',
    description: 'سوق شيخة للمعادن الثمينة - VIP وحكومي',
    currency: 'SAR',
    primary_device: 'desktop',
    target_audience: ['بنوك مركزية', 'حكومات', 'مستثمرين', 'مجوهرات'],
    key_events: ['ViewContent', 'Contact', 'Schedule', 'Purchase'],
  },

  // السوق الرابعة: سوق شيخة للمعادن النادرة
  rare: {
    pixel_id: process.env.META_PIXEL_ID_RARE || process.env.META_PIXEL_ID,
    name: 'Sheikha_Pixel_Rare',
    market_path: '/rare',
    description: 'سوق شيخة للمعادن النادرة - G20 والحكومات',
    currency: 'USD',
    primary_device: 'desktop',
    target_audience: ['شركات تقنية', 'وزارات دفاع', 'قطاع الطاقة', 'حكومات'],
    key_events: ['ViewContent', 'RequestQuote', 'Lead', 'Contact'],
  },

  // السوق الخامسة: سوق الآن
  now: {
    pixel_id: process.env.META_PIXEL_ID_NOW || process.env.META_PIXEL_ID,
    name: 'Sheikha_Pixel_Now',
    market_path: '/now',
    description: 'سوق الآن - عروض فورية لحظية',
    currency: 'SAR',
    primary_device: 'mobile',
    target_audience: ['مضاربين', 'تجار يوميين', 'مستهلكين'],
    key_events: ['ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'],
  },
};
