import { ConfigService } from '@nestjs/config';
import type { PlanUsageEmailProps, SubscriptionPlanEmailProps } from './emails/billing-plan-email';
export declare class BillingEmailService {
    private readonly configService;
    private readonly logger;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    getAppUrl(): string;
    sendSubscriptionPlanEmail(to: string, props: Omit<SubscriptionPlanEmailProps, 'appUrl' | 'manageBillingUrl'>): Promise<boolean>;
    sendPlanUsageEmail(to: string, props: Omit<PlanUsageEmailProps, 'appUrl'>): Promise<boolean>;
}
