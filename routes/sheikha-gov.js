const express = require('express');
const router = express.Router();

router.get('/gov', (req, res) => {
    res.json({ status: 'SHEIKHA_SOVEREIGN_GOV_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
