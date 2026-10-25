export declare class AgentUsageDaily {
    tenant_id: string;
    agent_id: string;
    day: string;
    request_count: string;
    successful_request_count: string;
    failed_request_count: string;
    input_tokens: string;
    output_tokens: string;
    cost_usd: string;
    last_active_at: string | null;
    updated_at: string;
}
