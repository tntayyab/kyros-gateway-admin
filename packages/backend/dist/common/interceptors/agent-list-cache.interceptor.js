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
exports.AgentListCacheInterceptor = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const user_cache_interceptor_1 = require("./user-cache.interceptor");
const agent_list_cache_service_1 = require("../services/agent-list-cache.service");
const agent_usage_daily_flags_1 = require("../utils/agent-usage-daily-flags");
let AgentListCacheInterceptor = class AgentListCacheInterceptor extends user_cache_interceptor_1.UserCacheInterceptor {
    keys;
    constructor(agentListCache, reflector, keys) {
        super(agentListCache, reflector);
        this.keys = keys;
    }
    trackBy(context) {
        const tenantId = this.resolveTenantId(context);
        if (!tenantId)
            return undefined;
        if ((0, agent_usage_daily_flags_1.agentUsageDailyReadsEnabled)(tenantId))
            return undefined;
        const request = context.switchToHttp().getRequest();
        const includePlayground = request.query?.includePlayground === 'true';
        return this.keys.key(tenantId, includePlayground);
    }
};
exports.AgentListCacheInterceptor = AgentListCacheInterceptor;
exports.AgentListCacheInterceptor = AgentListCacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, core_1.Reflector,
        agent_list_cache_service_1.AgentListCacheService])
], AgentListCacheInterceptor);
//# sourceMappingURL=agent-list-cache.interceptor.js.map