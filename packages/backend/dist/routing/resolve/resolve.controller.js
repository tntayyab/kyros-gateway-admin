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
exports.ResolveController = exports.RegisterSubscriptionsDto = exports.SubscriptionProviderItem = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const agent_key_auth_guard_1 = require("../../otlp/guards/agent-key-auth.guard");
const resolve_service_1 = require("./resolve.service");
const provider_service_1 = require("../routing-core/provider.service");
const resolve_request_dto_1 = require("../dto/resolve-request.dto");
class SubscriptionProviderItem {
    provider;
    token;
}
exports.SubscriptionProviderItem = SubscriptionProviderItem;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubscriptionProviderItem.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubscriptionProviderItem.prototype, "token", void 0);
class RegisterSubscriptionsDto {
    providers;
}
exports.RegisterSubscriptionsDto = RegisterSubscriptionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SubscriptionProviderItem),
    __metadata("design:type", Array)
], RegisterSubscriptionsDto.prototype, "providers", void 0);
let ResolveController = class ResolveController {
    resolveService;
    providerService;
    constructor(resolveService, providerService) {
        this.resolveService = resolveService;
        this.providerService = providerService;
    }
    async resolve(body, req) {
        const { agentId, tenantId } = req.ingestionContext;
        return this.resolveService.resolve(agentId, tenantId, body.messages, body.tools, body.tool_choice, body.max_tokens, body.recentTiers, body.specificity);
    }
    async registerSubscriptions(body, req) {
        const { agentId, tenantId, userId } = req.ingestionContext;
        let registered = 0;
        for (const item of body.providers) {
            let isNew;
            if (item.token) {
                const result = await this.providerService.upsertProvider(agentId, tenantId, item.provider, item.token, 'subscription', undefined, undefined, userId);
                isNew = result.isNew;
            }
            else {
                const result = await this.providerService.registerSubscriptionProvider(agentId, tenantId, item.provider, userId);
                isNew = result.isNew;
            }
            if (isNew) {
                registered++;
            }
        }
        return { registered };
    }
};
exports.ResolveController = ResolveController;
__decorate([
    (0, common_1.Post)('resolve'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolve_request_dto_1.ResolveRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ResolveController.prototype, "resolve", null);
__decorate([
    (0, common_1.Post)('subscription-providers'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterSubscriptionsDto, Object]),
    __metadata("design:returntype", Promise)
], ResolveController.prototype, "registerSubscriptions", null);
exports.ResolveController = ResolveController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(agent_key_auth_guard_1.AgentKeyAuthGuard),
    __metadata("design:paramtypes", [resolve_service_1.ResolveService,
        provider_service_1.ProviderService])
], ResolveController);
//# sourceMappingURL=resolve.controller.js.map