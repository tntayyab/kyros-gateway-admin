export interface TelemetryPayloadV1 {
    schema_version: 1;
    install_id: string;
    manifest_version: string;
    messages_total: number;
    messages_by_provider: Record<string, number>;
    messages_by_tier: Record<string, number>;
    messages_by_auth_type: Record<string, number>;
    tokens_input_total: number;
    tokens_output_total: number;
    cost_usd_total?: number;
    cost_usd_by_provider?: Record<string, number>;
    requests_total?: number;
    errors_total?: number;
    errors_by_class?: Record<string, number>;
    agents_total: number;
    agents_by_platform: Record<string, number>;
    cli_keys_total?: number;
    cli_keys_active_7d?: number;
    mcp_clients_total?: number;
    mcp_consents_total?: number;
    mcp_tokens_issued_24h?: number;
    mcp_clients_active_24h?: number;
    mcp_clients_by_name?: Record<string, number>;
    platform: string;
    arch: string;
}
