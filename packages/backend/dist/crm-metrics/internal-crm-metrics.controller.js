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
var InternalCrmMetricsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalCrmMetricsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../common/decorators/public.decorator");
const crypto_util_1 = require("../common/utils/crypto.util");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const crm_metrics_service_1 = require("./crm-metrics.service");
const crm_metrics_query_dto_1 = require("./dto/crm-metrics-query.dto");
let InternalCrmMetricsController = class InternalCrmMetricsController {
    static { InternalCrmMetricsController_1 = this; }
    service;
    config;
    static MIN_SECRET_LENGTH = 32;
    static DEFAULT_COHORT_DAYS = 7;
    static DEFAULT_CLAIM_DAYS = 90;
    static DEFAULT_SIGNUP_DAYS = 365;
    logger = new common_1.Logger(InternalCrmMetricsController_1.name);
    selfHosted = (0, detect_self_hosted_1.isSelfHosted)();
    constructor(service, config) {
        this.service = service;
        this.config = config;
    }
    assertCloud() {
        if (this.selfHosted)
            throw new common_1.NotFoundException();
    }
    assertSecret(provided, ip) {
        const expected = this.config.get('app.crmMetricsSecret') ?? '';
        const configured = expected.length >= InternalCrmMetricsController_1.MIN_SECRET_LENGTH;
        if (!configured || !(0, crypto_util_1.timingSafeCompare)(provided ?? '', expected)) {
            this.logger.warn(`Rejected CRM metrics request from ${ip}`);
            throw new common_1.UnauthorizedException('Invalid or missing internal secret');
        }
    }
    async cohort(secret, ip, query) {
        this.assertCloud();
        this.assertSecret(secret, ip);
        return this.service.getHealedCohort(query.days ?? InternalCrmMetricsController_1.DEFAULT_COHORT_DAYS);
    }
    async signups(secret, ip, query) {
        this.assertCloud();
        this.assertSecret(secret, ip);
        return this.service.getCorporateSignups(query.days ?? InternalCrmMetricsController_1.DEFAULT_SIGNUP_DAYS);
    }
    async conversions(secret, ip, query) {
        this.assertCloud();
        this.assertSecret(secret, ip);
        return this.service.getConversions(query.days ?? InternalCrmMetricsController_1.DEFAULT_CLAIM_DAYS);
    }
};
exports.InternalCrmMetricsController = InternalCrmMetricsController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, crm_metrics_query_dto_1.CrmMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], InternalCrmMetricsController.prototype, "cohort", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('signups'),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, crm_metrics_query_dto_1.CrmMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], InternalCrmMetricsController.prototype, "signups", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('conversions'),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, crm_metrics_query_dto_1.CrmMetricsQueryDto]),
    __metadata("design:returntype", Promise)
], InternalCrmMetricsController.prototype, "conversions", null);
exports.InternalCrmMetricsController = InternalCrmMetricsController = InternalCrmMetricsController_1 = __decorate([
    (0, common_1.Controller)('api/v1/internal/crm-metrics'),
    __metadata("design:paramtypes", [crm_metrics_service_1.CrmMetricsService,
        config_1.ConfigService])
], InternalCrmMetricsController);
//# sourceMappingURL=internal-crm-metrics.controller.js.map