import { Repository } from 'typeorm';
import type { AuthType, RequestParamDefaults } from 'manifest-shared';
import { AgentModelParams } from '../../entities/agent-model-params.entity';
import { RoutingCacheService } from './routing-cache.service';
export declare class AgentModelParamsService {
    private readonly repo;
    private readonly cache;
    constructor(repo: Repository<AgentModelParams>, cache: RoutingCacheService);
    list(agentId: string): Promise<AgentModelParams[]>;
    get(agentId: string, scopeKey: string, provider: string, authType: AuthType, modelName: string): Promise<RequestParamDefaults | null>;
    set(agentId: string, scopeKey: string, provider: string, authType: AuthType, modelName: string, params: RequestParamDefaults): Promise<AgentModelParams>;
    delete(agentId: string, scopeKey: string, provider: string, authType: AuthType, modelName: string): Promise<void>;
}
