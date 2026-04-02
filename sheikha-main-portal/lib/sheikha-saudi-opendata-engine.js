'use strict';
/**
 * sheikha-saudi-opendata-engine.js
 * محرك البيانات الحكومية السعودية المفتوحة
 *
 * يتكامل مع:
 * 1. open.data.gov.sa  — بوابة البيانات المفتوحة (CKAN)
 * 2. api.zatca.gov.sa  — هيئة الزكاة والضريبة والجمارك
 * 3. mc.gov.sa         — وزارة التجارة (السجلات التجارية)
 * 4. monshaat.gov.sa   — المنشآت الصغيرة والمتوسطة
 * 5. sama.gov.sa       — مؤشرات البنك المركزي
 */

const GOV_CONFIG = {
    openData: {
        baseUrl: process.env.SAUDI_OPEN_DATA_URL || 'https://open.data.gov.sa/api/action',
        apiKey:  process.env.SAUDI_OPEN_DATA_KEY || null,
    },
    zatca: {
        baseUrl: process.env.ZATCA_API_URL || 'https://api.zatca.gov.sa/v1',
        apiKey:  process.env.ZATCA_API_KEY || null,
    },
    mc: {
        baseUrl: process.env.MC_API_URL || 'https://api.mc.gov.sa/v1',
        apiKey:  process.env.MC_API_KEY || null,
    },
    sama: {
        baseUrl: process.env.SAMA_API_URL || 'https://api.sama.gov.sa/v1',
        apiKey:  process.env.SAMA_API_KEY || null,
    },
    monshaat: {
        baseUrl: process.env.MONSHAAT_API_URL || 'https://api.monshaat.gov.sa/v1',
        apiKey:  process.env.MONSHAAT_API_KEY || null,
    }
};

function isRealKey(val) {
    if (!val) return false;
    if (val.startsWith('CHANGE_ME') || val.startsWith('REPLACE_WITH') || val === 'YOUR_KEY') return false;
    return val.length > 8;
}

