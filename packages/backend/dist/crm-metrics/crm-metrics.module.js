"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmMetricsModule = void 0;
const common_1 = require("@nestjs/common");
const crm_metrics_service_1 = require("./crm-metrics.service");
const internal_crm_metrics_controller_1 = require("./internal-crm-metrics.controller");
let CrmMetricsModule = class CrmMetricsModule {
};
exports.CrmMetricsModule = CrmMetricsModule;
exports.CrmMetricsModule = CrmMetricsModule = __decorate([
    (0, common_1.Module)({
        controllers: [internal_crm_metrics_controller_1.InternalCrmMetricsController],
        providers: [crm_metrics_service_1.CrmMetricsService],
    })
], CrmMetricsModule);
//# sourceMappingURL=crm-metrics.module.js.map