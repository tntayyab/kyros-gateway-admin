"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const data_source_definitions_1 = require("./data-source-definitions");
const tenant_entity_1 = require("../entities/tenant.entity");
const agent_entity_1 = require("../entities/agent.entity");
const agent_api_key_entity_1 = require("../entities/agent-api-key.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const custom_provider_entity_1 = require("../entities/custom-provider.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const header_tier_entity_1 = require("../entities/header-tier.entity");
const agent_model_params_entity_1 = require("../entities/agent-model-params.entity");
const reasoning_content_cache_entry_entity_1 = require("../entities/reasoning-content-cache-entry.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const database_seeder_service_1 = require("./database-seeder.service");
const db_tuning_service_1 = require("./db-tuning.service");
const model_prices_module_1 = require("../model-prices/model-prices.module");
const db_retry_1 = require("../common/utils/db-retry");
const request_recording_retention_service_1 = require("./request-recording-retention.service");
const secret_reencryption_service_1 = require("./secret-reencryption.service");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('app.databaseUrl'),
                    entities: data_source_definitions_1.entities,
                    synchronize: false,
                    migrationsRun: config.get('app.runMigrationsOnBoot'),
                    migrationsTransactionMode: 'each',
                    migrations: data_source_definitions_1.migrations,
                    toRetry: db_retry_1.shouldRetryDbConnection,
                    logging: false,
                    extra: {
                        max: config.get('app.dbPoolMax'),
                        idleTimeoutMillis: 30000,
                    },
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([
                tenant_entity_1.Tenant,
                agent_entity_1.Agent,
                agent_api_key_entity_1.AgentApiKey,
                agent_message_entity_1.AgentMessage,
                request_entity_1.ManifestRequest,
                api_key_entity_1.ApiKey,
                tenant_provider_entity_1.TenantProvider,
                tier_assignment_entity_1.TierAssignment,
                custom_provider_entity_1.CustomProvider,
                specificity_assignment_entity_1.SpecificityAssignment,
                header_tier_entity_1.HeaderTier,
                agent_model_params_entity_1.AgentModelParams,
                reasoning_content_cache_entry_entity_1.ReasoningContentCacheEntry,
                agent_enabled_provider_entity_1.AgentEnabledProvider,
            ]),
            model_prices_module_1.ModelPricesModule,
        ],
        providers: [
            database_seeder_service_1.DatabaseSeederService,
            db_tuning_service_1.DbTuningService,
            request_recording_retention_service_1.RequestRecordingRetentionService,
            secret_reencryption_service_1.SecretReencryptionService,
        ],
        exports: [database_seeder_service_1.DatabaseSeederService],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map