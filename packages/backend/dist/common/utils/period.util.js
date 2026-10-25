"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computePeriodBoundaries = computePeriodBoundaries;
exports.computePeriodResetDate = computePeriodResetDate;
const postgres_sql_1 = require("./postgres-sql");
function computePeriodBoundaries(period) {
    const now = new Date();
    let start;
    switch (period) {
        case 'hour':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1);
            break;
        case 'day':
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week': {
            const dayOfWeek = now.getDay();
            const monday = now.getDate() - ((dayOfWeek + 6) % 7);
            start = new Date(now.getFullYear(), now.getMonth(), monday);
            break;
        }
        case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1);
    }
    const end = new Date(now.getTime());
    return { periodStart: (0, postgres_sql_1.toLocalSqlTimestamp)(start), periodEnd: (0, postgres_sql_1.toLocalSqlTimestamp)(end) };
}
function computePeriodResetDate(period) {
    const now = new Date();
    let reset;
    switch (period) {
        case 'hour':
            reset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
            break;
        case 'day':
            reset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week': {
            const dayOfWeek = now.getDay();
            const daysUntilMonday = (8 - dayOfWeek) % 7 || 7;
            reset = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
            break;
        }
        case 'month':
            reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        default:
            reset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
    }
    return (0, postgres_sql_1.toLocalSqlTimestamp)(reset);
}
//# sourceMappingURL=period.util.js.map