function configureTrustedProxy(app){ if(app&&app.set) app.set('trust proxy',1); return {windowMs:900000,max:300}; }
configureTrustedProxy.init=configureTrustedProxy;
module.exports=configureTrustedProxy;
