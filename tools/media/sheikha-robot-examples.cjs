'use strict';
const { catalog, buildDesign } = require('../../core/robotics/sheikha-design-studio.cjs');

async function main(port = 4193) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT_REJECTED');
  const base = `http://127.0.0.1:${port}/api/sheikha/workspace/v1`;
  const session = await fetch(base + '/session').then(r => r.json());
  const state = await fetch(base + '/studio').then(r => r.json());
  if (!state.renderer?.available || state.busy) throw Error('LOCAL_RENDERER_NOT_READY');
  for (const family of catalog().families) {
    const parameters = { family: family.id, tool: family.tools[0], finish: 'emerald', scale: 1, motion: 'demonstrate' };
    const existing = state.jobs.find(job => job.designId === buildDesign(parameters).id && job.status === 'DRAFT_REQUIRES_HUMAN_REVIEW');
    if (existing) { console.log(JSON.stringify({ family: family.id, reused: true, jobId: existing.id })); continue; }
    const response = await fetch(base + '/studio/render', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sheikha-Session': session.token }, body: JSON.stringify(parameters) });
    if (!response.ok) throw Error('RENDER_SUBMISSION_FAILED');
    const job = await response.json(); let done = false;
    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const result = await fetch(base + '/studio/jobs/' + job.id).then(r => r.json());
      if (result.status === 'DRAFT_REQUIRES_HUMAN_REVIEW') { console.log(JSON.stringify({ family: family.id, jobId: job.id, duration: result.evidence.duration, decode: result.evidence.fullDecode, sha256: result.evidence.sha256 })); done = true; break; }
      if (result.status !== 'RENDERING') throw Error('RENDER_NOT_COMPLETED');
    }
    if (!done) throw Error('RENDER_WAIT_EXPIRED');
  }
}
if (require.main === module) main(process.argv[2] ? Number(process.argv[2]) : 4193).catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { main };
