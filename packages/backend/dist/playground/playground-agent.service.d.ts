import { DataSource, Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { TenantCacheService } from '../common/services/tenant-cache.service';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
export declare class PlaygroundAgentService {
    private readonly agentRepo;
    private readonly tenantCache;
    private readonly dataSource;
    constructor(agentRepo: Repository<Agent>, tenantCache: TenantCacheService, dataSource: DataSource);
    resolve(ctx: TenantContext): Promise<Agent>;
    private findPlaygroundAgent;
}
