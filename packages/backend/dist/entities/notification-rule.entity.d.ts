export declare class NotificationRule {
    id: string;
    tenant_id: string;
    agent_id: string;
    agent_name: string;
    metric_type: 'tokens' | 'cost';
    threshold: number;
    period: 'hour' | 'day' | 'week' | 'month';
    action: 'notify' | 'block' | 'both';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
