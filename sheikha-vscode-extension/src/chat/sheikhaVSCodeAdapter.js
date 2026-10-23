'use strict';

const crypto = require('node:crypto');
const CAPABILITIES = Object.freeze([
  ['workbench.action.showCommands', 'لوحة أوامر VS Code', 'NATIVE_UI'],
  ['workbench.view.explorer', 'مستكشف الملفات', 'NATIVE_UI'],
  ['workbench.action.findInFiles', 'البحث في المشروع', 'NATIVE_UI'],
  ['workbench.view.scm', 'إدارة المصدر', 'NATIVE_UI'],
  ['workbench.view.extensions', 'الإضافات', 'NATIVE_UI'],
  ['workbench.view.debug', 'لوحة التشغيل والتصحيح', 'NATIVE_UI'],
  ['workbench.actions.view.problems', 'التشخيصات', 'NATIVE_UI'],
  ['workbench.action.output.toggleOutput', 'مخرجات الأدوات', 'NATIVE_UI'],
  ['workbench.action.tasks.runTask', 'اختيار مهمة تشغيل', 'NATIVE_PALETTE_ONLY'],
  ['workbench.action.debug.start', 'بدء التصحيح', 'NATIVE_PALETTE_ONLY'],
  ['workbench.action.terminal.new', 'طرفية جديدة', 'NATIVE_PALETTE_ONLY'],
  ['editor.action.formatDocument', 'تنسيق الملف المفتوح', 'EDITOR_APPROVAL'],
  ['editor.action.organizeImports', 'تنظيم استيرادات الملف', 'EDITOR_APPROVAL']
].map(([id, label, policy]) => Object.freeze({ id, label, policy })));

class VSCodeAdapter {
  constructor(api) { this.api = api; }
  async inspect() {
    const raw = await this.api.commands.getCommands(true);
    if (!Array.isArray(raw) || raw.length > 30000) throw Error('COMMAND_CATALOG_INVALID');
    const ids = [...new Set(raw.filter(id => typeof id === 'string' && id.length <= 256 && !id.startsWith('_'))) ].sort();
    const commands = ids.map(id => ({ id, policy: CAPABILITIES.find(item => item.id === id)?.policy || 'NATIVE_PALETTE_ONLY' }));
    return { system: 'SHEIKHA_VSCODE_ADAPTER_V1', checkedAt: new Date().toISOString(), count: commands.length,
      catalogSha256: crypto.createHash('sha256').update(JSON.stringify(commands)).digest('hex'), commands,
      discovery: 'REGISTERED_PUBLIC_COMMANDS_NOT_ALL_INTERNAL_APIS',
      executableThroughAdapter: commands.filter(item => item.policy !== 'NATIVE_PALETTE_ONLY').length,
      registrationProvesExecution: false, modelCanInvokeCommands: false };
  }
  async openCatalog() {
    const catalog = await this.inspect();
    const doc = await this.api.workspace.openTextDocument({ content: JSON.stringify(catalog, null, 2), language: 'json' });
    await this.api.window.showTextDocument(doc);
    return { ...catalog, commands: undefined };
  }
  async chooseAndExecute() {
    if (this.api.workspace.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED');
    const catalog = await this.inspect(); const registered = new Set(catalog.commands.map(item => item.id));
    const options = CAPABILITIES.filter(item => registered.has(item.id) && item.policy !== 'NATIVE_PALETTE_ONLY')
      .map(item => ({ label: item.label, description: item.id, id: item.id }));
    const selected = await this.api.window.showQuickPick(options, { title: 'أدوات VS Code عبر موصل شيخة' });
    if (!selected) return null;
    const capability = CAPABILITIES.find(item => item.id === selected.id);
    if (!capability || capability.policy === 'NATIVE_PALETTE_ONLY' || !registered.has(capability.id)) throw Error('COMMAND_POLICY_DENIED');
    let target = null;
    if (capability.policy === 'EDITOR_APPROVAL') {
      const editor = this.api.window.activeTextEditor;
      if (!editor || editor.document.uri.scheme !== 'file') throw Error('LOCAL_ACTIVE_DOCUMENT_REQUIRED');
      target = { editor, uri: editor.document.uri.toString(), version: editor.document.version };
      const approval = await this.api.window.showWarningMessage(
        'سيعدل الأمر الملف المفتوح داخل المحرر وقد يستدعي مزود اللغة أو التنسيق المثبت. لا حفظ تلقائي ولا موافقة على مهام أخرى.',
        { modal: true }, 'تنفيذ على الملف المفتوح');
      if (approval !== 'تنفيذ على الملف المفتوح') return null;
    }
    if (this.api.workspace.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED');
    if (!(await this.api.commands.getCommands(true)).includes(capability.id)) throw Error('COMMAND_NO_LONGER_REGISTERED');
    if (target && (this.api.window.activeTextEditor !== target.editor || target.editor.document.uri.toString() !== target.uri ||
        target.editor.document.version !== target.version)) throw Error('ACTIVE_DOCUMENT_CHANGED');
    // Never forward command IDs or arguments supplied by the webview or a model.
    await this.api.commands.executeCommand(capability.id);
    return { system: 'SHEIKHA_VSCODE_COMMAND_RECEIPT_V1', command: capability.id, policy: capability.policy,
      checkedAt: new Date().toISOString(), status: 'COMMAND_RETURNED_OUTCOME_NOT_INDEPENDENTLY_VERIFIED',
      externalProviderBehaviorAudited: false, savedDocument: false, modelInvokedByAdapter: false };
  }
}

module.exports = { CAPABILITIES, VSCodeAdapter };
