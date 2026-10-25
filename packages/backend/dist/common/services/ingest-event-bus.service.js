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
var IngestEventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestEventBusService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const agent_list_cache_service_1 = require("./agent-list-cache.service");
let IngestEventBusService = IngestEventBusService_1 = class IngestEventBusService {
    agentListCache;
    logger = new common_1.Logger(IngestEventBusService_1.name);
    subject = new rxjs_1.Subject();
    debounceTimers = new Map();
    DEBOUNCE_MS = 250;
    constructor(agentListCache) {
        this.agentListCache = agentListCache;
    }
    async publish(event) {
        if (event.kind === 'message') {
            try {
                await this.agentListCache.invalidate(event.tenantId);
            }
            catch (error) {
                this.logger.error(`Failed to invalidate the agent-list cache for tenant ${event.tenantId}`, error instanceof Error ? error.stack : String(error));
            }
        }
        this.subject.next(event);
    }
    emit(tenantId, kind = 'message', userId) {
        const debounceKey = `${tenantId}:${kind}`;
        const existing = this.debounceTimers.get(debounceKey);
        if (existing)
            clearTimeout(existing);
        this.debounceTimers.set(debounceKey, setTimeout(() => {
            this.debounceTimers.delete(debounceKey);
            void this.publish({ tenantId, kind, userId });
        }, this.DEBOUNCE_MS));
    }
    forTenant(tenantId) {
        return this.subject.asObservable().pipe((0, operators_1.filter)((e) => e.tenantId === tenantId));
    }
    all() {
        return this.subject.asObservable();
    }
    onModuleDestroy() {
        for (const timer of this.debounceTimers.values()) {
            clearTimeout(timer);
        }
        this.debounceTimers.clear();
        this.subject.complete();
    }
};
exports.IngestEventBusService = IngestEventBusService;
exports.IngestEventBusService = IngestEventBusService = IngestEventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [agent_list_cache_service_1.AgentListCacheService])
], IngestEventBusService);
//# sourceMappingURL=ingest-event-bus.service.js.map