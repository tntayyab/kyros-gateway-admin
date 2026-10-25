import type { AuthType, RequestParamDefaults } from 'manifest-shared';
export declare class AgentModelParams {
    id: string;
    agent_id: string;
    scope_key: string;
    provider: string;
    auth_type: AuthType;
    model_name: string;
    params: RequestParamDefaults;
    created_at: string;
    updated_at: string;
}
