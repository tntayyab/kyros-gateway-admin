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
exports.PlaygroundColumn = void 0;
const typeorm_1 = require("typeorm");
const postgres_sql_1 = require("../common/utils/postgres-sql");
const playground_run_entity_1 = require("./playground-run.entity");
let PlaygroundColumn = class PlaygroundColumn {
    id;
    playground_run_id;
    run;
    model;
    provider;
    auth_type;
    display_name;
    status;
    content;
    headers;
    error_message;
    input_tokens;
    output_tokens;
    cost_usd;
    duration_ms;
    position;
    created_at;
};
exports.PlaygroundColumn = PlaygroundColumn;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "playground_run_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => playground_run_entity_1.PlaygroundRun, (r) => r.columns, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'playground_run_id' }),
    __metadata("design:type", playground_run_entity_1.PlaygroundRun)
], PlaygroundColumn.prototype, "run", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "auth_type", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "display_name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "headers", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "input_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "output_tokens", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "cost_usd", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { nullable: true }),
    __metadata("design:type", Object)
], PlaygroundColumn.prototype, "duration_ms", void 0);
__decorate([
    (0, typeorm_1.Column)('integer', { default: 0 }),
    __metadata("design:type", Number)
], PlaygroundColumn.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)((0, postgres_sql_1.timestampType)(), { default: (0, postgres_sql_1.timestampDefault)() }),
    __metadata("design:type", String)
], PlaygroundColumn.prototype, "created_at", void 0);
exports.PlaygroundColumn = PlaygroundColumn = __decorate([
    (0, typeorm_1.Entity)('playground_columns'),
    (0, typeorm_1.Index)(['playground_run_id', 'position'])
], PlaygroundColumn);
//# sourceMappingURL=playground-column.entity.js.map