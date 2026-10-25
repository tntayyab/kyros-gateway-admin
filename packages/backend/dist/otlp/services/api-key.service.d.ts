import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { Agent } from '../../entities/agent.entity';
import { AgentApiKey } from '../../entities/agent-api-key.entity';
import { AgentKeyAuthGuard } from '../guards/agent-key-auth.guard';
export declare class ApiKeyGeneratorService {
    private readonly tenantRepo;
    private readonly agentRepo;
    private readonly keyRepo;
    private readonly otlpAuthGuard;
    constructor(tenantRepo: Repository<Tenant>, agentRepo: Repository<Agent>, keyRepo: Repository<AgentApiKey>, otlpAuthGuard: AgentKeyAuthGuard);
    private generateKey;
    onboardAgent(params: {
        tenantId?: string | null;
        ownerUserId?: string | null;
        agentName: string;
        organizationName?: string;
        email?: string;
        agentDescription?: string;
        displayName?: string;
        agentCategory?: string;
        agentPlatform?: string;
        autofixEnabled?: boolean;
        recordMessages?: boolean;
    }): Promise<{
        tenantId: string;
        agentId: string;
        apiKey: string;
    }>;
    getKeyForAgent(tenantId: string, agentName: string): Promise<{
        keyPrefix: string;
        fullKey?: string;
    }>;
    rotateKey(tenantId: string, agentName: string): Promise<{
        apiKey: string;
    }>;
}
