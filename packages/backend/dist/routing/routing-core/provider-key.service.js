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
var ProviderKeyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderKeyService = exports.SYNTHETIC_OLLAMA_PROVIDER_ID = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const agent_enabled_provider_entity_1 = require("../../entities/agent-enabled-provider.entity");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const routing_cache_service_1 = require("./routing-cache.service");
const provider_service_1 = require("./provider.service");
const crypto_util_1 = require("../../common/utils/crypto.util");
const provider_aliases_1 = require("../../common/utils/provider-aliases");
const subscription_support_1 = require("../../common/utils/subscription-support");
exports.SYNTHETIC_OLLAMA_PROVIDER_ID = 'ollama';
const MAX_LOGGED_LABEL_LENGTH = 64;
const STALE_PIN_WARN_WINDOW_MS = 60_000;
const MAX_STALE_PIN_WARNING_KEYS = 256;
function forLog(label) {
    const cleaned = [...label]
        .map((c) => {
        const code = c.codePointAt(0) ?? 0;
        return code < 0x20 || code === 0x7f ? ' ' : c;
    })
        .join('');
    return cleaned.length > MAX_LOGGED_LABEL_LENGTH
        ? `${cleaned.slice(0, MAX_LOGGED_LABEL_LENGTH)}…`
        : cleaned;
}
let ProviderKeyService = ProviderKeyService_1 = class ProviderKeyService {
    providerRepo;
    pricingCache;
    discoveryService;
    routingCache;
    providerService;
    enabledProviderRepo;
    logger = new common_1.Logger(ProviderKeyService_1.name);
    stalePinWarnings = new Map();
    constructor(providerRepo, pricingCache, discoveryService, routingCache, providerService, enabledProviderRepo = null) {
        this.providerRepo = providerRepo;
        this.pricingCache = pricingCache;
        this.discoveryService = discoveryService;
        this.routingCache = routingCache;
        this.providerService = providerService;
        this.enabledProviderRepo = enabledProviderRepo;
    }
    async getProviderKeys(tenantId, provider, authType, agentId) {
        if (provider.toLowerCase() === 'ollama') {
            return [
                {
                    id: exports.SYNTHETIC_OLLAMA_PROVIDER_ID,
                    label: 'Default',
                    priority: 0,
                    apiKey: '',
                    region: null,
                },
            ];
        }
        const cached = this.routingCache.getProviderKeys(tenantId, provider, authType, agentId);
        if (cached !== undefined)
            return cached;
        const result = await this.resolveProviderKeys(tenantId, provider, authType, agentId);
        this.routingCache.setProviderKeys(tenantId, provider, result, authType, agentId);
        return result;
    }
    async getDefaultKeyLabel(tenantId, provider, authType, agentId) {
        const keys = await this.getProviderKeys(tenantId, provider, authType, agentId);
        return keys[0]?.label;
    }
    async selectProviderKey(tenantId, provider, authType, label, agentId) {
        const keys = await this.getProviderKeys(tenantId, provider, authType, agentId);
        if (keys.length === 0)
            return null;
        if (label) {
            const match = keys.find((k) => k.label.toLowerCase() === label.toLowerCase());
            if (match)
                return match;
            const warningKey = [tenantId, agentId ?? '', provider.toLowerCase(), authType ?? '', label]
                .join('\0')
                .toLowerCase();
            const now = Date.now();
            const warnedAt = this.stalePinWarnings.get(warningKey);
            if (warnedAt === undefined || now - warnedAt >= STALE_PIN_WARN_WINDOW_MS) {
                this.stalePinWarnings.delete(warningKey);
                this.stalePinWarnings.set(warningKey, now);
                if (this.stalePinWarnings.size > MAX_STALE_PIN_WARNING_KEYS) {
                    const oldest = this.stalePinWarnings.keys().next().value;
                    if (oldest !== undefined)
                        this.stalePinWarnings.delete(oldest);
                }
                this.logger.warn(`Key label "${forLog(label)}" matches no ${provider} connection for tenant=${tenantId} ` +
                    `authType=${authType ?? 'any'} — falling back to "${forLog(keys[0].label)}"`);
            }
        }
        return keys[0];
    }
    async hasRouteCredentials(tenantId, route, agentId) {
        if (!route.provider)
            return false;
        const keys = await this.getProviderKeys(tenantId, route.provider, route.authType, agentId);
        return keys.length > 0;
    }
    async getProviderApiKey(tenantId, provider, authType, label, agentId) {
        const key = await this.selectProviderKey(tenantId, provider, authType, label, agentId);
        return key ? key.apiKey : null;
    }
    async getProviderKeyId(tenantId, provider, authType, label, agentId) {
        const key = await this.selectProviderKey(tenantId, provider, authType, label, agentId);
        if (!key || key.id === exports.SYNTHETIC_OLLAMA_PROVIDER_ID)
            return null;
        return key.id;
    }
    async getAuthType(tenantId, provider, excludeAuthTypes, agentId) {
        const names = (0, provider_aliases_1.expandProviderNames)([provider]);
        const records = await this.filterProvidersForAgent(await this.providerService.getProviders(tenantId), agentId);
        let matches = records.filter((r) => r.is_active && names.has(r.provider.toLowerCase()));
        if (excludeAuthTypes && excludeAuthTypes.size > 0) {
            const filtered = matches.filter((r) => !excludeAuthTypes.has(r.auth_type));
            if (filtered.length > 0)
                matches = filtered;
        }
        const localMatch = matches.find((r) => r.auth_type === 'local');
        if (localMatch)
            return 'local';
        const subMatch = matches.find((r) => r.auth_type === 'subscription' && r.api_key_encrypted);
        if (subMatch)
            return 'subscription';
        const withKey = matches.find((r) => r.api_key_encrypted);
        return withKey?.auth_type ?? matches[0]?.auth_type ?? 'api_key';
    }
    async hasActiveProvider(tenantId, provider, agentId) {
        const names = (0, provider_aliases_1.expandProviderNames)([provider]);
        const records = await this.filterProvidersForAgent(await this.providerService.getProviders(tenantId), agentId);
        return records.some((r) => r.is_active && names.has(r.provider.toLowerCase()));
    }
    async getProviderRegion(tenantId, provider, authType, label, agentId) {
        const key = await this.selectProviderKey(tenantId, provider, authType, label, agentId);
        return key ? key.region : null;
    }
    async findProviderForModel(tenantId, model, agentId) {
        const providers = await this.filterProvidersForAgent(await this.providerService.getProviders(tenantId), agentId);
        for (const p of providers) {
            if (!p.cached_models)
                continue;
            if (p.cached_models.some((m) => m.id === model))
                return p.provider;
        }
        return undefined;
    }
    async resolveProviderKeys(tenantId, provider, preferredAuthType, agentId) {
        if (provider.startsWith('custom:')) {
            const records = await this.providerRepo.find({
                where: { tenant_id: tenantId, provider, is_active: true },
                order: { priority: 'ASC', id: 'ASC' },
            });
            return (await this.filterProvidersForAgent(records, agentId)).flatMap((record) => this.decryptOne(record));
        }
        const names = (0, provider_aliases_1.expandProviderNames)([provider]);
        const records = await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
            order: { priority: 'ASC', id: 'ASC' },
        });
        const scopedRecords = await this.filterProvidersForAgent(records, agentId);
        const matches = scopedRecords.filter((r) => (0, subscription_support_1.isManifestUsableProvider)(r) && names.has(r.provider.toLowerCase()));
        if (matches.length === 0)
            return [];
        const candidates = preferredAuthType
            ? matches.filter((m) => m.auth_type === preferredAuthType)
            : [...matches].sort((a, b) => {
                const aPref = a.auth_type === 'api_key' ? 0 : 1;
                const bPref = b.auth_type === 'api_key' ? 0 : 1;
                if (aPref !== bPref)
                    return aPref - bPref;
                return a.priority - b.priority;
            });
        return candidates.flatMap((record) => this.decryptOne(record));
    }
    decryptOne(record) {
        if (!record.api_key_encrypted) {
            if (record.auth_type === 'local') {
                return [
                    {
                        id: record.id,
                        label: record.label,
                        priority: record.priority,
                        apiKey: '',
                        region: record.region,
                    },
                ];
            }
            if (record.provider.startsWith('custom:')) {
                return [
                    {
                        id: record.id,
                        label: record.label,
                        priority: record.priority,
                        apiKey: '',
                        region: record.region,
                    },
                ];
            }
            return [];
        }
        try {
            return [
                {
                    id: record.id,
                    label: record.label,
                    priority: record.priority,
                    apiKey: (0, crypto_util_1.decryptWithAny)(record.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext,
                    region: record.region,
                },
            ];
        }
        catch {
            const credentialLabel = record.auth_type === 'subscription' ? 'token' : 'API key';
            this.logger.warn(`Failed to decrypt ${credentialLabel} for provider ${record.provider}`);
            return [];
        }
    }
    async isModelAvailable(tenantId, model, agentId) {
        const discovered = await this.discoveryService.getModelForAgent(tenantId, model, agentId);
        if (discovered)
            return true;
        const pricing = this.pricingCache.getByModel(model);
        const inferredPrefix = (0, provider_aliases_1.inferProviderFromModelName)(model);
        const pricingNames = pricing ? (0, provider_aliases_1.expandProviderNames)([pricing.provider]) : null;
        const inferredNames = inferredPrefix ? (0, provider_aliases_1.expandProviderNames)([inferredPrefix]) : null;
        if (pricingNames?.has('qwen') || inferredNames?.has('qwen')) {
            return false;
        }
        const records = (await this.filterProvidersForAgent(await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        }), agentId)).filter(subscription_support_1.isManifestUsableProvider);
        if (pricing) {
            const names = (0, provider_aliases_1.expandProviderNames)([pricing.provider]);
            if (records.find((r) => names.has(r.provider.toLowerCase())))
                return true;
            const canonicalPrefix = (0, provider_aliases_1.inferProviderFromModelName)(pricing.model_name);
            if (canonicalPrefix) {
                const cpNames = (0, provider_aliases_1.expandProviderNames)([canonicalPrefix]);
                if (records.find((r) => cpNames.has(r.provider.toLowerCase())))
                    return true;
            }
        }
        if (inferredPrefix) {
            const prefixNames = (0, provider_aliases_1.expandProviderNames)([inferredPrefix]);
            if (records.find((r) => prefixNames.has(r.provider.toLowerCase())))
                return true;
        }
        return false;
    }
    async isRouteAvailable(tenantId, route, agentId) {
        if (!route.provider) {
            return this.isModelAvailable(tenantId, route.model, agentId);
        }
        const providerNames = (0, provider_aliases_1.expandProviderNames)([route.provider]);
        const discovered = await this.discoveryService.getModelsForAgent(tenantId, agentId);
        const connectionModels = discovered.filter((m) => providerNames.has(m.provider.toLowerCase()) &&
            (!route.authType || !m.authType || m.authType === route.authType));
        if (connectionModels.some((m) => m.id === route.model))
            return true;
        if (connectionModels.length > 0)
            return false;
        if (providerNames.has('qwen') || providerNames.has('alibaba'))
            return false;
        const records = (await this.filterProvidersForAgent(await this.providerRepo.find({
            where: { tenant_id: tenantId, is_active: true },
        }), agentId)).filter(subscription_support_1.isManifestUsableProvider);
        return records.some((r) => providerNames.has(r.provider.toLowerCase()) &&
            (!route.authType || r.auth_type === route.authType));
    }
    async filterProvidersForAgent(providers, agentId) {
        if (!agentId || !this.enabledProviderRepo)
            return providers;
        const rows = await this.enabledProviderRepo.find({ where: { agent_id: agentId } });
        if (rows.length === 0)
            return [];
        const enabledIds = new Set(rows.map((r) => r.tenant_provider_id));
        return providers.filter((p) => enabledIds.has(p.id));
    }
};
exports.ProviderKeyService = ProviderKeyService;
exports.ProviderKeyService = ProviderKeyService = ProviderKeyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, typeorm_1.InjectRepository)(agent_enabled_provider_entity_1.AgentEnabledProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        model_pricing_cache_service_1.ModelPricingCacheService,
        model_discovery_service_1.ModelDiscoveryService,
        routing_cache_service_1.RoutingCacheService,
        provider_service_1.ProviderService, Object])
], ProviderKeyService);
//# sourceMappingURL=provider-key.service.js.map