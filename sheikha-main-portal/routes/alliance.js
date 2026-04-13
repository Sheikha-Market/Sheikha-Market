/**
 * بسم الله الرحمن الرحيم
 * =============================================================================
 * مسارات API — محرك التحالف العالمي الشامل ومنظومة الشبكة الاقتصادية
 * /api/alliance/* و /api/power-network/*
 * =============================================================================
 */
'use strict';

const express = require('express');
const router  = express.Router();

let _alliance = null;
let _network  = null;

function alliance() {
    if (!_alliance) {
        const E = require('../lib/sheikha-global-alliance-engine.js');
        _alliance = new E();
        console.log('✅ [ALLIANCE] محرك التحالف العالمي — مُفعَّل');
    }
    return _alliance;
}

function network() {
    if (!_network) {
        const E = require('../lib/sheikha-integrated-power-network.js');
        _network = new E();
        console.log('✅ [POWER-NETWORK] منظومة الشبكة الاقتصادية — مُفعَّلة');
    }
    return _network;
}

/* ── Alliance Engine routes ─────────────────────────────────── */
router.get('/dashboard',         (req, res) => res.json({ success:true, ...alliance().getDashboard() }));
router.get('/status',            (req, res) => res.json({ success:true, ...alliance().getStatus() }));
router.get('/full-report',       (req, res) => res.json({ success:true, ...alliance().getFullReport() }));
router.get('/leader',            (req, res) => res.json({ success:true, ...alliance().getLeaderProfile() }));
router.get('/manifesto',         (req, res) => res.json({ success:true, ...alliance().getAllianceManifesto() }));
router.get('/reach-channels',    (req, res) => res.json({ success:true, ...alliance().getReachChannels() }));
router.get('/digital-armory',    (req, res) => res.json({ success:true, ...alliance().getDigitalArmory() }));
router.get('/non-digital',       (req, res) => res.json({ success:true, ...alliance().getNonDigitalArmory() }));
router.get('/nation-networks',   (req, res) => res.json({ success:true, ...alliance().getNationNetworks() }));
router.get('/trader-networks',   (req, res) => res.json({ success:true, ...alliance().getTraderNetworks() }));
router.get('/army-coordination', (req, res) => res.json({ success:true, ...alliance().getArmyCoordination() }));
router.get('/victory-strategies',(req, res) => res.json({ success:true, ...alliance().getVictoryStrategies() }));
router.get('/covenant',          (req, res) => res.json({ success:true, ...alliance().getCovenantSystem() }));

/* ── Power Network routes ────────────────────────────────────── */
router.get('/network/dashboard',  (req, res) => res.json({ success:true, ...network().getDashboard() }));
router.get('/network/status',     (req, res) => res.json({ success:true, ...network().getStatus() }));
router.get('/network/full-report',(req, res) => res.json({ success:true, ...network().getFullReport() }));
router.get('/network/tech',       (req, res) => res.json({ success:true, ...network().getTechPower() }));
router.get('/network/science',    (req, res) => res.json({ success:true, ...network().getSciencePower() }));
router.get('/network/social',     (req, res) => res.json({ success:true, ...network().getSocialPower() }));
router.get('/network/culture',    (req, res) => res.json({ success:true, ...network().getCulturePower() }));
router.get('/network/education',  (req, res) => res.json({ success:true, ...network().getEducationPower() }));
router.get('/network/trade',      (req, res) => res.json({ success:true, ...network().getTradeNetwork() }));
router.get('/network/economic',   (req, res) => res.json({ success:true, ...network().getEconomicEngine() }));
router.get('/network/gold-silver',(req, res) => res.json({ success:true, ...network().getGoldSilver() }));
router.get('/network/kpis',       (req, res) => res.json({ success:true, ...network().getNetworkKPIs() }));

module.exports = router;
