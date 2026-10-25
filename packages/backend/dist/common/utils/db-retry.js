"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldRetryDbConnection = shouldRetryDbConnection;
const TRANSPORT_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
    'EHOSTUNREACH',
    'ENETUNREACH',
    'EPIPE',
]);
const TRANSPORT_MESSAGES = [
    'connection terminated',
    'connection refused',
    'timeout expired',
    'the database system is starting up',
    'terminating connection',
    'server closed the connection',
];
function shouldRetryDbConnection(err) {
    const e = (err ?? {});
    const code = typeof e.code === 'string' ? e.code : '';
    const message = typeof e.message === 'string' ? e.message.toLowerCase() : '';
    if (TRANSPORT_CODES.has(code))
        return true;
    return TRANSPORT_MESSAGES.some((m) => message.includes(m));
}
//# sourceMappingURL=db-retry.js.map