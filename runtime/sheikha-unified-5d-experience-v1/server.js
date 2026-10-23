'use strict';

const http=require('http'),fs=require('fs'),path=require('path'),{URL}=require('url');
const registry=JSON.parse(fs.readFileSync(path.join(__dirname,'component-registry.json'),'utf8'));
const dims=JSON.parse(fs.readFileSync(path.join(__dirname,'five-d-semantics.json'),'utf8'));
const inventory=JSON.parse(fs.readFileSync(path.join(__dirname,'component-inventory.json'),'utf8'));
const {compose,promote}=require('./experience-engine');

function json(res,c,o){const b=Buffer.from(JSON.stringify(o,null,2)+'\n');res.writeHead(c,{'content-type':'application/json; charset=utf-8','content-length':b.length,'cache-control':'no-store'});res.end(b)}
function local(port,p){return new Promise(resolve=>{const q=http.request({host:'127.0.0.1',port,path:p,timeout:700},r=>{let d='';r.on('data',c=>{if(d.length<131072)d+=c});r.on('end',()=>{try{resolve({ok:r.statusCode===200,http:r.statusCode,body:JSON.parse(d)})}catch{resolve({ok:false,http:r.statusCode})}})});q.on('error',e=>resolve({ok:false,error:e.code||e.message}));q.on('timeout',()=>{q.destroy();resolve({ok:false,error:'TIMEOUT'})});q.end()})}
async function status(){const [a,d,p,c]=await Promise.all([local(8092,'/health'),local(8093,'/api/drawing/status'),local(8094,'/api/possibility/status'),local(8095,'/api/commercial/status')]);return{system:'SHEIKHA_UNIFIED_5D_CUSTOMER_EXPERIENCE_FABRIC_V1',status:'ACTIVE_GOVERNED_UNIFIED_CUSTOMER_ENVIRONMENT',bind:'127.0.0.1:8096',dependencies:{apex:a.ok,drawing:d.ok,possibility:p.ok,commercial:c.ok},registeredComponents:registry.components.length,dimensionModel:dims,instantComposition:true,continuousImprovement:'PROMOTE_ONLY_WHEN_MEASURED_BETTER_AND_SAFE_COMPLIANT',claimsEveryCandidateBetter:false,claimsServedRevisionChangesWithoutEvidence:false,defensiveEwarOnly:true,firmwareWritesDefault:false,tpmPhysicalExecutionAuthorized:false,externalNetworkUsed:false}}
http.createServer(async(req,res)=>{let u;try{u=new URL(req.url,'http://127.0.0.1:8096')}catch{return json(res,400,{error:'BAD_URL'})}
if(req.method==='GET'&&u.pathname==='/health')return json(res,200,{system:'SHEIKHA_UNIFIED_5D_CUSTOMER_EXPERIENCE_FABRIC_V1',status:'OK'});
if(req.method==='GET'&&u.pathname==='/') {const b=fs.readFileSync(path.join(__dirname,'index.html'));res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-length':b.length});return res.end(b)}
if(req.method==='GET'&&u.pathname==='/api/runtime/status')return json(res,200,await status());
if(req.method==='GET'&&u.pathname==='/api/runtime/components')return json(res,200,inventory);
if(req.method==='GET'&&u.pathname==='/api/runtime/5d')return json(res,200,dims);
if(req.method==='GET'&&u.pathname==='/api/runtime/experience')return json(res,200,compose(Object.fromEntries(u.searchParams.entries())));
if(req.method==='GET'&&u.pathname==='/api/runtime/evolution-example')return json(res,200,promote({control:{taskSuccess:80,timeToValueScore:70,accessibility:90,reliability:99,satisfaction:80},candidate:{taskSuccess:83,timeToValueScore:72,accessibility:91,reliability:99.2,satisfaction:82},safety:true,compliance:true}));
return json(res,404,{error:'NOT_FOUND'})}).listen(8096,'127.0.0.1',()=>console.log('SHEIKHA_UNIFIED_5D_EXPERIENCE_READY=true'));
