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
var FreeModelsSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeModelsSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const GITHUB_RAW_REF = '8b0feb0e3adda96455bcc380b815454944ff3832';
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/${GITHUB_RAW_REF}/data.json`;
const FETCH_TIMEOUT_MS = 10000;
function isHttpsUrl(value) {
    if (typeof value !== 'string')
        return false;
    try {
        return new URL(value).protocol === 'https:';
    }
    catch {
        return false;
    }
}
function isOptionalHttpsUrl(value) {
    return value === null || value === undefined || isHttpsUrl(value);
}
function isValidProvider(p) {
    if (!p || typeof p !== 'object')
        return false;
    const v = p;
    if (typeof v.name !== 'string' || v.name.length === 0)
        return false;
    if (typeof v.category !== 'string')
        return false;
    if (typeof v.country !== 'string')
        return false;
    if (typeof v.flag !== 'string')
        return false;
    if (!isHttpsUrl(v.url))
        return false;
    if (!isOptionalHttpsUrl(v.baseUrl))
        return false;
    if (typeof v.description !== 'string')
        return false;
    if (!Array.isArray(v.models))
        return false;
    return v.models.every((m) => m && typeof m === 'object' && typeof m.name === 'string');
}
let FreeModelsSyncService = FreeModelsSyncService_1 = class FreeModelsSyncService {
    logger = new common_1.Logger(FreeModelsSyncService_1.name);
    cache = [];
    lastFetchedAt = null;
    onModuleInit() {
        void this.refreshCache().catch((err) => {
            this.logger.error(`Startup free models sync failed: ${err}`);
        });
    }
    async refreshCache() {
        this.logger.log('Refreshing free models cache from GitHub...');
        const data = await this.fetchData();
        if (!data)
            return 0;
        const validated = data.providers.filter((p) => {
            if (!isValidProvider(p)) {
                this.logger.warn(`Dropping free-models provider with invalid shape: ${p?.name ?? '<unnamed>'}`);
                return false;
            }
            return true;
        });
        this.cache = validated;
        this.lastFetchedAt = new Date();
        this.logger.log(`Free models cache loaded: ${validated.length} providers`);
        return validated.length;
    }
    getAll() {
        return this.cache;
    }
    getLastFetchedAt() {
        return this.lastFetchedAt;
    }
    async fetchData() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(GITHUB_RAW_URL, { signal: controller.signal });
            if (!res.ok) {
                this.logger.error(`GitHub raw returned ${res.status}`);
                return null;
            }
            const body = (await res.json());
            if (!Array.isArray(body.providers)) {
                this.logger.error('GitHub data.json missing providers array');
                return null;
            }
            return body;
        }
        catch (err) {
            this.logger.error(`Failed to fetch free models data: ${err}`);
            return null;
        }
        finally {
            clearTimeout(timeout);
        }
    }
};
exports.FreeModelsSyncService = FreeModelsSyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FreeModelsSyncService.prototype, "refreshCache", null);
exports.FreeModelsSyncService = FreeModelsSyncService = FreeModelsSyncService_1 = __decorate([
    (0, common_1.Injectable)()
], FreeModelsSyncService);
//# sourceMappingURL=free-models-sync.service.js.map