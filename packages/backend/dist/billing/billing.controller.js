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
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const plan_service_1 = require("./plan.service");
const update_billing_email_preferences_dto_1 = require("./dto/update-billing-email-preferences.dto");
let BillingController = class BillingController {
    planService;
    constructor(planService) {
        this.planService = planService;
    }
    async status(ctx) {
        return this.planService.getBillingStatus(ctx);
    }
    async plan(ctx) {
        return this.planService.getPlanStatus(ctx);
    }
    async updateEmailPreferences(ctx, body) {
        return this.planService.updateBillingEmailPreferences(ctx, body);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('billing/status'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "status", null);
__decorate([
    (0, common_1.Get)('billing/plan'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "plan", null);
__decorate([
    (0, common_1.Patch)('billing/email-preferences'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_billing_email_preferences_dto_1.UpdateBillingEmailPreferencesDto]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateEmailPreferences", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [plan_service_1.PlanService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map