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
var RoutingInvalidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tier_assignment_entity_1 = require("../../entities/tier-assignment.entity");
const routing_cache_service_1 = require("./routing-cache.service");
let RoutingInvalidationService = RoutingInvalidationService_1 = class RoutingInvalidationService {
    tierRepo;
    routingCache;
    logger = new common_1.Logger(RoutingInvalidationService_1.name);
    constructor(tierRepo, routingCache) {
        this.tierRepo = tierRepo;
        this.routingCache = routingCache;
    }
    async invalidateOverridesForRemovedModels(removedModels) {
        if (removedModels.length === 0)
            return;
        const removedSet = new Set(removedModels);
        const allTiers = await this.tierRepo.find();
        const agentIds = new Set();
        const tiersToSave = [];
        let invalidatedCount = 0;
        for (const tier of allTiers) {
            let mutated = false;
            if (tier.override_route && removedSet.has(tier.override_route.model)) {
                this.logger.warn(`Clearing override ${tier.override_route.model} for agent ${tier.agent_id} tier ${tier.tier} (model removed)`);
                tier.override_route = null;
                mutated = true;
                invalidatedCount += 1;
            }
            if (tier.fallback_routes && tier.fallback_routes.length > 0) {
                const filtered = tier.fallback_routes.filter((r) => !removedSet.has(r.model));
                if (filtered.length !== tier.fallback_routes.length) {
                    tier.fallback_routes = filtered.length > 0 ? filtered : null;
                    mutated = true;
                }
            }
            if (mutated) {
                tier.updated_at = new Date().toISOString();
                tiersToSave.push(tier);
                agentIds.add(tier.agent_id);
            }
        }
        if (tiersToSave.length > 0)
            await this.tierRepo.save(tiersToSave);
        if (agentIds.size === 0)
            return;
        for (const agentId of agentIds) {
            this.routingCache.invalidateAgent(agentId);
        }
        this.logger.log(`Invalidated ${invalidatedCount} overrides for ${agentIds.size} agents (removed models: ${removedModels.join(', ')})`);
    }
};
exports.RoutingInvalidationService = RoutingInvalidationService;
exports.RoutingInvalidationService = RoutingInvalidationService = RoutingInvalidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tier_assignment_entity_1.TierAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService])
], RoutingInvalidationService);
//# sourceMappingURL=routing-invalidation.service.js.map