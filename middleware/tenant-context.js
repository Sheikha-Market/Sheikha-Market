// 🕌 SHEIKHA TENANT CONTEXT MIDDLEWARE - BOUND_BY_QURAN_SUNNAH
module.exports = function tenantContextMiddleware(req, res, next) {
  req.tenant = {
    id: "SHEIKHA_SOVEREIGN_ROOT",
    owner: "سلمان أحمد بن سلمان الراجح",
    cr: "2051263653",
    seal: "ATOM_WATER_RASUL_JANNAH_SEALED"
  };
  if (next) next();
};
