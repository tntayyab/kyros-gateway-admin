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
exports.UserCacheInterceptor = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
let UserCacheInterceptor = class UserCacheInterceptor extends cache_manager_1.CacheInterceptor {
    inFlightResponses = new Map();
    constructor(cacheManager, reflector) {
        super(cacheManager, reflector);
    }
    async intercept(context, next) {
        const key = await this.trackBy(context);
        if (!key)
            return super.intercept(context, next);
        const existing = this.inFlightResponses.get(key);
        if (existing)
            return existing;
        const response = (0, rxjs_1.defer)(() => super.intercept(context, next)).pipe((0, rxjs_1.mergeAll)(), (0, rxjs_1.finalize)(() => {
            this.inFlightResponses.delete(key);
        }), (0, rxjs_1.shareReplay)({ bufferSize: 1, refCount: false }));
        this.inFlightResponses.set(key, response);
        return response;
    }
    resolveTenantId(context) {
        const request = context.switchToHttp().getRequest();
        if (request.method !== 'GET')
            return undefined;
        return request.tenantContext?.tenantId ?? undefined;
    }
    trackBy(context) {
        const tenantId = this.resolveTenantId(context);
        if (!tenantId)
            return undefined;
        const request = context.switchToHttp().getRequest();
        return `${tenantId}:${request.originalUrl}`;
    }
};
exports.UserCacheInterceptor = UserCacheInterceptor;
exports.UserCacheInterceptor = UserCacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('CACHE_MANAGER')),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], UserCacheInterceptor);
//# sourceMappingURL=user-cache.interceptor.js.map