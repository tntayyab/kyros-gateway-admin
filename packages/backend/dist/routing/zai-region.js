"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ZAI_CODING_PLAN_REGION = exports.ZAI_CODING_PLAN_BASE_URLS = void 0;
exports.isZaiCodingPlanRegion = isZaiCodingPlanRegion;
exports.isZaiProviderId = isZaiProviderId;
exports.getZaiCodingPlanBaseUrl = getZaiCodingPlanBaseUrl;
exports.normalizeZaiCodingPlanBaseUrl = normalizeZaiCodingPlanBaseUrl;
exports.ZAI_CODING_PLAN_BASE_URLS = {
    global: 'https://api.z.ai/api/coding/paas/v4',
    cn: 'https://open.bigmodel.cn/api/coding/paas/v4',
};
exports.DEFAULT_ZAI_CODING_PLAN_REGION = 'global';
function isZaiCodingPlanRegion(value) {
    return value === 'global' || value === 'cn';
}
function isZaiProviderId(value) {
    const lower = value?.toLowerCase();
    return lower === 'zai' || lower === 'z.ai';
}
function getZaiCodingPlanBaseUrl(region = exports.DEFAULT_ZAI_CODING_PLAN_REGION) {
    return exports.ZAI_CODING_PLAN_BASE_URLS[region];
}
function normalizeZaiCodingPlanBaseUrl(baseUrl) {
    const normalized = baseUrl.replace(/\/+$/, '');
    const allowedBaseUrls = Object.values(exports.ZAI_CODING_PLAN_BASE_URLS);
    return allowedBaseUrls.includes(normalized) ? normalized : null;
}
//# sourceMappingURL=zai-region.js.map