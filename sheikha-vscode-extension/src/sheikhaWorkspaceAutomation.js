'use strict';

const RECEIPT_KEY = 'sheikha.workspaceAutomation.latest.v1';
const EVENT_REASONS = new Set(['STARTUP', 'TRUST_GRANTED', 'CONFIGURATION_CHANGED', 'FOLDERS_CHANGED', 'EXTENSIONS_CHANGED', 'USER_RESUMED']);

class WorkspaceAutomation {
  constructor(api, center, context, { publish, status, debounceMs = 750 } = {}) {
    this.api = api; this.center = center; this.context = context;
    this.publish = publish || (() => {}); this.statusBar = status;
    this.debounceMs = debounceMs; this.timer = null; this.running = null;
    this.reasons = new Set(); this.epoch = 0; this.disposed = false;
    this.auditBlocked = false; this.pausedInSession = false; this.history = []; this.latest = null;
  }

  enabled() {
    return !this.disposed && !this.pausedInSession &&
      this.api.workspace.getConfiguration('sheikha').get('workspaceLocalTools', false) === true;
  }

  state() {
    if (this.disposed) return 'DISPOSED';
    if (!this.enabled()) return 'PAUSED';
    if (!this.center.allowed()) return 'WORKSPACE_TRUST_OR_FOLDER_REQUIRED';
    if (this.auditBlocked) return 'AUDIT_UNAVAILABLE';
    return this.running ? 'RUNNING' : this.latest?.status || 'SCHEDULED';
  }

  inspect() {
    return { system: 'SHEIKHA_WORKSPACE_AUTOMATION_V1', state: this.state(), enabled: this.enabled(),
      policy: { scope: 'BUILTIN_LANGUAGE_TOOLS_ONLY', eventDriven: true, polling: false,
        automaticAttemptsPerExtensionPerHostSession: 1, maxSessionReceipts: 20,
        inFlightExtensionActivationCancellable: false, cloudActivationAllowed: false,
        contributedCommandExecutionAllowed: false, networkRequestsByController: 0,
        modelInference: false, deployment: false, productionReady: false },
      latest: this.latest, sessionHistory: this.history.slice() };
  }

  render() {
    if (!this.statusBar || this.disposed) return;
    const state = this.state();
    const healthy = this.enabled() && ['COMPLETED', 'SCHEDULED', 'RUNNING'].includes(state);
    this.statusBar.text = `${healthy ? '$(shield)' : '$(circle-slash)'} شيخة: ${this.enabled() ? 'تلقائي' : 'متوقف'}`;
    this.statusBar.tooltip = `Sheikha Workspace: ${state}\n${this.latest ? `${this.latest.activeCount}/${this.latest.count}` : '-'} active`;
    this.statusBar.command = 'sheikha.awareness.scan';
    this.statusBar.show();
  }

  schedule(reason) {
    if (this.disposed || !EVENT_REASONS.has(reason)) return;
    this.reasons.add(reason); clearTimeout(this.timer); this.timer = null;
    this.render();
    if (!this.running) this.timer = setTimeout(() => { this.timer = null; void this.run(); }, this.debounceMs);
  }

  configurationChanged() {
    this.epoch += 1;
    this.pausedInSession = false;
    this.schedule('CONFIGURATION_CHANGED');
  }

  async setEnabled(enabled) {
    if (this.disposed || (enabled && !this.center.allowed())) return false;
    this.epoch += 1;
    // Stop new activations immediately, even if persisting the setting fails.
    this.pausedInSession = true;
    clearTimeout(this.timer); this.timer = null; this.reasons.clear(); this.render();
    try {
      await this.api.workspace.getConfiguration('sheikha').update('workspaceLocalTools', enabled,
        this.api.ConfigurationTarget.Workspace);
      this.pausedInSession = !enabled;
      if (enabled) this.auditBlocked = false;
      if (enabled) this.schedule('USER_RESUMED');
      this.render(); return true;
    } catch (_) {
      this.publish({ system: 'SHEIKHA_WORKSPACE_AUTOMATION_V1', status: 'SETTING_UPDATE_FAILED_PAUSED_IN_SESSION' });
      this.render(); return false;
    }
  }

  async record(receipt) {
    if (this.disposed) return false;
    let saved = false;
    try { await this.context.workspaceState.update(RECEIPT_KEY, receipt); saved = true; } catch (_) {
      this.auditBlocked = true;
    }
    if (this.disposed) return false;
    this.latest = { ...receipt, persistence: saved ? 'WORKSPACE_STATE_SAVED' : 'FAILED',
      ...(saved ? {} : { status: 'AUDIT_UNAVAILABLE' }) };
    this.history.push(this.latest); this.history = this.history.slice(-20);
    this.publish(this.latest); this.render(); return saved;
  }

  run() {
    if (this.disposed) return Promise.resolve();
    if (this.running) return this.running;
    clearTimeout(this.timer); this.timer = null;
    const reasons = [...this.reasons]; this.reasons.clear();
    this.running = this.check(reasons).catch(() => {
      this.auditBlocked = true;
      if (!this.disposed) this.publish({ system: 'SHEIKHA_WORKSPACE_AUTOMATION_V1', status: 'CHECK_FAILED_REDACTED' });
    }).finally(() => {
      this.running = null; this.render();
      if (!this.disposed && this.reasons.size) this.schedule([...this.reasons][0]);
    });
    this.render(); return this.running;
  }

  async check(reasons) {
    const epoch = this.epoch;
    const authorized = () => this.enabled() && this.center.allowed() && !this.auditBlocked && epoch === this.epoch;
    const snapshot = this.center.inspect();
    const receipt = { system: 'SHEIKHA_WORKSPACE_AUTOMATION_V1', checkedAt: new Date().toISOString(), reasons,
      count: snapshot.count, activeCount: snapshot.activeCount,
      trusted: snapshot.trusted, folderCount: snapshot.folders.length,
      status: authorized() ? 'CHECK_STARTED' : this.state(), activation: null,
      registrationProvesExecution: false, productionReady: false };
    // Persist intent before any activation; an unavailable audit sink blocks automation.
    if (!await this.record(receipt) || !authorized()) return;
    const activation = await this.center.activateLocal({ automatic: true, isAuthorized: authorized });
    if (this.disposed) return;
    const after = this.center.inspect();
    await this.record({ ...receipt, checkedAt: new Date().toISOString(), count: after.count,
      activeCount: after.activeCount, status: authorized() ? activation.status : 'STOPPED', activation });
  }

  dispose() {
    this.disposed = true; this.epoch += 1;
    clearTimeout(this.timer); this.timer = null; this.reasons.clear();
  }
}

module.exports = { WorkspaceAutomation, RECEIPT_KEY };
