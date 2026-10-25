"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAgentTools = registerAgentTools;
const zod_1 = require("zod");
const manifest_shared_1 = require("manifest-shared");
const playground_constants_1 = require("../../common/constants/playground.constants");
const slugify_1 = require("../../common/utils/slugify");
const mcp_auth_1 = require("../mcp-auth");
const tool_result_1 = require("../tool-result");
function registerAgentTools(server, deps, operator) {
    const invalidate = async (tenantId) => {
        if (tenantId)
            await deps.agentListCache.invalidate(tenantId);
    };
    const invalidateAutofixStatus = async (tenantId) => {
        if (tenantId)
            await deps.cacheManager.del(`${tenantId}:/api/v1/autofix/status`);
    };
    server.registerTool('manifest_agent_list', {
        title: 'List agents',
        description: 'List the workspace harnesses (agents) with usage rollups.',
        inputSchema: zod_1.z.object({
            include_playground: zod_1.z
                .boolean()
                .optional()
                .describe('Include the reserved Playground agent.'),
        }),
        annotations: { readOnlyHint: true },
    }, async ({ include_playground }) => (0, tool_result_1.result)((async () => {
        const agents = await deps.timeseries.getAgentList(operator.tenantId, include_playground === true);
        return {
            agents: agents.map((agent) => {
                const rest = { ...agent };
                delete rest.sparkline;
                return rest;
            }),
        };
    })()));
    server.registerTool('manifest_agent_get', {
        title: 'Get an agent',
        description: 'Fetch one harness by name (slug).',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent }) => (0, tool_result_1.result)((async () => ({ agent: await deps.lifecycle.findAgentInfo(operator.tenantId, agent) }))()));
    server.registerTool('manifest_agent_platforms', {
        title: 'List agent platforms',
        description: 'List valid agent platforms and categories for create/update.',
        inputSchema: zod_1.z.object({}),
        annotations: { readOnlyHint: true },
    }, async () => (0, tool_result_1.ok)({
        platforms: [...manifest_shared_1.AGENT_PLATFORMS],
        categories: [...manifest_shared_1.AGENT_CATEGORIES],
    }));
    if (!operator.scopes.has(mcp_auth_1.MCP_WRITE_SCOPE))
        return;
    server.registerTool('manifest_agent_create', {
        title: 'Create an agent',
        description: 'Create a harness (agent) and return its ingest key once. The key is a secret — store it immediately.',
        inputSchema: zod_1.z.object({
            name: zod_1.z.string().min(1).max(100),
            agent_category: zod_1.z.enum(manifest_shared_1.AGENT_CATEGORIES).optional(),
            agent_platform: zod_1.z.enum(manifest_shared_1.AGENT_PLATFORMS).optional(),
            autofix_enabled: zod_1.z.boolean().optional(),
            record_messages: zod_1.z.boolean().optional(),
        }),
    }, async ({ name, agent_category, agent_platform, autofix_enabled, record_messages }) => (0, tool_result_1.result)((async () => {
        const slug = (0, slugify_1.slugify)(name);
        if (!slug)
            throw new Error('Agent name produces an empty slug');
        if (slug === playground_constants_1.PLAYGROUND_AGENT_SLUG)
            throw new Error('"Playground" is a reserved name');
        if (autofix_enabled === true) {
            await deps.autofixStats.recordAutofixConsent();
            await invalidateAutofixStatus(operator.tenantId);
        }
        const created = await deps.apiKeys.onboardAgent({
            tenantId: operator.tenantId,
            ownerUserId: operator.userId,
            agentName: slug,
            displayName: name.trim(),
            agentCategory: agent_category,
            agentPlatform: agent_platform,
            autofixEnabled: autofix_enabled,
            recordMessages: record_messages,
        });
        try {
            await deps.providers.enableAllProvidersForAgent(created.agentId, created.tenantId);
        }
        catch (error) {
            try {
                await deps.lifecycle.deleteAgent(created.tenantId, slug);
            }
            catch {
            }
            await invalidate(created.tenantId);
            await invalidateAutofixStatus(created.tenantId);
            throw error;
        }
        await invalidate(created.tenantId);
        await invalidateAutofixStatus(created.tenantId);
        deps.eventBus.emit(created.tenantId, 'agent', operator.userId);
        return {
            agent: {
                id: created.agentId,
                name: slug,
                display_name: name.trim(),
                agent_category: agent_category ?? null,
                agent_platform: agent_platform ?? null,
            },
            apiKey: created.apiKey,
        };
    })()));
    server.registerTool('manifest_agent_update', {
        title: 'Update an agent',
        description: 'Rename a harness or change its category/platform.',
        inputSchema: zod_1.z.object({
            agent: zod_1.z.string().min(1),
            name: zod_1.z.string().min(1).max(100).optional(),
            agent_category: zod_1.z.enum(manifest_shared_1.AGENT_CATEGORIES).optional(),
            agent_platform: zod_1.z.enum(manifest_shared_1.AGENT_PLATFORMS).optional(),
        }),
    }, async ({ agent, name, agent_category, agent_platform }) => (0, tool_result_1.result)((async () => {
        if (name !== undefined) {
            const slug = (0, slugify_1.slugify)(name);
            if (!slug)
                throw new Error('Agent name produces an empty slug');
            if (slug === playground_constants_1.PLAYGROUND_AGENT_SLUG) {
                throw new Error('"Playground" is a reserved name');
            }
            await deps.lifecycle.renameAgent(operator.tenantId, agent, slug, name.trim());
            deps.resolveAgent.invalidate(operator.tenantId, agent);
            deps.resolveAgent.invalidate(operator.tenantId, slug);
        }
        if (agent_category !== undefined || agent_platform !== undefined) {
            await deps.lifecycle.updateAgentType(operator.tenantId, name ? (0, slugify_1.slugify)(name) : agent, {
                agent_category,
                agent_platform,
            });
        }
        await invalidate(operator.tenantId);
        deps.eventBus.emit(operator.tenantId, 'agent', operator.userId);
        return { updated: agent };
    })()));
    server.registerTool('manifest_agent_delete', {
        title: 'Delete an agent',
        description: 'Soft-delete a harness and deactivate its key.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
    }, async ({ agent }) => (0, tool_result_1.result)((async () => {
        await deps.lifecycle.deleteAgent(operator.tenantId, agent);
        await invalidate(operator.tenantId);
        await invalidateAutofixStatus(operator.tenantId);
        deps.eventBus.emit(operator.tenantId, 'agent', operator.userId);
        return { deleted: true, agent };
    })()));
    server.registerTool('manifest_agent_rotate_key', {
        title: 'Rotate an agent key',
        description: 'Rotate the harness ingest key and return the new key once.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
    }, async ({ agent }) => (0, tool_result_1.result)((async () => {
        const info = await deps.lifecycle.findAgentInfo(operator.tenantId, agent);
        if (!info)
            throw new Error(`Agent "${agent}" not found`);
        return await deps.apiKeys.rotateKey(operator.tenantId, agent);
    })()));
    server.registerTool('manifest_agent_key_show', {
        title: 'Show an agent key',
        description: 'Return the harness ingest key. Read-only access still exposes a live secret, so this requires the mcp:write scope.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
    }, async ({ agent }) => (0, tool_result_1.result)((async () => {
        const info = await deps.lifecycle.findAgentInfo(operator.tenantId, agent);
        if (!info)
            throw new Error(`Agent "${agent}" not found`);
        const key = await deps.apiKeys.getKeyForAgent(operator.tenantId, agent);
        return { keyPrefix: key.keyPrefix, ...(key.fullKey ? { apiKey: key.fullKey } : {}) };
    })()));
}
//# sourceMappingURL=agents.tools.js.map