import type { ModelModality } from 'manifest-shared';
import type { DiscoveredModel } from '../../model-discovery/model-fetcher';
declare const FEATURE_CAPABILITIES: readonly ["stream", "tools"];
type FeatureCapability = (typeof FEATURE_CAPABILITIES)[number];
export interface OpenAiModelCapabilities {
    input_modalities?: readonly ModelModality[];
    output_modalities?: readonly ModelModality[];
    features?: readonly FeatureCapability[];
    supported_endpoints?: readonly string[];
}
export declare function openAiModelCapabilities(model: DiscoveredModel): OpenAiModelCapabilities | undefined;
export {};
