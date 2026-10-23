'use strict';
/* global window, document, MessageEvent, innerWidth, innerHeight */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { renderSheikhaChatTemplate, CHAT_TOOL_COMMAND_IDS } = require('../src/ui/sheikhaChatTemplate');
const { SheikhaChatWorkbench, architectureMarkdown } = require('../src/chat/sheikhaChatWorkbench');
const { COMPONENTS } = require('../src/chat/sheikhaWorkspaceIntegration');
const { OpportunityWatch } = require('../src/intelligence/opportunityWatch');
const { CognitiveMemory } = require('../src/chat/sheikhaCognitiveMemory');

async function waitForPage(page, predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await page.evaluate(predicate)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('BROWSER_STATE_TIMEOUT');
}

async function main() {
  const { chromium } = require(process.env.SHEIKHA_PLAYWRIGHT_MODULE || 'playwright');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-chat-workbench-'));
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-workbench-fixture-'));
  for (const component of COMPONENTS) for (const relative of component.files) {
    const target = path.join(fixtureRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, 'Synthetic test source, never executed.', { mode: 0o600 });
  }
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
    args: ['--no-sandbox', '--disable-background-networking', '--disable-component-update', '--disable-default-apps'] });
  const results = [];
  try {
    for (const [name, width, height] of [['desktop', 1440, 1000], ['sidebar', 720, 900], ['mobile', 390, 844], ['compact', 320, 760]]) {
      const context = await browser.newContext({ viewport: { width, height }, serviceWorkers: 'block' });
      const requests = []; await context.route('**/*', route => { requests.push(route.request().url()); return route.abort(); });
      const page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
      let history = [{ role: 'user', content: 'Synthetic local session' }]; const messages = [];
      let copied = ''; let documentOpened = false; const executedCommands = [];
      const draftResolvers = [];
      const waitForHost = async predicate => { for (let i=0;i<200;i++) { if(predicate())return; await new Promise(resolve=>setTimeout(resolve,25)); } throw Error('HOST_STATE_TIMEOUT'); };
      const publish = message => page.evaluate(value => window.dispatchEvent(new MessageEvent('message', { data: value })), message);
      const api = {
        commands: { getCommands: async () => [...CHAT_TOOL_COMMAND_IDS, 'workbench.view.scm', 'workbench.action.findInFiles'], executeCommand: async id => { executedCommands.push(id); } },
        window: { showOpenDialog: async () => undefined, showSaveDialog: async () => undefined,
          showInputBox: async options => options.title === 'بحث في ذاكرة المشروع' ? '' : ['مهمة شيخة المنظمة', 'هدف دورة شيخة المعرفية', 'عنوان الذاكرة الخاصة', 'المعلومة المراد حفظها'].includes(options.title) ? 'تصميم واجهة عربية قابلة للاختبار، ببيانات اصطناعية فقط.' : JSON.stringify({ baseline: 20, observed: 15, better: 'LOWER', unit: 'kg' }),
          showQuickPick: async (choices, options) => options.canPickMany ? [choices[0]] : options.title === 'منفذ الدورة المعرفية' ? choices.find(c => c.id === 'model') : options.title === 'نوع المنفذين' ? { id: 'model' } : ['صلاحية الاسترجاع', 'الملاحظة المراد قراءتها', 'الملاحظة المراد حذفها', 'النموذج المحلي المثبت', 'أدوات VS Code عبر موصل شيخة', 'مصدر التقرير'].includes(options.title) ? choices[0] : { id: 'EFFECT', label: 'حساب الأثر' },
          showWarningMessage: async (message, options, choice) => choice, showTextDocument: async () => { documentOpened = true; } },
        workspace: { isTrusted: true, workspaceFolders: [{ name: 'Fixture', uri: { scheme: 'file', fsPath: fixtureRoot } }], openTextDocument: async value => value, fs: {} },
        languages: { getDiagnostics: () => [] },
        env: { clipboard: { writeText: async value => { copied = value; } }, openExternal: async () => { throw new Error('EXTERNAL_REQUEST_FORBIDDEN'); } }
      };
      const observation = { report: async () => ({ reachable: true, domains: 79, fixture: true }),
        inspect: async () => ({ tools: [{ id: 'EFFECT', label: 'حساب الأثر' }] }),
        execute: async (id, input) => ({ toolId: id, result: input.observed - input.baseline, fixture: true }) };
      const modelAdapter = { inspect: async () => ({ models: [{ name: 'fixture:4b', digest: 'c'.repeat(64), parameters: '4B' }], checkedAt: new Date().toISOString() }),
        draft: () => new Promise(resolve => { draftResolvers.push(resolve); }) };
      const opportunityStore = new OpportunityWatch({ root: path.join(directory, 'watch-' + name) });
      const opportunityOptions = { store: opportunityStore, collector: async () => ({ sourceCount: 1, failures: [], records: [{
        title: 'فرصة بحثية اصطناعية للاختبار', summary: 'PRIVATEOPPORTUNITYTEST', category: 'SCIENTIFIC', sourceUrl: 'https://example.org/research', publishedAt: null
      }] }) };
      const cognitionMemory = new CognitiveMemory({ directory: path.join(directory, 'memory-' + name) });
      const workbench = new SheikhaChatWorkbench({ vscode: api, publish, getHistory: () => history, clearHistory: () => { history = []; }, observation, modelAdapter, opportunityOptions, cognitionOptions: { memory: cognitionMemory } });
      await page.exposeFunction('workbenchHost', async message => {
        messages.push(message);
        if (message.command === 'ready') {
          await publish({ command: 'readyAck', version: 'fixture' });
          await publish({ command: 'toolAvailability', available: CHAT_TOOL_COMMAND_IDS });
          await workbench.refresh();
        } else if (message.command === 'workbench') await workbench.handle(message);
        else if (message.command === 'clearConversation') {
          await workbench.reset(); await publish({ command: 'conversationCleared' });
        }
      });
      const nonce = 'workbench-browser-verification';
      const script = `<script nonce="${nonce}">`;
      const bridge = `${script}window.acquireVsCodeApi=()=>({getState:()=>({}),setState:()=>{},postMessage:m=>window.workbenchHost(m)});</script>`;
      const html = renderSheikhaChatTemplate({ nonce, version: 'LOCAL TEST' }).replace(script, bridge + script);
      await page.setContent(html);
      await waitForPage(page, () => document.body.dataset.webviewReady === 'true');
      await page.locator('[data-workbench-action="architecture"]').click();
      await waitForPage(page, () => document.querySelectorAll('#workbenchOutputs .wb-actions').length === 1);
      await page.locator('[data-workbench-action="review"]').click();
      await waitForPage(page, () => document.querySelectorAll('#workbenchTasks [data-status="CHECKED"]').length === 5);
      assert.equal(await page.locator('#workbenchDomains li').count(), 5);
      await page.locator('[data-workbench-action="integration"]').click();
      await waitForPage(page, () => document.querySelectorAll('#workbenchComponents li').length === 18 && document.getElementById('workbenchStatus').textContent === 'محلي');
      assert.equal(workbench.integration.changes.length, 0);
      fs.appendFileSync(path.join(fixtureRoot, 'package.json'), 'Changed synthetic source.');
      await page.locator('[data-workbench-action="integration"]').click();
      await waitForPage(page, () => document.querySelectorAll('#workbenchChanges li').length === 1 && document.getElementById('workbenchStatus').textContent === 'محلي');
      assert.equal(workbench.integration.newChangeCount, 1);
      const eventCount = workbench.events.length;
      await page.locator('[data-workbench-action="integration"]').click();
      await waitForPage(page, () => document.getElementById('workbenchNotice').textContent === '' && document.getElementById('workbenchStatus').textContent === 'محلي');
      assert.equal(workbench.events.length, eventCount + 1);
      assert.equal(workbench.integration.changes.length, 1);
      await page.locator('[data-workbench-action="observation.report"]').click();
      await waitForPage(page, () => document.getElementById('workbenchOutputs').textContent.includes('حالة البيانات والمستجدات'));
      await page.locator('[data-workbench-action="observation.tool"]').click();
      await waitForPage(page, () => document.getElementById('workbenchOutputs').textContent.includes('حساب الأثر'));
      assert.ok(workbench.outputs.at(-1).content.includes('-5'));
      await page.locator('[data-workbench-action="delivery"]').click();
      await waitForPage(page, () => document.getElementById('workbenchOutputs').textContent.includes('تقرير حزم التوزيع V2'));
      assert.ok(workbench.outputs.at(-1).content.includes('REPORT_UNVERIFIED'));
      await page.locator('#workbenchIntegration summary').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
      assert.equal(await page.evaluate(() => {
        const input = document.getElementById('input').getBoundingClientRect();
        return input.top >= 0 && input.bottom <= innerHeight;
      }), true);
      await page.evaluate(() => { document.getElementById('workbench').scrollTop = 0; });
      await page.screenshot({ path: path.join(directory, name + '.png'), fullPage: true });
      const first = page.locator('#workbenchOutputs li').first();
      await first.locator('button').nth(0).click();
      await waitForPage(page, () => document.getElementById('workbenchStatus').textContent === 'محلي');
      assert.equal(documentOpened, true);
      await first.locator('button').nth(1).click();
      await waitForPage(page, () => document.getElementById('workbenchStatus').textContent === 'محلي');
      assert.ok(copied.includes('إدارة الذكاء الصناعي'));
      await first.locator('button').nth(3).click();
      await waitForPage(page, () => document.getElementById('input').value.includes('إدارة الذكاء الصناعي'));
      assert.equal(messages.filter(message => message.command === 'ask').length, 0);
      workbench.recordConversation('تشخيص المنظومة', 'INSPECTOR_CURRENT_EIGHT_WARNINGS');
      workbench.output('فهرس البيانات', 'EMPTY_CATALOG_NOT_CHAT_SUBJECT');
      await workbench.emit();
      assert.ok(workbench.contextReply('اكتب تقرير', []).includes('INSPECTOR_CURRENT_EIGHT_WARNINGS'));
      assert.ok(!workbench.contextReply('اكتب تقرير', []).includes('EMPTY_CATALOG_NOT_CHAT_SUBJECT'));
      await waitForPage(page, () => document.getElementById('workbenchReportSource').textContent.includes('تشخيص المنظومة'));
      await page.locator('[data-workbench-action="vscode.catalog"]').click();
      await waitForHost(() => !workbench.busy && workbench.outputs.at(-1).kind === 'VSCODE_ADAPTER_RECEIPT');
      await page.locator('[data-workbench-action="vscode.execute"]').click();
      await waitForHost(() => !workbench.busy && executedCommands.length === 1);
      assert.equal(executedCommands[0], 'workbench.action.findInFiles');
      assert.equal(workbench.currentReportSource().title, 'تشخيص المنظومة');
      await page.screenshot({ path: path.join(directory, name + '-vscode-adapter.png'), fullPage: true });
      await page.locator('[data-workbench-action="watch.scan"]').click();
      await waitForPage(page, () => document.getElementById('workbenchUnread').textContent.includes('1 غير مقروء') && !document.querySelector('[data-workbench-action="watch.scan"]').disabled);
      assert.equal(opportunityStore.summary().count, 1);
      await page.locator('[data-workbench-action="watch.scan"]').click();
      await waitForHost(() => opportunityStore.summary().lastRun?.unchanged === 1 && !workbench.busy);
      assert.equal(opportunityStore.summary().count, 1);
      await page.locator('[data-workbench-action="watch.admin"]').click();
      await waitForHost(() => workbench.outputs.at(-1)?.kind === 'PRIVATE_OPPORTUNITY_REPORT' && !workbench.busy);
      assert.ok(workbench.outputs.at(-1).content.includes('PRIVATEOPPORTUNITYTEST'));
      await page.locator('[data-workbench-action="watch.users"]').click();
      await waitForHost(() => workbench.outputs.at(-1)?.kind === 'APPROVED_USER_DIGEST' && !workbench.busy);
      assert.ok(!workbench.outputs.at(-1).content.includes('PRIVATEOPPORTUNITYTEST'));
      await page.locator('#workbenchOpportunities').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(directory, name + '-opportunities.png'), fullPage: true });
      await page.locator('[data-workbench-action="workflow.start"]').click();
      await waitForHost(()=>draftResolvers.length===1);
      assert.equal(await page.locator('#workbenchWorkflow .wb-agent').count(),6);
      assert.equal(await page.locator('#log .wb-run-trace').count(),1);
      documentOpened=false;
      await page.locator('#workbenchWorkflow .wb-agent button').first().click();
      await waitForHost(()=>documentOpened);
      assert.equal(workbench.busy,true);
      await page.evaluate(()=>{document.getElementById('workbench').scrollTop=0;});
      await page.screenshot({path:path.join(directory,name+'-agents-active.png'),fullPage:true});
      draftResolvers[0]({summary:'مسودة تصميم اصطناعية للمراجعة',reviewRequired:true,text:'TEST_DOUBLE_ONLY'});
      await waitForHost(()=>draftResolvers.length===2);
      draftResolvers[1]({summary:'مراجعة متطلبات اصطناعية',reviewRequired:true,text:'TEST_DOUBLE_ONLY'});
      await waitForHost(()=>!workbench.busy);
      assert.equal(workbench.workflow.snapshot().status,'COMPLETED_WITH_FINDINGS');
      assert.equal(workbench.workflow.snapshot().tasks.filter(t=>t.kind==='LOCAL_MODEL').length,2);
      assert.ok(workbench.outputs.some(output=>output.title==='SHEIKHA_CHAT_PLAN.json'));
      assert.ok(workbench.outputs.at(-1).content.includes('تقرير دورة مهام شيخة'));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      assert.equal(await page.evaluate(()=>document.getElementById('input').getBoundingClientRect().bottom<=innerHeight),true);
      await page.screenshot({path:path.join(directory,name+'-agents-complete.png'),fullPage:true});
      await page.locator('[data-workbench-action="workflow.start"]').click();
      await waitForHost(()=>draftResolvers.length===3);
      await page.locator('[data-workbench-action="workflow.cancel"]').click();
      await waitForHost(()=>!workbench.busy);
      assert.equal(workbench.workflow.snapshot().status,'CANCELLED');
      draftResolvers[2]({summary:'late result ignored',reviewRequired:true});
      assert.equal(workbench.workflow.detail('model-design').result,null);
      await page.locator('[data-workbench-action="cognition.save"]').click();
      await waitForHost(() => !workbench.busy && workbench.cognition.state.memoryCount === 1);
      assert.equal(cognitionMemory.list(fixtureRoot).length,1);
      documentOpened=false;
      await page.locator('[data-workbench-action="cognition.recall"]').click();
      await waitForHost(() => !workbench.busy && documentOpened);
      await page.locator('[data-workbench-action="cognition.start"]').click();
      await waitForHost(() => draftResolvers.length===4);
      draftResolvers[3]({summary:'مسودة محدودة',reviewRequired:true,text:'- Synthetic cognitive draft',metrics:{generatedTokens:10}});
      await waitForHost(() => draftResolvers.length===5);
      draftResolvers[4]({summary:'مراجعة المسودة',reviewRequired:true,text:'- Synthetic review',metrics:{generatedTokens:10}});
      await waitForHost(() => !workbench.busy);
      assert.equal(workbench.workflow.detail('cognition-evidence').result.inferenceExecuted,true);
      assert.equal(workbench.workflow.snapshot().maxConcurrentTasks,1);
      await page.locator('#workbenchCognition').scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
      await page.screenshot({path:path.join(directory,name+'-cognition.png'),fullPage:true});
      await page.locator('[data-workbench-action="cognition.forget"]').click();
      await waitForHost(() => !workbench.busy && workbench.cognition.state.memoryCount===0);
      workbench.cognition.dispose();
      await page.locator('#clear').click();
      await waitForPage(page, () => document.querySelector('#workbenchOutputs .wb-empty') && document.getElementById('input').value === '');
      assert.equal(history.length, 0);
      assert.equal(workbench.integration.latest, null);
      assert.equal(workbench.workflow.snapshot(),null);
      assert.equal(await page.locator('#log .wb-run-trace').count(),0);
      assert.equal(await page.locator('#workbenchComponents li').count(), 0);
      assert.deepEqual(errors, []); assert.deepEqual(requests, []);
      results.push({ name, width, height, noOverflow: true, fiveDepartments: true, reviewExecuted: true,
        outputOpenAndCopy: true, draftNotAutoSent: true, memoryCleared: true, integrationComponents: 18,
        reportFollowsConversationNotSidebar: true, vscodeNativePickerAndReceipt: true,
        opportunityInboxAndReports: true, opportunityDuplicateSuppression: true, managementReportExcludedFromUserDigest: true,
        sourceChangeDetected: true, duplicateAlertSuppressed: true, integrationEvidenceCleared: true,
        observationButtonsExecutedWithTestDouble: true, deliveryMissingEvidenceReported: true,
        workflowStartUpdatesDetailsAndClosure: true, sixTaskWorkflow: true, cancellationAndLateResultFence: true,
        explicitMemorySaveRecallForget: true, serialCognitiveCycleWithTestDouble: true,
        pageErrors: 0, externalRequests: 0 });
      await context.close();
    }
  } finally { await browser.close(); fs.rmSync(fixtureRoot, { recursive: true, force: true }); }
  fs.writeFileSync(path.join(directory, 'architecture.ar.md'), architectureMarkdown(), { mode: 0o600 });
  fs.writeFileSync(path.join(directory, 'verification.json'), JSON.stringify({ results,
    vscodeHost: 'TEST_DOUBLE', actualExtensionInstallationVerified: false, output: directory }, null, 2), { mode: 0o600 });
  for (const file of fs.readdirSync(directory)) { const target=path.join(directory,file); fs.chmodSync(target, fs.statSync(target).isDirectory() ? 0o700 : 0o600); }
  console.log(JSON.stringify({ results, output: directory }));
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
