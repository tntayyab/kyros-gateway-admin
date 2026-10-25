"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitReachedHandler = createRateLimitReachedHandler;
const common_1 = require("@nestjs/common");
const logger = new common_1.Logger('RateLimit');
function createRateLimitReachedHandler(name) {
    return (req, res, _next, options) => {
        const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
        logger.warn(`Rate limit reached on ${name}: ${req.method} ${req.originalUrl} ip=${ip}`);
        res.status(options.statusCode).send(options.message);
    };
}
//# sourceMappingURL=rate-limit-log.js.map