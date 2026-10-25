export declare const HOSTED_WINGMAN_ORIGIN = "https://wingman.manifest.build";
export interface DevOriginBuilderOptions {
    configuredOrigin: string;
    wingmanPort: number;
}
export interface ProdOriginBuilderOptions {
    extraOrigins?: string;
}
export interface FrameSrcOptions {
    isDev: boolean;
    wingmanPort: number;
}
export declare function buildDevAllowedOrigins({ configuredOrigin, wingmanPort, }: DevOriginBuilderOptions): string[];
export declare function buildProdAllowedOrigins({ extraOrigins }?: ProdOriginBuilderOptions): string[];
export declare function buildFrameSrc({ isDev, wingmanPort }: FrameSrcOptions): string[];
export declare function parseFrameAncestors(raw: string | undefined): string[];
export type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;
export type CorsOriginHandler = (origin: string | undefined, callback: CorsOriginCallback) => void;
export declare function createCorsOriginHandler(allowedOrigins: string[]): CorsOriginHandler;
export declare const CORS_PREFLIGHT_MAX_AGE_SECONDS = 7200;
export interface CorsOptions {
    origin: CorsOriginHandler;
    credentials: false;
    maxAge: number;
}
export declare function buildCorsOptions(allowedOrigins: string[]): CorsOptions;
export interface PnaRequest {
    method: string;
    headers: {
        origin?: string | string[];
        'access-control-request-private-network'?: string | string[];
    };
}
export declare function applyPrivateNetworkAllow(req: PnaRequest, allowedOrigins: string[], setHeader: (name: string, value: string) => void): void;
export declare const PIVOT_CLAIM_PATH = "/api/v1/waitlist/pivot/claim";
export interface PivotCorsRequest {
    method: string;
    path: string;
}
export declare function applyPivotClaimCors(req: PivotCorsRequest, setHeader: (name: string, value: string) => void): boolean;
export declare const PIVOT_CLAIM_CLOUD_ORIGIN = "https://app.manifest.build";
