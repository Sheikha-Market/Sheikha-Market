'use strict';

function createVirtualTestAccounts(env, hashPassword) {
    const customer = env.SHEIKHA_TEST_CUSTOMER_PASSWORD;
    const trader = env.SHEIKHA_TEST_TRADER_PASSWORD;
    const valid = value => typeof value === 'string' && value.length >= 16;
    const enabled = env.NODE_ENV !== 'production'
        && env.SHEIKHA_ENABLE_TEST_ACCOUNTS === 'true'
        && valid(customer) && valid(trader) && customer !== trader;
    return Object.freeze({
        enabled,
        customerHash: enabled ? hashPassword(customer) : null,
        traderHash: enabled ? hashPassword(trader) : null,
        guard(_req, res, next) {
            if (!enabled) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
            return next();
        }
    });
}

module.exports = { createVirtualTestAccounts };
