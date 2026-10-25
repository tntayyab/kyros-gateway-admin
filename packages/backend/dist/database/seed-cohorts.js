"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COHORT_SEED = void 0;
exports.seedRoutingCohorts = seedRoutingCohorts;
const auth_instance_1 = require("../auth/auth.instance");
const hash_util_1 = require("../common/utils/hash.util");
const seed_messages_1 = require("./seed-messages");
const OLD_USER_EMAIL = 'olduser@manifest.build';
const OLD_USER_PASSWORD = 'manifest';
const OLD_TENANT_ID = 'seed-tenant-old-001';
const OLD_AGENT_ID = 'seed-agent-old-001';
const OLD_OTLP_KEY_ID = 'seed-otlp-key-old-001';
const OLD_OTLP_KEY = 'mnfst_dev-otlp-key-old-001';
exports.COHORT_SEED = {
    oldUserEmail: OLD_USER_EMAIL,
    oldUserPassword: OLD_USER_PASSWORD,
    oldTenantId: OLD_TENANT_ID,
    oldAgentId: OLD_AGENT_ID,
    oldOtlpKey: OLD_OTLP_KEY,
};
const LEGACY_TIER_ROUTES = [
    { provider: 'openai', authType: 'api_key', model: 'gpt-4o' },
    { provider: 'openai', authType: 'api_key', model: 'gpt-4o' },
    { provider: 'anthropic', authType: 'subscription', model: 'claude-sonnet-4-5-20250929' },
    { provider: 'anthropic', authType: 'subscription', model: 'claude-sonnet-4-5-20250929' },
];
const LEGACY_SPECIFICITY_ROUTES = {
    coding: { provider: 'anthropic', authType: 'subscription', model: 'claude-sonnet-4-5-20250929' },
    trading: { provider: 'openai', authType: 'api_key', model: 'gpt-4o' },
};
async function seedRoutingCohorts(deps) {
    const exists = await deps.agentRepo.count({ where: { id: OLD_AGENT_ID } });
    if (exists > 0)
        return;
    await seedCleanCohort(deps);
    await seedLegacyCohort(deps);
    deps.logger.log(`Seeded routing cohorts: clean=${deps.cleanAgentId} (Default + Custom only), ` +
        `legacy=${OLD_USER_EMAIL} (complexity + task-specific visible)`);
}
async function seedCleanCohort(deps) {
    for (const conn of (0, seed_messages_1.getSeedConnections)()) {
        await deps.enabledProviderRepo.insert({
            agent_id: deps.cleanAgentId,
            tenant_provider_id: conn.id,
        });
    }
}
async function seedLegacyCohort(deps) {
    await auth_instance_1.auth.api.signUpEmail({
        body: { email: OLD_USER_EMAIL, password: OLD_USER_PASSWORD, name: 'Old User' },
    });
    await deps.dataSource.query(`UPDATE "user" SET "emailVerified" = true WHERE email = $1`, [
        OLD_USER_EMAIL,
    ]);
    const rows = await deps.dataSource.query(`SELECT id FROM "user" WHERE email = $1`, [
        OLD_USER_EMAIL,
    ]);
    const userId = rows.length > 0 ? String(rows[0].id) : null;
    if (!userId)
        return;
    await deps.tenantRepo.insert({
        id: OLD_TENANT_ID,
        name: userId,
        owner_user_id: userId,
        organization_name: 'Old User Org',
        email: OLD_USER_EMAIL,
        is_active: true,
    });
    await deps.agentRepo.insert({
        id: OLD_AGENT_ID,
        name: 'demo-agent',
        description: 'Legacy agent — complexity + task-specific routing still visible',
        agent_category: 'personal',
        agent_platform: 'openclaw',
        is_active: true,
        tenant_id: OLD_TENANT_ID,
    });
    await deps.agentKeyRepo.insert({
        id: OLD_OTLP_KEY_ID,
        key: null,
        key_hash: (0, hash_util_1.hashKey)(OLD_OTLP_KEY),
        key_prefix: (0, hash_util_1.keyPrefix)(OLD_OTLP_KEY),
        label: 'Demo OTLP ingest key',
        tenant_id: OLD_TENANT_ID,
        agent_id: OLD_AGENT_ID,
        is_active: true,
    });
    for (const conn of (0, seed_messages_1.getSeedConnections)()) {
        const providerId = `${conn.id}-old`;
        await deps.providerRepo.insert({
            id: providerId,
            tenant_id: OLD_TENANT_ID,
            created_by_user_id: userId,
            provider: conn.provider,
            auth_type: conn.auth_type,
            label: 'Default',
            priority: 0,
            is_active: true,
        });
        await deps.enabledProviderRepo.insert({
            agent_id: OLD_AGENT_ID,
            tenant_provider_id: providerId,
        });
    }
    await deps.agentRepo.update({ id: OLD_AGENT_ID }, { complexity_routing_enabled: true });
    await deps.tierRepo.insert(['simple', 'standard', 'complex', 'reasoning'].map((tier, i) => ({
        id: `seed-tier-${tier}`,
        agent_id: OLD_AGENT_ID,
        tier,
        override_route: LEGACY_TIER_ROUTES[i],
    })));
    await deps.specificityRepo.insert(['coding', 'trading'].map((category) => ({
        id: `seed-spec-${category}`,
        agent_id: OLD_AGENT_ID,
        category,
        is_active: true,
        override_route: LEGACY_SPECIFICITY_ROUTES[category],
    })));
}
//# sourceMappingURL=seed-cohorts.js.map