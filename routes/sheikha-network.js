const express = require('express');
const router = express.Router();

router.get('/network', (req, res) => {
    res.json({ status: 'SHEIKHA_NATIVE_NETWORK_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
