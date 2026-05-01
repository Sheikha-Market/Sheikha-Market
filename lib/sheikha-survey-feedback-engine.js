'use strict';
const fs = require('fs');
const path = require('path');

class SheikhaStandardsSurveyEngine {
  constructor(bp) {
    this.basePath = bp || __dirname;
    this.dataDir = path.join(this.basePath, 'data');
    try { fs.mkdirSync(this.dataDir, { recursive: true }); } catch (_) {}
    this.nameAr = '\u0645\u062d\u0631\u0643 \u0634\u064a\u062e\u0629 \u0644\u0644\u0627\u0633\u062a\u0628\u064a\u0627\u0646\u0627\u062a';
    this.version = '1.0.0';
    this.owner = '\u0633\u0644\u0645\u0627\u0646 \u0623\u062d\u0645\u062f \u0628\u0646 \u0633\u0644\u0645\u0627\u0646 \u0627\u0644\u0631\u0627\u062c\u062d';
    this.activatedAt = new Date().toISOString();
    this._c = this._ld('survey-counters.json', { survey: 0, response: 0, report: 0, obs: 0, fix: 0, rca: 0 });
    this.surveys = this._ld('surveys-reg.json', []);
    this.responses = this._ld('responses.json', []);
    this.observations = this._ld('observations.json', []);
    this.reports = this._ld('reports-reg.json', []);
    this.fixes = this._ld('fixes.json', []);
    this.rcaRecords = this._ld('rca.json', []);
    this._init();
  }

  _init() {
    this._buildPrinciples();
    this._buildTemplates();
    this._buildChannels();
    this._buildAutoFix();
    this._buildRCA();
    this._buildItqan();
    this._buildReportTypes();
    this._startMonitor();
  }

  _buildPrinciples() {
    this.principles = [
      { id: 'P1', n: '\u0627\u0644\u0625\u062a\u0642\u0627\u0646', q: '\u0635\u064f\u0646\u0652\u0639\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0623\u064e\u062a\u0652\u0642\u064e\u0646\u064e \u0643\u064f\u0644\u0651\u064e \u0634\u064e\u064a\u0652\u0621\u064d', r: '\u0635\u0641\u0631 \u0623\u062e\u0637\u0627\u0621' },
      { id: 'P2', n: '\u0627\u0644\u0646\u0635\u064a\u062d\u0629', h: '\u0627\u0644\u062f\u064a\u0646 \u0627\u0644\u0646\u0635\u064a\u062d\u0629', r: '\u0643\u0644 \u0645\u0644\u0627\u062d\u0638\u0629 \u0646\u0635\u064a\u062d\u0629' },
      { id: 'P3', n: '\u0627\u0644\u0645\u0631\u0627\u0642\u0628\u0629', q: '\u0648\u064e\u0642\u064f\u0644\u0650 \u0627\u0639\u0652\u0645\u064e\u0644\u064f\u0648\u0627 \u0641\u064e\u0633\u064e\u064a\u064e\u0631\u064e\u0649 \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0639\u064e\u0645\u064e\u0644\u064e\u0643\u064f\u0645\u0652', r: '\u0645\u0631\u0627\u0642\u0628\u0629 100%' },
      { id: 'P4', n: '\u0627\u0644\u0625\u0635\u0644\u0627\u062d', q: '\u0644\u064e\u0627 \u064a\u064f\u063a\u064e\u064a\u0651\u0650\u0631\u064f \u0645\u064e\u0627 \u0628\u0650\u0642\u064e\u0648\u0652\u0645\u064d \u062d\u064e\u062a\u0651\u064e\u0649\u0670 \u064a\u064f\u063a\u064e\u064a\u0651\u0650\u0631\u064f\u0648\u0627', r: '\u0625\u0635\u0644\u0627\u062d \u0630\u0627\u062a\u064a' },
      { id: 'P5', n: '\u0627\u0644\u062a\u0648\u062b\u064a\u0642', q: '\u0641\u064e\u0627\u0643\u0652\u062a\u064f\u0628\u064f\u0648\u0647\u064f', r: '\u0631\u0642\u0645 \u062a\u0633\u0644\u0633\u0644\u064a \u0644\u0643\u0644 \u0634\u064a\u0621' },
      { id: 'P6', n: '\u0627\u0644\u0634\u0648\u0631\u0649', q: '\u0648\u064e\u0623\u064e\u0645\u0652\u0631\u064f\u0647\u064f\u0645\u0652 \u0634\u064f\u0648\u0631\u064e\u0649\u0670 \u0628\u064e\u064a\u0652\u0646\u064e\u0647\u064f\u0645\u0652', r: '\u0635\u0648\u062a \u0643\u0644 \u0645\u0633\u062a\u062e\u062f\u0645 \u0645\u0633\u0645\u0648\u0639' },
      { id: 'P7', n: '\u0627\u0644\u0645\u0628\u0627\u062f\u0631\u0629', h: '\u0628\u0627\u062f\u0631\u0648\u0627 \u0628\u0627\u0644\u0623\u0639\u0645\u0627\u0644', r: '\u062d\u0644 < 5 \u062f\u0642\u0627\u0626\u0642' },
      { id: 'P8', n: '\u0627\u0644\u062a\u062d\u0633\u064a\u0646', h: '\u0627\u0644\u0645\u0624\u0645\u0646 \u0627\u0644\u0642\u0648\u064a \u062e\u064a\u0631', r: '\u0643\u0644 \u064a\u0648\u0645 \u0623\u0641\u0636\u0644' }
    ];
  }

