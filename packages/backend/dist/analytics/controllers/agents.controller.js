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
var AgentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const timeseries_queries_service_1 = require("../services/timeseries-queries.service");
const agent_lifecycle_service_1 = require("../services/agent-lifecycle.service");
const agent_duplication_service_1 = require("../services/agent-duplication.service");
const api_key_service_1 = require("../../otlp/services/api-key.service");
const ingest_event_bus_service_1 = require("../../common/services/ingest-event-bus.service");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const create_agent_dto_1 = require("../../common/dto/create-agent.dto");
const duplicate_agent_dto_1 = require("../../common/dto/duplicate-agent.dto");
const rename_agent_dto_1 = require("../../common/dto/rename-agent.dto");
const agent_list_cache_interceptor_1 = require("../../common/interceptors/agent-list-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
const agent_list_cache_service_1 = require("../../common/services/agent-list-cache.service");
const slugify_1 = require("../../common/utils/slugify");
const playground_constants_1 = require("../../common/constants/playground.constants");
const provider_service_1 = require("../../routing/routing-core/provider.service");
const autofix_stats_service_1 = require("../services/autofix-stats.service");
let AgentsController = AgentsController_1 = class AgentsController {
    timeseries;
    lifecycle;
    duplication;
    apiKeyGenerator;
    eventBus;
    providerService;
    autofixStats;
    agentListCache;
    cacheManager;
    logger = new common_1.Logger(AgentsController_1.name);
    constructor(timeseries, lifecycle, duplication, apiKeyGenerator, eventBus, providerService, autofixStats, agentListCache, cacheManager) {
        this.timeseries = timeseries;
        this.lifecycle = lifecycle;
        this.duplication = duplication;
        this.apiKeyGenerator = apiKeyGenerator;
        this.eventBus = eventBus;
        this.providerService = providerService;
        this.autofixStats = autofixStats;
        this.agentListCache = agentListCache;
        this.cacheManager = cacheManager;
    }
    async invalidateAgentListCache(tenantId) {
        if (!tenantId)
            return;
        await this.agentListCache.invalidate(tenantId);
    }
    async invalidateAutofixStatusCache(tenantId) {
        if (!tenantId)
            return;
        await this.cacheManager.del(`${tenantId}:/api/v1/autofix/status`);
    }
    emitAgentEvent(tenantId, userId) {
        if (tenantId)
            this.eventBus.emit(tenantId, 'agent', userId);
    }
    async getAgents(ctx, includePlayground) {
        const agents = await this.timeseries.getAgentList(ctx.tenantId, includePlayground === 'true');
        return { agents };
    }
    async createAgent(ctx, body) {
        const slug = (0, slugify_1.slugify)(body.name);
        if (!slug) {
            throw new common_1.BadRequestException('Agent name produces an empty slug');
        }
        if (slug === playground_constants_1.PLAYGROUND_AGENT_SLUG) {
            throw new common_1.BadRequestException('"Playground" is a reserved agent name');
        }
        const displayName = body.name.trim();
        let result;
        try {
            if (body.autofix_enabled === true) {
                await this.autofixStats.recordAutofixConsent();
                await this.invalidateAutofixStatusCache(ctx.tenantId);
            }
            result = await this.apiKeyGenerator.onboardAgent({
                tenantId: ctx.tenantId,
                ownerUserId: ctx.userId,
                agentName: slug,
                displayName,
                agentCategory: body.agent_category,
                agentPlatform: body.agent_platform,
                autofixEnabled: body.autofix_enabled,
                recordMessages: body.record_messages,
            });
        }
        catch (error) {
            if (error instanceof typeorm_1.QueryFailedError && /unique|duplicate/i.test(error.message)) {
                throw new common_1.ConflictException(`Agent "${slug}" already exists`);
            }
            throw error;
        }
        try {
            await this.providerService.enableAllProvidersForAgent(result.agentId, result.tenantId);
        }
        catch (error) {
            this.logger.error(`Failed to enable providers for new agent "${slug}" (${result.agentId}); rolling back agent creation`, error instanceof Error ? error.stack : String(error));
            try {
                await this.lifecycle.deleteAgent(result.tenantId, slug);
            }
            catch (cleanupError) {
                this.logger.error(`Compensating cleanup failed for agent "${slug}" (${result.agentId}); it may be left without providers`, cleanupError instanceof Error ? cleanupError.stack : String(cleanupError));
            }
            await Promise.all([
                this.invalidateAgentListCache(result.tenantId),
                this.invalidateAutofixStatusCache(result.tenantId),
            ]);
            throw error;
        }
        await Promise.all([
            this.invalidateAgentListCache(result.tenantId),
            this.invalidateAutofixStatusCache(result.tenantId),
        ]);
        this.emitAgentEvent(result.tenantId, ctx.userId);
        return {
            agent: {
                id: result.agentId,
                name: slug,
                display_name: displayName,
                agent_category: body.agent_category ?? null,
                agent_platform: body.agent_platform ?? null,
            },
            apiKey: result.apiKey,
        };
    }
    async getDuplicatePreview(ctx, agentName) {
        const [copied, suggested_name] = await Promise.all([
            this.duplication.getCopySummary(ctx.tenantId, agentName),
            this.duplication.suggestName(ctx.tenantId, agentName),
        ]);
        return { copied, suggested_name };
    }
    async duplicateAgent(ctx, sourceName, body) {
        const slug = (0, slugify_1.slugify)(body.name);
        if (!slug)
            throw new common_1.BadRequestException('Agent name produces an empty slug');
        if (slug === playground_constants_1.PLAYGROUND_AGENT_SLUG) {
            throw new common_1.BadRequestException('"Playground" is a reserved agent name');
        }
        const displayName = body.name.trim();
        let result;
        try {
            result = await this.duplication.duplicate(ctx.tenantId, sourceName, {
                name: slug,
                displayName,
            });
        }
        catch (error) {
            if (error instanceof typeorm_1.QueryFailedError && /unique|duplicate/i.test(error.message)) {
                throw new common_1.ConflictException(`Agent "${slug}" already exists`);
            }
            throw error;
        }
        await this.invalidateAgentListCache(ctx.tenantId);
        this.emitAgentEvent(ctx.tenantId, ctx.userId);
        return {
            agent: {
                id: result.agentId,
                name: result.agentName,
                display_name: result.displayName,
            },
            apiKey: result.apiKey,
            copied: result.copied,
        };
    }
    async getAgentInfo(ctx, agentName) {
        const info = await this.lifecycle.findAgentInfo(ctx.tenantId, agentName);
        if (!info)
            return { agent: null };
        return { agent: info };
    }
    async getAgentKey(ctx, agentName) {
        const info = await this.lifecycle.findAgentInfo(ctx.tenantId, agentName);
        if (!info || !ctx.tenantId)
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        const keyData = await this.apiKeyGenerator.getKeyForAgent(ctx.tenantId, agentName);
        const apiKey = keyData.fullKey ?? undefined;
        return {
            keyPrefix: keyData.keyPrefix,
            ...(apiKey ? { apiKey } : {}),
        };
    }
    async rotateAgentKey(ctx, agentName) {
        const info = await this.lifecycle.findAgentInfo(ctx.tenantId, agentName);
        if (!info || !ctx.tenantId)
            throw new common_1.NotFoundException(`Agent "${agentName}" not found`);
        const result = await this.apiKeyGenerator.rotateKey(ctx.tenantId, agentName);
        return { apiKey: result.apiKey };
    }
    async updateAgent(ctx, agentName, body) {
        const result = {};
        if (body.name) {
            const slug = (0, slugify_1.slugify)(body.name);
            if (!slug)
                throw new common_1.BadRequestException('Agent name produces an empty slug');
            if (slug === playground_constants_1.PLAYGROUND_AGENT_SLUG) {
                throw new common_1.BadRequestException('"Playground" is a reserved agent name');
            }
            const displayName = body.name.trim();
            await this.lifecycle.renameAgent(ctx.tenantId, agentName, slug, displayName);
            result['renamed'] = true;
            result['name'] = slug;
            result['display_name'] = displayName;
        }
        if (body.agent_category !== undefined || body.agent_platform !== undefined) {
            await this.lifecycle.updateAgentType(ctx.tenantId, body.name ? (0, slugify_1.slugify)(body.name) : agentName, {
                agent_category: body.agent_category,
                agent_platform: body.agent_platform,
            });
            if (body.agent_category !== undefined)
                result['agent_category'] = body.agent_category;
            if (body.agent_platform !== undefined)
                result['agent_platform'] = body.agent_platform;
        }
        await this.invalidateAgentListCache(ctx.tenantId);
        this.emitAgentEvent(ctx.tenantId, ctx.userId);
        return result;
    }
    async deleteAgent(ctx, agentName) {
        await this.lifecycle.deleteAgent(ctx.tenantId, agentName);
        await this.invalidateAgentListCache(ctx.tenantId);
        this.emitAgentEvent(ctx.tenantId, ctx.userId);
        return { deleted: true };
    }
};
exports.AgentsController = AgentsController;
__decorate([
    (0, common_1.Get)('agents'),
    (0, common_1.UseInterceptors)(agent_list_cache_interceptor_1.AgentListCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.AGENT_LIST_CACHE_TTL_MS),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Query)('includePlayground')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Post)('agents'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_agent_dto_1.CreateAgentDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "createAgent", null);
__decorate([
    (0, common_1.Get)('agents/:agentName/duplicate-preview'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getDuplicatePreview", null);
__decorate([
    (0, common_1.Post)('agents/:agentName/duplicate'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, duplicate_agent_dto_1.DuplicateAgentDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "duplicateAgent", null);
__decorate([
    (0, common_1.Get)('agents/:agentName'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgentInfo", null);
__decorate([
    (0, common_1.Get)('agents/:agentName/key'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "getAgentKey", null);
__decorate([
    (0, common_1.Post)('agents/:agentName/rotate-key'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "rotateAgentKey", null);
__decorate([
    (0, common_1.Patch)('agents/:agentName'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, rename_agent_dto_1.RenameAgentDto]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Delete)('agents/:agentName'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentsController.prototype, "deleteAgent", null);
exports.AgentsController = AgentsController = AgentsController_1 = __decorate([
    (0, common_1.Controller)('api/v1'),
    __param(8, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [timeseries_queries_service_1.TimeseriesQueriesService,
        agent_lifecycle_service_1.AgentLifecycleService,
        agent_duplication_service_1.AgentDuplicationService,
        api_key_service_1.ApiKeyGeneratorService,
        ingest_event_bus_service_1.IngestEventBusService,
        provider_service_1.ProviderService,
        autofix_stats_service_1.AutofixStatsService,
        agent_list_cache_service_1.AgentListCacheService, Object])
], AgentsController);
//# sourceMappingURL=agents.controller.js.map