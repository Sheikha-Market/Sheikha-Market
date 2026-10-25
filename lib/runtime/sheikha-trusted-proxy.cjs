// 🕌 SHEIKHA TRUSTED PROXY RUNTIME - BOUND_BY_QURAN_SUNNAH
module.exports = function configureTrustedProxy(app) {
  if (app && typeof app.set === 'function') {
    app.set('trust proxy', 1);
  }
  return { status: "ACTIVE", trusted: true, hops: 1 };
};
