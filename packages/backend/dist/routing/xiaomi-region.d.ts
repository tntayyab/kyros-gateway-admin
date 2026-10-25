export declare const XIAOMI_TOKEN_PLAN_BASE_URLS: {
    readonly cn: "https://token-plan-cn.xiaomimimo.com";
    readonly sgp: "https://token-plan-sgp.xiaomimimo.com";
    readonly ams: "https://token-plan-ams.xiaomimimo.com";
};
export type XiaomiTokenPlanRegion = keyof typeof XIAOMI_TOKEN_PLAN_BASE_URLS;
export declare const DEFAULT_XIAOMI_TOKEN_PLAN_REGION: XiaomiTokenPlanRegion;
export declare function isXiaomiTokenPlanRegion(value: string | undefined | null): value is XiaomiTokenPlanRegion;
export declare function isXiaomiProviderId(value: string | undefined | null): boolean;
export declare function getXiaomiTokenPlanBaseUrl(region?: XiaomiTokenPlanRegion): string;
export declare function normalizeXiaomiTokenPlanBaseUrl(baseUrl: string): string | null;
