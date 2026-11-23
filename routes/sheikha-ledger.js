const express = require('express');
const router = express.Router();
router.get('/ledger', (req, res) => {
    res.json({
        status: 'ACTIVE_BOUND',
        owner: 'Sheikha',
        seal: 'BOUND_BY_QURAN_SUNNAH',
        msg: 'Centralized and decentralized ledger active without log exceptions'
    });
});
module.exports = router;
