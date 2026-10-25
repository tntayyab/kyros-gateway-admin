"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMcpServer = buildMcpServer;
const server_1 = require("@modelcontextprotocol/server");
const mcp_auth_1 = require("./mcp-auth");
const agents_tools_1 = require("./tools/agents.tools");
const environment_tools_1 = require("./tools/environment.tools");
const identity_tools_1 = require("./tools/identity.tools");
const models_tools_1 = require("./tools/models.tools");
const providers_tools_1 = require("./tools/providers.tools");
const requests_tools_1 = require("./tools/requests.tools");
const routing_tools_1 = require("./tools/routing.tools");
function buildMcpServer(deps, operator) {
    const canWrite = operator.scopes.has(mcp_auth_1.MCP_WRITE_SCOPE);
    const server = new server_1.McpServer({ name: 'manifest', version: '1.0.0' }, {
        capabilities: { tools: { listChanged: false } },
        instructions: 'Manifest is an LLM gateway control plane. Use these tools to manage harnesses ' +
            '(agents), provider connections, routing, model catalogs, and to read the request ' +
            'ledger. ' +
            (canWrite
                ? 'This token can also create, update, and delete resources.'
                : 'This token is read-only; reconnect with the mcp:write scope to change anything.'),
    });
    (0, identity_tools_1.registerIdentityTools)(server, deps, operator);
    (0, agents_tools_1.registerAgentTools)(server, deps, operator);
    (0, environment_tools_1.registerEnvironmentTools)(server, deps, operator);
    (0, providers_tools_1.registerProviderTools)(server, deps, operator);
    (0, routing_tools_1.registerRoutingTools)(server, deps, operator);
    (0, models_tools_1.registerModelTools)(server, deps, operator);
    (0, requests_tools_1.registerRequestTools)(server, deps, operator);
    (0, environment_tools_1.registerGuideTool)(server);
    return server;
}
//# sourceMappingURL=mcp-server.factory.js.map