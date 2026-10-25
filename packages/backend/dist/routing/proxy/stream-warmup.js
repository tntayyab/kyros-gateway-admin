"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STREAM_WARMUP_MS = exports.DEFAULT_STREAM_WARMUP_MS = void 0;
exports.parseStreamWarmupMs = parseStreamWarmupMs;
exports.peekStream = peekStream;
exports.DEFAULT_STREAM_WARMUP_MS = 15_000;
function parseStreamWarmupMs(rawValue = process.env.STREAM_WARMUP_MS) {
    const value = rawValue ?? '';
    if (!/^\d+$/.test(value)) {
        return exports.DEFAULT_STREAM_WARMUP_MS;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : exports.DEFAULT_STREAM_WARMUP_MS;
}
exports.STREAM_WARMUP_MS = parseStreamWarmupMs();
async function peekStream(source, timeoutMs = exports.STREAM_WARMUP_MS) {
    const reader = source.getReader();
    try {
        let timer;
        const first = await Promise.race([
            reader.read(),
            new Promise((resolve) => {
                timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
            }),
        ]);
        clearTimeout(timer);
        if ('timedOut' in first) {
            reader.cancel().catch(() => { });
            reader.releaseLock();
            return { ok: false, reason: 'timeout', message: `No data within ${timeoutMs}ms` };
        }
        const { done, value } = first;
        if (done || !value || value.length === 0) {
            reader.releaseLock();
            return { ok: false, reason: 'empty', message: 'Stream ended with no data' };
        }
        const buffered = value;
        const stream = new ReadableStream({
            async start(controller) {
                controller.enqueue(buffered);
            },
            async pull(controller) {
                try {
                    const { done: nextDone, value: nextValue } = await reader.read();
                    if (nextDone) {
                        controller.close();
                        reader.releaseLock();
                    }
                    else if (nextValue) {
                        controller.enqueue(nextValue);
                    }
                }
                catch (err) {
                    reader.releaseLock();
                    controller.error(err);
                }
            },
            cancel() {
                reader.cancel().catch(() => { });
                reader.releaseLock();
            },
        });
        return { ok: true, stream };
    }
    catch (err) {
        reader.cancel().catch(() => { });
        reader.releaseLock();
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, reason: 'error', message };
    }
}
//# sourceMappingURL=stream-warmup.js.map