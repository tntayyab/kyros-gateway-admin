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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRequestUsage = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let TenantRequestUsage = class TenantRequestUsage {
    tenant_id;
    window_start;
    request_count;
    baseline_counted;
};
exports.TenantRequestUsage = TenantRequestUsage;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], TenantRequestUsage.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], TenantRequestUsage.prototype, "window_start", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", String)
], TenantRequestUsage.prototype, "request_count", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], TenantRequestUsage.prototype, "baseline_counted", void 0);
exports.TenantRequestUsage = TenantRequestUsage = __decorate([
    (0, typeorm_1.Entity)('tenant_request_usage')
], TenantRequestUsage);
//# sourceMappingURL=tenant-request-usage.entity.js.map