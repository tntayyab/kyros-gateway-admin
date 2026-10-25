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
exports.RequestVolumeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const range_util_1 = require("../../common/utils/range.util");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const query_helpers_1 = require("./query-helpers");
const TERMINAL_RANK = `CASE WHEN ${(0, query_helpers_1.sqlIsSuccessStatus)('pa.status')} THEN 3
       WHEN NOT COALESCE(pa.superseded, false)
            AND pa.status NOT IN ('fallback_error', 'auto_fixed') THEN 2
       ELSE 1 END`;
const REQUEST_SUCCEEDED = (0, query_helpers_1.sqlIsSuccessStatus)('t.request_status');
const DISPOSITION_EXPR = `CASE
    WHEN ${REQUEST_SUCCEEDED} AND t.autofix_status = 'retry_succeeded' THEN 'healed'
    WHEN ${REQUEST_SUCCEEDED} AND t.fallback_from_model IS NOT NULL THEN 'fallback'
    WHEN ${REQUEST_SUCCEEDED} THEN 'success'
    ELSE 'error'
  END`;
let RequestVolumeService = class RequestVolumeService {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    terminalCte(agentScope, hasTo = false) {
        const agentIdx = hasTo ? 4 : 3;
        const toR = hasTo ? 'AND r.timestamp < $3' : '';
        const toPa = hasTo ? 'AND pa.timestamp < $3' : '';
        const agentPredicateR = (0, query_helpers_1.sqlAgentScope)('r', `$${agentIdx}`, agentScope);
        const agentPredicatePa = (0, query_helpers_1.sqlAgentScope)('pa', `$${agentIdx}`, agentScope);
        return `WITH terminal AS (
      (
        SELECT DISTINCT ON (r.id)
          r.id,
          r.timestamp AS ts,
          r.status AS request_status,
          r.autofix_status,
          r.agent_name,
          pa.provider,
          pa.model,
          pa.fallback_from_model,
          pa.auth_type,
          pa.provider_key_label,
          pa.tenant_provider_id
        FROM requests r
        LEFT JOIN agent_messages pa ON pa.request_id = r.id
        WHERE r.tenant_id = $1
          AND r.timestamp >= $2
          ${toR}
          AND ${(0, query_helpers_1.sqlIsCompletedStatus)('r.status')}
          ${agentPredicateR}
          AND ${(0, query_helpers_1.sqlExcludePlayground)('r')}
        ORDER BY r.id,
          ${TERMINAL_RANK} DESC,
          pa.timestamp DESC,
          pa.id DESC
      )
      UNION ALL
      (
        -- Unlinked legacy attempts (pre-backfill): each is its own synthetic
        -- request, matching the KPI's scoped_requests universe.
        SELECT
          pa.id,
          pa.timestamp,
          pa.status,
          CASE WHEN pa.autofix_role = 'retry' AND ${(0, query_helpers_1.sqlIsSuccessStatus)('pa.status')}
            THEN 'retry_succeeded' ELSE NULL END,
          pa.agent_name,
          pa.provider,
          pa.model,
          pa.fallback_from_model,
          pa.auth_type,
          pa.provider_key_label,
          pa.tenant_provider_id
        FROM agent_messages pa
        WHERE pa.request_id IS NULL
          AND pa.tenant_id = $1
          AND pa.timestamp >= $2
          ${toPa}
          AND ${(0, query_helpers_1.sqlIsCompletedStatus)('pa.status')}
          ${agentPredicatePa}
          AND ${(0, query_helpers_1.sqlExcludePlayground)('pa')}
      )
    )`;
    }
    params(tenantId, range, agentScope) {
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        return agentScope ? [tenantId, cutoff, agentScope.agentId] : [tenantId, cutoff];
    }
    connectionPredicate(scope, params) {
        if (!scope)
            return '';
        const clauses = [];
        if (scope.tenantProviderId) {
            params.push(scope.tenantProviderId);
            clauses.push(`t.tenant_provider_id = $${params.length}`);
        }
        else {
            if (scope.provider) {
                params.push(scope.provider);
                clauses.push(`t.provider = $${params.length}`);
            }
            if (scope.authType) {
                params.push(scope.authType);
                clauses.push(scope.authType === 'api_key'
                    ? `(t.auth_type = $${params.length} OR t.auth_type IS NULL)`
                    : `t.auth_type = $${params.length}`);
            }
            if (scope.label) {
                params.push(scope.label);
                clauses.push(`LOWER(COALESCE(t.provider_key_label, 'Default')) = LOWER($${params.length})`);
            }
        }
        return clauses.length ? `AND ${clauses.join(' AND ')}` : '';
    }
    async getDispositionTotalsForWindows(params) {
        const empty = () => ({
            total: 0,
            success: 0,
            healed: 0,
            fallback: 0,
            error: 0,
        });
        if (!params.tenantId)
            return { current: empty(), previous: empty() };
        const sqlParams = [
            params.tenantId,
            params.from,
            params.to ?? (0, postgres_sql_1.computeCutoff)('0 hours'),
        ];
        if (params.agentScope)
            sqlParams.push(params.agentScope.agentId);
        sqlParams.push(params.splitAt);
        const splitIdx = sqlParams.length;
        const sql = `${this.terminalCte(params.agentScope, true)}
      SELECT ${DISPOSITION_EXPR} AS dim,
        COUNT(*) FILTER (WHERE t.ts >= $${splitIdx})::int AS current_count,
        COUNT(*) FILTER (WHERE t.ts < $${splitIdx})::int AS previous_count
      FROM terminal t
      GROUP BY 1`;
        const rows = (await this.messageRepo.query(sql, sqlParams));
        const current = empty();
        const previous = empty();
        for (const r of rows) {
            const c = Number(r.current_count);
            const p = Number(r.previous_count);
            current.total += c;
            previous.total += p;
            if (r.dim === 'success') {
                current.success += c;
                previous.success += p;
            }
            else if (r.dim === 'healed') {
                current.healed += c;
                previous.healed += p;
            }
            else if (r.dim === 'fallback') {
                current.fallback += c;
                previous.fallback += p;
            }
            else {
                current.error += c;
                previous.error += p;
            }
        }
        return { current, previous };
    }
    async getDispositionTimeseries(params) {
        if (!params.tenantId)
            return [];
        const bucketExpr = params.hourly ? (0, postgres_sql_1.sqlHourBucket)('t.ts') : (0, postgres_sql_1.sqlDateBucket)('t.ts');
        const sqlParams = this.params(params.tenantId, params.range, params.agentScope);
        const predicates = [
            params.failedOnly ? `${DISPOSITION_EXPR} = 'error'` : '',
            this.connectionPredicate(params.connection, sqlParams).replace(/^AND /, ''),
        ].filter(Boolean);
        const sql = `${this.terminalCte(params.agentScope)}
      SELECT ${bucketExpr} AS bucket, ${DISPOSITION_EXPR} AS dim, COUNT(*)::int AS count
      FROM terminal t
      ${predicates.length ? `WHERE ${predicates.join(' AND ')}` : ''}
      GROUP BY 1, 2
      ORDER BY 1 ASC`;
        return (await this.messageRepo.query(sql, sqlParams));
    }
    async getVolumeByAgentTimeseries(range, tenantId, hourly) {
        if (!tenantId)
            return [];
        const bucketExpr = hourly ? (0, postgres_sql_1.sqlHourBucket)('t.ts') : (0, postgres_sql_1.sqlDateBucket)('t.ts');
        const bucketAlias = hourly ? 'hour' : 'date';
        const sql = `${this.terminalCte()}
      SELECT ${bucketExpr} AS ${bucketAlias},
        COALESCE(t.agent_name, 'Unknown') AS agent_name,
        COUNT(*)::int AS messages
      FROM terminal t
      GROUP BY 1, 2
      ORDER BY 1 ASC`;
        return (await this.messageRepo.query(sql, this.params(tenantId, range)));
    }
    async getVolumeByDimension(dim, params) {
        if (!params.tenantId)
            return [];
        const range = params.range ?? '7d';
        const keyExpr = dim === 'provider'
            ? `CASE WHEN t.provider LIKE 'custom:%' THEN 'custom' ELSE COALESCE(t.provider, 'manifest') END`
            : `t.${dim}`;
        const sql = `${this.terminalCte(params.agentScope)}
      SELECT ${keyExpr} AS key,
        COUNT(*)::int AS requests,
        COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsFailedStatus)('t.request_status')})::int AS failed,
        COUNT(*) FILTER (WHERE ${REQUEST_SUCCEEDED})::int AS succeeded,
        COUNT(*) FILTER (WHERE ${DISPOSITION_EXPR} = 'healed')::int AS healed,
        COUNT(*) FILTER (WHERE ${DISPOSITION_EXPR} = 'fallback')::int AS fallback
      FROM terminal t
      ${dim === 'provider' ? '' : `WHERE t.${dim} IS NOT NULL`}
      GROUP BY 1`;
        const rows = (await this.messageRepo.query(sql, this.params(params.tenantId, range, params.agentScope)));
        return rows.map((r) => ({
            key: r.key,
            requests: Number(r.requests),
            failed: Number(r.failed),
            succeeded: Number(r.succeeded),
            healed: Number(r.healed),
            fallback: Number(r.fallback),
        }));
    }
};
exports.RequestVolumeService = RequestVolumeService;
exports.RequestVolumeService = RequestVolumeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RequestVolumeService);
//# sourceMappingURL=request-volume.service.js.map