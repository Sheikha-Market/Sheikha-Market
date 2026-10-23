#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { OpportunityWatch, ROOT, readPrivate, reportMarkdown } = require('../../sheikha-vscode-extension/src/intelligence/opportunityWatch');
const { collect } = require('../../sheikha-vscode-extension/src/intelligence/publicSources');
const { ReportCenter } = require('../../sheikha-vscode-extension/src/intelligence/reportCenter');

async function main(args = process.argv.slice(2)) {
  const command = args.shift();
  const value = name => { const i = args.indexOf(name); if (i < 0) return null; const result = args[i + 1]; if (!result || result.startsWith('--')) throw Error('OPTION_VALUE_REQUIRED'); return result; };
  const store = new OpportunityWatch({ root: value('--root') ? path.resolve(value('--root')) : ROOT });
  const center = new ReportCenter(store);
  if (command === 'status') return store.summary();
  if (command === 'scan') {
    if (!args.includes('--public-metadata-only')) throw Error('PUBLIC_METADATA_AUTHORIZATION_REQUIRED');
    const batch = await collect();
    return { ...store.ingest(batch.records, { provenance: 'PUBLIC_SOURCE_METADATA', collection: batch }), ...store.summary() };
  }
  if (command === 'import') {
    if (!args.includes('--private-save') || !value('--file')) throw Error('PRIVATE_SAVE_AUTHORIZATION_REQUIRED');
    const data = readPrivate(value('--file'), 512 * 1024);
    return store.ingest(data.records);
  }
  if (command === 'inventory') {
    if (!args.includes('--private-save') || !value('--file')) throw Error('PRIVATE_SAVE_AUTHORIZATION_REQUIRED');
    return center.saveInventory(readPrivate(value('--file'), 1024 * 1024));
  }
  if (command === 'center-status') return center.summary();
  if (command === 'center-report') {
    const profile = value('--profile') || 'management';
    const channel = value('--channel') || (profile === 'management' ? 'LOCAL_REPORT' : 'CHAT');
    const draft = center.draft(profile, channel);
    if (!['LOCAL_READY', 'LOCAL_DISPLAYED'].includes(draft.status)) return { ...draft, externalDeliveryExecuted: false };
    const preview = center.preview(draft.id);
    center.markDisplayed(draft.id);
    return preview.markdown;
  }
  if (command === 'report') return reportMarkdown(store.report(value('--audience') || 'MANAGEMENT'));
  throw Error('USE_STATUS_SCAN_IMPORT_INVENTORY_CENTER_STATUS_CENTER_REPORT_OR_REPORT');
}
if (require.main === module) main().then(result => process.stdout.write(typeof result === 'string' ? result + '\n' : JSON.stringify(result, null, 2) + '\n'))
  .catch(() => { process.stderr.write('OPPORTUNITY_WATCH_FAILED_CHECK_ARGUMENTS_PRIVATE_STORAGE_AND_CONNECTIVITY\n'); process.exitCode = 1; });
module.exports = { main };
