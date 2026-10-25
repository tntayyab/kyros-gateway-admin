export declare const DASHBOARD_CACHE_TTL_MS = 30000;
export declare const DASHBOARD_CACHE_MAX_ENTRIES = 5000;
export declare const DASHBOARD_CACHE_SWEEP_MS = 60000;
export declare const AGENT_LIST_CACHE_TTL_MS = 60000;
export declare const MODEL_PRICES_CACHE_TTL_MS = 300000;
export declare const FREE_MODELS_CACHE_TTL_MS = 3600000;
export declare function agentListCacheKey(tenantId: string, includePlayground: boolean, generation?: number): string;
