function tenantContextMiddleware(req,res,next){ req.tenant={id:"SOVEREIGN",cr:"2051263653",seal:"BOUND_BY_QURAN_SUNNAH"}; next(); }
module.exports=tenantContextMiddleware;
module.exports.default=tenantContextMiddleware;
