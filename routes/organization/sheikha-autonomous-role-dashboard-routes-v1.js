'use strict';

const express = require('express');
const fabric = require(
  '../../core/organization/sheikha-autonomous-role-dashboard-fabric-v1'
);

const router = express.Router();

router.use(express.json({ limit: '32kb', strict: true }));

function send(res, operation, successStatus = 200) {
  try {
    res.status(successStatus).json({ success: true, data: operation() });
  } catch (error) {
    const knownInputError = [
      'UNKNOWN_ORGANIZATION_ROLE',
      'TASK_NOT_ALLOWED_FOR_ROLE'
    ].includes(error.code);
    res.status(knownInputError ? 400 : 500).json({
      success: false,
      error: knownInputError ? error.code : 'ORGANIZATION_CONTROL_ERROR',
      message: error.message
    });
  }
}

router.get('/status', (_req, res) => {
  send(res, () => fabric.status());
});

router.get('/roles', (_req, res) => {
  send(res, () => fabric.listRoles());
});

router.get('/operating-model', (req, res) => {
  send(res, () => fabric.buildOperatingModel({
    humanOperators: req.query.humanOperators
  }));
});

router.get('/dashboards/:roleId', (req, res) => {
  send(res, () => fabric.designDashboard({
    roleId: req.params.roleId,
    assignmentMode: req.query.assignment
  }));
});

router.post('/tasks/plan', (req, res) => {
  send(res, () => fabric.planTask(req.body || {}), 202);
});

router.post('/positions/preview', (req, res) => {
  send(res, () => fabric.previewPosition(req.body || {}), 202);
});

module.exports = router;
