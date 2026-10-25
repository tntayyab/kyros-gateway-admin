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
exports.ErrorDiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../entities/agent-message.entity");
const secret_scrub_1 = require("../common/utils/secret-scrub");
const error_pages_service_1 = require("./error-pages.service");
const MIN_TENANTS_PER_VARIANT = 3;
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
function scrubForPublic(text) {
    return (0, secret_scrub_1.scrubSecrets)(text ?? '').replace(EMAIL_RE, '[email]');
}
function categoryFor(http) {
    if (http === 429)
        return { id: 'rate_limit', label: 'Rate limit' };
    if (http === 401 || http === 403)
        return { id: 'auth', label: 'Authentication' };
    if (http === 402)
        return { id: 'billing', label: 'Billing / quota' };
    if (http === 404)
        return { id: 'model_unavailable', label: 'Model unavailable' };
    if (http != null && http >= 500)
        return { id: 'server', label: 'Server error' };
    if (http != null && http >= 400)
        return { id: 'bad_request', label: 'Bad request' };
    return { id: 'unknown', label: 'Unknown' };
}
let ErrorDiscoveryService = class ErrorDiscoveryService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async discover() {
        const aggRows = await this.repo.query(`
      SELECT e.provider AS provider,
             e.error_http_status AS http,
             COUNT(*)::int AS volume_30d,
             COUNT(*) FILTER (WHERE e.timestamp >= NOW() - INTERVAL '7 days')::int AS volume_7d,
             COUNT(DISTINCT e.tenant_id)::int AS tenants,
             MIN(e.timestamp) AS first_seen,
             MAX(e.timestamp) AS last_seen,
             AVG(CASE WHEN ok.trace_id IS NOT NULL THEN 1.0 ELSE 0.0 END)::float AS recovery,
             (array_agg(e.error_message ORDER BY e.timestamp DESC))[1] AS sample
      FROM agent_messages e
      LEFT JOIN (
        SELECT DISTINCT trace_id FROM agent_messages WHERE status IN ('ok', 'success') AND trace_id IS NOT NULL
      ) ok ON ok.trace_id = e.trace_id
      WHERE e.status IN ('error','fallback_error','rate_limited','failed')
        AND e.tenant_id IS NOT NULL
        AND e.provider IS NOT NULL
        AND e.provider NOT LIKE 'custom:%'
      GROUP BY e.provider, e.error_http_status
      HAVING COUNT(DISTINCT e.tenant_id) >= ${error_pages_service_1.MIN_TENANTS_FOR_PUBLIC}
      ORDER BY COUNT(DISTINCT e.tenant_id) DESC
    `);
        const trendRows = await this.repo.query(`
        SELECT e.provider AS provider,
               e.error_http_status AS http,
               to_char(date_trunc('day', e.timestamp), 'YYYY-MM-DD') AS day,
               COUNT(*)::int AS cnt
        FROM agent_messages e
        WHERE e.status IN ('error','fallback_error','rate_limited','failed')
          AND e.timestamp >= NOW() - INTERVAL '14 days'
          AND e.tenant_id IS NOT NULL
          AND e.provider IS NOT NULL
          AND e.provider NOT LIKE 'custom:%'
        GROUP BY e.provider, e.error_http_status, day
        ORDER BY day ASC
      `);
        const trendByKey = new Map();
        for (const r of trendRows) {
            const key = `${r.provider}|${r.http ?? 'none'}`;
            if (!trendByKey.has(key))
                trendByKey.set(key, []);
            trendByKey.get(key).push({ date: r.day, count: Number(r.cnt) });
        }
        const variantRows = await this.repo.query(`
        SELECT e.provider AS provider,
               e.error_http_status AS http,
               e.error_message AS msg,
               COUNT(*)::int AS cnt
        FROM agent_messages e
        WHERE e.status IN ('error','fallback_error','rate_limited','failed')
          AND e.error_message IS NOT NULL
          AND e.tenant_id IS NOT NULL
          AND e.provider IS NOT NULL
          AND e.provider NOT LIKE 'custom:%'
        GROUP BY e.provider, e.error_http_status, e.error_message
        HAVING COUNT(DISTINCT e.tenant_id) >= ${MIN_TENANTS_PER_VARIANT}
        ORDER BY cnt DESC
      `);
        const variantsByKey = new Map();
        for (const r of variantRows) {
            const key = `${r.provider}|${r.http ?? 'none'}`;
            if (!variantsByKey.has(key))
                variantsByKey.set(key, []);
            const list = variantsByKey.get(key);
            if (list.length < 5)
                list.push(scrubForPublic(r.msg).slice(0, 160));
        }
        return aggRows.map((r) => {
            const http = r.http != null ? Number(r.http) : null;
            const cat = categoryFor(http);
            const key = `${r.provider}|${http ?? 'none'}`;
            return {
                cluster_key: key,
                provider: r.provider,
                http_status: http,
                category: cat.id,
                category_label: cat.label,
                suggested_slug: `${r.provider}-${http ?? 'error'}-${cat.id.replace(/_/g, '-')}`,
                tenants: Number(r.tenants),
                volume_7d: Number(r.volume_7d),
                volume_30d: Number(r.volume_30d),
                recovery_rate: r.recovery != null ? Number(r.recovery) : null,
                first_seen: r.first_seen,
                last_seen: r.last_seen,
                sample_message: scrubForPublic(r.sample),
                variants: variantsByKey.get(key) ?? [],
                trend: trendByKey.get(key) ?? [],
            };
        });
    }
};
exports.ErrorDiscoveryService = ErrorDiscoveryService;
exports.ErrorDiscoveryService = ErrorDiscoveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ErrorDiscoveryService);
//# sourceMappingURL=error-discovery.service.js.map