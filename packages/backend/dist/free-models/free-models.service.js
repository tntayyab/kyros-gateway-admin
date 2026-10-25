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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeModelsService = void 0;
const common_1 = require("@nestjs/common");
const free_models_sync_service_1 = require("./free-models-sync.service");
const free_models_provider_metadata_1 = require("./free-models-provider-metadata");
let FreeModelsService = class FreeModelsService {
    syncService;
    constructor(syncService) {
        this.syncService = syncService;
    }
    getAll() {
        const githubProviders = this.syncService.getAll();
        const lastSyncedAt = this.syncService.getLastFetchedAt()?.toISOString() ?? null;
        const providers = githubProviders.map((gp) => {
            const meta = free_models_provider_metadata_1.PROVIDER_METADATA[gp.name];
            return {
                name: meta?.displayName ?? gp.name,
                logo: meta?.logo ?? null,
                description: gp.description,
                tags: meta?.tags ?? [],
                api_key_url: gp.url,
                base_url: gp.baseUrl,
                warning: meta?.warning ?? null,
                country: gp.country,
                flag: gp.flag,
                models: gp.models.map((m) => ({
                    id: m.id ?? null,
                    name: m.name,
                    context: m.context,
                    max_output: m.maxOutput,
                    modality: m.modality,
                    rate_limit: m.rateLimit,
                })),
            };
        });
        return { providers, last_synced_at: lastSyncedAt };
    }
};
exports.FreeModelsService = FreeModelsService;
exports.FreeModelsService = FreeModelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [free_models_sync_service_1.FreeModelsSyncService])
], FreeModelsService);
//# sourceMappingURL=free-models.service.js.map