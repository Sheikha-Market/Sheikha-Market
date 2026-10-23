'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/tmp/sheikha-architecture-tools/node_modules/playwright');
const ROOT=path.resolve(__dirname,'..');
const latest=JSON.parse(fs.readFileSync(path.join(ROOT,'runtime/sensory-hub/latest.json')));
const entry=path.join(ROOT,'runtime/sensory-hub',latest.snapshot,'index.html');
const SCREENSHOTS='/tmp/sheikha-sensory-screenshots';
function record(extra={}){return {sourceId:'ENV-TEMP-01',sequence:1,observedAt:new Date(Date.now()-1000).toISOString(),value:25,unit:'Cel',quality:'VALID',calibration:'CURRENT',uncertainty:0.1,...extra};}
const packet=records=>({schemaVersion:1,tenantId:'sheikha-local-lab',observations:records});
const input=(value,name='readings.json')=>({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
async function environment(){
  const browser=await chromium.launch({executablePath:'/opt/google/chrome/chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
  await page.goto(pathToFileURL(entry).href);await page.locator('.reading-row').first().waitFor();
  return {browser,page,errors,external};
}
async function noOverflow(page){
  const r=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('button,h1,h2,p,code,dd,.badge,.totals span')].filter(e=>e.getClientRects().length && (e.scrollWidth>e.clientWidth+2 && getComputedStyle(e).display!=='inline')).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,60),scroll:e.scrollWidth,client:e.clientWidth}))}));
  assert.ok(r.document<=r.width+1,JSON.stringify(r));assert.deepEqual(r.bad,[],JSON.stringify(r.bad));
}
test('Arabic and English console renders across four viewport widths with valid assets and no network',async()=>{
  const {browser,page,errors,external}=await environment();
  const checks=[];fs.mkdirSync(SCREENSHOTS,{recursive:true});
  try{
    for(const width of [1440,820,390,320]){
      await page.setViewportSize({width,height:width<500?844:1000});
      await page.locator('[data-view="readings"]').click();await page.locator('#reset').click();
      assert.equal(await page.locator('.reading-row').count(),6);await noOverflow(page);
      assert.equal(await page.locator('.site-visual img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
      assert.ok(await page.locator('#chart path.trace').getAttribute('d'));
      const clipped=await page.locator('#chart svg').evaluate(svg=>[...svg.querySelectorAll('text')].some(t=>{const b=t.getBBox();return b.x<0||b.x+b.width>480;}));
      assert.equal(clipped,false,'Chart labels must fit inside the viewBox');
      assert.equal(await page.locator('.row-value bdi').first().getAttribute('dir'),'ltr');
      await page.screenshot({path:path.join(SCREENSHOTS,`readings-ar-${width}.png`),fullPage:true});
      for(const view of ['audit','sources']){await page.locator(`[data-view="${view}"]`).click();await noOverflow(page);}
      await page.locator('[data-view="readings"]').click();await page.locator('#language').click();await noOverflow(page);
      assert.equal(await page.locator('html').getAttribute('dir'),'ltr');
      await page.screenshot({path:path.join(SCREENSHOTS,`readings-en-${width}.png`),fullPage:true});
      await page.locator('#language').click();checks.push({width,arabic:true,english:true,overflow:false,assetLoaded:true});
    }
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    const report={snapshotId:latest.id,htmlSha256:crypto.createHash('sha256').update(fs.readFileSync(entry)).digest('hex'),checkedAt:new Date().toISOString(),checks,browserErrors:errors,externalRequests:external.length,productionApproved:false};
    fs.writeFileSync(path.join(ROOT,'runtime/sensory-hub/browser-verification.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
  }finally{await browser.close();}
});
test('filters, details, reviewed import, rejection, report export and reset work',async()=>{
  const {browser,page,errors,external}=await environment();
  try{
    await page.locator('#domain').selectOption('industrial');assert.equal(await page.locator('.reading-row').count(),2);
    await page.locator('.reading-row[data-source="IND-PRESSURE-01"]').click();assert.match(await page.locator('#detail-title').innerText(),/ضغط/);
    await page.locator('#search').fill('no-match');assert.equal(await page.locator('#empty').isVisible(),true);assert.equal(await page.locator('.detail').isVisible(),false);
    await page.locator('#search').fill('');await page.locator('#domain').selectOption('all');await page.locator('#state').selectOption('MISSING');assert.equal(await page.locator('.reading-row').count(),1);assert.match(await page.locator('#narrative').innerText(),/غياب البيانات/);await page.locator('#state').selectOption('all');
    const good=packet([record()]);
    await page.locator('#file').setInputFiles(input(good));await page.locator('#preview[open]').waitFor();
    await page.locator('#preview button[value="cancel"]').last().click();assert.match(await page.locator('#origin').innerText(),/اصطناعية/);
    await page.locator('#file').setInputFiles(input(good));await page.locator('#preview[open]').waitFor();await page.locator('#preview button[value="confirm"]').click();
    await page.waitForFunction(()=>!document.querySelector('#preview').open);assert.match(await page.locator('#origin').innerText(),/غير موثّق/);
    await page.locator('.reading-row[data-source="ENV-TEMP-01"]').click();assert.match(await page.locator('#detail-value').innerText(),/25|٢٥/);
    const confirmed=await page.locator('#detail-value').innerText();
    await page.locator('#file').setInputFiles(input(packet([record({value:30})])));await page.locator('#preview[open]').waitFor();await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('#preview').open);assert.equal(await page.locator('#detail-value').innerText(),confirmed,'Escape after a previous confirmation must not import');
    const before=await page.locator('#detail-value').innerText();await page.locator('#file').setInputFiles(input({...good,tenantId:'another'}));await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('TENANT_OR_SCHEMA_DENIED'));assert.equal(await page.locator('#detail-value').innerText(),before);
    await page.locator('#file').setInputFiles(input(packet([record({sourceId:'<img src=x onerror=alert(1)>'})])));await page.waitForFunction(()=>document.querySelector('#message').textContent.includes('SOURCE_NOT_REGISTERED'));
    const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);const output=JSON.parse(Buffer.concat(chunks));assert.equal(output.origin,'IMPORTED_UNVERIFIED');assert.equal(output.productionApproved,false);assert.equal(output.physicalCommandSent,false);assert.match(output.fileProvenance.sha256,/^[a-f0-9]{64}$/);
    assert.equal(output.audit.filter(e=>e.event==='IMPORT_REJECTED').length,2);
    await page.locator('[data-view="audit"]').click();assert.equal(await page.locator('.audit-entry').count(),3);
    await page.locator('#reset').click();assert.match(await page.locator('#origin').innerText(),/اصطناعية/);
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
    fs.writeFileSync(path.join(ROOT,'runtime/sensory-hub/workflow-verification.json'),JSON.stringify({snapshotId:latest.id,htmlSha256:crypto.createHash('sha256').update(fs.readFileSync(entry)).digest('hex'),checkedAt:new Date().toISOString(),filters:true,details:true,importReview:true,importCancel:true,rejectedFilesPreserveData:true,export:true,reset:true,browserErrors:errors,externalRequests:external.length,productionApproved:false},null,2)+'\n',{mode:0o600});
  }finally{await browser.close();}
});
