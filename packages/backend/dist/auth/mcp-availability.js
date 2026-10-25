"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOriginFromEnv = authOriginFromEnv;
exports.mcpResourceFromEnv = mcpResourceFromEnv;
exports.mcpResourceProblem = mcpResourceProblem;
exports.isMcpCapableResource = isMcpCapableResource;
exports.resolveMcpAvailability = resolveMcpAvailability;
exports.mcpAvailability = mcpAvailability;
exports.resetMcpAvailability = resetMcpAvailability;
const DEFAULT_PORT = '3001';
const MCP_ROUTE = '/api/v1/mcp';
const FALSEY = new Set(['false', '0', 'no', 'off']);
function authOriginFromEnv(env = process.env) {
    const port = env['PORT'] ?? DEFAULT_PORT;
    return (env['BETTER_AUTH_URL'] ?? `http://localhost:${port}`).replace(/\/+$/, '');
}
function mcpResourceFromEnv(env = process.env) {
    return `${authOriginFromEnv(env)}${MCP_ROUTE}`;
}
function isLoopbackHostname(hostname) {
    if (hostname === 'localhost' || hostname === '[::1]' || hostname === '::1')
        return true;
    const octets = hostname.split('.');
    return (octets.length === 4 &&
        octets[0] === '127' &&
        octets.every((octet) => /^\d+$/.test(octet) && Number(octet) <= 255));
}
function mcpResourceProblem(resource) {
    let url;
    try {
        url = new URL(resource);
    }
    catch {
        return 'is not an absolute URL';
    }
    if (url.username || url.password)
        return 'must not contain credentials';
    if (resource.includes('#'))
        return 'must not contain a fragment';
    if (resource.includes('?'))
        return 'must not contain a query';
    if (url.protocol === 'https:')
        return null;
    if (url.protocol === 'http:' && isLoopbackHostname(url.hostname))
        return null;
    return 'must use HTTPS (loopback HTTP is allowed for development)';
}
function isMcpCapableResource(resource) {
    return mcpResourceProblem(resource) === null;
}
function describeResource(resource) {
    try {
        const url = new URL(resource);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return 'derived from BETTER_AUTH_URL';
        }
        url.password = '';
        url.username = '';
        return url.href;
    }
    catch {
        return 'derived from BETTER_AUTH_URL';
    }
}
function resolveMcpAvailability(env = process.env) {
    const flag = env['MCP_ENABLED'];
    if (flag && FALSEY.has(flag.trim().toLowerCase())) {
        return { enabled: false, reason: 'disabled by MCP_ENABLED' };
    }
    const resource = mcpResourceFromEnv(env);
    const problem = mcpResourceProblem(resource);
    if (problem) {
        return {
            enabled: false,
            reason: `the MCP resource ${describeResource(resource)} ${problem}. Adjust BETTER_AUTH_URL, ` +
                'or set MCP_ENABLED=false to acknowledge this. The dashboard and the gateway ' +
                'are unaffected.',
        };
    }
    return { enabled: true, reason: null };
}
let current = null;
function mcpAvailability() {
    current ??= resolveMcpAvailability();
    return current;
}
function resetMcpAvailability() {
    current = null;
}
//# sourceMappingURL=mcp-availability.js.map