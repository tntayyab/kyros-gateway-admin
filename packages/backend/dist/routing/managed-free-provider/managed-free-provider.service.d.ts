import { Repository } from 'typeorm';
import { ManagedFreeProviderConfig } from '../../common/constants/managed-free-providers';
import { TenantProvider } from '../../entities/tenant-provider.entity';
import { ModelDiscoveryService } from '../../model-discovery/model-discovery.service';
import { ProviderService } from '../routing-core/provider.service';
export interface ManagedFreeEnsureResult {
    connected: boolean;
    connection_id: string | null;
    source: 'existing' | 'auto' | 'manual' | 'none';
    auto_available: boolean;
}
export declare class ManagedFreeProviderService {
    private readonly providerRepo;
    private readonly providerService;
    private readonly discoveryService;
    private readonly logger;
    constructor(providerRepo: Repository<TenantProvider>, providerService: ProviderService, discoveryService: ModelDiscoveryService);
    private getConfig;
    findConnection(config: ManagedFreeProviderConfig, tenantId: string): Promise<TenantProvider | null>;
    ensureConnection(providerId: string, opts: {
        tenantId: string;
        userId: string | null;
        userEmail: string | null | undefined;
        apiKey?: string;
    }): Promise<ManagedFreeEnsureResult>;
    private persistKey;
    private mintVirtualKey;
}
