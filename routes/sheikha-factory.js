const express = require('express');
const router = express.Router();

router.get('/factory', (req, res) => {
    res.json({ status: 'SHEIKHA_FACTORY_ACTIVE', seal: 'BOUND_BY_QURAN_SUNNAH' });
});

module.exports = router;
