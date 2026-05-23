const fs = require('fs');
const path = require('path');
const { buildGitState } = require('./sheikha-git-engine');

class SheikhaExecutionOrchestrator {
  constructor(rootDir) {
    this.rootDir = rootDir;
    this.logFile = path.join(rootDir, 'data', 'execution-orchestrator-log.json');
    this.stateFile = path.join(rootDir, 'data', 'execution-orchestrator-state.json');
  }

  readJson(relPath, fallback = []) {
    try {
      const full = path.join(this.rootDir, relPath);
      if (!fs.existsSync(full)) return fallback;
      return JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch {
      return fallback;
    }
  }

  writeJson(fullPath, data) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  }

  now() {
    return new Date().toISOString();
  }

  evaluate() {
    const users = this.readJson('data/users.json', []);
    const traders = this.readJson('data/traders.json', []);
    const orders = this.readJson('data/orders.json', []);
    const contracts = this.readJson('data/contracts.json', []);
    const supply = this.readJson('data/supply.json', []);
    const audits = this.readJson('data/audits.json', []);
    const git = buildGitState(this.rootDir);

    const gitDirty = git?.branchHealth?.dirtyCount || 0;
    const ordersCount = orders.length;
    const contractsCount = contracts.length;
    const supplyCount = supply.length;
    const alerts = [];

    if (gitDirty > 50) {
      alerts.push({ level: 'warn', code: 'FREEZE_DEPLOY', message: 'عدد التعديلات المحلية مرتفع ويستدعي تجميد النشر مؤقتًا.' });
    }
    if (ordersCount > contractsCount) {
      alerts.push({ level: 'info', code: 'ORDERS_AHEAD', message: 'الطلبات أكثر من العقود الحالية، ويُستحسن تعزيز مسار التعاقد.' });
    }
    if (ordersCount > supplyCount) {
      alerts.push({ level: 'warn', code: 'BOOST_SUPPLY', message: 'الطلبات تجاوزت التوريد، ويجب رفع مسار التغذية والتوريد.' });
    }

    let mode = 'NORMAL_PRODUCTION';
    if (alerts.some(a => a.code === 'FREEZE_DEPLOY')) mode = 'SAFE_MODE';
    else if (alerts.some(a => a.code === 'BOOST_SUPPLY')) mode = 'BOOST_SUPPLY';
    else if (ordersCount > 0 && contractsCount > 0) mode = 'ACTIVE_TRADE';

    const recommendedActions = [];
    if (mode === 'SAFE_MODE') {
      recommendedActions.push('freeze_deploy');
      recommendedActions.push('snapshot_git');
      recommendedActions.push('review_orchestrator');
    }
    if (mode === 'BOOST_SUPPLY') {
      recommendedActions.push('activate_pm4');
      recommendedActions.push('activate_pm3');
      recommendedActions.push('open_supply_review');
    }
    if (mode === 'ACTIVE_TRADE') {
      recommendedActions.push('activate_pm2');
      recommendedActions.push('sync_dashboard');
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('monitor');
    }

    return {
      ok: true,
      timestamp: this.now(),
      mode,
      summary: {
        users: users.length,
        traders: traders.length,
        orders: ordersCount,
        contracts: contractsCount,
        supply: supplyCount,
        audits: audits.length,
        git_dirty_count: gitDirty,
      },
      alerts,
      recommendedActions,
      git,
    };
  }

  log(action, details = {}) {
    const current = this.readJson('data/execution-orchestrator-log.json', []);
    const record = {
      timestamp: this.now(),
      action,
      details,
    };
    current.push(record);
    this.writeJson(this.logFile, current.slice(-200));
    return record;
  }

  snapshot() {
    const state = this.evaluate();
    this.writeJson(this.stateFile, state);
    this.log('snapshot', { mode: state.mode, alerts: state.alerts.length });
    return state;
  }

  run() {
    const state = this.snapshot();
    const actions = state.recommendedActions.map((name) => ({
      name,
      status: 'planned',
      at: this.now(),
    }));
    this.log('run', { mode: state.mode, actions: actions.map(a => a.name) });
    return {
      ok: true,
      timestamp: this.now(),
      mode: state.mode,
      actions,
      state,
    };
  }

  auto() {
    const result = this.run();
    const executed = result.actions.map((action) => ({
      ...action,
      status: 'executed',
    }));
    this.log('auto', { mode: result.mode, executed: executed.map(a => a.name) });
    return {
      ok: true,
      timestamp: this.now(),
      mode: result.mode,
      executed,
      state: result.state,
    };
  }

  getLog() {
    return this.readJson('data/execution-orchestrator-log.json', []);
  }
}

module.exports = SheikhaExecutionOrchestrator;
