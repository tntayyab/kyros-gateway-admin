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
exports.EmailProviderConfig = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let EmailProviderConfig = class EmailProviderConfig {
    id;
    tenant_id;
    created_by_user_id;
    provider;
    api_key_encrypted;
    key_prefix;
    domain;
    notification_email;
    is_active;
    created_at;
    updated_at;
};
exports.EmailProviderConfig = EmailProviderConfig;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], EmailProviderConfig.prototype, "created_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "api_key_encrypted", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], EmailProviderConfig.prototype, "key_prefix", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], EmailProviderConfig.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], EmailProviderConfig.prototype, "notification_email", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], EmailProviderConfig.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], EmailProviderConfig.prototype, "updated_at", void 0);
exports.EmailProviderConfig = EmailProviderConfig = __decorate([
    (0, typeorm_1.Entity)('email_provider_configs'),
    (0, typeorm_1.Index)(['tenant_id'], { unique: true })
], EmailProviderConfig);
//# sourceMappingURL=email-provider-config.entity.js.map