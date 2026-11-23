const express = require('express');
const router = express.Router();
router.get('/arvr', (req, res) => {
    res.json({ status: 'SHEIKHA_NATIVE_ARVR_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});
module.exports = router;
