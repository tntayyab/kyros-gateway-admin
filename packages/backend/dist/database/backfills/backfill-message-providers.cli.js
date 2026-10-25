"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBackfillOptions = readBackfillOptions;
exports.createBackfillDataSource = createBackfillDataSource;
exports.main = main;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const backfill_message_providers_1 = require("./backfill-message-providers");
const backfill_message_providers_gateway_1 = require("./backfill-message-providers.gateway");
const DEFAULT_DATABASE_URL = 'postgresql://myuser:mypassword@localhost:5432/mydatabase';
function readBackfillOptions(env) {
    const num = (raw) => {
        if (raw === undefined || raw.trim() === '') {
            return undefined;
        }
        const parsed = Number(raw);
        return Number.isFinite(parsed) ? parsed : undefined;
    };
    return {
        batchSize: num(env['BACKFILL_BATCH_SIZE']),
        throttleMs: num(env['BACKFILL_THROTTLE_MS']),
        lockTimeoutMs: num(env['BACKFILL_LOCK_TIMEOUT_MS']),
        statementTimeoutMs: num(env['BACKFILL_STATEMENT_TIMEOUT_MS']),
        maxRetries: num(env['BACKFILL_MAX_RETRIES']),
        retryBackoffMs: num(env['BACKFILL_RETRY_BACKOFF_MS']),
    };
}
function createBackfillDataSource(env) {
    const url = env['MIGRATION_DATABASE_URL'] ?? env['DATABASE_URL'] ?? DEFAULT_DATABASE_URL;
    return new typeorm_1.DataSource({ type: 'postgres', url });
}
async function main(deps = {}) {
    const env = deps.env ?? process.env;
    const logger = deps.logger ?? console;
    const dataSource = deps.dataSource ?? createBackfillDataSource(env);
    await dataSource.initialize();
    try {
        const result = await (0, backfill_message_providers_1.runMessageProviderBackfill)(new backfill_message_providers_gateway_1.TypeOrmBackfillGateway(dataSource), {
            ...readBackfillOptions(env),
            logger,
        });
        logger.log(`Backfill complete: stamped ${result.stamped} message(s) across ${result.windows} window(s).`);
        return result;
    }
    finally {
        await dataSource.destroy();
    }
}
if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
//# sourceMappingURL=backfill-message-providers.cli.js.map