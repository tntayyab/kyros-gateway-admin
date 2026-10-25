import { type OnModuleInit } from '@nestjs/common';
import { type AuthType, type ModelCapability, type ProviderParamSpec, type ProviderParamSpecCatalog } from 'manifest-shared';
export declare class ProviderParamSpecService implements OnModuleInit {
    private readonly logger;
    private specs;
    private catalogEtag;
    private refreshInFlight;
    onModuleInit(): void;
    scheduledRefresh(): Promise<void>;
    refreshCatalog(): Promise<boolean>;
    private fetchAndSwapCatalog;
    list(): Promise<ProviderParamSpecCatalog>;
    listModelIds(): Array<{
        provider: string;
        authType: AuthType;
        model: string;
    }>;
    getSpecs(providerId: string | undefined, authType: AuthType | undefined, model: string | undefined): Promise<readonly ProviderParamSpec[]>;
    getCapabilities(providerId: string | undefined, authType: AuthType | undefined, model: string | undefined): Promise<readonly ModelCapability[] | null>;
    private getProviderlessSpecs;
}
