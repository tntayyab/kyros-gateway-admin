import { SendEmailOptions } from './email-provider.interface';
export interface SendEmailEnvConfig {
    emailProvider?: string;
    emailApiKey?: string;
    emailDomain?: string;
    emailFrom?: string;
    mailgunApiKey?: string;
    mailgunDomain?: string;
    notificationFromEmail?: string;
}
export declare function isEmailConfigured(env?: SendEmailEnvConfig): boolean;
export declare function sendEmail(opts: SendEmailOptions, env?: SendEmailEnvConfig): Promise<boolean>;
