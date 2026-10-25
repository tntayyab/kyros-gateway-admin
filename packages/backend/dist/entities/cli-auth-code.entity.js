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
exports.CliAuthCode = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let CliAuthCode = class CliAuthCode {
    id;
    code_hash;
    state;
    code_challenge;
    code_challenge_method;
    tenant_id;
    user_id;
    created_at;
    expires_at;
};
exports.CliAuthCode = CliAuthCode;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], CliAuthCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)('varchar', { length: 64 }),
    __metadata("design:type", String)
], CliAuthCode.prototype, "code_hash", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 128 }),
    __metadata("design:type", String)
], CliAuthCode.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 128, nullable: true }),
    __metadata("design:type", Object)
], CliAuthCode.prototype, "code_challenge", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 10, nullable: true }),
    __metadata("design:type", Object)
], CliAuthCode.prototype, "code_challenge_method", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], CliAuthCode.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], CliAuthCode.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], CliAuthCode.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)()),
    __metadata("design:type", String)
], CliAuthCode.prototype, "expires_at", void 0);
exports.CliAuthCode = CliAuthCode = __decorate([
    (0, typeorm_1.Entity)('cli_auth_codes')
], CliAuthCode);
//# sourceMappingURL=cli-auth-code.entity.js.map