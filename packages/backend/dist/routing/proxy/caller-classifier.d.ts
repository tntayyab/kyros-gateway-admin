export interface CallerAttribution {
    sdk?: string;
    sdkVersion?: string;
    runtime?: string;
    runtimeVersion?: string;
    os?: string;
    arch?: string;
    userAgent?: string;
    appName?: string;
    appUrl?: string;
    categories?: string[];
}
type HeaderMap = Record<string, string | string[] | undefined>;
export declare function classifyCaller(headers: HeaderMap): CallerAttribution | null;
export {};
