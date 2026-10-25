import { Repository } from 'typeorm';
import { TenantProvider } from '../entities/tenant-provider.entity';
import { ModelDiscoveryService } from '../model-discovery/model-discovery.service';
export declare class OllamaSyncService {
    private readonly providerRepo;
    private readonly discoveryService;
    private readonly logger;
    constructor(providerRepo: Repository<TenantProvider>, discoveryService: ModelDiscoveryService);
    sync(): Promise<{
        count: number;
    }>;
}
