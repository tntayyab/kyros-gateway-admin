import type { AuthType, ModelCapability, ModelModality } from 'manifest-shared';
import type { DiscoveredModel } from './model-fetcher';
import type { ModelsDevModelEntry } from '../database/models-dev-sync.service';
type RawModalities = {
    input?: string[];
    output?: string[];
} | undefined;
export declare function parseModalities(value: unknown): readonly ModelModality[] | undefined;
export interface ModelModalities {
    input: readonly ModelModality[];
    output: readonly ModelModality[];
}
export declare function mergeModelCapabilities(...capabilityLists: Array<readonly ModelCapability[] | null | undefined>): readonly ModelCapability[] | undefined;
export declare function modelModalitiesFromModelsDev(modalities: RawModalities): ModelModalities;
export declare function inputModalitiesFromCapabilities(capabilities: readonly ModelCapability[] | null | undefined): readonly ModelModality[];
export declare function capabilitiesFromModelsDev(providerId: string, modelId: string, modalities: RawModalities, toolCall: boolean | undefined): readonly ModelCapability[];
export interface ResolvedCapabilityMetadata {
    capabilities?: readonly ModelCapability[];
    inputModalities?: readonly ModelModality[];
    outputModalities?: readonly ModelModality[];
    modelsDevEntry: ModelsDevModelEntry | null;
}
export declare function resolveModelCapabilityMetadata(model: DiscoveredModel, paramSpecs: {
    getCapabilities(providerId: string | undefined, authType: AuthType | undefined, model: string | undefined): Promise<readonly ModelCapability[] | null>;
}, modelsDevSync: {
    lookupModelCapabilities(providerId: string, modelId: string): ModelsDevModelEntry | null;
}): Promise<ResolvedCapabilityMetadata>;
export declare function modelSupportsStreaming(providerId: string, modelId: string): boolean;
export {};
