"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDashboardCacheStore = buildDashboardCacheStore;
const cacheable_1 = require("cacheable");
const cache_constants_1 = require("../constants/cache.constants");
function buildDashboardCacheStore() {
    return (0, cacheable_1.createKeyv)({
        ttl: cache_constants_1.DASHBOARD_CACHE_TTL_MS,
        lruSize: cache_constants_1.DASHBOARD_CACHE_MAX_ENTRIES,
        checkInterval: cache_constants_1.DASHBOARD_CACHE_SWEEP_MS,
    });
}
//# sourceMappingURL=dashboard-cache.factory.js.map