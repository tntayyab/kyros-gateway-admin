export declare class CreateNotificationRuleDto {
    agent_name: string;
    metric_type: 'tokens' | 'cost';
    threshold: number;
    period: 'hour' | 'day' | 'week' | 'month';
    action?: 'notify' | 'block' | 'both';
}
export declare class UpdateNotificationRuleDto {
    metric_type?: 'tokens' | 'cost';
    threshold?: number;
    period?: 'hour' | 'day' | 'week' | 'month';
    is_active?: boolean;
    action?: 'notify' | 'block' | 'both';
}
