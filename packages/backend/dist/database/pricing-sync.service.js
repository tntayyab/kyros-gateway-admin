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
var PricingSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';
const FETCH_TIMEOUT_MS = 10000;
let PricingSyncService = PricingSyncService_1 = class PricingSyncService {
    logger = new common_1.Logger(PricingSyncService_1.name);
    cache = new Map();
    lastFetchedAt = null;
    initialLoad = null;
    onModuleInit() {
        this.initialLoad = this.refreshCache()
            .then(() => undefined)
            .catch((err) => {
            this.logger.error(`Startup OpenRouter cache refresh failed: ${err}`);
        });
    }
    whenInitialized() {
        return this.initialLoad ?? Promise.resolve();
    }
    async refreshCache() {
        this.logger.log('Refreshing OpenRouter pricing cache...');
        const data = await this.fetchOpenRouterModels();
        if (!data)
            return 0;
        const newCache = new Map();
        let count = 0;
        for (const model of data) {
            if (!this.isChatCompatible(model))
                continue;
            if (!model.pricing)
                continue;
            const prompt = Number(model.pricing.prompt ?? 0);
            const completion = Number(model.pricing.completion ?? 0);
            if (!Number.isFinite(prompt) || !Number.isFinite(completion))
                continue;
            if (prompt < 0 || completion < 0)
                continue;
            const displayName = this.extractDisplayName(model);
            const entry = {
                input: prompt,
                output: completion,
                contextWindow: model.context_length ?? undefined,
                displayName: displayName || undefined,
            };
            newCache.set(model.id, entry);
            count++;
        }
        this.cache = newCache;
        this.lastFetchedAt = new Date();
        this.logger.log(`OpenRouter pricing cache loaded: ${count} models`);
        return count;
    }
    lookupPricing(modelId) {
        return this.cache.get(modelId) ?? null;
    }
    getAll() {
        return this.cache;
    }
    getLastFetchedAt() {
        return this.lastFetchedAt;
    }
    async fetchOpenRouterModels() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(OPENROUTER_API, { signal: controller.signal });
            if (!res.ok) {
                this.logger.error(`OpenRouter API returned ${res.status}`);
                return null;
            }
            const body = (await res.json());
            return body.data ?? [];
        }
        catch (err) {
            this.logger.error(`Failed to fetch OpenRouter models: ${err}`);
            return null;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    extractDisplayName(model) {
        if (!model.name)
            return '';
        const colonIdx = model.name.indexOf(': ');
        if (colonIdx !== -1)
            return model.name.substring(colonIdx + 2);
        return model.name;
    }
    isChatCompatible(model) {
        const inputModalities = model.architecture?.input_modalities?.map((m) => m.toLowerCase());
        if (inputModalities && inputModalities.length > 0 && !inputModalities.includes('text')) {
            return false;
        }
        const outputModalities = model.architecture?.output_modalities?.map((m) => m.toLowerCase());
        if (outputModalities && outputModalities.length > 0) {
            return outputModalities.includes('text');
        }
        return true;
    }
};
exports.PricingSyncService = PricingSyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PricingSyncService.prototype, "refreshCache", null);
exports.PricingSyncService = PricingSyncService = PricingSyncService_1 = __decorate([
    (0, common_1.Injectable)()
], PricingSyncService);
//# sourceMappingURL=pricing-sync.service.js.map