'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { SUBJECT, REPOSITORY, BRANCH, REQUIRED_SOURCES, assertSubject, decodeBoundFile, assess } = require('./sheikha-pr32-native-successor-preflight.cjs');

const pr = () => ({ number: 32, state: 'open', merged: false, base: { repo: { full_name: REPOSITORY } },
  head: { sha: SUBJECT, ref: BRANCH, repo: { full_name: REPOSITORY } } });
const digest = (value, algorithm = 'sha256') => crypto.createHash(algorithm).update(value).digest('hex');
function blob(text = 'Synthetic new-scope fixture; not a native artifact.') {
  const bytes = Buffer.from(text);
  const sha = digest(Buffer.concat([Buffer.from('blob ' + bytes.length + '\0'), bytes]), 'sha1');
  return { response: { type: 'file', path: 'package.json', encoding: 'base64', sha, content: bytes.toString('base64'), size: bytes.length },
    entry: { type: 'blob', path: 'package.json', sha, mode: '100644' }, bytes };
}
const snapshot = () => ({ pr: pr(), commit: { sha: SUBJECT, tree: { sha: 'b'.repeat(40) } },
  tree: { sha: 'b'.repeat(40), truncated: false, tree: REQUIRED_SOURCES.map(name => ({ type: 'blob', path: name, sha: 'c'.repeat(40), mode: '100644' })) } });

test('only the unmerged, same-repository, exact PR32 head is accepted', () => assert.doesNotThrow(() => assertSubject(pr())));
for (const [name, mutate] of [
  ['stale head', p => { p.head.sha = 'a'.repeat(40); }],
  ['different branch', p => { p.head.ref = 'main'; }],
  ['foreign fork', p => { p.head.repo.full_name = 'other/repo'; }],
  ['closed PR', p => { p.state = 'closed'; }],
  ['merged PR', p => { p.merged = true; }],
  ['other PR', p => { p.number = 31; }]
]) test('rejects ' + name, () => { const value = pr(); mutate(value); assert.throws(() => assertSubject(value), /SUBJECT_CHANGED/); });

test('checks Git blob identity, size and SHA256 without executing data', () => {
  const { response, entry, bytes } = blob();
  assert.deepEqual(decodeBoundFile(response, entry), { path: 'package.json', gitBlobSha: entry.sha, sha256: digest(bytes), size: bytes.length });
});
for (const [name, mutate] of [
  ['tampered bytes', r => { r.content = Buffer.from('changed').toString('base64'); }],
  ['wrong size', r => { r.size += 1; }],
  ['wrong blob', r => { r.sha = 'f'.repeat(40); }],
  ['path substitution', r => { r.path = 'other.json'; }],
  ['unknown encoding', r => { r.encoding = 'utf8'; }]
]) test('rejects ' + name, () => { const { response, entry } = blob(); mutate(response); assert.throws(() => decodeBoundFile(response, entry)); });
test('rejects symlink-mode source', () => { const { response, entry } = blob(); entry.mode = '120000'; assert.throws(() => decodeBoundFile(response, entry)); });
test('requires a complete source tree matching the subject commit', () => {
  const value = snapshot(); value.tree.truncated = true;
  assert.throws(() => assess(value), /COMPLETE_SUBJECT_TREE/);
  value.tree.truncated = false; value.commit.tree.sha = 'a'.repeat(40);
  assert.throws(() => assess(value), /COMPLETE_SUBJECT_TREE/);
});
test('rejects duplicated source paths and missing native sources', () => {
  const value = snapshot(); value.tree.tree.push(value.tree.tree[0]);
  assert.throws(() => assess(value), /DUPLICATE_TREE/);
  value.tree.tree.pop(); value.tree.tree.pop();
  assert.throws(() => assess(value), /SOURCE_MISSING/);
});
test('a populated source list without dependency bytes is not evidence', () => assert.throws(() => assess(snapshot()), /BINDING_INVALID/));
