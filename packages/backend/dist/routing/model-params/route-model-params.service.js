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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteModelParamsService = exports.DEFAULT_TIER_NAME = void 0;
const common_1 = require("@nestjs/common");
const manifest_shared_1 = require("manifest-shared");
const tier_service_1 = require("../routing-core/tier.service");
const header_tier_service_1 = require("../header-tiers/header-tier.service");
const agent_model_params_service_1 = require("../routing-core/agent-model-params.service");
const provider_param_spec_service_1 = require("../routing-core/provider-param-spec.service");
const route_helpers_1 = require("../routing-core/route-helpers");
const anthropic_model_id_1 = require("../../common/utils/anthropic-model-id");
const sanitize_model_params_1 = require("./sanitize-model-params");
exports.DEFAULT_TIER_NAME = 'default';
let RouteModelParamsService = class RouteModelParamsService {
    tiers;
    headerTiers;
    modelParams;
    specs;
    constructor(tiers, headerTiers, modelParams, specs) {
        this.tiers = tiers;
        this.headerTiers = headerTiers;
        this.modelParams = modelParams;
        this.specs = specs;
    }
    async get(agentId, tier = exports.DEFAULT_TIER_NAME, model) {
        const resolved = await this.resolve(agentId, tier, model);
        const specs = await this.specsFor(resolved);
        return this.view(agentId, resolved, specs);
    }
    async update(agentId, tier, model, change) {
        const setEntries = Object.entries(change.set ?? {});
        const unset = change.unset ?? [];
        if (setEntries.length === 0 && unset.length === 0) {
            throw new common_1.BadRequestException('Nothing to change: pass at least one param to set or unset');
        }
        for (const path of [...unset, ...setEntries.map(([p]) => p)]) {
            if (!(0, manifest_shared_1.isProviderParamPath)(path))
                throw new common_1.BadRequestException(`Invalid param path "${path}"`);
        }
        const resolved = await this.resolve(agentId, tier ?? exports.DEFAULT_TIER_NAME, model);
        const { route, scope } = resolved;
        const specs = await this.specsFor(resolved);
        const saved = (await this.savedParams(agentId, resolved)) ?? {};
        for (const path of unset) {
            if (!specs.some((s) => s.path === path) && (0, manifest_shared_1.getProviderParamValue)(saved, path) === undefined) {
                throw this.unknownParam(path, route.model, specs);
            }
        }
        for (const [path] of setEntries) {
            if (!specs.some((s) => s.path === path))
                throw this.unknownParam(path, route.model, specs);
        }
        let next = saved;
        for (const path of unset)
            next = (0, manifest_shared_1.deleteProviderParamValue)(next, path);
        for (const [path, value] of setEntries)
            next = (0, manifest_shared_1.setProviderParamValue)(next, path, value);
        if (Object.keys(next).length === 0) {
            await this.modelParams.delete(agentId, scope, route.provider, route.authType, route.model);
        }
        else {
            const sanitized = (0, sanitize_model_params_1.sanitizeModelParams)(route.provider, next, specs);
            for (const [path] of setEntries) {
                if ((0, manifest_shared_1.getProviderParamValue)(sanitized, path) === undefined) {
                    throw new common_1.BadRequestException(`Param "${path}" does not apply with the current settings of ${route.model}`);
                }
            }
            await this.modelParams.set(agentId, scope, route.provider, route.authType, route.model, sanitized);
        }
        return this.view(agentId, resolved, specs);
    }
    async resolve(agentId, tier, model) {
        const { tierName, scope, primary, fallbacks } = await this.findTier(agentId, tier);
        const routes = [primary, ...fallbacks].filter((r) => r !== null);
        const models = [...new Set(routes.map((r) => r.model))];
        if (model === undefined) {
            if (!primary)
                throw new common_1.BadRequestException(`Tier "${tierName}" has no model yet`);
            return this.resolved(tierName, scope, primary, models);
        }
        const wanted = (r) => (0, anthropic_model_id_1.normalizeProviderModel)(r.provider, model);
        const matches = routes.filter((r) => r.model === model || (0, anthropic_model_id_1.normalizeProviderModel)(r.provider, r.model) === wanted(r));
        if (matches.length === 0) {
            throw new common_1.BadRequestException(`Model "${model}" is not routed by tier "${tierName}". Models: ${models.join(', ')}`);
        }
        const connections = new Set(matches.map((r) => `${r.provider.toLowerCase()}|${r.authType}`));
        if (connections.size > 1) {
            throw new common_1.BadRequestException(`Model "${model}" is routed through more than one connection in tier "${tierName}"; set its params from the dashboard`);
        }
        return this.resolved(tierName, scope, matches[0], models);
    }
    resolved(tierName, scope, route, models) {
        const paramsModel = (0, anthropic_model_id_1.normalizeProviderModel)(route.provider, route.model);
        return { tierName, scope, route, paramsModel, models };
    }
    async findTier(agentId, tier) {
        if (tier.toLowerCase() === exports.DEFAULT_TIER_NAME) {
            const row = (await this.tiers.getTiers(agentId)).find((t) => t.tier === exports.DEFAULT_TIER_NAME);
            if (row) {
                return {
                    tierName: exports.DEFAULT_TIER_NAME,
                    scope: (0, manifest_shared_1.modelParamsScopeForTier)(exports.DEFAULT_TIER_NAME),
                    primary: (0, route_helpers_1.effectiveRoute)(row),
                    fallbacks: (0, route_helpers_1.readFallbackRoutes)(row) ?? [],
                };
            }
        }
        const custom = await this.headerTiers.list(agentId);
        const match = custom.find((t) => t.name.toLowerCase() === tier.toLowerCase());
        if (!match || tier.toLowerCase() === exports.DEFAULT_TIER_NAME) {
            const names = [exports.DEFAULT_TIER_NAME, ...custom.map((t) => t.name)];
            throw new common_1.NotFoundException(`Tier "${tier}" not found. Available tiers: ${names.join(', ')}`);
        }
        return {
            tierName: match.name,
            scope: (0, manifest_shared_1.modelParamsScopeForHeaderTier)(match.id),
            primary: (0, route_helpers_1.readOverrideRoute)(match),
            fallbacks: (0, route_helpers_1.readFallbackRoutes)(match) ?? [],
        };
    }
    specsFor({ route, paramsModel }) {
        return this.specs.getSpecs(route.provider, route.authType, paramsModel);
    }
    savedParams(agentId, { scope, route }) {
        return this.modelParams.get(agentId, scope, route.provider, route.authType, route.model);
    }
    async view(agentId, resolved, specs) {
        const saved = await this.savedParams(agentId, resolved);
        const { provider, authType, model } = resolved.route;
        return {
            tier: resolved.tierName,
            route: { provider, authType, model },
            models: resolved.models,
            params: specs.map(({ provider: _p, authType: _a, model: _m, ...definition }) => ({
                ...definition,
                current: (0, manifest_shared_1.getProviderParamValue)(saved, definition.path) ?? null,
            })),
        };
    }
    unknownParam(path, model, specs) {
        if (specs.length === 0) {
            return new common_1.BadRequestException(`${model} has no configurable params`);
        }
        return new common_1.BadRequestException(`Unknown param "${path}" for ${model}. Available: ${specs.map((s) => s.path).join(', ')}`);
    }
};
exports.RouteModelParamsService = RouteModelParamsService;
exports.RouteModelParamsService = RouteModelParamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tier_service_1.TierService,
        header_tier_service_1.HeaderTierService,
        agent_model_params_service_1.AgentModelParamsService,
        provider_param_spec_service_1.ProviderParamSpecService])
], RouteModelParamsService);
//# sourceMappingURL=route-model-params.service.js.map