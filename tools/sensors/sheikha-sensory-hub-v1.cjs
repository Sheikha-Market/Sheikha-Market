#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const api = require('../../core/sensors/sheikha-sensory-hub-v1');
const {noSymlinks} = require('../../core/cloud-fabric/sheikha-product-registry-v1.cjs');
const ROOT = path.resolve(__dirname, '../..');
const CONFIG = 'config/sheikha-sensory-hub.v1.json';
const VISUAL = 'runtime/visual-foundry/objects/1c581794b8ffab129a688186813755ed40539f8b270c10fe0918d595a3c28a0a.png';
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const escapedJson = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4,'0')}`);
function read(file, max = 2 * 1024 * 1024) {
  const fd = fs.openSync(noSymlinks(file), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const before = fs.fstatSync(fd);
    if (!before.isFile() || before.size < 1 || before.size > max) throw Error('FILE_SIZE_OR_TYPE_DENIED');
    const buffer = Buffer.alloc(before.size + 1);
    let count = 0;
    while (count < buffer.length) {const n = fs.readSync(fd, buffer, count, buffer.length - count, null);if (!n) break;count += n;}
    const after = fs.fstatSync(fd);
    if (count !== before.size || ['size','mtimeMs','ctimeMs'].some(k => before[k] !== after[k])) throw Error('FILE_CHANGED_DURING_READ');
    return buffer.subarray(0,count);
  } finally {fs.closeSync(fd);}
}
function writeNew(file, bytes) {
  noSymlinks(file);
  const fd = fs.openSync(file, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_NOFOLLOW, 0o600);
  try {fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
}
function render(config, root = ROOT) {
  const readText = relative => read(path.join(root,relative)).toString('utf8');
  const style = readText('core/sensors/sensory-console.css');
  const script = readText('core/sensors/sheikha-sensory-hub-v1.js') + '\n' + readText('core/sensors/sensory-console.js').replace('__CONFIG__', () => escapedJson(config));
  const hash = value => crypto.createHash('sha256').update(value).digest('base64');
  const visual = read(path.join(root,VISUAL),5*1024*1024);
  if (sha256(visual)!==path.basename(VISUAL,'.png')) throw Error('VISUAL_DIGEST_MISMATCH');
  const values = {STYLE:style,SCRIPT:script,VISUAL:'data:image/png;base64,'+visual.toString('base64'),CSP:`default-src 'none'; img-src data:; style-src 'sha256-${hash(style)}'; script-src 'sha256-${hash(script)}'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`};
  for(const [key,name] of Object.entries({GLOBE:'globe',IMPORT:'arrow-left',DOWNLOAD:'download',REFRESH:'refresh-cw',SEARCH:'search',BACK:'arrow-left'}))values['ICON_'+key]=readText(`public/architecture-explorer/icons/${name}.svg`).replace('<svg','<svg aria-hidden="true"');
  return readText('core/sensors/sensory-console.html').replace(/@@([A-Z_]+)@@/g,(_,key)=>{if(!(key in values))throw Error('TEMPLATE_TOKEN_UNKNOWN');return values[key];});
}
function build(requestPath, root = ROOT) {
  const raw = read(path.join(root,CONFIG)), config = api.validateConfig(JSON.parse(raw));
  const request = requestPath ? {sha256:sha256(read(requestPath)),commandsExecuted:false,contentEmbedded:false} : null;
  const now = Date.now(), sample = api.demoBatch(config,now);
  const hub = new api.SensoryHub(config,{tenantId:config.tenantId,origin:'SYNTHETIC'});
  const baseline = hub.ingest(sample,now);
  const html = render(config,root);
  const files = {'index.html':html,'sample.json':JSON.stringify(sample,null,2)+'\n','baseline.json':JSON.stringify(baseline,null,2)+'\n','LUCIDE-LICENSE.txt':read(path.join(root,'public/architecture-explorer/icons/LICENSE'))};
  const report = {schema:'SHEIKHA_SENSORY_BUILD_V1',builtAt:new Date(now).toISOString(),request,configSha256:sha256(raw),sourceCount:config.sources.length,origin:'SYNTHETIC',physicalCommandSent:false,externalRequests:0,productionApproved:false,artifacts:Object.fromEntries(Object.entries(files).map(([name,bytes])=>[name,sha256(bytes)]))};
  const output = noSymlinks(path.join(root,'runtime/sensory-hub'));
  fs.mkdirSync(output,{recursive:true,mode:0o700});fs.chmodSync(output,0o700);
  const snapshots = noSymlinks(path.join(output,'snapshots'));fs.mkdirSync(snapshots,{recursive:true,mode:0o700});
  const id=sha256(JSON.stringify(report)).slice(0,24),target=noSymlinks(path.join(snapshots,id));
  fs.mkdirSync(target,{mode:0o700});
  for(const [name,bytes] of Object.entries({...files,'build.json':JSON.stringify(report,null,2)+'\n'}))writeNew(path.join(target,name),bytes);
  for(const [name,bytes] of Object.entries({'latest.json':JSON.stringify({id,snapshot:`snapshots/${id}`,htmlSha256:report.artifacts['index.html']},null,2)+'\n','index.html':`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=snapshots/${id}/index.html"><title>مرصد مستشعرات شيخة</title><a href="snapshots/${id}/index.html">فتح مرصد المستشعرات</a></html>`})){
    const final=noSymlinks(path.join(output,name)),temporary=final+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
    try{writeNew(temporary,bytes);noSymlinks(final);fs.renameSync(temporary,final);}finally{if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
  }
  return {entry:path.join(output,'index.html'),snapshot:target,id,sourceCount:config.sources.length,physicalCommandSent:false,productionApproved:false};
}
function evaluate(input, root = ROOT) {
  const bytes=read(input,512*1024),config=api.validateConfig(JSON.parse(read(path.join(root,CONFIG))));
  const hub=new api.SensoryHub(config,{tenantId:config.tenantId,origin:'IMPORTED_UNVERIFIED'});
  return {...hub.ingest(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))),inputSha256:sha256(bytes),inputBytes:bytes.length};
}
function run(args){
  if(args[0]==='build'&&(args.length===1||args.length===3&&args[1]==='--request'))return build(args[2]);
  if(args[0]==='evaluate'&&args.length===3&&args[1]==='--input')return evaluate(args[2]);
  if(args[0]==='sample'&&args.length===1)return api.demoBatch(JSON.parse(read(path.join(ROOT,CONFIG))));
  throw Error('USAGE_BUILD_REQUEST_OR_EVALUATE_INPUT_OR_SAMPLE');
}
if(require.main===module){try{console.log(JSON.stringify(run(process.argv.slice(2)),null,2));}catch(e){console.error(JSON.stringify({status:'FAILED',code:/^[A-Z0-9_]+$/.test(e.message)?e.message:'LOCAL_FILE_OR_JSON_INVALID',productionApproved:false}));process.exitCode=1;}}
module.exports={read,render,build,evaluate,run};
