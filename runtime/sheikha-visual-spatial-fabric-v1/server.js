'use strict';

const http=require('http');
const {URL}=require('url');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const {POLICY,evaluate}=require('./policy');
const {CAPABILITIES,TARGET_PROFILES,EXTERNAL_STANDARDS}=require('./catalog');
const {LICENSES,RIGHTS}=require('./license');
const {earthSkyPng,gardensAnimatedSvg}=require('./render');
const {gardensScene,earthSkyScene}=require('./scenes');

const HOST=process.env.SHEIKHA_VISUAL_HOST || '127.0.0.1';
const PORT=Number(process.env.SHEIKHA_VISUAL_PORT || 8093);
const VERSION='1.0.0';

function json(res,code,obj){
  const b=Buffer.from(JSON.stringify(obj,null,2)+'\n');
  res.writeHead(code,{'content-type':'application/json; charset=utf-8','content-length':b.length,'cache-control':'no-store'});
  res.end(b);
}

function status(){
  return {
    system:'SHEIKHA_VISUAL_SPATIAL_INTELLIGENCE_FABRIC_V1',
    version:VERSION,
    status:'ACTIVE_GOVERNED_LOCAL_VISUAL_CONTROL_PLANE',
    bind:`${HOST}:${PORT}`,
    capabilityCount:CAPABILITIES.length,
    originalSheikhaTechnologyNames:true,
    thirdPartyNamesAndRightsPreserved:true,
    visuallyDynamic:true,
    aliveOrConsciousClaim:false,
    gardensIntegration:true,
    farmsIntegration:true,
    pasturesIntegration:true,
    xrControlPlane:true,
    generativeVideoFoundationModelIncluded:false,
    videoModelAdapterReady:true,
    realSvgGeneration:true,
    realPngGeneration:true,
    externalNetworkUsed:false,
    customerDataTrainingDefault:false,
    policy:POLICY.principles,
    nextStage:'DEVICE_GPU_XR_AND_VIDEO_ENCODER_CONFORMANCE_BENCHMARKS'
  };
}

function writeRuntimeStatus(){
  const p=path.join(__dirname,'runtime-status.json');
  fs.writeFileSync(p,JSON.stringify(status(),null,2)+'\n',{mode:0o640});
}

