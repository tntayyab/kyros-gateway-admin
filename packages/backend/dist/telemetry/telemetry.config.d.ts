export declare const DEFAULT_TELEMETRY_ENDPOINT = "https://telemetry.manifest.build/v1/report";
export declare const TELEMETRY_SCHEMA_VERSION = 1;
export declare const TELEMETRY_DOCS_URL = "https://manifest.build/llm-gateway/docs/self-hosted/#telemetry";
export interface TelemetryConfig {
    enabled: boolean;
    endpoint: string;
    manifestVersion: string;
}
export declare function buildTelemetryConfig(env?: NodeJS.ProcessEnv): TelemetryConfig;
export declare const UNKNOWN_VERSION = "unknown";
export declare function readManifestVersion(): string;
