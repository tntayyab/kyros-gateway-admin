import type { SubscriptionCapabilities, SubscriptionProviderConfig } from './types';
export declare function getSubscriptionProviderConfig(providerId: string): Readonly<SubscriptionProviderConfig> | null;
export declare function supportsSubscriptionProvider(providerId: string): boolean;
export declare function getSubscriptionKnownModels(providerId: string): readonly string[] | null;
export declare function getSubscriptionKnownModelsMatch(providerId: string): 'prefix' | 'exact';
export declare function getSubscriptionCapabilities(providerId: string): Readonly<SubscriptionCapabilities> | null;
//# sourceMappingURL=helpers.d.ts.map