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
var McpController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpController = void 0;
const common_1 = require("@nestjs/common");
const mcp_1 = require("@better-auth/mcp");
const oauth2_1 = require("better-auth/oauth2");
const server_1 = require("@modelcontextprotocol/server");
const node_1 = require("better-auth/node");
const node_stream_1 = require("node:stream");
const promises_1 = require("node:stream/promises");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const auth_instance_1 = require("../auth/auth.instance");
const public_decorator_1 = require("../common/decorators/public.decorator");
const tenant_cache_service_1 = require("../common/services/tenant-cache.service");
const agent_list_cache_service_1 = require("../common/services/agent-list-cache.service");
const ingest_event_bus_service_1 = require("../common/services/ingest-event-bus.service");
const agent_recording_config_service_1 = require("../common/services/agent-recording-config.service");
const timeseries_queries_service_1 = require("../analytics/services/timeseries-queries.service");
const agent_lifecycle_service_1 = require("../analytics/services/agent-lifecycle.service");
const messages_query_service_1 = require("../analytics/services/messages-query.service");
const autofix_stats_service_1 = require("../analytics/services/autofix-stats.service");
const api_key_service_1 = require("../otlp/services/api-key.service");
const provider_service_1 = require("../routing/routing-core/provider.service");
const tier_service_1 = require("../routing/routing-core/tier.service");
const specificity_service_1 = require("../routing/routing-core/specificity.service");
const resolve_agent_service_1 = require("../routing/routing-core/resolve-agent.service");
const header_tier_service_1 = require("../routing/header-tiers/header-tier.service");
const custom_provider_service_1 = require("../routing/custom-provider/custom-provider.service");
const autofix_service_1 = require("../routing/autofix/autofix.service");
const model_discovery_service_1 = require("../model-discovery/model-discovery.service");
const pricing_sync_service_1 = require("../database/pricing-sync.service");
const model_prices_service_1 = require("../model-prices/model-prices.service");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const agent_entity_1 = require("../entities/agent.entity");
const mcp_auth_1 = require("./mcp-auth");
const mcp_server_factory_1 = require("./mcp-server.factory");
const route_model_params_service_1 = require("../routing/model-params/route-model-params.service");
let McpController = McpController_1 = class McpController {
    dataSource;
    tenantCache;
    cacheManager;
    agentListCache;
    eventBus;
    recording;
    timeseries;
    lifecycle;
    apiKeys;
    messages;
    autofixStats;
    providers;
    tiers;
    specificity;
    resolveAgentService;
    headerTiers;
    customProviders;
    autofix;
    routeModelParams;
    modelDiscovery;
    pricingSync;
    modelPrices;
    tenantProviderRepo;
    agentEnabledProviderRepo;
    agentRepo;
    logger = new common_1.Logger(McpController_1.name);
    constructor(dataSource, tenantCache, cacheManager, agentListCache, eventBus, recording, timeseries, lifecycle, apiKeys, messages, autofixStats, providers, tiers, specificity, resolveAgentService, headerTiers, customProviders, autofix, routeModelParams, modelDiscovery, pricingSync, modelPrices, tenantProviderRepo, agentEnabledProviderRepo, agentRepo) {
        this.dataSource = dataSource;
        this.tenantCache = tenantCache;
        this.cacheManager = cacheManager;
        this.agentListCache = agentListCache;
        this.eventBus = eventBus;
        this.recording = recording;
        this.timeseries = timeseries;
        this.lifecycle = lifecycle;
        this.apiKeys = apiKeys;
        this.messages = messages;
        this.autofixStats = autofixStats;
        this.providers = providers;
        this.tiers = tiers;
        this.specificity = specificity;
        this.resolveAgentService = resolveAgentService;
        this.headerTiers = headerTiers;
        this.customProviders = customProviders;
        this.autofix = autofix;
        this.routeModelParams = routeModelParams;
        this.modelDiscovery = modelDiscovery;
        this.pricingSync = pricingSync;
        this.modelPrices = modelPrices;
        this.tenantProviderRepo = tenantProviderRepo;
        this.agentEnabledProviderRepo = agentEnabledProviderRepo;
        this.agentRepo = agentRepo;
    }
    deps() {
        return {
            dataSource: this.dataSource,
            tenantCache: this.tenantCache,
            cacheManager: this.cacheManager,
            agentListCache: this.agentListCache,
            eventBus: this.eventBus,
            recording: this.recording,
            timeseries: this.timeseries,
            lifecycle: this.lifecycle,
            apiKeys: this.apiKeys,
            autofixStats: this.autofixStats,
            messages: this.messages,
            providers: this.providers,
            tiers: this.tiers,
            specificity: this.specificity,
            resolveAgent: this.resolveAgentService,
            headerTiers: this.headerTiers,
            customProviders: this.customProviders,
            autofix: this.autofix,
            routeModelParams: this.routeModelParams,
            modelDiscovery: this.modelDiscovery,
            pricingSync: this.pricingSync,
            modelPrices: this.modelPrices,
            tenantProviderRepo: this.tenantProviderRepo,
            agentEnabledProviderRepo: this.agentEnabledProviderRepo,
            agentRepo: this.agentRepo,
        };
    }
    async rejectGet(res) {
        await sendWebResponse(methodNotAllowedResponse(), res, this.logger);
    }
    async rejectDelete(res) {
        await sendWebResponse(methodNotAllowedResponse(), res, this.logger);
    }
    async handle(req, res) {
        const deps = this.deps();
        const resource = (0, auth_instance_1.mcpResourceForHost)(req.headers.host);
        const issuer = (0, auth_instance_1.authIssuerForHost)(req.headers.host);
        const webRequest = new globalThis.Request(resource, {
            method: req.method,
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        try {
            const { internalAdapter } = await auth_instance_1.auth.$context;
            const verify = (0, mcp_1.createMcpProtectedRequestHandler)({
                issuer,
                audience: resource,
                jwksUrl: `${issuer}/jwks`,
                requiredScopes: [auth_instance_1.MCP_READ_SCOPE],
                dpop: { replayStore: (0, oauth2_1.createDpopReplayStore)(internalAdapter) },
            }, async (request, claims) => {
                const operator = await (0, mcp_auth_1.resolveMcpOperator)(this.tenantCache, claims);
                if (!operator)
                    return unauthorizedResponse(resource);
                const handler = (0, server_1.createMcpHandler)(() => (0, mcp_server_factory_1.buildMcpServer)(deps, operator), {
                    responseMode: 'json',
                });
                return handler.fetch(request, { parsedBody: req.body });
            });
            const response = await verify(webRequest);
            await sendWebResponse(response, res, this.logger);
        }
        catch (error) {
            this.logger.error(`MCP request failed: ${error instanceof Error ? error.stack : String(error)}`);
            await sendWebResponse(internalErrorResponse(), res, this.logger);
        }
    }
};
exports.McpController = McpController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "rejectGet", null);
__decorate([
    (0, common_1.Delete)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "rejectDelete", null);
__decorate([
    (0, common_1.Post)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "handle", null);
exports.McpController = McpController = McpController_1 = __decorate([
    (0, common_1.Controller)('api/v1/mcp'),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __param(22, (0, typeorm_2.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(23, (0, typeorm_2.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __param(24, (0, typeorm_2.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        tenant_cache_service_1.TenantCacheService, Object, agent_list_cache_service_1.AgentListCacheService,
        ingest_event_bus_service_1.IngestEventBusService,
        agent_recording_config_service_1.AgentRecordingConfigService,
        timeseries_queries_service_1.TimeseriesQueriesService,
        agent_lifecycle_service_1.AgentLifecycleService,
        api_key_service_1.ApiKeyGeneratorService,
        messages_query_service_1.MessagesQueryService,
        autofix_stats_service_1.AutofixStatsService,
        provider_service_1.ProviderService,
        tier_service_1.TierService,
        specificity_service_1.SpecificityService,
        resolve_agent_service_1.ResolveAgentService,
        header_tier_service_1.HeaderTierService,
        custom_provider_service_1.CustomProviderService,
        autofix_service_1.AutofixService,
        route_model_params_service_1.RouteModelParamsService,
        model_discovery_service_1.ModelDiscoveryService,
        pricing_sync_service_1.PricingSyncService,
        model_prices_service_1.ModelPricesService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], McpController);
function internalErrorResponse() {
    return new globalThis.Response(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal error' },
        id: null,
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
function methodNotAllowedResponse() {
    return new globalThis.Response(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed' },
        id: null,
    }), { status: 405, headers: { 'Content-Type': 'application/json', Allow: 'POST' } });
}
function unauthorizedResponse(resource) {
    const url = new URL(resource);
    const metadata = `${url.origin}/.well-known/oauth-protected-resource${url.pathname}`;
    return new globalThis.Response(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Unauthorized: operator no longer exists' },
        id: null,
    }), {
        status: 401,
        headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': `Bearer error="invalid_token", resource_metadata="${metadata}"`,
        },
    });
}
function isEventStream(response) {
    return (response.headers.get('content-type') ?? '').includes('text/event-stream');
}
const CLIENT_HANGUP_CODES = new Set([
    'ERR_STREAM_PREMATURE_CLOSE',
    'ERR_STREAM_DESTROYED',
    'ECONNRESET',
    'EPIPE',
]);
function isClientHangUp(error) {
    const code = error.code;
    return typeof code === 'string' && CLIENT_HANGUP_CODES.has(code);
}
async function sendWebResponse(response, res, logger) {
    response.headers.forEach((value, key) => res.set(key, value));
    res.status(response.status);
    if (!isEventStream(response) || !response.body) {
        res.send(await response.text());
        return;
    }
    res.flushHeaders();
    try {
        await (0, promises_1.pipeline)(node_stream_1.Readable.fromWeb(response.body), res);
    }
    catch (error) {
        if (!isClientHangUp(error)) {
            logger.error(`MCP stream failed: ${error instanceof Error ? error.stack : String(error)}`);
        }
    }
}
//# sourceMappingURL=mcp.controller.js.map