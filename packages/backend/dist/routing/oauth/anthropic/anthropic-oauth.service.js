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
var AnthropicOauthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicOauthService = exports.AnthropicOauthExchangeError = void 0;
exports.splitAnthropicAuthPayload = splitAnthropicAuthPayload;
const common_1 = require("@nestjs/common");
const provider_service_1 = require("../../routing-core/provider.service");
const model_discovery_service_1 = require("../../../model-discovery/model-discovery.service");
const secret_scrub_1 = require("../../../common/utils/secret-scrub");
const core_1 = require("../core");
const anthropic_oauth_config_1 = require("./anthropic-oauth.config");
class AnthropicOauthExchangeError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'AnthropicOauthExchangeError';
    }
}
exports.AnthropicOauthExchangeError = AnthropicOauthExchangeError;
const PROVIDER = 'anthropic';
const ANTHROPIC_OAUTH_TOKEN_HEADERS = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'anthropic',
};
function splitAnthropicAuthPayload(payload) {
    const trimmed = payload.trim();
    const hashIdx = trimmed.indexOf('#');
    if (hashIdx === -1)
        return { code: trimmed };
    return {
        code: trimmed.slice(0, hashIdx),
        state: trimmed.slice(hashIdx + 1) || undefined,
    };
}
let AnthropicOauthService = AnthropicOauthService_1 = class AnthropicOauthService {
    providerService;
    discoveryService;
    pendingFlows;
    logger = new common_1.Logger(AnthropicOauthService_1.name);
    constructor(providerService, discoveryService, pendingFlows) {
        this.providerService = providerService;
        this.discoveryService = discoveryService;
        this.pendingFlows = pendingFlows;
    }
    async generateAuthorizationUrl(agentId, tenantId) {
        const { verifier, challenge } = (0, core_1.generatePkce)();
        const state = verifier;
        await this.pendingFlows.create(PROVIDER, { state, verifier, agentId, tenantId }, anthropic_oauth_config_1.ANTHROPIC_OAUTH.STATE_TTL_MS);
        const params = new URLSearchParams({
            code: 'true',
            client_id: anthropic_oauth_config_1.ANTHROPIC_OAUTH.CLIENT_ID,
            response_type: 'code',
            redirect_uri: anthropic_oauth_config_1.ANTHROPIC_OAUTH.REDIRECT_URI,
            scope: anthropic_oauth_config_1.ANTHROPIC_OAUTH.SCOPE,
            state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        });
        return { url: `${anthropic_oauth_config_1.ANTHROPIC_OAUTH.AUTHORIZE_URL}?${params.toString()}`, state };
    }
    async exchangeCode(payload, fallbackState, agentId, tenantId, createdByUserId) {
        const { code, state: extractedState } = splitAnthropicAuthPayload(payload);
        let state = extractedState ?? fallbackState?.trim();
        if (!code)
            throw new Error('Missing authorization code');
        if (!state) {
            const latest = await this.pendingFlows.findLatestForAgent(PROVIDER, agentId, tenantId);
            state = latest?.state;
        }
        if (!state)
            throw new Error('Missing OAuth state');
        const pending = await this.pendingFlows.consume(PROVIDER, state, agentId, tenantId);
        if (!pending)
            throw new Error('Invalid or expired OAuth state');
        if (pending.expiresAt < Date.now()) {
            throw new Error('OAuth state expired');
        }
        const tokenRequest = {
            grant_type: 'authorization_code',
            code,
            state,
            client_id: anthropic_oauth_config_1.ANTHROPIC_OAUTH.CLIENT_ID,
            redirect_uri: anthropic_oauth_config_1.ANTHROPIC_OAUTH.REDIRECT_URI,
            code_verifier: pending.verifier || state,
        };
        const response = await fetch(anthropic_oauth_config_1.ANTHROPIC_OAUTH.TOKEN_URL, {
            method: 'POST',
            headers: ANTHROPIC_OAUTH_TOKEN_HEADERS,
            body: JSON.stringify(tokenRequest),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Anthropic token exchange failed: ${(0, secret_scrub_1.scrubSecrets)(text)}; request_shape=${JSON.stringify(describeTokenExchangeRequest(tokenRequest))}`);
            throw anthropicTokenExchangeError(response.status, text);
        }
        const data = (await response.json());
        const blob = {
            t: data.access_token,
            r: data.refresh_token ?? '',
            e: Date.now() + data.expires_in * 1000,
        };
        const label = await this.providerService.nextOAuthLabel(pending.tenantId, PROVIDER);
        const { provider: savedProvider } = await this.providerService.upsertProvider(pending.agentId, pending.tenantId, PROVIDER, (0, core_1.serializeOAuthTokenBlob)(blob), 'subscription', undefined, label, createdByUserId);
        try {
            await this.discoveryService.discoverModels(savedProvider);
        }
        catch (err) {
            this.logger.warn(`Model discovery after Anthropic OAuth failed: ${err}`);
        }
        this.logger.log(`Anthropic OAuth token stored for agent=${pending.agentId}`);
    }
    async refreshAccessToken(refreshToken) {
        const response = await fetch(anthropic_oauth_config_1.ANTHROPIC_OAUTH.TOKEN_URL, {
            method: 'POST',
            headers: ANTHROPIC_OAUTH_TOKEN_HEADERS,
            body: JSON.stringify({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: anthropic_oauth_config_1.ANTHROPIC_OAUTH.CLIENT_ID,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`Anthropic token refresh failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Token refresh failed');
        }
        const data = (await response.json());
        return {
            t: data.access_token,
            r: data.refresh_token || refreshToken,
            e: Date.now() + data.expires_in * 1000,
        };
    }
    async unwrapToken(rawValue, agentId, tenantId, keyLabel) {
        const blob = (0, core_1.parseOAuthTokenBlob)(rawValue);
        if (!blob) {
            return rawValue || null;
        }
        if (Date.now() < blob.e - 60_000)
            return blob.t;
        if (!blob.r) {
            return blob.t;
        }
        try {
            const resolved = await (0, core_1.coordinateOAuthRefresh)({
                key: (0, core_1.oauthRefreshKey)('anthropic', tenantId, keyLabel),
                logger: this.logger,
                callerBlob: blob,
                parse: core_1.parseOAuthTokenBlob,
                refresh: (current) => this.refreshAccessToken(current.r),
                withLock: (0, core_1.subscriptionCredentialLock)((t, p, l, fn) => this.providerService.withSubscriptionCredentialLock(t, p, l, fn), tenantId, 'anthropic', keyLabel, core_1.serializeOAuthTokenBlob),
            });
            return resolved.t;
        }
        catch (err) {
            this.logger.error(`Failed to refresh Anthropic token for agent=${agentId}: ${err}`);
            return null;
        }
    }
    getPendingCount() {
        return this.pendingFlows.count(PROVIDER);
    }
    async clearPendingState(state) {
        await this.pendingFlows.clear(PROVIDER, state);
    }
    async findPendingForAgent(agentId, tenantId) {
        const pending = await this.pendingFlows.findLatestForAgent(PROVIDER, agentId, tenantId);
        return pending ? { state: pending.state } : null;
    }
};
exports.AnthropicOauthService = AnthropicOauthService;
exports.AnthropicOauthService = AnthropicOauthService = AnthropicOauthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [provider_service_1.ProviderService,
        model_discovery_service_1.ModelDiscoveryService,
        core_1.OAuthPendingFlowStore])
], AnthropicOauthService);
function anthropicTokenExchangeError(status, text) {
    const providerError = parseAnthropicProviderError(text);
    if (status === common_1.HttpStatus.TOO_MANY_REQUESTS || providerError?.type === 'rate_limit_error') {
        return new AnthropicOauthExchangeError('Anthropic rate-limited the OAuth token exchange. Please wait a minute, then sign in again.', common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
    return new AnthropicOauthExchangeError('Token exchange failed', common_1.HttpStatus.BAD_REQUEST);
}
function parseAnthropicProviderError(text) {
    try {
        const parsed = JSON.parse(text);
        const type = parsed.error?.type;
        return typeof type === 'string' ? { type } : null;
    }
    catch {
        return null;
    }
}
function describeTokenExchangeRequest(request) {
    const codeLength = stringLength(request.code);
    const stateLength = stringLength(request.state);
    const codeVerifierLength = stringLength(request.code_verifier);
    return {
        grantType: request.grant_type,
        hasCode: codeLength > 0,
        codeLength,
        hasState: stateLength > 0,
        stateLength,
        hasCodeVerifier: codeVerifierLength > 0,
        codeVerifierLength,
        stateMatchesCodeVerifier: typeof request.state === 'string' &&
            typeof request.code_verifier === 'string' &&
            request.state === request.code_verifier,
        hasClientId: stringLength(request.client_id) > 0,
        hasRedirectUri: stringLength(request.redirect_uri) > 0,
    };
}
function stringLength(value) {
    return typeof value === 'string' ? value.length : 0;
}
//# sourceMappingURL=anthropic-oauth.service.js.map