import * as React from 'react';
type SubscriptionEmailKind = 'subscription_confirmed' | 'plan_changed' | 'cancellation_confirmed';
type UsageEmailKind = 'requests_warning' | 'requests_limit_reached';
export interface SubscriptionPlanEmailProps {
    kind: SubscriptionEmailKind;
    userName?: string | null;
    planName: string;
    previousPlanName?: string | null;
    periodEnd?: string | null;
    appUrl: string;
    manageBillingUrl: string;
    logoUrl?: string;
}
export interface PlanUsageEmailProps {
    kind: UsageEmailKind;
    userName?: string | null;
    used: number;
    limit: number;
    periodEnd: string;
    appUrl: string;
    logoUrl?: string;
}
export declare function SubscriptionPlanEmail(props: SubscriptionPlanEmailProps): React.JSX.Element;
export declare function PlanUsageEmail(props: PlanUsageEmailProps): React.JSX.Element;
export {};