const server=http.createServer(async(req,res)=>{
  let u;
  try{u=new URL(req.url,`http://${HOST}:${PORT}`)}catch{return json(res,400,{error:'BAD_URL'})}
  if(req.method!=='GET') return json(res,405,{error:'METHOD_NOT_ALLOWED'});

  if(u.pathname==='/health') return json(res,200,{system:'SHEIKHA_VISUAL_SPATIAL_INTELLIGENCE_FABRIC_V1',status:'OK',version:VERSION});
  if(u.pathname==='/api/visual/status') return json(res,200,status());
  if(u.pathname==='/api/visual/capabilities') return json(res,200,{count:CAPABILITIES.length,capabilities:CAPABILITIES,targetProfiles:TARGET_PROFILES});
  if(u.pathname==='/api/visual/policy') {
    return json(res,200,evaluate({
      subject:u.searchParams.get('subject'),
      purpose:u.searchParams.get('purpose'),
      realPerson:u.searchParams.get('realPerson')==='true',
      biometric:u.searchParams.get('biometric')==='true',
      deepfake:u.searchParams.get('deepfake')==='true',
      surveillance:u.searchParams.get('surveillance')==='true',
      claimsUnseen:u.searchParams.get('claimsUnseen')==='true',
      afterlife:u.searchParams.get('afterlife')==='true'
    }));
  }
  if(u.pathname==='/api/visual/licenses') return json(res,200,{licenses:LICENSES,rights:RIGHTS});
  if(u.pathname==='/api/visual/standards') return json(res,200,{externalStandards:EXTERNAL_STANDARDS});
  if(u.pathname==='/api/visual/scenes/gardens') return json(res,200,gardensScene());
  if(u.pathname==='/api/visual/scenes/earth-sky') return json(res,200,earthSkyScene());
  if(u.pathname==='/api/visual/demo/gardens.svg') {
    const body=Buffer.from(gardensAnimatedSvg(u.searchParams.get('width'),u.searchParams.get('height')));
    res.writeHead(200,{'content-type':'image/svg+xml; charset=utf-8','content-length':body.length,'cache-control':'no-store','x-sheikha-provenance':crypto.createHash('sha256').update(body).digest('hex')});
    return res.end(body);
  }
  if(u.pathname==='/api/visual/demo/earth-sky.png') {
    const body=earthSkyPng(u.searchParams.get('width'),u.searchParams.get('height'));
    res.writeHead(200,{'content-type':'image/png','content-length':body.length,'cache-control':'no-store','x-sheikha-provenance':crypto.createHash('sha256').update(body).digest('hex')});
    return res.end(body);
  }
  if(u.pathname==='/api/drawing/status') {
    const {PREFERRED_TERMS,DIMENSIONS,SEMANTIC_BOUNDARY}=require('./terminology-v2');
    return json(res,200,{
      system:'SHEIKHA_DRAWING_MOTION_SPATIAL_FABRIC_V2',
      status:'ACTIVE_GOVERNED_DRAWING_MOTION_LAYER',
      preferredConcept:'DRAWING_GRAPHICS_EMBODIMENT_MOTION_VIDEO',
      legacyVisualApiPreserved:true,
      supportedDimensions:Object.keys(DIMENSIONS),
      preferredTerms:PREFERRED_TERMS,
      semanticBoundary:SEMANTIC_BOUNDARY,
      visuallyDynamic:true,
      aliveOrConsciousClaim:false,
      canReviveLife:false
    });
  }
  if(u.pathname==='/api/drawing/dimensions') {
    const {DIMENSIONS}=require('./terminology-v2');
    return json(res,200,{system:'SHEIKHA_DRAWING_DIMENSIONS_V1',dimensions:DIMENSIONS});
  }
  if(u.pathname==='/api/drawing/terms') {
    const {PREFERRED_TERMS,SEMANTIC_BOUNDARY}=require('./terminology-v2');
    return json(res,200,{preferredTerms:PREFERRED_TERMS,semanticBoundary:SEMANTIC_BOUNDARY});
  }
  if(u.pathname==='/api/drawing/policy') {
    const {evaluateDrawing}=require('./drawing-policy-v2');
    return json(res,200,evaluateDrawing({
      subject:u.searchParams.get('subject'),
      purpose:u.searchParams.get('purpose'),
      realPerson:u.searchParams.get('realPerson')==='true',
      biometric:u.searchParams.get('biometric')==='true',
      deepfake:u.searchParams.get('deepfake')==='true',
      surveillance:u.searchParams.get('surveillance')==='true',
      claimsUnseen:u.searchParams.get('claimsUnseen')==='true',
      afterlife:u.searchParams.get('afterlife')==='true',
      claimsLife:u.searchParams.get('claimsLife')==='true',
      claimsConsciousness:u.searchParams.get('claimsConsciousness')==='true',
      claimsRevival:u.searchParams.get('claimsRevival')==='true',
      dreamPrediction:u.searchParams.get('dreamPrediction')==='true'
    }));
  }
  if(u.pathname==='/api/drawing/square') {
    const {square}=require('./dimension-engine-v1');
    try { return json(res,200,square(u.searchParams.get('side')||1)); }
    catch(e) { return json(res,400,{error:e.message}); }
  }
  if(u.pathname==='/api/drawing/house') {
    const {house}=require('./dimension-engine-v1');
    try {
      return json(res,200,house(
        u.searchParams.get('width')||8,
        u.searchParams.get('depth')||10,
        u.searchParams.get('height')||3,
        u.searchParams.get('roof')||2
      ));
    } catch(e) { return json(res,400,{error:e.message}); }
  }
  if(u.pathname==='/api/drawing/scene') {
    const {makeSceneDescriptor}=require('./dimension-engine-v1');
    try {
      return json(res,200,makeSceneDescriptor({
        dimension:u.searchParams.get('dimension')||'3D',
        kind:u.searchParams.get('kind')||'geometry',
        motion:u.searchParams.get('motion')==='true',
        parameter:u.searchParams.get('parameter')
      }));
    } catch(e) { return json(res,400,{error:e.message}); }
  }
  if(u.pathname==='/api/drawing/license') {
    const {LICENSE_PROFILE}=require('./drawing-license-v2');
    return json(res,200,LICENSE_PROFILE);
  }
  return json(res,404,{error:'NOT_FOUND'});
});

server.listen(PORT,HOST,()=>{
  writeRuntimeStatus();
  console.log('SHEIKHA_VISUAL_SPATIAL_INTELLIGENCE_FABRIC_V1_READY=true');
  console.log(`SHEIKHA_VISUAL_BIND=${HOST}:${PORT}`);
});
