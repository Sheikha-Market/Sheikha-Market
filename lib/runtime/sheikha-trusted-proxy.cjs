// 🕌 SHEIKHA TRUSTED PROXY FUNCTION - BOUND_BY_QURAN_SUNNAH
function configureTrustedProxy(app) {
  if (app && typeof app.set === 'function') {
    app.set('trust proxy', 1);
  }
  return {
    trustProxy: true,
    keyGenerator: function(req) {
      return req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    }
  };
}
configureTrustedProxy.init = function(app) { return configureTrustedProxy(app); };
module.exports = configureTrustedProxy;
