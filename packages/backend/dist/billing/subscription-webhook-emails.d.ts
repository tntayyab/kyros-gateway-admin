import type Stripe from 'stripe';
import type { Subscription } from '@better-auth/stripe';
import { BillingEmailLogQueryable } from './billing-email-log.service';
export declare function planFromPriceId(priceId: string | null | undefined, priceToPlan: ReadonlyMap<string, string>): string | null;
export declare function previousPlanFromEvent(event: Stripe.Event, priceToPlan: ReadonlyMap<string, string>): string | null;
export declare function sendSubscriptionConfirmedEmail(db: BillingEmailLogQueryable, event: Stripe.Event, subscription: Subscription): Promise<boolean>;
export declare function sendPlanChangedEmail(db: BillingEmailLogQueryable, event: Stripe.Event, subscription: Subscription, previousPlan: string | null): Promise<boolean>;
export declare function sendSubscriptionCanceledEmail(db: BillingEmailLogQueryable, event: Stripe.Event, subscription: Subscription): Promise<boolean>;
