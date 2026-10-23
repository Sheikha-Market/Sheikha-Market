'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { once } = require('node:events');
const { SOURCES, makeFilter, validateSource } = require('../tools/media/sheikha-motion-review.cjs');
const { createWorkspaceServer } = require('../tools/preview/sheikha-workspace-preview.cjs');
const dir = path.join(__dirname, '../public/workspace/media/review-v1');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

test('render recipe preserves duration, framing, original audio and review boundaries', () => {
  const filter = makeFilter();
  assert.match(filter, /force_original_aspect_ratio=decrease/);
  assert.match(filter, /xfade=transition=fade:duration=1:offset=23/);
  assert.match(filter, /afade=t=out:st=23:d=1/);
  assert.match(filter, /apad=pad_dur=9,atrim=duration=33/);
  assert.equal(SOURCES[0].duration + SOURCES[1].duration - 1, 33);
  assert.equal(SOURCES[1].audio, false);
});

test('altered source rejected before any external process', () => {
  assert.throws(() => validateSource(__filename, SOURCES[0], 'not-invoked'), /SOURCE_HASH_MISMATCH/);
});

test('local review artifacts match their manifest and bit-identical original copies', () => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(data.status, 'DRAFT_REQUIRES_HUMAN_REVIEW');
  assert.equal(data.validation.userApproved, false);
  assert.equal(data.validation.physicalSimulationValidated, false);
  assert.equal(data.validation.originalHashesRechecked, true);
  assert.equal(data.validation.fullMasterDecode, 'PASS');
  assert.equal(data.noExternalUpload, true);
  assert.equal(data.noPaidGeneration, true);
  assert.equal(data.sourceAudio.listeningReview, 'NOT_PERFORMED');
  assert.equal(data.artifacts.length, 10);
  for (const item of data.artifacts) {
    assert.equal(path.basename(item.file), item.file);
    const bytes = fs.readFileSync(path.join(dir, item.file));
    assert.equal(bytes.length, item.bytes);
    assert.equal(sha(bytes), item.sha256, item.file);
  }
  for (const source of SOURCES) {
    assert.equal(sha(fs.readFileSync(path.join(dir, source.id + '.mp4'))), source.sha256);
    const original = path.join('/home/sheikha/مستندات/شيخة الهوية', source.filename);
    if (fs.existsSync(original)) assert.equal(sha(fs.readFileSync(original)), source.sha256);
    const measured = data.clips.find(c => c.id === source.id).motion;
    assert.ok(measured.samplePairs > 0 && measured.mean > 0 && Number.isFinite(measured.max));
  }
  const unified = data.clips.find(c => c.id === 'unified');
  assert.equal(unified.frames, 792); assert.equal(unified.duration, 33);
  assert.equal(unified.width, 1920); assert.equal(unified.height, 1080);
  assert.equal(unified.playback.width, 1280); assert.equal(unified.playback.height, 720);
  assert.equal(data.audioPolicy.musicAdded, false);
});

test('local HTTP serves media with bounded ranges for seeking and full manifests', async t => {
  const server = createWorkspaceServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}/workspace/media/review-v1/`;
  const manifest = await fetch(base + 'manifest.json');
  assert.equal(manifest.status, 200);
  assert.equal((await manifest.json()).schema, 'SHEIKHA_MOTION_REVIEW_V1');
  for (const name of ['cinematic.mp4', 'wave.mp4', 'unified-web.mp4', 'SHEIKHA_UNIFIED_MOTION_REVIEW_01.mp4']) {
    const response = await fetch(base + name, { headers: { Range: 'bytes=0-31' } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(response.headers.get('accept-ranges'), 'bytes');
    assert.match(response.headers.get('content-range'), /^bytes 0-31\/\d+$/);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), fs.readFileSync(path.join(dir, name)).subarray(0, 32));
  }
});
