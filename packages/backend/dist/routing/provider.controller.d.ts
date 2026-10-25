import type { Cache } from 'cache-manager';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { ProviderService } from './routing-core/provider.service';
import { CustomProviderService } from './custom-provider/custom-provider.service';
import { ResolveAgentService } from './routing-core/resolve-agent.service';
import { TierService } from './routing-core/tier.service';
import { ModelDiscoveryService } from '../model-discovery/model-discovery.service';
import { OllamaSyncService } from '../database/ollama-sync.service';
import { PricingSyncService } from '../database/pricing-sync.service';
import { AgentNameParamDto, AgentProviderParamDto, AgentProviderKeyParamDto, ConnectProviderDto, RemoveProviderQueryDto, RenameProviderKeyDto, ReorderProviderKeysDto } from './dto/routing.dto';
export declare class ProviderController {
    private readonly providerService;
    private readonly discoveryService;
    private readonly ollamaSync;
    private readonly resolveAgentService;
    private readonly tierService;
    private readonly pricingSync;
    private readonly customProviderService;
    private readonly cacheManager;
    constructor(providerService: ProviderService, discoveryService: ModelDiscoveryService, ollamaSync: OllamaSyncService, resolveAgentService: ResolveAgentService, tierService: TierService, pricingSync: PricingSyncService, customProviderService: CustomProviderService, cacheManager: Cache);
    private customConnectionLabel;
    getStatus(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        enabled: boolean;
        reason: "no_provider";
    } | {
        enabled: boolean;
        reason: "pricing_cache_empty" | "no_routable_models";
    } | {
        enabled: boolean;
        reason: null;
    }>;
    getProviders(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        id: string;
        provider: string;
        auth_type: "api_key" | "local" | "subscription";
        is_active: boolean;
        has_api_key: boolean;
        key_prefix: string | null;
        label: string;
        priority: number;
        region: string | null;
        connected_at: string;
        models_fetched_at: string | null;
        cached_model_count: number;
    }[]>;
    upsertProvider(ctx: TenantContext, params: AgentNameParamDto, body: ConnectProviderDto): Promise<{
        id: string;
        provider: string;
        auth_type: "api_key" | "local" | "subscription";
        is_active: boolean;
        label: string;
        priority: number;
        region: string | null;
    }>;
    renameProviderKey(ctx: TenantContext, params: AgentProviderKeyParamDto, body: RenameProviderKeyDto): Promise<{
        id: string;
        provider: string;
        auth_type: "api_key" | "local" | "subscription";
        label: string;
        priority: number;
    }>;
    reorderProviderKeys(ctx: TenantContext, params: AgentProviderParamDto, body: ReorderProviderKeysDto): Promise<{
        id: string;
        label: string;
        priority: number;
    }[]>;
    deactivateAllProviders(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        ok: boolean;
    }>;
    removeProvider(ctx: TenantContext, params: AgentProviderParamDto, query: RemoveProviderQueryDto): Promise<{
        ok: boolean;
        notifications: string[];
    }>;
}
