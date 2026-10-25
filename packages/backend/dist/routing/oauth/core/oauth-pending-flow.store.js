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
var OAuthPendingFlowStore_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthPendingFlowStore = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
let OAuthPendingFlowStore = OAuthPendingFlowStore_1 = class OAuthPendingFlowStore {
    dataSource;
    logger = new common_1.Logger(OAuthPendingFlowStore_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async create(provider, input, ttlMs) {
        const expiresAt = new Date(Date.now() + ttlMs);
        await this.cleanupExpired(provider);
        await this.dataSource.query(`
        DELETE FROM "oauth_pending_flows"
        WHERE "provider" = $1
          AND "agent_id" = $2
          AND "tenant_id" = $3
      `, [provider, input.agentId, input.tenantId]);
        await this.dataSource.query(`
        INSERT INTO "oauth_pending_flows"
          ("provider", "state", "code_verifier", "agent_id", "tenant_id", "expires_at")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [provider, input.state, input.verifier, input.agentId, input.tenantId, expiresAt]);
        return { provider, ...input, expiresAt: expiresAt.getTime() };
    }
    async consume(provider, state, agentId, tenantId) {
        const result = await this.dataSource.query(`
        DELETE FROM "oauth_pending_flows"
        WHERE "provider" = $1
          AND "state" = $2
          AND "agent_id" = $3
          AND "tenant_id" = $4
          AND "expires_at" > NOW()
        RETURNING "provider", "state", "code_verifier", "agent_id", "tenant_id", "expires_at"
      `, [provider, state, agentId, tenantId]);
        const rows = queryRows(result);
        return rows[0] ? mapRow(rows[0]) : null;
    }
    async findLatestForAgent(provider, agentId, tenantId) {
        await this.cleanupExpired(provider);
        const rows = (await this.dataSource.query(`
        SELECT "provider", "state", "code_verifier", "agent_id", "tenant_id", "expires_at"
        FROM "oauth_pending_flows"
        WHERE "provider" = $1
          AND "agent_id" = $2
          AND "tenant_id" = $3
          AND "expires_at" > NOW()
        ORDER BY "created_at" DESC
        LIMIT 1
      `, [provider, agentId, tenantId]));
        return rows[0] ? mapRow(rows[0]) : null;
    }
    async clear(provider, state) {
        await this.dataSource.query(`
        DELETE FROM "oauth_pending_flows"
        WHERE "provider" = $1
          AND "state" = $2
      `, [provider, state]);
    }
    async count(provider) {
        await this.cleanupExpired(provider);
        const rows = (await this.dataSource.query(`
        SELECT COUNT(*)::int AS "count"
        FROM "oauth_pending_flows"
        WHERE "provider" = $1
      `, [provider]));
        return Number(rows[0]?.count ?? 0);
    }
    async cleanupExpired(provider) {
        if (provider) {
            await this.dataSource.query(`
          DELETE FROM "oauth_pending_flows"
          WHERE "provider" = $1
            AND "expires_at" <= NOW()
        `, [provider]);
            return;
        }
        await this.dataSource.query(`
        DELETE FROM "oauth_pending_flows"
        WHERE "expires_at" <= NOW()
      `);
    }
    async cleanupExpiredCron() {
        try {
            await this.cleanupExpired();
        }
        catch (err) {
            this.logger.warn(`Failed to clean expired OAuth pending flows: ${err}`);
        }
    }
};
exports.OAuthPendingFlowStore = OAuthPendingFlowStore;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OAuthPendingFlowStore.prototype, "cleanupExpiredCron", null);
exports.OAuthPendingFlowStore = OAuthPendingFlowStore = OAuthPendingFlowStore_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], OAuthPendingFlowStore);
function mapRow(row) {
    const expiresAt = row.expires_at instanceof Date ? row.expires_at.getTime() : new Date(row.expires_at).getTime();
    return {
        provider: row.provider,
        state: row.state,
        verifier: row.code_verifier,
        agentId: row.agent_id,
        tenantId: row.tenant_id,
        expiresAt,
    };
}
function queryRows(result) {
    if (Array.isArray(result) &&
        result.length === 2 &&
        Array.isArray(result[0]) &&
        typeof result[1] === 'number') {
        return result[0];
    }
    return result;
}
//# sourceMappingURL=oauth-pending-flow.store.js.map