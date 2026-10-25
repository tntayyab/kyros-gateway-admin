import { OnModuleInit } from '@nestjs/common';
import { NotificationRulesService } from './notification-rules.service';
import { NotificationEmailService } from './notification-email.service';
import { EmailProviderConfigService } from './email-provider-config.service';
import { NotificationLogService } from './notification-log.service';
import { ManifestRuntimeService } from '../../common/services/manifest-runtime.service';
export declare class NotificationCronService implements OnModuleInit {
    private readonly rulesService;
    private readonly emailService;
    private readonly emailProviderConfigService;
    private readonly runtime;
    private readonly notificationLog;
    private readonly logger;
    constructor(rulesService: NotificationRulesService, emailService: NotificationEmailService, emailProviderConfigService: EmailProviderConfigService, runtime: ManifestRuntimeService, notificationLog: NotificationLogService);
    onModuleInit(): Promise<void>;
    checkThresholds(tenantId?: string): Promise<number>;
    private evaluateRule;
}
