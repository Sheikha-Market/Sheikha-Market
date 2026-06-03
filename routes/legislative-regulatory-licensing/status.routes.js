const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadProject() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/legislative-regulatory-licensing/sheikha-legislative-regulatory-licensing.json'),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadProject(),
    timestamp: new Date().toISOString()
  });
});

router.get('/legislation', (_req, res) => res.json({ success: true, legislation: loadProject().domains.legislation }));
router.get('/regulation', (_req, res) => res.json({ success: true, regulation: loadProject().domains.regulation }));
router.get('/licensing', (_req, res) => res.json({ success: true, licensing: loadProject().domains.licensing }));
router.get('/permits', (_req, res) => res.json({ success: true, permits: loadProject().domains.permits }));
router.get('/compliance', (_req, res) => res.json({ success: true, compliance: loadProject().domains.compliance }));

module.exports = router;
