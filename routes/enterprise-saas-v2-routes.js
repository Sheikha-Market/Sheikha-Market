'use strict';

const express = require('express');
const subscriptions = require('../runtime/saas/subscriptions/subscription-manager');
const tenancy = require('../runtime/tenancy/tenant-isolation');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');

const router = express.Router();

router.get('/api/subscriptions/status', (req, res) => {
  res.json({ success: true, data: subscriptions.status() });
});

router.get('/api/subscriptions/licenses', (req, res) => {
  res.json({ success: true, data: subscriptions.listLicenses() });
});

router.get('/api/subscriptions/seats', (req, res) => {
  res.json({ success: true, data: subscriptions.listSeats() });
});

router.get('/api/subscriptions/usage', (req, res) => {
  res.json({ success: true, data: subscriptions.usageStatus() });
});

router.get('/api/tenancy/status', (req, res) => {
  res.json({ success: true, data: tenancy.status() });
});

router.get('/api/tenancy/organizations', (req, res) => {
  res.json({ success: true, data: tenancy.organizations() });
});

router.get('/api/tenancy/workspaces', (req, res) => {
  res.json({ success: true, data: tenancy.workspaces() });
});

router.get('/api/security/api-keys/status', (req, res) => {
  res.json({ success: true, data: apiKeys.status() });
});

router.get('/api/security/api-keys', (req, res) => {
  res.json({ success: true, data: apiKeys.registry() });
});

module.exports = router;
