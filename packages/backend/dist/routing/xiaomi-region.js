"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_XIAOMI_TOKEN_PLAN_REGION = exports.XIAOMI_TOKEN_PLAN_BASE_URLS = void 0;
exports.isXiaomiTokenPlanRegion = isXiaomiTokenPlanRegion;
exports.isXiaomiProviderId = isXiaomiProviderId;
exports.getXiaomiTokenPlanBaseUrl = getXiaomiTokenPlanBaseUrl;
exports.normalizeXiaomiTokenPlanBaseUrl = normalizeXiaomiTokenPlanBaseUrl;
const provider_base_url_1 = require("./provider-base-url");
exports.XIAOMI_TOKEN_PLAN_BASE_URLS = {
    cn: 'https://token-plan-cn.xiaomimimo.com',
    sgp: 'https://token-plan-sgp.xiaomimimo.com',
    ams: 'https://token-plan-ams.xiaomimimo.com',
};
exports.DEFAULT_XIAOMI_TOKEN_PLAN_REGION = 'cn';
function isXiaomiTokenPlanRegion(value) {
    return value === 'cn' || value === 'sgp' || value === 'ams';
}
function isXiaomiProviderId(value) {
    const lower = value?.toLowerCase();
    return lower === 'xiaomi' || lower === 'mimo' || lower === 'xiaomi-mimo';
}
function getXiaomiTokenPlanBaseUrl(region = exports.DEFAULT_XIAOMI_TOKEN_PLAN_REGION) {
    return exports.XIAOMI_TOKEN_PLAN_BASE_URLS[region];
}
function normalizeXiaomiTokenPlanBaseUrl(baseUrl) {
    const normalized = (0, provider_base_url_1.normalizeProviderBaseUrl)(baseUrl);
    const allowedBaseUrls = Object.values(exports.XIAOMI_TOKEN_PLAN_BASE_URLS);
    return allowedBaseUrls.includes(normalized) ? normalized : null;
}
//# sourceMappingURL=xiaomi-region.js.map