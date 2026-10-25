export const PLANS = ['free', 'pro'];
export const FREE_PLAN_REQUESTS_PER_MONTH = 10_000;
export const PLAN_LIMITS = {
    free: { requestsPerMonth: FREE_PLAN_REQUESTS_PER_MONTH },
    // Pro is unlimited. null = unlimited, enforced the same way as the self-hosted
    // UNLIMITED_PLAN_LIMITS.
    pro: { requestsPerMonth: null },
};
export const UNLIMITED_PLAN_LIMITS = { requestsPerMonth: null };
//# sourceMappingURL=plan-limits.js.map