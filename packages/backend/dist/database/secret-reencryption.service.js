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
var SecretReencryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretReencryptionService = exports.ENCRYPTED_COLUMNS = exports.BATCH_SIZE = exports.REENCRYPTION_ADVISORY_LOCK_KEY = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_util_1 = require("../common/utils/crypto.util");
exports.REENCRYPTION_ADVISORY_LOCK_KEY = 4011987;
const TRY_LOCK_SQL = `SELECT pg_try_advisory_lock(${exports.REENCRYPTION_ADVISORY_LOCK_KEY}::bigint) AS acquired`;
const UNLOCK_SQL = `SELECT pg_advisory_unlock(${exports.REENCRYPTION_ADVISORY_LOCK_KEY}::bigint)`;
exports.BATCH_SIZE = 500;
exports.ENCRYPTED_COLUMNS = [
    { table: 'tenant_providers', idColumn: 'id', column: 'api_key_encrypted' },
    { table: 'agent_api_keys', idColumn: 'id', column: 'key' },
    { table: 'email_provider_configs', idColumn: 'id', column: 'api_key_encrypted' },
];
let SecretReencryptionService = SecretReencryptionService_1 = class SecretReencryptionService {
    dataSource;
    logger = new common_1.Logger(SecretReencryptionService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    onApplicationBootstrap() {
        this.run().catch((err) => {
            this.logger.error(`Secret re-encryption crashed: ${describe(err)}`);
        });
    }
    async run() {
        const previous = process.env['MANIFEST_ENCRYPTION_KEY_PREVIOUS'];
        if (!previous || previous.length < 32)
            return;
        let secrets;
        let currentSecret;
        try {
            secrets = (0, crypto_util_1.getDecryptionSecrets)();
            currentSecret = (0, crypto_util_1.getEncryptionSecret)();
        }
        catch (err) {
            this.logger.warn(`Skipping secret re-encryption: ${describe(err)}`);
            return;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        let acquired = false;
        try {
            await queryRunner.connect();
            const lockRows = (await queryRunner.query(TRY_LOCK_SQL));
            acquired = lockRows[0]?.acquired === true;
            if (!acquired)
                return;
            const summary = [];
            let totalRewritten = 0;
            let totalSkipped = 0;
            let failed = false;
            for (const target of exports.ENCRYPTED_COLUMNS) {
                try {
                    const result = await this.reencryptTable(queryRunner, target, secrets, currentSecret);
                    totalRewritten += result.rewritten;
                    totalSkipped += result.skipped;
                    summary.push(`${target.table}.${target.column} ${result.scanned} scanned / ${result.rewritten} rewritten / ${result.skipped} undecryptable`);
                }
                catch (err) {
                    failed = true;
                    summary.push(`${target.table}.${target.column} failed (${describe(err)})`);
                }
            }
            this.logger.log(`Secret re-encryption complete (${secrets.length} secrets configured): ${summary.join(', ')}`);
            if (totalRewritten === 0 && totalSkipped === 0 && !failed) {
                this.logger.log('Nothing left under an older secret — MANIFEST_ENCRYPTION_KEY_PREVIOUS can be removed.');
            }
        }
        catch (err) {
            this.logger.error(`Secret re-encryption failed: ${describe(err)}`);
        }
        finally {
            if (acquired)
                await queryRunner.query(UNLOCK_SQL).catch(() => undefined);
            await queryRunner.release().catch(() => undefined);
        }
    }
    async reencryptTable(queryRunner, target, secrets, currentSecret) {
        const selectSql = `SELECT "${target.idColumn}" AS id, "${target.column}" AS value ` +
            `FROM "${target.table}" ` +
            `WHERE "${target.column}" IS NOT NULL AND "${target.column}" <> '' ` +
            `AND "${target.idColumn}" > $1 ` +
            `ORDER BY "${target.idColumn}" ASC LIMIT ${exports.BATCH_SIZE}`;
        const updateSql = `UPDATE "${target.table}" SET "${target.column}" = $1 ` +
            `WHERE "${target.idColumn}" = $2 AND "${target.column}" = $3`;
        let cursor = '';
        let scanned = 0;
        let rewritten = 0;
        let skipped = 0;
        for (;;) {
            const rows = (await queryRunner.query(selectSql, [cursor]));
            if (rows.length === 0)
                break;
            for (const row of rows) {
                cursor = row.id;
                scanned++;
                await yieldToEventLoop();
                if (!(0, crypto_util_1.isEncrypted)(row.value))
                    continue;
                let decrypted;
                try {
                    decrypted = (0, crypto_util_1.decryptWithAny)(row.value, secrets);
                }
                catch {
                    skipped++;
                    this.logger.warn(`Could not decrypt ${target.table}.${target.column} for row ${row.id} with any configured secret; leaving it untouched`);
                    continue;
                }
                if (decrypted.secretIndex === 0)
                    continue;
                const result = (await queryRunner.query(updateSql, [(0, crypto_util_1.encrypt)(decrypted.plaintext, currentSecret), row.id, row.value], true));
                if (result.affected === 1)
                    rewritten++;
            }
            if (rows.length < exports.BATCH_SIZE)
                break;
        }
        return { scanned, rewritten, skipped };
    }
};
exports.SecretReencryptionService = SecretReencryptionService;
exports.SecretReencryptionService = SecretReencryptionService = SecretReencryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], SecretReencryptionService);
function yieldToEventLoop() {
    return new Promise((resolve) => setImmediate(resolve));
}
function describe(err) {
    return err instanceof Error ? err.message : String(err);
}
//# sourceMappingURL=secret-reencryption.service.js.map