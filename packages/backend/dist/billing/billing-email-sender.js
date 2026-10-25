"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPlanName = formatPlanName;
exports.getBillingEmailFrom = getBillingEmailFrom;
exports.getBillingAppUrl = getBillingAppUrl;
exports.subscriptionEmailSubject = subscriptionEmailSubject;
exports.usageEmailSubject = usageEmailSubject;
exports.sendSubscriptionPlanEmail = sendSubscriptionPlanEmail;
exports.sendPlanUsageEmail = sendPlanUsageEmail;
const dashboard_url_1 = require("../common/utils/dashboard-url");
const render_1 = require("@react-email/render");
const billing_plan_email_1 = require("./emails/billing-plan-email");
const send_email_1 = require("../notifications/services/email-providers/send-email");
function formatPlanName(plan) {
    const normalized = (plan ?? '').trim().toLowerCase();
    if (normalized === 'pro')
        return 'Pro';
    if (normalized === 'free')
        return 'Free';
    if (!normalized)
        return 'Manifest';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
function getBillingEmailFrom(explicit) {
    return (explicit ||
        process.env['EMAIL_FROM'] ||
        process.env['NOTIFICATION_FROM_EMAIL'] ||
        'noreply@manifest.build');
}
function getBillingAppUrl(explicit) {
    return (0, dashboard_url_1.getDashboardBaseUrl)(explicit);
}
function subscriptionEmailSubject(kind, plan) {
    if (kind === 'plan_changed')
        return `Your Manifest plan changed to ${plan}`;
    if (kind === 'cancellation_confirmed')
        return `Your Manifest ${plan} cancellation is scheduled`;
    return `Your Manifest ${plan} plan is active`;
}
function usageEmailSubject(kind) {
    return kind === 'requests_limit_reached'
        ? 'Your Manifest monthly request limit has been reached'
        : 'Your Manifest workspace has used 80% of monthly requests';
}
async function sendSubscriptionPlanEmail(to, props, fromEmail) {
    const element = (0, billing_plan_email_1.SubscriptionPlanEmail)(props);
    const html = await (0, render_1.render)(element);
    const text = await (0, render_1.render)(element, { plainText: true });
    return (0, send_email_1.sendEmail)({
        to,
        subject: subscriptionEmailSubject(props.kind, props.planName),
        html,
        text,
        from: `Manifest <${getBillingEmailFrom(fromEmail)}>`,
    });
}
async function sendPlanUsageEmail(to, props, fromEmail) {
    const element = (0, billing_plan_email_1.PlanUsageEmail)(props);
    const html = await (0, render_1.render)(element);
    const text = await (0, render_1.render)(element, { plainText: true });
    return (0, send_email_1.sendEmail)({
        to,
        subject: usageEmailSubject(props.kind),
        html,
        text,
        from: `Manifest <${getBillingEmailFrom(fromEmail)}>`,
    });
}
//# sourceMappingURL=billing-email-sender.js.map