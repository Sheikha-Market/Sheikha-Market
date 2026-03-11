// examples/exchange-mvp.js
// تجربة سريعة لتشغيل محرك المطابقة

const MatchingEngine = require('../lib/exchange/matchingEngine');

const engine = new MatchingEngine();

engine.placeOrder({id:'b1', symbol:'GOLD-1KG', side:'buy', price:60000, quantity:10, type:'limit'});
engine.placeOrder({id:'s1', symbol:'GOLD-1KG', side:'sell', price:59000, quantity:4, type:'limit'});
engine.placeOrder({id:'s2', symbol:'GOLD-1KG', side:'sell', price:60000, quantity:6, type:'limit'});

console.log('OrderBook:', engine.getOrderBook('GOLD-1KG'));
console.log('Trades:', engine.getTrades());
