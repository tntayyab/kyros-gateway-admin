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
exports.NotificationLogService = void 0;
exports.formatNotificationTimestamp = formatNotificationTimestamp;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const postgres_sql_1 = require("../../common/utils/postgres-sql");
function formatNotificationTimestamp() {
    return (0, postgres_sql_1.toSqlTimestamp)();
}
let NotificationLogService = class NotificationLogService {
    ds;
    constructor(ds) {
        this.ds = ds;
    }
    async hasAlreadySent(ruleId, periodStart) {
        const rows = await this.ds.query(`SELECT 1 FROM notification_logs WHERE rule_id = $1 AND period_start = $2`, [ruleId, periodStart]);
        return rows.length > 0;
    }
    async insertLog(params) {
        await this.ds.query(`INSERT INTO notification_logs
         (id, rule_id, period_start, period_end, actual_value, threshold_value, metric_type, agent_name, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [
            (0, uuid_1.v4)(),
            params.ruleId,
            params.periodStart,
            params.periodEnd,
            params.actualValue,
            params.thresholdValue,
            params.metricType,
            params.agentName,
            params.sentAt,
        ]);
    }
    async getLogsForAgent(tenantId, agentName) {
        if (!tenantId)
            return [];
        return this.ds.query(`SELECT nl.id, nl.sent_at, nl.actual_value, nl.threshold_value,
                nl.metric_type, nl.period_start, nl.period_end, nl.agent_name
         FROM notification_logs nl
         JOIN notification_rules nr ON nr.id = nl.rule_id
         WHERE nr.tenant_id = $1 AND nl.agent_name = $2
         ORDER BY nl.sent_at DESC
         LIMIT 50`, [tenantId, agentName]);
    }
    async resolveRecipientEmail(tenantId, notificationEmail) {
        if (notificationEmail)
            return notificationEmail;
        const rows = await this.ds.query(`SELECT COALESCE(u.email, t.email) AS email
         FROM tenants t
         LEFT JOIN "user" u ON u.id = t.owner_user_id
         WHERE t.id = $1`, [tenantId]);
        return rows[0]?.email ?? null;
    }
};
exports.NotificationLogService = NotificationLogService;
exports.NotificationLogService = NotificationLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], NotificationLogService);
//# sourceMappingURL=notification-log.service.js.map