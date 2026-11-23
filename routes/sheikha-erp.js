const express = require('express');
const router = express.Router();

router.get('/erp', (req, res) => {
    res.json({ status: 'SHEIKHA_ERP_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
