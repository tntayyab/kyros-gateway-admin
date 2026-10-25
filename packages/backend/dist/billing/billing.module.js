"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const tenant_entity_1 = require("../entities/tenant.entity");
const billing_controller_1 = require("./billing.controller");
const plan_service_1 = require("./plan.service");
const billing_email_log_service_1 = require("./billing-email-log.service");
const billing_email_service_1 = require("./billing-email.service");
const billing_usage_email_service_1 = require("./billing-usage-email.service");
let BillingModule = class BillingModule {
};
exports.BillingModule = BillingModule;
exports.BillingModule = BillingModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant])],
        controllers: [billing_controller_1.BillingController],
        providers: [plan_service_1.PlanService, billing_email_log_service_1.BillingEmailLogService, billing_email_service_1.BillingEmailService, billing_usage_email_service_1.BillingUsageEmailService],
        exports: [plan_service_1.PlanService],
    })
], BillingModule);
//# sourceMappingURL=billing.module.js.map