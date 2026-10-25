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
var ManagedFreeProviderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedFreeProviderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const managed_free_providers_1 = require("../../common/constants/managed-free-providers");
const tenant_provider_entity_1 = require("../../entities/tenant-provider.entity");
const model_discovery_service_1 = require("../../model-discovery/model-discovery.service");
const provider_service_1 = require("../routing-core/provider.service");
const MANAGED_FREE_KEY_GENERATE_TIMEOUT_MS = 5_000;
let ManagedFreeProviderService = ManagedFreeProviderService_1 = class ManagedFreeProviderService {
    providerRepo;
    providerService;
    discoveryService;
    logger = new common_1.Logger(ManagedFreeProviderService_1.name);
    constructor(providerRepo, providerService, discoveryService) {
        this.providerRepo = providerRepo;
        this.providerService = providerService;
        this.discoveryService = discoveryService;
    }
    getConfig(providerId) {
        const config = (0, managed_free_providers_1.getManagedFreeProviderConfig)(providerId);
        if (!config) {
            throw new common_1.NotFoundException(`Unknown managed free provider: ${providerId}`);
        }
        return config;
    }
    async findConnection(config, tenantId) {
        const rows = await this.providerRepo.find({
            where: {
                tenant_id: tenantId,
                provider: config.id,
                auth_type: 'api_key',
            },
        });
        return rows.find((row) => row.is_active) ?? rows[0] ?? null;
    }
    async ensureConnection(providerId, opts) {
        const config = this.getConfig(providerId);
        const { tenantId, userId, userEmail, apiKey } = opts;
        const autoAvailable = (0, managed_free_providers_1.isManagedFreeLiteLlmAutoEligible)(userEmail);
        const existing = await this.findConnection(config, tenantId);
        if (existing?.is_active) {
            return {
                connected: true,
                connection_id: existing.id,
                source: 'existing',
                auto_available: autoAvailable,
            };
        }
        const trimmedKey = apiKey?.trim();
        if (trimmedKey) {
            const row = await this.persistKey(config, tenantId, userId, trimmedKey);
            return {
                connected: true,
                connection_id: row.id,
                source: 'manual',
                auto_available: autoAvailable,
            };
        }
        if (existing) {
            return {
                connected: false,
                connection_id: null,
                source: 'none',
                auto_available: autoAvailable,
            };
        }
        if (!autoAvailable) {
            return {
                connected: false,
                connection_id: null,
                source: 'none',
                auto_available: false,
            };
        }
        const minted = await this.mintVirtualKey(config, tenantId, userEmail);
        const row = await this.persistKey(config, tenantId, userId, minted);
        return {
            connected: true,
            connection_id: row.id,
            source: 'auto',
            auto_available: true,
        };
    }
    async persistKey(config, tenantId, userId, apiKey) {
        const existing = await this.findConnection(config, tenantId);
        if (existing?.is_active) {
            throw new common_1.BadRequestException(`${config.displayName} already has a connection for this workspace`);
        }
        const { provider } = await this.providerService.upsertProvider(null, tenantId, config.id, apiKey, 'api_key', undefined, undefined, userId);
        try {
            await this.discoveryService.discoverModels(provider);
        }
        catch (error) {
            this.logger.warn(`${config.displayName} model discovery failed after connect: ${error instanceof Error ? error.message : String(error)}`);
        }
        return provider;
    }
    async mintVirtualKey(config, tenantId, userEmail) {
        const masterKey = (0, managed_free_providers_1.getManagedFreeLiteLlmMasterKey)();
        if (!masterKey) {
            throw new common_1.BadRequestException('LiteLLM master key is not configured');
        }
        const body = {
            models: [...config.litellmModels],
            max_budget: (0, managed_free_providers_1.getManagedFreeLiteLlmMaxBudgetUsd)(config),
            key_alias: `${config.id}:${tenantId}`,
            metadata: {
                source: config.id,
                tenant_id: tenantId,
                user_email: userEmail ?? null,
            },
        };
        let response;
        try {
            response = await fetch((0, managed_free_providers_1.getManagedFreeLiteLlmKeyGenerateUrl)(), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${masterKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(MANAGED_FREE_KEY_GENERATE_TIMEOUT_MS),
            });
        }
        catch (error) {
            this.logger.error(`LiteLLM /key/generate request failed: ${error instanceof Error ? error.message : String(error)}`);
            throw new common_1.BadRequestException(`Failed to create ${config.displayName} key`);
        }
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            this.logger.error(`LiteLLM /key/generate failed (${response.status}): ${text.slice(0, 300)}`);
            throw new common_1.BadRequestException(`Failed to create ${config.displayName} key`);
        }
        const json = (await response.json());
        const key = json.key ?? json.token;
        if (!key || typeof key !== 'string') {
            throw new common_1.BadRequestException('LiteLLM did not return a virtual key');
        }
        return key;
    }
};
exports.ManagedFreeProviderService = ManagedFreeProviderService;
exports.ManagedFreeProviderService = ManagedFreeProviderService = ManagedFreeProviderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        provider_service_1.ProviderService,
        model_discovery_service_1.ModelDiscoveryService])
], ManagedFreeProviderService);
//# sourceMappingURL=managed-free-provider.service.js.map