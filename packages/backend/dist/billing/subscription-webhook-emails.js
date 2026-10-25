"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planFromPriceId = planFromPriceId;
exports.previousPlanFromEvent = previousPlanFromEvent;
exports.sendSubscriptionConfirmedEmail = sendSubscriptionConfirmedEmail;
exports.sendPlanChangedEmail = sendPlanChangedEmail;
exports.sendSubscriptionCanceledEmail = sendSubscriptionCanceledEmail;
const billing_email_sender_1 = require("./billing-email-sender");
const billing_email_log_service_1 = require("./billing-email-log.service");
async function resolveBillingUser(db, userId) {
    const result = await db.query(`SELECT email, NULLIF(name, '') AS name FROM "user" WHERE id = $1`, [userId]);
    const rows = Array.isArray(result)
        ? result
        : (result.rows ?? []);
    return rows[0] ?? null;
}
async function sendLifecycleEmail(db, params) {
    try {
        const userId = params.subscription.referenceId;
        const subscriptionId = params.subscription.stripeSubscriptionId ?? params.subscription.id;
        const dedupeAction = params.kind === 'subscription_confirmed'
            ? 'confirm'
            : params.kind === 'cancellation_confirmed'
                ? 'cancel'
                : params.eventId;
        const dedupeKey = `billing:${params.kind}:${subscriptionId}:${dedupeAction}`;
        if (await (0, billing_email_log_service_1.hasBillingEmailLog)(db, dedupeKey))
            return false;
        const recipient = await resolveBillingUser(db, userId);
        if (!recipient?.email)
            return false;
        const appUrl = (0, billing_email_sender_1.getBillingAppUrl)();
        const sent = await (0, billing_email_sender_1.sendSubscriptionPlanEmail)(recipient.email, {
            kind: params.kind,
            userName: recipient.name,
            planName: (0, billing_email_sender_1.formatPlanName)(params.subscription.plan),
            previousPlanName: params.previousPlanName,
            periodEnd: params.periodEnd ?? null,
            appUrl,
            manageBillingUrl: `${appUrl}/account`,
        }, (0, billing_email_sender_1.getBillingEmailFrom)());
        if (!sent)
            return false;
        await (0, billing_email_log_service_1.tryInsertBillingEmailLog)(db, {
            dedupeKey,
            kind: params.kind,
            userId,
            stripeSubscriptionId: subscriptionId,
            periodEnd: params.periodEnd ?? null,
            metadata: {
                eventId: params.eventId,
                plan: params.subscription.plan,
                previousPlan: params.previousPlanName ?? null,
            },
        });
        return true;
    }
    catch (err) {
        console.warn(`[BillingEmail] Failed to send ${params.kind}:`, err);
        return false;
    }
}
function planFromPriceId(priceId, priceToPlan) {
    if (!priceId)
        return null;
    return priceToPlan.get(priceId) ?? null;
}
function previousPlanFromEvent(event, priceToPlan) {
    const previous = event.data.previous_attributes;
    const previousPrice = previous?.items?.data?.find((item) => item.price?.id)?.price?.id;
    return planFromPriceId(previousPrice, priceToPlan);
}
async function sendSubscriptionConfirmedEmail(db, event, subscription) {
    return sendLifecycleEmail(db, {
        kind: 'subscription_confirmed',
        eventId: event.id,
        subscription,
        periodEnd: subscription.periodEnd?.toISOString(),
    });
}
async function sendPlanChangedEmail(db, event, subscription, previousPlan) {
    if (!previousPlan || previousPlan === subscription.plan)
        return false;
    return sendLifecycleEmail(db, {
        kind: 'plan_changed',
        eventId: event.id,
        subscription,
        previousPlanName: (0, billing_email_sender_1.formatPlanName)(previousPlan),
        periodEnd: subscription.periodEnd?.toISOString(),
    });
}
async function sendSubscriptionCanceledEmail(db, event, subscription) {
    return sendLifecycleEmail(db, {
        kind: 'cancellation_confirmed',
        eventId: event.id,
        subscription,
        periodEnd: subscription.cancelAt?.toISOString() ??
            subscription.periodEnd?.toISOString() ??
            subscription.endedAt?.toISOString(),
    });
}
//# sourceMappingURL=subscription-webhook-emails.js.map