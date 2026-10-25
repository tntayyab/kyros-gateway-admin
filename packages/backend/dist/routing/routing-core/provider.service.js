"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../../entities/agent-enabled-provider.entity");
const tier_assignment_entity_1 = require("../../entities/tier-assignment.entity");
const specificity_assignment_entity_1 = require("../../entities/specificity-assignment.entity");
const agent_entity_1 = require("../../entities/agent.entity");
const header_tier_entity_1 = require("../../entities/header-tier.entity");
const agent_message_entity_1 = require("../../entities/agent-message.entity");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const routing_cache_service_1 = require("./routing-cache.service");
const crypto_1 = require("crypto");
const crypto_util_1 = require("../../common/utils/crypto.util");
const subscription_support_1 = require("../../common/utils/subscription-support");
const manifest_shared_1 = require("manifest-shared");
const qwen_region_1 = require("../qwen-region");
const bedrock_region_1 = require("../bedrock-region");
const subscription_region_1 = require("../subscription-region");
const minimax_oauth_helpers_1 = require("../oauth/minimax/minimax-oauth-helpers");
const provider_availability_1 = require("../../common/utils/provider-availability");
const managed_free_providers_1 = require("../../common/constants/managed-free-providers");
const MAX_KEYS_MANAGED_FREE_PROVIDER = 1;
const MAX_LABEL_LENGTH = 50;
const DEFAULT_LABEL = 'Default';
const SUBSCRIPTION_LOCK_TIMEOUT = '5s';
const SUBSCRIPTION_REFRESH_IDLE_TIMEOUT = '20s';
let ProviderService = ProviderService_1 = class ProviderService {
    providerRepo;
    tierRepo;
    specificityRepo;
    agentRepo;
    headerTierRepo;
    pricingCache;
    routingCache;
    enabledProviderRepo;
    logger = new common_1.Logger(ProviderService_1.name);
    constructor(providerRepo, tierRepo, specificityRepo, agentRepo, headerTierRepo, pricingCache, routingCache, enabledProviderRepo = null) {
        this.providerRepo = providerRepo;
        this.tierRepo = tierRepo;
        this.specificityRepo = specificityRepo;
        this.agentRepo = agentRepo;
        this.headerTierRepo = headerTierRepo;
        this.pricingCache = pricingCache;
        this.routingCache = routingCache;
        this.enabledProviderRepo = enabledProviderRepo;
    }
    tenantProviderRepo(manager) {
        return manager ? manager.getRepository(tenant_provider_entity_1.TenantProvider) : this.providerRepo;
    }
    agentEnabledProviderRepo(manager) {
        if (!this.enabledProviderRepo)
            return null;
        return manager ? manager.getRepository(agent_enabled_provider_entity_1.AgentEnabledProvider) : this.enabledProviderRepo;
    }
    agentMessageRepo(manager) {
        return manager
            ? manager.getRepository(agent_message_entity_1.AgentMessage)
            : this.providerRepo.manager.getRepository(agent_message_entity_1.AgentMessage);
    }
    async recalculateTiers(agentId, tenantId) {
        this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
    }
    async recalculateTiersForTenant(tenantId) {
        for (const agentId of await this.listOwnedAgentIds(tenantId)) {
            this.routingCache.invalidateAgent(agentId);
        }
        this.routingCache.invalidateTenant(tenantId);
    }
    async getProviders(tenantId) {
        const cached = this.routingCache.getProviders(tenantId);
        if (cached)
            return (0, provider_availability_1.filterProvidersForDeployment)(cached);
        await this.cleanupUnsupportedSubscriptionProviders(tenantId);
        const providers = (0, provider_availability_1.filterProvidersForDeployment)((await this.providerRepo.find({ where: { tenant_id: tenantId } })).filter(subscription_support_1.isManifestUsableProvider));
        this.routingCache.setProviders(tenantId, providers);
        return providers;
    }
    async enableProviderForAgent(agentId, userProviderId, manager) {
        const enabledRepo = this.agentEnabledProviderRepo(manager);
        if (!enabledRepo)
            return;
        await enabledRepo
            .createQueryBuilder()
            .insert()
            .into(agent_enabled_provider_entity_1.AgentEnabledProvider)
            .values({ agent_id: agentId, tenant_provider_id: userProviderId })
            .orIgnore()
            .execute();
    }
    async enableAllProvidersForAgent(agentId, tenantId) {
        for (const provider of await this.getProviders(tenantId)) {
            await this.enableProviderForAgent(agentId, provider.id);
        }
        this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
    }
    async enableProviderForAllAgents(tenantId, userProviderId, manager) {
        for (const agentId of await this.listOwnedAgentIds(tenantId)) {
            await this.enableProviderForAgent(agentId, userProviderId, manager);
            this.routingCache.invalidateAgent(agentId);
        }
        this.routingCache.invalidateTenant(tenantId);
    }
    async fanOutIfReactivated(wasInactive, tenantId, userProviderId, manager) {
        if (!wasInactive)
            return;
        await this.enableProviderForAllAgents(tenantId, userProviderId, manager);
    }
    async deleteProviderAccess(userProviderIds, manager) {
        const enabledRepo = this.agentEnabledProviderRepo(manager);
        if (!enabledRepo || userProviderIds.length === 0)
            return;
        await enabledRepo.delete({ tenant_provider_id: (0, typeorm_2.In)(userProviderIds) });
    }
    async getFreshSubscriptionCredential(tenantId, provider, label) {
        const wantedLabel = (label ?? DEFAULT_LABEL).toLowerCase();
        const rows = await this.providerRepo.find({
            where: { tenant_id: tenantId, provider, auth_type: 'subscription' },
        });
        const row = rows.find((r) => r.label.toLowerCase() === wantedLabel);
        if (!row?.api_key_encrypted)
            return null;
        try {
            return (0, crypto_util_1.decryptWithAny)(row.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
        }
        catch {
            return null;
        }
    }
    async withSubscriptionCredentialLock(tenantId, provider, label, fn) {
        const wantedLabel = (label ?? DEFAULT_LABEL).trim().toLowerCase();
        let didWrite = false;
        const result = await this.providerRepo.manager.transaction(async (manager) => {
            const repo = manager.getRepository(tenant_provider_entity_1.TenantProvider);
            await manager.query(`SET LOCAL lock_timeout = '${SUBSCRIPTION_LOCK_TIMEOUT}'`);
            await manager.query(`SET LOCAL idle_in_transaction_session_timeout = '${SUBSCRIPTION_REFRESH_IDLE_TIMEOUT}'`);
            const row = (await repo
                .createQueryBuilder('tp')
                .setLock('pessimistic_write')
                .where('tp.tenant_id = :tenantId', { tenantId })
                .andWhere('tp.provider = :provider', { provider })
                .andWhere(`tp.auth_type = 'subscription'`)
                .andWhere('LOWER(tp.label) = :label', { label: wantedLabel })
                .getOne()) ?? null;
            return fn({
                readFreshRaw: async () => {
                    if (!row?.api_key_encrypted)
                        return null;
                    try {
                        return (0, crypto_util_1.decryptWithAny)(row.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
                    }
                    catch {
                        return null;
                    }
                },
                writeRaw: async (raw) => {
                    if (!row) {
                        throw new Error(`No subscription credential row to persist for ${provider}/${wantedLabel}`);
                    }
                    const encrypted = (0, crypto_util_1.encrypt)(raw, (0, crypto_util_1.getEncryptionSecret)());
                    const keyPrefix = raw.substring(0, 8);
                    const updatedAt = new Date().toISOString();
                    await manager.transaction(async (sub) => {
                        await sub
                            .getRepository(tenant_provider_entity_1.TenantProvider)
                            .update({ id: row.id }, { api_key_encrypted: encrypted, key_prefix: keyPrefix, updated_at: updatedAt });
                    });
                    row.api_key_encrypted = encrypted;
                    row.key_prefix = keyPrefix;
                    row.updated_at = updatedAt;
                    didWrite = true;
                },
            });
        });
        if (didWrite)
            this.routingCache.invalidateTenant(tenantId);
        return result;
    }
    async upsertProvider(agentId, tenantId, provider, apiKey, authType, region, label, createdByUserId, manager) {
        const effectiveAuthType = authType ?? 'api_key';
        const trimmedLabel = this.normalizeLabel(label, effectiveAuthType);
        const repo = this.tenantProviderRepo(manager);
        if (trimmedLabel) {
            return this.upsertProviderWithLabel(agentId, tenantId, provider, apiKey, effectiveAuthType, region, trimmedLabel, createdByUserId, manager);
        }
        const existing = await repo.findOne({
            where: { tenant_id: tenantId, provider, auth_type: effectiveAuthType, label: DEFAULT_LABEL },
        });
        const resolvedRegion = await this.resolveProviderRegion(provider, effectiveAuthType, region, apiKey, existing);
        const apiKeyEncrypted = apiKey ? (0, crypto_util_1.encrypt)(apiKey, (0, crypto_util_1.getEncryptionSecret)()) : null;
        const keyPrefix = apiKey ? apiKey.substring(0, 8) : null;
        if (existing) {
            const wasInactive = !existing.is_active;
            if (apiKeyEncrypted !== null) {
                existing.api_key_encrypted = apiKeyEncrypted;
                existing.key_prefix = keyPrefix;
            }
            existing.region = resolvedRegion;
            existing.is_active = true;
            existing.updated_at = new Date().toISOString();
            await repo.save(existing);
            await this.fanOutIfReactivated(wasInactive, tenantId, existing.id, manager);
            await this.afterProviderChange(agentId, tenantId, existing.id, manager);
            return { provider: existing, isNew: false };
        }
        const record = Object.assign(new tenant_provider_entity_1.TenantProvider(), {
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenantId,
            created_by_user_id: createdByUserId ?? null,
            provider,
            auth_type: effectiveAuthType,
            label: DEFAULT_LABEL,
            priority: 0,
            api_key_encrypted: apiKeyEncrypted,
            key_prefix: keyPrefix,
            region: resolvedRegion,
            is_active: true,
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        await repo.insert(record);
        await this.enableProviderForAllAgents(tenantId, record.id, manager);
        return { provider: record, isNew: true };
    }
    async upsertProviderWithLabel(agentId, tenantId, provider, apiKey, authType, region, label, createdByUserId, manager) {
        const repo = this.tenantProviderRepo(manager);
        const existingRows = await repo.find({
            where: { tenant_id: tenantId, provider, auth_type: authType },
        });
        const existing = existingRows.find((r) => r.label.toLowerCase() === label.toLowerCase()) ?? null;
        const resolvedRegion = await this.resolveProviderRegion(provider, authType, region, apiKey, existing);
        const apiKeyEncrypted = apiKey ? (0, crypto_util_1.encrypt)(apiKey, (0, crypto_util_1.getEncryptionSecret)()) : null;
        const keyPrefix = apiKey ? apiKey.substring(0, 8) : null;
        if (existing) {
            const wasInactive = !existing.is_active;
            if (apiKeyEncrypted !== null) {
                existing.api_key_encrypted = apiKeyEncrypted;
                existing.key_prefix = keyPrefix;
            }
            existing.region = resolvedRegion;
            existing.is_active = true;
            existing.updated_at = new Date().toISOString();
            await repo.save(existing);
            await this.fanOutIfReactivated(wasInactive, tenantId, existing.id, manager);
            await this.afterProviderChange(agentId, tenantId, existing.id, manager);
            return { provider: existing, isNew: false };
        }
        const activeCount = existingRows.filter((r) => r.is_active).length;
        const managedFreeConfig = (0, managed_free_providers_1.getManagedFreeProviderConfig)(provider);
        const maxKeys = managedFreeConfig ? MAX_KEYS_MANAGED_FREE_PROVIDER : manifest_shared_1.MAX_KEYS_PER_PROVIDER;
        if (activeCount >= maxKeys) {
            throw new common_1.BadRequestException(maxKeys === 1
                ? `You can connect at most 1 key for ${managedFreeConfig.displayName}`
                : `You can connect at most ${maxKeys} keys per provider`);
        }
        if (apiKey) {
            const sameKey = existingRows.find((r) => !!r.api_key_encrypted && this.decryptOrNull(r.api_key_encrypted) === apiKey);
            if (sameKey) {
                const wasInactive = !sameKey.is_active;
                sameKey.region = resolvedRegion;
                sameKey.is_active = true;
                sameKey.updated_at = new Date().toISOString();
                await repo.save(sameKey);
                await this.fanOutIfReactivated(wasInactive, tenantId, sameKey.id, manager);
                await this.afterProviderChange(agentId, tenantId, sameKey.id, manager);
                return { provider: sameKey, isNew: false };
            }
        }
        const record = Object.assign(new tenant_provider_entity_1.TenantProvider(), {
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenantId,
            created_by_user_id: createdByUserId ?? null,
            provider,
            auth_type: authType,
            label,
            priority: this.nextPriority(existingRows),
            api_key_encrypted: apiKeyEncrypted,
            key_prefix: keyPrefix,
            region: resolvedRegion,
            is_active: true,
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        await repo.insert(record);
        await this.enableProviderForAllAgents(tenantId, record.id, manager);
        return { provider: record, isNew: true };
    }
    async renameKey(agentId, tenantId, provider, authType, currentLabel, newLabel) {
        const trimmed = newLabel.trim();
        this.assertLabelLooksValid(trimmed);
        const rows = await this.providerRepo.find({
            where: { tenant_id: tenantId, provider, auth_type: authType },
        });
        const target = rows.find((r) => r.label.toLowerCase() === currentLabel.toLowerCase());
        if (!target)
            throw new common_1.NotFoundException('Provider key not found');
        if (rows.some((r) => r.id !== target.id && r.label.toLowerCase() === trimmed.toLowerCase())) {
            throw new common_1.BadRequestException(`A key named "${trimmed}" already exists for this provider`);
        }
        const previousLabel = target.label;
        target.label = trimmed;
        target.updated_at = new Date().toISOString();
        await this.providerRepo.save(target);
        await this.relabelOverrides(tenantId, provider, authType, previousLabel, trimmed);
        if (agentId !== null)
            this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
        return target;
    }
    async reorderKeys(agentId, tenantId, provider, authType, orderedLabels) {
        const allRows = await this.providerRepo.find({
            where: { tenant_id: tenantId, provider, auth_type: authType },
        });
        const rows = allRows.filter((r) => r.is_active);
        if (rows.length === 0)
            throw new common_1.NotFoundException('Provider not found');
        const byLabel = new Map(rows.map((r) => [r.label.toLowerCase(), r]));
        if (orderedLabels.length !== rows.length) {
            throw new common_1.BadRequestException(`Reorder must include exactly ${rows.length} labels for this provider`);
        }
        const seen = new Set();
        for (const label of orderedLabels) {
            const lower = label.toLowerCase();
            if (seen.has(lower)) {
                throw new common_1.BadRequestException(`Duplicate label "${label}" in reorder request`);
            }
            seen.add(lower);
            if (!byLabel.has(lower)) {
                throw new common_1.BadRequestException(`Unknown label "${label}" in reorder request`);
            }
        }
        const now = new Date().toISOString();
        const updated = [];
        for (let i = 0; i < orderedLabels.length; i++) {
            const row = byLabel.get(orderedLabels[i].toLowerCase());
            row.priority = i;
            row.updated_at = now;
            updated.push(row);
        }
        await this.providerRepo.save(updated);
        this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
        return updated;
    }
    async resolveProviderRegion(provider, authType, requestedRegion, apiKey, existing) {
        const lower = provider.toLowerCase();
        if (lower === 'minimax' && authType === 'api_key') {
            if (requestedRegion === undefined) {
                return (0, minimax_oauth_helpers_1.isMinimaxRegion)(existing?.region ?? undefined) ? existing.region : null;
            }
            if (!(0, minimax_oauth_helpers_1.isMinimaxRegion)(requestedRegion)) {
                throw new common_1.BadRequestException(minimax_oauth_helpers_1.MINIMAX_API_KEY_REGION_VALIDATION_MESSAGE);
            }
            return requestedRegion;
        }
        const subscriptionRegionConfig = (0, subscription_region_1.getSubscriptionEndpointRegionConfig)(lower, authType);
        if (subscriptionRegionConfig) {
            return this.resolveSubscriptionEndpointRegion(subscriptionRegionConfig, requestedRegion, existing);
        }
        if ((0, bedrock_region_1.isBedrockProvider)(lower) && authType === 'api_key') {
            if (requestedRegion !== undefined) {
                if (!(0, bedrock_region_1.isBedrockRegion)(requestedRegion)) {
                    throw new common_1.BadRequestException('AWS Bedrock region must be a valid AWS region code');
                }
                return requestedRegion;
            }
            const detectedRegion = (0, bedrock_region_1.detectBedrockRegionFromApiKey)(apiKey);
            if (detectedRegion)
                return detectedRegion;
            return (0, bedrock_region_1.isBedrockRegion)(existing?.region) ? existing.region : bedrock_region_1.DEFAULT_BEDROCK_REGION;
        }
        const isQwenProvider = lower === 'qwen' || lower === 'alibaba';
        if (!isQwenProvider || authType !== 'api_key')
            return null;
        if (requestedRegion === undefined) {
            if (apiKey) {
                return this.detectQwenRegionOrThrow(apiKey);
            }
            return (0, qwen_region_1.isQwenResolvedEndpoint)(existing?.region) ? existing.region : null;
        }
        if (!(0, qwen_region_1.isQwenRegion)(requestedRegion)) {
            throw new common_1.BadRequestException(qwen_region_1.QWEN_REGION_VALIDATION_MESSAGE);
        }
        const qwenEndpoint = (0, qwen_region_1.normalizeQwenCompatibleBaseUrl)(requestedRegion);
        if (qwenEndpoint)
            return qwenEndpoint;
        if (requestedRegion !== 'auto')
            return requestedRegion;
        const keyToProbe = await this.getQwenDetectionKey(apiKey, existing);
        if (!keyToProbe) {
            return (0, qwen_region_1.isQwenResolvedEndpoint)(existing?.region) ? existing.region : null;
        }
        return this.detectQwenRegionOrThrow(keyToProbe);
    }
    resolveSubscriptionEndpointRegion(config, requestedRegion, existing) {
        if (requestedRegion === undefined) {
            const existingRegion = existing?.region;
            return typeof existingRegion === 'string' && config.isRegion(existingRegion)
                ? existingRegion
                : null;
        }
        if (!config.isRegion(requestedRegion)) {
            throw new common_1.BadRequestException(config.validationMessage);
        }
        return requestedRegion;
    }
    async getQwenDetectionKey(apiKey, existing) {
        if (apiKey)
            return apiKey;
        if (!existing?.api_key_encrypted)
            return null;
        try {
            return (0, crypto_util_1.decryptWithAny)(existing.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
        }
        catch {
            this.logger.warn('Failed to decrypt API key while auto-detecting Alibaba region');
            return null;
        }
    }
    async detectQwenRegionOrThrow(apiKey) {
        const detected = await (0, qwen_region_1.detectQwenRegion)(apiKey);
        if (detected)
            return detected;
        throw new common_1.BadRequestException('Could not auto-detect Alibaba region from this API key. Verify the key and try again.');
    }
    async registerSubscriptionProvider(agentId, tenantId, provider, createdByUserId) {
        if (!(0, subscription_support_1.isSupportedSubscriptionProvider)(provider)) {
            this.logger.debug(`Ignoring unsupported subscription provider registration for ${provider}`);
            return { isNew: false };
        }
        const existing = await this.providerRepo.findOne({
            where: { tenant_id: tenantId, provider, auth_type: 'subscription' },
        });
        if (existing) {
            await this.afterProviderChange(agentId, tenantId, existing.id);
            return { isNew: false };
        }
        const hasApiKey = await this.providerRepo.findOne({
            where: { tenant_id: tenantId, provider, auth_type: 'api_key', is_active: true },
        });
        if (hasApiKey)
            return { isNew: false };
        const record = Object.assign(new tenant_provider_entity_1.TenantProvider(), {
            id: (0, crypto_1.randomUUID)(),
            tenant_id: tenantId,
            created_by_user_id: createdByUserId ?? null,
            provider,
            auth_type: 'subscription',
            label: DEFAULT_LABEL,
            priority: 0,
            api_key_encrypted: null,
            key_prefix: null,
            is_active: true,
            connected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
        await this.providerRepo.insert(record);
        await this.enableProviderForAllAgents(tenantId, record.id);
        return { isNew: true };
    }
    async afterProviderChange(agentId, tenantId, userProviderId, manager) {
        if (agentId === null) {
            await this.recalculateTiersForTenant(tenantId);
        }
        else {
            if (userProviderId)
                await this.enableProviderForAgent(agentId, userProviderId, manager);
            this.routingCache.invalidateAgent(agentId);
        }
        this.routingCache.invalidateTenant(tenantId);
    }
    async retagAuthType(agentId, tenantId, provider, nextAuthType) {
        const invalidated = await this.providerRepo.manager.transaction(async (manager) => {
            const txRepo = manager.getRepository(tenant_provider_entity_1.TenantProvider);
            const rows = await txRepo.find({ where: { tenant_id: tenantId, provider } });
            const targets = rows.filter((r) => r.auth_type !== nextAuthType && r.is_active);
            if (targets.length === 0)
                return false;
            for (const target of targets) {
                const collision = rows.find((r) => r.auth_type === nextAuthType && r.label.toLowerCase() === target.label.toLowerCase());
                if (collision) {
                    await txRepo.remove(collision);
                }
                target.auth_type = nextAuthType;
                target.updated_at = new Date().toISOString();
                await txRepo.save(target);
            }
            return true;
        });
        if (invalidated) {
            if (agentId !== null)
                this.routingCache.invalidateAgent(agentId);
            this.routingCache.invalidateTenant(tenantId);
        }
    }
    async removeProvider(agentId, tenantId, provider, authType, label, manager) {
        if (label) {
            return this.removeKeyByLabel(agentId, tenantId, provider, authType, label, manager);
        }
        const repo = this.tenantProviderRepo(manager);
        const where = {
            tenant_id: tenantId,
            provider,
            is_active: true,
        };
        if (authType)
            where.auth_type = authType;
        const activeRows = await repo.find({ where });
        let affectedRows = activeRows;
        if (activeRows.length === 0) {
            const fallbackWhere = { tenant_id: tenantId, provider };
            if (authType)
                fallbackWhere.auth_type = authType;
            const any = await repo.findOne({ where: fallbackWhere });
            if (!any)
                throw new common_1.NotFoundException('Provider not found');
            affectedRows = [any];
        }
        else {
            await this.assertProviderRoutesNotUsed(tenantId, activeRows);
            const now = new Date().toISOString();
            for (const row of activeRows) {
                row.is_active = false;
                row.updated_at = now;
            }
            await repo.save(activeRows);
        }
        await this.deleteProviderAccess(affectedRows.map((row) => row.id), manager);
        const targetAgentIds = await this.listOwnedAgentIds(tenantId);
        for (const target of targetAgentIds) {
            this.routingCache.invalidateAgent(target);
        }
        if (agentId !== null)
            this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
        return { notifications: [] };
    }
    async listOwnedAgentIds(tenantId) {
        return (await this.listOwnedAgentRouteTargets(tenantId)).map((agent) => agent.id);
    }
    async listOwnedAgentRouteTargets(tenantId) {
        const agents = await this.agentRepo
            .createQueryBuilder('a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.deleted_at IS NULL')
            .select(['a.id AS id', 'a.name AS name', 'a.display_name AS display_name'])
            .getRawMany();
        return agents.map((agent) => {
            const displayName = agent.display_name?.trim();
            const name = agent.name?.trim();
            return {
                id: agent.id,
                name: displayName || name || agent.id,
            };
        });
    }
    async assertProviderRoutesNotUsed(tenantId, providerRows) {
        if (providerRows.length === 0)
            return;
        const first = await this.findFirstProviderRouteReference(tenantId, providerRows);
        if (!first)
            return;
        throw new common_1.ConflictException(`Cannot disconnect provider while its models are assigned to routing. ` +
            `Update routing first (agent "${first.agentName}", ${first.surface} ${first.name}, ` +
            `${first.position}: ${first.model}).`);
    }
    async findFirstProviderRouteReference(tenantId, providerRows) {
        const agents = await this.listOwnedAgentRouteTargets(tenantId);
        if (agents.length === 0)
            return null;
        const agentIds = agents.map((agent) => agent.id);
        const agentNamesById = new Map(agents.map((agent) => [agent.id, agent.name]));
        const enabledIdsByAgent = await this.listEnabledProviderIdsByAgent(agentIds);
        const providerRowsForAgent = (agentId) => {
            if (!enabledIdsByAgent)
                return providerRows;
            const enabled = enabledIdsByAgent.get(agentId);
            if (!enabled || enabled.size === 0)
                return [];
            return providerRows.filter((row) => enabled.has(row.id));
        };
        const agentName = (agentId) => agentNamesById.get(agentId) ?? agentId;
        const tiers = await this.tierRepo.find({ where: { agent_id: (0, typeorm_2.In)(agentIds) } });
        for (const tier of tiers) {
            const match = this.findProviderRouteReferenceInRoutes(tier.agent_id, agentName(tier.agent_id), 'tier', tier.tier, tier.override_route, tier.fallback_routes, providerRowsForAgent(tier.agent_id));
            if (match)
                return match;
        }
        const specificityRows = await this.specificityRepo.find({
            where: { agent_id: (0, typeorm_2.In)(agentIds), is_active: true },
        });
        for (const row of specificityRows) {
            if (row.is_active === false)
                continue;
            const match = this.findProviderRouteReferenceInRoutes(row.agent_id, agentName(row.agent_id), 'specificity', row.category, row.override_route, row.fallback_routes, providerRowsForAgent(row.agent_id));
            if (match)
                return match;
        }
        const headerTiers = await this.headerTierRepo.find({
            where: { agent_id: (0, typeorm_2.In)(agentIds), enabled: true },
        });
        for (const tier of headerTiers) {
            if (tier.enabled === false)
                continue;
            const match = this.findProviderRouteReferenceInRoutes(tier.agent_id, agentName(tier.agent_id), 'header', tier.name, tier.override_route, tier.fallback_routes, providerRowsForAgent(tier.agent_id));
            if (match)
                return match;
        }
        return null;
    }
    async listEnabledProviderIdsByAgent(agentIds) {
        if (!this.enabledProviderRepo)
            return null;
        const rows = await this.enabledProviderRepo.find({ where: { agent_id: (0, typeorm_2.In)(agentIds) } });
        const byAgent = new Map();
        for (const row of rows) {
            const enabled = byAgent.get(row.agent_id) ?? new Set();
            enabled.add(row.tenant_provider_id);
            byAgent.set(row.agent_id, enabled);
        }
        return byAgent;
    }
    findProviderRouteReferenceInRoutes(agentId, agentName, surface, name, overrideRoute, fallbackRoutes, providerRows) {
        if (providerRows.length === 0)
            return null;
        if (this.routeBelongsToProviderRows(overrideRoute, providerRows)) {
            return {
                agentId,
                agentName,
                surface,
                name,
                model: overrideRoute.model,
                position: 'primary',
            };
        }
        for (const [i, fallback] of (fallbackRoutes ?? []).entries()) {
            if (!this.routeBelongsToProviderRows(fallback, providerRows))
                continue;
            return {
                agentId,
                agentName,
                surface,
                name,
                model: fallback.model,
                position: `fallback ${i + 1}`,
            };
        }
        return null;
    }
    routeBelongsToProviderRows(route, rows) {
        if (!route)
            return false;
        return rows.some((row) => this.routeBelongsToProviderRow(route, row));
    }
    routeBelongsToProviderRow(route, row) {
        const providerName = row.provider.toLowerCase();
        const rowLabel = (row.label ?? DEFAULT_LABEL).toLowerCase();
        const routeProvider = route.provider?.toLowerCase();
        if (routeProvider) {
            if (routeProvider !== providerName)
                return false;
            if (route.authType && route.authType !== row.auth_type)
                return false;
            const routeLabel = route.keyLabel?.toLowerCase();
            if (routeLabel)
                return routeLabel === rowLabel;
            return row.priority === 0;
        }
        if (route.authType && route.authType !== row.auth_type)
            return false;
        const routeLabel = route.keyLabel?.toLowerCase();
        if (routeLabel)
            return routeLabel === rowLabel;
        if (row.priority !== 0)
            return false;
        const model = route.model.toLowerCase();
        if (model.startsWith(`${providerName}/`))
            return true;
        if (Array.isArray(row.cached_models) &&
            row.cached_models.some((cached) => cached.id.toLowerCase() === model)) {
            return true;
        }
        const pricing = this.pricingCache.getByModel(route.model)?.provider.toLowerCase();
        return pricing === providerName;
    }
    async removeKeyByLabel(agentId, tenantId, provider, authType, label, manager) {
        const repo = this.tenantProviderRepo(manager);
        const where = { tenant_id: tenantId, provider };
        if (authType)
            where.auth_type = authType;
        const matching = await repo.find({ where });
        if (matching.length === 0)
            throw new common_1.NotFoundException('Provider not found');
        const target = matching.find((r) => r.label.toLowerCase() === label.toLowerCase());
        if (!target)
            throw new common_1.NotFoundException('Provider key not found');
        if (!target.is_active) {
            await this.relabelOverrides(tenantId, provider, target.auth_type, target.label, null);
            await this.agentMessageRepo(manager).delete({
                tenant_id: tenantId,
                tenant_provider_id: target.id,
            });
            await repo.remove(target);
            await this.deleteProviderAccess([target.id], manager);
            await this.renumberPriorities(tenantId, provider, target.auth_type, manager);
            if (agentId !== null)
                this.routingCache.invalidateAgent(agentId);
            this.routingCache.invalidateTenant(tenantId);
            return { notifications: [] };
        }
        const stillHasOtherKeys = matching.some((r) => r.id !== target.id && r.is_active && (0, subscription_support_1.isManifestUsableProvider)(r));
        if (!stillHasOtherKeys) {
            return this.removeProvider(agentId, tenantId, provider, target.auth_type, undefined, manager);
        }
        await this.assertProviderRoutesNotUsed(tenantId, [target]);
        await repo.remove(target);
        await this.deleteProviderAccess([target.id], manager);
        await this.renumberPriorities(tenantId, provider, target.auth_type, manager);
        if (agentId !== null)
            this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
        return { notifications: [] };
    }
    async deactivateAllProviders(agentId, tenantId) {
        const activeProviders = await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        });
        await this.assertProviderRoutesNotUsed(tenantId, activeProviders);
        await this.providerRepo.update({ tenant_id: tenantId }, { is_active: false, updated_at: new Date().toISOString() });
        await this.deleteProviderAccess(activeProviders.map((provider) => provider.id));
        for (const ownedAgentId of await this.listOwnedAgentIds(tenantId)) {
            this.routingCache.invalidateAgent(ownedAgentId);
        }
        this.routingCache.invalidateAgent(agentId);
        this.routingCache.invalidateTenant(tenantId);
    }
    async cleanupUnsupportedSubscriptionProviders(tenantId) {
        const activeProviders = await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        });
        const unsupported = activeProviders.filter((record) => record.auth_type === 'subscription' && !(0, subscription_support_1.isManifestUsableProvider)(record));
        if (unsupported.length === 0)
            return;
        const now = new Date().toISOString();
        for (const record of unsupported) {
            record.is_active = false;
            record.updated_at = now;
        }
        await this.providerRepo.save(unsupported);
        const unsupportedIds = new Set(unsupported.map((record) => record.id));
        const remainingActive = activeProviders.filter((record) => !unsupportedIds.has(record.id));
        const usableProviders = remainingActive.filter(subscription_support_1.isManifestUsableProvider);
        const removedProviders = Array.from(new Set(unsupported
            .map((record) => record.provider)
            .filter((provider) => !usableProviders.some((record) => record.provider.toLowerCase() === provider.toLowerCase()))));
        if (removedProviders.length > 0) {
            this.logger.debug(`Deactivated unsupported subscription providers for tenant=${tenantId}: ${removedProviders.join(', ')}`);
        }
        this.routingCache.invalidateTenant(tenantId);
    }
    async relabelOverrides(tenantId, provider, authType, previousLabel, nextLabel) {
        const providerLower = provider.toLowerCase();
        const previousLower = previousLabel.toLowerCase();
        const routeMatchesKey = (route) => {
            if (!route)
                return false;
            if (!route.keyLabel)
                return false;
            if (route.keyLabel.toLowerCase() !== previousLower)
                return false;
            if (route.provider.toLowerCase() !== providerLower)
                return false;
            if (route.authType !== authType)
                return false;
            return true;
        };
        const replaceKeyLabel = (route) => ({
            ...route,
            keyLabel: nextLabel ?? null,
        });
        const mutatedAgentIds = new Set();
        const ownedAgentIds = await this.listOwnedAgentIds(tenantId);
        if (ownedAgentIds.length === 0)
            return;
        const tiers = await this.tierRepo.find({ where: { agent_id: (0, typeorm_2.In)(ownedAgentIds) } });
        const tiersToSave = [];
        const now = new Date().toISOString();
        for (const t of tiers) {
            let mutated = false;
            if (routeMatchesKey(t.override_route)) {
                t.override_route = replaceKeyLabel(t.override_route);
                mutated = true;
            }
            if (t.fallback_routes && t.fallback_routes.some(routeMatchesKey)) {
                t.fallback_routes = t.fallback_routes.map((r) => routeMatchesKey(r) ? replaceKeyLabel(r) : r);
                mutated = true;
            }
            if (mutated) {
                t.updated_at = now;
                tiersToSave.push(t);
                mutatedAgentIds.add(t.agent_id);
            }
        }
        if (tiersToSave.length > 0)
            await this.tierRepo.save(tiersToSave);
        const specs = await this.specificityRepo.find({ where: { agent_id: (0, typeorm_2.In)(ownedAgentIds) } });
        const specsToSave = [];
        for (const s of specs) {
            let mutated = false;
            if (routeMatchesKey(s.override_route)) {
                s.override_route = replaceKeyLabel(s.override_route);
                mutated = true;
            }
            if (s.fallback_routes && s.fallback_routes.some(routeMatchesKey)) {
                s.fallback_routes = s.fallback_routes.map((r) => routeMatchesKey(r) ? replaceKeyLabel(r) : r);
                mutated = true;
            }
            if (mutated) {
                s.updated_at = now;
                specsToSave.push(s);
                mutatedAgentIds.add(s.agent_id);
            }
        }
        if (specsToSave.length > 0)
            await this.specificityRepo.save(specsToSave);
        const headerTiers = await this.headerTierRepo.find({ where: { tenant_id: tenantId } });
        const headerTiersToSave = [];
        for (const h of headerTiers) {
            let mutated = false;
            if (routeMatchesKey(h.override_route)) {
                h.override_route = replaceKeyLabel(h.override_route);
                mutated = true;
            }
            if (h.fallback_routes && h.fallback_routes.some(routeMatchesKey)) {
                h.fallback_routes = h.fallback_routes.map((r) => routeMatchesKey(r) ? replaceKeyLabel(r) : r);
                mutated = true;
            }
            if (mutated) {
                h.updated_at = now;
                headerTiersToSave.push(h);
                mutatedAgentIds.add(h.agent_id);
            }
        }
        if (headerTiersToSave.length > 0)
            await this.headerTierRepo.save(headerTiersToSave);
        for (const id of mutatedAgentIds)
            this.routingCache.invalidateAgent(id);
    }
    async renumberPriorities(tenantId, provider, authType, manager) {
        const repo = this.tenantProviderRepo(manager);
        const allRows = await repo.find({
            where: { tenant_id: tenantId, provider, auth_type: authType },
            order: { priority: 'ASC' },
        });
        const rows = allRows.filter((r) => r.is_active);
        const now = new Date().toISOString();
        let changed = false;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].priority !== i) {
                rows[i].priority = i;
                rows[i].updated_at = now;
                changed = true;
            }
        }
        if (changed)
            await repo.save(rows);
    }
    normalizeLabel(label, authType) {
        if (label === undefined)
            return undefined;
        const trimmed = label.trim();
        if (trimmed.length === 0) {
            throw new common_1.BadRequestException('Key name must not be empty');
        }
        if (authType === 'local' && trimmed.toLowerCase() !== DEFAULT_LABEL.toLowerCase()) {
            throw new common_1.BadRequestException(`Custom key names are not supported for local providers (got auth_type=${authType})`);
        }
        this.assertLabelLooksValid(trimmed);
        return trimmed;
    }
    assertLabelLooksValid(label) {
        if (label.length === 0) {
            throw new common_1.BadRequestException('Key name must not be empty');
        }
        if (label.length > MAX_LABEL_LENGTH) {
            throw new common_1.BadRequestException(`Key name must be at most ${MAX_LABEL_LENGTH} characters`);
        }
    }
    decryptOrNull(encrypted) {
        try {
            return (0, crypto_util_1.decryptWithAny)(encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
        }
        catch {
            return null;
        }
    }
    nextPriority(existing) {
        const active = existing.filter((r) => r.is_active);
        if (active.length === 0)
            return 0;
        return Math.max(...active.map((r) => r.priority)) + 1;
    }
    async nextOAuthLabel(tenantId, provider) {
        const existing = await this.providerRepo.find({
            where: {
                tenant_id: tenantId,
                provider,
                auth_type: 'subscription',
                is_active: true,
            },
        });
        if (existing.length === 0)
            return undefined;
        const lower = new Set(existing.map((r) => r.label.toLowerCase()));
        for (let n = existing.length + 1; n < 100; n++) {
            const candidate = `Key ${n}`;
            if (!lower.has(candidate.toLowerCase()))
                return candidate;
        }
        return `Key ${existing.length + 1}`;
    }
};
exports.ProviderService = ProviderService;
exports.ProviderService = ProviderService = ProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(1, (0, typeorm_1.InjectRepository)(tier_assignment_entity_1.TierAssignment)),
    __param(2, (0, typeorm_1.InjectRepository)(specificity_assignment_entity_1.SpecificityAssignment)),
    __param(3, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(4, (0, typeorm_1.InjectRepository)(header_tier_entity_1.HeaderTier)),
    __param(7, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        model_pricing_cache_service_1.ModelPricingCacheService,
        routing_cache_service_1.RoutingCacheService, Object])
], ProviderService);
//# sourceMappingURL=provider.service.js.map