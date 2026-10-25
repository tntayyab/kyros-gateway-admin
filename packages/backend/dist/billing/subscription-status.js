"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAID_SUBSCRIPTION_STATUS_SQL_LIST = exports.PAID_SUBSCRIPTION_STATUSES = void 0;
exports.PAID_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due'];
exports.PAID_SUBSCRIPTION_STATUS_SQL_LIST = exports.PAID_SUBSCRIPTION_STATUSES.map((status) => `'${status}'`).join(', ');
//# sourceMappingURL=subscription-status.js.map