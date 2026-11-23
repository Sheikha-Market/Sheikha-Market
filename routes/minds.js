const express = require('express');
const router = express.Router();

// غلاف حماية لمسار العقول السيادية
router.get('/', (req, res) => {
    res.json({
        status: "ACTIVE",
        domain: "Sheikha Minds Governance",
        authenticated: !!req.headers.authorization,
        timestamp: Date.now()
    });
});

module.exports = router;
