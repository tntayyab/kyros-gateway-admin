"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectPkceOauthBaseService = void 0;
const common_1 = require("@nestjs/common");
const http_1 = require("http");
const secret_scrub_1 = require("../../../common/utils/secret-scrub");
const pkce_1 = require("./pkce");
const callback_page_1 = require("./callback-page");
const pending_store_1 = require("./pending-store");
const oauth_blob_1 = require("./oauth-blob");
const oauth_refresh_coordinator_1 = require("./oauth-refresh-coordinator");
const STATE_TTL_MS = 10 * 60 * 1000;
class RedirectPkceOauthBaseService {
    providerService;
    discoveryService;
    oauthConfig;
    logger;
    pending = new pending_store_1.PendingStore(STATE_TTL_MS);
    callbackServer = null;
    serverReady = null;
    clientId;
    clientSecret;
    redirectUri;
    useCallbackServer;
    constructor(providerService, configService, discoveryService, oauthConfig) {
        this.providerService = providerService;
        this.discoveryService = discoveryService;
        this.oauthConfig = oauthConfig;
        this.logger = new common_1.Logger(oauthConfig.serviceName);
        this.clientId =
            configService.get(oauthConfig.clientIdEnvVar)?.trim() || oauthConfig.defaultClientId;
        this.clientSecret = oauthConfig.clientSecretEnvVar
            ? configService.get(oauthConfig.clientSecretEnvVar)?.trim() ||
                oauthConfig.defaultClientSecret
            : oauthConfig.defaultClientSecret;
        this.redirectUri =
            oauthConfig.redirectUri ?? `http://localhost:${oauthConfig.callbackPort}/auth/callback`;
        this.useCallbackServer =
            (configService.get('app.nodeEnv') ?? 'development') !== 'production';
    }
    async generateAuthorizationUrl(agentId, tenantId, backendUrl, createdByUserId) {
        const state = (0, pkce_1.generateState)();
        const { verifier, challenge } = (0, pkce_1.generatePkce)();
        const safeBackendUrl = backendUrl && this.isAllowedRedirectOrigin(backendUrl) ? backendUrl : '';
        this.pending.set(state, {
            verifier,
            agentId,
            tenantId,
            createdByUserId: createdByUserId ?? null,
            backendUrl: safeBackendUrl,
        });
        if (this.useCallbackServer) {
            await this.ensureCallbackServer();
        }
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: this.oauthConfig.scope,
            state,
            ...(this.oauthConfig.includeNonce ? { nonce: (0, pkce_1.generateState)(16) } : {}),
            code_challenge: challenge,
            code_challenge_method: 'S256',
            ...(this.oauthConfig.extraAuthorizeParams ?? {}),
        });
        return `${this.oauthConfig.authorizeUrl}?${params.toString()}`;
    }
    async exchangeCode(state, code) {
        const pending = this.pending.peek(state);
        if (!pending)
            throw new Error('Invalid or expired OAuth state');
        if (pending.expiresAt < Date.now()) {
            this.pending.delete(state);
            throw new Error('OAuth state expired');
        }
        this.pending.delete(state);
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.redirectUri,
            client_id: this.clientId,
            code_verifier: pending.verifier,
        });
        if (this.clientSecret)
            body.set('client_secret', this.clientSecret);
        const response = await fetch(this.oauthConfig.tokenUrl, {
            method: 'POST',
            headers: this.tokenHeaders(),
            body,
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`${this.oauthConfig.providerId} token exchange failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Token exchange failed');
        }
        const data = (await response.json());
        const baseBlob = {
            t: data.access_token,
            r: data.refresh_token ?? '',
            e: Date.now() + data.expires_in * 1000,
        };
        const blob = await this.enrichBlob(baseBlob);
        const label = await this.providerService.nextOAuthLabel(pending.tenantId, this.oauthConfig.providerId);
        const { provider: savedProvider } = await this.providerService.upsertProvider(pending.agentId, pending.tenantId, this.oauthConfig.providerId, (0, oauth_blob_1.serializeOAuthTokenBlob)(blob), 'subscription', undefined, label, pending.createdByUserId);
        try {
            await this.discoveryService.discoverModels(savedProvider);
        }
        catch (err) {
            this.logger.warn(`Model discovery after OAuth failed: ${err}`);
        }
        this.logger.log(`${this.oauthConfig.providerId} OAuth token stored for agent=${pending.agentId}`);
        this.shutdownCallbackServerIfIdle();
    }
    async refreshAccessToken(refreshToken, resourceField) {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: this.clientId,
        });
        if (this.clientSecret)
            body.set('client_secret', this.clientSecret);
        const response = await fetch(this.oauthConfig.tokenUrl, {
            method: 'POST',
            headers: this.tokenHeaders(),
            body,
        });
        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`${this.oauthConfig.providerId} token refresh failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            throw new Error('Token refresh failed');
        }
        const data = (await response.json());
        return {
            t: data.access_token,
            r: data.refresh_token || refreshToken,
            e: Date.now() + data.expires_in * 1000,
            ...(resourceField ? { u: resourceField } : {}),
        };
    }
    async unwrapToken(rawValue, agentId, tenantId, keyLabel) {
        const blob = (0, oauth_blob_1.parseOAuthTokenBlob)(rawValue);
        if (!blob)
            return null;
        if (Date.now() < blob.e - 60_000)
            return blob.t;
        if (!blob.r)
            return null;
        return this.refreshAndPersistToken(blob, agentId, tenantId, keyLabel);
    }
    async refreshAndPersistToken(blob, agentId, tenantId, keyLabel) {
        const providerId = this.oauthConfig.providerId;
        try {
            const resolved = await (0, oauth_refresh_coordinator_1.coordinateOAuthRefresh)({
                key: (0, oauth_refresh_coordinator_1.oauthRefreshKey)(providerId, tenantId, keyLabel),
                logger: this.logger,
                callerBlob: blob,
                parse: oauth_blob_1.parseOAuthTokenBlob,
                refresh: (current) => this.refreshAccessToken(current.r, current.u),
                withLock: (0, oauth_refresh_coordinator_1.subscriptionCredentialLock)((t, p, l, fn) => this.providerService.withSubscriptionCredentialLock(t, p, l, fn), tenantId, providerId, keyLabel, oauth_blob_1.serializeOAuthTokenBlob),
            });
            return resolved.t;
        }
        catch (err) {
            this.logger.error(`Failed to refresh ${providerId} token for agent=${agentId}: ${err}`);
            return null;
        }
    }
    async revokeToken(token) {
        const revokeUrl = this.oauthConfig.revokeUrl;
        if (!revokeUrl)
            return;
        try {
            const body = new URLSearchParams({ token, client_id: this.clientId });
            if (this.clientSecret)
                body.set('client_secret', this.clientSecret);
            const response = await fetch(revokeUrl, {
                method: 'POST',
                headers: this.tokenHeaders(),
                body,
            });
            if (!response.ok) {
                const text = await response.text();
                this.logger.warn(`${this.oauthConfig.providerId} token revocation failed: ${(0, secret_scrub_1.scrubSecrets)(text)}`);
            }
            else {
                this.logger.log(`${this.oauthConfig.providerId} OAuth token revoked`);
            }
        }
        catch (err) {
            this.logger.warn(`${this.oauthConfig.providerId} token revocation error: ${err}`);
        }
    }
    getPendingCount() {
        return this.pending.size();
    }
    clearPendingState(state) {
        this.pending.delete(state);
    }
    get callbackPath() {
        return this.oauthConfig.callbackPath ?? '/auth/callback';
    }
    tokenHeaders() {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(this.oauthConfig.extraTokenHeaders ?? {}),
        };
    }
    async enrichBlob(blob) {
        return blob;
    }
    ensureCallbackServer() {
        if (this.callbackServer)
            return Promise.resolve();
        if (this.serverReady)
            return this.serverReady;
        this.serverReady = new Promise((resolve, reject) => {
            const server = (0, http_1.createServer)((req, res) => this.handleCallbackRequest(req, res));
            server.on('error', (err) => {
                this.callbackServer = null;
                this.serverReady = null;
                if (err.code === 'EADDRINUSE') {
                    this.logger.warn(`Port ${this.oauthConfig.callbackPort} in use — callback server not started`);
                    reject(new Error(`Port ${this.oauthConfig.callbackPort} is already in use. Run 'lsof -i :${this.oauthConfig.callbackPort}' to find the process.`));
                }
                else {
                    this.logger.error(`Callback server error: ${err.message}`);
                    reject(new Error(`Callback server failed: ${err.message}`));
                }
            });
            server.listen(this.oauthConfig.callbackPort, '127.0.0.1', () => {
                this.logger.log(`OAuth callback server listening on port ${this.oauthConfig.callbackPort}`);
                this.callbackServer = server;
                resolve();
            });
            server.unref();
        });
        return this.serverReady;
    }
    handleCallbackRequest(req, res) {
        const url = new URL(req.url ?? '/', `http://localhost:${this.oauthConfig.callbackPort}`);
        if (url.pathname !== this.callbackPath) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        const code = url.searchParams.get('code') ?? '';
        const state = url.searchParams.get('state') ?? '';
        const error = url.searchParams.get('error');
        const appUrl = this.pending.peek(state)?.backendUrl || '';
        if (error) {
            const desc = url.searchParams.get('error_description') ?? error;
            this.logger.error(`OAuth callback error from provider: ${desc}`);
            this.pending.delete(state);
            this.shutdownCallbackServerIfIdle();
            this.sendDoneResponse(res, false, appUrl);
            return;
        }
        this.exchangeCode(state, code)
            .then(() => this.sendDoneResponse(res, true, appUrl))
            .catch((err) => {
            this.logger.error(`OAuth callback failed: ${err}`);
            this.shutdownCallbackServerIfIdle();
            this.sendDoneResponse(res, false, appUrl);
        });
    }
    isAllowedRedirectOrigin(url) {
        try {
            const hostname = new URL(url).hostname.replace(/^\[|\]$/g, '');
            return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
        }
        catch {
            return false;
        }
    }
    sendDoneResponse(res, success, appUrl) {
        if (appUrl && this.isAllowedRedirectOrigin(appUrl)) {
            const ok = success ? '1' : '0';
            res.writeHead(302, {
                Location: `${appUrl}/api/v1/oauth/${this.oauthConfig.providerId}/done?ok=${ok}`,
            });
            res.end();
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end((0, callback_page_1.oauthDoneHtml)(success, undefined, this.oauthConfig.providerLabel));
        }
    }
    shutdownCallbackServerIfIdle() {
        if (this.pending.isEmpty() && this.callbackServer) {
            this.callbackServer.close();
            this.callbackServer = null;
            this.serverReady = null;
            this.logger.log('OAuth callback server shut down (no pending flows)');
        }
    }
}
exports.RedirectPkceOauthBaseService = RedirectPkceOauthBaseService;
//# sourceMappingURL=redirect-pkce-oauth.base.js.map