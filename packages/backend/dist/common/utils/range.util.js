"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RANGE_VALUES = void 0;
exports.rangeToInterval = rangeToInterval;
exports.rangeToPreviousInterval = rangeToPreviousInterval;
exports.isHourlyRange = isHourlyRange;
exports.RANGE_VALUES = ['1h', '6h', '24h', '7d', '30d', '90d', '365d'];
function rangeToInterval(range) {
    switch (range) {
        case '1h':
            return '1 hour';
        case '6h':
            return '6 hours';
        case '24h':
            return '24 hours';
        case '7d':
            return '7 days';
        case '30d':
            return '30 days';
        case '90d':
            return '90 days';
        case '365d':
            return '365 days';
        default:
            return '24 hours';
    }
}
function rangeToPreviousInterval(range) {
    switch (range) {
        case '1h':
            return '2 hours';
        case '6h':
            return '12 hours';
        case '24h':
            return '48 hours';
        case '7d':
            return '14 days';
        case '30d':
            return '60 days';
        case '90d':
            return '180 days';
        case '365d':
            return '730 days';
        default:
            return '48 hours';
    }
}
function isHourlyRange(range) {
    return ['1h', '6h', '24h'].includes(range);
}
//# sourceMappingURL=range.util.js.map