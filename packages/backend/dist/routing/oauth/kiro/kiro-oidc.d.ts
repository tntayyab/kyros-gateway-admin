export declare const KIRO_OIDC_DEFAULT_REGION = "us-east-1";
export declare const KIRO_DEFAULT_START_URL = "https://view.awsapps.com/start";
export declare const KIRO_CLIENT_NAME = "Manifest";
export declare const KIRO_CLIENT_TYPE = "public";
export declare const KIRO_DEVICE_CODE_GRANT = "urn:ietf:params:oauth:grant-type:device_code";
export declare const KIRO_REFRESH_GRANT = "refresh_token";
export declare const KIRO_DEFAULT_SCOPES: readonly string[];
export declare const KIRO_REGISTER_GRANT_TYPES: readonly string[];
export declare const KIRO_DEFAULT_POLL_INTERVAL_MS = 5000;
export declare function getKiroOidcBaseUrl(region?: string): string;
export declare function buildKiroRegisterUrl(baseUrl: string): string;
export declare function buildKiroDeviceAuthorizationUrl(baseUrl: string): string;
export declare function buildKiroTokenUrl(baseUrl: string): string;
export interface KiroAuthorizationOptions {
    startUrl?: string;
    region?: string;
}
export declare class KiroAuthorizationOptionsError extends Error {
    constructor(message: string);
}
export declare function normalizeKiroRegion(region: string): string;
export declare function normalizeKiroStartUrl(startUrl: string): string;
export { toAbsoluteExpiryTimestamp } from '../core/device-flow';
export declare function toPollIntervalMs(interval?: number): number;
export interface KiroOAuthTokenBlob {
    source: 'kiro-oidc';
    t: string;
    r: string;
    e: number;
    cid: string;
    cs: string;
    region?: string;
}
export declare function isKiroOAuthTokenBlob(value: unknown): value is KiroOAuthTokenBlob;
export declare function parseKiroOAuthTokenBlob(rawValue: string): KiroOAuthTokenBlob | null;
export declare function serializeKiroOAuthTokenBlob(blob: KiroOAuthTokenBlob): string;
