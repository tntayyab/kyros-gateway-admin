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
var DatabaseSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSeederService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_instance_1 = require("../auth/auth.instance");
const tenant_entity_1 = require("../entities/tenant.entity");
const agent_entity_1 = require("../entities/agent.entity");
const agent_api_key_entity_1 = require("../entities/agent-api-key.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../entities/agent-enabled-provider.entity");
const tier_assignment_entity_1 = require("../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../entities/specificity-assignment.entity");
const hash_util_1 = require("../common/utils/hash.util");
const request_recording_storage_service_1 = require("../common/services/request-recording-storage.service");
const request_recording_codec_1 = require("../common/utils/request-recording-codec");
const seed_messages_1 = require("./seed-messages");
const seed_cohorts_1 = require("./seed-cohorts");
const SEED_API_KEY = 'dev-api-key-manifest-001';
const SEED_OTLP_KEY = 'mnfst_dev-otlp-key-001';
const SEED_TENANT_ID = 'seed-tenant-001';
const SEED_AGENT_ID = 'seed-agent-001';
const SEED_RECORDED_REQUEST_ID = 'seed-req-recording-001';
const SEED_RECORDED_ATTEMPT_ID = 'seed-msg-recording-001';
const SEED_RECORDED_TRACE_ID = 'seed-trace-recording-001';
const SEED_RECORDED_SESSION_KEY = 'sess-recording-preview';
const SEED_RECORDED_MODEL = 'gpt-4o-mini';
const SEED_ATTEMPT_RECORDING = {
    version: 1,
    wire_format: 'openai_chat_completions',
    request_body: {
        model: SEED_RECORDED_MODEL,
        messages: [
            {
                role: 'system',
                content: 'You are a concise travel assistant. Use tools when they are helpful.',
            },
            {
                role: 'user',
                content: 'Should I bring an umbrella for an evening walk in Paris?',
            },
            {
                role: 'assistant',
                content: null,
                tool_calls: [
                    {
                        id: 'call_weather_paris',
                        type: 'function',
                        function: {
                            name: 'get_weather',
                            arguments: '{"city":"Paris","unit":"celsius"}',
                        },
                    },
                ],
            },
            {
                role: 'tool',
                tool_call_id: 'call_weather_paris',
                content: '{"temperature":18,"condition":"light rain","precipitation_chance":70}',
            },
        ],
        tools: [
            {
                type: 'function',
                function: {
                    name: 'get_weather',
                    description: 'Get the current weather for a city.',
                    parameters: {
                        type: 'object',
                        properties: {
                            city: { type: 'string' },
                            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
                        },
                        required: ['city'],
                    },
                },
            },
        ],
        tool_choice: 'auto',
        temperature: 0.2,
        stream: false,
    },
    response_body: {
        type: 'json',
        body: {
            id: 'chatcmpl-seed-recording-001',
            object: 'chat.completion',
            created: 1_753_700_000,
            model: SEED_RECORDED_MODEL,
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: 'Yes. Light rain is likely this evening, so bring a compact umbrella for your walk.',
                    },
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: 124,
                completion_tokens: 22,
                total_tokens: 146,
            },
        },
    },
};
let DatabaseSeederService = DatabaseSeederService_1 = class DatabaseSeederService {
    dataSource;
    configService;
    tenantRepo;
    agentRepo;
    agentKeyRepo;
    apiKeyRepo;
    messageRepo;
    requestRepo;
    providerRepo;
    enabledProviderRepo;
    tierRepo;
    specificityRepo;
    recordingStorage;
    logger = new common_1.Logger(DatabaseSeederService_1.name);
    constructor(dataSource, configService, tenantRepo, agentRepo, agentKeyRepo, apiKeyRepo, messageRepo, requestRepo, providerRepo, enabledProviderRepo, tierRepo, specificityRepo, recordingStorage) {
        this.dataSource = dataSource;
        this.configService = configService;
        this.tenantRepo = tenantRepo;
        this.agentRepo = agentRepo;
        this.agentKeyRepo = agentKeyRepo;
        this.apiKeyRepo = apiKeyRepo;
        this.messageRepo = messageRepo;
        this.requestRepo = requestRepo;
        this.providerRepo = providerRepo;
        this.enabledProviderRepo = enabledProviderRepo;
        this.tierRepo = tierRepo;
        this.specificityRepo = specificityRepo;
        this.recordingStorage = recordingStorage;
    }
    async onModuleInit() {
        await this.runBetterAuthMigrations();
        const seedData = this.configService.get('SEED_DATA');
        if (seedData !== 'true')
            return;
        const nodeEnv = this.configService.get('app.nodeEnv', 'development');
        if (nodeEnv === 'production') {
            this.logger.warn('SEED_DATA=true is ignored in production — use the first-run setup wizard at /setup to create the admin account. Demo data is not seeded in production.');
            return;
        }
        try {
            await this.seedAdminUser();
            await this.seedTenantAndAgent();
            await this.seedApiKey();
            await this.seedTenantProviders();
            await this.seedAgentMessages();
            await this.seedDemoCohorts();
            await this.seedRecordedRequest();
            this.logger.log('Seeded demo data (SEED_DATA=true, dev/test only)');
            this.logger.warn('SECURITY: Default seed credentials are active (admin@manifest.build). Do NOT use in production.');
        }
        catch (err) {
            this.logger.error(`Demo data seeding failed (SEED_DATA=true, dev/test only) — continuing boot without it: ${err instanceof Error ? err.message : err}`);
        }
    }
    async runBetterAuthMigrations() {
        const ctx = await auth_instance_1.auth.$context;
        await ctx.runMigrations();
    }
    async seedAdminUser() {
        const existing = await this.checkBetterAuthUser('admin@manifest.build');
        if (existing)
            return;
        await auth_instance_1.auth.api.signUpEmail({
            body: {
                email: 'admin@manifest.build',
                password: 'manifest',
                name: 'Admin',
            },
        });
        await this.dataSource.query(`UPDATE "user" SET "emailVerified" = true WHERE email = $1`, [
            'admin@manifest.build',
        ]);
    }
    async checkBetterAuthUser(email) {
        try {
            const rows = await this.dataSource.query(`SELECT id FROM "user" WHERE email = $1`, [email]);
            return rows.length > 0;
        }
        catch (err) {
            this.logger.warn(`Failed to check Better Auth user: ${err instanceof Error ? err.message : err}`);
            return false;
        }
    }
    async seedApiKey() {
        const count = await this.apiKeyRepo.count({ where: { id: 'seed-api-key-001' } });
        if (count > 0)
            return;
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        await this.apiKeyRepo.insert({
            id: 'seed-api-key-001',
            key: null,
            key_hash: (0, hash_util_1.hashKey)(SEED_API_KEY),
            key_prefix: (0, hash_util_1.keyPrefix)(SEED_API_KEY),
            tenant_id: SEED_TENANT_ID,
            created_by_user_id: userId,
            name: 'Development API Key',
        });
    }
    async getAdminUserId() {
        try {
            const rows = await this.dataSource.query(`SELECT id FROM "user" WHERE email = $1`, [
                'admin@manifest.build',
            ]);
            return rows.length > 0 ? String(rows[0].id) : null;
        }
        catch (err) {
            this.logger.warn(`Failed to get admin user ID: ${err instanceof Error ? err.message : err}`);
            return null;
        }
    }
    async seedTenantAndAgent() {
        const count = await this.tenantRepo.count({ where: { id: SEED_TENANT_ID } });
        if (count > 0)
            return;
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        await this.tenantRepo.insert({
            id: SEED_TENANT_ID,
            name: userId,
            owner_user_id: userId,
            organization_name: 'Demo Organization',
            email: 'admin@manifest.build',
            is_active: true,
        });
        await this.agentRepo.insert({
            id: SEED_AGENT_ID,
            name: 'demo-agent',
            description: 'Default development agent',
            agent_category: 'personal',
            agent_platform: 'openclaw',
            is_active: true,
            record_messages: true,
            tenant_id: SEED_TENANT_ID,
        });
        await this.agentKeyRepo.insert({
            id: 'seed-otlp-key-001',
            key: null,
            key_hash: (0, hash_util_1.hashKey)(SEED_OTLP_KEY),
            key_prefix: (0, hash_util_1.keyPrefix)(SEED_OTLP_KEY),
            label: 'Demo OTLP ingest key',
            tenant_id: SEED_TENANT_ID,
            agent_id: SEED_AGENT_ID,
            is_active: true,
        });
        this.logger.log(`Seeded tenant/agent with OTLP key: ${SEED_OTLP_KEY.substring(0, 8)}***`);
    }
    async seedTenantProviders() {
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        const connections = (0, seed_messages_1.getSeedConnections)();
        let created = 0;
        for (const conn of connections) {
            const existing = await this.providerRepo.findOne({ where: { id: conn.id } });
            if (existing)
                continue;
            await this.providerRepo.insert({
                id: conn.id,
                tenant_id: SEED_TENANT_ID,
                created_by_user_id: userId,
                provider: conn.provider,
                auth_type: conn.auth_type,
                label: 'Default',
                priority: 0,
                is_active: true,
            });
            created++;
        }
        if (created > 0)
            this.logger.log(`Seeded ${created} provider connection(s)`);
    }
    async seedAgentMessages() {
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        await (0, seed_messages_1.seedAgentMessages)(this.messageRepo, userId, this.logger, undefined, this.requestRepo);
    }
    async seedDemoCohorts() {
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        await (0, seed_cohorts_1.seedRoutingCohorts)({
            dataSource: this.dataSource,
            tenantRepo: this.tenantRepo,
            agentRepo: this.agentRepo,
            agentKeyRepo: this.agentKeyRepo,
            providerRepo: this.providerRepo,
            enabledProviderRepo: this.enabledProviderRepo,
            tierRepo: this.tierRepo,
            specificityRepo: this.specificityRepo,
            logger: this.logger,
            cleanAgentId: SEED_AGENT_ID,
        });
    }
    async seedRecordedRequest() {
        if (!this.recordingStorage.backend) {
            this.logger.warn('Skipped recorded request preview because recording storage is unavailable');
            return;
        }
        const userId = await this.getAdminUserId();
        if (!userId)
            return;
        const timestamp = new Date().toISOString();
        const existingRequest = await this.requestRepo.findOne({
            where: { id: SEED_RECORDED_REQUEST_ID },
        });
        if (!existingRequest) {
            await this.requestRepo.insert({
                id: SEED_RECORDED_REQUEST_ID,
                tenant_id: SEED_TENANT_ID,
                agent_id: SEED_AGENT_ID,
                user_id: userId,
                agent_name: 'demo-agent',
                trace_id: SEED_RECORDED_TRACE_ID,
                session_key: SEED_RECORDED_SESSION_KEY,
                timestamp,
                duration_ms: 842,
                status: 'success',
                requested_model: 'auto',
                request_params: { temperature: 0.2, tool_choice: 'auto' },
            });
        }
        const existingAttempt = await this.messageRepo.findOne({
            where: { id: SEED_RECORDED_ATTEMPT_ID },
        });
        if (!existingAttempt) {
            await this.messageRepo.insert({
                id: SEED_RECORDED_ATTEMPT_ID,
                request_id: SEED_RECORDED_REQUEST_ID,
                attempt_number: 1,
                recording_key: null,
                tenant_id: SEED_TENANT_ID,
                agent_id: SEED_AGENT_ID,
                user_id: userId,
                agent_name: 'demo-agent',
                trace_id: SEED_RECORDED_TRACE_ID,
                session_key: SEED_RECORDED_SESSION_KEY,
                timestamp,
                duration_ms: 842,
                input_tokens: 124,
                output_tokens: 22,
                cache_read_tokens: 0,
                cache_creation_tokens: 0,
                cost_usd: 0.0000318,
                status: 'ok',
                model: SEED_RECORDED_MODEL,
                provider: 'openai',
                auth_type: 'api_key',
                tenant_provider_id: (0, seed_messages_1.seedConnectionId)('openai', 'api_key'),
                routing_tier: 'default',
                routing_reason: 'default',
            });
        }
        const storageKey = this.recordingStorage.objectKey(SEED_TENANT_ID, SEED_RECORDED_REQUEST_ID, SEED_RECORDED_ATTEMPT_ID);
        await this.recordingStorage.put(storageKey, await (0, request_recording_codec_1.encodeRequestRecording)(SEED_ATTEMPT_RECORDING));
        await this.messageRepo.update({
            id: SEED_RECORDED_ATTEMPT_ID,
            tenant_id: SEED_TENANT_ID,
            request_id: SEED_RECORDED_REQUEST_ID,
        }, { recording_key: storageKey });
        this.logger.log(`Seeded recorded request preview with ${SEED_RECORDED_MODEL}`);
    }
};
exports.DatabaseSeederService = DatabaseSeederService;
exports.DatabaseSeederService = DatabaseSeederService = DatabaseSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(3, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(4, (0, typeorm_1.InjectRepository)(agent_api_key_entity_1.AgentApiKey)),
    __param(5, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __param(6, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(7, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(8, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(9, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __param(10, (0, typeorm_1.InjectRepository)(tier_assignment_entity_1.TierAssignment)),
    __param(11, (0, typeorm_1.InjectRepository)(specificity_assignment_entity_1.SpecificityAssignment)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        request_recording_storage_service_1.RequestRecordingStorageService])
], DatabaseSeederService);
//# sourceMappingURL=database-seeder.service.js.map