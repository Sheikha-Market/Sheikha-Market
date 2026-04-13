/**
 * =====================================================================
 * SHEIKHA META CONVERSIONS API GATEWAY - النسخة الشاملة الأقوى
 * =====================================================================
 * تكامل CAPI مع البيكسل الخماسي لمنظومة شيخة
 * مع Deduplication + Server-Side Hashing + Georouting
 * التاريخ: 12 أبريل 2026
 * =================================================================== */

const crypto = require('crypto');
const axios = require('axios');
const config = require('../../config/config');

// =====================================================================
// الـ PIXELS والـ CAPI Gateway للأسواق الخمسة
// =====================================================================
const SHEIKHA_MARKETS = {
  metals: {
    pixel_id: process.env.META_PIXEL_ID_METALS || '4383900581880844',
    region: 'riyadh',
    description: 'سوق شيخة للمعادن - B2B صناعي',
    access_token: process.env.META_CAPI_ACCESS_TOKEN,
  },
  scrap: {
    pixel_id: process.env.META_PIXEL_ID_SCRAP || process.env.META_PIXEL_ID,
    region: 'dubai',
    description: 'سوق شيخة للسكراب - تدوير',
    access_token: process.env.META_CAPI_ACCESS_TOKEN,
  },
  precious: {
    pixel_id: process.env.META_PIXEL_ID_PRECIOUS || process.env.META_PIXEL_ID,
    region: 'switzerland',
    description: 'سوق شيخة للمعادن الثمينة - B2G',
    access_token: process.env.META_CAPI_ACCESS_TOKEN,
  },
  rare: {
    pixel_id: process.env.META_PIXEL_ID_RARE || process.env.META_PIXEL_ID,
    region: 'usa',
    description: 'سوق شيخة للمعادن النادرة - G20',
    access_token: process.env.META_CAPI_ACCESS_TOKEN,
  },
  now: {
    pixel_id: process.env.META_PIXEL_ID_NOW || process.env.META_PIXEL_ID,
    region: 'edge',
    description: 'سوق الآن - فوري لحظي',
    access_token: process.env.META_CAPI_ACCESS_TOKEN,
  },
};

// =====================================================================
// دالة التشفير SHA256 للبيانات الحساسة
// =====================================================================
function hashUserData(value) {
  if (!value) return null;
  return crypto
    .createHash('sha256')
    .update(String(value).toLowerCase().trim())
    .digest('hex');
}

// =====================================================================
// دالة بناء Payload CAPI الكامل
// =====================================================================
function buildCAPIPayload(event) {
  const {
    market = 'metals',
    event_name,
    event_id,
    event_time = Math.floor(Date.now() / 1000),
    user_email,
    user_phone,
    user_first_name,
    user_last_name,
    user_city,
    user_state,
    user_zip,
    client_user_agent,
    client_ip_address,
    currency = 'SAR',
    value,
    custom_data = {},
    fbp, // Facebook Pixel ID
    fbc, // Facebook Click ID
  } = event;

  const market_config = SHEIKHA_MARKETS[market];
  if (!market_config) {
    throw new Error(`Market "${market}" not found in SHEIKHA_MARKETS`);
  }

  // بناء User Data مع Hashing
  const user_data = {
    em: hashUserData(user_email),
    ph: hashUserData(user_phone),
    fn: hashUserData(user_first_name),
    ln: hashUserData(user_last_name),
    ct: hashUserData(user_city),
    st: hashUserData(user_state),
    zp: hashUserData(user_zip),
    external_id: user_email ? hashUserData(user_email) : null,
    fbp: fbp || null,
    fbc: fbc || null,
    client_user_agent: client_user_agent,
    client_ip_address: client_ip_address,
  };

  // حذف القيم الفارغة
  Object.keys(user_data).forEach(
    (key) => user_data[key] === null && delete user_data[key]
  );

  // بناء Custom Data
  const capi_custom_data = {
    currency: currency,
    value: value,
    market_segment: market,
    market_description: market_config.description,
    timestamp: new Date().toISOString(),
    ...custom_data,
  };

  return {
    data: [
      {
        event_name: event_name,
        event_time: event_time,
        event_id: event_id, // مهم جداً: يطابق البيكسل عشان Deduplication
        action_source: 'website',
        event_source_url:
          event.event_source_url || config.SHEIKHA_BASE_URL,
        user_data: user_data,
        custom_data: capi_custom_data,
        event_deduplication_id: event_id,
      },
    ],
    access_token: market_config.access_token,
    pixel_id: market_config.pixel_id,
  };
}

