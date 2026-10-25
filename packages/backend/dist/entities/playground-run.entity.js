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
exports.PlaygroundRun = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
const playground_column_entity_1 = require("./playground-column.entity");
let PlaygroundRun = class PlaygroundRun {
    id;
    tenant_id;
    created_by_user_id;
    agent_id;
    agent_name;
    prompt;
    starred;
    best_column_id;
    created_at;
    columns;
};
exports.PlaygroundRun = PlaygroundRun;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "tenant_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundRun.prototype, "created_by_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "agent_name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], PlaygroundRun.prototype, "starred", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundRun.prototype, "best_column_id", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], PlaygroundRun.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => playground_column_entity_1.PlaygroundColumn, (c) => c.run, { cascade: true }),
    __metadata("design:type", Array)
], PlaygroundRun.prototype, "columns", void 0);
exports.PlaygroundRun = PlaygroundRun = __decorate([
    (0, typeorm_1.Entity)('playground_runs'),
    (0, typeorm_1.Index)(['tenant_id', 'agent_id', 'created_at'])
], PlaygroundRun);
//# sourceMappingURL=playground-run.entity.js.map