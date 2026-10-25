export interface ManagedFreeProviderConfig {
    id: string;
    displayName: string;
    litellmModels: readonly string[];
    catalogModelIdPrefix: string;
    preferredModelIdPrefix: string;
    nonChatModelPattern: RegExp;
    maxBudgetEnvVar: string;
}
export declare const MANAGED_FREE_PROVIDER_CONFIGS: readonly ManagedFreeProviderConfig[];
export declare const MANAGED_FREE_PROVIDER_BY_ID: ReadonlyMap<string, ManagedFreeProviderConfig>;
export declare function getManagedFreeProviderConfig(providerId: string): ManagedFreeProviderConfig | undefined;
export declare function getManagedFreeLiteLlmBaseUrl(): string;
export declare function getManagedFreeLiteLlmMasterKey(): string | null;
export declare function getManagedFreeLiteLlmMaxBudgetUsd(config: ManagedFreeProviderConfig): number;
export declare function getManagedFreeLiteLlmAutoAllowlist(): string[];
export declare function isManagedFreeLiteLlmAutoEligible(email: string | null | undefined): boolean;
export declare function getManagedFreeLiteLlmModelsUrl(): string;
export declare function getManagedFreeLiteLlmKeyGenerateUrl(): string;
