"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BEDROCK_ENDPOINT_REGIONS = exports.DEFAULT_BEDROCK_REGION = void 0;
exports.isBedrockProvider = isBedrockProvider;
exports.isBedrockRegion = isBedrockRegion;
exports.getBedrockMantleBaseUrl = getBedrockMantleBaseUrl;
exports.getBedrockInferenceProfileBaseModelId = getBedrockInferenceProfileBaseModelId;
exports.getBedrockRuntimeBaseUrl = getBedrockRuntimeBaseUrl;
exports.getBedrockControlPlaneBaseUrl = getBedrockControlPlaneBaseUrl;
exports.normalizeBedrockMantleBaseUrl = normalizeBedrockMantleBaseUrl;
exports.detectBedrockRegionFromApiKey = detectBedrockRegionFromApiKey;
const openai_models_1 = require("../common/constants/openai-models");
const providers_1 = require("../common/constants/providers");
const provider_base_url_1 = require("./provider-base-url");
exports.DEFAULT_BEDROCK_REGION = 'us-east-1';
exports.BEDROCK_ENDPOINT_REGIONS = [
    'us-east-1',
    'us-east-2',
    'us-west-2',
    'eu-west-1',
    'eu-west-2',
    'eu-central-1',
    'eu-south-1',
    'eu-north-1',
    'ap-south-1',
    'ap-southeast-2',
    'ap-southeast-3',
    'ap-northeast-1',
    'sa-east-1',
];
const AWS_REGION_RE = /^[a-z]{2}(?:-gov)?-[a-z]+-\d+$/;
const BEDROCK_PROVIDER_ID = 'bedrock';
const BEDROCK_PROVIDER = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(BEDROCK_PROVIDER_ID);
if (!BEDROCK_PROVIDER) {
    throw new Error('AWS Bedrock provider is missing from the shared provider registry');
}
const LEGACY_BEDROCK_API_KEY_PREFIX = 'bedrock-api-key-';
const AWS_BEARER_TOKEN_PREFIX = 'ABSK';
function isBedrockProvider(provider) {
    return providers_1.PROVIDER_BY_ID_OR_ALIAS.get(provider.toLowerCase().trim())?.id === BEDROCK_PROVIDER_ID;
}
function isBedrockRegion(value) {
    return (typeof value === 'string' &&
        AWS_REGION_RE.test(value) &&
        exports.BEDROCK_ENDPOINT_REGIONS.includes(value));
}
function getBedrockMantleBaseUrl(region) {
    const resolved = isBedrockRegion(region) ? region : exports.DEFAULT_BEDROCK_REGION;
    return `https://bedrock-mantle.${resolved}.api.aws`;
}
const BEDROCK_CRIS_PROFILE_RE = /^(?:global|us|eu|apac)\.(.+)$/;
function getBedrockInferenceProfileBaseModelId(model) {
    return BEDROCK_CRIS_PROFILE_RE.exec((0, openai_models_1.stripVendorPrefix)(model))?.[1] ?? null;
}
function getBedrockRuntimeBaseUrl(region) {
    const resolved = isBedrockRegion(region) ? region : exports.DEFAULT_BEDROCK_REGION;
    return `https://bedrock-runtime.${resolved}.amazonaws.com`;
}
function getBedrockControlPlaneBaseUrl(region) {
    const resolved = isBedrockRegion(region) ? region : exports.DEFAULT_BEDROCK_REGION;
    return `https://bedrock.${resolved}.amazonaws.com`;
}
function normalizeBedrockMantleBaseUrl(baseUrl) {
    const normalized = (0, provider_base_url_1.normalizeProviderBaseUrl)(baseUrl);
    try {
        const url = new URL(normalized);
        const match = /^bedrock-mantle\.([a-z0-9-]+)\.api\.aws$/.exec(url.hostname);
        if (url.protocol !== 'https:' ||
            url.username ||
            url.password ||
            url.port ||
            url.pathname !== '/' ||
            url.search ||
            url.hash) {
            return null;
        }
        if (!match || !isBedrockRegion(match[1]))
            return null;
        return normalized.replace(/\/$/, '');
    }
    catch {
        return null;
    }
}
function detectBedrockRegionFromApiKey(apiKey) {
    const compact = apiKey?.replace(/\s/g, '') ?? '';
    if (compact.startsWith(AWS_BEARER_TOKEN_PREFIX))
        return null;
    if (!compact.startsWith(LEGACY_BEDROCK_API_KEY_PREFIX))
        return null;
    try {
        const encoded = compact.slice(LEGACY_BEDROCK_API_KEY_PREFIX.length);
        const decoded = Buffer.from(encoded, 'base64').toString('utf8');
        const query = decoded.includes('?') ? decoded.slice(decoded.indexOf('?') + 1) : decoded;
        const credential = new URLSearchParams(query).get('X-Amz-Credential');
        const region = credential?.split('/')[2];
        return isBedrockRegion(region) ? region : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=bedrock-region.js.map