import type { AuthType } from 'manifest-shared';
type ProviderAuthRecord = {
    provider: string;
    auth_type?: AuthType | null;
};
export declare function isSupportedSubscriptionProvider(provider: string): boolean;
export declare function isManifestUsableProvider(record: ProviderAuthRecord): boolean;
export {};
