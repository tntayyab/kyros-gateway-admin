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
var KiroOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KiroOauthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_crypto_1 = require("node:crypto");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const secret_scrub_1 = require("../../../common/utils/secret-scrub");
const core_1 = require("../core");
const kiro_oidc_1 = require("./kiro-oidc");
const PENDING_TOKEN_ERRORS = new Set(['authorization_pending', 'slow_down']);
const SLOW_DOWN_BACKOFF_MS = 5000;
let KiroOauthService = KiroOauthService_1 = class KiroOauthService {
    providerService;
    configService;
    discoveryService;
    logger = new common_1.Logger(KiroOauthService_1.name);
    pending = new Map();
    region;
    startUrl;
    scopes;
    constructor(providerService, configService, discoveryService) {
        this.providerService = providerService;
        this.configService = configService;
        this.discoveryService = discoveryService;
        this.region = this.configService.get('KIRO_OIDC_REGION') ?? kiro_oidc_1.KIRO_OIDC_DEFAULT_REGION;
        this.startUrl = this.configService.get('KIRO_START_URL') ?? kiro_oidc_1.KIRO_DEFAULT_START_URL;
        const scopeOverride = this.configService.get('KIRO_OAUTH_SCOPES');
        this.scopes = scopeOverride
            ? scopeOverride
                .split(',')
                .map((scope) => scope.trim())
                .filter(Boolean)
            : kiro_oidc_1.KIRO_DEFAULT_SCOPES;
    }
    async startAuthorization(agentId, tenantId, createdByUserId, options = {}) {
        this.cleanupExpired();
        const { region, startUrl } = this.resolveAuthorizationOptions(options);
        const baseUrl = (0, kiro_oidc_1.getKiroOidcBaseUrl)(region);
        const { clientId, clientSecret } = await this.registerClient(baseUrl);
        const device = await this.startDeviceAuthorization(baseUrl, clientId, clientSecret, startUrl);
        const flowId = (0, node_crypto_1.randomBytes)(16).toString('base64url');
        const expiresAt = (0, kiro_oidc_1.toAbsoluteExpiryTimestamp)(device.expiresIn);
        const pollIntervalMs = (0, kiro_oidc_1.toPollIntervalMs)(device.interval);
        this.pending.set(flowId, {
            clientId,
            clientSecret,
            deviceCode: device.deviceCode,
            agentId,
            tenantId,
            createdByUserId: createdByUserId ?? null,
            region,
            expiresAt,
            pollIntervalMs,
        });
        return {
            flowId,
            userCode: device.userCode,
            verificationUri: device.verificationUriComplete || device.verificationUri,
            expiresAt,
            pollIntervalMs,
        };
    }
    async pollAuthorization(flowId, tenantId) {
        const pending = this.pending.get(flowId);
        if (!pending) {
            return { status: 'error', message: 'Kiro login expired. Start again.' };
        }
        if (pending.tenantId !== tenantId) {
            return { status: 'error', message: 'Kiro login session does not match the current account.' };
        }
        if (Date.now() >= pending.expiresAt) {
            this.pending.delete(flowId);
            return { status: 'error', message: 'Kiro login expired. Start again.' };
        }
        const baseUrl = (0, kiro_oidc_1.getKiroOidcBaseUrl)(pending.region);
        const response = await fetch((0, kiro_oidc_1.buildKiroTokenUrl)(baseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                clientId: pending.clientId,
                clientSecret: pending.clientSecret,
                grantType: kiro_oidc_1.KIRO_DEVICE_CODE_GRANT,
                deviceCode: pending.deviceCode,
            }),
        });
        const payload = await this.parseJson(response);
        if (!response.ok) {
            const error = payload?.error ?? '';
            if (PENDING_TOKEN_ERRORS.has(error)) {
                if (error === 'slow_down') {
                    pending.pollIntervalMs += SLOW_DOWN_BACKOFF_MS;
                }
                return {
                    status: 'pending',
                    message: 'Waiting for Kiro approval…',
                    pollIntervalMs: pending.pollIntervalMs,
                };
            }
            this.pending.delete(flowId);
            return {
                status: 'error',
                message: payload?.error_description ?? payload?.message ?? 'Kiro login failed.',
            };
        }
        if (!payload?.accessToken || !payload.refreshToken || !payload.expiresIn) {
            this.pending.delete(flowId);
            return { status: 'error', message: 'Kiro returned an incomplete token payload.' };
        }
        this.pending.delete(flowId);
        const blob = {
            source: 'kiro-oidc',
            t: payload.accessToken,
            r: payload.refreshToken,
            e: (0, kiro_oidc_1.toAbsoluteExpiryTimestamp)(payload.expiresIn),
            cid: pending.clientId,
            cs: pending.clientSecret,
            region: pending.region,
        };
        const label = await this.providerService.nextOAuthLabel(pending.tenantId, 'kiro');
        const { provider: savedProvider } = await this.providerService.upsertProvider(pending.agentId, pending.tenantId, 'kiro', (0, kiro_oidc_1.serializeKiroOAuthTokenBlob)(blob), 'subscription', undefined, label, pending.createdByUserId);
        try {
            await this.discoveryService.discoverModels(savedProvider);
        }
        catch (err) {
            this.logger.warn(`Model discovery after Kiro OAuth failed: ${err}`);
        }
        this.logger.log(`Kiro OAuth token stored for agent=${pending.agentId}`);
        return { status: 'success' };
    }
    async unwrapToken(rawValue, agentId, tenantId, keyLabel) {
        const blob = (0, kiro_oidc_1.parseKiroOAuthTokenBlob)(rawValue);
        if (!blob)
            return null;
        if (Date.now() < blob.e - 60_000)
            return blob.t;
        try {
            const resolved = await (0, core_1.coordinateOAuthRefresh)({
                key: (0, core_1.oauthRefreshKey)('kiro', tenantId, keyLabel),
                logger: this.logger,
                callerBlob: blob,
                parse: kiro_oidc_1.parseKiroOAuthTokenBlob,
                refresh: (current) => this.refreshAccessToken(current),
                withLock: (0, core_1.subscriptionCredentialLock)((t, p, l, fn) => this.providerService.withSubscriptionCredentialLock(t, p, l, fn), tenantId, 'kiro', keyLabel, kiro_oidc_1.serializeKiroOAuthTokenBlob),
            });
            return resolved.t;
        }
        catch (err) {
            this.logger.error(`Failed to refresh Kiro OAuth token for agent=${agentId}: ${err}`);
            return Date.now() < blob.e ? blob.t : null;
        }
    }
    getPendingCount() {
        return this.pending.size;
    }
    async registerClient(baseUrl) {
        const response = await fetch((0, kiro_oidc_1.buildKiroRegisterUrl)(baseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                clientName: kiro_oidc_1.KIRO_CLIENT_NAME,
                clientType: kiro_oidc_1.KIRO_CLIENT_TYPE,
                scopes: this.scopes,
                grantTypes: kiro_oidc_1.KIRO_REGISTER_GRANT_TYPES,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Kiro client registration failed: ${text}`);
            throw new Error('Failed to start Kiro login');
        }
        const payload = (await response.json());
        if (!payload.clientId || !payload.clientSecret) {
            throw new Error('Kiro client registration returned an incomplete payload.');
        }
        return { clientId: payload.clientId, clientSecret: payload.clientSecret };
    }
    async startDeviceAuthorization(baseUrl, clientId, clientSecret, startUrl) {
        const response = await fetch((0, kiro_oidc_1.buildKiroDeviceAuthorizationUrl)(baseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ clientId, clientSecret, startUrl }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Kiro device authorization failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Failed to start Kiro login');
        }
        const payload = (await response.json());
        if (!payload.deviceCode ||
            !payload.userCode ||
            !(payload.verificationUriComplete || payload.verificationUri) ||
            !payload.expiresIn) {
            throw new Error('Kiro device authorization returned an incomplete payload.');
        }
        return payload;
    }
    resolveAuthorizationOptions(options) {
        return {
            region: (0, kiro_oidc_1.normalizeKiroRegion)(options.region ?? this.region),
            startUrl: (0, kiro_oidc_1.normalizeKiroStartUrl)(options.startUrl ?? this.startUrl),
        };
    }
    async refreshAccessToken(blob) {
        const baseUrl = (0, kiro_oidc_1.getKiroOidcBaseUrl)(blob.region ?? this.region);
        const response = await fetch((0, kiro_oidc_1.buildKiroTokenUrl)(baseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                clientId: blob.cid,
                clientSecret: blob.cs,
                grantType: kiro_oidc_1.KIRO_REFRESH_GRANT,
                refreshToken: blob.r,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Kiro token refresh failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Token refresh failed');
        }
        const payload = (await response.json());
        if (!payload.accessToken || !payload.expiresIn) {
            throw new Error('Kiro token refresh returned an incomplete payload');
        }
        return {
            ...blob,
            t: payload.accessToken,
            r: payload.refreshToken || blob.r,
            e: (0, kiro_oidc_1.toAbsoluteExpiryTimestamp)(payload.expiresIn),
        };
    }
    cleanupExpired() {
        const now = Date.now();
        for (const [flowId, pending] of this.pending.entries()) {
            if (pending.expiresAt <= now)
                this.pending.delete(flowId);
        }
    }
    async parseJson(response) {
        const text = await response.text();
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
exports.KiroOauthService = KiroOauthService;
exports.KiroOauthService = KiroOauthService = KiroOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        config_1.ConfigService,
        model_discovery_service_1.ModelDiscoveryService])
], KiroOauthService);
//# sourceMappingURL=kiro-oauth.service.js.map