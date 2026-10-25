"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const setup_1 = require("@sentry/nestjs/setup");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const app_config_1 = require("./config/app.config");
const frontend_path_1 = require("./common/utils/frontend-path");
const cache_constants_1 = require("./common/constants/cache.constants");
const dashboard_cache_factory_1 = require("./common/cache/dashboard-cache.factory");
const api_key_guard_1 = require("./common/guards/api-key.guard");
const api_key_entity_1 = require("./entities/api-key.entity");
const session_guard_1 = require("./auth/session.guard");
const database_module_1 = require("./database/database.module");
const backfill_module_1 = require("./database/backfills/backfill.module");
const auth_module_1 = require("./auth/auth.module");
const health_module_1 = require("./health/health.module");
const analytics_module_1 = require("./analytics/analytics.module");
const otlp_module_1 = require("./otlp/otlp.module");
const model_prices_module_1 = require("./model-prices/model-prices.module");
const notifications_module_1 = require("./notifications/notifications.module");
const routing_module_1 = require("./routing/routing.module");
const playground_module_1 = require("./playground/playground.module");
const common_module_1 = require("./common/common.module");
const sse_module_1 = require("./sse/sse.module");
const github_module_1 = require("./github/github.module");
const services_contact_module_1 = require("./services-contact/services-contact.module");
const version_module_1 = require("./version/version.module");
const error_pages_module_1 = require("./error-pages/error-pages.module");
const setup_module_1 = require("./setup/setup.module");
const free_models_module_1 = require("./free-models/free-models.module");
const telemetry_module_1 = require("./telemetry/telemetry.module");
const waitlist_module_1 = require("./waitlist/waitlist.module");
const billing_module_1 = require("./billing/billing.module");
const discovery_module_1 = require("./discovery/discovery.module");
const crm_metrics_module_1 = require("./crm-metrics/crm-metrics.module");
const mcp_module_1 = require("./mcp/mcp.module");
const mcp_availability_1 = require("./auth/mcp-availability");
const detect_self_hosted_1 = require("./common/utils/detect-self-hosted");
const debug_sentry_controller_1 = require("./sentry/debug-sentry.controller");
const frontendPath = (0, frontend_path_1.resolveFrontendDir)();
const ONE_YEAR_S = 365 * 24 * 60 * 60;
const serveStaticImports = frontendPath
    ? [
        serve_static_1.ServeStaticModule.forRoot({
            rootPath: frontendPath,
            renderPath: '/__serve_static_never_match',
            exclude: ['/api/{*path}', '/v1/{*path}'],
            serveStaticOptions: {
                maxAge: ONE_YEAR_S * 1000,
                immutable: true,
                setHeaders: (res, path) => {
                    if (path.endsWith('.html') || path.endsWith('/index.html')) {
                        res.setHeader('Cache-Control', 'no-cache');
                    }
                },
            },
        }),
    ]
    : [];
const sentryEnabled = Boolean(process.env['SENTRY_DSN']?.trim());
const sentryImports = sentryEnabled ? [setup_1.SentryModule.forRoot()] : [];
const sentryProviders = sentryEnabled
    ? [{ provide: core_1.APP_FILTER, useClass: setup_1.SentryGlobalFilter }]
    : [];
const sentryDebugControllers = sentryEnabled && process.env['NODE_ENV'] !== 'production' ? [debug_sentry_controller_1.DebugSentryController] : [];
const crmMetricsImports = (0, detect_self_hosted_1.isSelfHosted)() ? [] : [crm_metrics_module_1.CrmMetricsModule];
const mcpImports = (0, mcp_availability_1.mcpAvailability)().enabled ? [mcp_module_1.McpModule] : [];
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...sentryImports,
            config_1.ConfigModule.forRoot({ isGlobal: true, load: [app_config_1.appConfig] }),
            cache_manager_1.CacheModule.register({
                isGlobal: true,
                ttl: cache_constants_1.DASHBOARD_CACHE_TTL_MS,
                stores: [(0, dashboard_cache_factory_1.buildDashboardCacheStore)()],
            }),
            ...serveStaticImports,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: Number(process.env['THROTTLE_TTL'] ?? 60000),
                    limit: Number(process.env['THROTTLE_LIMIT'] ?? 100),
                },
            ]),
            common_module_1.CommonModule,
            database_module_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forFeature([api_key_entity_1.ApiKey]),
            auth_module_1.AuthModule,
            health_module_1.HealthModule,
            analytics_module_1.AnalyticsModule,
            otlp_module_1.OtlpModule,
            model_prices_module_1.ModelPricesModule,
            notifications_module_1.NotificationsModule,
            routing_module_1.RoutingModule,
            playground_module_1.PlaygroundModule,
            sse_module_1.SseModule,
            github_module_1.GithubModule,
            services_contact_module_1.ServicesContactModule,
            version_module_1.VersionModule,
            error_pages_module_1.ErrorPagesModule,
            setup_module_1.SetupModule,
            free_models_module_1.FreeModelsModule,
            telemetry_module_1.TelemetryModule,
            backfill_module_1.BackfillModule,
            waitlist_module_1.WaitlistModule,
            billing_module_1.BillingModule,
            discovery_module_1.DiscoveryModule,
            ...mcpImports,
            ...crmMetricsImports,
        ],
        providers: [
            ...sentryProviders,
            { provide: core_1.APP_GUARD, useClass: session_guard_1.SessionGuard },
            { provide: core_1.APP_GUARD, useClass: api_key_guard_1.ApiKeyGuard },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
        controllers: [...sentryDebugControllers],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map