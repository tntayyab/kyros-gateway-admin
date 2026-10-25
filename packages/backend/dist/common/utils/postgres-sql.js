"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampType = timestampType;
exports.timestampDefault = timestampDefault;
exports.computeCutoff = computeCutoff;
exports.sqlNow = sqlNow;
exports.sqlHourBucket = sqlHourBucket;
exports.sqlDateBucket = sqlDateBucket;
exports.sqlCastFloat = sqlCastFloat;
exports.sqlSanitizeCost = sqlSanitizeCost;
exports.sqlCastInterval = sqlCastInterval;
exports.toSqlTimestamp = toSqlTimestamp;
exports.toLocalSqlTimestamp = toLocalSqlTimestamp;
function timestampType() {
    return 'timestamp';
}
function timestampDefault() {
    return () => 'NOW()';
}
function computeCutoff(interval) {
    const ms = intervalToMs(interval);
    const cutoff = new Date(Date.now() - ms);
    return formatLocalIso(cutoff);
}
function intervalToMs(interval) {
    const match = interval.match(/^(\d+)\s+(hour|hours|day|days)$/);
    if (!match) {
        console.warn(`postgres-sql: unrecognized interval "${interval}", defaulting to 24 hours`);
        return 24 * 60 * 60 * 1000;
    }
    const n = parseInt(match[1], 10);
    const unit = match[2];
    return unit.startsWith('hour') ? n * 3600_000 : n * 86400_000;
}
function sqlNow() {
    return formatLocalIso(new Date());
}
function sqlHourBucket(col) {
    return `to_char(date_trunc('hour', ${col}), 'YYYY-MM-DD"T"HH24:MI:SS')`;
}
function sqlDateBucket(col) {
    return `to_char(${col}::date, 'YYYY-MM-DD')`;
}
function sqlCastFloat(col) {
    return `${col}::float`;
}
function sqlSanitizeCost(col) {
    return `CASE WHEN ${col} >= 0 THEN ${col} ELSE NULL END`;
}
function sqlCastInterval(paramName) {
    return `CAST(:${paramName} AS interval)`;
}
function toSqlTimestamp(d = new Date()) {
    return d.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
}
function toLocalSqlTimestamp(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return (`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
}
function formatLocalIso(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return (`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
}
//# sourceMappingURL=postgres-sql.js.map