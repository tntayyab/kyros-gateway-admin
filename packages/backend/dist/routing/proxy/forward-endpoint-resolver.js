"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveForwardEndpoint = resolveForwardEndpoint;
const provider_endpoints_1 = require("./provider-endpoints");
const custom_provider_service_1 = require("../custom-provider/custom-provider.service");
const provider_base_url_1 = require("../provider-base-url");
const bedrock_region_1 = require("../bedrock-region");
const vertex_deployment_1 = require("../vertex-deployment");
const minimax_oauth_helpers_1 = require("../oauth/minimax/minimax-oauth-helpers");
const qwen_region_1 = require("../qwen-region");
const xiaomi_region_1 = require("../xiaomi-region");
const zai_region_1 = require("../zai-region");
const XIAOMI_MODEL_PREFIXES = ['xiaomi/', 'mimo/', 'xiaomi-mimo/'];
function resolveForwardEndpoint(params) {
    const { provider, authType, model, providerRegion, resourceUrl, customProvider, logger, apiMode, } = params;
    const lower = provider.toLowerCase();
    let forwardModel = model;
    let customEndpoint;
    if (lower === 'copilot' && forwardModel.startsWith('copilot/')) {
        forwardModel = forwardModel.substring('copilot/'.length);
    }
    if (lower === 'minimax' &&
        (authType === 'subscription' || (authType === 'api_key' && providerRegion === 'cn')) &&
        forwardModel.toLowerCase().startsWith('minimax/')) {
        forwardModel = forwardModel.substring('minimax/'.length);
    }
    if (lower === 'zai' && authType === 'subscription') {
        const lowerModel = forwardModel.toLowerCase();
        if (lowerModel.startsWith('z-ai/')) {
            forwardModel = forwardModel.substring('z-ai/'.length);
        }
        else if (lowerModel.startsWith('zai/')) {
            forwardModel = forwardModel.substring('zai/'.length);
        }
    }
    if ((0, xiaomi_region_1.isXiaomiProviderId)(lower) && authType === 'subscription') {
        const lowerModel = forwardModel.toLowerCase();
        const prefix = XIAOMI_MODEL_PREFIXES.find((candidate) => lowerModel.startsWith(candidate));
        if (prefix) {
            forwardModel = forwardModel.substring(prefix.length);
        }
    }
    const vertexDeployment = (0, vertex_deployment_1.parseVertexDeployment)(providerRegion);
    if (custom_provider_service_1.CustomProviderService.isCustom(provider)) {
        if (customProvider) {
            customEndpoint = (0, provider_endpoints_1.buildCustomEndpoint)(customProvider.base_url, customProvider.api_kind ?? 'openai');
            forwardModel = custom_provider_service_1.CustomProviderService.rawModelName(model);
        }
    }
    else if ((0, provider_endpoints_1.resolveEndpointKey)(provider) === 'bedrock' && (0, bedrock_region_1.isBedrockRegion)(providerRegion)) {
        const bedrockEndpointKey = (0, provider_endpoints_1.resolveBedrockEndpointKey)(model, apiMode);
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)(bedrockEndpointKey.startsWith('bedrock-runtime')
            ? (0, bedrock_region_1.getBedrockRuntimeBaseUrl)(providerRegion)
            : (0, bedrock_region_1.getBedrockMantleBaseUrl)(providerRegion), bedrockEndpointKey);
    }
    else if ((0, provider_endpoints_1.resolveEndpointKey)(provider) === 'vertex' && vertexDeployment) {
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)((0, vertex_deployment_1.getVertexBaseUrl)(vertexDeployment), 'vertex');
    }
    else if ((0, provider_endpoints_1.resolveEndpointKey)(provider) === 'qwen' && (0, qwen_region_1.isQwenResolvedEndpoint)(providerRegion)) {
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)((0, qwen_region_1.getQwenCompatibleBaseUrl)(providerRegion), 'qwen');
    }
    else if (authType === 'api_key' && lower === 'minimax' && providerRegion === 'cn') {
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)(minimax_oauth_helpers_1.MINIMAX_BASE_URLS.cn, 'minimax');
    }
    else if (authType === 'subscription' && lower === 'minimax') {
        if (resourceUrl) {
            const minimaxBaseUrl = (0, provider_base_url_1.normalizeMinimaxSubscriptionBaseUrl)(resourceUrl);
            if (minimaxBaseUrl) {
                customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)(minimaxBaseUrl, 'minimax-subscription');
            }
            else {
                logger?.warn('Ignoring invalid MiniMax subscription resource URL');
            }
        }
        else if (providerRegion === 'cn') {
            customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)(`${minimax_oauth_helpers_1.MINIMAX_BASE_URLS.cn}/anthropic/v1`, 'minimax-subscription');
        }
    }
    else if (authType === 'subscription' && lower === 'zai' && providerRegion === 'cn') {
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)((0, zai_region_1.getZaiCodingPlanBaseUrl)('cn'), 'zai-subscription');
    }
    else if (authType === 'subscription' &&
        (0, xiaomi_region_1.isXiaomiProviderId)(lower) &&
        (0, xiaomi_region_1.isXiaomiTokenPlanRegion)(providerRegion)) {
        customEndpoint = (0, provider_endpoints_1.buildEndpointOverride)((0, xiaomi_region_1.getXiaomiTokenPlanBaseUrl)(providerRegion), 'xiaomi-subscription');
    }
    return { customEndpoint, forwardModel };
}
//# sourceMappingURL=forward-endpoint-resolver.js.map