"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRefreshableOAuthCredential = isRefreshableOAuthCredential;
exports.refreshRejectedOAuthCredential = refreshRejectedOAuthCredential;
exports.resolveApiKey = resolveApiKey;
const core_1 = require("../oauth/core");
function expireRefreshableOAuthBlob(rawValue) {
    try {
        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
            return null;
        const blob = parsed;
        if (typeof blob.t !== 'string' || typeof blob.r !== 'string' || typeof blob.e !== 'number') {
            return null;
        }
        if (!blob.r)
            return null;
        return JSON.stringify({ ...blob, e: core_1.REJECTED_TOKEN_EXPIRY });
    }
    catch {
        return null;
    }
}
function isRefreshableOAuthCredential(rawValue) {
    return expireRefreshableOAuthBlob(rawValue) !== null;
}
async function refreshRejectedOAuthCredential(provider, rawValue, agentId, tenantId, keyLabel, services) {
    const expiredRawValue = expireRefreshableOAuthBlob(rawValue);
    if (!expiredRawValue)
        return null;
    const lower = provider.toLowerCase();
    if (lower === 'openai') {
        const unwrapped = await services.openaiOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped } : null;
    }
    if (lower === 'minimax') {
        const unwrapped = await services.minimaxOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped.t, resourceUrl: unwrapped.u } : null;
    }
    if (lower === 'anthropic') {
        const unwrapped = await services.anthropicOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped } : null;
    }
    if (lower === 'gemini') {
        const unwrapped = await services.geminiOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped, resourceUrl: (0, core_1.parseOAuthTokenBlob)(rawValue)?.u } : null;
    }
    if (lower === 'kiro') {
        const unwrapped = await services.kiroOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped } : null;
    }
    if (lower === 'xai') {
        const unwrapped = await services.xaiOauth.unwrapToken(expiredRawValue, agentId, tenantId, keyLabel);
        return unwrapped ? { apiKey: unwrapped } : null;
    }
    return null;
}
async function resolveApiKey(provider, apiKey, authType, agentId, tenantId, openaiOauth, minimaxOauth, anthropicOauth, geminiOauth, kiroOauth, xaiOauth, keyLabel) {
    if (authType === 'subscription') {
        const lower = provider.toLowerCase();
        if (lower === 'openai') {
            const unwrapped = await openaiOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped)
                return { apiKey: unwrapped };
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
        if (lower === 'minimax') {
            const unwrapped = await minimaxOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped)
                return { apiKey: unwrapped.t, resourceUrl: unwrapped.u };
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
        if (lower === 'anthropic') {
            const unwrapped = await anthropicOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped)
                return { apiKey: unwrapped };
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
        if (lower === 'gemini') {
            const unwrapped = await geminiOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped) {
                const projectId = (0, core_1.parseOAuthTokenBlob)(apiKey)?.u;
                return { apiKey: unwrapped, resourceUrl: projectId };
            }
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
        if (lower === 'kiro') {
            const unwrapped = await kiroOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped)
                return { apiKey: unwrapped };
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
        if (lower === 'xai') {
            const unwrapped = await xaiOauth.unwrapToken(apiKey, agentId, tenantId, keyLabel);
            if (unwrapped)
                return { apiKey: unwrapped };
            if ((0, core_1.parseOAuthTokenBlob)(apiKey))
                return { apiKey: null };
        }
    }
    return { apiKey };
}
//# sourceMappingURL=oauth-credentials.js.map