// =====================================================================
// دالة الإرسال لـ Meta CAPI
// =====================================================================
async function sendToCAPI(event) {
  try {
    const market = event.market || 'metals';
    const market_config = SHEIKHA_MARKETS[market];

    if (!market_config.access_token || market_config.access_token === 'YOUR_META_CAPI_ACCESS_TOKEN') {
      console.warn(
        `[META-CAPI-WARN] Access Token ناقص للسوق "${market}". حط التوكن في .env`
      );
      return {
        success: false,
        error: 'META_CAPI_ACCESS_TOKEN_NOT_SET',
        market: market,
      };
    }

    const payload = buildCAPIPayload(event);

    const url = `https://graph.facebook.com/v20.0/${payload.pixel_id}/events`;
    const params = {
      access_token: payload.access_token,
    };

    console.log(`[CAPI] إرسال حدث "${event.event_name}" للسوق "${market}"...`);
    console.log(`[CAPI-PAYLOAD]`, JSON.stringify(payload.data, null, 2));

    const response = await axios.post(url, payload.data[0], { params });

    return {
      success: true,
      market: market,
      event_name: event.event_name,
      event_id: event.event_id,
      pixel_id: payload.pixel_id,
      response: response.data,
    };
  } catch (error) {
    console.error(
      `[CAPI-ERROR] فشل الإرسال:`,
      error.response?.data || error.message
    );
    return {
      success: false,
      error: error.response?.data || error.message,
      market: event.market,
    };
  }
}

// =====================================================================
// دالة Deduplication: التحقق من عدم التكرار
// =====================================================================
async function checkDuplication(event_id) {
  // هذا الحقل يتم حفظه في DB إذا كنت بتحتاجه
  // لكن ميتا تعالج Deduplication تلقائياً لو event_id متطابق
  return {
    event_id: event_id,
    is_duplicate: false,
    checked_at: new Date().toISOString(),
  };
}

// =====================================================================
// دالة Event Tracking الشاملة
// =====================================================================
async function trackEvent(market, event_name, user_data, custom_data = {}) {
  const event_id = `sheikha-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const payload = {
    market: market,
    event_name: event_name,
    event_id: event_id,
    ...user_data,
    custom_data: custom_data,
  };

  const result = await sendToCAPI(payload);

  return {
    event_id: event_id,
    market: market,
    event_name: event_name,
    capi_result: result,
    timestamp: new Date().toISOString(),
  };
}

// =====================================================================
// الأحداث المخصصة لكل سوق
// =====================================================================
const SHEIKHA_CUSTOM_EVENTS = {
  metals: {
    ViewContent: 'عرض معدن',
    AddToCart: 'إضافة لـ السلة',
    InitiateCheckout: 'بدء الدفع',
    Purchase: 'شراء كيلو/طن',
    Lead: 'استفسار B2B',
  },
  scrap: {
    ViewContent: 'عرض خردة',
    SubmitApplication: 'تقديم عرض سعر',
    Lead: 'استفسار حمولة',
    Purchase: 'إتمام صفقة',
  },
  precious: {
    ViewContent: 'عرض سبيكة',
    Contact: 'طلب تواصل VIP',
    Schedule: 'حجز استشارة',
    Purchase: 'شراء سبائك',
  },
  rare: {
    ViewContent: 'عرض معادن نادرة',
    RequestQuote: 'طلب عرض سعر NDA',
    Contact: 'تواصل حكومي',
    Lead: 'عميل G20',
  },
  now: {
    ViewContent: 'عرض عرض فلاش',
    AddToCart: 'إضافة لـ السلة الفورية',
    InitiateCheckout: 'بدء الدفع الفوري',
    Purchase: 'شراء فوري',
  },
};

// =====================================================================
// Export للاستخدام في الـ Routes
// =====================================================================
module.exports = {
  SHEIKHA_MARKETS,
  SHEIKHA_CUSTOM_EVENTS,
  buildCAPIPayload,
  sendToCAPI,
  trackEvent,
  checkDuplication,
  hashUserData,
};
