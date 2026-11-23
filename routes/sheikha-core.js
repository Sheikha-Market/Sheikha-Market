const express = require('express');
const router = express.Router();

router.get('/core', (req, res) => {
    res.json({ status: 'SHEIKHA_NATIVE_CORE_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
