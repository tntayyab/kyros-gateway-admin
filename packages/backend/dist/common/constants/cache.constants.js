"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_MODELS_CACHE_TTL_MS = exports.MODEL_PRICES_CACHE_TTL_MS = exports.AGENT_LIST_CACHE_TTL_MS = exports.DASHBOARD_CACHE_SWEEP_MS = exports.DASHBOARD_CACHE_MAX_ENTRIES = exports.DASHBOARD_CACHE_TTL_MS = void 0;
exports.agentListCacheKey = agentListCacheKey;
exports.DASHBOARD_CACHE_TTL_MS = 30_000;
exports.DASHBOARD_CACHE_MAX_ENTRIES = 5_000;
exports.DASHBOARD_CACHE_SWEEP_MS = 60_000;
exports.AGENT_LIST_CACHE_TTL_MS = 60_000;
exports.MODEL_PRICES_CACHE_TTL_MS = 300_000;
exports.FREE_MODELS_CACHE_TTL_MS = 3_600_000;
function agentListCacheKey(tenantId, includePlayground, generation = 0) {
    return `${tenantId}:/api/v1/agents:playground=${includePlayground}:g${generation}`;
}
//# sourceMappingURL=cache.constants.js.map