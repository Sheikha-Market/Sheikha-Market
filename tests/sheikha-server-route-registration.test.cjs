'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const acorn = require('acorn');

const serverPath = path.join(__dirname, '../server.js');
const source = fs.readFileSync(serverPath, 'utf8');
assert.ok(Buffer.byteLength(source, 'utf8') <= 3 * 1024 * 1024,
  'Route registration inspection must stay bounded.');
const canonicalModule = './routes/sheikha-infinite-agent/sheikha-infinite-agent-routes';
let syntaxTree;

function tree() {
  if (!syntaxTree) syntaxTree = acorn.parse(source, {
    ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true
  });
  return syntaxTree;
}

function nodes(root, predicate) {
  const found = [];
  const pending = [root];
  while (pending.length) {
    const node = pending.pop();
    if (!node || typeof node !== 'object') continue;
    if (typeof node.type === 'string' && predicate(node)) found.push(node);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) pending.push(...value);
      else if (value && typeof value === 'object') pending.push(value);
    }
  }
  return found;
}

function property(node, objectName, propertyName) {
  return node?.type === 'MemberExpression' && node.object.type === 'Identifier' &&
    node.object.name === objectName &&
    ((!node.computed && node.property.name === propertyName) ||
     (node.computed && node.property.value === propertyName));
}

function isUse(node) {
  return node.type === 'CallExpression' && property(node.callee, 'app', 'use');
}

function isRequire(node, moduleName) {
  return node.type === 'CallExpression' && node.callee.type === 'Identifier' &&
    node.callee.name === 'require' && node.arguments.length === 1 &&
    typeof node.arguments[0].value === 'string' &&
    node.arguments[0].value.replace(/\.js$/, '') === moduleName;
}

function apiCatchAll() {
  const candidates = tree().body.filter(statement => {
    const call = statement.type === 'ExpressionStatement' && statement.expression;
    if (!call || !isUse(call)) return false;
    const handler = call.arguments[0];
    if (!['ArrowFunctionExpression', 'FunctionExpression'].includes(handler?.type)) return false;
    const request = handler.params[0]?.name;
    const response = handler.params[1]?.name;
    if (!request || !response) return false;
    const apiGuard = nodes(handler.body, node => node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' && node.callee.property.name === 'startsWith' &&
      property(node.callee.object, request, 'path') && node.arguments[0]?.value === '/api/');
    const notFound = nodes(handler.body, node => node.type === 'CallExpression' &&
      property(node.callee, response, 'status') && node.arguments[0]?.value === 404);
    return apiGuard.length > 0 && notFound.length > 0;
  });
  assert.equal(candidates.length, 1, 'The API catch-all must be identified unambiguously.');
  return candidates[0];
}

test('the server compiles without executing initialization or imported modules', () => {
  assert.doesNotThrow(() => new vm.Script(source, { filename: serverPath }),
    'Malformed injected statements must fail before a build or deployment.');
  assert.doesNotThrow(tree, 'The route inspection requires valid JavaScript.');
});

test('one canonical router supplies four reviewed top-level prefixes before the API 404 handler', () => {
  const imports = nodes(tree(), node => isRequire(node, canonicalModule));
  assert.equal(imports.length, 1, 'Load the reviewed router exactly once.');
  const bindings = tree().body.flatMap(statement => statement.type === 'VariableDeclaration'
    ? statement.declarations : []).filter(declaration => declaration.init === imports[0]);
  assert.equal(bindings.length, 1, 'The router binding must be top-level.');
  assert.equal(bindings[0].id.type, 'Identifier');
  const routerName = bindings[0].id.name;
  assert.equal(require.resolve(path.resolve(path.dirname(serverPath), canonicalModule)),
    path.join(__dirname, '../routes/sheikha-infinite-agent/sheikha-infinite-agent-routes.js'));
  const catchAll = apiCatchAll();
  const uses = nodes(tree(), isUse);
  const declarations = tree().body.flatMap(statement => statement.type === 'VariableDeclaration'
    ? statement.declarations : []);
  for (const [route, factory] of [
    ['/api/infinite-agent', null],
    ['/api/sheikha-kernel', null],
    ['/api/cosmic-engineering', 'createNaturalRouter'],
    ['/api/cosmic', 'createNaturalRouter']
  ]) {
    const matches = uses.filter(call => call.arguments[0]?.value === route);
    assert.equal(matches.length, 1, `${route} must be mounted exactly once.`);
    const call = matches[0];
    assert.ok(tree().body.some(statement => statement.type === 'ExpressionStatement' &&
      statement.expression === call), `${route} must not be injected inside another block.`);
    assert.ok(imports[0].start < call.start && call.end < catchAll.start,
      `${route} must follow its require and precede the actual API catch-all.`);
    let handler = call.arguments[1];
    if (factory) {
      if (handler?.type === 'Identifier') {
        const factoryBindings = declarations.filter(declaration =>
          declaration.id.type === 'Identifier' && declaration.id.name === handler.name);
        assert.equal(factoryBindings.length, 1);
        assert.ok(factoryBindings[0].start < call.start);
        handler = factoryBindings[0].init;
      }
      assert.equal(handler?.type, 'CallExpression');
      assert.ok(property(handler.callee, routerName, factory),
        `${route} must use the reviewed router factory.`);
      assert.equal(handler.arguments.length, 0);
    } else {
      assert.equal(handler?.type, 'Identifier');
      assert.equal(handler.name, routerName);
    }
  }
});

test('legacy aliases and late public stub imports cannot bypass the reviewed router', () => {
  const legacyImports = nodes(tree(), node => node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' && node.callee.name === 'require' &&
    typeof node.arguments[0]?.value === 'string' &&
    /(?:^|\/)routes\/(?:cosmic|infinite|sheikha-kernel)(?:\.js)?$/.test(node.arguments[0].value));
  assert.equal(legacyImports.length, 0, 'Unreviewed legacy route modules must stay unmounted.');
  const reviewedPrefixes = new Set([
    '/api/infinite-agent', '/api/sheikha-kernel', '/api/cosmic-engineering', '/api/cosmic'
  ]);
  for (const call of nodes(tree(), isUse)) {
    const first = call.arguments[0];
    const routes = first?.type === 'ArrayExpression' ? first.elements : [first];
    for (const route of routes) {
      const prefix = route?.value;
      if (typeof prefix === 'string' &&
          /^\/api\/(?:infinite(?:-agent)?|sheikha-kernel|cosmic(?:-engineering)?)(?:\/|$)/.test(prefix)) {
        assert.ok(reviewedPrefixes.has(prefix),
          `Unreviewed alias ${prefix} bypasses the protected route contract.`);
      }
    }
  }
});
