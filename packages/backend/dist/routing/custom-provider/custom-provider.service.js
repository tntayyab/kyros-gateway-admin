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
var CustomProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomProviderService = void 0;
exports.isEmbeddingModel = isEmbeddingModel;
exports.primaryCustomConnection = primaryCustomConnection;
exports.isLocalCustomProviderName = isLocalCustomProviderName;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const manifest_shared_1 = require("manifest-shared");
const custom_provider_entity_1 = require("../../entities/custom-provider.entity");
const provider_service_1 = require("../routing-core/provider.service");
const routing_cache_service_1 = require("../routing-core/routing-cache.service");
const url_validation_1 = require("../../common/utils/url-validation");
const detect_self_hosted_1 = require("../../common/utils/detect-self-hosted");
const crypto_util_1 = require("../../common/utils/crypto.util");
const model_pricing_cache_service_1 = require("../../model-prices/model-pricing-cache.service");
const models_dev_sync_service_1 = require("../../database/models-dev-sync.service");
const ingest_event_bus_service_1 = require("../../common/services/ingest-event-bus.service");
const probe_error_1 = require("./probe-error");
const PROBE_TIMEOUT_MS = 5000;
const EMBEDDING_MODEL_PATTERN = /(?:^|[\/_\-])embed(?:ding|dings|ed)?(?:[\/_\-]|$)|text[_\-]embedding|embedder|reranker|moderation/i;
function isEmbeddingModel(id) {
    return EMBEDDING_MODEL_PATTERN.test(id);
}
function primaryCustomConnection(rows, providerKey) {
    return rows
        .filter((r) => r.provider === providerKey)
        .sort((a, b) => Number(b.is_active) - Number(a.is_active) ||
        a.priority - b.priority ||
        a.id.localeCompare(b.id))[0];
}
function isLocalCustomProviderName(name) {
    const normalized = (0, manifest_shared_1.normalizeProviderName)(name);
    const shared = manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get(normalized) ??
        manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get(name) ??
        manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get(name.toLowerCase());
    return !!shared && manifest_shared_1.CANONICAL_LOCAL_IDS.has(shared.id);
}
function trimBaseUrl(baseUrl) {
    const s = baseUrl.trim();
    let end = s.length;
    while (end > 0 && s.charCodeAt(end - 1) === 47)
        end--;
    return s.slice(0, end);
}
function authTypeForCustomProvider(name) {
    return isLocalCustomProviderName(name) ? 'local' : 'api_key';
}
const ALIAS_UNIQUE_INDEX = 'IDX_custom_providers_tenant_alias';
const PG_UNIQUE_VIOLATION = '23505';
function isAliasUniqueViolation(err) {
    const pg = err;
    return pg?.code === PG_UNIQUE_VIOLATION && pg.constraint === ALIAS_UNIQUE_INDEX;
}
let CustomProviderService = CustomProviderService_1 = class CustomProviderService {
    repo;
    providerService;
    routingCache;
    pricingCache;
    eventBus;
    modelsDevSync;
    logger = new common_1.Logger(CustomProviderService_1.name);
    constructor(repo, providerService, routingCache, pricingCache, eventBus, modelsDevSync = null) {
        this.repo = repo;
        this.providerService = providerService;
        this.routingCache = routingCache;
        this.pricingCache = pricingCache;
        this.eventBus = eventBus;
        this.modelsDevSync = modelsDevSync;
    }
    notifyChange(tenantId, actorUserId) {
        this.eventBus.emit(tenantId, 'routing', actorUserId);
    }
    assertAliasAvailable(alias, allForTenant, excludeId) {
        if ((0, manifest_shared_1.isReservedCustomProviderAlias)(alias)) {
            throw new common_1.BadRequestException(`Alias "${alias}" is reserved for a built-in provider`);
        }
        const dup = allForTenant.find((r) => r.id !== excludeId && r.alias?.toLowerCase() === alias);
        if (dup) {
            throw new common_1.ConflictException(`Alias "${alias}" is already used by "${dup.name}"`);
        }
    }
    defaultAlias(name, allForTenant) {
        const derived = (0, manifest_shared_1.deriveCustomProviderAlias)(name);
        if (!derived)
            return null;
        return allForTenant.some((r) => r.alias?.toLowerCase() === derived) ? null : derived;
    }
    static providerKey(id) {
        return `custom:${id}`;
    }
    async primaryConnection(tenantId, id) {
        return primaryCustomConnection(await this.providerService.getProviders(tenantId), CustomProviderService_1.providerKey(id));
    }
    static modelKey(id, modelName) {
        return `custom:${id}/${modelName}`;
    }
    static rawModelName(prefixedName) {
        const slash = prefixedName.indexOf('/');
        return slash !== -1 ? prefixedName.substring(slash + 1) : prefixedName;
    }
    static isCustom(provider) {
        return provider.startsWith('custom:');
    }
    static extractId(providerKey) {
        return providerKey.replace('custom:', '');
    }
    static canonicalTileIdForName(name) {
        const entry = manifest_shared_1.SHARED_PROVIDER_BY_ID_OR_ALIAS.get((0, manifest_shared_1.normalizeProviderName)(name));
        return entry?.tileOnly ? entry.id : null;
    }
    async canonicalizeAgentMessageKeys(tenantId, provider, model) {
        const providerIsCustom = !!provider && CustomProviderService_1.isCustom(provider);
        const modelMatch = model?.match(/^custom:([^/]+)\//);
        if (!providerIsCustom && !modelMatch) {
            return { provider: provider ?? null, model: model ?? null };
        }
        const cpId = providerIsCustom
            ? CustomProviderService_1.extractId(provider)
            : (modelMatch?.[1] ?? null);
        if (!cpId)
            return { provider: provider ?? null, model: model ?? null };
        const rows = await this.list(tenantId);
        const row = rows.find((r) => r.id === cpId);
        if (!row)
            return { provider: provider ?? null, model: model ?? null };
        const canonical = CustomProviderService_1.canonicalTileIdForName(row.name);
        if (!canonical)
            return { provider: provider ?? null, model: model ?? null };
        const rewrittenProvider = providerIsCustom ? canonical : (provider ?? null);
        const rewrittenModel = model && model.startsWith(`custom:${cpId}/`)
            ? `${canonical}/${CustomProviderService_1.rawModelName(model)}`
            : (model ?? null);
        return { provider: rewrittenProvider, model: rewrittenModel };
    }
    async list(tenantId) {
        const cached = this.routingCache.getCustomProviders(tenantId);
        if (cached)
            return cached;
        const result = await this.repo.find({ where: { tenant_id: tenantId } });
        this.routingCache.setCustomProviders(tenantId, result);
        return result;
    }
    async create(tenantId, dto, createdByUserId) {
        const allForTenant = await this.repo.find({ where: { tenant_id: tenantId } });
        const existing = allForTenant.find((r) => r.name.toLowerCase() === dto.name.toLowerCase());
        if (existing) {
            throw new common_1.ConflictException(`Custom provider "${dto.name}" already exists`);
        }
        const alias = dto.alias === undefined
            ? this.defaultAlias(dto.name, allForTenant)
            : (0, manifest_shared_1.normalizeCustomProviderAlias)(dto.alias);
        if (alias && dto.alias !== undefined)
            this.assertAliasAvailable(alias, allForTenant);
        try {
            await (0, url_validation_1.validatePublicUrl)(dto.base_url, { allowPrivate: (0, detect_self_hosted_1.isSelfHosted)() });
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
        const id = (0, crypto_1.randomUUID)();
        const provKey = CustomProviderService_1.providerKey(id);
        const cp = Object.assign(new custom_provider_entity_1.CustomProvider(), {
            id,
            tenant_id: tenantId,
            created_by_user_id: createdByUserId ?? null,
            name: dto.name,
            alias,
            base_url: dto.base_url,
            api_kind: dto.api_kind ?? 'openai',
            models: this.enrichCustomProviderModels(dto.name, dto.models),
            created_at: new Date().toISOString(),
        });
        try {
            await this.repo.manager.transaction(async (manager) => {
                await manager.getRepository(custom_provider_entity_1.CustomProvider).insert(cp);
                await this.providerService.upsertProvider(null, tenantId, provKey, dto.apiKey, authTypeForCustomProvider(dto.name), undefined, undefined, createdByUserId, manager);
            });
        }
        catch (err) {
            if (isAliasUniqueViolation(err)) {
                throw new common_1.ConflictException(`Alias "${alias}" is already used by another provider`);
            }
            throw err;
        }
        await this.pricingCache.reload();
        this.notifyChange(tenantId, createdByUserId);
        return cp;
    }
    async update(id, tenantId, dto, actorUserId) {
        const cp = await this.repo.findOne({ where: { id, tenant_id: tenantId } });
        if (!cp) {
            throw new common_1.NotFoundException('Custom provider not found');
        }
        const previousName = cp.name;
        if (dto.name !== undefined && dto.name !== cp.name) {
            const allForTenant = await this.repo.find({ where: { tenant_id: tenantId } });
            const dup = allForTenant.find((r) => r.id !== id && r.name.toLowerCase() === dto.name.toLowerCase());
            if (dup) {
                throw new common_1.ConflictException(`Custom provider "${dto.name}" already exists`);
            }
            cp.name = dto.name;
        }
        if (dto.alias !== undefined) {
            const alias = (0, manifest_shared_1.normalizeCustomProviderAlias)(dto.alias);
            if (alias && alias !== cp.alias) {
                const allForTenant = await this.repo.find({ where: { tenant_id: tenantId } });
                this.assertAliasAvailable(alias, allForTenant, id);
            }
            cp.alias = alias;
        }
        if (dto.base_url !== undefined) {
            try {
                await (0, url_validation_1.validatePublicUrl)(dto.base_url, { allowPrivate: (0, detect_self_hosted_1.isSelfHosted)() });
            }
            catch (err) {
                throw new common_1.BadRequestException(err.message);
            }
            cp.base_url = dto.base_url;
        }
        if (dto.api_kind !== undefined) {
            cp.api_kind = dto.api_kind;
        }
        if (dto.models !== undefined) {
            cp.models = this.enrichCustomProviderModels(cp.name, dto.models);
        }
        try {
            await this.repo.save(cp);
        }
        catch (err) {
            if (isAliasUniqueViolation(err)) {
                throw new common_1.ConflictException(`Alias "${cp.alias}" is already used by another provider`);
            }
            throw err;
        }
        this.routingCache.invalidateTenant(tenantId);
        if (dto.models !== undefined) {
            await this.pricingCache.reload();
        }
        const nextAuthType = authTypeForCustomProvider(cp.name);
        const nameCategoryChanged = previousName !== cp.name && authTypeForCustomProvider(previousName) !== nextAuthType;
        if (nameCategoryChanged) {
            await this.providerService.retagAuthType(null, tenantId, CustomProviderService_1.providerKey(id), nextAuthType);
        }
        if ('apiKey' in dto) {
            const primary = await this.primaryConnection(tenantId, id);
            await this.providerService.upsertProvider(null, tenantId, CustomProviderService_1.providerKey(id), dto.apiKey, nextAuthType, undefined, primary?.label, actorUserId);
        }
        this.notifyChange(tenantId, actorUserId);
        return cp;
    }
    async remove(tenantId, id, actorUserId) {
        const cp = await this.repo.findOne({ where: { id, tenant_id: tenantId } });
        if (!cp) {
            throw new common_1.NotFoundException('Custom provider not found');
        }
        const provKey = CustomProviderService_1.providerKey(id);
        await this.repo.manager.transaction(async (manager) => {
            try {
                await this.providerService.removeProvider(null, tenantId, provKey, undefined, undefined, manager);
            }
            catch (err) {
                if (!(err instanceof common_1.NotFoundException))
                    throw err;
            }
            await manager.getRepository(custom_provider_entity_1.CustomProvider).remove(cp);
        });
        this.routingCache.invalidateTenant(tenantId);
        await this.pricingCache.reload();
        this.notifyChange(tenantId, actorUserId);
    }
    async getById(id, tenantId) {
        return this.repo.findOne({ where: { id, tenant_id: tenantId } });
    }
    async probeModels(baseUrl, apiKey, apiKind = 'openai', providerName) {
        try {
            await (0, url_validation_1.validatePublicUrl)(baseUrl, { allowPrivate: (0, detect_self_hosted_1.isSelfHosted)() });
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message);
        }
        const trimmed = trimBaseUrl(baseUrl);
        const url = apiKind === 'anthropic' ? `${trimmed}/v1/models` : `${trimmed}/models`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (apiKind === 'anthropic') {
                headers['anthropic-version'] = '2023-06-01';
                if (apiKey)
                    headers['x-api-key'] = apiKey;
            }
            else if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            const res = await fetch(url, {
                headers,
                signal: controller.signal,
                redirect: 'error',
            });
            if (!res.ok) {
                throw new common_1.BadRequestException((0, probe_error_1.classifyProbeError)({ url, status: res.status }).message);
            }
            const contentType = res.headers.get('content-type') ?? '';
            if (!contentType.includes('application/json')) {
                throw new common_1.BadRequestException((0, probe_error_1.classifyProbeError)({ url, contentType }).message);
            }
            const body = (await res.json());
            const items = body?.data ?? [];
            const filtered = items.filter((m) => typeof m.id === 'string' && m.id.length > 0 && !isEmbeddingModel(m.id));
            return this.enrichCustomProviderModels(providerName, filtered.map((m) => ({ model_name: m.id })), { defaultContextWindow: false });
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            throw new common_1.BadRequestException((0, probe_error_1.classifyProbeError)({ url, error: err }).message);
        }
        finally {
            clearTimeout(timeout);
        }
    }
    async loadStoredApiKey(tenantId, providerId, baseUrl, apiKind = 'openai') {
        const cp = await this.getById(providerId, tenantId);
        if (!cp)
            return undefined;
        if (trimBaseUrl(cp.base_url) !== trimBaseUrl(baseUrl) || cp.api_kind !== apiKind) {
            return undefined;
        }
        const row = await this.primaryConnection(tenantId, providerId);
        if (!row?.api_key_encrypted)
            return undefined;
        try {
            return (0, crypto_util_1.decryptWithAny)(row.api_key_encrypted, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
        }
        catch (err) {
            this.logger.warn(`Could not decrypt the stored API key of custom provider ${providerId}; probing without it: ${err.message}`);
            return undefined;
        }
    }
    enrichCustomProviderModels(providerName, models, options = {}) {
        return models.map((model) => {
            const modelsDevMatch = providerName && this.modelsDevSync
                ? this.modelsDevSync.lookupCustomProviderModel(providerName, model.model_name)
                : null;
            const modelOnlyMatch = !modelsDevMatch && this.modelsDevSync
                ? (this.modelsDevSync.lookupModelAcrossProviders?.(model.model_name) ?? null)
                : null;
            const priceSource = modelsDevMatch ?? modelOnlyMatch;
            const inputWasFilled = model.input_price_per_million_tokens == null && priceSource?.inputPricePerToken != null;
            const outputWasFilled = model.output_price_per_million_tokens == null && priceSource?.outputPricePerToken != null;
            const inputPrice = model.input_price_per_million_tokens ??
                this.toPricePerMillion(priceSource?.inputPricePerToken);
            const outputPrice = model.output_price_per_million_tokens ??
                this.toPricePerMillion(priceSource?.outputPricePerToken);
            const contextWindow = model.context_window ??
                priceSource?.contextWindow ??
                (options.defaultContextWindow === false ? undefined : 128000);
            const priceEstimated = !modelsDevMatch &&
                (inputPrice !== undefined || outputPrice !== undefined) &&
                (model.price_estimated === true || inputWasFilled || outputWasFilled);
            const enriched = {
                model_name: model.model_name,
            };
            if (inputPrice !== undefined)
                enriched.input_price_per_million_tokens = inputPrice;
            if (outputPrice !== undefined)
                enriched.output_price_per_million_tokens = outputPrice;
            if (contextWindow !== undefined)
                enriched.context_window = contextWindow;
            if (priceEstimated)
                enriched.price_estimated = true;
            return enriched;
        });
    }
    toPricePerMillion(pricePerToken) {
        if (pricePerToken == null)
            return undefined;
        return Number((pricePerToken * 1_000_000).toFixed(12));
    }
};
exports.CustomProviderService = CustomProviderService;
exports.CustomProviderService = CustomProviderService = CustomProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(custom_provider_entity_1.CustomProvider)),
    __param(5, (0, common_1.Optional)()),
    __param(5, (0, common_1.Inject)(models_dev_sync_service_1.ModelsDevSyncService)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        provider_service_1.ProviderService,
        routing_cache_service_1.RoutingCacheService,
        model_pricing_cache_service_1.ModelPricingCacheService,
        ingest_event_bus_service_1.IngestEventBusService, Object])
], CustomProviderService);
//# sourceMappingURL=custom-provider.service.js.map