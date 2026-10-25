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
exports.TenantProvider = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let TenantProvider = class TenantProvider {
    id;
    tenant_id;
    created_by_user_id;
    agent_id;
    provider;
    api_key_encrypted;
    key_prefix;
    auth_type;
    label;
    priority;
    region;
    is_active;
    connected_at;
    updated_at;
    cached_models;
    models_fetched_at;
};
exports.TenantProvider = TenantProvider;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], TenantProvider.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TenantProvider.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "created_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TenantProvider.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "api_key_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "key_prefix", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'api_key' }),
    __metadata("design:type", String)
], TenantProvider.prototype, "auth_type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'Default' }),
    __metadata("design:type", String)
], TenantProvider.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], TenantProvider.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], TenantProvider.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], TenantProvider.prototype, "connected_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], TenantProvider.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "cached_models", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { nullable: true, default: null }),
    __metadata("design:type", Object)
], TenantProvider.prototype, "models_fetched_at", void 0);
exports.TenantProvider = TenantProvider = __decorate([
    (0, typeorm_1.Entity)('tenant_providers')
], TenantProvider);
//# sourceMappingURL=tenant-provider.entity.js.map