async function safeGet(url, headers, timeoutMs) {
    headers   = headers   || {};
    timeoutMs = timeoutMs || 8000;
    const controller = new AbortController();
    const timer = setTimeout(function() { controller.abort(); }, timeoutMs);
    try {
        const resp = await fetch(url, {
            headers: Object.assign({ 'Accept': 'application/json' }, headers),
            signal: controller.signal,
        });
        clearTimeout(timer);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.json();
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}

async function searchOpenDatasets(query, rows) {
    query = query || '';
    rows  = rows  || 10;
    const cfg = GOV_CONFIG.openData;
    try {
        const url = cfg.baseUrl + '/package_search?q=' + encodeURIComponent(query) + '&rows=' + rows;
        const hdrs = isRealKey(cfg.apiKey) ? { 'Authorization': cfg.apiKey } : {};
        const data = await safeGet(url, hdrs);
        if (data && data.result) {
            return {
                success: true,
                total: data.result.count || 0,
                datasets: (data.result.results || []).map(function(d) {
                    return {
                        id:           d.id,
                        title:        d.title_arabic || d.title || d.name || '',
                        description:  d.notes_arabic || d.notes || '',
                        organization: (d.organization && d.organization.title) || '',
                        tags:         (d.tags || []).map(function(t) { return t.name; }),
                        updated:      d.metadata_modified || '',
                        url:          'https://open.data.gov.sa/datasets/' + d.name,
                    };
                })
            };
        }
        return { success: false, datasets: [] };
    } catch (err) {
        return { success: false, error: 'تعذّر الوصول لبوابة البيانات المفتوحة', datasets: [] };
    }
}

async function getMetalsGovData() {
    const result = await searchOpenDatasets('معادن scrap metal', 20);
    if (!result.success || result.datasets.length === 0) {
        return {
            success: true,
            source: 'indicative',
            data: [
                { category: 'حديد وصلب',         unit: 'طن', avgPrice: 1850, currency: 'SAR', region: 'المنطقة الشرقية' },
                { category: 'نحاس',               unit: 'كغ', avgPrice: 38,   currency: 'SAR', region: 'الرياض' },
                { category: 'ألمنيوم',            unit: 'كغ', avgPrice: 14,   currency: 'SAR', region: 'جدة' },
                { category: 'رصاص (بطاريات)',     unit: 'كغ', avgPrice: 3.5,  currency: 'SAR', region: 'الدمام' },
                { category: 'فولاذ مقاوم للصدأ',  unit: 'كغ', avgPrice: 18,   currency: 'SAR', region: 'الرياض' },
            ]
        };
    }
    return { success: true, source: 'open.data.gov.sa', datasets: result.datasets };
}

async function verifyCRNumber(crNumber) {
    if (!crNumber || !/^\d{10}$/.test(String(crNumber).trim())) {
        return { success: false, error: 'رقم السجل التجاري يجب أن يكون 10 أرقام' };
    }
    const cfg = GOV_CONFIG.mc;
    if (!isRealKey(cfg.apiKey)) {
        return {
            success: true,
            source: 'local_validation',
            crNumber: String(crNumber).trim(),
            status: 'غير محقق تلقائياً',
            url: 'https://mc.gov.sa/ar/checkestablishment',
            note: 'للتحقق التلقائي أضف MC_API_KEY في ملف .env',
        };
    }
    try {
        const url = cfg.baseUrl + '/cr/' + encodeURIComponent(crNumber);
        const data = await safeGet(url, { 'api-key': cfg.apiKey });
        return {
            success:    true,
            source:     'mc.gov.sa',
            crNumber:   crNumber,
            name:       data.name_ar || data.name || '',
            status:     data.status_ar || data.status || '',
            expiryDate: data.expiry_date || '',
            city:       data.city_ar || data.city || '',
        };
    } catch (err) {
        return { success: false, error: 'تعذّر التحقق من السجل التجاري' };
    }
}

async function getExchangeRates() {
    const cfg = GOV_CONFIG.sama;
    if (!isRealKey(cfg.apiKey)) {
        return {
            success: true,
            source: 'indicative',
            base: 'SAR',
            rates: {
                USD: 0.2667, EUR: 0.2450, GBP: 0.2100,
                AED: 0.9800, KWD: 0.0820, BHD: 0.1005,
                QAR: 0.9708, EGP: 8.5,    PKR: 74.0,
                INR: 22.3,   CNY: 1.935,
            },
            note: 'للأسعار الرسمية الحية أضف SAMA_API_KEY في .env',
            timestamp: new Date().toISOString(),
        };
    }
    try {
        const url = cfg.baseUrl + '/exchange-rates/latest?base=SAR';
        const data = await safeGet(url, { 'api-key': cfg.apiKey });
        return { success: true, source: 'sama.gov.sa', base: 'SAR', rates: data.rates || {}, timestamp: new Date().toISOString() };
    } catch (err) {
        return { success: false, error: 'تعذّر جلب أسعار الصرف من SAMA' };
    }
}

async function getMonshaatSectors() {
    const cfg = GOV_CONFIG.monshaat;
    if (!isRealKey(cfg.apiKey)) {
        return {
            success: true,
            source: 'indicative',
            sectors: [
                { id: 'mining',        nameAr: 'التعدين والمواد الخام',     support: true },
                { id: 'manufacturing', nameAr: 'التصنيع وإعادة التدوير',     support: true },
                { id: 'logistics',     nameAr: 'اللوجستيات وسلاسل التوريد', support: true },
                { id: 'trade',         nameAr: 'التجارة بالجملة والتجزئة',   support: true },
                { id: 'construction',  nameAr: 'البناء والتشييد',             support: true },
                { id: 'agriculture',   nameAr: 'الزراعة والثروة الحيوانية',   support: false },
            ],
            note: 'للبيانات الحية أضف MONSHAAT_API_KEY في .env',
        };
    }
    try {
        const url = cfg.baseUrl + '/sectors';
        const data = await safeGet(url, { 'api-key': cfg.apiKey });
        return { success: true, source: 'monshaat.gov.sa', sectors: data.sectors || [] };
    } catch (err) {
        return { success: false, error: 'تعذّر جلب بيانات المنشآت' };
    }
}

function getIntegrationStatus() {
    return {
        openData: { configured: isRealKey(GOV_CONFIG.openData.apiKey), url: 'https://open.data.gov.sa/',  name: 'بيانات مفتوحة' },
        zatca:    { configured: isRealKey(GOV_CONFIG.zatca.apiKey),    url: 'https://api.zatca.gov.sa/', name: 'الزكاة والضريبة' },
        mc:       { configured: isRealKey(GOV_CONFIG.mc.apiKey),       url: 'https://mc.gov.sa/',        name: 'وزارة التجارة' },
        sama:     { configured: isRealKey(GOV_CONFIG.sama.apiKey),     url: 'https://www.sama.gov.sa/',  name: 'البنك المركزي' },
        monshaat: { configured: isRealKey(GOV_CONFIG.monshaat.apiKey), url: 'https://monshaat.gov.sa/',  name: 'المنشآت' },
    };
}

module.exports = {
    searchOpenDatasets,
    getMetalsGovData,
    verifyCRNumber,
    getExchangeRates,
    getMonshaatSectors,
    getIntegrationStatus,
    GOV_CONFIG,
};
