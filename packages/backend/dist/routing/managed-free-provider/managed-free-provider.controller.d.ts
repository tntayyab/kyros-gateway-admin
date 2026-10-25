import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { TenantCacheService } from '../../common/services/tenant-cache.service';
import { ManagedFreeProviderService } from './managed-free-provider.service';
declare class EnsureManagedFreeProviderBody {
    apiKey?: string;
}
export declare class ManagedFreeProviderController {
    private readonly managedFreeProvider;
    private readonly tenantCache;
    constructor(managedFreeProvider: ManagedFreeProviderService, tenantCache: TenantCacheService);
    ensure(providerId: string, ctx: TenantContext, user: {
        id?: string;
        email?: string;
    }, body: EnsureManagedFreeProviderBody): Promise<import("./managed-free-provider.service").ManagedFreeEnsureResult>;
}
export {};
