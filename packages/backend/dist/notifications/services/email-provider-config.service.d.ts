import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { TenantCacheService } from '../../common/services/tenant-cache.service';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
export interface EmailProviderPublicConfig {
    provider: string;
    domain: string | null;
    keyPrefix: string;
    is_active: boolean;
    notificationEmail: string | null;
}
export interface EmailProviderFullConfig {
    provider: string;
    apiKey: string;
    domain: string | null;
    notificationEmail: string | null;
}
export declare class EmailProviderConfigService {
    private readonly ds;
    private readonly configService;
    private readonly tenantCache;
    private readonly fromEmail;
    constructor(ds: DataSource, configService: ConfigService, tenantCache: TenantCacheService);
    private decryptKey;
    getConfig(tenantId: string | null): Promise<EmailProviderPublicConfig | null>;
    upsert(ctx: TenantContext, dto: {
        provider: string;
        apiKey?: string;
        domain?: string;
        notificationEmail?: string;
    }): Promise<EmailProviderPublicConfig>;
    remove(tenantId: string | null): Promise<void>;
    getFullConfig(tenantId: string | null): Promise<EmailProviderFullConfig | null>;
    getNotificationEmail(tenantId: string | null): Promise<string | null>;
    setNotificationEmail(tenantId: string | null, email: string): Promise<void>;
    testSavedConfig(tenantId: string | null, toEmail: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    testConfig(dto: {
        provider: string;
        apiKey: string;
        domain?: string;
    }, toEmail: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
