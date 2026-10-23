'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const reg=JSON.parse(fs.readFileSync(path.join(__dirname,'component-registry.json')));
const dim=JSON.parse(fs.readFileSync(path.join(__dirname,'five-d-semantics.json')));
const {compose,promote}=require('./experience-engine');
let n=0;function t(f){f();n++}
t(()=>assert.ok(reg.components.length>=28));
t(()=>assert.strictEqual(reg.boundaries.ewarOffensiveActions,false));
t(()=>assert.strictEqual(dim.visual.physicalSpatialDimensionsClaim,3));
t(()=>assert.strictEqual(compose({segment:'developer'}).dimensionModel.D5,'adaptive-context'));
t(()=>assert.ok(compose({segment:'agriculture'}).payload.zones.includes('GARDENS')));
t(()=>assert.strictEqual(compose({}).claimsAliveOrConscious,false));
t(()=>assert.strictEqual(promote({control:{taskSuccess:90},candidate:{taskSuccess:80},safety:true,compliance:true}).decision,'KEEP_CONTROL'));
t(()=>assert.strictEqual(promote({control:{taskSuccess:80},candidate:{taskSuccess:90},safety:false,compliance:true}).decision,'REJECT'));
console.log(`SHEIKHA_UNIFIED_5D_TESTS=${n}/${n}_PASSED`);
