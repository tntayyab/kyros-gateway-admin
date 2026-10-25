declare const QWEN_REGION_BASE_URLS: {
    readonly singapore: "https://dashscope-intl.aliyuncs.com/compatible-mode";
    readonly us: "https://dashscope-us.aliyuncs.com/compatible-mode";
    readonly beijing: "https://dashscope.aliyuncs.com/compatible-mode";
};
export declare const QWEN_REGION_VALIDATION_MESSAGE = "Qwen region must be one of: auto, singapore, us, beijing, or a valid Alibaba Cloud Model Studio compatible-mode base URL";
export type QwenResolvedRegion = keyof typeof QWEN_REGION_BASE_URLS;
export type QwenRegion = string;
export declare function isQwenResolvedRegion(value: string | null | undefined): value is QwenResolvedRegion;
export declare function isQwenRegion(value: string | null | undefined): value is QwenRegion;
export declare function getQwenCompatibleBaseUrl(region?: string | null): string;
export declare function normalizeQwenCompatibleBaseUrl(baseUrl: string | null | undefined): string | null;
export declare function isQwenResolvedEndpoint(value: string | null | undefined): value is string;
export declare function detectQwenRegion(apiKey: string, fetchImpl?: typeof fetch): Promise<QwenResolvedRegion | null>;
export {};
