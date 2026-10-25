"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNLIMITED_PLAN_LIMITS = exports.PLAN_LIMITS = exports.FREE_PLAN_REQUESTS_PER_MONTH = exports.PLANS = void 0;
exports.PLANS = ['free', 'pro'];
exports.FREE_PLAN_REQUESTS_PER_MONTH = 10_000;
exports.PLAN_LIMITS = {
    free: { requestsPerMonth: exports.FREE_PLAN_REQUESTS_PER_MONTH },
    // Pro is unlimited. null = unlimited, enforced the same way as the self-hosted
    // UNLIMITED_PLAN_LIMITS.
    pro: { requestsPerMonth: null },
};
exports.UNLIMITED_PLAN_LIMITS = { requestsPerMonth: null };
//# sourceMappingURL=plan-limits.js.map