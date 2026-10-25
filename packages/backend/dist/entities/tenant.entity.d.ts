import { Agent } from './agent.entity';
import type { BillingEmailPreferences } from 'manifest-shared';
export declare class Tenant {
    id: string;
    name: string;
    owner_user_id: string | null;
    organization_name: string | null;
    email: string | null;
    is_active: boolean;
    limit_overrides: {
        requestsPerMonth?: number;
    } | null;
    billing_email_preferences: Partial<BillingEmailPreferences> | null;
    agents: Agent[];
    created_at: string;
    updated_at: string;
}
