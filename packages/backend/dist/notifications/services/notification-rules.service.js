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
exports.NotificationRulesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const notification_rule_entity_1 = require("../../entities/notification-rule.entity");
const notification_log_entity_1 = require("../../entities/notification-log.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const agent_entity_1 = require("../../entities/agent.entity");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
const NOTIFY_ACTIONS = ['notify', 'both'];
const BLOCK_ACTIONS = ['block', 'both'];
let NotificationRulesService = class NotificationRulesService {
    ruleRepo;
    logRepo;
    messageRepo;
    agentRepo;
    constructor(ruleRepo, logRepo, messageRepo, agentRepo) {
        this.ruleRepo = ruleRepo;
        this.logRepo = logRepo;
        this.messageRepo = messageRepo;
        this.agentRepo = agentRepo;
    }
    async listRules(tenantId, agentName) {
        if (!tenantId)
            return [];
        const rules = await this.ruleRepo.find({
            where: { tenant_id: tenantId, agent_name: agentName },
            order: { created_at: 'DESC' },
        });
        if (rules.length === 0)
            return [];
        const ruleIds = rules.map((r) => r.id);
        const counts = await this.logRepo
            .createQueryBuilder('nl')
            .select('nl.rule_id', 'rule_id')
            .addSelect('COUNT(*)', 'trigger_count')
            .where('nl.rule_id IN (:...ids)', { ids: ruleIds })
            .groupBy('nl.rule_id')
            .getRawMany();
        const countMap = new Map();
        for (const row of counts)
            countMap.set(row.rule_id, Number(row.trigger_count));
        return rules.map((rule) => ({ ...rule, trigger_count: countMap.get(rule.id) ?? 0 }));
    }
    async createRule(tenantId, dto) {
        const agent = await this.resolveAgent(tenantId, dto.agent_name);
        const id = (0, uuid_1.v4)();
        const now = (0, postgres_sql_1.toSqlTimestamp)();
        const rule = {
            id,
            tenant_id: agent.tenant_id,
            agent_id: agent.id,
            agent_name: dto.agent_name,
            metric_type: dto.metric_type,
            threshold: dto.threshold,
            period: dto.period,
            action: dto.action ?? 'notify',
            is_active: true,
            created_at: now,
            updated_at: now,
        };
        await this.ruleRepo.insert(rule);
        return (await this.ruleRepo.findOneBy({ id }));
    }
    async updateRule(tenantId, ruleId, dto) {
        await this.verifyOwnership(tenantId, ruleId);
        const patch = {};
        if (dto.metric_type !== undefined)
            patch.metric_type = dto.metric_type;
        if (dto.threshold !== undefined)
            patch.threshold = dto.threshold;
        if (dto.period !== undefined)
            patch.period = dto.period;
        if (dto.action !== undefined)
            patch.action = dto.action;
        if (dto.is_active !== undefined)
            patch.is_active = dto.is_active;
        if (Object.keys(patch).length === 0) {
            return this.getRule(ruleId);
        }
        patch.updated_at = (0, postgres_sql_1.toSqlTimestamp)();
        await this.ruleRepo.update({ id: ruleId }, patch);
        return this.getRule(ruleId);
    }
    async deleteRule(tenantId, ruleId) {
        await this.verifyOwnership(tenantId, ruleId);
        await this.ruleRepo.delete({ id: ruleId });
    }
    async getConsumption(tenantId, agentName, metric, periodStart, periodEnd) {
        const expr = metric === 'tokens'
            ? 'COALESCE(SUM(at.input_tokens + at.output_tokens), 0)'
            : 'COALESCE(SUM(at.cost_usd), 0)';
        const row = await this.messageRepo
            .createQueryBuilder('at')
            .select(expr, 'total')
            .where('at.tenant_id = :tenantId', { tenantId })
            .andWhere(`(
          at.agent_id = (
            SELECT id FROM agents
            WHERE tenant_id = at.tenant_id
              AND name = :agentName
              AND deleted_at IS NULL
            LIMIT 1
          )
          OR (
            at.agent_id IS NULL
            AND at.agent_name = :agentName
          )
        )`, { agentName })
            .andWhere('at.timestamp >= :periodStart', { periodStart })
            .andWhere('at.timestamp < :periodEnd', { periodEnd })
            .getRawOne();
        return Number(row?.total ?? 0);
    }
    getAllActiveRules() {
        return this.ruleRepo.find({
            where: { is_active: true, action: (0, typeorm_2.In)([...NOTIFY_ACTIONS]) },
        });
    }
    getActiveRulesForTenant(tenantId) {
        return this.ruleRepo.find({
            where: { tenant_id: tenantId, is_active: true, action: (0, typeorm_2.In)([...NOTIFY_ACTIONS]) },
        });
    }
    getActiveBlockRules(tenantId, agentName) {
        return this.ruleRepo.find({
            where: {
                tenant_id: tenantId,
                agent_name: agentName,
                is_active: true,
                action: (0, typeorm_2.In)([...BLOCK_ACTIONS]),
            },
        });
    }
    getRule(ruleId) {
        return this.ruleRepo.findOneBy({ id: ruleId }).then((r) => r ?? undefined);
    }
    async getOwnedRule(tenantId, ruleId) {
        if (!tenantId)
            return undefined;
        const rule = await this.ruleRepo.findOneBy({ id: ruleId, tenant_id: tenantId });
        return rule ?? undefined;
    }
    async resolveAgent(tenantId, agentName) {
        if (!tenantId)
            throw new common_1.NotFoundException('Tenant not found');
        const agent = await this.agentRepo
            .createQueryBuilder('a')
            .select(['a.id', 'a.tenant_id'])
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.name = :agentName', { agentName })
            .andWhere('a.deleted_at IS NULL')
            .getOne();
        if (!agent)
            throw new common_1.BadRequestException(`Agent "${agentName}" not found`);
        return { id: agent.id, tenant_id: agent.tenant_id };
    }
    async verifyOwnership(tenantId, ruleId) {
        if (!tenantId)
            throw new common_1.NotFoundException('Notification rule not found');
        const count = await this.ruleRepo.count({ where: { id: ruleId, tenant_id: tenantId } });
        if (count === 0)
            throw new common_1.NotFoundException('Notification rule not found');
    }
};
exports.NotificationRulesService = NotificationRulesService;
exports.NotificationRulesService = NotificationRulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_rule_entity_1.NotificationRule)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __param(2, (0, typeorm_1.InjectRepository)(agent_message_entity_1.AgentMessage)),
    __param(3, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationRulesService);
//# sourceMappingURL=notification-rules.service.js.map