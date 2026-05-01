// lib/exchange/matchingEngine.js
// بسيط: محرك مطابقة أوامر نموذجي (MVP) - لا يصلح للإنتاج دون تحسينات أمنية/أداء

class MatchingEngine {
    constructor() {
        // orderbook structure: {symbol: {bids: [], asks: []}}
        this.orderbook = {};
        this.trades = [];
    }

    _ensureSymbol(symbol) {
        if(!this.orderbook[symbol]) {
            this.orderbook[symbol] = { bids: [], asks: [] };
        }
    }

    placeOrder(order) {
        // order = {id, symbol, side: 'buy'|'sell', price, quantity, type: 'limit'|'market'}
        this._ensureSymbol(order.symbol);
        const book = this.orderbook[order.symbol];
        if(order.side === 'buy') book.bids.push(order);
        else book.asks.push(order);
        // sort book: bids desc, asks asc
        book.bids.sort((a,b)=>b.price - a.price);
        book.asks.sort((a,b)=>a.price - b.price);
        this.match(order.symbol);
    }

    match(symbol) {
        const book = this.orderbook[symbol];
        while(book.bids.length && book.asks.length && book.bids[0].price >= book.asks[0].price) {
            const bid = book.bids[0];
            const ask = book.asks[0];
            const qty = Math.min(bid.quantity, ask.quantity);
            const price = ask.price; // price-time priority
            this.trades.push({symbol, price, quantity: qty, bidId: bid.id, askId: ask.id, timestamp: Date.now()});
            bid.quantity -= qty; ask.quantity -= qty;
            if(bid.quantity <= 0) book.bids.shift();
            if(ask.quantity <= 0) book.asks.shift();
        }
    }

    getOrderBook(symbol) {
        this._ensureSymbol(symbol);
        return this.orderbook[symbol];
    }

    getTrades() {
        return this.trades;
    }
}

module.exports = MatchingEngine;
