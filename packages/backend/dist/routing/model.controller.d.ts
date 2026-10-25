import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { ResolveAgentService } from './routing-core/resolve-agent.service';
import { CustomProviderService } from './custom-provider/custom-provider.service';
import { ProviderParamSpecService } from './routing-core/provider-param-spec.service';
import { ModelDiscoveryService } from '../model-discovery/model-discovery.service';
import { OpencodeGoCatalogService } from '../model-discovery/opencode-go-catalog.service';
import { OllamaSyncService } from '../database/ollama-sync.service';
import { PricingSyncService } from '../database/pricing-sync.service';
import { ModelsDevSyncService } from '../database/models-dev-sync.service';
import { RoutingCacheService } from './routing-core/routing-cache.service';
import { AgentNameParamDto, AgentProviderParamDto, RemoveProviderQueryDto } from './dto/routing.dto';
export declare class ModelController {
    private readonly discoveryService;
    private readonly ollamaSync;
    private readonly resolveAgentService;
    private readonly customProviderService;
    private readonly pricingSync;
    private readonly providerParamSpecs;
    private readonly modelsDevSync;
    private readonly opencodeGoCatalog;
    private readonly routingCache;
    constructor(discoveryService: ModelDiscoveryService, ollamaSync: OllamaSyncService, resolveAgentService: ResolveAgentService, customProviderService: CustomProviderService, pricingSync: PricingSyncService, providerParamSpecs: ProviderParamSpecService, modelsDevSync: ModelsDevSyncService, opencodeGoCatalog: OpencodeGoCatalogService, routingCache: RoutingCacheService);
    pricingHealth(): {
        model_count: number;
        last_fetched_at: string | null;
    };
    refreshPricing(): Promise<{
        ok: boolean;
        model_count: number;
        last_fetched_at: string | null;
    }>;
    refreshModels(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        ok: boolean;
    }>;
    refreshProviderModels(ctx: TenantContext, params: AgentProviderParamDto, query: RemoveProviderQueryDto): Promise<{
        ok: boolean;
        model_count: number;
        last_fetched_at: string | null;
        error: string | null;
    }>;
    syncOllama(): Promise<{
        count: number;
    }>;
    getAvailableModels(ctx: TenantContext, params: AgentNameParamDto): Promise<{
        provider_display_name?: string | undefined;
        input_modalities: readonly ("text" | "image" | "audio" | "video")[];
        output_modalities: string[];
        quality_score: number;
        display_name: string | null;
        capabilities?: readonly ("text" | "image" | "stream" | "audio" | "video" | "tools")[] | undefined;
        context_window: number;
        capability_reasoning: boolean;
        capability_code: boolean;
        cost_per_request?: number | undefined;
        model_name: string;
        provider: string;
        auth_type: "api_key" | "local" | "subscription";
        input_price_per_token: number | null;
        output_price_per_token: number | null;
    }[]>;
}
