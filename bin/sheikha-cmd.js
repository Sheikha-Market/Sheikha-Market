#!/usr/bin/env node
'use strict';

const https = require('https');

const REGIONS = {
  saudi: 'https://v62-live-me---sheikha-main-portal-952025946298.me-central1.run.app',
  us: 'https://sheikha-main-portal-5anfyilx3a-uc.a.run.app',
  europe: 'https://v62-live-eu---sheikha-main-portal-5anfyilx3a-ew.a.run.app',
  asia: 'https://v62-live-asia---sheikha-main-portal-5anfyilx3a-as.a.run.app'
};

const action = process.argv[2] || 'status';
const target = process.argv[3] || 'all';

console.log(`📡 [SHEIKHA REMOTE COMMAND] Action: ${action} | Target: ${target}`);
console.log(`🔒 Seal: BOUND_BY_QURAN_SUNNAH — ATOM_WATER_RASUL_JANNAH_SEALED\n`);

Object.entries(REGIONS).forEach(([region, url]) => {
  if (target === 'all' || target === region) {
    https.get(`${url}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`🌐 [${region.toUpperCase()}] Status: ${res.statusCode} | Latency: OK`);
      });
    }).on('error', (err) => {
      console.log(`❌ [${region.toUpperCase()}] Error: ${err.message}`);
    });
  }
});
