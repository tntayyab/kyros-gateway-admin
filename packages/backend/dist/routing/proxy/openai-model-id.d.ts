import { type ModelRoute } from 'manifest-shared';
import type { DiscoveredModel } from '../../model-discovery/model-fetcher';
export { OPENAI_MODEL_ID_AUTO, SUBSCRIPTION_MODEL_SUFFIX, openAiModelId, subscriptionOpenAiModelId, } from '../routing-core/public-model-id';
export interface ExplicitModelRouteCandidate {
    provider: string;
    model: string;
    providerQualified: boolean;
}
export declare function routeForOpenAiModelId(modelId: string, models: readonly DiscoveredModel[]): ModelRoute | null;
export declare function explicitModelRouteCandidate(modelId: string): ExplicitModelRouteCandidate | null;
