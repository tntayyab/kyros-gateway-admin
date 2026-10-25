import { DataSource } from 'typeorm';
export declare function formatNotificationTimestamp(): string;
export declare class NotificationLogService {
    private readonly ds;
    constructor(ds: DataSource);
    hasAlreadySent(ruleId: string, periodStart: string): Promise<boolean>;
    insertLog(params: {
        ruleId: string;
        periodStart: string;
        periodEnd: string;
        actualValue: number;
        thresholdValue: number;
        metricType: string;
        agentName: string;
        sentAt: string;
    }): Promise<void>;
    getLogsForAgent(tenantId: string | null, agentName: string): Promise<any>;
    resolveRecipientEmail(tenantId: string, notificationEmail?: string | null): Promise<string | null>;
}
