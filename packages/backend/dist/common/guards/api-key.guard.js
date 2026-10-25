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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ApiKeyGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const api_key_entity_1 = require("../../entities/api-key.entity");
const public_decorator_1 = require("../decorators/public.decorator");
const hash_util_1 = require("../utils/hash.util");
const postgres_sql_1 = require("../utils/postgres-sql");
let ApiKeyGuard = ApiKeyGuard_1 = class ApiKeyGuard {
    reflector;
    configService;
    apiKeyRepo;
    logger = new common_1.Logger(ApiKeyGuard_1.name);
    constructor(reflector, configService, apiKeyRepo) {
        this.reflector = reflector;
        this.configService = configService;
        this.apiKeyRepo = apiKeyRepo;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = context.switchToHttp().getRequest();
        if (request.authMethod === 'session')
            return true;
        const apiKey = request.headers['x-api-key'];
        if (!apiKey || typeof apiKey !== 'string') {
            this.logger.warn(`Rejected request without API key from ${request.ip}`);
            throw new common_1.UnauthorizedException('X-API-Key header required');
        }
        const prefix = (0, hash_util_1.keyPrefix)(apiKey);
        const candidates = await this.apiKeyRepo.find({ where: { key_prefix: prefix } });
        const found = candidates.find((c) => (0, hash_util_1.verifyKey)(apiKey, c.key_hash));
        if (found) {
            const now = Date.now();
            const absoluteExpiryAt = found.absolute_expires_at
                ? new Date(found.absolute_expires_at).getTime()
                : null;
            const expired = (found.expires_at && new Date(found.expires_at).getTime() <= now) ||
                (absoluteExpiryAt !== null && absoluteExpiryAt <= now);
            if (expired) {
                this.logger.warn(`Rejected expired API key from ${request.ip}`);
                throw new common_1.UnauthorizedException('API key expired — run mnfst login');
            }
            request.tenantContext = {
                tenantId: found.tenant_id,
                userId: found.created_by_user_id,
            };
            if (found.created_by_user_id) {
                request.user = {
                    id: String(found.created_by_user_id),
                };
            }
            request.authMethod = 'api_key';
            const ttlDays = this.configService.get('app.cliTokenTtlDays', 30);
            const slidExpiryAt = now + ttlDays * 86_400_000;
            const nextExpiryAt = absoluteExpiryAt !== null && absoluteExpiryAt < slidExpiryAt
                ? absoluteExpiryAt
                : slidExpiryAt;
            request.apiKeyExpiresAt = found.expires_at
                ? new Date(nextExpiryAt).toISOString()
                : null;
            this.apiKeyRepo
                .createQueryBuilder()
                .update(api_key_entity_1.ApiKey)
                .set(found.expires_at
                ? {
                    last_used_at: () => 'CURRENT_TIMESTAMP',
                    expires_at: (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(nextExpiryAt)),
                }
                : { last_used_at: () => 'CURRENT_TIMESTAMP' })
                .where('id = :id', { id: found.id })
                .execute()
                .catch((err) => this.logger.warn(`Failed to update last_used_at/expires_at: ${err.message}`));
            return true;
        }
        const validKey = this.configService.get('app.apiKey', '');
        if (validKey && this.safeCompare(apiKey, validKey)) {
            request.authMethod = 'env_api_key';
            return true;
        }
        this.logger.warn(`Rejected invalid API key from ${request.ip}`);
        throw new common_1.UnauthorizedException('Invalid API key');
    }
    safeCompare(a, b) {
        const aBuf = Buffer.from(a, 'utf8');
        const bBuf = Buffer.from(b, 'utf8');
        if (aBuf.length !== bBuf.length)
            return false;
        return (0, crypto_1.timingSafeEqual)(aBuf, bBuf);
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = ApiKeyGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [core_1.Reflector,
        config_1.ConfigService,
        typeorm_2.Repository])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map