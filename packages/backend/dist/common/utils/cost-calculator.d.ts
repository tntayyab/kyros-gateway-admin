import { PricingEntry } from '../../model-prices/model-pricing-cache.service';
export interface CostInput {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens?: number;
    cacheCreationTokens?: number;
    model: string | null | undefined;
    pricing: PricingEntry | undefined;
    isSubscription?: boolean;
    perRequestCostUsd?: number | null;
    reportedCostUsd?: number | null;
    isLocalProvider?: boolean;
    at?: Date;
}
export declare function computeTokenCost(input: CostInput): number | null;
