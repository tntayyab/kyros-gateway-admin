import { ConfigService } from '@nestjs/config';
import { ThresholdAlertProps } from '../emails/threshold-alert';
export declare class NotificationEmailService {
    private readonly configService;
    private readonly logger;
    private readonly fromEmail;
    constructor(configService: ConfigService);
    sendThresholdAlert(to: string, props: ThresholdAlertProps, providerConfig?: {
        provider: string;
        apiKey: string;
        domain: string | null;
    }): Promise<boolean>;
}
