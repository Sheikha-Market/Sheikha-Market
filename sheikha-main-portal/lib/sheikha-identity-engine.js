/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏷️ sheikha-identity-engine.js — محرك الهوية الموحدة
 *  إدارة هوية شيخة البصرية والرقمية والمرجعية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const IDENTITY = {
    name:       'شيخة',
    nameEn:     'SHEIKHA',
    tagline:    'السوق الذكي المتكامل للتجارة والتحليل والربط',
    taglineEn:  'The Intelligent Integrated Trading Platform',
    reference:  'الكتاب والسنة وسنة الخلفاء الراشدين',
    colors: {
        gold:       '#D4AF37',
        gold2:      '#b8942f',
        gold3:      '#f5d97e',
        background: '#050810',
        bg2:        '#0a0f1a',
        text:       '#f1f5f9'
    },
    fonts:      ['Tajawal', 'Amiri'],
    values:     ['العدل', 'الأمانة', 'الشفافية', 'الإتقان', 'التقوى'],
    layers: {
        1: 'طبقة الهوية',
        2: 'طبقة التجربة',
        3: 'طبقة الإجراءات',
        4: 'طبقة الذكاء التشغيلي',
        5: 'طبقة الحوكمة'
    },
    symbols:    { scale: '⚖️', circle: '◎', network: '🔗', market: '🏪' },
    basmalah:   'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    verse:      '"وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا"',
    website:    'https://sheikha.top',
    version:    '2.4.1'
};

function getIdentity()          { return IDENTITY; }
function getColors()            { return IDENTITY.colors; }
function getValues()            { return IDENTITY.values; }
function getLayers()            { return IDENTITY.layers; }
function getBrandAssets()       { return { logo: '/icons/icon.svg', colors: IDENTITY.colors, fonts: IDENTITY.fonts }; }

module.exports = { getIdentity, getColors, getValues, getLayers, getBrandAssets, IDENTITY };
console.log('✅ [IDENTITY-ENGINE] محرك الهوية الموحدة — جاهز');
