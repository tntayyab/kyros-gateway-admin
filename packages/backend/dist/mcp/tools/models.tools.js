"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerModelTools = registerModelTools;
const zod_1 = require("zod");
const manifest_shared_1 = require("manifest-shared");
const tool_result_1 = require("../tool-result");
function registerModelTools(server, deps, _operator) {
    server.registerTool('manifest_models_list', {
        title: 'List available models',
        description: 'List the models the harness can route to, per connected provider.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(_operator.tenantId, agentName, {
            allowPlayground: true,
        });
        const models = await deps.modelDiscovery.getModelsForAgent(agent.tenant_id, agent.id);
        return {
            models: models.map((m) => ({
                id: m.id,
                provider: m.provider,
                display_name: m.displayName ?? null,
            })),
        };
    })()));
    server.registerTool('manifest_model_prices', {
        title: 'Model prices',
        description: 'Install-wide model pricing. No agent is required.',
        inputSchema: zod_1.z.object({ provider: zod_1.z.string().min(1).optional() }),
        annotations: { readOnlyHint: true },
    }, async ({ provider }) => (0, tool_result_1.result)((async () => {
        const { models, lastSyncedAt } = deps.modelPrices.getAll();
        const lookup = provider?.trim().toLowerCase();
        const entry = lookup
            ? manifest_shared_1.SHARED_PROVIDERS.find((p) => p.id.toLowerCase() === lookup ||
                p.aliases.some((alias) => alias.toLowerCase() === lookup))
            : undefined;
        const labels = new Set([lookup, entry?.id.toLowerCase(), entry?.displayName.toLowerCase()].filter((value) => typeof value === 'string'));
        return {
            models: models.filter((row) => !lookup || labels.has(row.provider.toLowerCase())),
            lastSyncedAt,
        };
    })()));
}
//# sourceMappingURL=models.tools.js.map