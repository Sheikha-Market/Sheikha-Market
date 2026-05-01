const fiqh = require('../lib/sheikha-fiqh-engine');

module.exports = function sheikhaShariaGuard(req, res, next) {
    try {
        const context = {
            ...req.body,
            path: req.path,
            method: req.method
        };

        const result = fiqh.evaluate(context);

        if (!result.allowed) {
            return res.status(403).json({
                success: false,
                error: 'SHARIA_BLOCK',
                message: 'تم منع العملية لمخالفة شرعية',
                details: result
            });
        }

        req.sharia = result;
        next();
    } catch (e) {
        return res.status(500).json({
            success: false,
            error: 'SHARIA_ENGINE_ERROR',
            message: e.message
        });
    }
};