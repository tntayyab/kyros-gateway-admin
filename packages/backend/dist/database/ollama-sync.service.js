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
var OllamaSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaSyncService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_provider_entity_1 = require("../entities/tenant-provider.entity");
const model_discovery_service_1 = require("../model-discovery/model-discovery.service");
const ollama_1 = require("../common/constants/ollama");
let OllamaSyncService = OllamaSyncService_1 = class OllamaSyncService {
    providerRepo;
    discoveryService;
    logger = new common_1.Logger(OllamaSyncService_1.name);
    constructor(providerRepo, discoveryService) {
        this.providerRepo = providerRepo;
        this.discoveryService = discoveryService;
    }
    async sync() {
        const ollamaProviders = await this.providerRepo.find({
            where: { provider: 'ollama', is_active: true },
        });
        if (ollamaProviders.length === 0) {
            const url = `${ollama_1.OLLAMA_HOST}/api/tags`;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 3000);
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);
                if (!res.ok) {
                    this.logger.warn(`Ollama responded ${res.status} from ${url}`);
                    return { count: 0 };
                }
                const data = (await res.json());
                return { count: data.models?.length ?? 0 };
            }
            catch (err) {
                this.logger.warn(`Could not reach Ollama at ${url}: ${err.message}`);
                return { count: 0 };
            }
        }
        let totalCount = 0;
        for (const provider of ollamaProviders) {
            const models = await this.discoveryService.discoverModels(provider);
            totalCount += models.length;
        }
        this.logger.log(`Synced ${totalCount} models from Ollama`);
        return { count: totalCount };
    }
};
exports.OllamaSyncService = OllamaSyncService;
exports.OllamaSyncService = OllamaSyncService = OllamaSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_provider_entity_1.TenantProvider)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        model_discovery_service_1.ModelDiscoveryService])
], OllamaSyncService);
//# sourceMappingURL=ollama-sync.service.js.map