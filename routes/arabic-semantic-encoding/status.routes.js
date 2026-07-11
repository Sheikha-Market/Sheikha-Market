'use strict';

const express = require('express');
const encoding = require('../../core/language/sheikha-arabic/encoding/sheikha-arabic-semantic-encoding-v1');

const router = express.Router();

function errorStatus(value) {
  if (['PAYLOAD_TOO_LARGE', 'METADATA_TOO_LARGE', 'FRAME_LIMIT_EXCEEDED'].includes(value.code)) {
    return 413;
  }
  if (['BIDI_CONTROLS_REVIEW_REQUIRED', 'RELIGIOUS_SOURCE_REQUIRES_PRESERVE'].includes(value.code)) {
    return 422;
  }
  return 400;
}

function sendError(res, value) {
  return res.status(errorStatus(value)).json({
    success: false,
    error: value.code || 'ARABIC_SEMANTIC_ENCODING_ERROR',
    message: value.message
  });
}

router.get('/status', (_req, res) => {
  res.json({ success: true, result: encoding.status() });
});

router.get('/specification', (_req, res) => {
  res.json({ success: true, result: encoding.specification });
});

router.post('/analyze', (req, res) => {
  try {
    res.json({ success: true, result: encoding.analyzeText(req.body?.text) });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/explain', (req, res) => {
  try {
    res.json({ success: true, result: encoding.explainEncoding(req.body || {}) });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/improvement-plan', (req, res) => {
  try {
    res.json({ success: true, result: encoding.proposeImprovement(req.body || {}) });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/encode', (req, res) => {
  try {
    res.json({ success: true, result: encoding.encodeMessage(req.body || {}) });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/decode', (req, res) => {
  try {
    res.json({
      success: true,
      result: encoding.decodeFrame(req.body?.frameBase64Url || req.body?.frameBase64)
    });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/segment', (req, res) => {
  try {
    res.json({
      success: true,
      result: encoding.segmentFrame(
        req.body?.frameBase64Url || req.body?.frameBase64,
        {
          maxSegmentBytes: req.body?.maxSegmentBytes
        }
      )
    });
  } catch (value) {
    sendError(res, value);
  }
});

router.post('/reassemble', (req, res) => {
  try {
    res.json({
      success: true,
      result: encoding.reassembleSegments(req.body?.segments)
    });
  } catch (value) {
    sendError(res, value);
  }
});

module.exports = router;
