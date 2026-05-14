/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║         SHEIKHA Financial Runtime — نطاق المالية والتسويات                  ║
 * ║           SHEIKHA Sovereign Cognitive Infrastructure                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 *
 * نطاق المالية يشمل:
 *   - إدارة المحافظ (wallets)
 *   - المعاملات المالية (transactions)
 *   - التسويات (settlements)
 *   - التقارير المالية (financial reports)
 *
 * ضمانات الامتثال الشرعي:
 *   ❌ لا ربا (No interest-based transactions)
 *   ❌ لا غرر (No excessive uncertainty)
 *   ✅ شفافية التسعير
 *   ✅ حماية المستهلك
 *
 * @module financial/index
 * @version 1.0.0
 */

'use strict';

const EventEmitter = require('events');

const DOMAIN_IDENTITY = {
    name: 'SHEIKHA Financial Runtime',
    domain: 'financial',
    fabric: 'Financial Fabric',
    version: '1.0.0',
    startedAt: null,
    complianceNote: 'Shariah-compliant — no riba, no gharar',
};

const _bus = new EventEmitter();
_bus.setMaxListeners(32);

/** @type {Map<string, {balance: number, currency: string, ownerId: string, transactions: Array}>} */
const _wallets = new Map();

const _txCounter = { value: 0 };

function createWallet(walletId, ownerId, currency = 'SAR') {
    _wallets.set(walletId, { walletId, ownerId, currency, balance: 0, transactions: [] });
    _bus.emit('wallet:created', { walletId, ownerId });
    return { walletId, balance: 0, currency };
}

function credit(walletId, amount, description = '') {
    if (amount <= 0) throw new Error('[FINANCIAL] مبلغ الإضافة يجب أن يكون أكبر من صفر');
    const wallet = _wallets.get(walletId);
    if (!wallet) throw new Error(`[FINANCIAL] المحفظة "${walletId}" غير موجودة`);
    wallet.balance += amount;
    _txCounter.value += 1;
    const tx = { txId: `TX-${_txCounter.value}`, type: 'credit', amount, description, at: new Date().toISOString() };
    wallet.transactions.push(tx);
    _bus.emit('wallet:credited', { walletId, amount, balance: wallet.balance });
    return tx;
}

function debit(walletId, amount, description = '') {
    if (amount <= 0) throw new Error('[FINANCIAL] مبلغ الخصم يجب أن يكون أكبر من صفر');
    const wallet = _wallets.get(walletId);
    if (!wallet) throw new Error(`[FINANCIAL] المحفظة "${walletId}" غير موجودة`);
    if (wallet.balance < amount) throw new Error('[FINANCIAL] رصيد غير كافٍ');
    wallet.balance -= amount;
    _txCounter.value += 1;
    const tx = { txId: `TX-${_txCounter.value}`, type: 'debit', amount, description, at: new Date().toISOString() };
    wallet.transactions.push(tx);
    _bus.emit('wallet:debited', { walletId, amount, balance: wallet.balance });
    return tx;
}

function getBalance(walletId) {
    const wallet = _wallets.get(walletId);
    return wallet ? wallet.balance : null;
}

function settle(fromWalletId, toWalletId, amount, description = '') {
    const txDebit = debit(fromWalletId, amount, description);
    const txCredit = credit(toWalletId, amount, description);
    _bus.emit('settlement:completed', { from: fromWalletId, to: toWalletId, amount });
    return { debit: txDebit, credit: txCredit };
}

function status() {
    return {
        ...DOMAIN_IDENTITY,
        wallets: _wallets.size,
        transactions: _txCounter.value,
    };
}

function start() {
    DOMAIN_IDENTITY.startedAt = new Date().toISOString();
    console.log(`[SHEIKHA-FINANCIAL] ✅ نطاق المالية جاهز | شريعة إسلامية مُطبَّقة`);
    _bus.emit('domain:ready', { identity: DOMAIN_IDENTITY });
}

function on(event, handler) { _bus.on(event, handler); }

module.exports = {
    start,
    createWallet,
    credit,
    debit,
    getBalance,
    settle,
    status,
    on,
    DOMAIN_IDENTITY,
};
