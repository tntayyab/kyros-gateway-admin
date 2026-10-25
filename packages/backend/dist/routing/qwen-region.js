"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QWEN_REGION_VALIDATION_MESSAGE = void 0;
exports.isQwenResolvedRegion = isQwenResolvedRegion;
exports.isQwenRegion = isQwenRegion;
exports.getQwenCompatibleBaseUrl = getQwenCompatibleBaseUrl;
exports.normalizeQwenCompatibleBaseUrl = normalizeQwenCompatibleBaseUrl;
exports.isQwenResolvedEndpoint = isQwenResolvedEndpoint;
exports.detectQwenRegion = detectQwenRegion;
const provider_base_url_1 = require("./provider-base-url");
const QWEN_REGION_BASE_URLS = {
    singapore: 'https://dashscope-intl.aliyuncs.com/compatible-mode',
    us: 'https://dashscope-us.aliyuncs.com/compatible-mode',
    beijing: 'https://dashscope.aliyuncs.com/compatible-mode',
};
const QWEN_ALLOWED_BASE_URLS = new Set(Object.values(QWEN_REGION_BASE_URLS));
const QWEN_WORKSPACE_REGION_CODES = new Set([
    'cn-beijing',
    'ap-southeast-1',
    'ap-northeast-1',
    'cn-hongkong',
    'eu-central-1',
]);
const QWEN_REGION_DETECTION_ORDER = ['singapore', 'us', 'beijing'];
const QWEN_DETECTION_TIMEOUT_MS = 3000;
const QWEN_WORKSPACE_HOST_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;
exports.QWEN_REGION_VALIDATION_MESSAGE = 'Qwen region must be one of: auto, singapore, us, beijing, or a valid Alibaba Cloud Model Studio compatible-mode base URL';
function buildModelsUrl(region) {
    return `${QWEN_REGION_BASE_URLS[region]}/v1/models`;
}
function isQwenResolvedRegion(value) {
    return value === 'singapore' || value === 'us' || value === 'beijing';
}
function isQwenRegion(value) {
    return value === 'auto' || isQwenResolvedRegion(value) || !!normalizeQwenCompatibleBaseUrl(value);
}
function getQwenCompatibleBaseUrl(region) {
    const endpoint = normalizeQwenCompatibleBaseUrl(region);
    if (endpoint)
        return endpoint;
    if (isQwenResolvedRegion(region))
        return QWEN_REGION_BASE_URLS[region];
    return QWEN_REGION_BASE_URLS.beijing;
}
function normalizeQwenCompatibleBaseUrl(baseUrl) {
    if (!baseUrl)
        return null;
    try {
        const url = new URL(baseUrl);
        if (url.protocol !== 'https:' ||
            url.username ||
            url.password ||
            url.port ||
            url.search ||
            url.hash) {
            return null;
        }
        const normalized = (0, provider_base_url_1.normalizeProviderBaseUrl)(`${url.origin}${url.pathname}`);
        if (QWEN_ALLOWED_BASE_URLS.has(normalized))
            return normalized;
        const normalizedUrl = new URL(normalized);
        if (normalizedUrl.pathname !== '/compatible-mode')
            return null;
        const parts = normalizedUrl.hostname.split('.');
        if (parts.length !== 5)
            return null;
        const [workspaceId, regionCode, service, domain, tld] = parts;
        if (!workspaceId ||
            !regionCode ||
            service !== 'maas' ||
            domain !== 'aliyuncs' ||
            tld !== 'com') {
            return null;
        }
        if (!QWEN_WORKSPACE_HOST_RE.test(workspaceId))
            return null;
        if (!QWEN_WORKSPACE_REGION_CODES.has(regionCode))
            return null;
        return normalized;
    }
    catch {
        return null;
    }
}
function isQwenResolvedEndpoint(value) {
    return isQwenResolvedRegion(value) || !!normalizeQwenCompatibleBaseUrl(value);
}
async function detectQwenRegion(apiKey, fetchImpl = fetch) {
    const headers = { Authorization: `Bearer ${apiKey}` };
    for (const region of QWEN_REGION_DETECTION_ORDER) {
        try {
            const response = await fetchImpl(buildModelsUrl(region), {
                headers,
                signal: AbortSignal.timeout(QWEN_DETECTION_TIMEOUT_MS),
            });
            if (response.ok)
                return region;
        }
        catch {
        }
    }
    return null;
}
//# sourceMappingURL=qwen-region.js.map