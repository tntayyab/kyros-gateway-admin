import type { AuthType } from 'manifest-shared';
export interface SubscriptionEndpointRegionConfig {
    isRegion: (value: string | null | undefined) => boolean;
    matchesProvider: (provider: string) => boolean;
    validationMessage: string;
}
export declare function getSubscriptionEndpointRegionConfig(provider: string | null | undefined, authType: AuthType | undefined): SubscriptionEndpointRegionConfig | null;
