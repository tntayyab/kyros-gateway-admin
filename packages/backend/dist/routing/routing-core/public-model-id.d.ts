import type { DiscoveredModel } from '../../model-discovery/model-fetcher';
export declare const OPENAI_MODEL_ID_AUTO = "auto";
export declare const SUBSCRIPTION_MODEL_SUFFIX = "-subscription";
export declare function subscriptionOpenAiModelId(provider: string, modelId: string): string;
export declare function openAiModelId(model: DiscoveredModel): string;
