import type { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { TenantProvider } from '../entities/tenant-provider.entity';
import { ModelPricingCacheService } from '../model-prices/model-pricing-cache.service';
import { CustomProviderService } from './custom-provider/custom-provider.service';
import { ProviderService } from './routing-core/provider.service';
import { RoutingCacheService } from './routing-core/routing-cache.service';
import { ModelDiscoveryService } from '../model-discovery/model-discovery.service';
import { ProviderKeyParamDto, ProviderParamDto, RemoveProviderQueryDto, RenameProviderKeyDto } from './dto/routing.dto';
export declare class TenantProvidersController {
    private readonly providerRepo;
    private readonly pricingCache;
    private readonly customProviderService;
    private readonly providerService;
    private readonly discoveryService;
    private readonly routingCache;
    private readonly cacheManager;
    constructor(providerRepo: Repository<TenantProvider>, pricingCache: ModelPricingCacheService, customProviderService: CustomProviderService, providerService: ProviderService, discoveryService: ModelDiscoveryService, routingCache: RoutingCacheService, cacheManager: Cache);
    private requireTenant;
    private invalidateTenantRouting;
    refreshModels(ctx: TenantContext): Promise<{
        ok: boolean;
    }>;
    renameProviderKey(ctx: TenantContext, params: ProviderKeyParamDto, body: RenameProviderKeyDto): Promise<{
        id: string;
        provider: string;
        auth_type: "api_key" | "local" | "subscription";
        label: string;
        priority: number;
    }>;
    removeProvider(ctx: TenantContext, params: ProviderParamDto, query: RemoveProviderQueryDto): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
    listProviders(ctx: TenantContext): Promise<{
        providers: {
            provider: string;
            auth_type: string;
            display_name: string | null;
            connection_count: number;
            connections: {
                id: string;
                label: string;
                key_prefix: string | null;
                priority: number;
                connected_at: string;
                models_fetched_at: string | null;
                cached_model_count: number;
                is_active: boolean;
            }[];
            total_models: number;
        }[];
        model_counts: {
            [k: string]: number;
        };
    }>;
}
