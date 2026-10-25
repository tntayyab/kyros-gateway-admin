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
exports.HeaderTier = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let HeaderTier = class HeaderTier {
    id;
    tenant_id;
    agent_id;
    name;
    header_key;
    header_value;
    badge_color;
    sort_order;
    enabled;
    override_route;
    fallback_routes;
    output_modality;
    response_mode;
    created_at;
    updated_at;
};
exports.HeaderTier = HeaderTier;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "header_key", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "header_value", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], HeaderTier.prototype, "badge_color", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], HeaderTier.prototype, "sort_order", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: true }),
    __metadata("design:type", Boolean)
], HeaderTier.prototype, "enabled", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], HeaderTier.prototype, "override_route", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], HeaderTier.prototype, "fallback_routes", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'text' }),
    __metadata("design:type", String)
], HeaderTier.prototype, "output_modality", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'buffered' }),
    __metadata("design:type", String)
], HeaderTier.prototype, "response_mode", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], HeaderTier.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], HeaderTier.prototype, "updated_at", void 0);
exports.HeaderTier = HeaderTier = __decorate([
    (0, typeorm_1.Entity)('header_tiers'),
    (0, typeorm_1.Index)(['agent_id', 'sort_order'])
], HeaderTier);
//# sourceMappingURL=header-tier.entity.js.map