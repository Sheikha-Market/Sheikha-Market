'use strict';

const crypto = require('node:crypto');
const { TaskEngine, workflowMarkdown } = require('../src/chat/sheikhaTaskEngine');
const task = (id, execute, kind = 'LOCAL_TOOL') => ({ id, label: id, adapter: 'TEST_ONLY', kind, execute });
const tick = () => new Promise(resolve => setImmediate(resolve));

describe('real bounded task lifecycle', () => {
  test('records only allowlisted adapter failures and handles non-Error rejections', async () => {
    const engine = new TaskEngine();
    const run = await engine.start('Safe errors', [task('model', async () => { throw Error('LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET'); }),
      task('other', () => Promise.reject(null))]);
    expect(run.tasks[0].failureCode).toBe('LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET');
    expect(run.tasks[1].failureCode).toBe('FAILED');
    expect(engine.active).toBe(false);
  });
  test('limits concurrent workers to two, records real updates and result hashes', async () => {
    const updates = []; const engine = new TaskEngine({ publish: async state => { updates.push(state); } });
    let active = 0; let peak = 0;
    const execute = async ({ update }) => {
      active++; peak = Math.max(peak, active); await update('Inspecting fixture');
      await new Promise(resolve => setTimeout(resolve, 5)); active--;
      return { summary: 'measured result', count: 3 };
    };
    const run = await engine.start('Local test', ['one','two','three','four'].map(id => task(id, execute)));
    expect(peak).toBe(2); expect(run.status).toBe('COMPLETED_READ_ONLY'); expect(run.completed).toBe(4);
    expect(updates.some(r => r.tasks.filter(t => t.status === 'RUNNING').length === 2)).toBe(true);
    expect(run.events.some(e => e.type === 'INSPECTING')).toBe(true);
    expect(run.events.some(e => e.type === 'UPDATED')).toBe(true);
    const detail = engine.detail('one');
    expect(detail.runId).toBe(run.id); expect(detail.goal).toBe('Local test');
    expect(detail.events.every(event => event.taskId === 'one')).toBe(true);
    expect(detail.evidenceSha256).toBe(crypto.createHash('sha256').update(JSON.stringify(detail.result)).digest('hex'));
    expect(run.tasks[0].result).toBeUndefined();
    expect(run.tasks.every(t => t.startedAt && t.finishedAt)).toBe(true);
    expect(run.commercialProductionReady).toBe(false);
  });
  test('serializes model workers and never treats a draft as independently verified', async () => {
    const engine = new TaskEngine(); let active = 0; let peak = 0;
    const execute = async () => { active++; peak = Math.max(active,peak); await tick(); active--; return { summary: 'draft', reviewRequired: true }; };
    const run = await engine.start('Design test', [task('design', execute, 'LOCAL_MODEL'),task('review', execute, 'LOCAL_MODEL')]);
    expect(peak).toBe(1); expect(run.status).toBe('COMPLETED_WITH_FINDINGS');
    expect(run.tasks.every(t => t.status === 'REVIEW_REQUIRED')).toBe(true);
    expect(workflowMarkdown(run)).toContain('تحتاج مراجعة بشرية');
  });
  test('cancel stops queued tasks and rejects late results without holding a busy lock', async () => {
    let release; const queued = jest.fn(); const engine = new TaskEngine();
    const pending = engine.start('Cancel test', [task('one', () => new Promise(resolve => { release = resolve; })),
      task('two', () => new Promise(() => {})), task('three', queued)]);
    await tick(); expect(engine.active).toBe(true); expect(engine.reset()).toBe(false);
    await expect(engine.start('another', [task('another', queued)])).rejects.toThrow('WORKFLOW_BUSY');
    expect(await engine.cancel()).toBe(true); const run = await pending;
    expect(run.status).toBe('CANCELLED'); expect(run.tasks.every(t => t.status === 'CANCELLED')).toBe(true);
    expect(queued).not.toHaveBeenCalled();
    release({ summary: 'LATE_PRIVATE_RESULT' }); await tick();
    expect(engine.detail('one').result).toBeNull(); expect(engine.active).toBe(false);
    expect(engine.reset()).toBe(true); expect(engine.snapshot()).toBeNull();
  });
  test('timeout aborts transport and cannot manufacture completion', async () => {
    const engine = new TaskEngine({ timeoutMs: 15 }); let signal;
    const run = await engine.start('Timeout test', [task('slow', context => { signal = context.signal; return new Promise(() => {}); })]);
    expect(signal.aborted).toBe(true); expect(run.tasks[0].status).toBe('TIMED_OUT');
    expect(run.tasks[0].evidenceSha256).toBeNull(); expect(run.status).toBe('COMPLETED_WITH_FINDINGS');
  });
  test('failed publication cannot strand the engine; failures do not disclose error contents', async () => {
    const engine = new TaskEngine({ publish: async () => { throw Error('disposed'); } });
    const run = await engine.start('Error test', [task('failed', async () => { throw Error('PRIVATE_CREDENTIAL'); })]);
    expect(run.tasks[0].status).toBe('FAILED'); expect(JSON.stringify(run)).not.toContain('PRIVATE_CREDENTIAL');
    expect(engine.active).toBe(false);
  });
  test('rejects ambiguous task definitions and oversized or empty goals/results', async () => {
    const engine = new TaskEngine();
    await expect(engine.start('', [task('one', () => {})])).rejects.toThrow('BOUNDED_GOAL_REQUIRED');
    await expect(engine.start('test', [task('one', () => {}),task('one', () => {})])).rejects.toThrow('PACKAGED_TASKS_REQUIRED');
    await expect(engine.start('test', Array.from({ length: 7 }, (_,i) => task('task-'+i, () => {})))).rejects.toThrow('PACKAGED_TASKS_REQUIRED');
    const run = await engine.start('oversize', [task('large', async () => ({ summary: 'x'.repeat(150000) }))]);
    expect(run.tasks[0].status).toBe('FAILED');
  });
});
