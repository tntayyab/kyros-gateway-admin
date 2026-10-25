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
exports.ErrorBreakdownService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manifest_shared_1 = require("manifest-shared");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const request_entity_1 = require("../../entities/request.entity");
const range_util_1 = require("../../common/utils/range.util");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const query_helpers_1 = require("./query-helpers");
let ErrorBreakdownService = class ErrorBreakdownService {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    async getBreakdown(params) {
        const range = params.range ?? '30d';
        const cutoff = (0, postgres_sql_1.computeCutoff)((0, range_util_1.rangeToInterval)(range));
        const [groups, successful, autoFixed] = await Promise.all([
            this.queryErrorGroups(cutoff, params.tenantId, params.agentScope),
            this.querySuccessful(cutoff, params.tenantId, params.agentScope),
            this.queryAutoFixed(cutoff, params.tenantId, params.agentScope),
        ]);
        return this.assemble(range, groups, successful, autoFixed);
    }
    async queryErrorGroups(cutoff, tenantId, agentScope) {
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select('at.error_origin', 'origin')
            .addSelect('at.error_class', 'error_class')
            .addSelect('COUNT(*)', 'count')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere('at.error_origin IS NOT NULL')
            .groupBy('at.error_origin')
            .addGroupBy('at.error_class');
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const rows = await qb.getRawMany();
        return rows.map((r) => ({
            origin: String(r.origin),
            error_class: r.error_class ?? null,
            count: Number(r.count),
        }));
    }
    async querySuccessful(cutoff, tenantId, agentScope) {
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'count')
            .where('at.timestamp >= :cutoff', { cutoff });
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const row = await qb.getRawOne();
        return Number(row?.count ?? 0);
    }
    async queryAutoFixed(cutoff, tenantId, agentScope) {
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .leftJoin(request_entity_1.ManifestRequest, 'r', 'r.id = at.request_id')
            .select('COUNT(DISTINCT COALESCE(at.request_id, at.autofix_group_id, at.id))', 'count')
            .where('at.timestamp >= :cutoff', { cutoff })
            .andWhere("(at.autofix_role = 'original' OR at.status = 'auto_fixed')")
            .andWhere(`(r.autofix_status = 'retry_succeeded' OR (
          r.id IS NULL
          AND at.status = 'auto_fixed'
          AND EXISTS (
            SELECT 1 FROM agent_messages retry
            WHERE retry.autofix_group_id = at.autofix_group_id
              AND retry.tenant_id = at.tenant_id
              AND retry.autofix_role = 'retry'
              AND ${(0, query_helpers_1.sqlIsSuccessStatus)('retry.status')}
          )
        ))`);
        (0, query_helpers_1.addTenantFilter)(qb, tenantId, agentScope);
        (0, query_helpers_1.excludePlaygroundAgents)(qb);
        const row = await qb.getRawOne();
        return Number(row?.count ?? 0);
    }
    assemble(range, groups, successful, autoFixed) {
        const by_origin = Object.fromEntries(manifest_shared_1.ERROR_ORIGINS.map((o) => [o, 0]));
        const by_class = {};
        let total = 0;
        for (const g of groups) {
            by_origin[g.origin] = (by_origin[g.origin] ?? 0) + g.count;
            if (g.error_class)
                by_class[g.error_class] = (by_class[g.error_class] ?? 0) + g.count;
            total += g.count;
        }
        const provider = by_origin['provider'] ?? 0;
        const manifest = manifest_shared_1.MANIFEST_ERROR_ORIGINS.reduce((sum, o) => sum + (by_origin[o] ?? 0), 0);
        const denom = provider + successful;
        return {
            range,
            successful,
            total_errors: total,
            provider_errors: provider,
            transport_errors: by_origin['transport'] ?? 0,
            manifest_errors: manifest,
            auto_fixed: autoFixed,
            by_origin,
            by_class,
            provider_error_rate: denom > 0 ? provider / denom : 0,
        };
    }
};
exports.ErrorBreakdownService = ErrorBreakdownService;
exports.ErrorBreakdownService = ErrorBreakdownService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ErrorBreakdownService);
//# sourceMappingURL=error-breakdown.service.js.map