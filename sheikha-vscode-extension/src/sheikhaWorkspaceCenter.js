'use strict';
const { WorkspaceAutomation } = require('./sheikhaWorkspaceAutomation');

const LOCAL_EXTENSIONS = Object.freeze([
  'vscode.json-language-features', 'vscode.html-language-features',
  'vscode.css-language-features', 'vscode.typescript-language-features',
  'vscode.markdown-language-features'
]);
const UI_ACTIONS = Object.freeze({
  extensions: 'workbench.view.extensions', explorer: 'workbench.view.explorer',
  problems: 'workbench.actions.view.problems', git: 'workbench.view.scm',
  debug: 'workbench.view.debug', chat: 'sheikha.openChat'
});
const label = value => typeof value === 'string' ? value.slice(0, 200) : '';

class WorkspaceCenter {
  constructor(api, { timeoutMs = 10000, publish = () => {}, awareness } = {}) {
    this.api = api; this.timeoutMs = timeoutMs; this.publish = publish;
    this.awareness = awareness;
    this.pending = new Set(); this.inFlight = null; this.disposed = false; this.latest = null;
    this.automaticAttempts = new Set(); this.automation = null;
  }

  inspect() {
    const extensions = this.api.extensions.all.map(extension => {
      const manifest = extension.packageJSON || {};
      return { id: extension.id, name: label(manifest.displayName || extension.id),
        version: label(manifest.version), active: extension.isActive === true,
        hasExecutableEntry: Boolean(manifest.main || manifest.browser),
        localActivationAllowed: LOCAL_EXTENSIONS.includes(extension.id),
        categories: Array.isArray(manifest.categories) ? manifest.categories.map(label) : [],
        commands: Array.isArray(manifest.contributes?.commands) ? manifest.contributes.commands.map(c => ({
          id: label(c.command), title: label(typeof c.title === 'object' ? c.title.value : c.title)
        })) : [],
        languages: Array.isArray(manifest.contributes?.languages) ? manifest.contributes.languages.map(l => label(l.id)) : [] };
    }).sort((a, b) => a.id.localeCompare(b.id));
    return { system: 'SHEIKHA_WORKSPACE_CENTER_V1', checkedAt: new Date().toISOString(),
      trusted: this.api.workspace.isTrusted === true,
      folders: (this.api.workspace.workspaceFolders || []).map(f => ({ name: f.name, path: f.uri.fsPath })),
      scope: 'EXTENSIONS_VISIBLE_TO_THIS_EXTENSION_HOST_NOT_ALL_INSTALLED_APPLICATIONS',
      count: extensions.length, activeCount: extensions.filter(e => e.active).length,
      extensions, latestActivation: this.latest,
      registrationProvesExecution: false, modelCanInvokeCommands: false,
      externalRequestsByController: 0, productionReady: false };
  }

  allowed() {
    return !this.disposed && this.api.workspace.isTrusted === true &&
      this.api.workspace.workspaceFolders?.length > 0;
  }

  activateLocal(options = {}) {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.runActivation(options).finally(() => { this.inFlight = null; });
    return this.inFlight;
  }

  async runActivation({ automatic = false, isAuthorized = () => true } = {}) {
    const result = { checkedAt: new Date().toISOString(), scope: 'BUILTIN_LANGUAGE_TOOLS_ONLY',
      status: 'WORKSPACE_TRUST_OR_FOLDER_REQUIRED', results: [], externalRequestsByController: 0,
      thirdPartyExtensionsActivated: false, extensionSideEffectsIndependentlyAudited: false };
    if (!this.allowed() || !isAuthorized()) return result;
    result.status = 'COMPLETED';
    for (const id of LOCAL_EXTENSIONS) {
      if (!this.allowed() || !isAuthorized()) { result.status = 'STOPPED'; break; }
      const extension = this.api.extensions.getExtension(id);
      if (!extension) { result.results.push({ id, state: 'NOT_AVAILABLE' }); continue; }
      if (extension.isActive) { result.results.push({ id, state: 'ALREADY_ACTIVE' }); continue; }
      if (this.pending.has(id)) { result.results.push({ id, state: 'ACTIVATION_PENDING' }); continue; }
      if (automatic && this.automaticAttempts.has(id)) {
        result.results.push({ id, state: 'RETRY_REQUIRES_USER' }); continue;
      }
      this.pending.add(id);
      let timer;
      const activation = Promise.resolve().then(() => {
        if (!this.allowed() || !isAuthorized()) return 'STOPPED';
        if (automatic) this.automaticAttempts.add(id);
        return extension.activate().then(() => extension.isActive ? 'ACTIVE' : 'RETURNED_NOT_ACTIVE');
      }).catch(() => 'FAILED').finally(() => this.pending.delete(id));
      const state = await Promise.race([activation, new Promise(resolve => {
        timer = setTimeout(() => resolve('TIMEOUT_STATE_UNKNOWN'), this.timeoutMs);
      })]);
      clearTimeout(timer); result.results.push({ id, state });
      // VS Code activation cannot be cancelled; do not launch more tools on timeout.
      if (state === 'TIMEOUT_STATE_UNKNOWN' || state === 'STOPPED') { result.status = 'INCOMPLETE'; break; }
    }
    if (result.results.some(r => !['ACTIVE', 'ALREADY_ACTIVE'].includes(r.state))) result.status = 'INCOMPLETE';
    this.latest = result;
    if (!this.disposed) this.publish(result);
    return result;
  }

