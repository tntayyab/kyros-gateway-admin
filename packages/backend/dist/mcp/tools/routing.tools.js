"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutingTools = registerRoutingTools;
const zod_1 = require("zod");
const manifest_shared_1 = require("manifest-shared");
const auth_instance_1 = require("../../auth/auth.instance");
const mcp_auth_1 = require("../mcp-auth");
const tool_result_1 = require("../tool-result");
const resolve_model_route_1 = require("../../routing/routing-core/resolve-model-route");
const AUTH_TYPES = ['api_key', 'subscription', 'local'];
const ROUTE_TEST_TIMEOUT_MS = 120_000;
async function setOrClear(set, clear, fallbacks) {
    if (fallbacks.length > 0)
        return set();
    await clear();
    return [];
}
function parseCompletionSurface(parsed) {
    const choice = parsed['choices']?.[0];
    const message = choice?.['message'];
    const usage = parsed['usage'];
    return {
        reply: message?.content ?? '',
        servedModel: typeof parsed['model'] === 'string' ? parsed['model'] : null,
        ...(usage?.prompt_tokens !== undefined
            ? { tokens: (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0) }
            : {}),
    };
}
function parseMessagesSurface(parsed) {
    const blocks = parsed['content'];
    const textBlock = blocks?.find((b) => b['type'] === 'text');
    const usage = parsed['usage'];
    return {
        reply: typeof textBlock?.['text'] === 'string' ? textBlock['text'] : '',
        servedModel: typeof parsed['model'] === 'string' ? parsed['model'] : null,
        ...(usage?.input_tokens !== undefined
            ? { tokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0) }
            : {}),
    };
}
function parseResponsesSurface(parsed) {
    const output = parsed['output'];
    let reply = '';
    for (const item of output ?? []) {
        if (item['type'] !== 'message')
            continue;
        const content = item['content'];
        for (const part of content ?? []) {
            if (part['type'] === 'output_text' && typeof part['text'] === 'string')
                reply += part['text'];
        }
    }
    const usage = parsed['usage'];
    return {
        reply,
        servedModel: typeof parsed['model'] === 'string' ? parsed['model'] : null,
        ...(usage?.input_tokens !== undefined
            ? { tokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0) }
            : {}),
    };
}
function hasSurfacePayload(surface, parsed) {
    const nonEmpty = (value) => Array.isArray(value) && value.length > 0;
    if (surface === 'messages')
        return nonEmpty(parsed['content']);
    if (surface === 'responses')
        return nonEmpty(parsed['output']);
    return nonEmpty(parsed['choices']);
}
function registerRoutingTools(server, deps, operator) {
    const canWrite = operator.scopes.has(mcp_auth_1.MCP_WRITE_SCOPE);
    server.registerTool('manifest_routing_status', {
        title: 'Routing status',
        description: 'Report whether a harness can route yet, and why not.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        const providers = await deps.providers.getProviders(agent.tenant_id);
        if (providers.length === 0)
            return { enabled: false, reason: 'no_provider' };
        if (deps.pricingSync.getAll().size === 0)
            return { enabled: false, reason: 'pricing_cache_empty' };
        const routable = await deps.tiers.hasRoutableTier(agent.id);
        return { enabled: routable, reason: routable ? null : 'no_routable_models' };
    })()));
    server.registerTool('manifest_routing_fallbacks_get', {
        title: 'Get fallbacks',
        description: 'Read the fallback chain of a tier (default tier by default).',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), tier: zod_1.z.string().min(1).optional() }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName, tier }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        return { fallbacks: await deps.tiers.getFallbacks(agent.id, tier ?? 'default') };
    })()));
    if (canWrite)
        server.registerTool('manifest_routing_fallbacks_set', {
            title: 'Set fallbacks',
            description: 'Replace the fallback chain of a tier. One entry clears the rest.',
            inputSchema: zod_1.z.object({
                agent: zod_1.z.string().min(1),
                models: zod_1.z.array(zod_1.z.string().min(1)).max(5),
                tier: zod_1.z.string().min(1).optional(),
            }),
        }, async ({ agent: agentName, models, tier }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            const fallbacks = await deps.tiers.setFallbacks(agent.id, agent.tenant_id, tier ?? 'default', models);
            return { fallbacks };
        })()));
    if (canWrite)
        server.registerTool('manifest_routing_fallbacks_clear', {
            title: 'Clear fallbacks',
            description: 'Remove the fallback chain from a tier.',
            inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), tier: zod_1.z.string().min(1).optional() }),
        }, async ({ agent: agentName, tier }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            await deps.tiers.clearFallbacks(agent.id, tier ?? 'default');
            return { ok: true };
        })()));
    server.registerTool('manifest_routing_params_get', {
        title: 'Get model params',
        description: 'List the params a routed model accepts (type, allowed values, description) with their saved ' +
            'values, e.g. reasoning.effort or temperature. tier is "default" or a custom tier name; model ' +
            'defaults to the tier primary and may name one of its fallbacks. current: null means the ' +
            'provider default applies.',
        inputSchema: zod_1.z.object({
            agent: zod_1.z.string().min(1),
            tier: zod_1.z.string().min(1).optional(),
            model: zod_1.z.string().min(1).optional(),
        }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName, tier, model }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        return deps.routeModelParams.get(agent.id, tier, model);
    })()));
    if (canWrite)
        server.registerTool('manifest_routing_params_set', {
            title: 'Set model params',
            description: 'Set or unset params on a routed model. Saved params override the values the caller sends ' +
                'on routed requests (model "auto" or a matching custom-tier header); a request naming a ' +
                'concrete model skips them. ' +
                'set maps a param path to its value ({"reasoning.effort": "high"}); unset lists paths to ' +
                'remove. Other saved params are kept. Read manifest_routing_params_get first for valid paths.',
            inputSchema: zod_1.z.object({
                agent: zod_1.z.string().min(1),
                tier: zod_1.z.string().min(1).optional(),
                model: zod_1.z.string().min(1).optional(),
                set: zod_1.z.record(zod_1.z.string().min(1), zod_1.z.unknown()).optional(),
                unset: zod_1.z.array(zod_1.z.string().min(1)).max(50).optional(),
            }),
        }, async ({ agent: agentName, tier, model, set, unset }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            return deps.routeModelParams.update(agent.id, tier, model, {
                set: set,
                unset,
            });
        })()));
    server.registerTool('manifest_routing_autofix_get', {
        title: 'Get Autofix state',
        description: 'Report whether Autofix is effective for a harness.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        return { enabled: deps.autofix.resolveEnabled(agent.autofix_enabled) };
    })()));
    if (canWrite)
        server.registerTool('manifest_routing_autofix_set', {
            title: 'Set Autofix state',
            description: 'Enable or disable Autofix for a harness.',
            inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), enabled: zod_1.z.boolean() }),
        }, async ({ agent: agentName, enabled }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            if (enabled)
                await deps.autofixStats.recordAutofixConsent();
            await deps.agentRepo.update(agent.id, { autofix_enabled: enabled });
            deps.resolveAgent.invalidate(agent.tenant_id, agentName);
            await deps.cacheManager.del(`${agent.tenant_id}:/api/v1/autofix/status`);
            return { enabled: deps.autofix.resolveEnabled(enabled) };
        })()));
    server.registerTool('manifest_routing_recording_get', {
        title: 'Get recording state',
        description: 'Report whether request recording is on for a harness.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        return { enabled: await deps.recording.isRecording(agent.id) };
    })()));
    if (canWrite)
        server.registerTool('manifest_routing_recording_set', {
            title: 'Set recording state',
            description: 'Turn request recording on or off for a harness.',
            inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), enabled: zod_1.z.boolean() }),
        }, async ({ agent: agentName, enabled }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            await deps.agentRepo.update(agent.id, { record_messages: enabled });
            deps.resolveAgent.invalidate(agent.tenant_id, agentName);
            return { enabled };
        })()));
    server.registerTool('manifest_routing_custom_list', {
        title: 'List custom tiers',
        description: 'List a harness’s header-triggered custom tiers.',
        inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1) }),
        annotations: { readOnlyHint: true },
    }, async ({ agent: agentName }) => (0, tool_result_1.result)((async () => {
        const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
        return { custom_tiers: await deps.headerTiers.list(agent.id) };
    })()));
    if (canWrite)
        server.registerTool('manifest_routing_test', {
            title: 'Test a route end-to-end',
            description: 'Send one real request through the harness route and the platform surface it uses. Spends provider tokens.',
            inputSchema: zod_1.z.object({
                agent: zod_1.z.string().min(1),
                prompt: zod_1.z.string().min(1).optional(),
                tier: zod_1.z.string().min(1).optional(),
                model: zod_1.z.string().min(1).optional(),
                as: zod_1.z.string().min(1).optional().describe('Force a platform surface (e.g. claude-code).'),
            }),
        }, async ({ agent: agentName, prompt, tier, model, as: platformOverride }) => (0, tool_result_1.result)((async () => {
            const info = await deps.lifecycle.findAgentInfo(operator.tenantId, agentName);
            if (!info)
                throw new Error(`Agent "${agentName}" not found`);
            if (platformOverride !== undefined &&
                !Object.prototype.hasOwnProperty.call(manifest_shared_1.PLATFORM_API_SURFACES, platformOverride)) {
                throw new Error(`Unknown platform: ${platformOverride}`);
            }
            const platform = platformOverride ?? info.agent_platform ?? undefined;
            const surface = (platform
                ? manifest_shared_1.PLATFORM_API_SURFACES[platform]
                : undefined) ?? 'chat_completions';
            const key = await deps.apiKeys.getKeyForAgent(operator.tenantId, info.agent_name);
            if (!key.fullKey)
                throw new Error('No active key for this agent');
            const endpoint = surface === 'messages'
                ? `${auth_instance_1.authOrigin}/v1/messages`
                : surface === 'responses'
                    ? `${auth_instance_1.authOrigin}/v1/responses`
                    : `${auth_instance_1.authOrigin}/v1/chat/completions`;
            const text = prompt ?? 'Reply with exactly: OK';
            const requestedModel = model ?? 'auto';
            const body = surface === 'messages'
                ? {
                    model: requestedModel,
                    max_tokens: 64,
                    messages: [{ role: 'user', content: text }],
                }
                : surface === 'responses'
                    ? { model: requestedModel, input: text }
                    : { model: requestedModel, messages: [{ role: 'user', content: text }] };
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), ROUTE_TEST_TIMEOUT_MS);
            const started = Date.now();
            let response;
            let raw;
            try {
                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${key.fullKey}`,
                        'Content-Type': 'application/json',
                        ...(surface === 'messages' ? { 'anthropic-version': '2023-06-01' } : {}),
                        ...(tier ? { 'x-manifest-tier': tier } : {}),
                    },
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });
                raw = await response.text();
            }
            finally {
                clearTimeout(timer);
            }
            const durationMs = Date.now() - started;
            let parsed = {};
            let parsedOk = false;
            try {
                const value = JSON.parse(raw);
                if (typeof value === 'object' && value !== null) {
                    parsed = value;
                    parsedOk = true;
                }
            }
            catch {
            }
            if (!response.ok) {
                const message = parsed['error']?.message;
                throw new Error(message ?? `Route test failed with HTTP ${response.status}`);
            }
            if (!parsedOk || !hasSurfacePayload(surface, parsed)) {
                throw new Error(`Route test got HTTP ${response.status} but no ${surface} payload`);
            }
            const surfaceResult = surface === 'messages'
                ? parseMessagesSurface(parsed)
                : surface === 'responses'
                    ? parseResponsesSurface(parsed)
                    : parseCompletionSurface(parsed);
            if (/^\[🦚 Manifest M\d+\]/.test(surfaceResult.reply)) {
                throw new Error(surfaceResult.reply);
            }
            return {
                agent: info.agent_name,
                ok: true,
                surface,
                ...(platform ? { platform } : {}),
                requested_model: requestedModel,
                ...(tier ? { tier } : {}),
                served_model: surfaceResult.servedModel,
                duration_ms: durationMs,
                ...(surfaceResult.tokens !== undefined ? { tokens: surfaceResult.tokens } : {}),
                reply: surfaceResult.reply,
            };
        })()));
    if (canWrite)
        server.registerTool('manifest_agent_configure', {
            title: 'Configure an agent',
            description: 'Set the default route and fallback chain (or a custom header tier), and/or toggle Autofix and recording. `models` is the full chain: first is the route, the rest are fallbacks.',
            inputSchema: zod_1.z.object({
                agent: zod_1.z.string().min(1),
                models: zod_1.z.array(zod_1.z.string().min(1)).min(1).max(6).optional(),
                provider: zod_1.z.string().min(1).optional(),
                auth_type: zod_1.z.enum(AUTH_TYPES).optional(),
                key_label: zod_1.z.string().min(1).max(50).optional(),
                tier: zod_1.z
                    .string()
                    .min(1)
                    .optional()
                    .describe('Upsert this custom header tier instead of the default route.'),
                autofix: zod_1.z.boolean().optional(),
                recording: zod_1.z.boolean().optional(),
                force: zod_1.z.boolean().optional().describe('Skip the discovered-model check.'),
            }),
        }, async ({ agent: agentName, models, provider, auth_type, key_label, tier, autofix, recording, force, }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            const output = { agent: agentName };
            const wantsRoute = models !== undefined ||
                provider !== undefined ||
                auth_type !== undefined ||
                key_label !== undefined;
            if (!wantsRoute && autofix === undefined && recording === undefined) {
                throw new Error('Nothing to configure — pass models + provider, autofix, and/or recording');
            }
            if (tier !== undefined && !wantsRoute)
                throw new Error('tier needs models and provider');
            if (wantsRoute) {
                if (!models || models.length === 0 || !provider) {
                    throw new Error('models and provider are required together');
                }
                const primary = models[0];
                const fallbacks = models.slice(1);
                const available = await deps.modelDiscovery.getModelsForAgent(agent.tenant_id, agent.id);
                const primaryRoute = (0, resolve_model_route_1.resolveModelRoute)(primary, available, {
                    provider,
                    authType: auth_type,
                });
                if (!force) {
                    if (!primaryRoute.ok) {
                        throw new Error(`${(0, resolve_model_route_1.describeUnresolvedModel)(primary, primaryRoute.reason, available, {
                            provider,
                            authType: auth_type,
                        })} Refresh models or pass force:true.`);
                    }
                    const missing = fallbacks.filter((name) => !available.some((m) => (0, resolve_model_route_1.matchesModelName)(m, name)));
                    if (missing.length > 0) {
                        throw new Error(`Not in the models discovered for "${agentName}": ${missing.join(', ')}. ` +
                            'Refresh models or pass force:true.');
                    }
                }
                const authType = auth_type ?? (primaryRoute.ok ? primaryRoute.route.authType : 'api_key');
                if (tier) {
                    const list = await deps.headerTiers.list(agent.id);
                    const hit = list.find((t) => t.name.toLowerCase() === tier.toLowerCase());
                    const target = hit ??
                        (await deps.headerTiers.create(agent.id, agent.tenant_id, {
                            name: tier,
                            header_key: 'x-manifest-tier',
                            header_value: tier,
                            badge_color: 'indigo',
                        }));
                    output['tier'] = { id: target.id, name: target.name, created: !hit };
                    try {
                        output['route'] = await deps.headerTiers.setOverride(agent.id, agent.tenant_id, target.id, primary, provider, authType, key_label ?? null);
                        output['fallbacks'] = await setOrClear(() => deps.headerTiers.setFallbacks(agent.id, agent.tenant_id, target.id, fallbacks), () => deps.headerTiers.clearFallbacks(agent.id, target.id), fallbacks);
                    }
                    catch (error) {
                        if (!hit)
                            await deps.headerTiers.delete(agent.id, target.id).catch(() => undefined);
                        throw error;
                    }
                }
                else {
                    output['route'] = await deps.tiers.setOverride(agent.id, agent.tenant_id, 'default', primary, provider, authType, key_label);
                    output['fallbacks'] = await setOrClear(() => deps.tiers.setFallbacks(agent.id, agent.tenant_id, 'default', fallbacks), () => deps.tiers.clearFallbacks(agent.id, 'default'), fallbacks);
                }
            }
            if (autofix !== undefined) {
                if (autofix)
                    await deps.autofixStats.recordAutofixConsent();
                await deps.agentRepo.update(agent.id, { autofix_enabled: autofix });
                deps.resolveAgent.invalidate(agent.tenant_id, agentName);
                await deps.cacheManager.del(`${agent.tenant_id}:/api/v1/autofix/status`);
                output['autofix'] = { enabled: deps.autofix.resolveEnabled(autofix) };
            }
            if (recording !== undefined) {
                await deps.agentRepo.update(agent.id, { record_messages: recording });
                deps.resolveAgent.invalidate(agent.tenant_id, agentName);
                output['recording'] = { enabled: recording };
            }
            return output;
        })()));
    if (canWrite)
        server.registerTool('manifest_routing_custom_create', {
            title: 'Create a custom tier',
            description: 'Create a header-triggered custom tier, optionally with a route override and fallbacks.',
            inputSchema: zod_1.z.object({
                agent: zod_1.z.string().min(1),
                name: zod_1.z.string().min(1),
                header_key: zod_1.z.string().min(1),
                header_value: zod_1.z.string().min(1),
                badge_color: zod_1.z.string().min(1),
                model: zod_1.z.string().min(1).optional(),
                provider: zod_1.z.string().min(1).optional(),
                auth_type: zod_1.z.enum(AUTH_TYPES).optional(),
                fallbacks: zod_1.z.array(zod_1.z.string().min(1)).max(5).optional(),
            }),
        }, async ({ agent: agentName, name, header_key, header_value, badge_color, model, provider, auth_type, fallbacks, }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            if (fallbacks && fallbacks.length > 0 && !model) {
                throw new Error('fallbacks require a model (the primary route)');
            }
            const tier = await deps.headerTiers.create(agent.id, agent.tenant_id, {
                name,
                header_key,
                header_value,
                badge_color: badge_color,
            });
            try {
                if (model) {
                    await deps.headerTiers.setOverride(agent.id, agent.tenant_id, tier.id, model, provider, auth_type);
                }
                if (fallbacks && fallbacks.length > 0) {
                    await deps.headerTiers.setFallbacks(agent.id, agent.tenant_id, tier.id, fallbacks);
                }
            }
            catch (error) {
                await deps.headerTiers.delete(agent.id, tier.id).catch(() => undefined);
                throw error;
            }
            return {
                tier: await deps.headerTiers
                    .list(agent.id)
                    .then((t) => t.find((x) => x.id === tier.id)),
            };
        })()));
    if (canWrite)
        server.registerTool('manifest_routing_custom_delete', {
            title: 'Delete a custom tier',
            description: 'Delete a header-triggered custom tier by id.',
            inputSchema: zod_1.z.object({ agent: zod_1.z.string().min(1), id: zod_1.z.string().min(1) }),
        }, async ({ agent: agentName, id }) => (0, tool_result_1.result)((async () => {
            const agent = await deps.resolveAgent.resolve(operator.tenantId, agentName);
            await deps.headerTiers.delete(agent.id, id);
            return { ok: true };
        })()));
}
//# sourceMappingURL=routing.tools.js.map