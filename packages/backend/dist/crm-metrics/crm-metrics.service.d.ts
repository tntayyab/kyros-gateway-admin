import { DataSource } from 'typeorm';
import type { CrmCorporateSignup, CrmHealedUser, CrmWaitlistClaim } from './crm-metrics.types';
export declare class CrmMetricsService {
    private readonly dataSource;
    private readonly cohortCache;
    private readonly claimsCache;
    private readonly signupsCache;
    constructor(dataSource: DataSource);
    getHealedCohort(days: number, now?: Date): Promise<CrmHealedUser[]>;
    getCorporateSignups(days: number, now?: Date): Promise<CrmCorporateSignup[]>;
    getConversions(days: number, now?: Date): Promise<CrmWaitlistClaim[]>;
    private withRunner;
}
