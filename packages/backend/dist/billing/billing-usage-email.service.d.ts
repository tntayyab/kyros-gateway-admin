import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IngestEventBusService } from '../common/services/ingest-event-bus.service';
import { PlanService } from './plan.service';
import { BillingEmailLogService } from './billing-email-log.service';
import { BillingEmailService } from './billing-email.service';
export declare class BillingUsageEmailService implements OnModuleInit, OnModuleDestroy {
    private readonly ingestBus;
    private readonly planService;
    private readonly dataSource;
    private readonly logs;
    private readonly emails;
    private readonly logger;
    private ingestSub?;
    constructor(ingestBus: IngestEventBusService, planService: PlanService, dataSource: DataSource, logs: BillingEmailLogService, emails: BillingEmailService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    checkTenantUsage(tenantId: string): Promise<boolean>;
    private resolveMilestoneKind;
    private resolveRecipient;
}
