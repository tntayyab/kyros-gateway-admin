"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionEndpointRegionConfig = getSubscriptionEndpointRegionConfig;
const minimax_oauth_helpers_1 = require("./oauth/minimax/minimax-oauth-helpers");
const xiaomi_region_1 = require("./xiaomi-region");
const zai_region_1 = require("./zai-region");
const SUBSCRIPTION_ENDPOINT_REGION_CONFIGS = [
    {
        matchesProvider: (provider) => provider === 'minimax',
        isRegion: (value) => (0, minimax_oauth_helpers_1.isMinimaxRegion)(value ?? undefined),
        validationMessage: 'MiniMax subscription region must be one of: global, cn',
    },
    {
        matchesProvider: xiaomi_region_1.isXiaomiProviderId,
        isRegion: xiaomi_region_1.isXiaomiTokenPlanRegion,
        validationMessage: 'Xiaomi MiMo Token Plan region must be one of: cn, sgp, ams',
    },
    {
        matchesProvider: zai_region_1.isZaiProviderId,
        isRegion: zai_region_1.isZaiCodingPlanRegion,
        validationMessage: 'Z.ai subscription region must be one of: global, cn',
    },
];
function getSubscriptionEndpointRegionConfig(provider, authType) {
    if (authType !== 'subscription')
        return null;
    const lowerProvider = provider?.toLowerCase();
    if (!lowerProvider)
        return null;
    return (SUBSCRIPTION_ENDPOINT_REGION_CONFIGS.find((config) => config.matchesProvider(lowerProvider)) ??
        null);
}
//# sourceMappingURL=subscription-region.js.map