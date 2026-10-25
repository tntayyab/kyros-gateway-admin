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
exports.SpecificityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const manifest_shared_1 = require("manifest-shared");
const specificity_assignment_entity_1 = require("../../entities/specificity-assignment.entity");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const routing_cache_service_1 = require("./routing-cache.service");
const route_helpers_1 = require("./route-helpers");
const response_mode_guard_1 = require("./response-mode-guard");
let SpecificityService = class SpecificityService {
    repo;
    routingCache;
    discoveryService;
    constructor(repo, routingCache, discoveryService) {
        this.repo = repo;
        this.routingCache = routingCache;
        this.discoveryService = discoveryService;
    }
    async getAssignments(agentId) {
        const cached = this.routingCache.getSpecificity(agentId);
        if (cached)
            return cached;
        const rows = await this.repo.find({ where: { agent_id: agentId } });
        this.routingCache.setSpecificity(agentId, rows);
        return rows;
    }
    async getActiveAssignments(agentId) {
        const all = await this.getAssignments(agentId);
        return all.filter((a) => a.is_active);
    }
    async toggleCategory(agentId, category, active) {
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (existing) {
            existing.is_active = active;
            existing.updated_at = new Date().toISOString();
            await this.repo.save(existing);
            this.routingCache.invalidateAgent(agentId);
            return existing;
        }
        const record = Object.assign(new specificity_assignment_entity_1.SpecificityAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            category,
            is_active: active,
            override_route: null,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
        });
        try {
            await this.repo.insert(record);
        }
        catch (err) {
            const retry = await this.repo.findOne({ where: { agent_id: agentId, category } });
            if (retry)
                return this.toggleCategory(agentId, category, active);
            throw err;
        }
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async setOverride(agentId, tenantId, category, model, provider, authType, providerKeyLabel) {
        const explicit = (0, route_helpers_1.explicitRoute)(model, provider, authType, providerKeyLabel);
        const route = explicit ??
            (0, route_helpers_1.unambiguousRoute)(model, await this.discoveryService.getModelsForAgent(tenantId, agentId), providerKeyLabel);
        if (!route) {
            throw new common_1.BadRequestException(`Model "${model}" is offered by multiple providers — pass an explicit ` +
                `provider + authType so the route is unambiguous.`);
        }
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (existing) {
            (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `task-specific tier "${category}"`, route, existing.fallback_routes);
            existing.override_route = route;
            existing.is_active = true;
            existing.updated_at = new Date().toISOString();
            await this.repo.save(existing);
            this.routingCache.invalidateAgent(agentId);
            return existing;
        }
        const record = Object.assign(new specificity_assignment_entity_1.SpecificityAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            category,
            is_active: true,
            override_route: route,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
        });
        try {
            await this.repo.insert(record);
        }
        catch (err) {
            const retry = await this.repo.findOne({ where: { agent_id: agentId, category } });
            if (retry) {
                return this.setOverride(agentId, tenantId, category, model, provider, authType, providerKeyLabel);
            }
            throw err;
        }
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async setResponseMode(agentId, category, responseMode) {
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (existing) {
            (0, response_mode_guard_1.assertStreamableResponseMode)(responseMode, `task-specific tier "${category}"`, existing.override_route, existing.fallback_routes);
            existing.response_mode = responseMode;
            existing.updated_at = new Date().toISOString();
            await this.repo.save(existing);
            this.routingCache.invalidateAgent(agentId);
            return existing;
        }
        const record = Object.assign(new specificity_assignment_entity_1.SpecificityAssignment(), {
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            category,
            is_active: false,
            override_route: null,
            auto_assigned_route: null,
            fallback_routes: null,
            output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
            response_mode: responseMode,
        });
        (0, response_mode_guard_1.assertStreamableResponseMode)(responseMode, `task-specific tier "${category}"`, null, null);
        await this.repo.insert(record);
        this.routingCache.invalidateAgent(agentId);
        return record;
    }
    async clearOverride(agentId, category) {
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (!existing)
            return;
        existing.override_route = null;
        existing.fallback_routes = null;
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `task-specific tier "${category}"`, null, null);
        existing.updated_at = new Date().toISOString();
        await this.repo.save(existing);
        this.routingCache.invalidateAgent(agentId);
    }
    async setFallbacks(agentId, tenantId, category, models, routes) {
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (!existing)
            return [];
        const fallbackRoutes = await this.buildFallbackRoutes(agentId, tenantId, models, routes, (0, route_helpers_1.readFallbackRoutes)(existing));
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `task-specific tier "${category}"`, existing.override_route, fallbackRoutes);
        existing.fallback_routes = fallbackRoutes;
        existing.updated_at = new Date().toISOString();
        await this.repo.save(existing);
        this.routingCache.invalidateAgent(agentId);
        return existing.fallback_routes ?? [];
    }
    async clearFallbacks(agentId, category) {
        const existing = await this.repo.findOne({ where: { agent_id: agentId, category } });
        if (!existing)
            return;
        (0, response_mode_guard_1.assertStreamableResponseMode)(existing.response_mode, `task-specific tier "${category}"`, existing.override_route, null);
        existing.fallback_routes = null;
        existing.updated_at = new Date().toISOString();
        await this.repo.save(existing);
        this.routingCache.invalidateAgent(agentId);
    }
    async resetAll(agentId) {
        await this.repo.update({ agent_id: agentId }, {
            is_active: false,
            override_route: null,
            fallback_routes: null,
            updated_at: new Date().toISOString(),
        });
        this.routingCache.invalidateAgent(agentId);
    }
    async buildFallbackRoutes(agentId, tenantId, models, routes, storedRoutes) {
        if (models.length === 0)
            return null;
        const available = await this.discoveryService.getModelsForAgent(tenantId, agentId);
        if (routes && routes.length === models.length) {
            const aligned = routes.every((r, i) => r.model === models[i]);
            const pool = [...(storedRoutes ?? [])];
            const validated = aligned &&
                routes.every((r) => {
                    const kept = pool.findIndex((s) => (0, route_helpers_1.routeMatches)(s, r));
                    if (kept >= 0) {
                        pool.splice(kept, 1);
                        return true;
                    }
                    return available.some((m) => m.id === r.model &&
                        m.provider.toLowerCase() === r.provider.toLowerCase() &&
                        m.authType === r.authType);
                });
            if (validated)
                return routes;
        }
        const pool = [...(storedRoutes ?? [])];
        const resolved = [];
        for (const m of models) {
            const kept = pool.findIndex((s) => s.model === m);
            if (kept >= 0) {
                resolved.push(pool[kept]);
                pool.splice(kept, 1);
                continue;
            }
            const route = (0, route_helpers_1.unambiguousRoute)(m, available);
            if (!route) {
                throw new common_1.BadRequestException(`Cannot resolve fallback model "${m}" to a single connected provider. ` +
                    `Pass an explicit (provider, authType, model) route, or connect exactly one provider that offers this model.`);
            }
            resolved.push(route);
        }
        return resolved;
    }
};
exports.SpecificityService = SpecificityService;
exports.SpecificityService = SpecificityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(specificity_assignment_entity_1.SpecificityAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService,
        model_discovery_service_1.ModelDiscoveryService])
], SpecificityService);
//# sourceMappingURL=specificity.service.js.map