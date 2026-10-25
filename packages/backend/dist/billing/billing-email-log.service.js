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
exports.BillingEmailLogService = void 0;
exports.hasBillingEmailLog = hasBillingEmailLog;
exports.tryInsertBillingEmailLog = tryInsertBillingEmailLog;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
function rowsFrom(result) {
    if (Array.isArray(result))
        return result;
    if (result && typeof result === 'object' && Array.isArray(result.rows)) {
        return result.rows;
    }
    return [];
}
async function queryRows(db, sql, params = []) {
    return rowsFrom(await db.query(sql, params));
}
async function hasBillingEmailLog(db, dedupeKey) {
    const rows = await queryRows(db, `SELECT id FROM billing_email_logs WHERE dedupe_key = $1 LIMIT 1`, [dedupeKey]);
    return rows.length > 0;
}
async function tryInsertBillingEmailLog(db, params) {
    const rows = await queryRows(db, `INSERT INTO billing_email_logs
       (id, dedupe_key, kind, tenant_id, user_id, stripe_subscription_id, period_start, period_end, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (dedupe_key) DO NOTHING
     RETURNING id`, [
        (0, uuid_1.v4)(),
        params.dedupeKey,
        params.kind,
        params.tenantId ?? null,
        params.userId ?? null,
        params.stripeSubscriptionId ?? null,
        params.periodStart ?? null,
        params.periodEnd ?? null,
        params.metadata ?? null,
    ]);
    return rows.length > 0;
}
let BillingEmailLogService = class BillingEmailLogService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async hasDedupeKey(dedupeKey) {
        return hasBillingEmailLog(this.dataSource, dedupeKey);
    }
    async tryInsert(params) {
        return tryInsertBillingEmailLog(this.dataSource, params);
    }
};
exports.BillingEmailLogService = BillingEmailLogService;
exports.BillingEmailLogService = BillingEmailLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], BillingEmailLogService);
//# sourceMappingURL=billing-email-log.service.js.map