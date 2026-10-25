"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREDENTIAL_FAILURE_HTTP_STATUS = void 0;
exports.credentialFailureCode = credentialFailureCode;
exports.presentCredentialFailure = presentCredentialFailure;
exports.startCredentialFailureAttempt = startCredentialFailureAttempt;
exports.buildCredentialFailureForward = buildCredentialFailureForward;
exports.buildCredentialFailureFallback = buildCredentialFailureFallback;
exports.resolveRouteCredentials = resolveRouteCredentials;
const provider_key_service_1 = require("../routing-core/provider-key.service");
const error_codes_1 = require("../../common/errors/error-codes");
const oauth_credentials_1 = require("./oauth-credentials");
const CREDENTIAL_FAILURE_CODE = {
    no_provider_key: 'M100',
    subscription_credentials_unusable: 'M102',
};
exports.CREDENTIAL_FAILURE_HTTP_STATUS = 401;
function credentialFailureCode(reason) {
    return CREDENTIAL_FAILURE_CODE[reason];
}
function presentCredentialFailure(reason, provider, dashboardUrl) {
    const code = credentialFailureCode(reason);
    const message = (0, error_codes_1.formatManifestError)(code, { provider, dashboardUrl });
    return {
        code,
        reason,
        message,
        status: exports.CREDENTIAL_FAILURE_HTTP_STATUS,
        errorBody: JSON.stringify({ error: { message } }),
    };
}
function startCredentialFailureAttempt(startProviderAttempt, start) {
    const attempt = startProviderAttempt?.(start);
    if (attempt)
        attempt.completedAtMs = Date.now();
    return attempt;
}
function buildCredentialFailureForward(opts) {
    const attempt = startCredentialFailureAttempt(opts.startProviderAttempt, {
        provider: opts.provider,
        model: opts.model,
        authType: opts.authType,
        tenantProviderId: opts.tenantProviderId,
        keyLabel: opts.keyLabel,
    });
    return {
        response: new Response(opts.presentation.errorBody, {
            status: opts.presentation.status,
            headers: { 'content-type': 'application/json' },
        }),
        providerCallStarted: true,
        attempt,
        isGoogle: false,
        isAnthropic: false,
        isChatGpt: false,
    };
}
function buildCredentialFailureFallback(opts) {
    const attempt = startCredentialFailureAttempt(opts.startProviderAttempt, {
        provider: opts.provider,
        model: opts.model,
        authType: opts.authType,
        tenantProviderId: opts.tenantProviderId,
        keyLabel: opts.keyLabel,
    });
    return {
        model: opts.model,
        provider: opts.provider,
        fallbackIndex: opts.fallbackIndex,
        status: opts.presentation.status,
        errorBody: opts.presentation.errorBody,
        authType: opts.authType,
        tenantProviderId: opts.tenantProviderId,
        keyLabel: opts.keyLabel,
        attempt,
        providerCallStarted: true,
    };
}
async function resolveRouteCredentials(deps, args) {
    const { providerKeyService, oauth } = deps;
    const { agentId, tenantId, provider, authType } = args;
    let providerKeyLabel = args.providerKeyLabel;
    const key = await providerKeyService.selectProviderKey(tenantId, provider, authType, providerKeyLabel, agentId);
    if (!key || key.apiKey === null) {
        return { ok: false, reason: 'no_provider_key', tenantProviderId: null };
    }
    const apiKey = key.apiKey;
    const tenantProviderId = key.id === provider_key_service_1.SYNTHETIC_OLLAMA_PROVIDER_ID ? null : key.id;
    if (!providerKeyLabel && authType === 'subscription') {
        providerKeyLabel = key.label;
    }
    const unwrapped = await (0, oauth_credentials_1.resolveApiKey)(provider, apiKey, authType, agentId, tenantId, oauth.openaiOauth, oauth.minimaxOauth, oauth.anthropicOauth, oauth.geminiOauth, oauth.kiroOauth, oauth.xaiOauth, providerKeyLabel);
    if (unwrapped.apiKey === null) {
        return {
            ok: false,
            reason: 'subscription_credentials_unusable',
            tenantProviderId,
        };
    }
    let rawApiKey = apiKey;
    if (authType === 'subscription' && (0, oauth_credentials_1.isRefreshableOAuthCredential)(apiKey)) {
        rawApiKey =
            (await providerKeyService.getProviderApiKey(tenantId, provider, authType, providerKeyLabel, agentId)) ?? apiKey;
    }
    return {
        ok: true,
        apiKey: unwrapped.apiKey,
        rawApiKey,
        resourceUrl: unwrapped.resourceUrl,
        providerRegion: key.region,
        tenantProviderId,
        keyLabel: key.label,
    };
}
//# sourceMappingURL=route-credentials.js.map