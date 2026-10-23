'use strict';

const assert=require('assert');
const {POLICY,evaluate}=require('./policy');
const {CAPABILITIES,TARGET_PROFILES,EXTERNAL_STANDARDS}=require('./catalog');
const {LICENSES,RIGHTS}=require('./license');
const {earthSkyPng,gardensAnimatedSvg}=require('./render');
const {gardensScene,earthSkyScene}=require('./scenes');

let n=0; const t=(name,fn)=>{fn();n++;};

t('capabilities',()=>assert.strictEqual(CAPABILITIES.length,24));
t('license',()=>assert.ok(LICENSES.some(x=>x.id==='LicenseRef-Sheikha-Visual-Fabric-1.0')));
t('rights',()=>assert.strictEqual(RIGHTS.noThirdPartyRelicensing,true));
t('plants allowed',()=>assert.strictEqual(evaluate({subject:'plants'}).decision,'ALLOW'));
t('gardens allowed',()=>assert.strictEqual(evaluate({subject:'gardens'}).decision,'ALLOW'));
t('human blocked',()=>assert.strictEqual(evaluate({subject:'human_likeness_generation'}).decision,'DENY'));
t('deepfake blocked',()=>assert.strictEqual(evaluate({subject:'abstract',deepfake:true}).decision,'DENY'));
t('afterlife blocked',()=>assert.strictEqual(evaluate({subject:'abstract',afterlife:true}).decision,'DENY'));
t('unseen blocked',()=>assert.strictEqual(evaluate({subject:'abstract',claimsUnseen:true}).decision,'DENY'));
t('surveillance review',()=>assert.strictEqual(evaluate({subject:'abstract',surveillance:true}).decision,'HUMAN_REVIEW_REQUIRED'));
t('scene no life claim',()=>assert.strictEqual(gardensScene().aliveOrConsciousClaim,false));
t('earth sky no unseen',()=>assert.strictEqual(earthSkyScene().unseenClaim,false));
t('earth sky no future prediction',()=>assert.strictEqual(earthSkyScene().futurePredictionClaim,false));
t('svg real',()=>assert.ok(gardensAnimatedSvg().includes('<svg')));
t('svg animated',()=>assert.ok(gardensAnimatedSvg().includes('<animate')));
t('png signature',()=>assert.strictEqual(earthSkyPng().subarray(0,8).toString('hex'),'89504e470d0a1a0a'));
t('png nontrivial',()=>assert.ok(earthSkyPng(128,72).length>100));
t('xr',()=>assert.ok(CAPABILITIES.some(x=>x.id==='SHEIKHA_XR_FABRIC')));
t('video',()=>assert.ok(CAPABILITIES.some(x=>x.id==='SHEIKHA_VIDEO_ENGINE')));
t('gardens integration',()=>assert.ok(CAPABILITIES.some(x=>x.id==='SHEIKHA_GARDENS_SPATIAL_TWIN')));
t('pastures integration',()=>assert.ok(CAPABILITIES.some(x=>x.id==='SHEIKHA_PASTURES_SPATIAL_TWIN')));
t('target profiles',()=>assert.ok(TARGET_PROFILES.xr.designRefreshRatesHz.includes(90)));
t('third party standards',()=>assert.ok(EXTERNAL_STANDARDS.every(x=>x.reLicensedBySheikha===false)));
t('foundation model honesty',()=>assert.ok(!CAPABILITIES.some(x=>x.id==='SHEIKHA_TRAINED_VIDEO_FOUNDATION_MODEL_V1')));

console.log(`SHEIKHA_VISUAL_FABRIC_TESTS=${n}/${n}_PASSED`);
