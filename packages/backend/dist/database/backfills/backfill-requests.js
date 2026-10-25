"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRequestBackfill = runRequestBackfill;
const backfill_message_providers_1 = require("./backfill-message-providers");
function assertPositiveFinite(name, value) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`request backfill ${name} must be a positive finite number`);
    }
}
function assertPositiveSafeInteger(name, value) {
    if (!Number.isSafeInteger(value) || value <= 0) {
        throw new Error(`request backfill ${name} must be a positive safe integer`);
    }
}
function assertNonNegativeFinite(name, value) {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`request backfill ${name} must be a non-negative finite number`);
    }
}
const realSleep = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});
async function runRequestBackfill(gateway, options = {}) {
    const batchSize = options.batchSize ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.batchSize;
    const throttleMs = options.throttleMs ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.throttleMs;
    const maxRetries = options.maxRetries ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.maxRetries;
    const retryBackoffMs = options.retryBackoffMs ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.retryBackoffMs;
    const sleep = options.sleep ?? realSleep;
    const before = options.before ?? '9999-12-31 23:59:59';
    const fallbackBefore = options.fallbackBefore ?? before;
    const log = (message) => options.logger?.log(message);
    const pause = () => (throttleMs > 0 ? sleep(throttleMs) : Promise.resolve());
    const timeouts = {
        lockTimeoutMs: options.lockTimeoutMs ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.lockTimeoutMs,
        statementTimeoutMs: options.statementTimeoutMs ?? backfill_message_providers_1.DEFAULT_BACKFILL_OPTIONS.statementTimeoutMs,
    };
    assertPositiveSafeInteger('batchSize', batchSize);
    assertNonNegativeFinite('throttleMs', throttleMs);
    assertNonNegativeFinite('maxRetries', maxRetries);
    assertNonNegativeFinite('retryBackoffMs', retryBackoffMs);
    assertPositiveFinite('lockTimeoutMs', timeouts.lockTimeoutMs);
    assertPositiveFinite('statementTimeoutMs', timeouts.statementTimeoutMs);
    const beforeTime = Date.parse(before);
    const fallbackBeforeTime = Date.parse(fallbackBefore);
    if (Number.isNaN(beforeTime))
        throw new Error('request backfill before must be valid');
    if (Number.isNaN(fallbackBeforeTime)) {
        throw new Error('request backfill fallbackBefore must be valid');
    }
    if (fallbackBeforeTime < beforeTime) {
        throw new Error('request backfill fallbackBefore must not precede before');
    }
    if (options.analyze !== false)
        await gateway.analyze();
    let afterId = '';
    const result = {
        windows: 0,
        requests: 0,
        attempts: 0,
        rejections: 0,
    };
    let fallbackAttempt = 0;
    for (;;) {
        try {
            log('request backfill: reconstructing legacy fallback chains');
            const grouped = await gateway.backfillFallbackGroups(batchSize, fallbackBefore, timeouts, pause, (message) => log(`request backfill: ${message}`));
            result.requests += grouped.requests;
            result.attempts += grouped.attempts;
            if (grouped.attempts > 0) {
                log(`request backfill: reconstructed ${grouped.requests} legacy fallback request(s) from ${grouped.attempts} attempt(s)`);
            }
            break;
        }
        catch (error) {
            fallbackAttempt += 1;
            if (fallbackAttempt > maxRetries || !(0, backfill_message_providers_1.isRetryableBackfillError)(error))
                throw error;
            const reason = error instanceof Error ? error.message : String(error);
            log(`request backfill: fallback regrouping failed (attempt ${fallbackAttempt}/${maxRetries}: ${reason}); retrying`);
            await sleep(retryBackoffMs * fallbackAttempt);
        }
    }
    for (;;) {
        const endId = await gateway.nextWindowEnd(afterId, batchSize, before);
        if (endId === null)
            break;
        let attempt = 0;
        for (;;) {
            try {
                const window = await gateway.backfillWindow(afterId, endId, before, timeouts);
                result.requests += window.requests;
                result.attempts += window.attempts;
                result.rejections += window.rejections;
                break;
            }
            catch (error) {
                attempt += 1;
                if (attempt > maxRetries || !(0, backfill_message_providers_1.isRetryableBackfillError)(error))
                    throw error;
                const reason = error instanceof Error ? error.message : String(error);
                log(`request backfill: window after "${afterId}" failed (attempt ${attempt}/${maxRetries}: ${reason}); retrying`);
                await sleep(retryBackoffMs * attempt);
            }
        }
        result.windows += 1;
        afterId = endId;
        if (result.windows % 25 === 0) {
            log(`request backfill: ${result.windows} window(s), ${result.attempts} attempt(s), ${result.rejections} zero-attempt rejection(s)`);
        }
        if (throttleMs > 0)
            await sleep(throttleMs);
    }
    if (options.finalize !== false) {
        let finalizeAttempt = 0;
        for (;;) {
            try {
                await gateway.finalize(timeouts);
                break;
            }
            catch (error) {
                finalizeAttempt += 1;
                if (finalizeAttempt > maxRetries || !(0, backfill_message_providers_1.isRetryableBackfillError)(error))
                    throw error;
                const reason = error instanceof Error ? error.message : String(error);
                log(`request backfill: finalization failed (attempt ${finalizeAttempt}/${maxRetries}: ${reason}); retrying`);
                await sleep(retryBackoffMs * finalizeAttempt);
            }
        }
    }
    log(`request backfill: done — ${result.attempts} attempt(s) and ${result.rejections} rejection(s) across ${result.windows} window(s)`);
    return result;
}
//# sourceMappingURL=backfill-requests.js.map