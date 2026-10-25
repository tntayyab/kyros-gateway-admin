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
var PayloadBuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadBuilderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const providers_1 = require("../common/constants/providers");
const agent_entity_1 = require("../entities/agent.entity");
const api_key_entity_1 = require("../entities/api-key.entity");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const request_entity_1 = require("../entities/request.entity");
const query_helpers_1 = require("../analytics/services/query-helpers");
const cli_auth_service_1 = require("../auth/cli-auth.service");
const telemetry_config_1 = require("./telemetry.config");
const TIER_WHITELIST = new Set([...manifest_shared_1.TIER_SLOTS, ...manifest_shared_1.ALL_TIERS]);
const AUTH_TYPE_WHITELIST = new Set(manifest_shared_1.AUTH_TYPES);
const ERROR_CLASS_WHITELIST = new Set(manifest_shared_1.ERROR_CLASSES);
const MCP_CLIENT_NAME_WHITELIST = new Set([
    'claude-code',
    'claude',
    'claude-desktop',
    'cursor',
    'windsurf',
    'vs-code',
    'visual-studio-code',
    'codex',
    'codex-cli',
    'chatgpt',
    'gemini-cli',
    'cline',
    'zed',
    'goose',
    'opencode',
    'mcp-inspector',
]);
let PayloadBuilderService = PayloadBuilderService_1 = class PayloadBuilderService {
    messages;
    agents;
    requests;
    apiKeys;
    logger = new common_1.Logger(PayloadBuilderService_1.name);
    constructor(messages, agents, requests, apiKeys) {
        this.messages = messages;
        this.agents = agents;
        this.requests = requests;
        this.apiKeys = apiKeys;
    }
    async build(installId, manifestVersion) {
        const [providerRows, tierRows, authRows, totals, agentsTotal, agentPlatformRows, requestCounts, errorClassRows, cliKeys, mcp,] = await Promise.all([
            this.messagesByProvider(),
            this.messagesByBucket('routing_tier'),
            this.messagesByBucket('auth_type'),
            this.totals(),
            this.userAgentsCount(),
            this.agentsByPlatform(),
            this.requestCounts(),
            this.failedRequestsByClass(),
            this.cliKeyCounts(),
            this.mcpAggregates(),
        ]);
        return {
            schema_version: telemetry_config_1.TELEMETRY_SCHEMA_VERSION,
            install_id: installId,
            manifest_version: manifestVersion,
            messages_total: Number(totals.total),
            messages_by_provider: this.collapseProviders(providerRows),
            messages_by_tier: this.bucketsToRecord(tierRows, 'unknown', TIER_WHITELIST),
            messages_by_auth_type: this.bucketsToRecord(authRows, 'unknown', AUTH_TYPE_WHITELIST),
            tokens_input_total: Number(totals.input_tokens ?? 0),
            tokens_output_total: Number(totals.output_tokens ?? 0),
            cost_usd_total: roundCents(Number(totals.cost ?? 0)),
            cost_usd_by_provider: this.collapseProviderCosts(providerRows),
            requests_total: Number(requestCounts.total),
            errors_total: Number(requestCounts.failed ?? 0),
            errors_by_class: this.bucketsToRecord(errorClassRows, 'unknown', ERROR_CLASS_WHITELIST),
            agents_total: agentsTotal,
            agents_by_platform: this.bucketsToRecord(agentPlatformRows, 'unknown'),
            cli_keys_total: cliKeys.total,
            cli_keys_active_7d: cliKeys.active7d,
            mcp_clients_total: mcp.clients_total,
            mcp_consents_total: mcp.consents_total,
            mcp_tokens_issued_24h: mcp.tokens_issued_24h,
            mcp_clients_active_24h: mcp.clients_active_24h,
            mcp_clients_by_name: mcp.clients_by_name,
            platform: process.platform,
            arch: process.arch,
        };
    }
    async messagesByProvider() {
        return this.messages
            .createQueryBuilder('m')
            .select('m.provider', 'provider')
            .addSelect('COUNT(*)', 'count')
            .addSelect('COALESCE(SUM(m.cost_usd), 0)', 'cost')
            .where(`m.timestamp >= NOW() - INTERVAL '24 hours'`)
            .groupBy('m.provider')
            .getRawMany();
    }
    async messagesByBucket(column) {
        return this.messages
            .createQueryBuilder('m')
            .select(`m.${column}`, 'bucket')
            .addSelect('COUNT(*)', 'count')
            .where(`m.timestamp >= NOW() - INTERVAL '24 hours'`)
            .groupBy(`m.${column}`)
            .getRawMany();
    }
    async agentsByPlatform() {
        const rows = await this.agents
            .createQueryBuilder('a')
            .select('a.agent_category', 'category')
            .addSelect('a.agent_platform', 'platform')
            .addSelect('COUNT(*)', 'count')
            .where('a.is_playground = false')
            .groupBy('a.agent_category')
            .addGroupBy('a.agent_platform')
            .getRawMany();
        return rows.map((r) => ({
            bucket: r.platform === 'other' && r.category ? `${r.category}:${r.platform}` : r.platform,
            count: r.count,
        }));
    }
    async userAgentsCount() {
        const result = await this.agents
            .createQueryBuilder('a')
            .select('COUNT(*)', 'count')
            .where('a.is_playground = false')
            .getRawOne();
        return Number(result?.count ?? 0);
    }
    async requestCounts() {
        const row = await this.requests
            .createQueryBuilder('r')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN ${(0, query_helpers_1.sqlIsFailedStatus)('r.status')} THEN 1 ELSE 0 END)`, 'failed')
            .where(`r.timestamp >= NOW() - INTERVAL '24 hours'`)
            .getRawOne();
        return row ?? { total: '0', failed: '0' };
    }
    async failedRequestsByClass() {
        return this.requests
            .createQueryBuilder('r')
            .select('r.error_class', 'bucket')
            .addSelect('COUNT(*)', 'count')
            .where(`r.timestamp >= NOW() - INTERVAL '24 hours'`)
            .andWhere((0, query_helpers_1.sqlIsFailedStatus)('r.status'))
            .groupBy('r.error_class')
            .getRawMany();
    }
    async cliKeyCounts() {
        const row = await this.apiKeys
            .createQueryBuilder('k')
            .select('COUNT(*)', 'total')
            .addSelect(`SUM(CASE WHEN k.last_used_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END)`, 'active')
            .where('k.name = :name', { name: cli_auth_service_1.CLI_KEY_NAME })
            .getRawOne();
        return { total: Number(row?.total ?? 0), active7d: Number(row?.active ?? 0) };
    }
    async mcpAggregates() {
        const empty = {
            clients_total: 0,
            consents_total: 0,
            tokens_issued_24h: 0,
            clients_active_24h: 0,
            clients_by_name: {},
        };
        try {
            const [countRows, nameRows] = await Promise.all([
                this.apiKeys.manager.query(`
          SELECT
            (SELECT COUNT(*) FROM "oauthClient" WHERE "disabled" IS NOT TRUE) AS clients,
            (SELECT COUNT(*) FROM "oauthConsent") AS consents,
            (SELECT COUNT(*) FROM "oauthAccessToken"
              WHERE "createdAt" >= NOW() - INTERVAL '24 hours') AS tokens,
            (SELECT COUNT(DISTINCT "clientId") FROM "oauthAccessToken"
              WHERE "createdAt" >= NOW() - INTERVAL '24 hours') AS active_clients
        `),
                this.apiKeys.manager.query(`
          SELECT "name" AS name, COUNT(*) AS count
          FROM "oauthClient"
          WHERE "disabled" IS NOT TRUE
          GROUP BY "name"
        `),
            ]);
            const counts = countRows[0];
            if (!counts)
                return empty;
            const byName = {};
            for (const row of nameRows) {
                const slug = row.name === null ? null : slugifyClientName(row.name);
                const key = slug === null ? 'unknown' : MCP_CLIENT_NAME_WHITELIST.has(slug) ? slug : 'other';
                byName[key] = (byName[key] ?? 0) + Number(row.count);
            }
            return {
                clients_total: Number(counts.clients),
                consents_total: Number(counts.consents),
                tokens_issued_24h: Number(counts.tokens),
                clients_active_24h: Number(counts.active_clients),
                clients_by_name: byName,
            };
        }
        catch (error) {
            this.logger.debug(`MCP telemetry aggregates unavailable: ${error instanceof Error ? error.message : String(error)}`);
            return empty;
        }
    }
    async totals() {
        const row = await this.messages
            .createQueryBuilder('m')
            .select('COUNT(*)', 'total')
            .addSelect('SUM(m.input_tokens)', 'input_tokens')
            .addSelect('SUM(m.output_tokens)', 'output_tokens')
            .addSelect('COALESCE(SUM(m.cost_usd), 0)', 'cost')
            .where(`m.timestamp >= NOW() - INTERVAL '24 hours'`)
            .getRawOne();
        return row ?? { total: '0', input_tokens: '0', output_tokens: '0', cost: '0' };
    }
    collapseProviders(rows) {
        const out = {};
        for (const row of rows) {
            const bucket = this.bucketFor(row.provider);
            out[bucket] = (out[bucket] ?? 0) + Number(row.count);
        }
        return out;
    }
    collapseProviderCosts(rows) {
        const out = {};
        for (const row of rows) {
            const cost = row.cost == null ? 0 : Number(row.cost);
            if (!Number.isFinite(cost) || cost <= 0)
                continue;
            const bucket = this.bucketFor(row.provider);
            out[bucket] = (out[bucket] ?? 0) + cost;
        }
        for (const key of Object.keys(out)) {
            const rounded = roundCents(out[key]);
            if (rounded === 0)
                delete out[key];
            else
                out[key] = rounded;
        }
        return out;
    }
    bucketFor(provider) {
        if (!provider)
            return 'unknown';
        const entry = providers_1.PROVIDER_BY_ID_OR_ALIAS.get(provider.toLowerCase());
        return entry ? entry.id : 'custom';
    }
    bucketsToRecord(rows, nullLabel, whitelist) {
        const out = {};
        for (const row of rows) {
            let key = row.bucket ?? nullLabel;
            if (whitelist && row.bucket !== null && !whitelist.has(row.bucket)) {
                key = 'other';
            }
            out[key] = (out[key] ?? 0) + Number(row.count);
        }
        return out;
    }
};
exports.PayloadBuilderService = PayloadBuilderService;
exports.PayloadBuilderService = PayloadBuilderService = PayloadBuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(2, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(3, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PayloadBuilderService);
function slugifyClientName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function roundCents(value) {
    if (!Number.isFinite(value))
        return 0;
    return Math.round(value * 100) / 100;
}
//# sourceMappingURL=payload-builder.service.js.map