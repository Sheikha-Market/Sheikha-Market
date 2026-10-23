'use strict';
(() => {
  const config = __CONFIG__;
  const api = globalThis.SheikhaSensory;
  const $ = selector => document.querySelector(selector);
  const translations = {
    observatory:['الرصد والتفسير','Observation & interpretation'],title:['مرصد المستشعرات','Sensor Observatory'],readOnly:['قراءة فقط','Read only'],concept:['تصور معماري','Architectural concept'],transport:['اتصال الأجهزة: غير مهيأ','Device transport: not configured'],import:['استيراد قراءات','Import readings'],export:['تصدير التقرير','Export report'],sample:['عينة JSON','Sample JSON'],reset:['إعادة العينة','Reset sample'],received:['مصادر بقراءات','Sources with readings'],review:['تحتاج مراجعة','Needs review'],stale:['قديمة','Stale'],missing:['دون قراءة','No reading'],readings:['القراءات','Readings'],audit:['سجل التدقيق','Audit log'],sources:['المصادر','Sources'],domain:['المجال','Domain'],all:['الكل','All'],environment:['البيئة','Environment'],industrial:['الصناعة','Industry'],home:['المنزل','Home'],space:['الفضاء','Space'],state:['الحالة','Status'],within:['ضمن المرجع','Within reference'],sourceReading:['المصدر والقراءة','Source & reading'],empty:['لا توجد نتائج مطابقة.','No matching results.'],referenceNote:['نطاق مرجعي تجريبي، وليس حدًا للسلامة.','Illustrative reference range, not a safety limit.'],registered:['مصادر مسجلة للاختبار','Registered test sources'],noAuth:['توثيق الأجهزة والمعايرة: غير متحقق','Device authentication and calibration: unverified'],footer:['شيخة | الرصد والمعرفة','SHEIKHA | Observation & knowledge'],actuation:['أوامر الأجهزة: معطلة','Device commands: disabled'],previewTitle:['مراجعة ملف القراءات','Review readings file'],importNote:['الملف غير موثّق المصدر. ستستبدل قراءاته العينة الحالية محليًا.','Source is unverified. These readings will replace the current local sample.'],cancel:['إلغاء','Cancel'],confirm:['فتح القراءات','Open readings'],synthetic:['بيانات اختبار اصطناعية','Synthetic test data'],imported:['ملف مستورد، غير موثّق المصدر','Imported file, unverified source'],search:['بحث بالمصدر أو الاسم','Search source or name'],calibration:['المعايرة المعلنة','Declared calibration'],quality:['الجودة المعلنة','Declared quality'],original:['القيمة الأصلية','Original value'],observed:['وقت الرصد','Observed at'],sequence:['رقم التسلسل','Sequence'],uncertainty:['عدم اليقين المعلن','Declared uncertainty'],reference:['النطاق المرجعي','Reference range'],unknown:['غير معلوم','Unknown'],current:['سارية وفق التصريح','Declared current'],expired:['منتهية وفق التصريح','Declared expired'],valid:['صالحة وفق التصريح','Declared valid'],suspect:['مشتبه بها','Suspect'],invalid:['غير صالحة','Invalid'],sampleLoaded:['فُتحت العينة الاصطناعية.','Synthetic sample loaded.'],importSuccess:['فُتحت القراءات محليًا دون توثيق مصدرها.','Readings opened locally; source remains unverified.'],rejected:['رُفض الملف، ولم تتغير القراءات الحالية.','File rejected; current readings unchanged.'],seconds:['ثانية','s'],results:['نتيجة','results'],accepted:['قُبلت دفعة','Batch accepted'],importRejected:['رُفض استيراد','Import rejected'],records:['قراءة','readings'],file:['الملف','File'],hash:['بصمة الملف SHA-256','File SHA-256'],close:['إغلاق','Close'],none:['لا توجد بيانات للعرض','No data to display'],noSavedFile:['العينة الحالية','Current sample'],evaluated:['آخر تقييم','Evaluated'],retained:['نقاط السجل','Retained points'],approval:['موافقة إنتاجية: غير ممنوحة','Production approval: not granted'],loaded:['تصدير محلي','Local export']
  };
  let lang='ar',hub,selected=config.sources[0].id,view='readings',pending=null,provenance=null,rejections=[];
  const tr = key => translations[key]?.[lang==='en'?1:0] || key;
  const num = value => new Intl.NumberFormat(lang==='en'?'en':'ar',{maximumFractionDigits:3}).format(value);
  const date = value => new Intl.DateTimeFormat(lang==='en'?'en-GB':'ar-SA',{dateStyle:'short',timeStyle:'medium',timeZone:'Asia/Riyadh'}).format(new Date(value));
  const node = (tag,text,className) => {const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
  const valueText = source => !source.latest || source.status==='INVALID' ? '—' : `${num(source.latest.normalized.value)} ${source.canonicalUnit}`;
  function statusNode(source){return node('span',api.STATUS[source.status][lang==='en'?1:0],`badge ${source.status}`);}
  function facts(target,rows){target.replaceChildren();for(const [label,value,direction] of rows){const item=node('dd'),text=node('bdi',value);if(direction)text.dir=direction;item.append(text);target.append(node('dt',label),item);}}
  function message(text,error=false){$('#message').textContent=text;$('#message').classList.toggle('error',error);}
  function auditEvents(snapshot){return [...snapshot.audit,...rejections].sort((a,b)=>b.at.localeCompare(a.at));}
  function reset(){const now=Date.now();hub=new api.SensoryHub(config,{tenantId:config.tenantId,origin:'SYNTHETIC'});hub.ingest(api.demoBatch(config,now),now);provenance=null;rejections=[];selected=config.sources[0].id;render();message(tr('sampleLoaded'));}
  function filtered(sources){const term=$('#search').value.trim().toLowerCase(),domain=$('#domain').value,state=$('#state').value;return sources.filter(s=>(domain==='all'||s.domain===domain)&&(state==='all'||state==='review'&&!['WITHIN','MISSING'].includes(s.status)||s.status===state)&&`${s.id} ${s.labelAr} ${s.labelEn}`.toLowerCase().includes(term));}
  function chart(source){
    const target=$('#chart');target.replaceChildren();
    const records=source.history;
    const usable=records.filter(r=>r.quality!=='INVALID');
    if(!usable.length){target.append(node('div',tr('none'),'empty-chart'));return;}
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 480 170');svg.setAttribute('direction','ltr');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${lang==='en'?source.labelEn:source.labelAr}: ${records.length} ${tr('records')}`);
    const minimum=Math.min(source.referenceMin,...usable.map(r=>r.normalized.value)),maximum=Math.max(source.referenceMax,...usable.map(r=>r.normalized.value));
    const pad=(maximum-minimum||1)*.15,low=minimum-pad,high=maximum+pad;
    const at0=Date.parse(records[0].observedAt),at1=Date.parse(records.at(-1).observedAt);
    const x=r=>42+(Date.parse(r.observedAt)-at0)/(at1-at0||1)*424,y=v=>138-(v-low)/(high-low)*118;
    const add=(tag,attrs,text)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;svg.append(e);};
    for(let i=0;i<3;i++){const v=low+(high-low)*i/2;add('line',{x1:42,x2:466,y1:y(v),y2:y(v),class:'gridline'});add('text',{x:36,y:y(v)+4,'text-anchor':'end'},new Intl.NumberFormat('en',{maximumFractionDigits:1}).format(v));}
    for(const v of[source.referenceMin,source.referenceMax])add('line',{x1:42,x2:466,y1:y(v),y2:y(v),class:'reference'});
    let d='',open=false;for(const r of records){if(r.quality==='INVALID'){open=false;continue;}d+=`${open?'L':'M'}${x(r).toFixed(2)},${y(r.normalized.value).toFixed(2)} `;open=true;}
    add('path',{d,class:'trace'});const last=usable.at(-1);add('circle',{cx:x(last),cy:y(last.normalized.value),r:3,class:'point'});
    const short=t=>new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Asia/Riyadh'}).format(new Date(t));
    add('text',{x:42,y:160,'text-anchor':'start'},short(records[0].observedAt));add('text',{x:466,y:160,'text-anchor':'end'},short(records.at(-1).observedAt));target.append(svg);
  }
  function details(source){
    $('#detail-domain').textContent=tr(source.domain);$('#detail-title').textContent=lang==='en'?source.labelEn:source.labelAr;$('#detail-id').textContent=source.id;
    const badge=statusNode(source);$('#detail-status').className=badge.className;$('#detail-status').textContent=badge.textContent;
    const number=$('#detail-value');number.replaceChildren(node('bdi',!source.latest||source.status==='INVALID'?'—':num(source.latest.normalized.value)),node('small',source.canonicalUnit));
    chart(source);$('#narrative').textContent=api.narrative(source,lang);
    const r=source.latest;
    facts($('#facts'),[[tr('observed'),r?date(r.observedAt)+' +03':tr('unknown')],[tr('original'),r?`${num(r.value)} ${r.unit}`:tr('unknown'),r?'ltr':undefined],[tr('uncertainty'),r?.normalized.uncertainty===null||!r?tr('unknown'):`± ${num(r.normalized.uncertainty)} ${r.normalized.unit}`,r?.normalized.uncertainty!==null&&r?'ltr':undefined],[tr('calibration'),r?tr(r.calibration.toLowerCase()):tr('unknown')],[tr('quality'),r?tr(r.quality.toLowerCase()):tr('unknown')],[tr('sequence'),r?String(r.sequence):tr('unknown')],[tr('reference'),`${num(source.referenceMin)} – ${num(source.referenceMax)} ${source.canonicalUnit}`,'ltr'],[tr('retained'),num(source.history.length)]]);
  }
  function render(){
    const focusedSource=document.activeElement?.dataset?.source;
    const s=hub.snapshot();
    $('#origin').textContent=tr(s.origin==='SYNTHETIC'?'synthetic':'imported');$('#evaluation-time').textContent=`${tr('evaluated')}: ${date(s.evaluatedAt)} +03`;
    $('#count-received').textContent=num(s.sources.filter(x=>x.latest).length);$('#count-review').textContent=num(s.sources.filter(x=>!['WITHIN','MISSING'].includes(x.status)).length);$('#count-stale').textContent=num(s.sources.filter(x=>x.issues.includes('STALE')).length);$('#count-missing').textContent=num(s.sources.filter(x=>!x.latest).length);
    const rows=filtered(s.sources),target=$('#reading-rows');target.replaceChildren();$('#empty').hidden=rows.length>0;$('#result-count').textContent=`${num(rows.length)} ${tr('results')}`;
    if(rows.length&&!rows.some(r=>r.id===selected))selected=rows[0].id;
    for(const r of rows){const row=node('button',undefined,'reading-row');row.type='button';row.dataset.source=r.id;row.setAttribute('aria-pressed',String(selected===r.id));const left=node('span',undefined,'row-main');left.append(node('strong',lang==='en'?r.labelEn:r.labelAr),node('code',r.id),node('span',valueText(r),'row-value'));const right=node('span',undefined,'row-state');right.append(statusNode(r),node('span',r.ageSeconds===null?tr('missing'):`${num(Math.floor(r.ageSeconds))} ${tr('seconds')}`,'row-age'));row.append(left,right);row.addEventListener('click',()=>{selected=r.id;render();});target.append(row);}
    target.querySelectorAll('.row-value').forEach(e=>{const value=node('bdi',e.textContent);value.dir='ltr';e.replaceChildren(value);});
    $('.detail').hidden=!rows.length;if(rows.length)details(s.sources.find(x=>x.id===selected));
    const log=$('#audit-log');log.replaceChildren();for(const event of auditEvents(s)){const row=node('div',undefined,'audit-entry');row.append(node('time',date(event.at)),node('span',event.event==='BATCH_ACCEPTED'?`${tr('accepted')}: ${num(event.records)} ${tr('records')}`:tr('importRejected')),node('code',event.code||event.origin));log.append(row);}
    const list=$('#sources-list');list.replaceChildren();for(const r of s.sources){const item=node('div',undefined,'source-item');const a=node('div');a.append(node('strong',lang==='en'?r.labelEn:r.labelAr),node('code',r.id));const b=node('div');b.append(node('strong',tr(r.domain)),node('span',r.metric+' / '+r.canonicalUnit));const c=node('div');c.append(node('strong',tr('readOnly')),node('span',tr('noAuth')));item.append(a,b,c);list.append(item);}
    $('#file-provenance').textContent=provenance?`${provenance.name} · SHA-256 ${provenance.sha256}`:tr('noSavedFile');
    if(focusedSource)Array.from(document.querySelectorAll('.reading-row')).find(e=>e.dataset.source===focusedSource)?.focus({preventScroll:true});
  }
  function language(){
    document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.title=`${lang==='ar'?'شيخة':'SHEIKHA'} | ${tr('title')}`;
    document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tr(e.dataset.i18n));
    $('#language span').textContent=lang==='ar'?'EN':'عربي';$('#language').title=lang==='ar'?'English':'العربية';$('#language').setAttribute('aria-label',$('#language').title);
    $('#search').placeholder=tr('search');$('#search').setAttribute('aria-label',tr('search'));$('.dialog-heading button').title=tr('close');$('.dialog-heading button').setAttribute('aria-label',tr('close'));
    message('');render();
  }
  function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)+'\n'],{type:'application/json'}));const a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  $('#language').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';language();});$('#reset').addEventListener('click',reset);
  for(const id of ['search','domain','state'])$('#'+id).addEventListener(id==='search'?'input':'change',render);
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(b=>{if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});for(const name of ['readings','audit','sources'])$('#view-'+name).hidden=name!==view;render();}));
  $('#export').addEventListener('click',()=>{const snapshot=hub.snapshot();download({...snapshot,audit:auditEvents(snapshot),fileProvenance:provenance},'sheikha-sensory-report.json');});
  $('#sample').addEventListener('click',()=>download(api.demoBatch(config),'sheikha-sensory-sample.json'));
  $('#import').addEventListener('click',()=>$('#file').click());
  $('#file').addEventListener('change',async()=>{
    const file=$('#file').files[0];if(!file)return;$('#import').disabled=true;
    try{
      if(file.size>512*1024)throw Error('FILE_TOO_LARGE');
      const bytes=await file.arrayBuffer();const raw=new TextDecoder('utf-8',{fatal:true}).decode(bytes),packet=JSON.parse(raw);
      const candidate=new api.SensoryHub(config,{tenantId:config.tenantId,origin:'IMPORTED_UNVERIFIED'});const result=candidate.ingest(packet);
      const hash=await crypto.subtle.digest('SHA-256',bytes),sha256=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
      pending={packet,provenance:{name:file.name,sha256,bytes:file.size}};
      $('#preview-text').textContent=file.name;facts($('#preview-facts'),[[tr('records'),num(packet.observations.length)],[tr('received'),num(result.sources.filter(s=>s.latest).length)],[tr('hash'),sha256]]);$('#preview').returnValue='cancel';$('#preview').showModal();
    }catch(error){pending=null;const code=/^[A-Z0-9_]+$/.test(error.message)?error.message:'INVALID_JSON_FILE';rejections.push({event:'IMPORT_REJECTED',at:new Date().toISOString(),code});if(rejections.length>100)rejections.shift();message(`${tr('rejected')} ${code}`,true);render();}
    finally{$('#import').disabled=false;$('#file').value='';}
  });
  $('#preview').addEventListener('close',()=>{
    if($('#preview').returnValue==='confirm'&&pending){try{const candidate=new api.SensoryHub(config,{tenantId:config.tenantId,origin:'IMPORTED_UNVERIFIED'});candidate.ingest(pending.packet);hub=candidate;provenance=pending.provenance;render();message(tr('importSuccess'));}catch(e){message(tr('rejected'),true);}}
    pending=null;
  });
  reset();setInterval(()=>{if(!document.hidden&&!$('#preview').open)render();},5000);
})();
