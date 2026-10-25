"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const analytics_scope_service_1 = require("./services/analytics-scope.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const agent_entity_1 = require("../entities/agent.entity");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
const tenant_entity_1 = require("../entities/tenant.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const header_tier_entity_1 = require("../entities/header-tier.entity");
const agent_model_params_entity_1 = require("../entities/agent-model-params.entity");
const otlp_module_1 = require("../otlp/otlp.module");
const routing_core_module_1 = require("../routing/routing-core/routing-core.module");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const aggregation_service_1 = require("./services/aggregation.service");
const agent_duplication_service_1 = require("./services/agent-duplication.service");
const agent_lifecycle_service_1 = require("./services/agent-lifecycle.service");
const timeseries_queries_service_1 = require("./services/timeseries-queries.service");
const messages_query_service_1 = require("./services/messages-query.service");
const message_details_service_1 = require("./services/message-details.service");
const error_breakdown_service_1 = require("./services/error-breakdown.service");
const message_feedback_service_1 = require("./services/message-feedback.service");
const specificity_feedback_service_1 = require("./services/specificity-feedback.service");
const agent_analytics_service_1 = require("./services/agent-analytics.service");
const provider_usage_service_1 = require("./services/provider-usage.service");
const overview_controller_1 = require("./controllers/overview.controller");
const provider_usage_controller_1 = require("./controllers/provider-usage.controller");
const tokens_controller_1 = require("./controllers/tokens.controller");
const costs_controller_1 = require("./controllers/costs.controller");
const messages_controller_1 = require("./controllers/messages.controller");
const agents_controller_1 = require("./controllers/agents.controller");
const agent_analytics_controller_1 = require("./controllers/agent-analytics.controller");
const provider_analytics_controller_1 = require("./controllers/provider-analytics.controller");
const errors_controller_1 = require("./controllers/errors.controller");
const attempt_analytics_controller_1 = require("./controllers/attempt-analytics.controller");
const attempt_stats_service_1 = require("./services/attempt-stats.service");
const autofix_analytics_controller_1 = require("./controllers/autofix-analytics.controller");
const autofix_stats_service_1 = require("./services/autofix-stats.service");
const request_volume_service_1 = require("./services/request-volume.service");
const billing_module_1 = require("../billing/billing.module");
const autofix_module_1 = require("../routing/autofix/autofix.module");
const agent_usage_daily_service_1 = require("./services/agent-usage-daily.service");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                agent_message_entity_1.AgentMessage,
                request_entity_1.ManifestRequest,
                agent_entity_1.Agent,
                install_metadata_entity_1.InstallMetadata,
                tenant_entity_1.Tenant,
                custom_provider_entity_1.CustomProvider,
                tenant_provider_entity_1.TenantProvider,
                agent_enabled_provider_entity_1.AgentEnabledProvider,
                tier_assignment_entity_1.TierAssignment,
                specificity_assignment_entity_1.SpecificityAssignment,
                header_tier_entity_1.HeaderTier,
                agent_model_params_entity_1.AgentModelParams,
            ]),
            otlp_module_1.OtlpModule,
            routing_core_module_1.RoutingCoreModule,
            model_prices_module_1.ModelPricesModule,
            billing_module_1.BillingModule,
            autofix_module_1.AutofixModule,
        ],
        controllers: [
            overview_controller_1.OverviewController,
            tokens_controller_1.TokensController,
            costs_controller_1.CostsController,
            messages_controller_1.MessagesController,
            agents_controller_1.AgentsController,
            agent_analytics_controller_1.AgentAnalyticsController,
            provider_analytics_controller_1.ProviderAnalyticsController,
            provider_usage_controller_1.ProviderUsageController,
            errors_controller_1.ErrorsController,
            attempt_analytics_controller_1.AttemptAnalyticsController,
            autofix_analytics_controller_1.AutofixAnalyticsController,
        ],
        providers: [
            analytics_scope_service_1.AnalyticsScopeService,
            aggregation_service_1.AggregationService,
            agent_duplication_service_1.AgentDuplicationService,
            agent_lifecycle_service_1.AgentLifecycleService,
            timeseries_queries_service_1.TimeseriesQueriesService,
            messages_query_service_1.MessagesQueryService,
            message_details_service_1.MessageDetailsService,
            error_breakdown_service_1.ErrorBreakdownService,
            message_feedback_service_1.MessageFeedbackService,
            specificity_feedback_service_1.SpecificityFeedbackService,
            agent_analytics_service_1.AgentAnalyticsService,
            provider_usage_service_1.ProviderUsageService,
            attempt_stats_service_1.AttemptStatsService,
            autofix_stats_service_1.AutofixStatsService,
            request_volume_service_1.RequestVolumeService,
            agent_usage_daily_service_1.AgentUsageDailyService,
        ],
        exports: [
            analytics_scope_service_1.AnalyticsScopeService,
            specificity_feedback_service_1.SpecificityFeedbackService,
            provider_usage_service_1.ProviderUsageService,
            agent_lifecycle_service_1.AgentLifecycleService,
            timeseries_queries_service_1.TimeseriesQueriesService,
            messages_query_service_1.MessagesQueryService,
            autofix_stats_service_1.AutofixStatsService,
        ],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map