import { Repository } from 'typeorm';
import { CustomProvider, CustomProviderApiKind, CustomProviderModel } from '../../entities/custom-provider.entity';
import type { TenantProvider } from '../../entities/tenant-provider.entity';
import { ProviderService } from '../routing-core/provider.service';
import { RoutingCacheService } from '../routing-core/routing-cache.service';
import { CreateCustomProviderDto, UpdateCustomProviderDto } from '../dto/custom-provider.dto';
import { ModelPricingCacheService } from '../../model-prices/model-pricing-cache.service';
import { ModelsDevSyncService } from '../../database/models-dev-sync.service';
import { IngestEventBusService } from '../../common/services/ingest-event-bus.service';
export declare function isEmbeddingModel(id: string): boolean;
export declare function primaryCustomConnection(rows: readonly TenantProvider[], providerKey: string): TenantProvider | undefined;
export declare function isLocalCustomProviderName(name: string): boolean;
export declare class CustomProviderService {
    private readonly repo;
    private readonly providerService;
    private readonly routingCache;
    private readonly pricingCache;
    private readonly eventBus;
    private readonly modelsDevSync;
    private readonly logger;
    constructor(repo: Repository<CustomProvider>, providerService: ProviderService, routingCache: RoutingCacheService, pricingCache: ModelPricingCacheService, eventBus: IngestEventBusService, modelsDevSync?: ModelsDevSyncService | null);
    private notifyChange;
    private assertAliasAvailable;
    private defaultAlias;
    static providerKey(id: string): string;
    primaryConnection(tenantId: string, id: string): Promise<TenantProvider | undefined>;
    static modelKey(id: string, modelName: string): string;
    static rawModelName(prefixedName: string): string;
    static isCustom(provider: string): boolean;
    static extractId(providerKey: string): string;
    static canonicalTileIdForName(name: string): string | null;
    canonicalizeAgentMessageKeys(tenantId: string, provider: string | null | undefined, model: string): Promise<{
        provider: string | null;
        model: string;
    }>;
    canonicalizeAgentMessageKeys(tenantId: string, provider: string | null | undefined, model: string | null | undefined): Promise<{
        provider: string | null;
        model: string | null;
    }>;
    list(tenantId: string): Promise<CustomProvider[]>;
    create(tenantId: string, dto: CreateCustomProviderDto, createdByUserId?: string | null): Promise<CustomProvider>;
    update(id: string, tenantId: string, dto: UpdateCustomProviderDto, actorUserId?: string | null): Promise<CustomProvider>;
    remove(tenantId: string, id: string, actorUserId?: string | null): Promise<void>;
    getById(id: string, tenantId: string): Promise<CustomProvider | null>;
    probeModels(baseUrl: string, apiKey?: string, apiKind?: CustomProviderApiKind, providerName?: string): Promise<CustomProviderModel[]>;
    loadStoredApiKey(tenantId: string, providerId: string, baseUrl: string, apiKind?: CustomProviderApiKind): Promise<string | undefined>;
    private enrichCustomProviderModels;
    private toPricePerMillion;
}
