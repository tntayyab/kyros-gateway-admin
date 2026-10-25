"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCP_WRITE_SCOPE = exports.MCP_READ_SCOPE = void 0;
exports.scopesFromClaims = scopesFromClaims;
exports.resolveMcpOperator = resolveMcpOperator;
const mcp_scopes_1 = require("../auth/mcp-scopes");
Object.defineProperty(exports, "MCP_READ_SCOPE", { enumerable: true, get: function () { return mcp_scopes_1.MCP_READ_SCOPE; } });
Object.defineProperty(exports, "MCP_WRITE_SCOPE", { enumerable: true, get: function () { return mcp_scopes_1.MCP_WRITE_SCOPE; } });
function scopesFromClaims(claims) {
    if (typeof claims.scope !== 'string')
        return new Set();
    return new Set(claims.scope.split(' ').filter(Boolean));
}
async function resolveMcpOperator(tenantCache, claims) {
    if (typeof claims.sub !== 'string' || !claims.sub)
        return null;
    const tenantId = await tenantCache.resolve(claims.sub);
    if (!tenantId)
        return null;
    return { userId: claims.sub, tenantId, scopes: scopesFromClaims(claims) };
}
//# sourceMappingURL=mcp-auth.js.map