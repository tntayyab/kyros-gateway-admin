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
exports.SpecificityAssignment = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
let SpecificityAssignment = class SpecificityAssignment {
    id;
    agent_id;
    category;
    is_active;
    override_route;
    auto_assigned_route;
    fallback_routes;
    output_modality;
    response_mode;
    updated_at;
};
exports.SpecificityAssignment = SpecificityAssignment;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], SpecificityAssignment.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], SpecificityAssignment.prototype, "override_route", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], SpecificityAssignment.prototype, "auto_assigned_route", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], SpecificityAssignment.prototype, "fallback_routes", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'text' }),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "output_modality", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { default: 'buffered' }),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "response_mode", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], SpecificityAssignment.prototype, "updated_at", void 0);
exports.SpecificityAssignment = SpecificityAssignment = __decorate([
    (0, typeorm_1.Entity)('specificity_assignments'),
    (0, typeorm_1.Index)(['agent_id', 'category'], { unique: true })
], SpecificityAssignment);
//# sourceMappingURL=specificity-assignment.entity.js.map