const express = require('express');
const router = express.Router();
const fiqhContracts = require('../lib/sheikha-fiqh-contracts-engine');

router.post('/create', async (req, res) => {
    const { type } = req.body;
    const fiqhCheck = fiqhContracts.evaluate(type, req.body);
    if (!fiqhCheck.allowed) {
        return res.status(403).json({
            error: 'FIQH_BLOCK',
            details: fiqhCheck
        });
    }
    res.json({
        success: true,
        contract: fiqhCheck,
        message: 'صفقة شرعية تم قبولها'
    });
});

module.exports = router;
