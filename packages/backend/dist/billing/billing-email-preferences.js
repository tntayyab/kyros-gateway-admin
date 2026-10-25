"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BILLING_EMAIL_PREFERENCES = void 0;
exports.normalizeBillingEmailPreferences = normalizeBillingEmailPreferences;
exports.DEFAULT_BILLING_EMAIL_PREFERENCES = {
    usageAlerts: true,
};
function normalizeBillingEmailPreferences(raw) {
    const value = raw;
    return {
        usageAlerts: typeof value?.usageAlerts === 'boolean'
            ? value.usageAlerts
            : exports.DEFAULT_BILLING_EMAIL_PREFERENCES.usageAlerts,
    };
}
//# sourceMappingURL=billing-email-preferences.js.map