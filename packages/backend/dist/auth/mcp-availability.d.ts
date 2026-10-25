export declare function authOriginFromEnv(env?: NodeJS.ProcessEnv): string;
export declare function mcpResourceFromEnv(env?: NodeJS.ProcessEnv): string;
export declare function mcpResourceProblem(resource: string): string | null;
export declare function isMcpCapableResource(resource: string): boolean;
export interface McpAvailability {
    enabled: boolean;
    reason: string | null;
}
export declare function resolveMcpAvailability(env?: NodeJS.ProcessEnv): McpAvailability;
export declare function mcpAvailability(): McpAvailability;
export declare function resetMcpAvailability(): void;
