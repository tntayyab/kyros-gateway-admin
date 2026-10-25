export declare const CLOUD_LOCAL_PROVIDER_MESSAGE = "Built-in local providers are only available in self-hosted Manifest. On Manifest Cloud, expose the runtime through a public URL or tunnel and connect it as a custom provider.";
export declare function isLocalOnlyProvider(provider: string): boolean;
export declare function isProviderAvailableForDeployment(provider: string): boolean;
export declare function filterProvidersForDeployment<T extends {
    provider: string;
}>(providers: T[]): T[];
