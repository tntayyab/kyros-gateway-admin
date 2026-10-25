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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const ingest_event_bus_service_1 = require("../common/services/ingest-event-bus.service");
let SseController = class SseController {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    events(ctx) {
        return this.eventBus.forTenant(ctx.tenantId).pipe((0, operators_1.mergeMap)((evt) => [
            { type: evt.kind, data: evt.kind },
            { type: 'ping', data: 'ping' },
        ]));
    }
};
exports.SseController = SseController;
__decorate([
    (0, common_1.Sse)('events'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", rxjs_1.Observable)
], SseController.prototype, "events", null);
exports.SseController = SseController = __decorate([
    (0, throttler_1.SkipThrottle)(),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [ingest_event_bus_service_1.IngestEventBusService])
], SseController);
//# sourceMappingURL=sse.controller.js.map