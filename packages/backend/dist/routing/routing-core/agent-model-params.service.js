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
exports.AgentModelParamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const agent_model_params_entity_1 = require("../../entities/agent-model-params.entity");
const routing_cache_service_1 = require("./routing-cache.service");
const anthropic_model_id_1 = require("../../common/utils/anthropic-model-id");
let AgentModelParamsService = class AgentModelParamsService {
    repo;
    cache;
    constructor(repo, cache) {
        this.repo = repo;
        this.cache = cache;
    }
    async list(agentId) {
        const cached = this.cache.getModelParams(agentId);
        if (cached)
            return cached;
        const rows = await this.repo.find({ where: { agent_id: agentId } });
        this.cache.setModelParams(agentId, rows);
        return rows;
    }
    async get(agentId, scopeKey, provider, authType, modelName) {
        const rows = await this.list(agentId);
        const wanted = (0, anthropic_model_id_1.normalizeProviderModel)(provider, modelName);
        const candidates = rows.filter((r) => r.scope_key === scopeKey &&
            r.provider.toLowerCase() === provider.toLowerCase() &&
            r.auth_type === authType &&
            (0, anthropic_model_id_1.normalizeProviderModel)(r.provider, r.model_name) === wanted);
        const match = candidates.find((r) => r.model_name === modelName) ?? candidates[0];
        return match?.params ?? null;
    }
    async set(agentId, scopeKey, provider, authType, modelName, params) {
        const normalizedProvider = provider.toLowerCase();
        await this.repo
            .createQueryBuilder()
            .insert()
            .into(agent_model_params_entity_1.AgentModelParams)
            .values({
            id: (0, crypto_1.randomUUID)(),
            agent_id: agentId,
            scope_key: scopeKey,
            provider: normalizedProvider,
            auth_type: authType,
            model_name: modelName,
            params: params,
        })
            .orUpdate(['params', 'updated_at'], ['agent_id', 'scope_key', 'provider', 'model_name', 'auth_type'])
            .setParameter('updated_at', new Date().toISOString())
            .execute();
        this.cache.invalidateModelParams(agentId);
        const row = await this.repo.findOneOrFail({
            where: {
                agent_id: agentId,
                scope_key: scopeKey,
                provider: normalizedProvider,
                auth_type: authType,
                model_name: modelName,
            },
        });
        return row;
    }
    async delete(agentId, scopeKey, provider, authType, modelName) {
        await this.repo.delete({
            agent_id: agentId,
            scope_key: scopeKey,
            provider: provider.toLowerCase(),
            auth_type: authType,
            model_name: modelName,
        });
        this.cache.invalidateModelParams(agentId);
    }
};
exports.AgentModelParamsService = AgentModelParamsService;
exports.AgentModelParamsService = AgentModelParamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_model_params_entity_1.AgentModelParams)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routing_cache_service_1.RoutingCacheService])
], AgentModelParamsService);
//# sourceMappingURL=agent-model-params.service.js.map