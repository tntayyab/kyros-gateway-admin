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
exports.AutofixStatsService = exports.AUTOFIX_TS_DIMENSIONS = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../../entities/agent.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_entity_1 = require("../../entities/request.entity");
const autofix_service_1 = require("../../routing/autofix/autofix.service");
const install_metadata_entity_1 = require("../../entities/install-metadata.entity");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const uuid_1 = require("uuid");
const range_util_1 = require("../../common/utils/range.util");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const query_helpers_1 = require("./query-helpers");
const request_volume_service_1 = require("./request-volume.service");
exports.AUTOFIX_TS_DIMENSIONS = [
    'disposition',
    'http_status',
    'provider',
    'error_kind',
    'autofix',
];
let AutofixStatsService = class AutofixStatsService {
    agentRepo;
    messageRepo;
    installMetadataRepo;
    autofix;
    requestVolume;
    constructor(agentRepo, messageRepo, installMetadataRepo, autofix, requestVolume) {
        this.agentRepo = agentRepo;
        this.messageRepo = messageRepo;
        this.installMetadataRepo = installMetadataRepo;
        this.autofix = autofix;
        this.requestVolume = requestVolume;
    }
    async getWorkspaceStatus(tenantId) {
        if (!tenantId) {
            return {
                any_enabled: false,
                enabled_agents: [],
                disabled_agents: [],
                needs_enable_all: false,
                consented: await this.hasConsent(),
            };
        }
        const agents = await this.agentRepo.find({
            where: { tenant_id: tenantId, deleted_at: (0, typeorm_2.IsNull)(), is_playground: false },
            select: ['name', 'autofix_enabled'],
        });
        const enabledAgents = [];
        const disabledAgents = [];
        for (const agent of agents) {
            (this.autofix.resolveEnabled(agent.autofix_enabled) ? enabledAgents : disabledAgents).push(agent.name);
        }
        const consented = await this.hasConsent();
        return {
            any_enabled: enabledAgents.length > 0,
            enabled_agents: enabledAgents,
            disabled_agents: disabledAgents,
            needs_enable_all: enabledAgents.length === 0 &&
                !consented &&
                agents.some((agent) => agent.autofix_enabled == null),
            consented,
        };
    }
    async enableAll(tenantId) {
        await this.agentRepo.update({ tenant_id: tenantId, is_playground: false, deleted_at: (0, typeorm_2.IsNull)() }, { autofix_enabled: true });
        await this.recordAutofixConsent();
        return this.getWorkspaceStatus(tenantId);
    }
    async hasConsent() {
        if (!(0, detect_self_hosted_1.isSelfHosted)())
            return true;
        const row = await this.installMetadataRepo.findOne({ where: { id: 'singleton' } });
        return row?.autofix_consented_at != null;
    }
    async recordAutofixConsent() {
        if (!(0, detect_self_hosted_1.isSelfHosted)())
            return;
        if (await this.hasConsent())
            return;
        await this.installMetadataRepo
            .createQueryBuilder()
            .insert()
            .into(install_metadata_entity_1.InstallMetadata)
            .values({
            id: 'singleton',
            install_id: (0, uuid_1.v4)(),
            autofix_consented_at: new Date().toISOString(),
        })
            .orUpdate(['autofix_consented_at'], ['id'])
            .execute();
    }
    async getStats(params) {
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const prevCutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToPreviousInterval)(range));
        const [windows, attention] = await Promise.all([
            this.requestVolume.getDispositionTotalsForWindows({
                tenantId: params.tenantId,
                from: prevCutoff,
                splitAt: cutoff,
                to: (0, postgres_sql_1.computeCutoff)('0 hours'),
                agentScope: params.agentScope,
            }),
            this.queryNeedsAttention(cutoff, params.tenantId, params.agentScope),
        ]);
        const current = this.windowCounts(windows.current);
        const previous = this.windowCounts(windows.previous);
        const rate = (c) => (c.total > 0 ? c.successes / c.total : 0);
        const afxTotal = (c) => c.healed + c.no_fix_found + c.resolving + c.ineffective;
        const covRate = (c) => {
            const d = afxTotal(c);
            return d > 0 ? c.healed / d : 0;
        };
        return {
            success_rate: { value: rate(current), previous: rate(previous) },
            autofix_saves: { value: current.saves, previous: previous.saves },
            fallback_saves: { value: current.fallback_saves, previous: previous.fallback_saves },
            total_requests: { value: current.total, previous: previous.total },
            errors_remaining: { value: current.errors, previous: previous.errors },
            coverage: { rate: covRate(current), previous_rate: covRate(previous) },
            dispositions: {
                healed: current.healed,
                no_fix_found: current.no_fix_found,
                resolving: current.resolving,
                ineffective: current.ineffective,
            },
            needs_attention: attention,
        };
    }
    async getPerProviderStats(params) {
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const providerExpr = "CASE WHEN at.provider LIKE 'custom:%' THEN 'custom' ELSE at.provider END";
        const authExpr = "COALESCE(at.auth_type, 'api_key')";
        const labelExpr = "COALESCE(at.provider_key_label, 'Default')";
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select(providerExpr, 'provider')
            .addSelect(authExpr, 'auth_type')
            .addSelect(labelExpr, 'key_label')
            .addSelect('COUNT(*)', 'attempts')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'succeeded')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsFailedStatus)('at.status')})`, 'failed')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
            .groupBy(providerExpr)
            .addGroupBy(authExpr)
            .addGroupBy(labelExpr);
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = await qb.getRawMany();
        return rows.map((r) => ({
            provider: r.provider,
            auth_type: r.auth_type,
            key_label: r.key_label,
            attempts: Number(r.attempts),
            failed: Number(r.failed),
            succeeded: Number(r.succeeded),
        }));
    }
    async getPerAgentStats(params) {
        const volume = await this.requestVolume.getVolumeByDimension('agent_name', params);
        return volume.map((v) => ({
            agent_name: v.key,
            requests: v.requests,
            failed: v.failed,
            autofixed: v.healed,
            fallback_saves: v.fallback,
            succeeded: v.succeeded,
        }));
    }
    async getPerModelStats(params) {
        const range = params.range ?? '7d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select('at.model', 'model')
            .addSelect('COUNT(*)', 'attempts')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'succeeded')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsFailedStatus)('at.status')})`, 'failed')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
            .andWhere('at.model IS NOT NULL')
            .groupBy('at.model');
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = await qb.getRawMany();
        return rows.map((r) => ({
            model: r.model,
            attempts: Number(r.attempts),
            failed: Number(r.failed),
            succeeded: Number(r.succeeded),
        }));
    }
    async getTimeseries(params) {
        const range = params.range ?? '7d';
        const by = exports.AUTOFIX_TS_DIMENSIONS.includes(params.by ?? '')
            ? params.by
            : 'disposition';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const hourly = (0, range_util_1.isHourlyRange)(range);
        if (by === 'disposition') {
            const rows = await this.requestVolume.getDispositionTimeseries({
                tenantId: params.tenantId,
                range,
                hourly,
                agentScope: params.agentScope,
                failedOnly: params.failedOnly,
            });
            return this.pivotTimeseries(range, by, rows);
        }
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const dimExpr = this.dimensionExpr(by);
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select(bucketExpr, 'bucket')
            .addSelect(dimExpr, 'dim')
            .addSelect('COUNT(*)', 'count')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
            .andWhere("(at.autofix_role IS NULL OR at.autofix_role != 'retry')");
        if (params.failedOnly) {
            qb.andWhere((0, query_helpers_1.sqlIsFailedStatus)('at.status'));
        }
        qb.groupBy(bucketExpr).addGroupBy(dimExpr).orderBy(bucketExpr, 'ASC');
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = await qb.getRawMany();
        return this.pivotTimeseries(range, by, rows);
    }
    dimensionExpr(by) {
        switch (by) {
            case 'disposition':
                return `CASE
          WHEN at.status = 'auto_fixed' THEN 'healed'
          WHEN at.status IN ('error','fallback_error','rate_limited') THEN 'error'
          WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')} AND at.fallback_from_model IS NOT NULL THEN 'fallback'
          ELSE 'success' END`;
            case 'http_status':
                return `CASE WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')} THEN '200'
          ELSE COALESCE(at.error_http_status::text, 'No response') END`;
            case 'provider':
                return `CASE WHEN at.provider LIKE 'custom:%' THEN 'custom' ELSE at.provider END`;
            case 'error_kind':
                return `COALESCE(at.error_class, 'none')`;
            case 'autofix':
                return `CASE WHEN at.autofix_applied = true THEN 'auto-fixed' ELSE 'not fixed' END`;
        }
    }
    pivotTimeseries(range, by, rows) {
        const keySet = new Set();
        const bucketMap = new Map();
        for (const r of rows) {
            const dim = r.dim ?? 'unknown';
            keySet.add(dim);
            let m = bucketMap.get(r.bucket);
            if (!m) {
                m = new Map();
                bucketMap.set(r.bucket, m);
            }
            m.set(dim, (m.get(dim) ?? 0) + Number(r.count));
        }
        const DISPOSITION_ORDER = {
            success: 0,
            autofix: 1,
            fallback: 2,
            error: 3,
        };
        const keys = by === 'disposition'
            ? [...keySet].sort((a, b) => (DISPOSITION_ORDER[a] ?? 99) - (DISPOSITION_ORDER[b] ?? 99))
            : [...keySet].sort();
        const buckets = [...bucketMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([bucket, m]) => ({
            bucket,
            counts: keys.map((k) => m.get(k) ?? 0),
        }));
        return { range, by, keys, buckets };
    }
    windowCounts(t) {
        return {
            total: t.total,
            successes: t.success + t.healed + t.fallback,
            saves: t.healed,
            fallback_saves: t.fallback,
            errors: t.error,
            healed: t.healed,
            no_fix_found: t.error,
            resolving: 0,
            ineffective: 0,
        };
    }
    async queryNeedsAttention(cutoff, tenantId, agentScope) {
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .leftJoin(request_entity_1.ManifestRequest, 'r', 'r.id = at.request_id')
            .select('LEFT(at.error_message, 200)', 'error_message')
            .addSelect('at.provider', 'provider')
            .addSelect('at.model', 'model')
            .addSelect('COUNT(*)', 'count')
            .addSelect("(at.autofix_phoenix->>'issueId')::text", 'phoenix_issue_id')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere("(at.autofix_role = 'original' OR at.status = 'auto_fixed')")
            .andWhere((0, query_helpers_1.sqlIsFailedStatus)('at.status'))
            .andWhere("(r.autofix_status IS NULL OR r.autofix_status <> 'retry_succeeded')")
            .andWhere(`(r.id IS NOT NULL OR NOT EXISTS (
          SELECT 1 FROM agent_messages sib
          WHERE sib.autofix_group_id = at.autofix_group_id
            AND sib.tenant_id = at.tenant_id
            AND sib.autofix_role = 'retry'
            AND ${(0, query_helpers_1.sqlIsSuccessStatus)('sib.status')}
        ))`)
            .groupBy('LEFT(at.error_message, 200)')
            .addGroupBy('at.provider')
            .addGroupBy('at.model')
            .addGroupBy("(at.autofix_phoenix->>'issueId')::text")
            .orderBy('count', 'DESC')
            .limit(5);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = await qb.getRawMany();
        return rows.map((r) => ({
            error_message: r.error_message ?? '',
            provider: r.provider,
            model: r.model,
            count: Number(r.count),
            phoenix_issue_id: r.phoenix_issue_id ?? null,
        }));
    }
};
exports.AutofixStatsService = AutofixStatsService;
exports.AutofixStatsService = AutofixStatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(install_metadata_entity_1.InstallMetadata)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        autofix_service_1.AutofixService,
        request_volume_service_1.RequestVolumeService])
], AutofixStatsService);
//# sourceMappingURL=autofix-stats.service.js.map