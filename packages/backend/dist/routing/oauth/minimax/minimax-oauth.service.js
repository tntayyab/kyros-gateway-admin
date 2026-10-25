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
var MinimaxOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMinimaxRegion = exports.MINIMAX_DEFAULT_RESOURCE_URL = exports.MinimaxOauthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const secret_scrub_1 = require("../../../common/utils/secret-scrub");
const core_1 = require("../core");
const minimax_oauth_helpers_1 = require("./minimax-oauth-helpers");
function parseMinimaxBlob(raw) {
    try {
        const parsed = JSON.parse(raw);
        return (0, minimax_oauth_helpers_1.isOAuthTokenBlob)(parsed) ? parsed : null;
    }
    catch {
        return null;
    }
}
const DEFAULT_CLIENT_ID = '78257093-7e40-4613-99e0-527b14b39113';
const SCOPE = 'group_id profile model.completion';
const USER_CODE_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:user_code';
let MinimaxOauthService = MinimaxOauthService_1 = class MinimaxOauthService {
    providerService;
    configService;
    discoveryService;
    logger = new common_1.Logger(MinimaxOauthService_1.name);
    pending = new Map();
    clientId;
    constructor(providerService, configService, discoveryService) {
        this.providerService = providerService;
        this.configService = configService;
        this.discoveryService = discoveryService;
        this.clientId = this.configService.get('MINIMAX_OAUTH_CLIENT_ID') ?? DEFAULT_CLIENT_ID;
    }
    async startAuthorization(agentId, tenantId, region = minimax_oauth_helpers_1.DEFAULT_REGION, createdByUserId) {
        this.cleanupExpired();
        const verifier = (0, crypto_1.randomBytes)(32).toString('base64url');
        const challenge = (0, crypto_1.createHash)('sha256').update(verifier).digest('base64url');
        const flowId = (0, crypto_1.randomBytes)(16).toString('base64url');
        const baseUrl = (0, minimax_oauth_helpers_1.getMinimaxBaseUrl)(region);
        const resourceUrl = (0, minimax_oauth_helpers_1.buildMinimaxResourceUrl)(baseUrl);
        const response = await fetch((0, minimax_oauth_helpers_1.buildMinimaxCodeUrl)(baseUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                'x-request-id': (0, crypto_1.randomUUID)(),
            },
            body: new URLSearchParams({
                response_type: 'code',
                client_id: this.clientId,
                scope: SCOPE,
                code_challenge: challenge,
                code_challenge_method: 'S256',
                state: flowId,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`MiniMax OAuth code request failed: ${text}`);
            throw new Error('Failed to start MiniMax OAuth');
        }
        const payload = (await response.json());
        if (!payload.user_code || !payload.verification_uri || !payload.expired_in) {
            throw new Error(payload.error ?? 'MiniMax OAuth returned an incomplete authorization payload.');
        }
        if (payload.state !== flowId)
            throw new Error('MiniMax OAuth state mismatch');
        const pollIntervalMs = (0, minimax_oauth_helpers_1.toPollIntervalMs)(payload.interval);
        const expiresAt = (0, minimax_oauth_helpers_1.toAbsoluteExpiryTimestamp)(payload.expired_in);
        const verificationUri = (0, minimax_oauth_helpers_1.normalizeMinimaxVerificationUri)(payload.verification_uri);
        this.pending.set(flowId, {
            verifier,
            userCode: payload.user_code,
            agentId,
            tenantId,
            createdByUserId: createdByUserId ?? null,
            baseUrl,
            resourceUrl,
            expiresAt,
            pollIntervalMs,
        });
        return {
            flowId,
            userCode: payload.user_code,
            verificationUri,
            expiresAt,
            pollIntervalMs,
        };
    }
    async pollAuthorization(flowId, tenantId) {
        this.cleanupExpired();
        const pending = this.pending.get(flowId);
        if (!pending) {
            return { status: 'error', message: 'MiniMax login expired. Start again.' };
        }
        if (pending.tenantId !== tenantId) {
            return {
                status: 'error',
                message: 'MiniMax login session does not match the current account.',
            };
        }
        if (Date.now() >= pending.expiresAt) {
            this.pending.delete(flowId);
            return { status: 'error', message: 'MiniMax login expired. Start again.' };
        }
        const response = await fetch((0, minimax_oauth_helpers_1.buildMinimaxTokenUrl)(pending.baseUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                grant_type: USER_CODE_GRANT_TYPE,
                client_id: this.clientId,
                user_code: pending.userCode,
                code_verifier: pending.verifier,
            }),
        });
        const text = await response.text();
        const payload = this.parseTokenResponse(text);
        if (!response.ok) {
            const message = payload?.base_resp?.status_msg ?? text ?? 'MiniMax OAuth failed';
            this.pending.delete(flowId);
            return { status: 'error', message };
        }
        if (!payload) {
            this.pending.delete(flowId);
            return { status: 'error', message: 'MiniMax OAuth returned an invalid token response.' };
        }
        if (payload.status === 'error') {
            this.pending.delete(flowId);
            return { status: 'error', message: 'MiniMax OAuth failed. Please try again later.' };
        }
        if (payload.status !== 'success') {
            return {
                status: 'pending',
                message: 'Waiting for MiniMax approval…',
                pollIntervalMs: pending.pollIntervalMs,
            };
        }
        if (!payload.access_token || !payload.refresh_token || !payload.expired_in) {
            this.pending.delete(flowId);
            return { status: 'error', message: 'MiniMax OAuth returned an incomplete token payload.' };
        }
        this.pending.delete(flowId);
        const resourceUrl = (0, minimax_oauth_helpers_1.getMinimaxResourceUrl)(payload.resource_url) ?? pending.resourceUrl;
        const blob = {
            t: payload.access_token,
            r: payload.refresh_token,
            e: (0, minimax_oauth_helpers_1.toAbsoluteExpiryTimestamp)(payload.expired_in),
            u: resourceUrl,
        };
        const label = await this.providerService.nextOAuthLabel(pending.tenantId, 'minimax');
        const { provider: savedProvider } = await this.providerService.upsertProvider(pending.agentId, pending.tenantId, 'minimax', JSON.stringify(blob), 'subscription', undefined, label, pending.createdByUserId);
        try {
            await this.discoveryService.discoverModels(savedProvider);
        }
        catch (err) {
            this.logger.warn(`Model discovery after MiniMax OAuth failed: ${err}`);
        }
        this.logger.log(`MiniMax OAuth token stored for agent=${pending.agentId}`);
        return { status: 'success' };
    }
    async refreshAccessToken(refreshToken, resourceUrl) {
        const baseUrl = (0, minimax_oauth_helpers_1.getMinimaxOauthBaseUrl)(resourceUrl);
        const response = await fetch((0, minimax_oauth_helpers_1.buildMinimaxTokenUrl)(baseUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.clientId,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`MiniMax token refresh failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Token refresh failed');
        }
        const payload = (await response.json());
        if (!payload.access_token || !payload.expired_in) {
            throw new Error('MiniMax token refresh returned an incomplete payload');
        }
        const nextResourceUrl = (0, minimax_oauth_helpers_1.getMinimaxResourceUrl)(payload.resource_url) ??
            (0, minimax_oauth_helpers_1.getMinimaxResourceUrl)(resourceUrl) ??
            (0, minimax_oauth_helpers_1.buildMinimaxResourceUrl)(baseUrl);
        return {
            t: payload.access_token,
            r: payload.refresh_token || refreshToken,
            e: (0, minimax_oauth_helpers_1.toAbsoluteExpiryTimestamp)(payload.expired_in),
            ...(nextResourceUrl ? { u: nextResourceUrl } : {}),
        };
    }
    async unwrapToken(rawValue, agentId, tenantId, keyLabel) {
        let blob;
        try {
            const parsed = JSON.parse(rawValue);
            if (!(0, minimax_oauth_helpers_1.isOAuthTokenBlob)(parsed))
                return null;
            blob = parsed;
        }
        catch {
            return null;
        }
        if (!blob.t || !blob.r || !blob.e)
            return null;
        if (Date.now() < blob.e - 60_000)
            return blob;
        try {
            return await (0, core_1.coordinateOAuthRefresh)({
                key: (0, core_1.oauthRefreshKey)('minimax', tenantId, keyLabel),
                logger: this.logger,
                callerBlob: blob,
                parse: parseMinimaxBlob,
                refresh: (current) => this.refreshAccessToken(current.r, current.u),
                withLock: (0, core_1.subscriptionCredentialLock)((t, p, l, fn) => this.providerService.withSubscriptionCredentialLock(t, p, l, fn), tenantId, 'minimax', keyLabel, (refreshed) => JSON.stringify(refreshed)),
            });
        }
        catch (err) {
            this.logger.error(`Failed to refresh MiniMax token: ${err}`);
            return blob;
        }
    }
    getPendingCount() {
        return this.pending.size;
    }
    cleanupExpired() {
        const now = Date.now();
        for (const [flowId, pending] of this.pending.entries()) {
            if (pending.expiresAt <= now)
                this.pending.delete(flowId);
        }
    }
    parseTokenResponse(text) {
        if (!text)
            return null;
        try {
            return JSON.parse(text);
        }
        catch {
            return null;
        }
    }
};
exports.MinimaxOauthService = MinimaxOauthService;
exports.MinimaxOauthService = MinimaxOauthService = MinimaxOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        config_1.ConfigService,
        model_discovery_service_1.ModelDiscoveryService])
], MinimaxOauthService);
var minimax_oauth_helpers_2 = require("./minimax-oauth-helpers");
Object.defineProperty(exports, "MINIMAX_DEFAULT_RESOURCE_URL", { enumerable: true, get: function () { return minimax_oauth_helpers_2.DEFAULT_RESOURCE_URL; } });
var minimax_oauth_helpers_3 = require("./minimax-oauth-helpers");
Object.defineProperty(exports, "isMinimaxRegion", { enumerable: true, get: function () { return minimax_oauth_helpers_3.isMinimaxRegion; } });
//# sourceMappingURL=minimax-oauth.service.js.map