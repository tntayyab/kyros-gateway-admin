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
exports.AnalyticsScopeService = void 0;
exports.agentScopeCacheKey = agentScopeCacheKey;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_entity_1 = require("../../entities/agent.entity");
function agentScopeCacheKey(scope) {
    return scope ? (scope.agentId ?? `missing:${scope.agentName}`) : '';
}
let AnalyticsScopeService = class AnalyticsScopeService {
    agentRepo;
    constructor(agentRepo) {
        this.agentRepo = agentRepo;
    }
    async resolve(tenantId, agentName) {
        if (!agentName)
            return undefined;
        if (!tenantId)
            return { tenantId, agentName, agentId: null };
        const rows = (await this.agentRepo.query('SELECT id FROM agents WHERE tenant_id = $1 AND name = $2 AND deleted_at IS NULL LIMIT 1', [tenantId, agentName]));
        return { tenantId, agentName, agentId: rows[0]?.id ?? null };
    }
};
exports.AnalyticsScopeService = AnalyticsScopeService;
exports.AnalyticsScopeService = AnalyticsScopeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnalyticsScopeService);
//# sourceMappingURL=analytics-scope.service.js.map