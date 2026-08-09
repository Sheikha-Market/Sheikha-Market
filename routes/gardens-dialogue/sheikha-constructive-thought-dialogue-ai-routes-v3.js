'use strict';

const express = require('express');

const {
  buildIntegrationStatus,
  buildThoughtDialogueMatrix,
  generateConstructiveDialogue,
  listAudienceContexts
} = require(
  '../../core/gardens-dialogue/' +
    'sheikha-constructive-thought-dialogue-ai-v3'
);

function createRouter(options = {}) {
  const router = express.Router();

  router.use(express.json({
    limit: '32kb',
    strict: true,
    type: 'application/json'
  }));

  router.get('/status', (_req, res) => {
    try {
      const data = buildIntegrationStatus();
      res.set('Cache-Control', 'no-store');
      return res.status(data.passed ? 200 : 503).json({
        ok: data.passed,
        data
      });
    } catch (error) {
      return res.status(503).json({
        ok: false,
        error: 'THOUGHT_DIALOGUE_STATUS_UNAVAILABLE',
        message: error.message
      });
    }
  });

  router.get('/audiences', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    return res.json({
      ok: true,
      data: listAudienceContexts()
    });
  });

  router.get('/frameworks/matrix', (_req, res) => {
    try {
      res.set('Cache-Control', 'no-store');
      return res.json({
        ok: true,
        data: buildThoughtDialogueMatrix()
      });
    } catch (error) {
      return res.status(503).json({
        ok: false,
        error: 'THOUGHT_DIALOGUE_MATRIX_UNAVAILABLE',
        message: error.message
      });
    }
  });

  router.post('/respond', async (req, res) => {
    try {
      const data = await generateConstructiveDialogue(
        req.body || {},
        options
      );
      const denied = data.status === 'SAFE_REDIRECTION_REQUIRED';
      res.set('Cache-Control', 'no-store');
      return res.status(denied ? 422 : 200).json({
        ok: !denied,
        data
      });
    } catch (error) {
      const invalidInput = [
        'UNKNOWN_THOUGHT_FRAMEWORK',
        'INVALID_AUDIENCE_CONTEXT'
      ].includes(error.code);
      return res.status(invalidInput ? 400 : 503).json({
        ok: false,
        error: invalidInput
          ? error.code
          : 'AI_CONSTRUCTIVE_DIALOGUE_UNAVAILABLE',
        message: error.message
      });
    }
  });

  return router;
}

const router = createRouter();
router.createRouter = createRouter;

module.exports = router;
