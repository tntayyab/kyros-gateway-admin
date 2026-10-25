export interface CrmHealedUser {
    email: string;
    name: string | null;
    healed_recent: number;
    healed_all: number;
    first_heal_at: string;
    last_heal_at: string;
}
export interface CrmWaitlistClaim {
    email: string;
    source: string;
    claimed_at: string;
}
export interface CohortRow {
    email: string;
    user_name: string | null;
    tenant_id: string;
    healed_recent: string | number;
    healed_all: string | number;
    first_heal_at: Date | string;
    last_heal_at: Date | string;
}
export interface CrmCorporateSignup {
    email: string;
    name: string | null;
    domain: string;
    signed_up_at: string;
    last_request_at: string | null;
    has_traffic: boolean;
    domain_signups: number;
}
export interface SignupRow {
    email: string;
    user_name: string | null;
    signed_up_at: Date | string;
    last_request_at: Date | string | null;
}
