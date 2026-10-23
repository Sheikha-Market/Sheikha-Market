'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createVirtualTestAccounts } = require('../core/security/sheikha-virtual-test-accounts.cjs');

const fixture = {
    NODE_ENV: 'test', SHEIKHA_ENABLE_TEST_ACCOUNTS: 'true',
    SHEIKHA_TEST_CUSTOMER_PASSWORD: 'fixture-customer-only',
    SHEIKHA_TEST_TRADER_PASSWORD: 'fixture-trader-only'
};

for (const [name, env] of Object.entries({
    default: {}, production: { ...fixture, NODE_ENV: 'production' },
    noOptIn: { ...fixture, SHEIKHA_ENABLE_TEST_ACCOUNTS: 'false' },
    missing: { ...fixture, SHEIKHA_TEST_TRADER_PASSWORD: undefined },
    short: { ...fixture, SHEIKHA_TEST_CUSTOMER_PASSWORD: 'short' },
    reused: { ...fixture, SHEIKHA_TEST_TRADER_PASSWORD: fixture.SHEIKHA_TEST_CUSTOMER_PASSWORD }
})) {
    test(`test accounts fail closed: ${name}`, () => {
        const accounts = createVirtualTestAccounts(env, () => assert.fail('must not hash disabled credentials'));
        assert.equal(accounts.enabled, false);
        assert.equal(accounts.customerHash, null);
        assert.equal(accounts.traderHash, null);
        const res = { status(code) { assert.equal(code, 404); return this; }, json(value) { assert.equal(value.error, 'NOT_FOUND'); } };
        accounts.guard({}, res, () => assert.fail('must not authenticate'));
    });
}

test('explicit non-production fixtures hash both passwords without returning plaintext', () => {
    const seen = [];
    const accounts = createVirtualTestAccounts(fixture, value => { seen.push(value); return 'test-hash-' + seen.length; });
    assert.equal(accounts.enabled, true);
    assert.deepEqual(seen, [fixture.SHEIKHA_TEST_CUSTOMER_PASSWORD, fixture.SHEIKHA_TEST_TRADER_PASSWORD]);
    assert.equal(accounts.customerHash, 'test-hash-1');
    assert.equal(accounts.traderHash, 'test-hash-2');
    assert.ok(!JSON.stringify(accounts).includes('fixture-'));
    let next = false;
    accounts.guard({}, {}, () => { next = true; });
    assert.ok(next);
});

test('server guards both virtual routes and omits credential response', () => {
    const source = fs.readFileSync(require.resolve('../server.js'), 'utf8');
    const mount = source.indexOf("app.use('/api/virtual-customer', virtualTestAccounts.guard)");
    const get = source.indexOf("app.get('/api/virtual-customer'");
    const post = source.indexOf("app.post('/api/virtual-customer/login'");
    assert.ok(mount > 0 && mount < get && get < post);
    assert.ok(!source.slice(get, post).includes('credentials:'));
    assert.ok(source.includes('password: virtualTestAccounts.customerHash'));
    assert.ok(source.includes('password: virtualTestAccounts.traderHash'));
});
