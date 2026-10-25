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
exports.TierAssignment = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let TierAssignment = class TierAssignment {
    id;
    agent_id;
    tier;
    override_route;
    auto_assigned_route;
    fallback_routes;
    output_modality;
    response_mode;
    updated_at;
};
exports.TierAssignment = TierAssignment;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], TierAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TierAssignment.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TierAssignment.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TierAssignment.prototype, "override_route", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TierAssignment.prototype, "auto_assigned_route", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], TierAssignment.prototype, "fallback_routes", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'text' }),
    __metadata("design:type", String)
], TierAssignment.prototype, "output_modality", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'buffered' }),
    __metadata("design:type", String)
], TierAssignment.prototype, "response_mode", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], TierAssignment.prototype, "updated_at", void 0);
exports.TierAssignment = TierAssignment = __decorate([
    (0, typeorm_1.Entity)('tier_assignments'),
    (0, typeorm_1.Index)(['agent_id', 'tier'], { unique: true })
], TierAssignment);
//# sourceMappingURL=tier-assignment.entity.js.map