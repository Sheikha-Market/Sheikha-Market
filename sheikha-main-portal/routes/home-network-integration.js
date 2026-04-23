/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  ⛔ SHEIKHA HOME NETWORK INTEGRATION BRIDGE — PERMANENTLY DISABLED           ║
 * ║  جسر التكامل — مُعطَّل نهائياً بقرار المالكة                               ║
 * ║                                                                              ║
 * ║  السبب: حماية خصوصية شيخة وأسرتها                                          ║
 * ║  القاعدة: شبكة المنزل لا تُدمج مع السوق أو المنظومة                        ║
 * ║                                                                              ║
 * ║  «وَلَا تَجَسَّسُوا وَلَا يَغْتَب بَّعْضُكُم بَعْضًا» — الحجرات: 12        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const express = require('express');
const router  = express.Router();
const { addAuditEntry } = require('../middleware/home-privacy-wall');

// ══════════════════════════════════════════════════════════════════════════════
// ⛔ هذا الجسر مُعطَّل نهائياً — يُرجع 410 Gone لأي طلب
// ══════════════════════════════════════════════════════════════════════════════
router.all('*', (req, res) => {
    addAuditEntry('HOME_INTEGRATION_BLOCKED', req, {
        reason: 'integration_bridge_permanently_disabled',
    });
    return res.status(410).json({
        success: false,
        code:    'HOME_INTEGRATION_DISABLED',
        messageAr: '⛔ جسر التكامل مُعطَّل نهائياً بقرار المالكة. شبكة المنزل معزولة عن السوق.',
        messageEn: 'Home integration bridge is permanently disabled by owner decision. Home network is isolated from the market.',
        alternative: 'للوصول للشبكة الخاصة: GET /api/sheikha/private-home/status (يتطلب X-Sheikha-Home-Key)',
        _privacy: 'Sheikha Privacy Wall v1.0',
    });
});

module.exports = router;
