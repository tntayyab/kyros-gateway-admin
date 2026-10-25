import { EmailProvider, EmailProviderConfig, SendEmailOptions } from './email-provider.interface';
export declare class ResendProvider implements EmailProvider {
    readonly name = "resend";
    private readonly apiKey;
    private readonly defaultFrom;
    constructor(config: EmailProviderConfig);
    send(opts: SendEmailOptions): Promise<boolean>;
}
