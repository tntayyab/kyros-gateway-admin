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
var PlaygroundHistoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaygroundHistoryService = exports.MAX_RUNS_PER_AGENT = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const playground_run_entity_1 = require("../entities/playground-run.entity");
const playground_column_entity_1 = require("../entities/playground-column.entity");
exports.MAX_RUNS_PER_AGENT = 50;
let PlaygroundHistoryService = PlaygroundHistoryService_1 = class PlaygroundHistoryService {
    runRepo;
    columnRepo;
    logger = new common_1.Logger(PlaygroundHistoryService_1.name);
    constructor(runRepo, columnRepo) {
        this.runRepo = runRepo;
        this.columnRepo = columnRepo;
    }
    async saveColumn(input) {
        const runId = input.runId ?? (0, uuid_1.v4)();
        const columnId = (0, uuid_1.v4)();
        const insertedRun = await this.ensureRun(runId, input);
        try {
            await this.columnRepo.insert({
                id: columnId,
                playground_run_id: runId,
                model: input.model,
                provider: input.provider,
                auth_type: input.authType,
                display_name: input.displayName,
                status: input.status,
                content: input.content,
                headers: input.headers,
                error_message: input.errorMessage,
                input_tokens: input.metrics?.inputTokens ?? null,
                output_tokens: input.metrics?.outputTokens ?? null,
                cost_usd: input.metrics?.cost ?? null,
                duration_ms: input.metrics?.durationMs ?? null,
                position: input.position,
                created_at: new Date().toISOString(),
            });
        }
        catch (err) {
            this.logger.warn(`Failed to persist playground history column: ${err instanceof Error ? err.message : err}`);
            return null;
        }
        if (insertedRun) {
            try {
                await this.pruneOldRuns(input.agent.tenant_id, input.agent.id);
            }
            catch (err) {
                this.logger.warn(`Failed to prune old playground runs: ${err instanceof Error ? err.message : err}`);
            }
        }
        return columnId;
    }
    async ensureRun(runId, input) {
        try {
            const result = await this.runRepo
                .createQueryBuilder()
                .insert()
                .into('playground_runs')
                .values({
                id: runId,
                tenant_id: input.agent.tenant_id,
                created_by_user_id: input.createdByUserId,
                agent_id: input.agent.id,
                agent_name: input.agent.name,
                prompt: input.prompt.slice(0, 10_000),
                created_at: new Date().toISOString(),
            })
                .orIgnore()
                .execute();
            return (result.identifiers ?? []).length > 0;
        }
        catch (err) {
            this.logger.warn(`Failed to ensure playground run row: ${err instanceof Error ? err.message : err}`);
            return false;
        }
    }
    async listRuns(tenantId, agentId) {
        const runs = await this.runRepo.find({
            where: { tenant_id: tenantId, agent_id: agentId },
            order: { created_at: 'DESC' },
            take: exports.MAX_RUNS_PER_AGENT,
        });
        if (runs.length === 0)
            return [];
        const columns = await this.columnRepo.find({
            where: { playground_run_id: (0, typeorm_2.In)(runs.map((r) => r.id)) },
            select: ['playground_run_id', 'model', 'display_name', 'position'],
            order: { position: 'ASC' },
        });
        const modelsByRun = new Map();
        for (const c of columns) {
            const bucket = modelsByRun.get(c.playground_run_id) ?? [];
            bucket.push(c.display_name ?? c.model);
            modelsByRun.set(c.playground_run_id, bucket);
        }
        return runs.map((r) => {
            const models = modelsByRun.get(r.id) ?? [];
            return {
                id: r.id,
                prompt: r.prompt,
                createdAt: r.created_at,
                modelCount: models.length,
                models,
                starred: r.starred,
                bestColumnId: r.best_column_id ?? null,
            };
        });
    }
    async getRun(tenantId, runId, agentId) {
        const where = {
            id: runId,
            tenant_id: tenantId,
        };
        if (agentId)
            where.agent_id = agentId;
        const run = await this.runRepo.findOne({ where });
        if (!run)
            throw new common_1.NotFoundException(`Playground run "${runId}" not found`);
        const columns = await this.columnRepo.find({
            where: { playground_run_id: runId },
            order: { position: 'ASC' },
        });
        return {
            id: run.id,
            prompt: run.prompt,
            createdAt: run.created_at,
            modelCount: columns.length,
            models: columns.map((c) => c.display_name ?? c.model),
            starred: run.starred,
            bestColumnId: run.best_column_id ?? null,
            columns: columns.map((c) => {
                const hasMetrics = c.status === 'success' &&
                    c.input_tokens != null &&
                    c.output_tokens != null &&
                    c.duration_ms != null;
                return {
                    id: c.id,
                    model: c.model,
                    provider: c.provider,
                    authType: (c.auth_type ?? null),
                    displayName: c.display_name,
                    status: c.status === 'success' ? 'success' : 'error',
                    content: c.content,
                    headers: c.headers,
                    errorMessage: c.error_message,
                    metrics: hasMetrics
                        ? {
                            inputTokens: c.input_tokens,
                            outputTokens: c.output_tokens,
                            cost: c.cost_usd != null ? Number(c.cost_usd) : null,
                            durationMs: c.duration_ms,
                        }
                        : null,
                    position: c.position,
                };
            }),
        };
    }
    async toggleStar(tenantId, runId) {
        const result = await this.runRepo
            .createQueryBuilder()
            .update(playground_run_entity_1.PlaygroundRun)
            .set({ starred: () => 'NOT starred' })
            .where('id = :runId AND tenant_id = :tenantId', { runId, tenantId })
            .returning('starred')
            .execute();
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Playground run "${runId}" not found`);
        }
        return result.raw[0].starred;
    }
    async setBestColumn(tenantId, runId, columnId) {
        if (columnId !== null) {
            const column = await this.columnRepo.findOne({
                where: { id: columnId, playground_run_id: runId },
                select: ['id'],
            });
            if (!column) {
                throw new common_1.NotFoundException(`Column "${columnId}" does not belong to playground run "${runId}"`);
            }
        }
        const result = await this.runRepo
            .createQueryBuilder()
            .update(playground_run_entity_1.PlaygroundRun)
            .set({ best_column_id: columnId })
            .where('id = :runId AND tenant_id = :tenantId', { runId, tenantId })
            .returning('best_column_id')
            .execute();
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Playground run "${runId}" not found`);
        }
        return result.raw[0].best_column_id ?? null;
    }
    async pruneOldRuns(tenantId, agentId) {
        const surplus = await this.runRepo
            .createQueryBuilder('r')
            .select('r.id', 'id')
            .where('r.tenant_id = :tenantId', { tenantId })
            .andWhere('r.agent_id = :agentId', { agentId })
            .orderBy('r.created_at', 'DESC')
            .offset(exports.MAX_RUNS_PER_AGENT)
            .getRawMany();
        if (surplus.length === 0)
            return;
        await this.runRepo.delete({ id: (0, typeorm_2.In)(surplus.map((s) => s.id)) });
    }
};
exports.PlaygroundHistoryService = PlaygroundHistoryService;
exports.PlaygroundHistoryService = PlaygroundHistoryService = PlaygroundHistoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(playground_run_entity_1.PlaygroundRun)),
    __param(1, (0, typeorm_1.InjectRepository)(playground_column_entity_1.PlaygroundColumn)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PlaygroundHistoryService);
//# sourceMappingURL=playground-history.service.js.map