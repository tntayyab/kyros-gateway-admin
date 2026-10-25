import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { NotificationRulesService } from './services/notification-rules.service';
import { NotificationLogService } from './services/notification-log.service';
import { EmailProviderConfigService } from './services/email-provider-config.service';
import { NotificationCronService } from './services/notification-cron.service';
import { CreateNotificationRuleDto, UpdateNotificationRuleDto } from './dto/notification-rule.dto';
import { SetEmailProviderDto, TestEmailProviderDto, TestSavedEmailProviderDto } from './dto/set-email-provider.dto';
import { SetNotificationEmailDto } from './dto/set-notification-email.dto';
export declare class NotificationsController {
    private readonly rulesService;
    private readonly notificationLog;
    private readonly emailProviderConfigService;
    private readonly cronService;
    private readonly logger;
    constructor(rulesService: NotificationRulesService, notificationLog: NotificationLogService, emailProviderConfigService: EmailProviderConfigService, cronService: NotificationCronService);
    getEmailProvider(ctx: TenantContext): Promise<import("./services/email-provider-config.service").EmailProviderPublicConfig | {
        configured: boolean;
    }>;
    testEmailProvider(_ctx: TenantContext, body: TestEmailProviderDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    testSavedEmailProvider(ctx: TenantContext, body: TestSavedEmailProviderDto): Promise<{
        success: boolean;
        error?: string;
    }>;
    setEmailProvider(ctx: TenantContext, body: SetEmailProviderDto): Promise<import("./services/email-provider-config.service").EmailProviderPublicConfig>;
    removeEmailProvider(ctx: TenantContext): Promise<{
        ok: boolean;
    }>;
    getNotificationEmail(ctx: TenantContext): Promise<{
        email: string | null;
    }>;
    setNotificationEmail(ctx: TenantContext, body: SetNotificationEmailDto): Promise<{
        saved: boolean;
    }>;
    triggerCheck(ctx: TenantContext): Promise<{
        triggered: number;
        message: string;
    }>;
    getLogs(agentName: string, ctx: TenantContext): Promise<any>;
    listRules(agentName: string, ctx: TenantContext): Promise<import("./services/notification-rules.service").NotificationRuleWithTriggerCount[]>;
    createRule(dto: CreateNotificationRuleDto, ctx: TenantContext): Promise<import("../entities/notification-rule.entity").NotificationRule>;
    updateRule(id: string, dto: UpdateNotificationRuleDto, ctx: TenantContext): Promise<import("../entities/notification-rule.entity").NotificationRule | undefined>;
    deleteRule(id: string, ctx: TenantContext): Promise<{
        deleted: boolean;
    }>;
}
