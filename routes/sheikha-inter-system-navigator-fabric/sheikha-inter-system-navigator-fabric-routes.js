'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  navigatorPlan
} = require('../../runtime/sheikha-inter-system-navigator-fabric/v112/sheikha-inter-system-navigator-fabric-v112');

router.get('/api/sheikha/inter-system-navigator-fabric/v112/status',
(_req,res)=>res.json(status()));

router.get('/api/sheikha/inter-system-navigator-fabric/v112/demo',
(_req,res)=>res.json(navigatorPlan()));

router.post('/api/sheikha/inter-system-navigator-fabric/v112/plan',
(req,res)=>res.json(navigatorPlan(req.body||{})));

module.exports = router;
