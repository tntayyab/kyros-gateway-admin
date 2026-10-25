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
exports.MessagesQueryService = void 0;
const analytics_scope_service_1 = require("./analytics-scope.service");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const range_util_1 = require("../../common/utils/range.util");
const query_helpers_1 = require("./query-helpers");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const provider_inference_1 = require("../../common/utils/provider-inference");
const ttl_cache_1 = require("../../common/utils/ttl-cache");
const request_entity_1 = require("../../entities/request.entity");
const header_tier_entity_1 = require("../../entities/header-tier.entity");
const FAILED_STATUSES = query_helpers_1.ERROR_MESSAGE_STATUSES;
const ERROR_STATUSES = query_helpers_1.ERROR_MESSAGE_STATUSES;
const AUTOFIX_TRIGGER_ROLE = 'retry';
const MODELS_CACHE_TTL_MS = 5 * 60_000;
const DISTINCT_MODELS_DEFAULT_INTERVAL = '90 days';
const COUNT_CACHE_TTL_MS = 30_000;
const MAX_CACHE_ENTRIES = 5_000;
const DISTINCT_MODELS_SKIP_SCAN_SQL = `
WITH RECURSIVE t AS (
  (SELECT model FROM agent_messages
     WHERE tenant_id = $1 AND model IS NOT NULL AND model <> ''
     ORDER BY model LIMIT 1)
  UNION ALL
  SELECT (SELECT model FROM agent_messages
            WHERE tenant_id = $1 AND model > t.model AND model IS NOT NULL AND model <> ''
            ORDER BY model LIMIT 1)
  FROM t WHERE t.model IS NOT NULL
)
SELECT model FROM t WHERE model IS NOT NULL`;
const DISTINCT_PROVIDERS_SKIP_SCAN_SQL = `
WITH RECURSIVE p AS (
  (SELECT provider FROM agent_messages
     WHERE tenant_id = $1 AND provider IS NOT NULL AND provider <> ''
     ORDER BY provider LIMIT 1)
  UNION ALL
  SELECT (SELECT provider FROM agent_messages
            WHERE tenant_id = $1 AND provider > p.provider AND provider IS NOT NULL AND provider <> ''
            ORDER BY provider LIMIT 1)
  FROM p WHERE p.provider IS NOT NULL
)
SELECT provider FROM p WHERE provider IS NOT NULL`;
function attemptWindow(alias, tenantParam, cutoffParam) {
    const tenant = `${alias}.tenant_id = :${tenantParam}`;
    if (!cutoffParam)
        return tenant;
    return `${tenant} AND ${alias}.timestamp >= CAST(:${cutoffParam} AS timestamp) - interval '1 day'`;
}
function connectionAttemptPredicate(alias, conn, index, parameters) {
    const p = `connProvider${index}`;
    const a = `connAuthType${index}`;
    const id = `connId${index}`;
    const l = `connLabel${index}`;
    parameters[p] = conn.provider;
    parameters[a] = conn.authType;
    parameters[id] = conn.id;
    parameters[l] = conn.label;
    const authFold = conn.authType === 'api_key'
        ? `(${alias}.auth_type = :${a} OR ${alias}.auth_type IS NULL)`
        : `${alias}.auth_type = :${a}`;
    return (`(${alias}.provider = :${p} AND ${authFold} AND ` +
        `(${alias}.tenant_provider_id = :${id} OR (${alias}.tenant_provider_id IS NULL ` +
        `AND LOWER(COALESCE(${alias}.provider_key_label, 'Default')) = LOWER(:${l}))))`);
}
function parseHeaderTierIds(value) {
    return [
        ...new Set(value
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)),
    ];
}
function emptyFilterOptions() {
    return { providers: [], provider_labels: {}, header_tiers: [], models: [] };
}
let MessagesQueryService = class MessagesQueryService {
    analyticsScope;
    turnRepo;
    customProviderRepo;
    requestRepo;
    tenantProviderRepo;
    dataSource;
    headerTierRepo;
    modelsCache = new ttl_cache_1.TtlCache({
        maxSize: MAX_CACHE_ENTRIES,
        ttlMs: MODELS_CACHE_TTL_MS,
    });
    attemptlessModelsCache = new ttl_cache_1.TtlCache({
        maxSize: MAX_CACHE_ENTRIES,
        ttlMs: MODELS_CACHE_TTL_MS,
    });
    countCache = new ttl_cache_1.TtlCache({
        maxSize: MAX_CACHE_ENTRIES,
        ttlMs: COUNT_CACHE_TTL_MS,
    });
    constructor(analyticsScope, turnRepo, customProviderRepo, requestRepo, tenantProviderRepo, dataSource, headerTierRepo) {
        this.analyticsScope = analyticsScope;
        this.turnRepo = turnRepo;
        this.customProviderRepo = customProviderRepo;
        this.requestRepo = requestRepo;
        this.tenantProviderRepo = tenantProviderRepo;
        this.dataSource = dataSource;
        this.headerTierRepo = headerTierRepo;
    }
    async getMessages(params) {
        params = {
            ...params,
            agentScope: params.agentScope ??
                (await this.analyticsScope.resolve(params.tenantId, params.agent_name)),
        };
        if (this.requestRepo)
            return this.getRequests(params);
        const baseQb = await this.buildBaseMessageQuery(params);
        const includeTotal = params.include_total !== false;
        const includeFilterOptions = params.include_filter_options !== false;
        const countCacheKey = this.buildCountCacheKey(params);
        const countQb = baseQb.clone().select('COUNT(*)', 'total');
        const costExpr = (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd'));
        const dataQb = (0, query_helpers_1.selectMessageRowColumns)(baseQb.clone(), costExpr)
            .addSelect('at.description', 'description')
            .addSelect('at.service_type', 'service_type')
            .addSelect('at.cache_read_tokens', 'cache_read_tokens')
            .addSelect('at.cache_creation_tokens', 'cache_creation_tokens')
            .addSelect('at.duration_ms', 'duration_ms')
            .addSelect('at.error_http_status', 'error_http_status');
        this.applyCursor(dataQb, params.cursor);
        const cachedCount = includeTotal && (params.cursor || params.cache_total)
            ? this.countCache.get(countCacheKey)
            : undefined;
        const countHit = cachedCount !== undefined;
        const [countResult, rows, filterOptions] = await Promise.all([
            includeTotal ? (countHit ? null : countQb.getRawOne()) : null,
            dataQb
                .orderBy('at.timestamp', 'DESC')
                .addOrderBy('at.id', 'DESC')
                .limit(params.limit + 1)
                .getRawMany(),
            includeFilterOptions
                ? this.getMessageFilterOptions(params)
                : Promise.resolve(emptyFilterOptions()),
        ]);
        const hasMore = rows.length > params.limit;
        const items = rows.slice(0, params.limit);
        let totalCount;
        if (!includeTotal) {
            totalCount = items.length;
            if (hasMore)
                totalCount += 1;
        }
        else if (cachedCount !== undefined) {
            totalCount = cachedCount;
        }
        else {
            totalCount = this.cacheAndReturnCount(countCacheKey, Number(countResult?.total ?? 0));
        }
        const lastItem = items[items.length - 1];
        const nextCursor = hasMore && lastItem ? this.encodeCursor(lastItem) : null;
        return {
            items,
            next_cursor: nextCursor,
            total_count: totalCount,
            total_count_exact: includeTotal,
            providers: filterOptions.providers,
            provider_labels: filterOptions.provider_labels,
            header_tiers: filterOptions.header_tiers,
            models: filterOptions.models,
        };
    }
    async getRequests(params) {
        const qb = this.requestRepo.createQueryBuilder('r');
        const cutoff = params.range ? (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(params.range)) : undefined;
        if (cutoff)
            qb.where('r.timestamp >= :requestCutoff', { requestCutoff: cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope, 'r');
        const window = (alias) => attemptWindow(alias, 'tenantId', cutoff ? 'requestCutoff' : undefined);
        if (params.exclude_playground) {
            qb.andWhere((0, query_helpers_1.sqlExcludePlayground)('r'));
        }
        if (params.exclude_direct) {
            qb.andWhere((0, query_helpers_1.sqlExcludeDirectRequests)('r'));
        }
        if (params.status === 'failed' || params.status === 'errors') {
            qb.andWhere((0, query_helpers_1.sqlIsFailedStatus)('r.status'));
        }
        else if (params.status === 'ok' || params.status === 'success') {
            qb.andWhere(`r.status IN (${query_helpers_1.SUCCESS_STATUS_SQL_LIST})`);
        }
        else if (params.status) {
            qb.andWhere('r.status = :requestStatus', { requestStatus: params.status });
        }
        if (params.origin === 'manifest') {
            qb.andWhere(`r.error_origin IN ('config', 'policy', 'internal', 'request')`);
        }
        else if (params.origin) {
            qb.andWhere('r.error_origin = :requestOrigin', { requestOrigin: params.origin });
        }
        if (params.error_class) {
            qb.andWhere('r.error_class = :requestErrorClass', {
                requestErrorClass: params.error_class,
            });
        }
        if (params.models?.length) {
            qb.andWhere(`(EXISTS (
            SELECT 1 FROM agent_messages model_attempt
            WHERE model_attempt.request_id = r.id AND ${window('model_attempt')}
              AND model_attempt.model IN (:...requestModels)
          )
          OR (
            r.requested_model IN (:...requestModels)
            AND NOT EXISTS (
              SELECT 1 FROM agent_messages any_attempt
              WHERE any_attempt.request_id = r.id AND ${window('any_attempt')}
            )
          ))`, { requestModels: params.models });
        }
        const attemptPredicates = [];
        const attemptParameters = {};
        const matchingAttempt = (predicates) => `EXISTS (
      SELECT 1 FROM agent_messages filtered_attempt
      WHERE filtered_attempt.request_id = r.id AND ${window('filtered_attempt')}
        AND ${predicates.join(' AND ')}
    )`;
        if (params.provider) {
            attemptPredicates.push('filtered_attempt.provider = :requestProvider');
            attemptParameters['requestProvider'] = params.provider;
        }
        const resolvedConnections = params.connections?.length
            ? await this.resolveConnections(params.tenantId, params.connections)
            : null;
        if (resolvedConnections) {
            if (resolvedConnections.length === 0)
                qb.andWhere('1 = 0');
            else {
                const parts = resolvedConnections.map((c, i) => connectionAttemptPredicate('filtered_attempt', c, i, attemptParameters));
                attemptPredicates.push(`(${parts.join(' OR ')})`);
            }
        }
        if (params.service_type) {
            attemptPredicates.push('filtered_attempt.service_type = :requestServiceType');
            attemptParameters['requestServiceType'] = params.service_type;
        }
        if (params.routing_tier) {
            attemptPredicates.push('filtered_attempt.routing_tier = :requestTier');
            attemptParameters['requestTier'] = params.routing_tier;
        }
        if (params.specificity_category) {
            attemptPredicates.push('filtered_attempt.specificity_category = :requestSpecificity');
            attemptParameters['requestSpecificity'] = params.specificity_category;
        }
        const requestHeaderTierIds = params.header_tier_id
            ? parseHeaderTierIds(params.header_tier_id)
            : [];
        if (requestHeaderTierIds.length) {
            attemptPredicates.push('filtered_attempt.header_tier_id IN (:...requestHeaderTiers)');
            attemptParameters['requestHeaderTiers'] = requestHeaderTierIds;
        }
        if (params.triggers?.length) {
            const triggerParameters = {};
            const connScope = resolvedConnections?.length
                ? ' AND (' +
                    resolvedConnections
                        .map((c, i) => connectionAttemptPredicate('trigger_attempt', c, i + resolvedConnections.length, triggerParameters))
                        .join(' OR ') +
                    ')'
                : '';
            const triggerExists = (condition) => `EXISTS (
        SELECT 1 FROM agent_messages trigger_attempt
        WHERE trigger_attempt.request_id = r.id AND ${window('trigger_attempt')}
          AND ${condition}${connScope}
      )`;
            const parts = params.triggers.map((trigger) => {
                if (trigger === 'autofix')
                    return triggerExists('trigger_attempt.autofix_applied = true');
                if (trigger === 'fallback')
                    return triggerExists('trigger_attempt.fallback_from_model IS NOT NULL');
                const noAttempt = (condition) => `NOT EXISTS (
          SELECT 1 FROM agent_messages trigger_attempt
          WHERE trigger_attempt.request_id = r.id AND ${window('trigger_attempt')}
            AND ${condition}
        )`;
                return `(${noAttempt('trigger_attempt.autofix_applied = true')} AND ${noAttempt('trigger_attempt.fallback_from_model IS NOT NULL')})`;
            });
            qb.andWhere(`(${parts.join(' OR ')})`, triggerParameters);
        }
        if (params.attemptStatus?.length) {
            const outcomeParameters = {};
            const connScope = resolvedConnections?.length
                ? ' AND (' +
                    resolvedConnections
                        .map((c, i) => connectionAttemptPredicate('outcome_attempt', c, i + 2 * resolvedConnections.length, outcomeParameters))
                        .join(' OR ') +
                    ')'
                : '';
            for (const kind of params.attemptStatus) {
                const condition = kind === 'has_succeeded'
                    ? (0, query_helpers_1.sqlIsSuccessStatus)('outcome_attempt.status')
                    : (0, query_helpers_1.sqlIsFailedStatus)('outcome_attempt.status');
                qb.andWhere(`EXISTS (
            SELECT 1 FROM agent_messages outcome_attempt
            WHERE outcome_attempt.request_id = r.id AND ${window('outcome_attempt')}
              AND ${condition}${connScope}
          )`, outcomeParameters);
            }
        }
        if (attemptPredicates.length > 0) {
            qb.andWhere(matchingAttempt(attemptPredicates), attemptParameters);
        }
        const includeTotal = params.include_total !== false;
        const countCacheKey = this.buildCountCacheKey(params);
        const cachedCount = includeTotal && (params.cursor || params.cache_total)
            ? this.countCache.get(countCacheKey)
            : undefined;
        const needsCount = includeTotal && cachedCount === undefined;
        const canPageFirst = params.cost_min === undefined && params.cost_max === undefined;
        let requestCountQuery = null;
        if (needsCount && canPageFirst) {
            const countSource = qb.clone().select('COUNT(*)', 'total').orderBy();
            const [countSql, countParameters] = countSource.getQueryAndParameters();
            requestCountQuery = {
                sql: countSql,
                parameters: countParameters,
            };
        }
        if (params.cursor) {
            const sep = params.cursor.indexOf('|');
            if (sep !== -1) {
                const cursorTs = params.cursor.slice(0, sep);
                const cursorId = params.cursor.slice(sep + 1);
                qb.andWhere(new typeorm_2.Brackets((sub) => {
                    sub.where('r.timestamp < :requestCursorTs', { requestCursorTs: cursorTs }).orWhere(new typeorm_2.Brackets((inner) => {
                        inner
                            .where('r.timestamp = :requestCursorTsEqual', {
                            requestCursorTsEqual: cursorTs,
                        })
                            .andWhere('r.id < :requestCursorId', { requestCursorId: cursorId });
                    }));
                }));
            }
        }
        if (canPageFirst) {
            const pageSource = qb
                .clone()
                .select('r.id', 'id')
                .orderBy('r.timestamp', 'DESC')
                .addOrderBy('r.id', 'DESC')
                .limit(params.limit + 1);
            qb.where(`r.id IN (${pageSource.getQuery()})`, pageSource.getParameters());
        }
        qb.leftJoin(agent_message_entity_1.AgentMessage, 'at', 'at.request_id = r.id');
        const rank = `CASE WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')} THEN 3 WHEN NOT COALESCE(at.superseded, false) AND at.status NOT IN ('fallback_error', 'auto_fixed') THEN 2 ELSE 1 END`;
        const picked = (column) => `(ARRAY_AGG(${column} ORDER BY at.attempt_number DESC NULLS LAST, ${rank} DESC, at.timestamp DESC, at.id DESC) FILTER (WHERE at.id IS NOT NULL))[1]`;
        const safeCost = (0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd');
        qb.leftJoin(custom_provider_entity_1.CustomProvider, 'cp', query_helpers_1.CUSTOM_PROVIDER_JOIN_CONDITION)
            .select('r.id', 'id')
            .addSelect('r.timestamp', 'timestamp')
            .addSelect('r.agent_name', 'agent_name')
            .addSelect(`COALESCE(${picked('at.model')}, r.requested_model)`, 'model')
            .addSelect(picked('at.provider'), 'provider')
            .addSelect(`COALESCE(${picked('at.model')}, r.requested_model)`, 'display_name')
            .addSelect('COALESCE(SUM(at.input_tokens), 0)', 'input_tokens')
            .addSelect('COALESCE(SUM(at.output_tokens), 0)', 'output_tokens')
            .addSelect('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'total_tokens')
            .addSelect(`COALESCE(SUM(${safeCost}), 0)`, 'cost')
            .addSelect('r.status', 'status')
            .addSelect('r.api_mode', 'api_mode')
            .addSelect('r.error_message', 'error_message')
            .addSelect('r.error_code', 'error_code')
            .addSelect('r.error_origin', 'error_origin')
            .addSelect('r.error_class', 'error_class')
            .addSelect('r.error_http_status', 'error_http_status')
            .addSelect('COALESCE(SUM(at.duration_ms), r.duration_ms)::int', 'duration_ms')
            .addSelect(picked('at.routing_tier'), 'routing_tier')
            .addSelect(picked('at.routing_reason'), 'routing_reason')
            .addSelect(picked('at.specificity_category'), 'specificity_category')
            .addSelect(picked('at.auth_type'), 'auth_type')
            .addSelect(picked('at.fallback_from_model'), 'fallback_from_model')
            .addSelect(picked('at.fallback_index'), 'fallback_index')
            .addSelect('r.feedback_rating', 'feedback_rating')
            .addSelect(picked('at.header_tier_id'), 'header_tier_id')
            .addSelect(picked('at.header_tier_name'), 'header_tier_name')
            .addSelect(picked('at.header_tier_color'), 'header_tier_color')
            .addSelect(picked('at.provider_key_label'), 'provider_key_label')
            .addSelect(picked('cp.name'), 'custom_provider_name')
            .addSelect('COALESCE(BOOL_OR(at.autofix_applied), false)', 'autofix_applied')
            .addSelect(`CASE WHEN COALESCE(BOOL_OR(at.autofix_applied), false) THEN 'retry' ELSE NULL END`, 'autofix_role')
            .addSelect('COALESCE(SUM(at.cache_read_tokens), 0)', 'cache_read_tokens')
            .addSelect('COALESCE(SUM(at.cache_creation_tokens), 0)', 'cache_creation_tokens')
            .addSelect('COUNT(at.id)::int', 'attempt_count')
            .groupBy('r.id');
        if (params.cost_min !== undefined) {
            qb.having(`COALESCE(SUM(${safeCost}), 0) >= :requestCostMin`, {
                requestCostMin: params.cost_min,
            });
        }
        if (params.cost_max !== undefined) {
            qb.andHaving(`COALESCE(SUM(${safeCost}), 0) <= :requestCostMax`, {
                requestCostMax: params.cost_max,
            });
        }
        if (needsCount && !canPageFirst) {
            const countSource = qb.clone().select('r.id', 'id').orderBy();
            const [countSql, countParameters] = countSource.getQueryAndParameters();
            requestCountQuery = {
                sql: `SELECT COUNT(*) AS total FROM (${countSql}) "filtered_requests"`,
                parameters: countParameters,
            };
        }
        const legacyBase = await this.buildBaseMessageQuery(params);
        legacyBase.andWhere('at.request_id IS NULL');
        if (resolvedConnections) {
            if (resolvedConnections.length === 0)
                legacyBase.andWhere('1 = 0');
            else {
                const legacyParams = {};
                const parts = resolvedConnections.map((c, i) => connectionAttemptPredicate('at', c, i, legacyParams));
                legacyBase.andWhere(`(${parts.join(' OR ')})`, legacyParams);
            }
        }
        if (params.exclude_playground)
            (0, query_helpers_1.excludePlaygroundAgents)(legacyBase);
        if (params.exclude_direct)
            (0, query_helpers_1.excludeDirectAttempts)(legacyBase);
        const legacyCountQb = legacyBase.clone().select('COUNT(*)', 'total');
        const legacyDataQb = (0, query_helpers_1.selectMessageRowColumns)(legacyBase.clone(), (0, postgres_sql_1.sqlCastFloat)((0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd')))
            .addSelect('at.description', 'description')
            .addSelect('at.service_type', 'service_type')
            .addSelect('at.cache_read_tokens', 'cache_read_tokens')
            .addSelect('at.cache_creation_tokens', 'cache_creation_tokens')
            .addSelect('at.duration_ms', 'duration_ms')
            .addSelect('NULL', 'api_mode')
            .addSelect('1', 'attempt_count');
        this.applyCursor(legacyDataQb, params.cursor);
        const readRows = async (runner) => {
            if (runner) {
                qb.setQueryRunner(runner);
                legacyCountQb.setQueryRunner(runner);
                legacyDataQb.setQueryRunner(runner);
            }
            const requestCountPromise = requestCountQuery
                ? (runner
                    ? runner.query(requestCountQuery.sql, requestCountQuery.parameters)
                    : this.requestRepo.query(requestCountQuery.sql, requestCountQuery.parameters))
                : Promise.resolve([]);
            const requestCountRows = await requestCountPromise;
            const legacyCount = needsCount ? await legacyCountQb.getRawOne() : null;
            const requestRows = await qb
                .orderBy('r.timestamp', 'DESC')
                .addOrderBy('r.id', 'DESC')
                .limit(params.limit + 1)
                .getRawMany();
            const legacyRows = await legacyDataQb
                .orderBy('at.timestamp', 'DESC')
                .addOrderBy('at.id', 'DESC')
                .limit(params.limit + 1)
                .getRawMany();
            return [requestCountRows, legacyCount, requestRows, legacyRows];
        };
        const [[requestCountRows, legacyCount, requestRows, legacyRows], filterOptions] = await Promise.all([
            this.withCompatibilitySnapshot(readRows),
            params.include_filter_options !== false
                ? this.getMessageFilterOptions(params)
                : Promise.resolve(emptyFilterOptions()),
        ]);
        const rows = [...requestRows, ...legacyRows].sort((a, b) => {
            const byTime = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            return byTime || String(b.id).localeCompare(String(a.id));
        });
        const hasMore = rows.length > params.limit;
        const items = rows.slice(0, params.limit);
        const last = items[items.length - 1];
        return {
            items,
            next_cursor: hasMore && last ? this.encodeCursor(last) : null,
            total_count: includeTotal
                ? (cachedCount ??
                    this.cacheAndReturnCount(countCacheKey, Number(requestCountRows[0]?.total ?? 0) + Number(legacyCount?.total ?? 0)))
                : items.length + (hasMore ? 1 : 0),
            total_count_exact: includeTotal,
            providers: filterOptions.providers,
            provider_labels: filterOptions.provider_labels,
            header_tiers: filterOptions.header_tiers,
            models: filterOptions.models,
        };
    }
    async resolveConnections(tenantId, ids) {
        if (!tenantId || ids.length === 0 || !this.tenantProviderRepo)
            return [];
        const rows = await this.tenantProviderRepo.find({
            where: { tenant_id: tenantId, id: (0, typeorm_2.In)(ids) },
            select: ['id', 'provider', 'auth_type', 'label'],
        });
        return rows.map((r) => ({
            id: r.id,
            provider: r.provider,
            authType: r.auth_type,
            label: r.label ?? 'Default',
        }));
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
    async getMessageFilterOptions(params) {
        params = {
            ...params,
            agentScope: params.agentScope ??
                (await this.analyticsScope.resolve(params.tenantId, params.agent_name)),
        };
        const [distinctRows, headerTiers] = await Promise.all([
            this.getDistinctModels(params.tenantId, params.range, params.agentScope),
            this.getHeaderTierOptions(params.tenantId, params.agentScope),
        ]);
        const providers = this.deriveProviders(distinctRows.models, distinctRows.providers);
        const providerLabels = await this.resolveCustomProviderLabels(providers, params.tenantId);
        const blockedModels = await this.getAttemptlessRequestedModels(params);
        const models = [...new Set([...distinctRows.models, ...blockedModels])].sort();
        return {
            providers,
            provider_labels: providerLabels,
            header_tiers: headerTiers,
            models,
        };
    }
    async getHeaderTierOptions(tenantId, agentScope) {
        if (!tenantId || !this.headerTierRepo)
            return [];
        const qb = this.headerTierRepo
            .createQueryBuilder('ht')
            .select('ht.id', 'id')
            .addSelect('ht.name', 'name')
            .orderBy('LOWER(ht.name)', 'ASC');
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope, 'ht');
        const rows = await qb.getRawMany();
        const byName = new Map();
        for (const row of rows) {
            const existing = byName.get(row.name.toLowerCase());
            if (existing)
                existing.ids.push(row.id);
            else
                byName.set(row.name.toLowerCase(), { name: row.name, ids: [row.id] });
        }
        return [...byName.values()];
    }
    async resolveCustomProviderLabels(providers, tenantId) {
        const uuids = providers
            .filter((p) => p.startsWith('custom:'))
            .map((p) => p.slice('custom:'.length));
        if (uuids.length === 0 || !tenantId)
            return {};
        const rows = await this.customProviderRepo.find({
            where: { id: (0, typeorm_2.In)(uuids), tenant_id: tenantId },
        });
        return Object.fromEntries(rows.map((cp) => [`custom:${cp.id}`, cp.name]));
    }
    async buildBaseMessageQuery(params) {
        const cutoff = params.range ? (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(params.range)) : undefined;
        const qb = this.turnRepo.createQueryBuilder('at');
        if (cutoff)
            qb.where('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope);
        if (params.models?.length)
            qb.andWhere('at.model IN (:...legacyModels)', { legacyModels: params.models });
        if (params.service_type)
            qb.andWhere('at.service_type = :serviceType', { serviceType: params.service_type });
        if (params.cost_min !== undefined)
            qb.andWhere('at.cost_usd >= :costMin', { costMin: params.cost_min });
        if (params.cost_max !== undefined)
            qb.andWhere('at.cost_usd <= :costMax', { costMax: params.cost_max });
        if (params.status === 'failed') {
            qb.andWhere('at.status IN (:...failedStatuses)', { failedStatuses: FAILED_STATUSES });
        }
        else if (params.status === 'errors') {
            qb.andWhere('at.status IN (:...errorStatuses)', { errorStatuses: ERROR_STATUSES });
        }
        else if (params.status === 'ok' || params.status === 'success') {
            qb.andWhere((0, query_helpers_1.sqlIsSuccessStatus)('at.status'));
        }
        else if (params.status) {
            qb.andWhere('at.status = :statusFilter', { statusFilter: params.status });
        }
        this.applyTriggerFilter(qb, params.triggers);
        if (params.origin === 'manifest') {
            qb.andWhere(query_helpers_1.MANIFEST_ORIGIN_PREDICATE);
        }
        else if (params.origin) {
            qb.andWhere('at.error_origin = :originFilter', { originFilter: params.origin });
        }
        if (params.error_class) {
            qb.andWhere('at.error_class = :errorClassFilter', { errorClassFilter: params.error_class });
        }
        if (params.routing_tier) {
            qb.andWhere('at.routing_tier = :tierFilter', { tierFilter: params.routing_tier });
        }
        if (params.specificity_category) {
            qb.andWhere('at.specificity_category = :specificityFilter', {
                specificityFilter: params.specificity_category,
            });
        }
        const headerTierIds = params.header_tier_id ? parseHeaderTierIds(params.header_tier_id) : [];
        if (headerTierIds.length) {
            qb.andWhere('at.header_tier_id IN (:...headerTierFilter)', {
                headerTierFilter: headerTierIds,
            });
        }
        if (params.provider) {
            await this.applyProviderFilter(qb, params.provider, {
                tenantId: params.tenantId,
                range: params.range,
                agentScope: params.agentScope,
            });
        }
        return qb;
    }
    applyTriggerFilter(qb, triggers) {
        if (!triggers?.length)
            return;
        if (triggers.length > 1) {
            const conditions = triggers.map((t) => {
                if (t === 'autofix')
                    return 'at.autofix_role = :triggerAutofixRole';
                if (t === 'fallback')
                    return "(COALESCE(at.autofix_role, '') != :triggerAutofixRole AND at.fallback_from_model IS NOT NULL AND at.fallback_from_model != '')";
                return "(COALESCE(at.autofix_role, '') != :triggerAutofixRole AND (at.fallback_from_model IS NULL OR at.fallback_from_model = ''))";
            });
            qb.andWhere(`(${conditions.join(' OR ')})`, { triggerAutofixRole: AUTOFIX_TRIGGER_ROLE });
            return;
        }
        const trigger = triggers[0];
        if (trigger === 'autofix') {
            qb.andWhere('at.autofix_role = :triggerAutofixRole', {
                triggerAutofixRole: AUTOFIX_TRIGGER_ROLE,
            });
            return;
        }
        qb.andWhere('(at.autofix_role IS NULL OR at.autofix_role != :triggerAutofixRole)', {
            triggerAutofixRole: AUTOFIX_TRIGGER_ROLE,
        });
        if (trigger === 'fallback') {
            qb.andWhere("at.fallback_from_model IS NOT NULL AND at.fallback_from_model != ''");
        }
        else {
            qb.andWhere("(at.fallback_from_model IS NULL OR at.fallback_from_model = '')");
        }
    }
    async applyProviderFilter(qb, provider, ctx) {
        const distinct = await this.getDistinctModels(ctx.tenantId, ctx.range, ctx.agentScope);
        const matching = distinct.models.filter((m) => (0, provider_inference_1.inferProviderFromModel)(m) === provider);
        qb.andWhere(new typeorm_2.Brackets((sub) => {
            sub.where('at.provider = :providerId', { providerId: provider });
            if (matching.length > 0) {
                sub.orWhere(new typeorm_2.Brackets((inner) => {
                    inner
                        .where('at.provider IS NULL')
                        .andWhere('at.model IN (:...providerModels)', { providerModels: matching });
                }));
            }
        }));
    }
    applyCursor(qb, cursor) {
        if (!cursor)
            return;
        const sepIdx = cursor.indexOf('|');
        if (sepIdx === -1)
            return;
        const cursorTs = cursor.substring(0, sepIdx);
        const cursorId = cursor.substring(sepIdx + 1);
        qb.andWhere(new typeorm_2.Brackets((sub) => {
            sub.where('at.timestamp < :cursorTs', { cursorTs }).orWhere(new typeorm_2.Brackets((inner) => {
                inner
                    .where('at.timestamp = :cursorTs2', { cursorTs2: cursorTs })
                    .andWhere('at.id < :cursorId', { cursorId });
            }));
        }));
    }
    encodeCursor(lastItem) {
        const ts = lastItem['timestamp'];
        const tsStr = ts instanceof Date ? (0, query_helpers_1.formatTimestamp)(ts) : String(ts ?? '');
        return `${tsStr}|${String(lastItem['id'])}`;
    }
    cacheAndReturnCount(key, value) {
        this.countCache.set(key, value);
        return value;
    }
    deriveProviders(models, storedProviders) {
        const seen = new Set();
        for (const p of storedProviders) {
            if (p)
                seen.add(p);
        }
        for (const m of models) {
            const p = (0, provider_inference_1.inferProviderFromModel)(m);
            if (p)
                seen.add(p);
        }
        return [...seen].sort();
    }
    async getAttemptlessRequestedModels(params) {
        if (!this.requestRepo || params.tenantId === null)
            return [];
        const cacheKey = `blocked:${params.tenantId ?? 'no-tenant'}:${(0, analytics_scope_service_1.agentScopeCacheKey)(params.agentScope)}:${params.range ?? 'all'}`;
        const cached = this.attemptlessModelsCache.get(cacheKey);
        if (cached)
            return cached;
        const cutoff = params.range
            ? (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(params.range))
            : (0, postgres_sql_1.computeCutoff)(DISTINCT_MODELS_DEFAULT_INTERVAL);
        const qb = this.requestRepo
            .createQueryBuilder('r')
            .select('DISTINCT r.requested_model', 'model')
            .where('r.timestamp >= :cutoff', { cutoff })
            .andWhere("r.requested_model IS NOT NULL AND r.requested_model <> ''")
            .andWhere(`NOT EXISTS (
          SELECT 1 FROM agent_messages blocked_attempt
          WHERE blocked_attempt.request_id = r.id
            AND ${attemptWindow('blocked_attempt', 'tenantId', 'cutoff')}
        )`);
        (0, query_helpers_1.addTenantFilter)(qb, params.tenantId, params.agentScope, 'r');
        const rows = (await qb.getRawMany());
        const models = rows.map((row) => String(row.model)).filter(Boolean);
        this.attemptlessModelsCache.set(cacheKey, models);
        return models;
    }
    async getDistinctModels(tenantId, range, agentScope) {
        const cacheKey = `${tenantId ?? 'no-tenant'}:${(0, analytics_scope_service_1.agentScopeCacheKey)(agentScope)}:${range ?? 'all'}`;
        const cached = this.modelsCache.get(cacheKey);
        if (cached)
            return cached;
        const result = tenantId && !agentScope
            ? await this.getDistinctModelsViaSkipScan(tenantId)
            : await this.getDistinctModelsViaScan(tenantId, range, agentScope);
        this.modelsCache.set(cacheKey, result);
        return result;
    }
    async getDistinctModelsViaSkipScan(tenantId) {
        const [modelRows, providerRows] = (await Promise.all([
            this.turnRepo.query(DISTINCT_MODELS_SKIP_SCAN_SQL, [tenantId]),
            this.turnRepo.query(DISTINCT_PROVIDERS_SKIP_SCAN_SQL, [tenantId]),
        ]));
        return {
            models: modelRows.map((r) => String(r.model)).filter((m) => m !== ''),
            providers: providerRows.map((r) => String(r.provider)).filter((p) => p !== ''),
        };
    }
    async getDistinctModelsViaScan(tenantId, range, agentScope) {
        const cutoff = range
            ? (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range))
            : (0, postgres_sql_1.computeCutoff)(DISTINCT_MODELS_DEFAULT_INTERVAL);
        const modelsQb = this.turnRepo
            .createQueryBuilder('at')
            .select('at.model', 'model')
            .addSelect('at.provider', 'provider')
            .distinct(true)
            .where('at.model IS NOT NULL')
            .andWhere("at.model != ''")
            .andWhere('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(modelsQb, tenantId, agentScope);
        const modelsResult = await modelsQb.orderBy('at.model', 'ASC').getRawMany();
        const modelSet = new Set();
        const providerSet = new Set();
        for (const row of modelsResult) {
            const modelValue = row['model'];
            if (modelValue != null && modelValue !== '') {
                modelSet.add(String(modelValue));
            }
            const providerValue = row['provider'];
            if (providerValue != null && providerValue !== '') {
                providerSet.add(String(providerValue));
            }
        }
        return { models: [...modelSet], providers: [...providerSet] };
    }
    buildCountCacheKey(params) {
        return [
            params.tenantId ?? 'no-tenant',
            params.range ?? '',
            params.provider ?? '',
            params.connections?.join(',') ?? '',
            params.models?.join(',') ?? '',
            params.attemptStatus?.join(',') ?? '',
            params.service_type ?? '',
            (0, analytics_scope_service_1.agentScopeCacheKey)(params.agentScope),
            params.cost_min ?? '',
            params.cost_max ?? '',
            params.status ?? '',
            params.triggers?.join(',') ?? '',
            params.origin ?? '',
            params.error_class ?? '',
            params.routing_tier ?? '',
            params.specificity_category ?? '',
            params.header_tier_id ?? '',
            params.exclude_playground ? 'exclude-playground' : '',
            params.exclude_direct ? 'exclude-direct' : '',
        ].join(':');
    }
};
exports.MessagesQueryService = MessagesQueryService;
exports.MessagesQueryService = MessagesQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(2, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __param(3, (0, common_1.Optional)()),
    __param(3, (0, typeorm_1.InjectRepository)(request_entity_1.ManifestRequest)),
    __param(4, (0, common_1.Optional)()),
    __param(4, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, typeorm_1.InjectDataSource)()),
    __param(6, (0, common_1.Optional)()),
    __param(6, (0, typeorm_1.InjectRepository)(header_tier_entity_1.HeaderTier)),
    __metadata("design:paramtypes", [analytics_scope_service_1.AnalyticsScopeService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        typeorm_2.Repository])
], MessagesQueryService);
//# sourceMappingURL=messages-query.service.js.map