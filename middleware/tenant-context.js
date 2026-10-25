// 🕌 SHEIKHA TENANT CONTEXT MIDDLEWARE - BOUND_BY_QURAN_SUNNAH
function createTenantContextMiddleware() {
  return function(req, res, next) {
    req.tenant = { id: 'sovereign', cr: '2051263653', seal: 'ATOM_WATER_RASUL_JANNAH_SEALED' };
    if (next) next();
  };
}
module.exports = createTenantContextMiddleware;
module.exports.createTenantContextMiddleware = createTenantContextMiddleware;
module.exports.middleware = createTenantContextMiddleware();
