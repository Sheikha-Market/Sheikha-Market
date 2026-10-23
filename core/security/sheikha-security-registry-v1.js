'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { evaluateEvent } = require('./sheikha-cyber-watch-guard-v1.js');

const ROOT = path.resolve(__dirname, '../..');
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT,'config/security/sheikha-security-registry-v1.json'),'utf8'));

function unique(xs){ return [...new Set(xs.filter(Boolean))]; }

function mapRoots(classificationType){
  return Object.freeze([...(CONFIG.rootMapping[classificationType] || CONFIG.rootMapping.UNKNOWN_REVIEW_REQUIRED)]);
}

function determineApplicability(event={}, asset={}){
  const componentMatch = Boolean(asset.component && event.component &&
    String(asset.component).toLowerCase() === String(event.component).toLowerCase());
  const hasInventory = Boolean(asset.component);
  if (!hasInventory) return Object.freeze({state:'UNKNOWN',reason:'INVENTORY_EVIDENCE_MISSING'});
  if (!componentMatch) return Object.freeze({state:'NOT_APPLICABLE',reason:'COMPONENT_NOT_PRESENT_IN_SUPPLIED_ASSET_EVIDENCE'});
  if (!asset.version || !event.affectedVersions) {
    return Object.freeze({state:'POTENTIALLY_AFFECTED',reason:'VERSION_SCOPE_INCOMPLETE'});
  }
  const affected = Array.isArray(event.affectedVersions) && event.affectedVersions.includes(asset.version);
  return Object.freeze({
    state: affected ? 'AFFECTED' : 'NOT_AFFECTED',
    reason: affected ? 'VERSION_IN_ADVISORY_SCOPE' : 'VERSION_OUTSIDE_ADVISORY_SCOPE'
  });
}

function registerSecurityEvent(event={}, assetEvidence={}){
  const evaluated = evaluateEvent(event);
  const type = evaluated.classification.type;
  const applicability = type === 'AVAILABILITY_INCIDENT'
    ? Object.freeze({state:'UNKNOWN',reason:'AVAILABILITY_EVENT_REQUIRES_NO_VULNERABILITY_INFERENCE'})
    : determineApplicability(event,assetEvidence);

  const eventState = evaluated.trusted ? 'SOURCE_VERIFIED' : 'OBSERVED';
  const nextState = evaluated.trusted ? 'APPLICABILITY_CHECK' : 'SOURCE_VERIFIED';

  return Object.freeze({
    registryVersion:CONFIG.version,
    eventId:evaluated.normalized.id || null,
    eventState,
    nextState,
    source:evaluated.normalized.source,
    sourceClass:evaluated.normalized.sourceClass,
    component:evaluated.normalized.component,
    classification:type,
    rootIds:mapRoots(type),
    applicability,
    disposition:evaluated.disposition,
    securityEvidence:evaluated.classification.securityEvidence,
    repairMode:evaluated.repair.mode,
    allowedNow:evaluated.repair.allowedNow,
    blocked:evaluated.repair.blockedWithoutSeparateAuthorization,
    evidenceNeeded:Object.freeze(unique([
      ...CONFIG.exposureEvidenceRequired,
      applicability.state === 'UNKNOWN' ? 'asset_inventory' : null,
      applicability.state === 'POTENTIALLY_AFFECTED' ? 'exact_version_and_advisory_range' : null
    ])),
    externalAuthorizationRequired:evaluated.externalActions.officialVendorOrDisclosureChannelRequired
  });
}

function ingestBatch(events=[], assetInventory=[]){
  const assets = new Map(assetInventory.map(x=>[String(x.component||'').toLowerCase(),x]));
  const seen = new Set();
  const out=[];
  for(const event of events){
    const key=String(event.id || [event.source,event.component,event.title,event.publishedAt].join('|'));
    if(seen.has(key)) continue;
    seen.add(key);
    const asset=assets.get(String(event.component||'').toLowerCase()) || {};
    out.push(registerSecurityEvent(event,asset));
  }
  return Object.freeze(out);
}

module.exports=Object.freeze({CONFIG,mapRoots,determineApplicability,registerSecurityEvent,ingestBatch});
