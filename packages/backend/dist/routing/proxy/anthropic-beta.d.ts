export declare const MAX_CLIENT_BETA_FLAGS = 20;
export declare const MAX_CLIENT_BETA_BYTES = 1024;
export declare function parseClientBetas(header: unknown): string[];
export declare function mergeAnthropicBeta(manifestHeader: string | undefined, clientHeader: unknown): string | undefined;
export declare function isAnthropicHost(baseUrl: string): boolean;
