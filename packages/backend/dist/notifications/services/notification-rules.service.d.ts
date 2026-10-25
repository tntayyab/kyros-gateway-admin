import { Repository } from 'typeorm';
import { NotificationRule } from '../../entities/notification-rule.entity';
import { NotificationLog } from '../../entities/notification-log.entity';
import { AgentMessage } from '../../entities/agent-message.entity';
import { Agent } from '../../entities/agent.entity';
import { CreateNotificationRuleDto, UpdateNotificationRuleDto } from '../dto/notification-rule.dto';
export interface NotificationRuleWithTriggerCount extends NotificationRule {
    trigger_count: number;
}
export declare class NotificationRulesService {
    private readonly ruleRepo;
    private readonly logRepo;
    private readonly messageRepo;
    private readonly agentRepo;
    constructor(ruleRepo: Repository<NotificationRule>, logRepo: Repository<NotificationLog>, messageRepo: Repository<AgentMessage>, agentRepo: Repository<Agent>);
    listRules(tenantId: string | null, agentName: string): Promise<NotificationRuleWithTriggerCount[]>;
    createRule(tenantId: string | null, dto: CreateNotificationRuleDto): Promise<NotificationRule>;
    updateRule(tenantId: string | null, ruleId: string, dto: UpdateNotificationRuleDto): Promise<NotificationRule | undefined>;
    deleteRule(tenantId: string | null, ruleId: string): Promise<void>;
    getConsumption(tenantId: string, agentName: string, metric: 'tokens' | 'cost', periodStart: string, periodEnd: string): Promise<number>;
    getAllActiveRules(): Promise<NotificationRule[]>;
    getActiveRulesForTenant(tenantId: string): Promise<NotificationRule[]>;
    getActiveBlockRules(tenantId: string, agentName: string): Promise<NotificationRule[]>;
    getRule(ruleId: string): Promise<NotificationRule | undefined>;
    getOwnedRule(tenantId: string | null, ruleId: string): Promise<NotificationRule | undefined>;
    private resolveAgent;
    private verifyOwnership;
}
