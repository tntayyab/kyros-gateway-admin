import { ConfigService } from '@nestjs/config';
import { CrmMetricsService } from './crm-metrics.service';
import { CrmMetricsQueryDto } from './dto/crm-metrics-query.dto';
import type { CrmCorporateSignup, CrmHealedUser, CrmWaitlistClaim } from './crm-metrics.types';
export declare class InternalCrmMetricsController {
    private readonly service;
    private readonly config;
    private static readonly MIN_SECRET_LENGTH;
    private static readonly DEFAULT_COHORT_DAYS;
    private static readonly DEFAULT_CLAIM_DAYS;
    private static readonly DEFAULT_SIGNUP_DAYS;
    private readonly logger;
    private readonly selfHosted;
    constructor(service: CrmMetricsService, config: ConfigService);
    private assertCloud;
    private assertSecret;
    cohort(secret: string, ip: string, query: CrmMetricsQueryDto): Promise<CrmHealedUser[]>;
    signups(secret: string, ip: string, query: CrmMetricsQueryDto): Promise<CrmCorporateSignup[]>;
    conversions(secret: string, ip: string, query: CrmMetricsQueryDto): Promise<CrmWaitlistClaim[]>;
}
