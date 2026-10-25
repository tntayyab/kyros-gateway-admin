export declare const ZAI_CODING_PLAN_BASE_URLS: {
    readonly global: "https://api.z.ai/api/coding/paas/v4";
    readonly cn: "https://open.bigmodel.cn/api/coding/paas/v4";
};
export type ZaiCodingPlanRegion = keyof typeof ZAI_CODING_PLAN_BASE_URLS;
export declare const DEFAULT_ZAI_CODING_PLAN_REGION: ZaiCodingPlanRegion;
export declare function isZaiCodingPlanRegion(value: string | undefined | null): value is ZaiCodingPlanRegion;
export declare function isZaiProviderId(value: string | undefined | null): boolean;
export declare function getZaiCodingPlanBaseUrl(region?: ZaiCodingPlanRegion): string;
export declare function normalizeZaiCodingPlanBaseUrl(baseUrl: string): string | null;
