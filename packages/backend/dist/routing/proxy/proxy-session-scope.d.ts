export interface ProxySessionScope {
    sessionKey: string;
    cacheKey: string;
    providerCacheKey?: string;
    momentumKey?: string;
}
export declare function buildProxySessionScope(tenantId: string, agentId: string, sessionHeader: unknown): ProxySessionScope;
