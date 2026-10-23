'use strict';

const { ACTIONS } = require('../chat/sheikhaChatWorkbench');

const workbenchCss = `
.app{height:100dvh;min-height:0;grid-template-rows:auto auto auto minmax(0,1fr) auto}
.workspace-shell{display:grid;grid-template-columns:minmax(0,1fr) 310px;min-height:0;align-items:stretch;overflow:hidden}
.workspace-shell>.conversation{min-width:0;overflow:auto}
.workbench{border-inline-start:1px solid var(--line);padding:12px;min-width:0;background:var(--surface);overflow:auto}
.workbench>summary{font-weight:650;cursor:pointer;display:flex;justify-content:space-between;gap:8px}
.workbench section{padding:12px 0;border-bottom:1px solid var(--line);min-width:0}
.workbench h2{font-size:12px;font-weight:600;margin:0 0 8px;color:var(--muted)}
.wb-toolbar{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.wb-toolbar button{flex:1;height:auto;min-height:30px;white-space:normal}
.wb-toolbar button[data-workbench-action="integration"]{flex-basis:100%}
.wb-toolbar button[data-workbench-action="delivery"]{flex-basis:100%}
.wb-local-tools{display:grid;gap:6px}.wb-local-tools button{min-height:32px;height:auto;white-space:normal}
.wb-watch-tools{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.wb-watch-tools button{height:auto;min-height:32px;white-space:normal;overflow-wrap:anywhere}
#workbenchOpportunities{margin-top:12px;max-height:280px;overflow:auto}#workbenchWatchStatus{margin:8px 0;overflow-wrap:anywhere;font-size:11px}
.wb-workflow-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;margin:10px 0}
.wb-workflow-tools button{min-height:32px;height:auto;white-space:normal}
.wb-agent{border-bottom:1px solid var(--line);padding:9px 0;min-width:0}
.wb-agent button{background:transparent;text-align:start;width:100%;height:auto;min-height:32px;white-space:normal;padding:4px 0;border:0}
.wb-agent small{display:block;color:var(--muted);font-size:10px;overflow-wrap:anywhere}
.wb-agent-group{font-size:11px;font-weight:600;margin:12px 0 4px}
.wb-run-trace{border-block:1px solid var(--line);padding:12px 0;min-width:0;overflow-wrap:anywhere;font-size:12px}
.wb-run-trace summary{cursor:pointer;font-weight:600}.wb-run-trace ol{padding-inline-start:20px;margin:10px 0;display:grid;gap:6px}
.wb-run-trace time{direction:ltr;unicode-bidi:isolate}.wb-run-trace .wb-state{font-size:11px}
.wb-run-trace summary bdi,.wb-run-trace .wb-elapsed{display:inline-block;margin-inline-end:6px;unicode-bidi:isolate}
.wb-run-goal{white-space:pre-wrap;line-height:1.7;margin:8px 0}.wb-agent-kind{color:var(--muted)}
.wb-state[data-status="REVIEW_REQUIRED"],.wb-state[data-status="COMPLETED_WITH_FINDINGS"]{color:var(--warn)}
.wb-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.wb-list li{min-width:0;overflow-wrap:anywhere;font-size:11px}
.wb-row{display:flex;justify-content:space-between;gap:8px;align-items:start;min-width:0}
.wb-row span{min-width:0;overflow-wrap:anywhere}.wb-state{color:var(--muted);font-size:10px;flex-shrink:0}
.wb-state[data-status="RUNNING"]{color:var(--warn)}
.wb-state[data-status="COMPLETED"],.wb-state[data-status="CHECKED"]{color:var(--good)}
.wb-state[data-status="FAILED"],.wb-state[data-status="NEEDS_CONFIGURATION"]{color:var(--bad)}
.wb-empty{color:var(--muted);font-size:11px}.wb-actions{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0}
.wb-actions button{font-size:10px;height:27px;min-width:34px}
.wb-sources{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
.wb-sources button{height:auto;min-height:34px;white-space:normal;font-size:11px;overflow-wrap:anywhere}
.wb-flow{display:grid;gap:5px;padding:0;margin:0;list-style:none}
.wb-flow li{padding:7px 0;border-bottom:1px solid var(--line);font-size:11px;overflow-wrap:anywhere}
.wb-flow small{display:block;color:var(--muted);margin-top:3px}.wb-domain-title{font-weight:600}
#workbenchProgress{width:100%;height:5px;accent-color:var(--good);margin:8px 0}
#workbenchStatus{font-size:10px;color:var(--muted)}
#workbenchIntegration summary{font-size:12px;cursor:pointer;margin-bottom:8px}
#workbenchIntegrationTime{font-size:10px;color:var(--muted);overflow-wrap:anywhere;margin-bottom:8px}
.workbench time{display:inline-block;direction:ltr;unicode-bidi:isolate}
#workbenchComponents{max-height:230px;overflow:auto;padding-inline-end:6px}
#workbenchChanges{border-inline-start:2px solid var(--warn);padding-inline-start:8px}
@media(max-width:850px){.workspace-shell{grid-template-columns:minmax(0,1fr);grid-template-rows:minmax(100px,1fr) auto}.workbench{border-inline-start:0;border-top:1px solid var(--line);max-height:45vh;scrollbar-width:thin}}
`;

