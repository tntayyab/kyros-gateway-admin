"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingCacheService = void 0;
const common_1 = require("@nestjs/common");
const TTL_MS = 120_000;
const MAX_ENTRIES = 5_000;
function getOrExpire(map, key) {
    const cached = map.get(key);
    if (!cached)
        return undefined;
    if (cached.expiresAt > Date.now())
        return cached.data;
    map.delete(key);
    return undefined;
}
function setWithEviction(map, key, data) {
    if (map.size >= MAX_ENTRIES && !map.has(key)) {
        const firstKey = map.keys().next().value;
        if (firstKey !== undefined)
            map.delete(firstKey);
    }
    map.set(key, { data, expiresAt: Date.now() + TTL_MS });
}
let RoutingCacheService = class RoutingCacheService {
    tiers = new Map();
    providers = new Map();
    customProviders = new Map();
    providerKeys = new Map();
    specificity = new Map();
    headerTiers = new Map();
    modelParams = new Map();
    invalidationListeners = [];
    tenantInvalidationListeners = [];
    getTiers(agentId) {
        return getOrExpire(this.tiers, agentId) ?? null;
    }
    setTiers(agentId, data) {
        setWithEviction(this.tiers, agentId, data);
    }
    getProviders(tenantId) {
        return getOrExpire(this.providers, tenantId) ?? null;
    }
    setProviders(tenantId, data) {
        setWithEviction(this.providers, tenantId, data);
    }
    getCustomProviders(tenantId) {
        return getOrExpire(this.customProviders, tenantId) ?? null;
    }
    setCustomProviders(tenantId, data) {
        setWithEviction(this.customProviders, tenantId, data);
    }
    providerKeysKey(tenantId, provider, authType, agentId) {
        return [tenantId, agentId ?? '', provider, authType ?? 'default'].join('\u0000');
    }
    getProviderKeys(tenantId, provider, authType, agentId) {
        return getOrExpire(this.providerKeys, this.providerKeysKey(tenantId, provider, authType, agentId));
    }
    setProviderKeys(tenantId, provider, keys, authType, agentId) {
        setWithEviction(this.providerKeys, this.providerKeysKey(tenantId, provider, authType, agentId), keys);
    }
    getSpecificity(agentId) {
        return getOrExpire(this.specificity, agentId) ?? null;
    }
    setSpecificity(agentId, data) {
        setWithEviction(this.specificity, agentId, data);
    }
    getHeaderTiers(agentId) {
        return getOrExpire(this.headerTiers, agentId) ?? null;
    }
    setHeaderTiers(agentId, data) {
        setWithEviction(this.headerTiers, agentId, data);
    }
    getModelParams(agentId) {
        return getOrExpire(this.modelParams, agentId) ?? null;
    }
    setModelParams(agentId, data) {
        setWithEviction(this.modelParams, agentId, data);
    }
    invalidateModelParams(agentId) {
        this.modelParams.delete(agentId);
    }
    addInvalidationListener(listener) {
        this.invalidationListeners.push(listener);
    }
    addTenantInvalidationListener(listener) {
        this.tenantInvalidationListeners.push(listener);
    }
    invalidateAgent(agentId) {
        this.tiers.delete(agentId);
        this.specificity.delete(agentId);
        this.headerTiers.delete(agentId);
        this.modelParams.delete(agentId);
        const segment = `\u0000${agentId}\u0000`;
        const toDelete = [...this.providerKeys.keys()].filter((k) => k.includes(segment));
        for (const k of toDelete)
            this.providerKeys.delete(k);
        for (const listener of this.invalidationListeners) {
            try {
                listener(agentId);
            }
            catch {
            }
        }
    }
    invalidateTenant(tenantId) {
        this.providers.delete(tenantId);
        this.customProviders.delete(tenantId);
        const prefix = `${tenantId}\u0000`;
        const toDelete = [...this.providerKeys.keys()].filter((k) => k.startsWith(prefix));
        for (const k of toDelete)
            this.providerKeys.delete(k);
        for (const listener of this.tenantInvalidationListeners) {
            try {
                listener(tenantId);
            }
            catch {
            }
        }
    }
};
exports.RoutingCacheService = RoutingCacheService;
exports.RoutingCacheService = RoutingCacheService = __decorate([
    (0, common_1.Injectable)()
], RoutingCacheService);
//# sourceMappingURL=routing-cache.service.js.map