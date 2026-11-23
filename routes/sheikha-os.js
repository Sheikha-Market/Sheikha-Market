const express = require('express');
const router = express.Router();

router.get('/os', (req, res) => {
    res.json({ status: 'SHEIKHA_OS_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
