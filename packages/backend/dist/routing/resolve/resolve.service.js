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
var ResolveService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tier_service_1 = require("../routing-core/tier.service");
const provider_key_service_1 = require("../routing-core/provider-key.service");
const routing_cache_service_1 = require("../routing-core/routing-cache.service");
const specificity_service_1 = require("../routing-core/specificity.service");
const specificity_penalty_service_1 = require("../routing-core/specificity-penalty.service");
const header_tier_service_1 = require("../header-tiers/header-tier.service");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const route_helpers_1 = require("../routing-core/route-helpers");
const response_mode_guard_1 = require("../routing-core/response-mode-guard");
const scoring_1 = require("../../scoring");
const provider_aliases_1 = require("../../common/utils/provider-aliases");
const agent_entity_1 = require("../../entities/agent.entity");
const manifest_shared_1 = require("manifest-shared");
const MIN_SPECIFICITY_CONFIDENCE = 0.4;
let ResolveService = ResolveService_1 = class ResolveService {
    tierService;
    providerKeyService;
    specificityService;
    pricingCache;
    discoveryService;
    penaltyService;
    headerTierService;
    agentRepo;
    routingCache;
    logger = new common_1.Logger(ResolveService_1.name);
    constructor(tierService, providerKeyService, specificityService, pricingCache, discoveryService, penaltyService, headerTierService, agentRepo, routingCache) {
        this.tierService = tierService;
        this.providerKeyService = providerKeyService;
        this.specificityService = specificityService;
        this.pricingCache = pricingCache;
        this.discoveryService = discoveryService;
        this.penaltyService = penaltyService;
        this.headerTierService = headerTierService;
        this.agentRepo = agentRepo;
        this.routingCache = routingCache;
        this.routingCache.addInvalidationListener((agentId) => this.discoveryService.invalidate(agentId));
        this.routingCache.addTenantInvalidationListener((tenantId) => this.discoveryService.invalidateTenant(tenantId));
    }
    async resolve(agentId, tenantId, messages, tools, toolChoice, maxTokens, recentTiers, specificityOverride, recentCategories, headers) {
        return this.resolveLazy(agentId, tenantId, async () => ({ messages, tools, tool_choice: toolChoice, max_tokens: maxTokens }), recentTiers, specificityOverride, recentCategories, headers);
    }
    async resolveLazy(agentId, tenantId, resolveInput, recentTiers, specificityOverride, recentCategories, headers) {
        if (headers) {
            const headerTierResult = await this.resolveHeaderTier(agentId, tenantId, headers);
            if (headerTierResult)
                return headerTierResult;
        }
        const agent = await this.agentRepo.findOne({ where: { id: agentId } });
        if (agent && !agent.complexity_routing_enabled) {
            return this.resolveForTier(agentId, tenantId, 'default', 'default');
        }
        const { messages, tools, tool_choice: toolChoice, max_tokens: maxTokens, } = await resolveInput();
        const specificityResult = await this.resolveSpecificity(agentId, tenantId, messages, tools, specificityOverride, recentCategories);
        if (specificityResult)
            return specificityResult;
        const input = { messages, tools, tool_choice: toolChoice, max_tokens: maxTokens };
        const momentum = recentTiers && recentTiers.length > 0 ? { recentTiers } : undefined;
        const result = (0, scoring_1.scoreRequest)(input, undefined, momentum);
        const tiers = await this.tierService.getTiers(agentId);
        const assignment = tiers.find((t) => t.tier === result.tier);
        if (!assignment) {
            this.logger.warn(`No tier assignment found for agent=${agentId} tier=${result.tier} ` +
                `(available tiers: ${tiers.map((t) => t.tier).join(', ') || 'none'})`);
            return this.resolveForTier(agentId, tenantId, 'default', 'default');
        }
        const outputModality = outputModalityFor(assignment);
        const responseMode = responseModeFor(assignment);
        const fallbackRoutes = (0, route_helpers_1.readFallbackRoutes)(assignment);
        const routeChain = await this.buildResolvedRouteChain(agentId, tenantId, assignment, fallbackRoutes);
        const effectiveRoutes = (0, response_mode_guard_1.effectiveRoutesForResponseMode)(responseMode, routeChain.primaryRoute, routeChain.fallbackRoutes);
        if (!effectiveRoutes.primaryRoute) {
            this.logger.warn(`No route resolved for agent=${agentId} tier=${result.tier} ` +
                `(override=${assignment.override_route?.model ?? 'null'})`);
            return {
                tier: result.tier,
                route: null,
                fallback_routes: effectiveRoutes.fallbackRoutes,
                output_modality: outputModality,
                response_mode: responseMode,
                confidence: result.confidence,
                score: result.score,
                reason: result.reason,
                override_model_unavailable: routeChain.unavailableOverrideModel ?? undefined,
            };
        }
        return {
            tier: result.tier,
            route: effectiveRoutes.primaryRoute,
            fallback_routes: effectiveRoutes.fallbackRoutes,
            output_modality: outputModality,
            response_mode: responseMode,
            confidence: result.confidence,
            score: result.score,
            reason: result.reason,
        };
    }
    async resolveForTier(agentId, tenantId, tier, reason = 'heartbeat') {
        const tiers = await this.tierService.getTiers(agentId);
        const assignment = tiers.find((t) => t.tier === tier);
        if (!assignment) {
            return {
                tier,
                route: null,
                fallback_routes: null,
                output_modality: manifest_shared_1.DEFAULT_OUTPUT_MODALITY,
                response_mode: manifest_shared_1.DEFAULT_RESPONSE_MODE,
                confidence: 1,
                score: 0,
                reason,
            };
        }
        const outputModality = outputModalityFor(assignment);
        const responseMode = responseModeFor(assignment);
        const fallbackRoutes = (0, route_helpers_1.readFallbackRoutes)(assignment);
        const routeChain = await this.buildResolvedRouteChain(agentId, tenantId, assignment, fallbackRoutes);
        const effectiveRoutes = (0, response_mode_guard_1.effectiveRoutesForResponseMode)(responseMode, routeChain.primaryRoute, routeChain.fallbackRoutes);
        return {
            tier,
            route: effectiveRoutes.primaryRoute,
            fallback_routes: effectiveRoutes.fallbackRoutes,
            output_modality: outputModality,
            response_mode: responseMode,
            confidence: 1,
            score: 0,
            reason,
            override_model_unavailable: effectiveRoutes.primaryRoute || reason === 'heartbeat'
                ? undefined
                : (routeChain.unavailableOverrideModel ?? undefined),
        };
    }
    async resolveHeaderTier(agentId, tenantId, headers) {
        const allTiers = await this.headerTierService.list(agentId);
        const tiers = allTiers.filter((t) => t.enabled);
        if (tiers.length === 0)
            return null;
        const match = tiers.find((t) => matchesHeaderRule(headers, t));
        if (!match)
            return null;
        const overrideRoute = (0, route_helpers_1.readOverrideRoute)(match);
        if (!overrideRoute) {
            this.logger.debug(`Header tier "${match.name}" matched but has no model configured — falling through`);
            return null;
        }
        const fallbackRoutes = (0, route_helpers_1.readFallbackRoutes)(match);
        let primaryOverride = overrideRoute;
        let remainingFallbacks = fallbackRoutes;
        if (!(await this.providerKeyService.isRouteAvailable(tenantId, overrideRoute, agentId))) {
            this.logger.warn(`Header tier "${match.name}" override ${overrideRoute.model} is unavailable ` +
                `for agent=${agentId} — trying the tier's fallbacks`);
            primaryOverride = null;
            const candidates = fallbackRoutes ?? [];
            for (let i = 0; i < candidates.length; i++) {
                if (await this.providerKeyService.isRouteAvailable(tenantId, candidates[i], agentId)) {
                    primaryOverride = candidates[i];
                    const rest = candidates.slice(i + 1);
                    remainingFallbacks = rest.length > 0 ? rest : null;
                    break;
                }
            }
            if (!primaryOverride) {
                this.logger.warn(`Header tier "${match.name}" has no available route ` +
                    `for agent=${agentId}; falling through to existing routing`);
                return null;
            }
        }
        const provider = primaryOverride.provider ||
            (await this.resolveProviderForModel(agentId, tenantId, primaryOverride.model));
        const authType = primaryOverride.authType ??
            (await this.providerKeyService.getAuthType(tenantId, provider ?? '', undefined, agentId));
        const baseRoute = provider && authType
            ? { provider, authType, model: primaryOverride.model, keyLabel: primaryOverride.keyLabel }
            : null;
        const route = baseRoute ? await this.enrichRouteKeyLabel(agentId, tenantId, baseRoute) : null;
        const outputModality = outputModalityFor(match);
        const responseMode = responseModeFor(match);
        const effectiveRoutes = (0, response_mode_guard_1.effectiveRoutesForResponseMode)(responseMode, route, remainingFallbacks);
        return {
            tier: 'standard',
            route: effectiveRoutes.primaryRoute,
            fallback_routes: effectiveRoutes.fallbackRoutes,
            output_modality: outputModality,
            response_mode: responseMode,
            confidence: 1,
            score: 0,
            reason: 'header-match',
            header_tier_id: match.id,
            header_tier_name: match.name,
            header_tier_color: match.badge_color,
        };
    }
    async resolveSpecificity(agentId, tenantId, messages, tools, headerOverride, recentCategories) {
        const active = await this.specificityService.getActiveAssignments(agentId);
        if (active.length === 0)
            return null;
        const penalties = await this.penaltyService.getPenaltiesForAgent(agentId);
        const detected = (0, scoring_1.scanMessages)(messages, tools, headerOverride, recentCategories, penalties.size > 0 ? penalties : undefined);
        if (!detected)
            return null;
        if (!headerOverride && detected.confidence < MIN_SPECIFICITY_CONFIDENCE) {
            this.logger.debug(`Specificity detected=${detected.category} ` +
                `confidence=${detected.confidence.toFixed(2)} below ${MIN_SPECIFICITY_CONFIDENCE} — ` +
                `falling through to complexity routing`);
            return null;
        }
        const assignment = active.find((a) => a.category === detected.category);
        if (!assignment)
            return null;
        const overrideRoute = (0, route_helpers_1.readOverrideRoute)(assignment);
        let route;
        if (overrideRoute) {
            if (!(await this.providerKeyService.isRouteAvailable(tenantId, overrideRoute, agentId))) {
                this.logger.warn(`Specificity override ${overrideRoute.model} is unavailable ` +
                    `for agent=${agentId}; falling through to tier routing`);
                return null;
            }
            route = overrideRoute;
        }
        else {
            return null;
        }
        const outputModality = outputModalityFor(assignment);
        const responseMode = responseModeFor(assignment);
        const fallbackRoutes = (0, route_helpers_1.readFallbackRoutes)(assignment);
        const enrichedRoute = await this.enrichRouteKeyLabel(agentId, tenantId, route);
        const effectiveRoutes = (0, response_mode_guard_1.effectiveRoutesForResponseMode)(responseMode, enrichedRoute, fallbackRoutes);
        return {
            tier: 'standard',
            route: effectiveRoutes.primaryRoute,
            fallback_routes: effectiveRoutes.fallbackRoutes,
            output_modality: outputModality,
            response_mode: responseMode,
            confidence: detected.confidence,
            score: 0,
            reason: 'specificity',
            specificity_category: detected.category,
        };
    }
    async buildResolvedRouteChain(agentId, tenantId, assignment, fallbackRoutes) {
        const override = (0, route_helpers_1.readOverrideRoute)(assignment);
        const autoAssigned = (0, route_helpers_1.readAutoAssignedRoute)(assignment);
        if (override && (await this.providerKeyService.isRouteAvailable(tenantId, override, agentId))) {
            return {
                primaryRoute: await this.enrichRouteKeyLabel(agentId, tenantId, override),
                fallbackRoutes,
                unavailableOverrideModel: null,
            };
        }
        let unavailableOverrideModel = null;
        if (override) {
            this.logger.warn(`Override ${override.model} unavailable for agent=${agentId} — ` +
                `falling back to configured routes`);
            if (await this.providerKeyService.hasRouteCredentials(tenantId, override, agentId)) {
                unavailableOverrideModel = override.model;
            }
        }
        const candidates = override
            ? [...(fallbackRoutes ?? []), ...(autoAssigned ? [autoAssigned] : [])]
            : [...(autoAssigned ? [autoAssigned] : []), ...(fallbackRoutes ?? [])];
        for (let i = 0; i < candidates.length; i++) {
            if (await this.providerKeyService.hasRouteCredentials(tenantId, candidates[i], agentId)) {
                const rest = candidates.slice(i + 1);
                return {
                    primaryRoute: await this.enrichRouteKeyLabel(agentId, tenantId, candidates[i]),
                    fallbackRoutes: rest.length > 0 ? rest : null,
                    unavailableOverrideModel: null,
                };
            }
        }
        return { primaryRoute: null, fallbackRoutes: null, unavailableOverrideModel };
    }
    async pinRouteKeyLabel(agentId, tenantId, route) {
        if (route.keyLabel)
            return route;
        const pinned = await this.defaultTierKeyLabel(agentId, route);
        if (pinned)
            return { ...route, keyLabel: pinned };
        return this.enrichRouteKeyLabel(agentId, tenantId, route);
    }
    async defaultTierKeyLabel(agentId, route) {
        const tiers = await this.tierService.getTiers(agentId);
        const assignment = tiers.find((t) => t.tier === manifest_shared_1.DEFAULT_TIER_SLOT);
        const override = assignment ? (0, route_helpers_1.readOverrideRoute)(assignment) : null;
        if (!override?.keyLabel)
            return undefined;
        if (override.provider.toLowerCase() !== route.provider.toLowerCase())
            return undefined;
        if (override.authType !== route.authType)
            return undefined;
        return override.keyLabel;
    }
    async enrichRouteKeyLabel(agentId, tenantId, route) {
        if (route.keyLabel)
            return route;
        const label = await this.providerKeyService.getDefaultKeyLabel(tenantId, route.provider, route.authType, agentId);
        return label ? { ...route, keyLabel: label } : route;
    }
    async resolveProviderForModel(agentId, tenantId, model) {
        const prefix = (0, provider_aliases_1.inferProviderFromModelName)(model);
        if (prefix && (await this.providerKeyService.hasActiveProvider(tenantId, prefix, agentId))) {
            return prefix;
        }
        const discovered = await this.discoveryService.getModelForAgent(tenantId, model, agentId);
        if (discovered)
            return discovered.provider;
        const pricing = this.pricingCache.getByModel(model);
        if (pricing && pricing.provider !== 'OpenRouter')
            return pricing.provider;
        return null;
    }
};
exports.ResolveService = ResolveService;
exports.ResolveService = ResolveService = ResolveService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(7, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [tier_service_1.TierService,
        provider_key_service_1.ProviderKeyService,
        specificity_service_1.SpecificityService,
        model_pricing_cache_service_1.ModelPricingCacheService,
        model_discovery_service_1.ModelDiscoveryService,
        specificity_penalty_service_1.SpecificityPenaltyService,
        header_tier_service_1.HeaderTierService,
        typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService])
], ResolveService);
function matchesHeaderRule(headers, tier) {
    const raw = headers[tier.header_key];
    if (raw == null)
        return false;
    if (Array.isArray(raw))
        return raw.some((v) => v === tier.header_value);
    return raw === tier.header_value;
}
function outputModalityFor(row) {
    return row.output_modality ?? manifest_shared_1.DEFAULT_OUTPUT_MODALITY;
}
function responseModeFor(row) {
    return row.response_mode ?? manifest_shared_1.DEFAULT_RESPONSE_MODE;
}
//# sourceMappingURL=resolve.service.js.map