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
exports.TimeseriesQueriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_volume_service_1 = require("./request-volume.service");
const agent_entity_1 = require("../../entities/agent.entity");
const range_util_1 = require("../../common/utils/range.util");
const query_helpers_1 = require("./query-helpers");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const request_entity_1 = require("../../entities/request.entity");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const agent_usage_daily_service_1 = require("./agent-usage-daily.service");
let TimeseriesQueriesService = class TimeseriesQueriesService {
    turnRepo;
    agentRepo;
    requestRepo;
    requestVolume;
    dataSource;
    agentUsageDaily;
    constructor(turnRepo, agentRepo, requestRepo, requestVolume, dataSource, agentUsageDaily) {
        this.turnRepo = turnRepo;
        this.agentRepo = agentRepo;
        this.requestRepo = requestRepo;
        this.requestVolume = requestVolume;
        this.dataSource = dataSource;
        this.agentUsageDaily = agentUsageDaily;
    }
    async getTimeseries(range, tenantId, hourly, agentScope, authType, provider, excludePlayground = false, label, tenantProviderId, excludeDirect = false) {
        const useDailyRows = !hourly &&
            !!tenantId &&
            excludePlayground &&
            !authType &&
            !provider &&
            !label &&
            !tenantProviderId &&
            this.agentUsageDaily?.supportsRange(tenantId, range);
        if (useDailyRows) {
            const rows = await this.agentUsageDaily.getRangeRows(tenantId, range, {
                agentScope,
                excludeDirect,
            });
            const byDay = new Map();
            for (const row of rows) {
                const current = byDay.get(row.day) ?? {
                    input_tokens: 0,
                    output_tokens: 0,
                    cost: 0,
                    count: 0,
                };
                current.input_tokens += Number(row.input_tokens);
                current.output_tokens += Number(row.output_tokens);
                current.cost += Number(row.cost_usd);
                current.count += Number(row.request_count);
                byDay.set(row.day, current);
            }
            const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));
            return {
                tokenUsage: days.map(([date, row]) => ({
                    date,
                    input_tokens: row.input_tokens,
                    output_tokens: row.output_tokens,
                })),
                costUsage: days.map(([date, row]) => ({ date, cost: row.cost })),
                messageUsage: days.map(([date, row]) => ({ date, count: row.count })),
            };
        }
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('COALESCE(SUM(at.input_tokens), 0)', 'input_tokens')
            .addSelect('COALESCE(SUM(at.output_tokens), 0)', 'output_tokens')
            .addSelect(`COALESCE(SUM(${(0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd')}), 0)`, 'cost')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'count')
            .where('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(qb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        const attemptsQb = qb.groupBy(bucketAlias).orderBy(bucketAlias, 'ASC');
        const useRequestCounts = this.requestRepo && !authType && !provider && !label && !tenantProviderId;
        let requestRowsQb;
        let unlinkedRowsQb;
        if (useRequestCounts) {
            const requestQb = this.requestRepo.createQueryBuilder('r')
                .select(hourly ? (0, postgres_sql_1.sqlHourBucket)('r.timestamp') : (0, postgres_sql_1.sqlDateBucket)('r.timestamp'), bucketAlias)
                .addSelect('COUNT(*)', 'count')
                .where('r.timestamp >= :requestCutoff', { requestCutoff: cutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('r.status'));
            (0, query_helpers_1.addTenantFilter)(requestQb, tenantId, agentScope, 'r');
            if (excludePlayground) {
                requestQb.andWhere((0, query_helpers_1.sqlExcludePlayground)('r'));
            }
            requestRowsQb = requestQb.groupBy(bucketAlias).orderBy(bucketAlias, 'ASC');
            const unlinkedQb = this.turnRepo
                .createQueryBuilder('at')
                .select(bucketExpr, bucketAlias)
                .addSelect('COUNT(*)', 'count')
                .where('at.request_id IS NULL')
                .andWhere('at.timestamp >= :unlinkedCutoff', { unlinkedCutoff: cutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
            (0, query_helpers_1.addTenantFilter)(unlinkedQb, tenantId, agentScope);
            if (excludePlayground)
                (0, query_helpers_1.excludePlaygroundAgents)(unlinkedQb);
            unlinkedRowsQb = unlinkedQb.groupBy(bucketAlias).orderBy(bucketAlias, 'ASC');
        }
        const readCompatibilityRows = async (runner) => {
            if (runner) {
                requestRowsQb?.setQueryRunner(runner);
                unlinkedRowsQb?.setQueryRunner(runner);
            }
            const requestRows = requestRowsQb ? await requestRowsQb.getRawMany() : [];
            const unlinkedRows = unlinkedRowsQb ? await unlinkedRowsQb.getRawMany() : [];
            return [requestRows, unlinkedRows];
        };
        const [rows, [requestRows, unlinkedRows]] = await Promise.all([
            attemptsQb.getRawMany(),
            useRequestCounts
                ? this.withCompatibilitySnapshot(readCompatibilityRows)
                : readCompatibilityRows(),
        ]);
        const tokenUsage = [];
        const costUsage = [];
        const messageUsage = [];
        for (const r of rows) {
            const parsed = this.parseBucketRow(r, bucketAlias);
            const bucketKey = { hour: parsed.hour, date: parsed.date };
            tokenUsage.push({
                ...bucketKey,
                input_tokens: parsed.input_tokens,
                output_tokens: parsed.output_tokens,
            });
            costUsage.push({ ...bucketKey, cost: parsed.cost });
            messageUsage.push({ ...bucketKey, count: parsed.count });
        }
        if (useRequestCounts) {
            const counts = new Map();
            for (const row of [...requestRows, ...unlinkedRows]) {
                const value = String(row[bucketAlias] ?? '');
                counts.set(value, (counts.get(value) ?? 0) + Number(row['count'] ?? 0));
            }
            messageUsage.length = 0;
            for (const [bucket, count] of [...counts].sort(([a], [b]) => a.localeCompare(b))) {
                messageUsage.push(hourly ? { hour: bucket, count } : { date: bucket, count });
            }
        }
        return { tokenUsage, costUsage, messageUsage };
    }
    async getActiveSkills(range, tenantId, agentScope, excludePlayground = false, excludeDirect = false) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select('at.skill_name', 'name')
            .addSelect('MIN(at.agent_name)', 'agent_name')
            .addSelect('COUNT(*)', 'run_count')
            .addSelect('MAX(at.timestamp)', 'last_active_at')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.skill_name IS NOT NULL');
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(qb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        const rows = await qb.groupBy('at.skill_name').orderBy('run_count', 'DESC').getRawMany();
        return rows.map((r) => ({
            name: String(r['name']),
            agent_name: r['agent_name'] ? String(r['agent_name']) : null,
            run_count: Number(r['run_count'] ?? 0),
            last_active_at: String(r['last_active_at']),
            status: 'active',
        }));
    }
    async getRecentActivity(range, tenantId, limit = 5, agentScope, excludePlayground = false, excludeDirect = false) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = (0, query_helpers_1.selectMessageRowColumns)(this.turnRepo.createQueryBuilder('at'), costExpr).where('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(qb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        return qb.orderBy('at.timestamp', 'DESC').limit(limit).getRawMany();
    }
    async getCostByModel(range, tenantId, agentScope, excludePlayground = false, excludeDirect = false) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select("COALESCE(at.model, 'unknown')", 'model')
            .addSelect('at.model', 'display_name')
            .addSelect('SUM(at.input_tokens + at.output_tokens)', 'tokens')
            .addSelect(`COALESCE(SUM(${(0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd')}), 0)`, 'estimated_cost')
            .addSelect('at.auth_type', 'auth_type')
            .addSelect('at.provider', 'provider')
            .addSelect('cp.name', 'custom_provider_name')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.model IS NOT NULL')
            .andWhere("at.model != ''");
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (excludePlayground)
            (0, query_helpers_1.excludePlaygroundAgents)(qb);
        if (excludeDirect)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        const rows = await qb
            .groupBy('at.model')
            .addGroupBy('at.auth_type')
            .addGroupBy('at.provider')
            .addGroupBy('cp.name')
            .orderBy('tokens', 'DESC')
            .getRawMany();
        const totalTokens = rows.reduce((sum, r) => sum + Number(r['tokens'] ?? 0), 0);
        return rows.map((r) => ({
            model: String(r['model']),
            display_name: r['display_name'] ? String(r['display_name']) : String(r['model']),
            tokens: Number(r['tokens'] ?? 0),
            share_pct: totalTokens === 0 ? 0 : Math.round((Number(r['tokens'] ?? 0) / totalTokens) * 1000) / 10,
            estimated_cost: Number(r['estimated_cost'] ?? 0),
            auth_type: r['auth_type'] ? String(r['auth_type']) : null,
            provider: r['provider'] ? String(r['provider']) : null,
            custom_provider_name: r['custom_provider_name'] ? String(r['custom_provider_name']) : null,
        }));
    }
    async getAgentList(tenantId, includePlayground = false) {
        if (tenantId === null)
            return [];
        const agentQb = this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId });
        agentQb.andWhere('a.deleted_at IS NULL');
        if (!includePlayground) {
            agentQb.andWhere('a.is_playground = false');
        }
        agentQb.andWhere('a.is_active = true').orderBy('a.created_at', 'DESC');
        if (this.agentUsageDaily?.readsEnabledFor(tenantId)) {
            const [agents, rows] = await Promise.all([
                agentQb.getMany(),
                this.agentUsageDaily.getRows(tenantId),
            ]);
            return this.foldAgentUsageRows(agents, rows);
        }
        const statsCutoff = (0, postgres_sql_1.computeCutoff)('30 days');
        const sparkCutoff = (0, postgres_sql_1.computeCutoff)('7 days');
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const dateExpr = (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketsQb = this.turnRepo
            .createQueryBuilder('at')
            .select('at.agent_id', 'agent_id')
            .addSelect(dateExpr, 'date')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'message_count')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect(`COALESCE(SUM(at.input_tokens + at.output_tokens) FILTER (WHERE at.timestamp >= :sparkCutoff), 0)`, 'spark_tokens')
            .addSelect('MAX(at.timestamp)', 'last_active')
            .where('at.agent_id IS NOT NULL')
            .andWhere('at.timestamp >= :statsCutoff', { statsCutoff })
            .setParameter('sparkCutoff', sparkCutoff);
        (0, query_helpers_1.addTenantFilter)(bucketsQb, tenantId);
        let requestCountsQb;
        let unlinkedCountsQb;
        if (this.requestRepo) {
            requestCountsQb = this.requestRepo
                .createQueryBuilder('r')
                .select('r.agent_id', 'agent_id')
                .addSelect('COUNT(*)', 'message_count')
                .addSelect('MAX(r.timestamp)', 'last_active')
                .where('r.agent_id IS NOT NULL')
                .andWhere('r.timestamp >= :requestStatsCutoff', { requestStatsCutoff: statsCutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('r.status'));
            requestCountsQb.andWhere('r.tenant_id = :requestTenantId', { requestTenantId: tenantId });
            requestCountsQb.groupBy('r.agent_id');
            unlinkedCountsQb = this.turnRepo
                .createQueryBuilder('at')
                .select('at.agent_id', 'agent_id')
                .addSelect('COUNT(*)', 'message_count')
                .addSelect('MAX(at.timestamp)', 'last_active')
                .where('at.request_id IS NULL')
                .andWhere('at.agent_id IS NOT NULL')
                .andWhere('at.timestamp >= :legacyStatsCutoff', { legacyStatsCutoff: statsCutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'));
            (0, query_helpers_1.addTenantFilter)(unlinkedCountsQb, tenantId);
            unlinkedCountsQb.groupBy('at.agent_id');
        }
        bucketsQb
            .groupBy('at.agent_id')
            .addGroupBy('date')
            .orderBy('at.agent_id', 'ASC')
            .addOrderBy('date', 'ASC');
        const readCompatibilityRows = async (runner) => {
            if (runner) {
                requestCountsQb?.setQueryRunner(runner);
                unlinkedCountsQb?.setQueryRunner(runner);
            }
            const requestCountRows = requestCountsQb ? await requestCountsQb.getRawMany() : [];
            const unlinkedCountRows = unlinkedCountsQb ? await unlinkedCountsQb.getRawMany() : [];
            return [requestCountRows, unlinkedCountRows];
        };
        const [[agents, bucketRows], [requestCountRows, unlinkedCountRows]] = await Promise.all([
            Promise.all([agentQb.getMany(), bucketsQb.getRawMany()]),
            this.requestRepo
                ? this.withCompatibilitySnapshot(readCompatibilityRows)
                : readCompatibilityRows(),
        ]);
        const sparkCutoffIso = String(sparkCutoff);
        const statsMap = new Map();
        const requestStatsMap = new Map();
        for (const r of [...requestCountRows, ...unlinkedCountRows]) {
            const id = String(r['agent_id']);
            const rawLastActive = r['last_active'];
            const lastActive = rawLastActive instanceof Date ? rawLastActive.toISOString() : String(rawLastActive ?? '');
            const existing = requestStatsMap.get(id);
            if (existing) {
                existing.count += Number(r['message_count'] ?? 0);
                if (lastActive > existing.last_active)
                    existing.last_active = lastActive;
            }
            else {
                requestStatsMap.set(id, {
                    count: Number(r['message_count'] ?? 0),
                    last_active: lastActive,
                });
            }
        }
        const sparkMap = new Map();
        for (const r of bucketRows) {
            const id = String(r['agent_id']);
            const messageCount = Number(r['message_count'] ?? 0);
            const cost = Number(r['cost'] ?? 0);
            const tokens = Number(r['tokens'] ?? 0);
            const sparkTokens = Number(r['spark_tokens'] ?? 0);
            const rawLastActive = r['last_active'];
            const lastActive = rawLastActive instanceof Date ? rawLastActive.toISOString() : String(rawLastActive ?? '');
            const existing = statsMap.get(id);
            if (existing) {
                existing.message_count += messageCount;
                existing.total_cost += cost;
                existing.total_tokens += tokens;
                if (lastActive > existing.last_active)
                    existing.last_active = lastActive;
            }
            else {
                statsMap.set(id, {
                    message_count: messageCount,
                    total_cost: cost,
                    total_tokens: tokens,
                    last_active: lastActive,
                });
            }
            if (lastActive >= sparkCutoffIso) {
                if (!sparkMap.has(id))
                    sparkMap.set(id, []);
                sparkMap.get(id).push(sparkTokens);
            }
        }
        return agents.map((a) => {
            const stats = statsMap.get(a.id);
            const requestStats = requestStatsMap.get(a.id);
            return {
                agent_name: a.name,
                display_name: a.display_name ?? a.name,
                agent_category: a.agent_category ?? null,
                agent_platform: a.agent_platform ?? null,
                message_count: requestStats?.count ?? stats?.message_count ?? 0,
                last_active: [requestStats?.last_active, stats?.last_active].filter(Boolean).sort().at(-1) ||
                    String(a.created_at ?? ''),
                total_cost: stats?.total_cost ?? 0,
                total_tokens: stats?.total_tokens ?? 0,
                sparkline: sparkMap.get(a.id) ?? [],
            };
        });
    }
    foldAgentUsageRows(agents, rows) {
        const sparkCutoff = new Date();
        sparkCutoff.setUTCDate(sparkCutoff.getUTCDate() - 6);
        const sparkCutoffDay = sparkCutoff.toISOString().slice(0, 10);
        const stats = new Map();
        for (const row of rows) {
            const lastActive = row.last_active_at instanceof Date
                ? row.last_active_at.toISOString()
                : String(row.last_active_at ?? '');
            const current = stats.get(row.agent_id) ?? {
                message_count: 0,
                total_cost: 0,
                total_tokens: 0,
                last_active: '',
                sparkline: [],
            };
            const tokens = Number(row.input_tokens ?? 0) + Number(row.output_tokens ?? 0);
            current.message_count += Number(row.request_count ?? 0);
            current.total_cost += Number(row.cost_usd ?? 0);
            current.total_tokens += tokens;
            if (lastActive > current.last_active)
                current.last_active = lastActive;
            if (row.day >= sparkCutoffDay)
                current.sparkline.push(tokens);
            stats.set(row.agent_id, current);
        }
        return agents.map((agent) => {
            const usage = stats.get(agent.id);
            return {
                agent_name: agent.name,
                display_name: agent.display_name ?? agent.name,
                agent_category: agent.agent_category ?? null,
                agent_platform: agent.agent_platform ?? null,
                message_count: usage?.message_count ?? 0,
                last_active: usage?.last_active || String(agent.created_at ?? ''),
                total_cost: usage?.total_cost ?? 0,
                total_tokens: usage?.total_tokens ?? 0,
                sparkline: usage?.sparkline ?? [],
            };
        });
    }
    async getPerAgentTimeseries(range, tenantId, hourly, authType, provider, label, tenantProviderId) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.agent_name', 'agent_name')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.agent_name')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'agent_name', 'tokens');
    }
    async getPerAgentMessageTimeseries(range, tenantId, hourly, authType, provider, label, tenantProviderId) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const useRequestCounts = this.requestRepo && !authType && !provider && !label && !tenantProviderId;
        if (useRequestCounts) {
            const requestBucketExpr = hourly
                ? (0, postgres_sql_1.sqlHourBucket)('r.timestamp')
                : (0, postgres_sql_1.sqlDateBucket)('r.timestamp');
            const requestQb = this.requestRepo.createQueryBuilder('r')
                .select(requestBucketExpr, bucketAlias)
                .addSelect('r.agent_name', 'agent_name')
                .addSelect('COUNT(*)', 'messages')
                .where('r.timestamp >= :requestCutoff', { requestCutoff: cutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('r.status'))
                .andWhere('r.agent_name IS NOT NULL')
                .andWhere((0, query_helpers_1.sqlExcludePlayground)('r'));
            if (tenantId)
                requestQb.andWhere('r.tenant_id = :requestTenantId', { requestTenantId: tenantId });
            else
                requestQb.andWhere('1 = 0');
            const unlinkedQb = this.turnRepo
                .createQueryBuilder('at')
                .select(bucketExpr, bucketAlias)
                .addSelect('at.agent_name', 'agent_name')
                .addSelect('COUNT(*)', 'messages')
                .where('at.request_id IS NULL')
                .andWhere('at.timestamp >= :unlinkedCutoff', { unlinkedCutoff: cutoff })
                .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
                .andWhere('at.agent_name IS NOT NULL');
            (0, query_helpers_1.addTenantFilter)(unlinkedQb, tenantId);
            (0, query_helpers_1.excludePlaygroundAgents)(unlinkedQb);
            requestQb.groupBy(bucketAlias).addGroupBy('r.agent_name').orderBy(bucketAlias, 'ASC');
            unlinkedQb.groupBy(bucketAlias).addGroupBy('at.agent_name').orderBy(bucketAlias, 'ASC');
            const [requestRows, unlinkedRows] = await this.withCompatibilitySnapshot(async (runner) => {
                if (runner) {
                    requestQb.setQueryRunner(runner);
                    unlinkedQb.setQueryRunner(runner);
                }
                const requestRows = await requestQb.getRawMany();
                const unlinkedRows = await unlinkedQb.getRawMany();
                return [requestRows, unlinkedRows];
            });
            const combined = new Map();
            for (const row of [...requestRows, ...unlinkedRows]) {
                const key = `${String(row[bucketAlias])}\0${String(row['agent_name'])}`;
                const current = combined.get(key);
                if (current)
                    current['messages'] = Number(current['messages']) + Number(row['messages']);
                else
                    combined.set(key, { ...row, messages: Number(row['messages'] ?? 0) });
            }
            const rows = [...combined.values()].sort((a, b) => String(a[bucketAlias]).localeCompare(String(b[bucketAlias])));
            return pivotByKey(rows, bucketAlias, 'agent_name', 'messages');
        }
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.agent_name', 'agent_name')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.agent_name')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'agent_name', 'messages');
    }
    async getPerAgentCostTimeseries(range, tenantId, hourly, authType, provider, label, tenantProviderId) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.agent_name', 'agent_name')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.agent_name')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'agent_name', 'cost');
    }
    async getAgentUsageTimeseries(range, tenantId, hourly, authType, provider, label, tenantProviderId) {
        const useDailyRows = !hourly &&
            !!tenantId &&
            !authType &&
            !provider &&
            !label &&
            !tenantProviderId &&
            this.agentUsageDaily?.supportsRange(tenantId, range);
        if (useDailyRows) {
            const rows = await this.agentUsageDaily.getRangeRows(tenantId, range);
            return pivotUsageRows(rows.map((row) => ({
                date: row.day,
                agent_name: row.agent_name,
                tokens: Number(row.input_tokens) + Number(row.output_tokens),
                messages: Number(row.request_count),
                cost: Number(row.cost_usd),
            })), 'date', 'agent_name');
        }
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.agent_name', 'agent_name')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        if (authType)
            qb.andWhere('at.auth_type = :authType', { authType });
        if (provider)
            qb.andWhere('at.provider = :provider', { provider });
        (0, query_helpers_1.scopeToConnection)(qb, tenantProviderId, label);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.agent_name')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        const usage = pivotUsageRows(rows, bucketAlias, 'agent_name');
        const scoped = authType || provider || label || tenantProviderId;
        if (this.requestVolume && !scoped) {
            const volumeRows = await this.requestVolume.getVolumeByAgentTimeseries(range, tenantId, hourly);
            usage.messageUsage = pivotByKey(volumeRows, bucketAlias, 'agent_name', 'messages');
        }
        return usage;
    }
    async getPerProviderTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select(bucketExpr, bucketAlias)
            .addSelect(query_helpers_1.PROVIDER_SERIES_KEY_EXPR, 'provider')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.provider IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (agentScope)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy(query_helpers_1.PROVIDER_SERIES_KEY_EXPR)
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'provider', 'tokens');
    }
    async getPerProviderMessageTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select(bucketExpr, bucketAlias)
            .addSelect(query_helpers_1.PROVIDER_SERIES_KEY_EXPR, 'provider')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.provider IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (agentScope)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy(query_helpers_1.PROVIDER_SERIES_KEY_EXPR)
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'provider', 'messages');
    }
    async getPerModelTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.model', 'model')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.model IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.model')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'model', 'tokens');
    }
    async getPerModelMessageTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.model', 'model')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.model IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.model')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'model', 'messages');
    }
    async getPerProviderCostTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select(bucketExpr, bucketAlias)
            .addSelect(query_helpers_1.PROVIDER_SERIES_KEY_EXPR, 'provider')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.provider IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        if (agentScope)
            (0, query_helpers_1.excludeDirectAttempts)(qb);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy(query_helpers_1.PROVIDER_SERIES_KEY_EXPR)
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'provider', 'cost');
    }
    async getProviderUsageTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select(bucketExpr, bucketAlias)
            .addSelect(query_helpers_1.PROVIDER_SERIES_KEY_EXPR, 'provider')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'tokens')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.provider IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy(query_helpers_1.PROVIDER_SERIES_KEY_EXPR)
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotUsageRows(rows, bucketAlias, 'provider');
    }
    async getPerModelCostTimeseries(range, tenantId, hourly, agentScope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('at.timestamp') : (0, postgres_sql_1.sqlDateBucket)('at.timestamp');
        const bucketAlias = hourly ? 'hour' : 'date';
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select(bucketExpr, bucketAlias)
            .addSelect('at.model', 'model')
            .addSelect(`COALESCE(SUM(${costExpr}), 0)`, 'cost')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.model IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        const rows = await qb
            .groupBy(bucketAlias)
            .addGroupBy('at.model')
            .orderBy(bucketAlias, 'ASC')
            .getRawMany();
        return pivotByKey(rows, bucketAlias, 'model', 'cost');
    }
    async getAgentNamesByAuthType(authType, tenantId) {
        const qb = this.turnRepo
            .createQueryBuilder('at')
            .select('DISTINCT at.agent_name', 'agent_name')
            .where('at.auth_type = :authType', { authType })
            .andWhere('at.agent_name IS NOT NULL');
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        const rows = await qb.orderBy('at.agent_name', 'ASC').getRawMany();
        return rows.map((r) => String(r['agent_name']));
    }
    async withCompatibilitySnapshot(read) {
        const dataSource = this.dataSource ?? this.turnRepo.manager?.connection;
        if (!dataSource)
            return read();
        const runner = dataSource.createQueryRunner();
        await runner.connect();
        try {
            await runner.startTransaction('REPEATABLE READ');
            try {
                await runner.query('SET TRANSACTION READ ONLY');
                const result = await read(runner);
                await runner.commitTransaction();
                return result;
            }
            catch (error) {
                await runner.rollbackTransaction();
                throw error;
            }
        }
        finally {
            await runner.release();
        }
    }
    parseBucketRow(r, bucketAlias) {
        const row = {
            input_tokens: Number(r['input_tokens'] ?? 0),
            output_tokens: Number(r['output_tokens'] ?? 0),
            cost: Number(r['cost'] ?? 0),
            count: Number(r['count'] ?? 0),
        };
        row[bucketAlias] = String(r[bucketAlias]);
        return row;
    }
};
exports.TimeseriesQueriesService = TimeseriesQueriesService;
exports.TimeseriesQueriesService = TimeseriesQueriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        request_volume_service_1.RequestVolumeService,
        typeorm_2.DataSource,
        agent_usage_daily_service_1.AgentUsageDailyService])
], TimeseriesQueriesService);
function pivotByKey(rows, bucketAlias, keyField, valueField) {
    const keySet = new Set();
    for (const r of rows)
        keySet.add(String(r[keyField]));
    const keys = [...keySet].sort();
    const byBucket = new Map();
    for (const r of rows) {
        const bucket = String(r[bucketAlias]);
        if (!byBucket.has(bucket))
            byBucket.set(bucket, {});
        byBucket.get(bucket)[String(r[keyField])] = Number(r[valueField] ?? 0);
    }
    const timeseries = [...byBucket.entries()].map(([bucket, map]) => {
        const row = { [bucketAlias]: bucket };
        for (const k of keys)
            row[k] = map[k] ?? 0;
        return row;
    });
    return { agents: keys, timeseries };
}
function pivotUsageRows(rows, bucketAlias, keyField) {
    return {
        tokenUsage: pivotByKey(rows, bucketAlias, keyField, 'tokens'),
        messageUsage: pivotByKey(rows, bucketAlias, keyField, 'messages'),
        costUsage: pivotByKey(rows, bucketAlias, keyField, 'cost'),
    };
}
//# sourceMappingURL=timeseries-queries.service.js.map