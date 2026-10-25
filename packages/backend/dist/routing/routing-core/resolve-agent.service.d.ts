import { Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';
export interface ResolveOptions {
    allowPlayground?: boolean;
}
export declare class ResolveAgentService {
    private readonly agentRepo;
    private readonly cache;
    constructor(agentRepo: Repository<Agent>);
    resolve(tenantId: string | null, agentName: string, options?: ResolveOptions): Promise<Agent>;
    invalidate(tenantId: string, agentName: string): void;
    invalidateTenant(tenantId: string): void;
}
