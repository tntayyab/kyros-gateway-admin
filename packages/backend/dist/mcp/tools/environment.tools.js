"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEnvironmentTools = registerEnvironmentTools;
exports.registerGuideTool = registerGuideTool;
const zod_1 = require("zod");
const manifest_shared_1 = require("manifest-shared");
const auth_instance_1 = require("../../auth/auth.instance");
const mcp_auth_1 = require("../mcp-auth");
const tool_result_1 = require("../tool-result");
function maskedKeyRef(slug) {
    return `<MNFST_AGENT_KEY — run: mnfst agent key show ${slug} --raw --url ${auth_instance_1.authOrigin}>`;
}
function renderSetup(platform, keyRef, canWrite) {
    const template = platform ? manifest_shared_1.PLATFORM_SETUP_SNIPPETS[platform] : undefined;
    if (template) {
        return template(`${auth_instance_1.authOrigin}/v1`, keyRef);
    }
    const lines = [
        "Point your tool's OpenAI-compatible client at Manifest:",
        `  base URL: ${auth_instance_1.authOrigin}/v1`,
        `  API key:  ${keyRef}`,
    ];
    if (canWrite)
        lines.push('Or wire it via env: use manifest_agent_env to get the export lines.');
    return lines.join('\n');
}
function registerEnvironmentTools(server, deps, operator) {
    const canWrite = operator.scopes.has(mcp_auth_1.MCP_WRITE_SCOPE);
    server.registerTool('manifest_agent_setup', {
        title: 'Agent setup instructions',
        description: 'Return platform setup instructions for a harness. The key is masked unless reveal is true (requires mcp:write).',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), reveal: zod_1.z.boolean().optional() }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName, reveal }) => (0, tool_result_1.result)((async () => {
        const info = await deps.lifecycle.findAgentInfo(operator.tenantId, agentName);
        if (!info)
            throw new Error(`Agent "${agentName}" not found`);
        let keyRef = maskedKeyRef(info.agent_name);
        if (reveal) {
            if (!canWrite)
                throw new Error('mcp:write scope is required to reveal the key');
            const key = await deps.apiKeys.getKeyForAgent(operator.tenantId, info.agent_name);
            if (!key.fullKey)
                throw new Error('No active key for this agent');
            keyRef = key.fullKey;
        }
        return {
            agent: info.agent_name,
            platform: info.agent_platform ?? null,
            setup: renderSetup(info.agent_platform ?? null, keyRef, canWrite),
            ...(!reveal && canWrite ? { hint: 'Pass reveal:true to embed the real key' } : {}),
        };
    })()));
    if (!canWrite)
        return;
    server.registerTool('manifest_agent_env', {
        title: 'Agent environment variables',
        description: 'Return the dotenv/shell lines that point a harness at Manifest (MANIFEST_AGENT_KEY + MANIFEST_AGENT_URL).',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), export: zod_1.z.boolean().optional() }),
    }, async ({ agent: agentName, export: useExport }) => (0, tool_result_1.result)((async () => {
        const info = await deps.lifecycle.findAgentInfo(operator.tenantId, agentName);
        if (!info)
            throw new Error(`Agent "${agentName}" not found`);
        const key = await deps.apiKeys.getKeyForAgent(operator.tenantId, info.agent_name);
        if (!key.fullKey)
            throw new Error('No active key for this agent');
        const prefix = useExport ? 'export ' : '';
        return {
            agent: info.agent_name,
            MANIFEST_AGENT_KEY: key.fullKey,
            MANIFEST_AGENT_URL: `${auth_instance_1.authOrigin}/v1`,
            lines: [
                `${prefix}MANIFEST_AGENT_KEY=${key.fullKey}`,
                `${prefix}MANIFEST_AGENT_URL=${auth_instance_1.authOrigin}/v1`,
            ],
        };
    })()));
}
function registerGuideTool(server) {
    server.registerTool('manifest_guide', {
        title: 'Manifest operating guide',
        description: 'Return the recommended workflow for managing a Manifest workspace.',
        inputSchema: zod_1.z.object({}),
        annotations: { readOnlyHint: true },
    }, async () => (0, tool_result_1.ok)({
        workflow: [
            'Call manifest_doctor first when anything looks wrong — it separates a bad URL from a bad credential.',
            'Harnesses: manifest_agent_list, then manifest_agent_get. Create with manifest_agent_create; the returned key is shown once.',
            'Providers: manifest_provider_catalog lists what is connectable; manifest_provider_connect stores a tenant-wide connection and discovers its models.',
            'Routing: manifest_routing_status tells you whether a harness can route. Configure the default chain with the newer agent configure surface, or per-agent fallbacks with manifest_routing_fallbacks_set.',
            'Model params (reasoning effort, temperature, …): manifest_routing_params_get lists what a tier route accepts and what is saved; manifest_routing_params_set saves values that override what the harness sends on routed requests (model "auto" or a matching custom-tier header). Address the route by tier ("default" or a custom tier name) and model.',
            'Verify end-to-end with manifest_routing_test — it sends one real request through the selected platform surface.',
            'A connection that is active with zero cached models is unusable; run manifest_provider_refresh.',
        ],
    }));
}
//# sourceMappingURL=environment.tools.js.map