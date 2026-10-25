import { NotificationRulesService } from './notification-rules.service';
import { NotificationEmailService } from './notification-email.service';
import { EmailProviderConfigService } from './email-provider-config.service';
import { NotificationLogService } from './notification-log.service';
import { ManifestRuntimeService } from '../../common/services/manifest-runtime.service';
export interface LimitExceeded {
    ruleId: string;
    metricType: 'tokens' | 'cost';
    threshold: number;
    actual: number;
    period: string;
}
export declare class LimitCheckService {
    private readonly rulesService;
    private readonly emailService;
    private readonly emailProviderConfig;
    private readonly runtime;
    private readonly notificationLog;
    private readonly logger;
    constructor(rulesService: NotificationRulesService, emailService: NotificationEmailService, emailProviderConfig: EmailProviderConfigService, runtime: ManifestRuntimeService, notificationLog: NotificationLogService);
    checkLimits(tenantId: string, agentName: string): Promise<LimitExceeded | null>;
    private notifyLimitExceeded;
}
