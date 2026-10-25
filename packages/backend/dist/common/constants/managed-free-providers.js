"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MANAGED_FREE_PROVIDER_BY_ID = exports.MANAGED_FREE_PROVIDER_CONFIGS = void 0;
exports.getManagedFreeProviderConfig = getManagedFreeProviderConfig;
exports.getManagedFreeLiteLlmBaseUrl = getManagedFreeLiteLlmBaseUrl;
exports.getManagedFreeLiteLlmMasterKey = getManagedFreeLiteLlmMasterKey;
exports.getManagedFreeLiteLlmMaxBudgetUsd = getManagedFreeLiteLlmMaxBudgetUsd;
exports.getManagedFreeLiteLlmAutoAllowlist = getManagedFreeLiteLlmAutoAllowlist;
exports.isManagedFreeLiteLlmAutoEligible = isManagedFreeLiteLlmAutoEligible;
exports.getManagedFreeLiteLlmModelsUrl = getManagedFreeLiteLlmModelsUrl;
exports.getManagedFreeLiteLlmKeyGenerateUrl = getManagedFreeLiteLlmKeyGenerateUrl;
exports.MANAGED_FREE_PROVIDER_CONFIGS = [
    {
        id: 'gemini-free',
        displayName: 'Gemini Free',
        litellmModels: ['gemini/*'],
        catalogModelIdPrefix: 'gemini-',
        preferredModelIdPrefix: 'gemini/',
        nonChatModelPattern: /(?:\*|(?:^|\/)aqs-|nano-banana|deep-research|computer-use|lyria|veo-|native-audio|audio-preview|image-generation|(?:^|\/)imagen|-image(?:$|-|\/)|live-preview|(?:^|\/|-)live-|embedding|robotics|tts|gemini-1\.5|gemini-2\.0-flash-001|gemini-2\.0-flash-lite|flash-lite-preview-\d|\/gemini-exp-|-exp-\d|learnlm|gemma-|omni-flash|customtools)/i,
        maxBudgetEnvVar: 'CREDITS_GEMINI_FREE_MAX_BUDGET',
    },
];
exports.MANAGED_FREE_PROVIDER_BY_ID = new Map(exports.MANAGED_FREE_PROVIDER_CONFIGS.map((config) => [config.id, config]));
function getManagedFreeProviderConfig(providerId) {
    return exports.MANAGED_FREE_PROVIDER_BY_ID.get(providerId.toLowerCase());
}
const DEFAULT_CREDITS_BASE_URL = 'https://credits.manifest.build';
const DEFAULT_MAX_BUDGET_USD = 10;
function getManagedFreeLiteLlmBaseUrl() {
    const raw = process.env['CREDITS_BASE_URL']?.trim() || DEFAULT_CREDITS_BASE_URL;
    return raw.replace(/\/+$/, '');
}
function getManagedFreeLiteLlmMasterKey() {
    const key = process.env['CREDITS_MASTER_KEY']?.trim();
    return key && key.length > 0 ? key : null;
}
function getManagedFreeLiteLlmMaxBudgetUsd(config) {
    const raw = process.env[config.maxBudgetEnvVar]?.trim();
    if (!raw)
        return DEFAULT_MAX_BUDGET_USD;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 ? value : DEFAULT_MAX_BUDGET_USD;
}
function getManagedFreeLiteLlmAutoAllowlist() {
    const raw = process.env['CREDITS_AUTO_PROVISION_ALLOWLIST']?.trim() ?? '';
    if (!raw)
        return [];
    return raw
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}
function isManagedFreeLiteLlmAutoEligible(email) {
    if (!getManagedFreeLiteLlmMasterKey())
        return false;
    const allowlist = getManagedFreeLiteLlmAutoAllowlist();
    if (allowlist.length === 0)
        return true;
    if (!email)
        return false;
    return allowlist.includes(email.trim().toLowerCase());
}
function getManagedFreeLiteLlmModelsUrl() {
    return `${getManagedFreeLiteLlmBaseUrl()}/v1/models`;
}
function getManagedFreeLiteLlmKeyGenerateUrl() {
    return `${getManagedFreeLiteLlmBaseUrl()}/key/generate`;
}
//# sourceMappingURL=managed-free-providers.js.map