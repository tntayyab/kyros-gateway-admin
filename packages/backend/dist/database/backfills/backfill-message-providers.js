"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BACKFILL_OPTIONS = void 0;
exports.isRetryableBackfillError = isRetryableBackfillError;
exports.runMessageProviderBackfill = runMessageProviderBackfill;
exports.DEFAULT_BACKFILL_OPTIONS = {
    batchSize: 10_000,
    throttleMs: 50,
    lockTimeoutMs: 5_000,
    statementTimeoutMs: 60_000,
    maxRetries: 5,
    retryBackoffMs: 1_000,
};
const RETRYABLE_ERROR = /statement timeout|lock timeout|deadlock|connection terminated|connection closed|ECONNRESET|ETIMEDOUT|server closed the connection/i;
function isRetryableBackfillError(error) {
    return RETRYABLE_ERROR.test(error instanceof Error ? error.message : String(error));
}
const realSleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
async function stampWindowWithRetry(gateway, afterId, endId, timeouts, maxRetries, retryBackoffMs, sleep, log) {
    let attempt = 0;
    for (;;) {
        try {
            return await gateway.stampWindow(afterId, endId, timeouts);
        }
        catch (error) {
            attempt += 1;
            if (attempt > maxRetries || !isRetryableBackfillError(error)) {
                throw error;
            }
            const reason = error instanceof Error ? error.message : String(error);
            log(`backfill: window after "${afterId}" failed (attempt ${attempt}/${maxRetries}: ${reason}); retrying`);
            await sleep(retryBackoffMs * attempt);
        }
    }
}
async function runMessageProviderBackfill(gateway, options = {}) {
    const batchSize = options.batchSize ?? exports.DEFAULT_BACKFILL_OPTIONS.batchSize;
    const throttleMs = options.throttleMs ?? exports.DEFAULT_BACKFILL_OPTIONS.throttleMs;
    const timeouts = {
        lockTimeoutMs: options.lockTimeoutMs ?? exports.DEFAULT_BACKFILL_OPTIONS.lockTimeoutMs,
        statementTimeoutMs: options.statementTimeoutMs ?? exports.DEFAULT_BACKFILL_OPTIONS.statementTimeoutMs,
    };
    const sleep = options.sleep ?? realSleep;
    const maxRetries = options.maxRetries ?? exports.DEFAULT_BACKFILL_OPTIONS.maxRetries;
    const retryBackoffMs = options.retryBackoffMs ?? exports.DEFAULT_BACKFILL_OPTIONS.retryBackoffMs;
    const log = (message) => options.logger?.log(message);
    await gateway.analyze();
    let afterId = '';
    let windows = 0;
    let stamped = 0;
    for (;;) {
        const endId = await gateway.nextWindowEnd(afterId, batchSize);
        if (endId === null) {
            break;
        }
        stamped += await stampWindowWithRetry(gateway, afterId, endId, timeouts, maxRetries, retryBackoffMs, sleep, log);
        windows += 1;
        afterId = endId;
        if (windows % 25 === 0) {
            log(`backfill: ${windows} window(s) processed, ${stamped} message(s) stamped so far`);
        }
        if (throttleMs > 0) {
            await sleep(throttleMs);
        }
    }
    log(`backfill: done — stamped ${stamped} message(s) across ${windows} window(s)`);
    return { windows, stamped };
}
//# sourceMappingURL=backfill-message-providers.js.map