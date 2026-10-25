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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const playground_service_1 = require("./playground.service");
const playground_history_service_1 = require("./playground-history.service");
const playground_agent_service_1 = require("./playground-agent.service");
const run_playground_dto_1 = require("./dto/run-playground.dto");
const history_dto_1 = require("./dto/history.dto");
let PlaygroundController = class PlaygroundController {
    playgroundService;
    historyService;
    playgroundAgent;
    constructor(playgroundService, historyService, playgroundAgent) {
        this.playgroundService = playgroundService;
        this.historyService = historyService;
        this.playgroundAgent = playgroundAgent;
    }
    async getAgent(ctx) {
        const agent = await this.playgroundAgent.resolve(ctx);
        return { name: agent.name };
    }
    async run(ctx, body, res) {
        await this.playgroundService.runStream(ctx, body, res);
    }
    async listRuns(ctx) {
        const agent = await this.playgroundAgent.resolve(ctx);
        return this.historyService.listRuns(agent.tenant_id, agent.id);
    }
    async getRun(ctx, params) {
        const agent = await this.playgroundAgent.resolve(ctx);
        return this.historyService.getRun(agent.tenant_id, params.runId, agent.id);
    }
    async toggleStar(ctx, params) {
        const starred = await this.historyService.toggleStar(ctx.tenantId, params.runId);
        return { starred };
    }
    async setBest(ctx, params, body) {
        const bestColumnId = await this.historyService.setBestColumn(ctx.tenantId, params.runId, body.columnId);
        return { bestColumnId };
    }
};
exports.PlaygroundController = PlaygroundController;
__decorate([
    (0, common_1.Get)('agent'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "getAgent", null);
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, run_playground_dto_1.RunPlaygroundDto, Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "run", null);
__decorate([
    (0, common_1.Get)('runs'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "listRuns", null);
__decorate([
    (0, common_1.Get)('runs/:runId'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, history_dto_1.RunIdParamDto]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "getRun", null);
__decorate([
    (0, common_1.Patch)('runs/:runId/star'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, history_dto_1.RunIdParamDto]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "toggleStar", null);
__decorate([
    (0, common_1.Patch)('runs/:runId/best'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, history_dto_1.RunIdParamDto,
        history_dto_1.SetBestColumnDto]),
    __metadata("design:returntype", Promise)
], PlaygroundController.prototype, "setBest", null);
exports.PlaygroundController = PlaygroundController = __decorate([
    (0, common_1.Controller)('api/v1/playground'),
    __metadata("design:paramtypes", [playground_service_1.PlaygroundService,
        playground_history_service_1.PlaygroundHistoryService,
        playground_agent_service_1.PlaygroundAgentService])
], PlaygroundController);
//# sourceMappingURL=playground.controller.js.map