"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIdentityTools = registerIdentityTools;
const zod_1 = require("zod");
const auth_instance_1 = require("../../auth/auth.instance");
const tool_result_1 = require("../tool-result");
function registerIdentityTools(server, deps, operator) {
    server.registerTool('manifest_whoami', {
        title: 'Who am I',
        description: 'Return the acting user, tenant, and granted MCP scopes.',
        inputSchema: zod_1.z.object({}),
        annotations: { readOnlyHint: true },
    }, async () => (0, tool_result_1.ok)({ userId: operator.userId, tenantId: operator.tenantId, scopes: [...operator.scopes] }));
    server.registerTool('manifest_doctor', {
        title: 'Diagnose the workspace',
        description: 'Run config, credential, provider, and agent checks in dependency order and report one verdict.',
        inputSchema: zod_1.z.object({}),
        annotations: { readOnlyHint: true },
    }, async () => (0, tool_result_1.result)((async () => {
        const checks = [];
        checks.push({
            name: 'config',
            status: 'ok',
            detail: { url: auth_instance_1.authOrigin, issuer: auth_instance_1.authIssuer, mcp_resource: auth_instance_1.mcpResource },
        });
        checks.push({
            name: 'credential',
            status: 'ok',
            detail: {
                userId: operator.userId,
                tenantId: operator.tenantId,
                scopes: [...operator.scopes],
            },
        });
        const connections = await deps.providers.getProviders(operator.tenantId);
        const hollow = connections
            .filter((c) => c.is_active && (c.cached_models?.length ?? 0) === 0)
            .map((c) => `${c.provider}/${c.auth_type}${c.label ? `/${c.label}` : ''}`);
        checks.push({
            name: 'providers',
            status: connections.length === 0 || hollow.length > 0 ? 'fail' : 'ok',
            detail: {
                connections: connections.length,
                hollow_connections: hollow,
            },
        });
        const agents = await deps.timeseries.getAgentList(operator.tenantId);
        checks.push({
            name: 'agents',
            status: agents.length === 0 ? 'warn' : 'ok',
            detail: { agents: agents.length },
        });
        return { ok: checks.every((c) => c.status !== 'fail'), url: auth_instance_1.authOrigin, checks };
    })()));
}
//# sourceMappingURL=identity.tools.js.map