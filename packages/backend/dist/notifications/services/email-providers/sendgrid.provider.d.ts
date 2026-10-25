import { EmailProvider, EmailProviderConfig, SendEmailOptions } from './email-provider.interface';
export declare class SendGridProvider implements EmailProvider {
    readonly name = "sendgrid";
    private readonly apiKey;
    private readonly defaultFrom;
    constructor(config: EmailProviderConfig);
    send(opts: SendEmailOptions): Promise<boolean>;
    private parseFromEmail;
}
