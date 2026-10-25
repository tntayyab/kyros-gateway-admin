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
exports.AgentAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const range_util_1 = require("../../common/utils/range.util");
const query_helpers_1 = require("./query-helpers");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
let AgentAnalyticsService = class AgentAnalyticsService {
    turnRepo;
    constructor(turnRepo) {
        this.turnRepo = turnRepo;
    }
    async getUsage(range, scope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const prevInterval = (0, range_util_1.rangeToPreviousInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const prevCutoff = (0, postgres_sql_1.computeCutoff)(prevInterval);
        const [currentRows, prevRows] = await Promise.all([
            this.turnRepo
                .createQueryBuilder('at')
                .select('COALESCE(SUM(at.input_tokens), 0)', 'input')
                .addSelect('COALESCE(SUM(at.output_tokens), 0)', 'output')
                .addSelect('COALESCE(SUM(at.cache_read_tokens), 0)', 'cache_read')
                .addSelect('COALESCE(SUM(at.cache_creation_tokens), 0)', 'cache_creation')
                .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
                .where('at.timestamp >= :cutoff', { cutoff })
                .andWhere('at.tenant_id = :tenantId', { tenantId: scope.tenantId })
                .andWhere('at.agent_id = :agentId', { agentId: scope.agentId })
                .getRawOne(),
            this.turnRepo
                .createQueryBuilder('at')
                .select('COALESCE(SUM(at.input_tokens + at.output_tokens), 0)', 'total')
                .where('at.timestamp >= :prevCutoff', { prevCutoff })
                .andWhere('at.timestamp < :cutoff', { cutoff })
                .andWhere('at.tenant_id = :tenantId', { tenantId: scope.tenantId })
                .andWhere('at.agent_id = :agentId', { agentId: scope.agentId })
                .getRawOne(),
        ]);
        const input = Number(currentRows?.input ?? 0);
        const output = Number(currentRows?.output ?? 0);
        const cacheRead = Number(currentRows?.cache_read ?? 0);
        const cacheCreation = Number(currentRows?.cache_creation ?? 0);
        const messages = Number(currentRows?.messages ?? 0);
        const currentTotal = input + output;
        const previousTotal = Number(prevRows?.total ?? 0);
        return {
            range,
            total_tokens: currentTotal,
            input_tokens: input,
            output_tokens: output,
            cache_read_tokens: cacheRead,
            cache_creation_tokens: cacheCreation,
            cache_read_rate: input > 0 ? cacheRead / input : 0,
            cache_write_rate: input > 0 ? cacheCreation / input : 0,
            message_count: messages,
            trend_pct: (0, query_helpers_1.computeTrend)(currentTotal, previousTotal),
        };
    }
    async getCosts(range, scope) {
        const interval = (0, range_util_1.rangeToInterval)(range);
        const prevInterval = (0, range_util_1.rangeToPreviousInterval)(range);
        const cutoff = (0, postgres_sql_1.computeCutoff)(interval);
        const prevCutoff = (0, postgres_sql_1.computeCutoff)(prevInterval);
        const safeCost = (0, postgres_sql_1.sqlSanitizeCost)('at.cost_usd');
        const [currentRows, prevRows, modelRows] = await Promise.all([
            this.turnRepo
                .createQueryBuilder('at')
                .select(`COALESCE(SUM(${safeCost}), 0)`, 'total')
                .where('at.timestamp >= :cutoff', { cutoff })
                .andWhere('at.tenant_id = :tenantId', { tenantId: scope.tenantId })
                .andWhere('at.agent_id = :agentId', { agentId: scope.agentId })
                .getRawOne(),
            this.turnRepo
                .createQueryBuilder('at')
                .select(`COALESCE(SUM(${safeCost}), 0)`, 'total')
                .where('at.timestamp >= :prevCutoff', { prevCutoff })
                .andWhere('at.timestamp < :cutoff', { cutoff })
                .andWhere('at.tenant_id = :tenantId', { tenantId: scope.tenantId })
                .andWhere('at.agent_id = :agentId', { agentId: scope.agentId })
                .getRawOne(),
            this.turnRepo
                .createQueryBuilder('at')
                .select('at.model', 'model')
                .addSelect(`COALESCE(SUM(${safeCost}), 0)`, 'cost_usd')
                .addSelect('COALESCE(SUM(at.input_tokens), 0)', 'input_tokens')
                .addSelect('COALESCE(SUM(at.output_tokens), 0)', 'output_tokens')
                .where('at.timestamp >= :cutoff', { cutoff })
                .andWhere('at.tenant_id = :tenantId', { tenantId: scope.tenantId })
                .andWhere('at.agent_id = :agentId', { agentId: scope.agentId })
                .andWhere('at.model IS NOT NULL')
                .groupBy('at.model')
                .orderBy('cost_usd', 'DESC')
                .getRawMany(),
        ]);
        const currentCost = Number(currentRows?.total ?? 0);
        const previousCost = Number(prevRows?.total ?? 0);
        return {
            range,
            total_cost_usd: currentCost,
            trend_pct: (0, query_helpers_1.computeTrend)(currentCost, previousCost),
            by_model: modelRows.map((r) => ({
                model: String(r['model']),
                cost_usd: Number(r['cost_usd']),
                input_tokens: Number(r['input_tokens']),
                output_tokens: Number(r['output_tokens']),
            })),
        };
    }
};
exports.AgentAnalyticsService = AgentAnalyticsService;
exports.AgentAnalyticsService = AgentAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AgentAnalyticsService);
//# sourceMappingURL=agent-analytics.service.js.map