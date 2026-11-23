const express = require('express');
const router = express.Router();

router.get('/foundry', (req, res) => {
    res.json({ status: 'SHEIKHA_FOUNDRY_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
