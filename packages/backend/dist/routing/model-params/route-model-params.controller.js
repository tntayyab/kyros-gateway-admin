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
exports.RouteModelParamsController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const resolve_agent_service_1 = require("../routing-core/resolve-agent.service");
const model_params_dto_1 = require("../dto/model-params.dto");
const route_model_params_service_1 = require("./route-model-params.service");
let RouteModelParamsController = class RouteModelParamsController {
    routeParams;
    resolveAgentService;
    constructor(routeParams, resolveAgentService) {
        this.routeParams = routeParams;
        this.resolveAgentService = resolveAgentService;
    }
    async get(ctx, params, query) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.routeParams.get(agent.id, params.tier, query.model);
    }
    async update(ctx, params, query, body) {
        const agent = await this.resolveAgentService.resolve(ctx.tenantId, params.agentName);
        return this.routeParams.update(agent.id, params.tier, query.model, {
            set: body.set,
            unset: body.unset,
        });
    }
};
exports.RouteModelParamsController = RouteModelParamsController;
__decorate([
    (0, common_1.Get)(':agentName/tiers/:tier/model-params'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model_params_dto_1.TierModelParamsPathDto,
        model_params_dto_1.TierModelParamsQueryDto]),
    __metadata("design:returntype", Promise)
], RouteModelParamsController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':agentName/tiers/:tier/model-params'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Query)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, model_params_dto_1.TierModelParamsPathDto,
        model_params_dto_1.TierModelParamsQueryDto,
        model_params_dto_1.UpdateTierModelParamsBodyDto]),
    __metadata("design:returntype", Promise)
], RouteModelParamsController.prototype, "update", null);
exports.RouteModelParamsController = RouteModelParamsController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [route_model_params_service_1.RouteModelParamsService,
        resolve_agent_service_1.ResolveAgentService])
], RouteModelParamsController);
//# sourceMappingURL=route-model-params.controller.js.map