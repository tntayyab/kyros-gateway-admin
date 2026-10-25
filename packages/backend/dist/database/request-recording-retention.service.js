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
var RequestRecordingRetentionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRecordingRetentionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const billing_config_1 = require("../billing/billing.config");
const subscription_status_1 = require("../billing/subscription-status");
const request_recording_storage_service_1 = require("../common/services/request-recording-storage.service");
const FREE_RETENTION_DAYS = 7;
const PRO_RETENTION_DAYS = 365;
const NON_BILLING_RETENTION_DAYS = 365;
const RETENTION_LOCK_KEY = 4011986;
const TRY_LOCK_SQL = `
  SELECT pg_try_advisory_lock(${RETENTION_LOCK_KEY}::bigint) AS acquired
`;
const UNLOCK_SQL = `SELECT pg_advisory_unlock(${RETENTION_LOCK_KEY}::bigint)`;
const SELECT_ALL_EXPIRED_SQL = `
  SELECT id AS attempt_id, recording_key AS storage_key
  FROM agent_messages
  WHERE recording_key IS NOT NULL
    AND timestamp < CURRENT_TIMESTAMP - ($1 * INTERVAL '1 day')
  ORDER BY timestamp ASC
`;
const SELECT_PLAN_EXPIRED_SQL = `
  SELECT attempt.id AS attempt_id, attempt.recording_key AS storage_key
  FROM agent_messages attempt
  JOIN requests request ON request.id = attempt.request_id
  WHERE attempt.recording_key IS NOT NULL
    AND attempt.timestamp < CURRENT_TIMESTAMP - (LEAST($1::int, $2::int) * INTERVAL '1 day')
    AND (
    (
      attempt.timestamp < CURRENT_TIMESTAMP - ($1 * INTERVAL '1 day')
      AND NOT EXISTS (
        SELECT 1
        FROM tenants tenant
        JOIN "subscription" subscription
          ON subscription."referenceId" = tenant.owner_user_id
        WHERE tenant.id = request.tenant_id
          AND subscription.plan = 'pro'
          AND subscription.status IN (${subscription_status_1.PAID_SUBSCRIPTION_STATUS_SQL_LIST})
      )
    )
    OR (
      attempt.timestamp < CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
      AND EXISTS (
        SELECT 1
        FROM tenants tenant
        JOIN "subscription" subscription
          ON subscription."referenceId" = tenant.owner_user_id
        WHERE tenant.id = request.tenant_id
          AND subscription.plan = 'pro'
          AND subscription.status IN (${subscription_status_1.PAID_SUBSCRIPTION_STATUS_SQL_LIST})
      )
    )
  )
  ORDER BY attempt.timestamp ASC
`;
const DELETE_METADATA_SQL = `
  UPDATE agent_messages
  SET recording_key = NULL
  WHERE id = $1 AND recording_key = $2
  RETURNING id
`;
let RequestRecordingRetentionService = RequestRecordingRetentionService_1 = class RequestRecordingRetentionService {
    dataSource;
    storage;
    logger = new common_1.Logger(RequestRecordingRetentionService_1.name);
    globalRetentionDays;
    constructor(dataSource, config, storage) {
        this.dataSource = dataSource;
        this.storage = storage;
        this.globalRetentionDays =
            config.get('app.requestRecordingRetentionDays') ?? null;
    }
    async deleteExpiredRecordings() {
        const queryRunner = this.dataSource.createQueryRunner();
        let acquired = false;
        try {
            await queryRunner.connect();
            const lockRows = (await queryRunner.query(TRY_LOCK_SQL));
            acquired = lockRows[0]?.acquired === true;
            if (!acquired)
                return 0;
            const recordings = this.globalRetentionDays !== null || !(0, billing_config_1.isBillingEnabled)()
                ? await this.findAllExpired(queryRunner, this.globalRetentionDays ?? NON_BILLING_RETENTION_DAYS)
                : await this.findExpiredByPlan(queryRunner);
            const deleted = await this.deleteRecordings(queryRunner, recordings);
            if (deleted > 0) {
                this.logger.log(`Deleted ${deleted} expired Provider Attempt recording(s)`);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Request recording retention failed: ${error instanceof Error ? error.message : String(error)}`);
            return 0;
        }
        finally {
            if (acquired)
                await queryRunner.query(UNLOCK_SQL).catch(() => undefined);
            await queryRunner.release().catch(() => undefined);
        }
    }
    async findAllExpired(queryRunner, retentionDays) {
        return queryRunner.query(SELECT_ALL_EXPIRED_SQL, [retentionDays]);
    }
    async findExpiredByPlan(queryRunner) {
        return queryRunner.query(SELECT_PLAN_EXPIRED_SQL, [
            FREE_RETENTION_DAYS,
            PRO_RETENTION_DAYS,
        ]);
    }
    async deleteRecordings(queryRunner, recordings) {
        let deleted = 0;
        for (const recording of recordings) {
            try {
                await this.storage.delete(recording.storage_key);
                const result = (await queryRunner.query(DELETE_METADATA_SQL, [
                    recording.attempt_id,
                    recording.storage_key,
                ]));
                const rows = Array.isArray(result[0]) ? result[0] : result;
                deleted += rows.length;
            }
            catch (error) {
                this.logger.warn(`Could not delete Provider Attempt recording ${recording.attempt_id}: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return deleted;
    }
};
exports.RequestRecordingRetentionService = RequestRecordingRetentionService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM, {
        name: 'request-recording-retention',
        waitForCompletion: true,
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RequestRecordingRetentionService.prototype, "deleteExpiredRecordings", null);
exports.RequestRecordingRetentionService = RequestRecordingRetentionService = RequestRecordingRetentionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        config_1.ConfigService,
        request_recording_storage_service_1.RequestRecordingStorageService])
], RequestRecordingRetentionService);
//# sourceMappingURL=request-recording-retention.service.js.map