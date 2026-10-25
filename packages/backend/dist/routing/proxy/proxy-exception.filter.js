"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyExceptionFilter = void 0;
exports.isChatRenderingClient = isChatRenderingClient;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const error_codes_1 = require("../../common/errors/error-codes");
const manifest_error_1 = require("../../common/errors/manifest-error");
const proxy_message_recorder_1 = require("./proxy-message-recorder");
const request_headers_1 = require("./request-headers");
const proxy_friendly_response_1 = require("./proxy-friendly-response");
const AUTH_ERROR_CODES = {
    'Authorization header required': 'M001',
    'Empty token': 'M002',
    'Invalid API key format': 'M003',
    'API key expired': 'M004',
    'Invalid API key': 'M005',
};
const PASSTHROUGH_STATUSES = new Set([429]);
function isChatRenderingClient(req) {
    const body = req.body;
    if (body && body['stream'] === true)
        return true;
    const accept = req.headers['accept'];
    if (typeof accept === 'string' && accept.includes('text/event-stream'))
        return true;
    return false;
}
let ProxyExceptionFilter = class ProxyExceptionFilter {
    config;
    recorder;
    constructor(config, recorder) {
        this.config = config;
        this.recorder = recorder;
    }
    recordExpiredKey(req, content) {
        const ctx = req.manifestErrorContext;
        if (!ctx)
            return;
        const body = req.body;
        const model = typeof body?.model === 'string' ? body.model : undefined;
        this.recorder
            .recordManifestBlockedRequest(ctx, {
            httpStatus: 401,
            errorMessage: content,
            errorCode: 'M004',
            reason: manifest_error_1.MANIFEST_CODE_TO_REASON.M004,
            model,
            requestHeaders: (0, request_headers_1.sanitizeRequestHeaders)(req.headers),
        })
            .catch(() => undefined);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest();
        const res = ctx.getResponse();
        const status = exception.getStatus();
        const message = exception.message;
        if (PASSTHROUGH_STATUSES.has(status)) {
            const response = exception.getResponse();
            res
                .status(status)
                .json(typeof response === 'string'
                ? { error: { message: response, type: 'proxy_error' } }
                : response);
            return;
        }
        const billingResponse = exception.getResponse();
        if (status === 402 &&
            typeof billingResponse === 'object' &&
            billingResponse !== null &&
            billingResponse.code === 'PLAN_LIMIT_REQUESTS') {
            const { limit, used } = billingResponse;
            const upgradeUrl = `${(0, proxy_friendly_response_1.getDashboardUrl)(this.config)}/upgrade?reason=requests`;
            const content = (0, error_codes_1.formatManifestError)('M204', { threshold: limit ?? 0, upgradeUrl });
            const isStream = req.body?.stream === true;
            if (isChatRenderingClient(req)) {
                (0, proxy_friendly_response_1.sendFriendlyResponse)(res, content, isStream);
            }
            else {
                res.status(402).json({
                    error: { message: content, type: 'insufficient_quota', code: 'PLAN_LIMIT_REQUESTS' },
                    limit,
                    used,
                });
            }
            return;
        }
        const isStream = req.body?.stream === true;
        const isChatClient = isChatRenderingClient(req);
        const errorCode = AUTH_ERROR_CODES[message];
        if (errorCode) {
            const friendly = (0, error_codes_1.formatManifestError)(errorCode);
            const dashboardUrl = (0, proxy_friendly_response_1.getDashboardUrl)(this.config);
            const content = errorCode === 'M004'
                ? `${friendly}: ${dashboardUrl}`
                : `${friendly}\n\nDashboard: ${dashboardUrl}`;
            if (errorCode === 'M004')
                this.recordExpiredKey(req, content);
            if (isChatClient) {
                (0, proxy_friendly_response_1.sendFriendlyResponse)(res, content, isStream);
            }
            else {
                const realStatus = status === 400 ? 400 : 401;
                res.status(realStatus).json({
                    error: { message: content, type: 'auth_error', code: 'manifest_auth' },
                });
            }
            return;
        }
        if (isChatClient) {
            const content = status >= 500 ? (0, error_codes_1.formatManifestError)('M500') : message;
            (0, proxy_friendly_response_1.sendFriendlyResponse)(res, content, isStream);
            return;
        }
        const errorMessage = status >= 500 ? 'Manifest encountered an internal error. Try again shortly.' : message;
        res.status(status).json({
            error: {
                message: errorMessage,
                type: status >= 500 ? 'server_error' : 'invalid_request_error',
            },
        });
    }
};
exports.ProxyExceptionFilter = ProxyExceptionFilter;
exports.ProxyExceptionFilter = ProxyExceptionFilter = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.Catch)(common_1.HttpException),
    __metadata("design:paramtypes", [config_1.ConfigService,
        proxy_message_recorder_1.ProxyMessageRecorder])
], ProxyExceptionFilter);
//# sourceMappingURL=proxy-exception.filter.js.map