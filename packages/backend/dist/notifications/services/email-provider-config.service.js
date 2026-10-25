"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailProviderConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const render_1 = require("@react-email/render");
const crypto_util_1 = require("../../common/utils/crypto.util");
const tenant_cache_service_1 = require("../../common/services/tenant-cache.service");
const email_provider_validation_1 = require("./email-provider-validation");
const resolve_provider_1 = require("./email-providers/resolve-provider");
const test_email_1 = require("../emails/test-email");
let EmailProviderConfigService = class EmailProviderConfigService {
    ds;
    configService;
    tenantCache;
    fromEmail;
    constructor(ds, configService, tenantCache) {
        this.ds = ds;
        this.configService = configService;
        this.tenantCache = tenantCache;
        this.fromEmail = this.configService.get('app.notificationFromEmail', 'noreply@manifest.build');
    }
    decryptKey(stored) {
        if ((0, crypto_util_1.isEncrypted)(stored)) {
            return (0, crypto_util_1.decryptWithAny)(stored, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
        }
        return stored;
    }
    async getConfig(tenantId) {
        if (!tenantId)
            return null;
        const rows = await this.ds.query(`SELECT provider, domain, key_prefix, is_active, notification_email FROM email_provider_configs WHERE tenant_id = $1`, [tenantId]);
        if (!rows.length)
            return null;
        const row = rows[0];
        return {
            provider: row.provider,
            domain: row.domain ?? null,
            keyPrefix: row.key_prefix ?? '****',
            is_active: !!row.is_active,
            notificationEmail: row.notification_email ?? null,
        };
    }
    async upsert(ctx, dto) {
        let tenantId = ctx.tenantId;
        if (!tenantId) {
            if (!ctx.userId)
                throw new common_1.NotFoundException('Tenant not found');
            tenantId = await this.tenantCache.ensureForUser(ctx.userId);
        }
        const notificationEmail = dto.notificationEmail?.trim().toLowerCase() || null;
        const now = new Date().toISOString();
        const existing = await this.ds.query(`SELECT id, api_key_encrypted FROM email_provider_configs WHERE tenant_id = $1`, [tenantId]);
        if (existing.length > 0 && !dto.apiKey) {
            const storedKey = existing[0].api_key_encrypted;
            const plainKey = this.decryptKey(storedKey);
            const validation = (0, email_provider_validation_1.validateProviderConfig)(dto.provider, plainKey, dto.domain);
            if (!validation.valid) {
                throw new common_1.BadRequestException(validation.errors);
            }
            const { domain, provider } = validation.normalized;
            await this.ds.query(`UPDATE email_provider_configs SET provider = $1, domain = $2, is_active = $3, updated_at = $4, notification_email = $5 WHERE tenant_id = $6`, [provider, domain || null, 1, now, notificationEmail, tenantId]);
            return {
                provider,
                domain: domain || null,
                keyPrefix: existing[0].key_prefix ?? plainKey.substring(0, 8),
                is_active: true,
                notificationEmail,
            };
        }
        if (!dto.apiKey) {
            throw new common_1.BadRequestException('API key is required for new configurations');
        }
        const validation = (0, email_provider_validation_1.validateProviderConfig)(dto.provider, dto.apiKey, dto.domain);
        if (!validation.valid) {
            throw new common_1.BadRequestException(validation.errors);
        }
        const { apiKey, domain, provider } = validation.normalized;
        const secret = (0, crypto_util_1.getEncryptionSecret)();
        const encryptedKey = (0, crypto_util_1.encrypt)(apiKey, secret);
        const prefix = apiKey.substring(0, 8);
        if (existing.length > 0) {
            await this.ds.query(`UPDATE email_provider_configs SET provider = $1, api_key_encrypted = $2, key_prefix = $3, domain = $4, is_active = $5, updated_at = $6, notification_email = $7 WHERE tenant_id = $8`, [provider, encryptedKey, prefix, domain || null, 1, now, notificationEmail, tenantId]);
        }
        else {
            await this.ds.query(`INSERT INTO email_provider_configs (id, tenant_id, created_by_user_id, provider, api_key_encrypted, key_prefix, domain, is_active, created_at, updated_at, notification_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [
                (0, uuid_1.v4)(),
                tenantId,
                ctx.userId,
                provider,
                encryptedKey,
                prefix,
                domain || null,
                1,
                now,
                now,
                notificationEmail,
            ]);
        }
        return {
            provider,
            domain: domain || null,
            keyPrefix: prefix,
            is_active: true,
            notificationEmail,
        };
    }
    async remove(tenantId) {
        if (!tenantId)
            return;
        await this.ds.query(`DELETE FROM email_provider_configs WHERE tenant_id = $1`, [tenantId]);
    }
    async getFullConfig(tenantId) {
        if (!tenantId)
            return null;
        const rows = await this.ds.query(`SELECT provider, api_key_encrypted, domain, notification_email FROM email_provider_configs WHERE tenant_id = $1 AND is_active = $2`, [tenantId, 1]);
        if (!rows.length)
            return null;
        const row = rows[0];
        return {
            provider: row.provider,
            apiKey: this.decryptKey(row.api_key_encrypted),
            domain: row.domain ?? null,
            notificationEmail: row.notification_email ?? null,
        };
    }
    async getNotificationEmail(tenantId) {
        if (!tenantId)
            return null;
        const rows = await this.ds.query(`SELECT notification_email FROM email_provider_configs WHERE tenant_id = $1`, [tenantId]);
        return rows[0]?.notification_email ?? null;
    }
    async setNotificationEmail(tenantId, email) {
        const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalized) {
            throw new common_1.BadRequestException('Notification email must be a non-empty string');
        }
        if (!tenantId)
            return;
        const existing = await this.ds.query(`SELECT id FROM email_provider_configs WHERE tenant_id = $1`, [tenantId]);
        const now = new Date().toISOString();
        if (existing.length > 0) {
            await this.ds.query(`UPDATE email_provider_configs SET notification_email = $1, updated_at = $2 WHERE tenant_id = $3`, [normalized, now, tenantId]);
        }
    }
    async testSavedConfig(tenantId, toEmail) {
        const config = await this.getFullConfig(tenantId);
        if (!config) {
            return { success: false, error: 'No email provider configured' };
        }
        return this.testConfig({ provider: config.provider, apiKey: config.apiKey, domain: config.domain ?? undefined }, toEmail);
    }
    async testConfig(dto, toEmail) {
        const validation = (0, email_provider_validation_1.validateProviderConfig)(dto.provider, dto.apiKey, dto.domain);
        if (!validation.valid) {
            return { success: false, error: validation.errors.join(', ') };
        }
        const { provider, apiKey, domain } = validation.normalized;
        try {
            const config = {
                provider: provider,
                apiKey,
                domain: domain || undefined,
            };
            const emailProvider = (0, resolve_provider_1.createProvider)(config);
            const html = await (0, render_1.render)((0, test_email_1.TestEmail)());
            const text = await (0, render_1.render)((0, test_email_1.TestEmail)(), { plainText: true });
            const from = domain ? `Manifest <noreply@${domain}>` : `Manifest <${this.fromEmail}>`;
            const sent = await emailProvider.send({
                to: toEmail,
                subject: 'Manifest — Test Email',
                html,
                text,
                from,
            });
            return sent ? { success: true } : { success: false, error: 'Provider returned failure' };
        }
        catch (err) {
            return { success: false, error: String(err) };
        }
    }
};
exports.EmailProviderConfigService = EmailProviderConfigService;
exports.EmailProviderConfigService = EmailProviderConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        config_1.ConfigService,
        tenant_cache_service_1.TenantCacheService])
], EmailProviderConfigService);
//# sourceMappingURL=email-provider-config.service.js.map