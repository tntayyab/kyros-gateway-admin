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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmMetricsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ttl_cache_1 = require("../common/utils/ttl-cache");
const postgres_sql_1 = require("../common/utils/postgres-sql");
const query_helpers_1 = require("../analytics/services/query-helpers");
const crm_metrics_filters_1 = require("./crm-metrics.filters");
const HEALED_INDEX = 'IDX_requests_autofix_healed';
const TENANT_TIMESTAMP_INDEX = 'IDX_requests_tenant_timestamp';
const CACHE_TTL_MS = 60_000;
const STATEMENT_TIMEOUT_MS = 1_500;
const LOCK_TIMEOUT_MS = 5_000;
const INDEX_READY_SQL = `
  SELECT 1 FROM pg_index i
  JOIN pg_class c ON c.oid = i.indexrelid
  WHERE c.relname = $1 AND i.indisvalid
`;
const IS_HEALED = `r.autofix_status = 'retry_succeeded' AND ${(0, query_helpers_1.sqlIsSuccessStatus)('r.status')}`;
const COHORT_SQL = `
  SELECT lower(u.email)                             AS email,
         u.name                                     AS user_name,
         r.tenant_id                                AS tenant_id,
         count(*) FILTER (WHERE r.timestamp > $1)   AS healed_recent,
         count(*)                                   AS healed_all,
         min(r.timestamp)                           AS first_heal_at,
         max(r.timestamp)                           AS last_heal_at
  FROM requests r
  JOIN tenants t ON t.id = r.tenant_id
  JOIN "user" u ON u.id = t.owner_user_id
  WHERE ${IS_HEALED}
    AND u."emailVerified" = true
  GROUP BY lower(u.email), u.name, r.tenant_id
  HAVING count(*) FILTER (WHERE r.timestamp > $1) > 0
`;
const SIGNUPS_SQL = `
  WITH signups AS MATERIALIZED (
    SELECT lower(u.email)   AS email,
           u.name           AS user_name,
           u."createdAt"    AS signed_up_at,
           t.id             AS tenant_id
    FROM "user" u
    LEFT JOIN tenants t ON t.owner_user_id = u.id
    WHERE u."emailVerified" = true
      AND u."createdAt" > $1
      AND NOT EXISTS (
        SELECT 1 FROM waitlist_claims w WHERE lower(w.email) = lower(u.email)
      )
  )
  SELECT s.email, s.user_name, s.signed_up_at, a.last_request_at
  FROM signups s
  LEFT JOIN LATERAL (
    SELECT r.timestamp AS last_request_at
    FROM requests r
    WHERE r.tenant_id = s.tenant_id
    ORDER BY r.timestamp DESC
    LIMIT 1
  ) a ON true
`;
const CLAIMS_SQL = `
  SELECT email, source, claimed_at
  FROM waitlist_claims
  WHERE claimed_at > $1
  ORDER BY claimed_at DESC
`;
let CrmMetricsService = class CrmMetricsService {
    dataSource;
    cohortCache = new ttl_cache_1.TtlCache({
        maxSize: 8,
        ttlMs: CACHE_TTL_MS,
    });
    claimsCache = new ttl_cache_1.TtlCache({
        maxSize: 8,
        ttlMs: CACHE_TTL_MS,
    });
    signupsCache = new ttl_cache_1.TtlCache({
        maxSize: 8,
        ttlMs: CACHE_TTL_MS,
    });
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getHealedCohort(days, now = new Date()) {
        const cached = this.cohortCache.get(days);
        if (cached)
            return cached;
        const cutoff = cutoffFor(days, now);
        const users = await this.withRunner(async (runner) => {
            const ready = (await runner.query(INDEX_READY_SQL, [HEALED_INDEX]));
            if (ready.length === 0) {
                throw new common_1.ServiceUnavailableException(`${HEALED_INDEX} is missing or invalid; refusing to run an unindexed scan`);
            }
            const merged = mergeByEmail((await runner.query(COHORT_SQL, [cutoff])));
            return buildUsers(merged);
        });
        this.cohortCache.set(days, users);
        return users;
    }
    async getCorporateSignups(days, now = new Date()) {
        const cached = this.signupsCache.get(days);
        if (cached)
            return cached;
        const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString();
        const signups = await this.withRunner(async (runner) => {
            const ready = (await runner.query(INDEX_READY_SQL, [TENANT_TIMESTAMP_INDEX]));
            if (ready.length === 0) {
                throw new common_1.ServiceUnavailableException(`${TENANT_TIMESTAMP_INDEX} is missing or invalid; refusing to run an unindexed scan`);
            }
            return buildSignups((await runner.query(SIGNUPS_SQL, [cutoff])));
        });
        this.signupsCache.set(days, signups);
        return signups;
    }
    async getConversions(days, now = new Date()) {
        const cached = this.claimsCache.get(days);
        if (cached)
            return cached;
        const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString();
        const claims = await this.withRunner(async (runner) => {
            const rows = (await runner.query(CLAIMS_SQL, [cutoff]));
            return rows.map((row) => ({
                email: row.email.toLowerCase(),
                source: row.source,
                claimed_at: new Date(row.claimed_at).toISOString(),
            }));
        });
        this.claimsCache.set(days, claims);
        return claims;
    }
    async withRunner(fn) {
        const runner = this.dataSource.createQueryRunner();
        try {
            await runner.connect();
            await runner.startTransaction();
            try {
                await runner.query(`SET LOCAL lock_timeout = '${LOCK_TIMEOUT_MS}ms'`);
                await runner.query(`SET LOCAL statement_timeout = '${STATEMENT_TIMEOUT_MS}ms'`);
                const result = await fn(runner);
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
};
exports.CrmMetricsService = CrmMetricsService;
exports.CrmMetricsService = CrmMetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CrmMetricsService);
function cutoffFor(days, now) {
    return (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(now.getTime() - days * 86_400_000));
}
function mergeByEmail(rows) {
    const merged = new Map();
    for (const row of rows) {
        const email = row.email.trim().toLowerCase();
        if ((0, crm_metrics_filters_1.isExcludedEmail)(email))
            continue;
        const first = new Date(row.first_heal_at).getTime();
        const last = new Date(row.last_heal_at).getTime();
        const existing = merged.get(email);
        if (!existing) {
            merged.set(email, {
                email,
                name: row.user_name,
                healed_recent: Number(row.healed_recent),
                healed_all: Number(row.healed_all),
                first_heal_at: first,
                last_heal_at: last,
            });
            continue;
        }
        existing.healed_recent += Number(row.healed_recent);
        existing.healed_all += Number(row.healed_all);
        existing.first_heal_at = Math.min(existing.first_heal_at, first);
        existing.last_heal_at = Math.max(existing.last_heal_at, last);
        existing.name = existing.name ?? row.user_name;
    }
    return merged;
}
function buildUsers(merged) {
    const users = [...merged.values()].map((entry) => ({
        email: entry.email,
        name: entry.name,
        healed_recent: entry.healed_recent,
        healed_all: entry.healed_all,
        first_heal_at: new Date(entry.first_heal_at).toISOString(),
        last_heal_at: new Date(entry.last_heal_at).toISOString(),
    }));
    return users.sort((a, b) => b.healed_recent - a.healed_recent);
}
function buildSignups(rows) {
    const byDomain = new Map();
    for (const row of rows) {
        const email = row.email.trim().toLowerCase();
        if (!(0, crm_metrics_filters_1.isCorporateSignupEmail)(email))
            continue;
        const lastRequest = row.last_request_at ? new Date(row.last_request_at) : null;
        const signup = {
            email,
            name: row.user_name,
            domain: (0, crm_metrics_filters_1.domainOf)(email),
            signed_up_at: new Date(row.signed_up_at).toISOString(),
            last_request_at: lastRequest ? lastRequest.toISOString() : null,
            has_traffic: lastRequest !== null,
            domain_signups: 0,
        };
        const bucket = byDomain.get(signup.domain);
        if (bucket)
            bucket.push(signup);
        else
            byDomain.set(signup.domain, [signup]);
    }
    const kept = [];
    for (const signups of byDomain.values()) {
        if ((0, crm_metrics_filters_1.isSignupCluster)(signups))
            continue;
        if ((0, crm_metrics_filters_1.isMachineGeneratedDomain)(signups.map((s) => s.email.split('@')[0])))
            continue;
        for (const signup of signups) {
            signup.domain_signups = signups.length;
            kept.push(signup);
        }
    }
    return kept.sort((a, b) => b.domain_signups - a.domain_signups ||
        Date.parse(b.signed_up_at) - Date.parse(a.signed_up_at));
}
//# sourceMappingURL=crm-metrics.service.js.map