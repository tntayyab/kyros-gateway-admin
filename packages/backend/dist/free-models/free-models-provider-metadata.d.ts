export interface ProviderMetadata {
    logo: string;
    displayName?: string;
    tags: string[];
    warning: string;
}
export declare const PROVIDER_METADATA: Readonly<Record<string, ProviderMetadata>>;
