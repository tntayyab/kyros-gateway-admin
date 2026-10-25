"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSubscriptionEndpointKey = resolveSubscriptionEndpointKey;
exports.buildProviderExtraHeaders = buildProviderExtraHeaders;
const crypto_1 = require("crypto");
const providers_1 = require("../../common/constants/providers");
const SUBSCRIPTION_ENDPOINT_OVERRIDES = {
    openai: 'openai-subscription',
    byteplus: 'byteplus-anthropic',
    minimax: 'minimax-subscription',
    xiaomi: 'xiaomi-subscription',
    moonshot: 'moonshot-subscription',
    qwen: 'qwen-subscription',
    zai: 'zai-subscription',
    google: 'gemini-subscription',
};
function resolveSubscriptionEndpointKey(endpointKey) {
    return SUBSCRIPTION_ENDPOINT_OVERRIDES[endpointKey];
}
const opencodeSessionHeader = ({ sessionKey, agentKey }) => {
    const id = sessionKey ?? agentKey;
    return id ? { 'x-opencode-session': id } : undefined;
};
const PROVIDER_EXTRA_HEADER_BUILDERS = {
    xai: ({ sessionKey }) => (sessionKey ? { 'x-grok-conv-id': sessionKey } : undefined),
    openrouter: ({ sessionKey }) => !sessionKey || sessionKey === 'default' ? undefined : { 'x-session-id': sessionKey },
    'opencode-go': opencodeSessionHeader,
    'opencode-zen': opencodeSessionHeader,
};
function buildProviderExtraHeaders(provider, providerCacheKey, agentScopeKey) {
    const lower = provider.toLowerCase();
    const canonical = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(lower)?.id ?? lower;
    const builder = PROVIDER_EXTRA_HEADER_BUILDERS[canonical];
    if (!builder)
        return undefined;
    return builder({
        sessionKey: providerCacheKey ? buildProviderPromptCacheKey(providerCacheKey) : undefined,
        agentKey: agentScopeKey ? buildProviderPromptCacheKey(agentScopeKey) : undefined,
    });
}
function buildProviderPromptCacheKey(providerCacheKey) {
    const digest = (0, crypto_1.createHash)('sha256').update(providerCacheKey).digest('hex').slice(0, 32);
    return `manifest-${digest}`;
}
//# sourceMappingURL=provider-hooks.js.map