  _buildTemplates() {
    this.tpls = {};
    this.tpls.sys = { id: 'TPL-SYS', t: '\u0627\u0633\u062a\u0628\u064a\u0627\u0646 \u0623\u062f\u0627\u0621 \u0627\u0644\u0645\u0646\u0638\u0648\u0645\u0629', f: '\u064a\u0648\u0645\u064a', qs: [
      { id: 'QS1', t: '\u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629', tp: 'rating', sc: [1,2,3,4,5], au: true },
      { id: 'QS2', t: '\u0648\u0642\u062a \u0627\u0644\u062a\u062d\u0645\u064a\u0644', tp: 'metric', tg: '<2000ms', au: true },
      { id: 'QS3', t: '\u0646\u0633\u0628\u0629 \u0627\u0644\u062a\u0648\u0641\u0631', tp: 'metric', tg: '99.9%', au: true },
      { id: 'QS4', t: '\u0627\u0644\u0630\u0627\u0643\u0631\u0629', tp: 'metric', tg: '<512MB', au: true },
      { id: 'QS5', t: '\u0623\u062e\u0637\u0627\u0621/\u0633\u0627\u0639\u0629', tp: 'counter', tg: '0', au: true },
      { id: 'QS6', t: '\u0646\u062c\u0627\u062d \u0627\u0644\u0637\u0644\u0628\u0627\u062a', tp: 'metric', tg: '100%', au: true },
      { id: 'QS7', t: '\u0627\u0633\u062a\u062c\u0627\u0628\u0629 API', tp: 'metric', tg: '<500ms', au: true },
      { id: 'QS8', t: '\u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u062d\u0631\u0643\u0627\u062a', tp: 'status', au: true }
    ] };
    this.tpls.ux = { id: 'TPL-UX', t: '\u0627\u0633\u062a\u0628\u064a\u0627\u0646 \u062a\u062c\u0631\u0628\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645', f: '\u0628\u0639\u062f \u0643\u0644 \u062a\u0641\u0627\u0639\u0644', qs: [
      { id: 'QU1', t: '\u062a\u0642\u064a\u064a\u0645\u0643 \u0627\u0644\u0639\u0627\u0645', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QU2', t: '\u0648\u062c\u062f\u062a \u0645\u0627 \u062a\u0628\u062d\u062b \u0639\u0646\u0647\u061f', tp: 'yesno' },
      { id: 'QU3', t: '\u0633\u0631\u0639\u0629 \u0627\u0644\u0645\u0648\u0642\u0639', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QU4', t: '\u0648\u0627\u062c\u0647\u062a \u0645\u0634\u0643\u0644\u0629\u061f', tp: 'yesno_detail' },
      { id: 'QU5', t: '\u0648\u0636\u0648\u062d \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QU6', t: '\u0631\u0627\u062d\u0629 \u0627\u0644\u062a\u0635\u0645\u064a\u0645', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QU7', t: '\u062a\u0646\u0635\u062d \u063a\u064a\u0631\u0643 \u0628\u0634\u064a\u062e\u0629\u061f', tp: 'nps', sc: [0,1,2,3,4,5,6,7,8,9,10] },
      { id: 'QU8', t: '\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a', tp: 'text' },
      { id: 'QU9', t: '\u0627\u0644\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0634\u0631\u0639\u064a', tp: 'rating', sc: [1,2,3,4,5] }
    ] };
    this.tpls.own = { id: 'TPL-OWN', t: '\u0627\u0633\u062a\u0628\u064a\u0627\u0646 \u0631\u0636\u0627 \u0627\u0644\u0645\u0644\u0627\u0643', f: '\u0623\u0633\u0628\u0648\u0639\u064a', qs: [
      { id: 'QO1', t: '\u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u062a\u0642\u0646\u064a', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QO2', t: '\u062c\u0648\u062f\u0629 \u0627\u0644\u0645\u062d\u062a\u0648\u0649', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QO3', t: '\u062a\u062d\u0642\u064a\u0642 \u0627\u0644\u0623\u0647\u062f\u0627\u0641', tp: 'percentage' },
      { id: 'QO4', t: '\u062c\u0648\u062f\u0629 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QO5', t: '\u0627\u0644\u0627\u0644\u062a\u0632\u0627\u0645 \u0627\u0644\u0634\u0631\u0639\u064a', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QO6', t: '\u0645\u0644\u0627\u062d\u0638\u0627\u062a', tp: 'text' }
    ] };
    this.tpls.mer = { id: 'TPL-MER', t: '\u0627\u0633\u062a\u0628\u064a\u0627\u0646 \u0631\u0636\u0627 \u0627\u0644\u062a\u062c\u0627\u0631', f: '\u0634\u0647\u0631\u064a', qs: [
      { id: 'QM1', t: '\u0633\u0647\u0648\u0644\u0629 \u0627\u0644\u062a\u0633\u062c\u064a\u0644', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QM2', t: '\u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QM3', t: '\u0634\u0641\u0627\u0641\u064a\u0629 \u0627\u0644\u0623\u0633\u0639\u0627\u0631', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QM4', t: '\u062e\u062f\u0645\u0629 \u0627\u0644\u062f\u0639\u0645', tp: 'rating', sc: [1,2,3,4,5] },
      { id: 'QM5', t: '\u0627\u0642\u062a\u0631\u0627\u062d\u0627\u062a', tp: 'text' }
    ] };
    this.tpls.shr = { id: 'TPL-SHR', t: '\u0627\u0644\u062a\u062f\u0642\u064a\u0642 \u0627\u0644\u0634\u0631\u0639\u064a', f: '\u064a\u0648\u0645\u064a', qs: [
      { id: 'QR1', t: '\u062e\u0644\u0648 \u0645\u0646 \u0627\u0644\u0631\u0628\u0627', tp: 'audit', au: true },
      { id: 'QR2', t: '\u062e\u0644\u0648 \u0645\u0646 \u0627\u0644\u063a\u0631\u0631', tp: 'audit', au: true },
      { id: 'QR3', t: '\u062e\u0644\u0648 \u0645\u0646 \u0627\u0644\u063a\u0634', tp: 'audit', au: true },
      { id: 'QR4', t: '\u0627\u0644\u0639\u062f\u0644 \u0628\u0627\u0644\u0645\u064a\u0632\u0627\u0646', tp: 'audit', au: true },
      { id: 'QR5', t: '\u0627\u0644\u0648\u0641\u0627\u0621 \u0628\u0627\u0644\u0639\u0642\u0648\u062f', tp: 'audit', au: true },
      { id: 'QR6', t: '\u0639\u062f\u0645 \u0627\u0644\u0627\u062d\u062a\u0643\u0627\u0631', tp: 'audit', au: true },
      { id: 'QR7', t: '\u062e\u064a\u0627\u0631 \u0627\u0644\u0645\u062c\u0644\u0633', tp: 'audit', au: true },
      { id: 'QR8', t: '\u062e\u0644\u0648 \u0627\u0644\u0645\u062d\u062a\u0648\u0649', tp: 'audit', au: true }
    ] };
    this.tpls.tech = { id: 'TPL-TECH', t: '\u0627\u0644\u062a\u062f\u0642\u064a\u0642 \u0627\u0644\u062a\u0642\u0646\u064a', f: '\u0623\u0633\u0628\u0648\u0639\u064a', qs: [
      { id: 'QT1', t: '\u062a\u063a\u0637\u064a\u0629 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631\u0627\u062a', tp: 'metric', tg: '>80%' },
      { id: 'QT2', t: '\u062b\u063a\u0631\u0627\u062a \u0623\u0645\u0646\u064a\u0629', tp: 'counter', tg: '0' },
      { id: 'QT3', t: '\u0648\u0642\u062a \u0627\u0644\u0646\u0634\u0631', tp: 'metric', tg: '<5min' },
      { id: 'QT4', t: '\u062a\u0648\u0627\u0641\u0642\u064a\u0629', tp: 'metric', tg: '>95%' },
      { id: 'QT5', t: 'Lighthouse', tp: 'metric', tg: '>90' },
      { id: 'QT6', t: '\u062a\u0648\u0641\u0631 APIs', tp: 'metric', tg: '100%', au: true }
    ] };
    this.totalTpls = Object.keys(this.tpls).length;
    this.totalQs = Object.values(this.tpls).reduce((s, t) => s + t.qs.length, 0);
  }

  _buildChannels() {
    this.channels = [
      { id: 'CH1', n: '\u0627\u0633\u062a\u0628\u064a\u0627\u0646 \u0622\u0644\u064a', m: 'auto' },
      { id: 'CH2', n: '\u0645\u0631\u0627\u0642\u0628\u0629 \u0644\u062d\u0638\u064a\u0629', m: 'auto' },
      { id: 'CH3', n: '\u062a\u063a\u0630\u064a\u0629 \u0631\u0627\u062c\u0639\u0629', m: 'manual' },
      { id: 'CH4', n: '\u062a\u062d\u0644\u064a\u0644 \u0633\u0644\u0648\u0643', m: 'auto' },
      { id: 'CH5', n: 'NPS', m: 'scheduled' },
      { id: 'CH6', n: '\u062a\u0642\u0627\u0631\u064a\u0631 \u0623\u062e\u0637\u0627\u0621', m: 'auto' },
      { id: 'CH7', n: 'API', m: 'programmatic' },
      { id: 'CH8', n: '\u062a\u062d\u0644\u064a\u0644 \u0645\u062d\u0627\u062f\u062b\u0627\u062a', m: 'auto' },
      { id: 'CH9', n: '\u0645\u0642\u0627\u064a\u064a\u0633 \u062a\u062c\u0627\u0631\u064a\u0629', m: 'auto' },
      { id: 'CH10', n: '\u062a\u062f\u0642\u064a\u0642 \u0634\u0631\u0639\u064a', m: 'auto' }
    ];
  }

  _buildAutoFix() {
    this.afCats = [
      { id: 'AF1', c: '\u0623\u062f\u0627\u0621', qk: '\u062a\u0646\u0638\u064a\u0641 \u0643\u0627\u0634', pm: '\u062a\u062d\u0633\u064a\u0646 \u0643\u0648\u062f+CDN', au: true, sv: 'medium' },
      { id: 'AF2', c: '\u062e\u0637\u0623 API', qk: '\u0625\u0639\u0627\u062f\u0629 \u0645\u062d\u0627\u0648\u0644\u0629', pm: '\u0625\u0635\u0644\u0627\u062d+\u0627\u062e\u062a\u0628\u0627\u0631', au: true, sv: 'high' },
      { id: 'AF3', c: '\u0635\u0641\u062d\u0629 \u0645\u0639\u0637\u0644\u0629', qk: '\u062a\u0648\u062c\u064a\u0647 \u0628\u062f\u064a\u0644', pm: '\u0625\u0635\u0644\u0627\u062d+\u0646\u0634\u0631', au: true, sv: 'critical' },
      { id: 'AF4', c: '\u0628\u064a\u0627\u0646\u0627\u062a', qk: '\u0625\u064a\u0642\u0627\u0641 \u0639\u0631\u0636', pm: '\u062a\u0635\u062d\u064a\u062d \u0645\u0635\u062f\u0631', au: true, sv: 'high' },
      { id: 'AF5', c: '\u0623\u0645\u0646\u064a\u0629', qk: '\u062d\u0638\u0631', pm: '\u062a\u062d\u062f\u064a\u062b \u0634\u0627\u0645\u0644', au: true, sv: 'critical' },
      { id: 'AF6', c: '\u0645\u062e\u0627\u0644\u0641', qk: '\u0625\u062e\u0641\u0627\u0621', pm: '\u062d\u0630\u0641+\u0641\u0644\u062a\u0631', au: true, sv: 'critical' },
      { id: 'AF7', c: '\u062a\u062c\u0631\u0628\u0629', qk: '\u062a\u0648\u062c\u064a\u0647', pm: '\u062a\u0635\u0645\u064a\u0645', au: false, sv: 'medium' },
      { id: 'AF8', c: '\u0645\u0644\u0627\u062d\u0638\u0629', qk: '\u0631\u062f \u062a\u0644\u0642\u0627\u0626\u064a', pm: '\u062a\u062d\u0644\u064a\u0644+\u062a\u062d\u0633\u064a\u0646', au: false, sv: 'low' }
    ];
  }

  _buildRCA() {
    this.rcaSteps = ['\u0627\u0644\u0631\u0635\u062f','\u0627\u0644\u062a\u0648\u062b\u064a\u0642','\u0627\u0644\u062a\u0635\u0646\u064a\u0641','\u0644\u0645\u0627\u0630\u0627x5','\u0627\u0644\u062a\u062d\u0644\u064a\u0644','\u062d\u0644 \u0633\u0631\u064a\u0639','\u062d\u0644 \u062f\u0627\u0626\u0645','\u0627\u0644\u062a\u062d\u0642\u0642','\u062a\u0648\u062b\u064a\u0642','\u062f\u0631\u0633 \u0645\u0633\u062a\u0641\u0627\u062f'];
  }

  _buildItqan() {
    this.itqanTargets = { errorRate: 0, bugFixMin: 5, uptime: 99.99, satisfaction: 95, sharia: 100, responseMs: 500 };
    this.zeroRules = ['\u0644\u0627 \u0643\u0648\u062f \u0628\u062f\u0648\u0646 \u0627\u062e\u062a\u0628\u0627\u0631','\u0644\u0627 \u0628\u064a\u0627\u0646\u0627\u062a \u0628\u062f\u0648\u0646 \u062a\u062f\u0642\u064a\u0642','\u0644\u0627 \u0645\u0639\u0627\u0645\u0644\u0629 \u0628\u062f\u0648\u0646 \u0641\u062d\u0635 \u0634\u0631\u0639\u064a','\u0644\u0627 \u0625\u0647\u0645\u0627\u0644 \u0645\u0644\u0627\u062d\u0638\u0629','\u0643\u0644 \u062e\u0637\u0623 \u064a\u062d\u0644\u0644','\u0643\u0644 \u062a\u062d\u0633\u064a\u0646 \u064a\u0648\u062b\u0642'];
  }

  _buildReportTypes() {
    this.rptTypes = ['\u064a\u0648\u0645\u064a','\u0623\u0633\u0628\u0648\u0639\u064a','\u0634\u0647\u0631\u064a','\u062d\u0627\u062f\u062b','\u0634\u0631\u0639\u064a'];
  }

  _startMonitor() {
    this.mon = { active: true, start: new Date().toISOString(), checks: 0, issues: 0, fixed: 0 };
    this._mi = setInterval(() => {
      this.mon.checks++; this.mon.last = new Date().toISOString();
      const h = process.memoryUsage().heapUsed / 1048576;
      if (h > 400) this._obs({ tp: 'system', cat: '\u0623\u062f\u0627\u0621', ti: '\u0630\u0627\u0643\u0631\u0629 \u0639\u0627\u0644\u064a\u0629', dt: h.toFixed(1)+'MB', sv: 'warning', au: true });
    }, 30000);
  }

  getSurveyTemplates() { return { total: this.totalTpls, questions: this.totalQs, templates: this.tpls }; }

  createSurvey(key, aud, meta) {
    const tpl = this.tpls[key]; if (!tpl) return { success: false };
    const s = this._nxt('survey');
    const sv = { sn: 'SHK-SRV-'+this._dc()+'-'+String(s).padStart(5,'0'), tplId: tpl.id, key, title: tpl.t, aud, qs: tpl.qs, status: 'active', at: new Date().toISOString(), cnt: 0, meta };
    this.surveys.push(sv); this._w('surveys-reg.json', this.surveys);
    return { success: true, survey: sv };
  }

  submitResponse(sn, answers, who) {
    const sv = this.surveys.find(s => s.sn === sn); if (!sv || sv.status !== 'active') return { success: false };
    const s = this._nxt('response');
    const r = { sn: 'SHK-RSP-'+this._dc()+'-'+String(s).padStart(6,'0'), survey: sn, who: who || { type: 'anonymous' }, answers, at: new Date().toISOString(), done: false };
    this.responses.push(r); sv.cnt++;
    this._w('responses.json', this.responses); this._w('surveys-reg.json', this.surveys);
    const a = this._analyzeResp(r, sv); return { success: true, response: r, analysis: a };
  }

  _analyzeResp(r, sv) {
    const iss = [];
    for (const ans of r.answers) {
      const q = sv.qs.find(x => x.id === ans.qId); if (!q) continue;
      if (q.tp === 'rating' && ans.v <= 2) iss.push({ q: q.t, v: ans.v, sv: ans.v === 1 ? 'critical' : 'warning' });
      if (q.tp === 'nps' && ans.v <= 6) iss.push({ q: q.t, v: ans.v, sv: ans.v <= 3 ? 'critical' : 'warning' });
      if (q.tp === 'yesno_detail' && ans.v === true && ans.d) iss.push({ q: q.t, d: ans.d, sv: 'medium' });
    }
    for (const i of iss) this._obs({ tp: 'feedback', cat: '\u062a\u062c\u0631\u0628\u0629', ti: i.q, dt: String(i.v || i.d), sv: i.sv, src: r.sn, au: true });
    r.done = true; return { found: iss.length, issues: iss };
  }

  submitObservation(d) { return this._obs({ tp: d.type||'manual', cat: d.category||'\u0639\u0627\u0645', ti: d.title, dt: d.detail, sv: d.severity||'medium', au: false }); }

  _obs(d) {
    const s = this._nxt('obs');
    const o = { sn: 'SHK-OBS-'+this._dc()+'-'+String(s).padStart(6,'0'), tp: d.tp, cat: d.cat, ti: d.ti, dt: d.dt, sv: d.sv, src: d.src||null, au: d.au, st: 'new', at: new Date().toISOString(), qf: null, pf: null, rca: null };
    this.observations.push(o); this._w('observations.json', this.observations); this.mon.issues++;
    if (d.au) this._af(o); return o;
  }

  _af(obs) {
    const m = this.afCats.find(c => (obs.cat||'').includes(c.c) || (obs.ti||'').includes(c.c));
    if (m && m.au) {
      const s = this._nxt('fix');
      const f = { sn: 'SHK-FIX-'+this._dc()+'-'+String(s).padStart(5,'0'), obs: obs.sn, c: m.c, qk: { d: m.qk, at: new Date().toISOString(), st: 'applied' }, pm: { d: m.pm, st: 'scheduled' }, sv: m.sv };
      this.fixes.push(f); this._w('fixes.json', this.fixes);
      obs.qf = f.sn; obs.st = 'quick_fixed'; this._w('observations.json', this.observations);
      this.mon.fixed++; return f;
    } return null;
  }

  performRCA(sn, whys) {
    const obs = this.observations.find(o => o.sn === sn); if (!obs) return { success: false };
    const s = this._nxt('rca');
    const w = whys && whys.length ? whys : ['\u0644\u0645\u0627\u0630\u0627: '+obs.ti,'\u062e\u0644\u0644 \u0641\u064a '+obs.cat,'\u0641\u062d\u0635 \u063a\u064a\u0631 \u0643\u0627\u0641','\u0646\u0642\u0635 \u062a\u063a\u0637\u064a\u0629','\u062a\u0639\u0632\u064a\u0632 \u0645\u0637\u0644\u0648\u0628'];
    const rca = { sn: 'SHK-RCA-'+this._dc()+'-'+String(s).padStart(5,'0'), obs: sn, ti: obs.ti, cat: obs.cat, whys: w, root: w[w.length-1], st: 'analyzing', at: new Date().toISOString() };
    this.rcaRecords.push(rca); this._w('rca.json', this.rcaRecords);
    obs.rca = rca.sn; this._w('observations.json', this.observations);
    return { success: true, rca };
  }

  generateReport(type) {
    const tp = type || 'daily'; const s = this._nxt('report');
    const rp = { sn: 'SHK-RPT-'+this._dc()+'-'+String(s).padStart(5,'0'), type: tp, at: new Date().toISOString(), m: { surveys: this.surveys.length, responses: this.responses.length, obs: this.observations.length, open: this.observations.filter(o=>o.st==='new').length, qFixed: this.observations.filter(o=>o.st==='quick_fixed').length, resolved: this.observations.filter(o=>o.st==='resolved').length, fixes: this.fixes.length, rcas: this.rcaRecords.length, afRate: this.mon.issues>0?((this.mon.fixed/this.mon.issues)*100).toFixed(1)+'%':'100%' }, itq: this._itq(), mon: this.mon };
    this.reports.push(rp); this._w('reports-reg.json', this.reports); return { success: true, report: rp };
  }

  _itq() {
    const t = this.observations.length; if (!t) return { score: 100, lv: '\u0625\u062a\u0642\u0627\u0646 \u062a\u0627\u0645' };
    const r = this.observations.filter(o => o.st === 'resolved' || o.st === 'quick_fixed').length;
    const sc = Math.round((r / t) * 100);
    return { score: sc, lv: sc>=95?'\u0625\u062a\u0642\u0627\u0646 \u062a\u0627\u0645':sc>=85?'\u0625\u062a\u0642\u0627\u0646 \u0639\u0627\u0644\u064a':sc>=70?'\u062c\u064a\u062f':sc>=50?'\u0645\u062a\u0648\u0633\u0637':'\u064a\u062d\u062a\u0627\u062c \u0625\u0635\u0644\u0627\u062d', r, t };
  }

  getDashboard() {
    return { engine: this.nameAr, ver: this.version, owner: this.owner, st: '\u0645\u0641\u0639\u0644', sum: { tpls: this.totalTpls, qs: this.totalQs, surveys: this.surveys.filter(s=>s.status==='active').length, responses: this.responses.length, obs: this.observations.length, open: this.observations.filter(o=>o.st==='new').length, fixed: this.observations.filter(o=>['quick_fixed','resolved'].includes(o.st)).length, reports: this.reports.length, rcas: this.rcaRecords.length, ch: this.channels.length }, itq: this._itq(), mon: this.mon, principles: this.principles.length };
  }

  getFullSystem() {
    return { engine: this.nameAr, ver: this.version, owner: this.owner, principles: this.principles, tpls: this.tpls, channels: this.channels, afCats: this.afCats, rcaSteps: this.rcaSteps, itqanTargets: this.itqanTargets, zeroRules: this.zeroRules, rptTypes: this.rptTypes, dashboard: this.getDashboard(), stats: { principles: 8, tpls: this.totalTpls, qs: this.totalQs, ch: 10, af: 8, rca: 10, rpt: 5 } };
  }

  getObservations(f) { let r = [...this.observations]; if (f && f.st) r = r.filter(o=>o.st===f.st); if (f && f.sv) r = r.filter(o=>o.sv===f.sv); return r.sort((a,b)=>new Date(b.at)-new Date(a.at)); }
  stop() { if (this._mi) { clearInterval(this._mi); this._mi = null; } }
  _nxt(t) { this._c[t] = (this._c[t]||0)+1; this._w('survey-counters.json', this._c); return this._c[t]; }
  _dc() { const d = new Date(); return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0'); }
  _ld(f, def) { try { const p = path.join(this.dataDir, f); if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8')); } catch(_){} return def; }
  _w(f, d) { try { fs.writeFileSync(path.join(this.dataDir, f), JSON.stringify(d, null, 2), 'utf8'); } catch(e) { console.error('save err '+f, e.message); } }
}

module.exports = SheikhaStandardsSurveyEngine;
