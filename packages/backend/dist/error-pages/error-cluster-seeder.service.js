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
var ErrorClusterSeederService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorClusterSeederService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const SPECS = [
    {
        key: 'g429',
        provider: 'gemini',
        http: 429,
        status: 'rate_limited',
        model: 'gemini-2.5-pro',
        tenants: 120,
        rowsPerTenant: 6,
        recovery: 0.74,
        samples: [
            '{ "error": { "code": 429, "message": "You exceeded your current quota, please check your plan and billing details.", "status": "RESOURCE_EXHAUSTED" } }',
            '{ "error": { "code": 429, "message": "Resource has been exhausted (e.g. check quota).", "status": "RESOURCE_EXHAUSTED" } }',
            'Quota exceeded for quota metric "Generate Content API requests per minute".',
        ],
    },
    {
        key: 'or404',
        provider: 'openrouter',
        http: 404,
        status: 'error',
        model: 'anthropic/claude-3.5-sonnet',
        tenants: 80,
        rowsPerTenant: 5,
        recovery: 0.81,
        samples: [
            '{"error":{"message":"No endpoints found for the requested model.","code":404}}',
            '{"error":{"message":"No allowed providers are available for the selected model.","code":404}}',
        ],
    },
    {
        key: 'or402',
        provider: 'openrouter',
        http: 402,
        status: 'error',
        model: 'qwen/qwen3-coder:free',
        tenants: 70,
        rowsPerTenant: 6,
        recovery: 0.88,
        samples: [
            '{"error":{"message":"Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day.","code":402}}',
            '{"error":{"message":"Insufficient credits. Add more credits to continue.","code":402}}',
        ],
    },
    {
        key: 'oa401',
        provider: 'openai',
        http: 401,
        status: 'error',
        model: 'gpt-4o',
        tenants: 55,
        rowsPerTenant: 7,
        recovery: 0.42,
        samples: [
            '{ "error": { "message": "Your authentication token has been invalidated. Please try signing in again.", "type": "invalid_request_error", "code": "invalid_authentication" } }',
            '{ "error": { "message": "Incorrect API key provided.", "type": "invalid_request_error", "code": "invalid_api_key" } }',
        ],
    },
    {
        key: 'ds400',
        provider: 'deepseek',
        http: 400,
        status: 'error',
        model: 'deepseek-reasoner',
        tenants: 48,
        rowsPerTenant: 5,
        recovery: 0.6,
        samples: [
            '{"error":{"message":"The reasoning_content in the thinking mode must be passed.","code":400}}',
            '{"error":{"message":"deepseek-reasoner does not support successive user or assistant messages.","code":400}}',
        ],
    },
    {
        key: 'zai429',
        provider: 'zai',
        http: 429,
        status: 'rate_limited',
        model: 'glm-4.6',
        tenants: 46,
        rowsPerTenant: 4,
        recovery: 0.5,
        samples: [
            '{"error":{"code":"1113","message":"Insufficient balance or no resource package. Please recharge."}}',
        ],
    },
    {
        key: 'g400',
        provider: 'gemini',
        http: 400,
        status: 'error',
        model: 'gemini-2.5-flash',
        tenants: 42,
        rowsPerTenant: 4,
        recovery: 0.66,
        samples: [
            '{ "error": { "code": 400, "message": "Function call is missing a thought_signature in functionCall parts.", "status": "INVALID_ARGUMENT" } }',
            '{ "error": { "code": 400, "message": "Please ensure that function call turns come immediately after a user turn or after a function response turn.", "status": "INVALID_ARGUMENT" } }',
        ],
    },
    {
        key: 'g503',
        provider: 'gemini',
        http: 503,
        status: 'error',
        model: 'gemini-2.5-pro',
        tenants: 40,
        rowsPerTenant: 5,
        recovery: 0.79,
        recentOnly: true,
        samples: [
            '{ "error": { "code": 503, "message": "This model is currently experiencing high demand. Spikes in demand are usually temporary.", "status": "UNAVAILABLE" } }',
            '{ "error": { "code": 503, "message": "The service is currently unavailable.", "status": "UNAVAILABLE" } }',
        ],
    },
    {
        key: 'an400',
        provider: 'anthropic',
        http: 400,
        status: 'error',
        model: 'claude-sonnet-4',
        tenants: 30,
        rowsPerTenant: 5,
        recovery: 0.7,
        samples: [
            '{"type":"error","error":{"type":"invalid_request_error","message":"You are out of extra usage. Add more at claude.ai to keep going."}}',
        ],
    },
];
const DAY_MS = 86400000;
let ErrorClusterSeederService = ErrorClusterSeederService_1 = class ErrorClusterSeederService {
    repo;
    logger = new common_1.Logger(ErrorClusterSeederService_1.name);
    constructor(repo) {
        this.repo = repo;
    }
    async onModuleInit() {
        if (process.env['SEED_DATA'] !== 'true')
            return;
        const existing = await this.repo
            .createQueryBuilder('m')
            .where('m.id LIKE :p', { p: 'seed-err-%' })
            .getCount();
        if (existing > 0)
            return;
        const rows = [];
        const now = Date.now();
        for (const s of SPECS) {
            let made = 0;
            const total = s.tenants * s.rowsPerTenant;
            for (let t = 0; t < s.tenants; t++) {
                for (let r = 0; r < s.rowsPerTenant; r++) {
                    const dayOffset = s.recentOnly ? Math.random() * 2 : Math.pow(Math.random(), 1.6) * 30;
                    const tsMs = now - dayOffset * DAY_MS - Math.random() * DAY_MS;
                    const ts = new Date(tsMs).toISOString();
                    const trace = `seed-err-${s.key}-${t}-${r}`;
                    rows.push({
                        id: trace,
                        tenant_id: `seed-err-${s.key}-t${t}`,
                        agent_id: 'seed-err-agent',
                        trace_id: trace,
                        timestamp: ts,
                        status: (0, manifest_shared_1.normalizeStatus)(s.status),
                        error_message: s.samples[(t + r) % s.samples.length],
                        error_http_status: s.http,
                        provider: s.provider,
                        model: s.model,
                        input_tokens: 0,
                        output_tokens: 0,
                    });
                    if (made / total < s.recovery) {
                        rows.push({
                            id: `${trace}-ok`,
                            tenant_id: `seed-err-${s.key}-t${t}`,
                            agent_id: 'seed-err-agent',
                            trace_id: trace,
                            timestamp: new Date(tsMs + 1500).toISOString(),
                            status: 'success',
                            provider: s.provider,
                            model: s.model,
                            input_tokens: 50,
                            output_tokens: 80,
                        });
                    }
                    made++;
                }
            }
        }
        for (let i = 0; i < rows.length; i += 500) {
            await this.repo.insert(rows.slice(i, i + 500));
        }
        this.logger.log(`Seeded ${rows.length} error/recovery agent_messages across ${SPECS.length} clusters (with message variants)`);
    }
};
exports.ErrorClusterSeederService = ErrorClusterSeederService;
exports.ErrorClusterSeederService = ErrorClusterSeederService = ErrorClusterSeederService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ErrorClusterSeederService);
//# sourceMappingURL=error-cluster-seeder.service.js.map