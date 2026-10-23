'use strict';
const assert=require('assert');
const {PREFERRED_TERMS,DIMENSIONS,SEMANTIC_BOUNDARY}=require('./terminology-v2');
const {evaluateDrawing}=require('./drawing-policy-v2');
const {normalizeDimension,makeSceneDescriptor,square,house}=require('./dimension-engine-v1');
const {LICENSE_PROFILE}=require('./drawing-license-v2');

let n=0; const t=(name,fn)=>{fn();n++;};

t('preferred drawing terms',()=>assert.ok(PREFERRED_TERMS.render.includes('رسومي')));
t('2d',()=>assert.strictEqual(normalizeDimension('2d').physicalSpatialDimensionsClaim,2));
t('3d',()=>assert.strictEqual(normalizeDimension('3d').physicalSpatialDimensionsClaim,3));
t('4d time',()=>assert.strictEqual(normalizeDimension('4D').fourthAxis,'time'));
t('5d param',()=>assert.strictEqual(normalizeDimension('5D').fifthAxis,'parameter_or_state'));
t('5d no physical 5d claim',()=>assert.strictEqual(normalizeDimension('5D').physicalSpatialDimensionsClaim,3));
t('scene drawing',()=>assert.strictEqual(makeSceneDescriptor({dimension:'4D'}).isDrawing,true));
t('scene not life',()=>assert.strictEqual(makeSceneDescriptor({dimension:'5D'}).livingOrConscious,false));
t('scene cannot revive',()=>assert.strictEqual(makeSceneDescriptor({dimension:'5D'}).canReviveLife,false));
t('square',()=>assert.strictEqual(square(4).area,16));
t('house',()=>assert.ok(house().approximateEnvelopeVolume>0));
t('living claim denied',()=>assert.strictEqual(evaluateDrawing({subject:'abstract',claimsLife:true}).decision,'DENY'));
t('consciousness claim denied',()=>assert.strictEqual(evaluateDrawing({subject:'abstract',claimsConsciousness:true}).decision,'DENY'));
t('revival claim denied',()=>assert.strictEqual(evaluateDrawing({subject:'abstract',claimsRevival:true}).decision,'DENY'));
t('dream prediction denied',()=>assert.strictEqual(evaluateDrawing({subject:'abstract',dreamPrediction:true}).decision,'DENY'));
t('gardens allowed',()=>assert.strictEqual(evaluateDrawing({subject:'gardens'}).decision,'ALLOW'));
t('human likeness remains denied',()=>assert.strictEqual(evaluateDrawing({subject:'human_likeness_generation'}).decision,'DENY'));
t('surveillance review',()=>assert.strictEqual(evaluateDrawing({subject:'abstract',surveillance:true}).decision,'HUMAN_REVIEW_REQUIRED'));
t('semantic boundary alive',()=>assert.strictEqual(SEMANTIC_BOUNDARY.createdArtifactCanBeAlive,false));
t('semantic boundary conscious',()=>assert.strictEqual(SEMANTIC_BOUNDARY.createdArtifactCanBeConscious,false));
t('semantic boundary revival',()=>assert.strictEqual(SEMANTIC_BOUNDARY.createdArtifactCanReviveLife,false));
t('license third party',()=>assert.strictEqual(LICENSE_PROFILE.thirdPartyRelicensing,false));

console.log(`SHEIKHA_DRAWING_MOTION_V2_TESTS=${n}/${n}_PASSED`);
