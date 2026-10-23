'use strict';
const { listSupplierLab, LIMITS } = require('../../core/ownership/sheikha-supplier-lab-v1.cjs');

function attachSupplierLab(app, token) {
  for (const collection of ['suppliers', 'materials', 'documents']) {
    app.get(`/api/${collection}`, (req, res) => {
      if (req.headers['x-sheikha-session'] !== token) return res.status(403).json({ error: 'SESSION_REQUIRED' });
      try {
        const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?') + 1) : '';
        if (Buffer.byteLength(query) > LIMITS.queryBytes) throw Error('SUPPLIER_LAB_INPUT_REJECTED');
        res.json(listSupplierLab(collection, new URLSearchParams(query)));
      } catch (error) {
        if (error.message === 'SUPPLIER_LAB_INPUT_REJECTED') return res.status(400).json({ error: 'SUPPLIER_LAB_INPUT_REJECTED' });
        res.status(503).json({ error: 'SUPPLIER_LAB_UNAVAILABLE' });
      }
    });
  }
}

module.exports = { attachSupplierLab };
