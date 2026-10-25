import { TenantCacheService } from '../common/services/tenant-cache.service';
import { MCP_READ_SCOPE, MCP_WRITE_SCOPE } from '../auth/mcp-scopes';
export interface McpAccessTokenClaims {
    sub?: string;
    scope?: unknown;
}
export interface McpOperator {
    userId: string;
    tenantId: string;
    scopes: ReadonlySet<string>;
}
export declare function scopesFromClaims(claims: McpAccessTokenClaims): ReadonlySet<string>;
export { MCP_READ_SCOPE, MCP_WRITE_SCOPE };
export declare function resolveMcpOperator(tenantCache: TenantCacheService, claims: McpAccessTokenClaims): Promise<McpOperator | null>;