function renderWorkbench() {
  const buttons = group => ACTIONS.filter(action => action.group === group).map(action => (
    `<button type="button" data-workbench-action="${action.id}" title="${action.label}${action.approval ? '، بموافقة خارجية' : ''}" disabled>${action.label}${action.approval ? ' ↗' : ''}</button>`
  )).join('');
  return `<details class="workbench" id="workbench" open>
  <summary><span>مركز عمل شيخة</span><span id="workbenchStatus" role="status">جارٍ التحقق</span></summary>
  <div class="workbench-body">
    <section><h2>الوكلاء والمهام · Subagents</h2><div class="wb-workflow-tools">${buttons('workflow')}</div><div id="workbenchWorkflow" aria-live="polite"><span class="wb-empty">لا دورة مهام بعد</span></div></section>
    <section><h2>العقل والمنطق والذاكرة</h2><div class="wb-watch-tools">${buttons('cognition')}</div><div id="workbenchCognition" class="wb-empty" role="status"></div></section>
    <div class="wb-toolbar">${buttons('management')}</div>
    <div id="workbenchReportSource" class="wb-empty" role="status"></div>
    <section><h2>موصل VS Code</h2><div class="wb-local-tools">${buttons('vscode')}</div></section>
    <section><h2>الرصد والفرص <span id="workbenchUnread"></span></h2><div class="wb-watch-tools">${buttons('watch')}</div><div id="workbenchWatchStatus" role="status"></div><ul class="wb-list" id="workbenchOpportunities"></ul></section>
    <section><h2>البيانات والحساب</h2><div class="wb-local-tools">${buttons('observation')}</div></section>
    <section><details id="workbenchIntegration"><summary>سلاسل التكامل <span id="workbenchIntegrationCount"></span></summary><div id="workbenchIntegrationTime">لم يُفحص المصدر</div><ul class="wb-list" id="workbenchComponents"></ul></details><div id="workbenchNotice" role="status"></div><ul class="wb-list" id="workbenchChanges"></ul></section>
    <section><h2>التقدم</h2><progress id="workbenchProgress" max="1" value="0"></progress><ul class="wb-list" id="workbenchEvents"><li class="wb-empty">لا عمليات مسجلة</li></ul></section>
    <section><h2>المخرجات</h2><ul class="wb-list" id="workbenchOutputs"><li class="wb-empty">لا مخرجات بعد</li></ul></section>
    <section><h2>المصادر <span id="workbenchMemory"></span></h2><div class="wb-sources">${buttons('sources')}</div><ul class="wb-list" id="workbenchSources"></ul></section>
    <section><h2>فحوص الإدارات المحلية</h2><ul class="wb-list" id="workbenchTasks"><li class="wb-empty">لم تبدأ مراجعة</li></ul></section>
    <section><h2>الهيكل الإداري والمعمارية</h2><ol class="wb-flow" id="workbenchDomains"></ol></section>
  </div>
</details>`;
}

