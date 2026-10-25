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
exports.AgentAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const agent_key_auth_guard_1 = require("../../otlp/guards/agent-key-auth.guard");
const agent_analytics_service_1 = require("../services/agent-analytics.service");
const range_query_dto_1 = require("../../common/dto/range-query.dto");
const agent_cache_interceptor_1 = require("../../common/interceptors/agent-cache.interceptor");
const cache_constants_1 = require("../../common/constants/cache.constants");
let AgentAnalyticsController = class AgentAnalyticsController {
    analytics;
    constructor(analytics) {
        this.analytics = analytics;
    }
    async getUsage(query, req) {
        const range = query.range ?? '24h';
        const ctx = req.ingestionContext;
        const usage = await this.analytics.getUsage(range, ctx);
        return {
            ...usage,
            agentName: ctx.agentName,
        };
    }
    async getCosts(query, req) {
        const range = query.range ?? '7d';
        const ctx = req.ingestionContext;
        return this.analytics.getCosts(range, ctx);
    }
};
exports.AgentAnalyticsController = AgentAnalyticsController;
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsController.prototype, "getUsage", null);
__decorate([
    (0, common_1.Get)('costs'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [range_query_dto_1.RangeQueryDto, Object]),
    __metadata("design:returntype", Promise)
], AgentAnalyticsController.prototype, "getCosts", null);
exports.AgentAnalyticsController = AgentAnalyticsController = __decorate([
    (0, common_1.Controller)('api/v1/agent'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(agent_key_auth_guard_1.AgentKeyAuthGuard),
    (0, common_1.UseInterceptors)(agent_cache_interceptor_1.AgentCacheInterceptor),
    (0, cache_manager_1.CacheTTL)(cache_constants_1.DASHBOARD_CACHE_TTL_MS),
    __metadata("design:paramtypes", [agent_analytics_service_1.AgentAnalyticsService])
], AgentAnalyticsController);
//# sourceMappingURL=agent-analytics.controller.js.map