  async document(value) {
    const doc = await this.api.workspace.openTextDocument({ language: 'json', content: JSON.stringify(value, null, 2) });
    await this.api.window.showTextDocument(doc);
  }

  async open() {
    const actions = [
      { label: 'فحص القدرات والإضافات', id: 'inventory' },
      ...(this.automation ? [
        { label: 'حالة الأتمتة وسجل الحوكمة', id: 'automation-status' },
        { label: this.automation.enabled() ? 'إيقاف الأتمتة' : 'تشغيل الأتمتة المحلية', id: 'automation-toggle' }
      ] : []),
      ...(this.awareness ? [{ label: 'حالة المحرر والتشخيصات', id: 'awareness' }] : []),
      { label: 'تفعيل أدوات التحرير المحلية', id: 'activate' },
      { label: 'تطبيقات وإضافات مساحة العمل', id: 'catalog' },
      { label: 'مستكشف الملفات', id: 'explorer' },
      { label: 'الإضافات', id: 'extensions' },
      { label: 'التشخيصات', id: 'problems' },
      { label: 'Git وإدارة المصدر', id: 'git' },
      { label: 'لوحة التصحيح', id: 'debug' },
      { label: 'شات شيخة', id: 'chat' }
    ];
    const choice = await this.api.window.showQuickPick(actions, { title: 'مركز مساحة عمل شيخة' });
    if (!choice || !actions.some(a => a.id === choice.id) || this.disposed) return;
    if (choice.id === 'inventory') return this.document(this.inspect());
    if (choice.id === 'automation-status') return this.document(this.automation.inspect());
    if (choice.id === 'automation-toggle') {
      await this.automation.setEnabled(!this.automation.enabled());
      return this.document(this.automation.inspect());
    }
    if (choice.id === 'awareness') return this.document(await this.awareness());
    if (choice.id === 'activate') return this.document(await this.activateLocal());
    if (choice.id === 'catalog') {
      const catalog = this.inspect();
      const selection = await this.api.window.showQuickPick(catalog.extensions.map(e => ({
        label: e.name, id: e.id, description: e.active ? 'نشطة' : e.hasExecutableEntry ? 'عند الطلب / غير نشطة' : 'تعريفات وموارد',
        detail: `${e.id} | ${e.version} | ${e.commands.length} commands`
      })), { title: 'الإضافات المتاحة في مضيف VS Code' });
      const selected = selection && catalog.extensions.find(e => e.id === selection.id);
      if (selected && !this.disposed) await this.document(selected);
      return;
    }
    const command = UI_ACTIONS[choice.id];
    if (command && (await this.api.commands.getCommands(true)).includes(command) && !this.disposed) {
      await this.api.commands.executeCommand(command);
    }
  }

  dispose() { this.disposed = true; }
}

function attachWorkspaceCenter(api, context, awareness) {
  const output = api.window.createOutputChannel('Sheikha Workspace', { log: true });
  const publish = result => output.appendLine(JSON.stringify(result));
  const center = new WorkspaceCenter(api, { awareness, publish });
  const status = api.window.createStatusBarItem('sheikha.workspaceAutomation', api.StatusBarAlignment.Right, 40);
  const automation = new WorkspaceAutomation(api, center, context, { publish, status });
  center.automation = automation;
  context.subscriptions.push(automation, center, status, output);
  context.subscriptions.push(api.workspace.onDidGrantWorkspaceTrust(() => automation.schedule('TRUST_GRANTED')));
  context.subscriptions.push(api.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('sheikha.workspaceLocalTools')) automation.configurationChanged();
  }));
  context.subscriptions.push(api.workspace.onDidChangeWorkspaceFolders(() => {
    automation.epoch += 1; automation.schedule('FOLDERS_CHANGED');
  }));
  context.subscriptions.push(api.extensions.onDidChange(() => automation.schedule('EXTENSIONS_CHANGED')));
  automation.schedule('STARTUP');
  return center;
}

module.exports = { WorkspaceCenter, attachWorkspaceCenter, LOCAL_EXTENSIONS, UI_ACTIONS };
