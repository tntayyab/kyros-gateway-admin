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
var ProviderModelRegistryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderModelRegistryService = exports.CACHE_LOAD_BATCH_SIZE = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
exports.CACHE_LOAD_BATCH_SIZE = 500;
let ProviderModelRegistryService = ProviderModelRegistryService_1 = class ProviderModelRegistryService {
    providerRepo;
    logger = new common_1.Logger(ProviderModelRegistryService_1.name);
    registry = new Map();
    cacheLoad = Promise.resolve();
    constructor(providerRepo) {
        this.providerRepo = providerRepo;
    }
    onApplicationBootstrap() {
        this.cacheLoad = this.loadFromCache();
    }
    whenLoaded() {
        return this.cacheLoad;
    }
    registerModels(providerId, models) {
        this.registerInto(this.registry, providerId, models);
    }
    registerInto(target, providerId, models) {
        const key = providerId.toLowerCase();
        const existing = target.get(key) ?? new Map();
        for (const model of models) {
            const entry = this.toRegistryEntry(model);
            if (!entry)
                continue;
            const previous = existing.get(entry.id);
            existing.set(entry.id, {
                ...previous,
                ...entry,
                supportedEndpoints: entry.supportedEndpoints ?? previous?.supportedEndpoints,
            });
        }
        if (existing.size > 0)
            target.set(key, existing);
    }
    getConfirmedModels(providerId) {
        const models = this.registry.get(providerId.toLowerCase());
        return models ? new Set(models.keys()) : null;
    }
    isModelConfirmed(providerId, modelId) {
        const confirmed = this.registry.get(providerId.toLowerCase());
        if (!confirmed)
            return null;
        return confirmed.has(modelId.toLowerCase());
    }
    getModelMetadata(providerId, modelId) {
        return this.registry.get(providerId.toLowerCase())?.get(modelId.toLowerCase()) ?? null;
    }
    async loadFromCache() {
        try {
            const staged = new Map();
            let totalModels = 0;
            let cursor = null;
            for (;;) {
                const page = await this.fetchPage(cursor);
                if (page.length === 0)
                    break;
                for (const p of page) {
                    if (!Array.isArray(p.cached_models))
                        continue;
                    const cachedModels = p.cached_models;
                    const models = cachedModels.filter((m) => typeof m === 'object' &&
                        m !== null &&
                        'id' in m &&
                        typeof m.id === 'string' &&
                        m.id.length > 0);
                    if (models.length > 0) {
                        this.registerInto(staged, p.provider, models);
                        totalModels += models.length;
                    }
                }
                if (page.length < exports.CACHE_LOAD_BATCH_SIZE)
                    break;
                cursor = page[page.length - 1].id;
            }
            for (const [provider, models] of staged) {
                this.registerModels(provider, Array.from(models.values()));
            }
            const providerCount = this.registry.size;
            if (providerCount > 0) {
                this.logger.log(`Provider model registry loaded: ${providerCount} providers, ${totalModels} model entries`);
            }
        }
        catch (err) {
            this.logger.warn(`Failed to load provider model registry from cache: ${err}`);
        }
    }
    fetchPage(cursor) {
        const qb = this.providerRepo
            .createQueryBuilder('p')
            .select(['p.id', 'p.provider', 'p.cached_models'])
            .where('p.cached_models IS NOT NULL')
            .orderBy('p.id', 'ASC')
            .limit(exports.CACHE_LOAD_BATCH_SIZE);
        if (cursor !== null)
            qb.andWhere('p.id > :cursor', { cursor });
        return qb.getMany();
    }
    toRegistryEntry(model) {
        const id = typeof model === 'string' ? model : model.id;
        if (typeof id !== 'string' || id.length === 0)
            return null;
        const supportedEndpoints = typeof model === 'string' ? undefined : model.supportedEndpoints;
        const endpoints = Array.isArray(supportedEndpoints) && supportedEndpoints.length > 0
            ? Array.from(new Set(supportedEndpoints.filter((endpoint) => typeof endpoint === 'string' && endpoint.length > 0)))
            : undefined;
        return {
            id: id.toLowerCase(),
            ...(endpoints && endpoints.length > 0 ? { supportedEndpoints: endpoints } : {}),
        };
    }
};
exports.ProviderModelRegistryService = ProviderModelRegistryService;
exports.ProviderModelRegistryService = ProviderModelRegistryService = ProviderModelRegistryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProviderModelRegistryService);
//# sourceMappingURL=provider-model-registry.service.js.map