const workbenchScript = `
const wbButtons = Array.from(document.querySelectorAll('[data-workbench-action]'));
let wbRunning = false;
let wbWorkflowState = null;
const wbTraces = new Map();
const wbStatuses = {RUNNING:'يعمل',CANCELLING:'جارٍ الإيقاف',COMPLETED:'انتهى',COMPLETED_READ_ONLY:'انتهى الفحص',COMPLETED_WITH_FINDINGS:'انتهى مع ملاحظات',REVIEW_REQUIRED:'يحتاج مراجعة',TIMED_OUT:'انتهت المهلة',CANCELLED:'ألغي',FAILED:'تعذر',QUEUED:'بانتظار',CHECKED:'فُحص التسجيل',NEEDS_CONFIGURATION:'يحتاج إعدادًا'};
function wbText(tag, text, className) {
  const node = document.createElement(tag); node.textContent = String(text || '');
  if (className) node.className = className; return node;
}
function wbInvoke(action, id) {
  const control=['workflow.cancel','workflow.detail','watch.stop'].includes(action);
  if (!control && (wbRunning || busy || activeToolId)) return;
  vscode.postMessage(Object.assign({command:'workbench', action:action}, id ? {id:id} : {}));
}
wbButtons.forEach(button => button.addEventListener('click', () => wbInvoke(button.dataset.workbenchAction)));
function wbList(id, entries, empty, render) {
  const list = document.getElementById(id); list.replaceChildren();
  if (!entries.length && empty) list.appendChild(wbText('li', empty, 'wb-empty'));
  entries.forEach(item => { const li = document.createElement('li'); render(li,item); list.appendChild(li); });
}
function wbRow(li, item) {
  const row = document.createElement('div'); row.className = 'wb-row';
  const state = wbText('span', wbStatuses[item.status] || item.status || '', 'wb-state'); state.dataset.status = item.status || '';
  row.append(wbText('span',item.label),state); li.appendChild(row);
}
function updateWorkbench(data) {
  if (!data || !Array.isArray(data.domains)) return;
  wbRunning = data.busy === true;
  document.getElementById('workbenchStatus').textContent = wbRunning ? 'يعمل' : 'محلي';
  document.getElementById('workbenchMemory').textContent = '(' + Number(data.memoryMessages || 0) + ' رسالة)';
  document.getElementById('workbenchReportSource').textContent = data.reportContext
    ? 'مصدر التقرير: ' + data.reportContext.title + (data.reportContext.selection === 'EXPLICIT' ? ' · اختيار صريح' : '') : 'مصدر التقرير غير محدد';
  wbButtons.forEach(button => {
    const action = (data.actions || []).find(item=>item.id===button.dataset.workbenchAction);
    button.disabled=button.dataset.workbenchAction==='watch.stop' ? !(data.opportunities?.running || data.opportunities?.scheduled) : button.dataset.workbenchAction==='workflow.cancel'
      ? data.workflow?.status!=='RUNNING' : wbRunning || !action || !action.available;
  });
  updateWorkflow(data.workflow);
  const cognition=data.cognition || {};
  const cognitiveStatus=document.getElementById('workbenchCognition');
  cognitiveStatus.replaceChildren(wbText('div',(wbStatuses[cognition.status] || (cognition.status==='IDLE'?'لم تبدأ دورة':cognition.status) || 'غير مفحوص')),
    wbText('div','الملاحظات السارية: '+(cognition.memoryCount===null || cognition.memoryCount===undefined?'لم تُقرأ':cognition.memoryCount)));
  if(cognition.lastPulseAt)cognitiveStatus.append(wbText('div','آخر نبض تشغيل · '+cognition.pulseCount),wbText('time',cognition.lastPulseAt));
  const watch=data.opportunities || {};
  document.getElementById('workbenchUnread').textContent=watch.unread ? '('+watch.unread+' غير مقروء)' : '';
  const watchStatus=document.getElementById('workbenchWatchStatus');
  watchStatus.replaceChildren(wbText('div',watch.lastError ? 'تعذر الرصد أو قراءة السجل؛ يلزم التحقق' : watch.running ? 'جارٍ الرصد' :
    (watch.scheduled ? 'كل ساعة · جلسة الإضافة الحالية' : 'الرصد الدوري متوقف')));
  if(watch.lastRun)watchStatus.append(wbText('span',({COMPLETE:'اكتمل',PARTIAL:'جزئي',FAILED:'تعذر'}[watch.lastRun.status] || '')+' · '),wbText('time',watch.lastRun.checkedAt));
  else watchStatus.append(wbText('div','لم يُجرَ رصد شبكي بعد','wb-empty'));
  if(watch.reportCenter)watchStatus.append(wbText('div','مركز التقارير · '+watch.reportCenter.profiles.length+' مستفيد · '+watch.reportCenter.outbox.length+' مسودة محلية','wb-empty'));
  wbList('workbenchOpportunities',watch.items || [],'لا فرص في السجل',(li,item)=>{
    li.append(wbText('strong',item.title),wbText('div',item.category+' · '+(item.read?'مقروء':'جديد'),'wb-empty'),
      wbText('div',item.score===null?'غير مقيّم':'أولوية مراجعة '+item.score+'/100','wb-empty'));
  });
  const integration=data.integration || {}; const latest=integration.latest;
  const components=latest ? latest.components : [];
  document.getElementById('workbenchIntegrationCount').textContent=latest ? '('+components.length+')' : '';
  const integrationTime=document.getElementById('workbenchIntegrationTime');
  integrationTime.replaceChildren();
  if (latest) integrationTime.append(wbText('span','مصادر فقط · '),wbText('time',latest.checkedAt));
  else integrationTime.textContent='لم يُفحص المصدر';
  document.getElementById('workbenchNotice').textContent=integration.newChangeCount ? integration.newChangeCount+' مستجد محلي يحتاج مراجعة' : '';
  wbList('workbenchComponents',components,'',(li,item)=>{
    li.append(wbText('strong',item.label),wbText('div',item.state==='SOURCES_PRESENT' ? 'المصدر موجود · التشغيل غير متحقق' : 'دليل المصدر غير مكتمل','wb-empty'));
  });
  wbList('workbenchChanges',(integration.changes || []).slice(-4),'',(li,item)=>{
    const detail=wbText('div','','wb-empty');
    detail.append(wbText('span','تغيّر دليل المصدر · '),wbText('time',item.observedAt));
    li.append(wbText('strong',item.label),detail);
  });
  const events = data.events || []; const progress = document.getElementById('workbenchProgress');
  progress.max = Math.max(events.length,1); progress.value = events.filter(item=>item.status !== 'RUNNING').length;
  wbList('workbenchEvents',events.slice(-6),'لا عمليات مسجلة',wbRow);
  wbList('workbenchTasks',data.tasks || [],'لم تبدأ مراجعة',wbRow);
  wbList('workbenchSources',(data.sources || []).slice(-6),'', (li,item)=>li.appendChild(wbText('span',item.label)));
  wbList('workbenchOutputs',data.outputs || [],'لا مخرجات بعد',(li,item)=>{
    li.appendChild(wbText('strong',item.title));
    const controls=document.createElement('div'); controls.className='wb-actions';
    [['open','فتح'],['copy','نسخ'],['export','تصدير'],['attach','إلى المسودة']].forEach(([action,label])=>{
      const button=wbText('button',label);button.type='button';button.title=label+' '+item.title;
      button.disabled=wbRunning;button.addEventListener('click',()=>wbInvoke('output.'+action,item.id));controls.appendChild(button);
    });li.appendChild(controls);
  });
  wbList('workbenchDomains',data.domains,'',(li,item)=>{
    li.append(wbText('span',item.name,'wb-domain-title'),wbText('small',item.owner),
      wbText('small',(item.components || []).join(' ← ')),
      wbText('small',item.registered+'/'+item.total+' أوامر مسجلة · الخلفية غير مقاسة'));
  });
}

function wbElapsed(run) {
  const start=Date.parse(run.startedAt),end=run.finishedAt ? Date.parse(run.finishedAt) : Date.now();
  const seconds=Math.max(0,Math.floor((end-start)/1000));
  return Number.isFinite(seconds) ? Math.floor(seconds/60)+'د '+(seconds%60)+'ث' : 'غير مقاس';
}
function updateWorkflow(run) {
  const host=document.getElementById('workbenchWorkflow');
  if (!run) {
    wbWorkflowState=null;host.replaceChildren(wbText('span','لا دورة مهام بعد','wb-empty'));
    wbTraces.forEach(node=>node.remove());wbTraces.clear();return;
  }
  if (wbWorkflowState?.id===run.id && wbWorkflowState.sequence>run.sequence) return;
  wbWorkflowState=run;host.replaceChildren();
  const state=wbText('span',wbStatuses[run.status] || run.status,'wb-state');state.dataset.status=run.status;
  host.append(state,wbText('div',run.completed+'/'+run.total+' مهام منتهية','wb-empty'));
  const groups=[['النشطة',task=>task.status==='RUNNING'],['بانتظار',task=>task.status==='QUEUED'],['المنتهية',task=>!['RUNNING','QUEUED'].includes(task.status)]];
  groups.forEach(([label,filter])=>{
    const tasks=run.tasks.filter(filter);if(!tasks.length)return;
    host.appendChild(wbText('div',label+' · '+tasks.length,'wb-agent-group'));
    tasks.forEach(task=>{
      const item=document.createElement('div');item.className='wb-agent';
      const button=wbText('button',task.label);button.type='button';button.title='تفاصيل المهمة ودليلها';
      button.addEventListener('click',()=>wbInvoke('workflow.detail',task.id));
      const status=wbText('small',wbStatuses[task.status] || task.status,'wb-state');status.dataset.status=task.status;
      item.append(button,status,wbText('small',(task.kind==='LOCAL_MODEL'?'وكيل نموذج محلي':'عامل أداة محلية')+' · '+task.adapter));
      if(task.summary)item.appendChild(wbText('small',task.summary));
      host.appendChild(item);
    });
  });
  let trace=wbTraces.get(run.id);
  if(!trace || !trace.isConnected){
    trace=document.createElement('details');trace.className='wb-run-trace';trace.open=true;
    document.getElementById('log').appendChild(trace);wbTraces.set(run.id,trace);
    if(wbTraces.size>3){const first=wbTraces.keys().next().value;wbTraces.get(first).remove();wbTraces.delete(first);}
  }
  trace.replaceChildren();
  const running=['RUNNING','CANCELLING'].includes(run.status);
  const heading=document.createElement('summary');
  heading.append(wbText('bdi',running?'بدأ العمل':'انتهى العمل'),wbText('bdi',running?'Started working':'Worked'),wbText('span',wbElapsed(run),'wb-elapsed'));
  trace.append(heading,wbText('div',run.goal,'wb-run-goal'));
  const list=document.createElement('ol');
  run.events.slice(-6).forEach(event=>{
    const row=document.createElement('li');
    const task=run.tasks.find(item=>item.id===event.taskId);
    row.append(wbText('span',event.message));
    if(task){const button=wbText('button','تفاصيل');button.type='button';button.title=task.label;button.addEventListener('click',()=>wbInvoke('workflow.detail',task.id));row.appendChild(button);}
    list.appendChild(row);
  });
  trace.append(list,wbText('div',wbStatuses[run.status] || run.status,'wb-state'));
}
const wbClock=setInterval(()=>{
  if(!wbWorkflowState || !['RUNNING','CANCELLING'].includes(wbWorkflowState.status))return;
  const clock=wbTraces.get(wbWorkflowState.id)?.querySelector('.wb-elapsed');if(clock)clock.textContent=wbElapsed(wbWorkflowState);
},1000);
window.addEventListener('unload',()=>clearInterval(wbClock));
`;

module.exports = { workbenchCss, renderWorkbench, workbenchScript };
