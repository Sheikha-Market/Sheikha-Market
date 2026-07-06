const express = require('express');
const router = express.Router();

const {
  getSelfDevelopmentStatus,
  createImprovementProposal
} = require('../../lib/self-development/self-development-kernel');

router.get('/status', (_req, res) => {
  return res.json(getSelfDevelopmentStatus());
});

router.post('/propose', express.json(), (req, res) => {
  const proposal = createImprovementProposal({
    title: req.body?.title || 'Untitled improvement',
    target: req.body?.target || 'runtime',
    reason: req.body?.reason || 'continuous improvement',
    tests: req.body?.tests
  });

  return res.json({
    success: true,
    proposal,
    message: 'Improvement proposal created. No code was changed without approval.'
  });
});

module.exports = router;
