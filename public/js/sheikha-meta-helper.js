/**
 * مساعد وسوم Meta — شيخة
 * يتحقق من وجود وسوم Meta الأساسية ويُبلغ عن النقص
 * استدعاء: sheikhaMetaCheck() بعد تحميل الصفحة
 */
(function () {
    'use strict';
    const BASE = 'https://sheikha.top';
    const REQUIRED = ['description', 'viewport', 'og:title', 'og:image', 'twitter:card'];
    window.sheikhaMetaCheck = function () {
        const missing = [];
        const desc = document.querySelector('meta[name="description"]');
        const viewport = document.querySelector('meta[name="viewport"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const twCard = document.querySelector('meta[name="twitter:card"]');
        if (!desc || !desc.content) missing.push('description');
        if (!viewport) missing.push('viewport');
        if (!ogTitle || !ogTitle.content) missing.push('og:title');
        if (!ogImage || !ogImage.content) missing.push('og:image');
        if (!twCard) missing.push('twitter:card');
        if (missing.length && window.location.hostname.includes('sheikha')) {
            console.warn('[شيخة Meta] وسوم ناقصة:', missing.join(', '));
        }
        return { ok: missing.length === 0, missing };
    };
    document.addEventListener('DOMContentLoaded', function () {
        if (typeof window.sheikhaMetaCheck === 'function') window.sheikhaMetaCheck();
    });
})();
