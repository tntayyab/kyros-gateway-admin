"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRequestBackfillDatabaseUrl = exports.createRequestBackfillDataSource = void 0;
exports.main = main;
require("dotenv/config");
const backfill_state_entity_1 = require("../../entities/backfill-state.entity");
const request_backfill_datasource_1 = require("./request-backfill.datasource");
Object.defineProperty(exports, "createRequestBackfillDataSource", { enumerable: true, get: function () { return request_backfill_datasource_1.createRequestBackfillDataSource; } });
Object.defineProperty(exports, "resolveRequestBackfillDatabaseUrl", { enumerable: true, get: function () { return request_backfill_datasource_1.resolveRequestBackfillDatabaseUrl; } });
const request_backfill_boot_service_1 = require("./request-backfill.boot.service");
const realSleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
async function main(deps = {}) {
    const env = deps.env ?? process.env;
    const logger = deps.logger ?? console;
    const sleep = deps.sleep ?? realSleep;
    const dataSource = deps.dataSource ?? (0, request_backfill_datasource_1.createRequestBackfillDataSource)(env);
    await dataSource.initialize();
    try {
        const coordinator = deps.coordinator ??
            new request_backfill_boot_service_1.RequestBackfillBootService(dataSource, dataSource.getRepository(backfill_state_entity_1.BackfillState));
        await coordinator.runUntilComplete();
        if (deps.initialOnly === true) {
            logger.log('request/provider-attempt historical backfill complete; live-write delta deferred');
            return;
        }
        while (true) {
            while (await coordinator.hasUnlinkedAttempts()) {
                logger.log(`waiting ${request_backfill_boot_service_1.REQUEST_BACKFILL_GENERIC_GRACE_MS / 1000}s for legacy writes to age`);
                await sleep(request_backfill_boot_service_1.REQUEST_BACKFILL_GENERIC_GRACE_MS);
                while (!(await coordinator.runTailOnce())) {
                    await sleep(request_backfill_boot_service_1.REQUEST_BACKFILL_LOCK_RETRY_MS);
                }
            }
            if (await coordinator.runTransitionFinalizeOnce())
                break;
            await sleep(request_backfill_boot_service_1.REQUEST_BACKFILL_LOCK_RETRY_MS);
        }
        logger.log('request/provider-attempt backfill, catch-up, and transition complete');
    }
    finally {
        await dataSource.destroy();
    }
}
if (require.main === module) {
    main({ initialOnly: process.argv.slice(2).includes('--initial-only') }).catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
//# sourceMappingURL=request-backfill.cli.js.map