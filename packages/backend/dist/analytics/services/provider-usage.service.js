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
exports.ProviderUsageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const query_helpers_1 = require("./query-helpers");
const SPARKLINE_DAYS = 7;
let ProviderUsageService = class ProviderUsageService {
    messageRepo;
    constructor(messageRepo) {
        this.messageRepo = messageRepo;
    }
    utcDayLabels(now) {
        const days = [];
        for (let i = SPARKLINE_DAYS - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setUTCDate(d.getUTCDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        return days;
    }
    async getUsage(tenantId) {
        if (!tenantId)
            return [];
        const dayExpr = "date_trunc('day', at.timestamp AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'";
        const qb = this.messageRepo
            .createQueryBuilder('at')
            .select('at.provider', 'provider')
            .addSelect('at.auth_type', 'auth_type')
            .addSelect("COALESCE(at.provider_key_label, 'Default')", 'key_label')
            .addSelect(`to_char(${dayExpr}, 'YYYY-MM-DD')`, 'day')
            .addSelect('SUM(COALESCE(at.input_tokens, 0) + COALESCE(at.output_tokens, 0))', 'tokens')
            .addSelect('SUM(COALESCE(at.cost_usd, 0))', 'cost')
            .addSelect((0, query_helpers_1.sqlCountMessages)(), 'messages')
            .addSelect('COUNT(*)', 'attempts')
            .addSelect(`COUNT(*) FILTER (WHERE ${(0, query_helpers_1.sqlIsSuccessStatus)('at.status')})`, 'succeeded')
            .addSelect('MAX(at.timestamp)', 'last_used_at')
            .where("at.timestamp >= NOW() - INTERVAL '30 days'")
            .andWhere((0, query_helpers_1.sqlIsCompletedStatus)('at.status'))
            .groupBy('at.provider')
            .addGroupBy('at.auth_type')
            .addGroupBy("COALESCE(at.provider_key_label, 'Default')")
            .addGroupBy('day');
        (0, query_helpers_1.addTenantFilter)(qb, tenantId);
        const rows = (await qb.getRawMany());
        const dayLabels = this.utcDayLabels(new Date());
        const sparklineIndex = new Map(dayLabels.map((d, i) => [d, i]));
        const byKey = new Map();
        for (const row of rows) {
            if (!row.provider)
                continue;
            const authType = row.auth_type ?? 'api_key';
            const keyLabel = row.key_label ?? 'Default';
            const key = `${row.provider}::${authType}::${keyLabel.toLowerCase()}`;
            let acc = byKey.get(key);
            if (!acc) {
                acc = {
                    provider: row.provider,
                    auth_type: authType,
                    key_label: keyLabel,
                    tokens: 0,
                    messages: 0,
                    cost: 0,
                    attempts: 0,
                    succeeded: 0,
                    lastUsed: null,
                    sparkline: new Array(SPARKLINE_DAYS).fill(0),
                };
                byKey.set(key, acc);
            }
            const tokens = Number(row.tokens) || 0;
            acc.tokens += tokens;
            acc.messages += Number(row.messages) || 0;
            acc.cost += Number(row.cost) || 0;
            acc.attempts += Number(row.attempts) || 0;
            acc.succeeded += Number(row.succeeded) || 0;
            const lastUsedMs = row.last_used_at instanceof Date
                ? row.last_used_at.getTime()
                : row.last_used_at
                    ? new Date(row.last_used_at).getTime()
                    : null;
            if (lastUsedMs !== null && (acc.lastUsed === null || lastUsedMs > acc.lastUsed)) {
                acc.lastUsed = lastUsedMs;
            }
            const slot = sparklineIndex.get(row.day);
            if (slot !== undefined)
                acc.sparkline[slot] = tokens;
        }
        return Array.from(byKey.values()).map((acc) => ({
            provider: acc.provider,
            auth_type: acc.auth_type,
            key_label: acc.key_label,
            consumption_tokens: acc.tokens,
            consumption_messages: acc.messages,
            consumption_cost: acc.cost,
            attempts_30d: acc.attempts,
            succeeded_30d: acc.succeeded,
            last_used_at: acc.lastUsed === null ? null : new Date(acc.lastUsed).toISOString(),
            sparkline_7d: acc.sparkline,
        }));
    }
};
exports.ProviderUsageService = ProviderUsageService;
exports.ProviderUsageService = ProviderUsageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProviderUsageService);
//# sourceMappingURL=provider-usage.service.js.map