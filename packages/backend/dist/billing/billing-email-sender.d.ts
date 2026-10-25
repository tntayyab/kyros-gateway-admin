import { PlanUsageEmailProps, SubscriptionPlanEmailProps } from './emails/billing-plan-email';
export declare function formatPlanName(plan: string | null | undefined): string;
export declare function getBillingEmailFrom(explicit?: string | null): string;
export declare function getBillingAppUrl(explicit?: string | null): string;
export declare function subscriptionEmailSubject(kind: SubscriptionPlanEmailProps['kind'], plan: string): string;
export declare function usageEmailSubject(kind: PlanUsageEmailProps['kind']): "Your Manifest monthly request limit has been reached" | "Your Manifest workspace has used 80% of monthly requests";
export declare function sendSubscriptionPlanEmail(to: string, props: SubscriptionPlanEmailProps, fromEmail?: string | null): Promise<boolean>;
export declare function sendPlanUsageEmail(to: string, props: PlanUsageEmailProps, fromEmail?: string | null): Promise<boolean>;
