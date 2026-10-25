"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = bootstrap;
require("./instrument");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express = __importStar(require("express"));
const app_module_1 = require("./app.module");
const auth_instance_1 = require("./auth/auth.instance");
const mcp_oauth_response_1 = require("./auth/mcp-oauth-response");
const mcp_discovery_1 = require("./mcp/mcp-discovery");
const spa_fallback_filter_1 = require("./common/filters/spa-fallback.filter");
const http_error_logger_middleware_1 = require("./common/middleware/http-error-logger.middleware");
const body_parser_limits_1 = require("./common/middleware/body-parser-limits");
const cors_csp_config_1 = require("./cors-csp-config");
const rate_limit_log_1 = require("./common/middleware/rate-limit-log");
const compression_filter_1 = require("./routing/proxy/compression-filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: false,
        logger: new common_1.ConsoleLogger({ prefix: 'Manifest' }),
    });
    app.enableShutdownHooks();
    app.useGlobalFilters(new spa_fallback_filter_1.SpaFallbackFilter(process.env['BETTER_AUTH_URL']));
    const betterAuthUrl = process.env['BETTER_AUTH_URL'] || '';
    const hstsEnabled = /^https:\/\//i.test(betterAuthUrl);
    const isDev = process.env['NODE_ENV'] !== 'production';
    const backendPort = Number(process.env['PORT']) || 3001;
    const wingmanPort = Number(process.env['WINGMAN_PORT']) || backendPort + 1;
    const frameSrc = (0, cors_csp_config_1.buildFrameSrc)({ isDev, wingmanPort });
    app.use((0, helmet_1.default)({
        hsts: hstsEnabled,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:'],
                connectSrc: ["'self'", 'https://*.neon.tech'],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc,
                frameAncestors: (0, cors_csp_config_1.parseFrameAncestors)(process.env['FRAME_ANCESTORS']),
                upgradeInsecureRequests: null,
            },
        },
    }));
    app.use((0, compression_1.default)({ filter: compression_filter_1.shouldCompress }));
    const corsAllowedOrigins = isDev
        ? (0, cors_csp_config_1.buildDevAllowedOrigins)({
            configuredOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
            wingmanPort,
        })
        : (0, cors_csp_config_1.buildProdAllowedOrigins)({ extraOrigins: process.env['WINGMAN_CORS_ORIGINS'] });
    app.use((req, res, next) => {
        (0, cors_csp_config_1.applyPrivateNetworkAllow)(req, corsAllowedOrigins, (name, value) => res.setHeader(name, value));
        next();
    });
    app.use((req, res, next) => {
        const handled = (0, cors_csp_config_1.applyPivotClaimCors)(req, (name, value) => res.setHeader(name, value));
        if (handled) {
            res.sendStatus(204);
            return;
        }
        next();
    });
    app.enableCors((0, cors_csp_config_1.buildCorsOptions)(corsAllowedOrigins));
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(http_error_logger_middleware_1.httpErrorLogger);
    if (!isDev) {
        const rawTrustProxy = process.env['TRUST_PROXY'] ?? 'loopback, linklocal, uniquelocal';
        const trustProxy = /^\d+$/.test(rawTrustProxy)
            ? Number(rawTrustProxy)
            : rawTrustProxy === 'true'
                ? true
                : rawTrustProxy === 'false'
                    ? false
                    : rawTrustProxy;
        expressApp.set('trust proxy', trustProxy);
    }
    const { default: rateLimit } = await Promise.resolve().then(() => __importStar(require('express-rate-limit')));
    const loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many login attempts. Try again later.' },
        handler: (0, rate_limit_log_1.createRateLimitReachedHandler)('sign-in'),
    });
    const signupLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many sign-up attempts. Try again later.' },
        handler: (0, rate_limit_log_1.createRateLimitReachedHandler)('sign-up'),
    });
    const forgetPasswordLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many password reset requests. Try again later.' },
        handler: (0, rate_limit_log_1.createRateLimitReachedHandler)('password-reset'),
    });
    const verifyEmailLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many verification requests. Try again later.' },
        handler: (0, rate_limit_log_1.createRateLimitReachedHandler)('verify-email'),
    });
    expressApp.use('/api/auth/sign-in', loginLimiter);
    expressApp.use('/api/auth/sign-up', signupLimiter);
    expressApp.use('/api/auth/forget-password', forgetPasswordLimiter);
    expressApp.use('/api/auth/forgot-password', forgetPasswordLimiter);
    expressApp.use('/api/auth/reset-password', forgetPasswordLimiter);
    expressApp.use('/api/auth/verify-email', verifyEmailLimiter);
    expressApp.use('/api/auth/send-verification-email', verifyEmailLimiter);
    const { toNodeHandler } = await Promise.resolve().then(() => __importStar(require('better-auth/node')));
    const authHandler = (request) => auth_instance_1.auth.handler(request).then((response) => (0, mcp_oauth_response_1.mcpOAuthResponse)(request, response));
    expressApp.all('/api/auth/*splat', toNodeHandler({ handler: authHandler }));
    expressApp.use('/v1', (0, body_parser_limits_1.createProxyBodyBudgetMiddleware)());
    expressApp.use('/v1', express.json({ limit: body_parser_limits_1.PROXY_BODY_LIMIT }));
    expressApp.use('/v1', express.urlencoded({ extended: true, limit: body_parser_limits_1.PROXY_BODY_LIMIT }));
    expressApp.use(express.json({ limit: body_parser_limits_1.API_BODY_LIMIT }));
    expressApp.use(express.urlencoded({ extended: true, limit: body_parser_limits_1.API_BODY_LIMIT }));
    expressApp.use(body_parser_limits_1.bodyParserErrorHandler);
    if (auth_instance_1.mcpEnabled) {
        (0, mcp_discovery_1.mountMcpDiscovery)(app);
    }
    else {
        (0, mcp_discovery_1.mountMcpUnavailable)(app);
        logger.warn(`Remote MCP server disabled: ${auth_instance_1.mcpDisabledReason}`);
    }
    const port = Number(process.env['PORT'] ?? 3001);
    const host = process.env['BIND_ADDRESS'] ?? '127.0.0.1';
    await app.listen(port, host);
    logger.log(`Server running on http://${host}:${port}`);
    if (isDev && host !== '127.0.0.1' && host !== 'localhost' && host !== '::1') {
        logger.warn(`Development mode with BIND_ADDRESS=${host} — auth guards are relaxed for loopback IPs. ` +
            'Ensure this server is not exposed to untrusted networks.');
    }
    if (!isDev &&
        !hstsEnabled &&
        host !== '127.0.0.1' &&
        host !== 'localhost' &&
        host !== '::1' &&
        process.env['MANIFEST_DISABLE_HSTS'] !== '1') {
        logger.warn('HSTS is disabled. Set BETTER_AUTH_URL to your https:// origin to enable it, or set ' +
            'MANIFEST_DISABLE_HSTS=1 to silence this warning for HTTP-only LAN deployments.');
    }
    return app;
}
if (!process.env['MANIFEST_EMBEDDED']) {
    bootstrap().catch((err) => {
        new common_1.Logger('Bootstrap').fatal('Manifest failed to start — see the error above. A failed database migration is the most ' +
            'common cause; if it reports provider/config rows that "cannot be re-scoped", back up your ' +
            'database and re-run with MANIFEST_MIGRATION_FORCE=1.', err instanceof Error ? err.stack : String(err));
        process.exit(1);
    });
}
//# sourceMappingURL=main.js.map