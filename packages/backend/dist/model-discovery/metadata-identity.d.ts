export interface MetadataIdentity {
    provider: string | undefined;
    model: string;
}
export declare function metadataIdentities(provider: string, modelId: string): MetadataIdentity[];
export declare function resolveMetadataEntry<T>(provider: string, modelId: string, lookup: (providerId: string, modelId: string) => T | null | undefined): {
    metadata: MetadataIdentity;
    entry: T | null;
};
