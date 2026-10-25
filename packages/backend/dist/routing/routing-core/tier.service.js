"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tier_assignment_entity_1 = require("../../entities/tier-assignment.entity");
const routing_cache_service_1 = require("./routing-cache.service");
const provider_service_1 = require("./provider.service");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const crypto_1 = require("crypto");
const manifest_shared_1 = require("manifest-shared");
const route_helpers_1 = require("./route-helpers");
const resolve_model_route_1 = require("./resolve-model-route");
const response_mode_guard_1 = require("./response-mode-guard");
let TierService = class TierService {
    tierRepo;
    routingCache;
    providerService;
    discoveryService;
    constructor(tierRepo, routingCache, providerService, discoveryService) {
        this.tierRepo = tierRepo;
        this.routingCache = routingCache;
        this.providerService = providerService;
        this.discoveryService = discoveryService;
    }
    async hasRoutableTier(agentId) {
        const rows = await this.tierRepo.find({ where: { agent_id: agentId } });
        return rows.some((r) => (0, route_helpers_1.effectiveRoute)(r) !== null);
    }
    async getTiers(agentId, tenantId) {
        const cached = this.routingCache.getTiers(agentId);
        if (cached)
            return cached;
        if (tenantId)
            await this.providerService.getProviders(tenantId);
        const rows = await this.tierRepo.find({ where: { agent_id: agentId } });
        const present = new Set(rows.map((r) => r.tier));
        const missing = manifest_shared_1.TIER_SLOTS.filter((slot) => !present.has(slot));
        if (missing.length === 0) {
            this.routingCache.setTiers(agentId, rows);
            return rows;
        }
        const created = missing.map((slot) => Object.assign(new tier_assignment_entity_1.TierAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            tier: slot,
            override_route: null,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
        }));
        try {
            await this.tierRepo.insert(created);
        }
        catch (err) {
            const existing = await this.tierRepo.find({ where: { agent_id: agentId } });
            if (existing.length > 0) {
                this.routingCache.setTiers(agentId, existing);
                return existing;
            }
            throw err;
        }
        const merged = [...rows, ...created];
        this.routingCache.setTiers(agentId, merged);
        return merged;
    }
    async setOverride(agentId, tenantId, tier, model, provider, authType, providerKeyLabel) {
        const available = await this.discoveryService.getModelsForAgent(tenantId, agentId);
        const resolution = (0, resolve_model_route_1.resolveModelRoute)(model, available, {
            provider,
            authType,
            keyLabel: providerKeyLabel,
        });
        if (!resolution.ok) {
            throw new common_1.BadRequestException((0, resolve_model_route_1.describeUnresolvedModel)(model, resolution.reason, available, { provider, authType }));
        }
        const route = resolution.route;
        const existing = await this.tierRepo.findOne({
            where: { agent_id: agentId, tier },
        });
        if (existing) {
            existing.override_route = route;
            if (existing.fallback_routes) {
                const filtered = existing.fallback_routes.filter((r) => !(0, route_helpers_1.routeMatches)(r, route));
                existing.fallback_routes = filtered.length > 0 ? filtered : null;
            }
            (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `tier "${tier}"`, route, existing.fallback_routes);
            existing.updated_at = new Date().toISOString();
            await this.tierRepo.save(existing);
            this.routingCache.invalidateAgent(agentId);
            return existing;
        }
        const record = Object.assign(new tier_assignment_entity_1.TierAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            tier,
            override_route: route,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
        });
        try {
            await this.tierRepo.insert(record);
        }
        catch (err) {
            const retry = await this.tierRepo.findOne({ where: { agent_id: agentId, tier } });
            if (retry) {
                return this.setOverride(agentId, tenantId, tier, model, provider, authType, providerKeyLabel);
            }
            throw err;
        }
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async setResponseMode(agentId, tier, responseMode) {
        const existing = await this.tierRepo.findOne({ where: { agent_id: agentId, tier } });
        if (existing) {
            (0, response_mode_guard_1.assertStreamableResponseMode)(responseMode, `tier "${tier}"`, existing.override_route, existing.fallback_routes);
            existing.response_mode = responseMode;
            existing.updated_at = new Date().toISOString();
            await this.tierRepo.save(existing);
            this.routingCache.invalidateAgent(agentId);
            return existing;
        }
        const record = Object.assign(new tier_assignment_entity_1.TierAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            tier,
            override_route: null,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: responseMode,
        });
        (0, response_mode_guard_1.assertStreamableResponseMode)(responseMode, `tier "${tier}"`, null, null);
        await this.tierRepo.insert(record);
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async clearOverride(agentId, tier) {
        const existing = await this.tierRepo.findOne({
            where: { agent_id: agentId, tier },
        });
        if (!existing)
            return;
        existing.override_route = null;
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `tier "${tier}"`, null, existing.fallback_routes);
        existing.updated_at = new Date().toISOString();
        await this.tierRepo.save(existing);
        this.routingCache.invalidateAgent(agentId);
    }
    async resetAllOverrides(agentId) {
        await this.tierRepo.update({ agent_id: agentId }, {
            override_route: null,
            fallback_routes: null,
            updated_at: new Date().toISOString(),
        });
        this.routingCache.invalidateAgent(agentId);
    }
    async getFallbacks(agentId, tier) {
        const existing = await this.tierRepo.findOne({ where: { agent_id: agentId, tier } });
        return existing?.fallback_routes ?? [];
    }
    async setFallbacks(agentId, tenantId, tier, models, routes) {
        const existing = await this.tierRepo.findOne({ where: { agent_id: agentId, tier } });
        if (!existing)
            return [];
        const fallbackRoutes = await this.buildFallbackRoutes(agentId, tenantId, models, routes, (0, route_helpers_1.readFallbackRoutes)(existing));
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `tier "${tier}"`, existing.override_route, fallbackRoutes);
        existing.fallback_routes = fallbackRoutes;
        existing.updated_at = new Date().toISOString();
        await this.tierRepo.save(existing);
        this.routingCache.invalidateAgent(agentId);
        return existing.fallback_routes ?? [];
    }
    async clearFallbacks(agentId, tier) {
        const existing = await this.tierRepo.findOne({ where: { agent_id: agentId, tier } });
        if (!existing)
            return;
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `tier "${tier}"`, existing.override_route, null);
        existing.fallback_routes = null;
        existing.updated_at = new Date().toISOString();
        await this.tierRepo.save(existing);
        this.routingCache.invalidateAgent(agentId);
    }
    async buildFallbackRoutes(agentId, tenantId, models, routes, storedRoutes) {
        if (models.length === 0)
            return null;
        const available = await this.discoveryService.getModelsForAgent(tenantId, agentId);
        const resolution = (0, resolve_model_route_1.resolveFallbackRoutes)(models, available, routes, storedRoutes);
        if (!resolution.ok) {
            throw new common_1.BadRequestException((0, resolve_model_route_1.describeUnresolvedFallback)(resolution.model));
        }
        return resolution.routes;
    }
};
exports.TierService = TierService;
exports.TierService = TierService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tier_assignment_entity_1.TierAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService,
        provider_service_1.ProviderService,
        model_discovery_service_1.ModelDiscoveryService])
], TierService);
//# sourceMappingURL=tier.service.js.map