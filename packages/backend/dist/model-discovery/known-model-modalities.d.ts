import type { ModelCapability, ModelModality } from 'manifest-shared';
interface KnownCapabilities {
    input: readonly ModelModality[];
    output: readonly ModelModality[];
    capabilities: readonly ModelCapability[];
}
export declare function lookupKnownModalities(providerId: string, modelId: string): KnownCapabilities | undefined;
export {};
