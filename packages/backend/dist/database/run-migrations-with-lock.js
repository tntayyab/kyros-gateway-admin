"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIGRATION_LOCK_POLL_MS = exports.MIGRATION_ADVISORY_LOCK_KEY = void 0;
exports.runMigrationsWithAdvisoryLock = runMigrationsWithAdvisoryLock;
exports.MIGRATION_ADVISORY_LOCK_KEY = 4011985;
exports.MIGRATION_LOCK_POLL_MS = 2_000;
const WAIT_LOG_EVERY = 30;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function runMigrationsWithAdvisoryLock(dataSource, pollMs = exports.MIGRATION_LOCK_POLL_MS) {
    const lockRunner = dataSource.createQueryRunner();
    await lockRunner.connect();
    let locked = false;
    try {
        for (let attempt = 1;; attempt++) {
            const rows = (await lockRunner.query('SELECT pg_try_advisory_lock($1::bigint) AS locked', [
                exports.MIGRATION_ADVISORY_LOCK_KEY,
            ]));
            if (rows[0]?.locked)
                break;
            if (attempt % WAIT_LOG_EVERY === 1) {
                console.log('Another deployment holds the migration lock; waiting for it to finish.');
            }
            await sleep(pollMs);
        }
        locked = true;
        await dataSource.runMigrations({ transaction: 'each' });
    }
    finally {
        if (locked) {
            try {
                await lockRunner.query('SELECT pg_advisory_unlock($1::bigint)', [
                    exports.MIGRATION_ADVISORY_LOCK_KEY,
                ]);
            }
            catch {
            }
        }
        await lockRunner.release();
    }
}
//# sourceMappingURL=run-migrations-with-lock.js.map