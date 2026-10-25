import { EmailProvider, EmailProviderConfig, SendEmailOptions } from './email-provider.interface';
export declare class MailgunProvider implements EmailProvider {
    readonly name = "mailgun";
    private readonly apiKey;
    private readonly domain;
    private readonly defaultFrom;
    constructor(config: EmailProviderConfig);
    send(opts: SendEmailOptions): Promise<boolean>;
}
