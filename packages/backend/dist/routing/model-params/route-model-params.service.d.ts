import { type AuthType, type JsonValue, type ModelParamDefinition } from 'manifest-shared';
import { TierService } from '../routing-core/tier.service';
import { HeaderTierService } from '../header-tiers/header-tier.service';
import { AgentModelParamsService } from '../routing-core/agent-model-params.service';
import { ProviderParamSpecService } from '../routing-core/provider-param-spec.service';
export declare const DEFAULT_TIER_NAME = "default";
export interface RouteModelParamsChange {
    set?: Record<string, JsonValue>;
    unset?: string[];
}
export interface RouteModelParamView extends ModelParamDefinition {
    current: JsonValue | null;
}
export interface RouteModelParamsView {
    tier: string;
    route: {
        provider: string;
        authType: AuthType;
        model: string;
    };
    models: string[];
    params: RouteModelParamView[];
}
export declare class RouteModelParamsService {
    private readonly tiers;
    private readonly headerTiers;
    private readonly modelParams;
    private readonly specs;
    constructor(tiers: TierService, headerTiers: HeaderTierService, modelParams: AgentModelParamsService, specs: ProviderParamSpecService);
    get(agentId: string, tier?: string, model?: string): Promise<RouteModelParamsView>;
    update(agentId: string, tier: string | undefined, model: string | undefined, change: RouteModelParamsChange): Promise<RouteModelParamsView>;
    private resolve;
    private resolved;
    private findTier;
    private specsFor;
    private savedParams;
    private view;
    private unknownParam;
}
