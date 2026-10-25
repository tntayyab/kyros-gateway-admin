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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliAuthService = exports.CODE_TTL_MS = exports.CLI_KEY_NAME = void 0;
exports.deriveCodeChallenge = deriveCodeChallenge;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const api_key_entity_1 = require("../entities/api-key.entity");
const cli_auth_code_entity_1 = require("../entities/cli-auth-code.entity");
const hash_util_1 = require("../common/utils/hash.util");
const postgres_sql_1 = require("../common/utils/postgres-sql");
exports.CLI_KEY_NAME = 'cli';
exports.CODE_TTL_MS = 5 * 60 * 1000;
const PAT_PREFIX = 'mnfst_pat_';
const INVALID_CODE = 'Invalid or expired authorization code';
function sha256Hex(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
function deriveCodeChallenge(codeVerifier) {
    return (0, crypto_1.createHash)('sha256').update(codeVerifier).digest('base64url');
}
function secureEquals(a, b) {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && (0, crypto_1.timingSafeEqual)(ab, bb);
}
let CliAuthService = class CliAuthService {
    codeRepo;
    apiKeyRepo;
    configService;
    dataSource;
    constructor(codeRepo, apiKeyRepo, configService, dataSource) {
        this.codeRepo = codeRepo;
        this.apiKeyRepo = apiKeyRepo;
        this.configService = configService;
        this.dataSource = dataSource;
    }
    async createAuthorization(ctx, state, codeChallenge, codeChallengeMethod = 'S256') {
        if (codeChallengeMethod !== 'S256') {
            throw new common_1.BadRequestException('Unsupported code_challenge_method');
        }
        await this.codeRepo
            .createQueryBuilder()
            .delete()
            .where('expires_at < :now', { now: (0, postgres_sql_1.toLocalSqlTimestamp)() })
            .execute();
        const code = (0, crypto_1.randomBytes)(32).toString('base64url');
        await this.codeRepo.insert({
            id: (0, crypto_1.randomUUID)(),
            code_hash: sha256Hex(code),
            state,
            code_challenge: codeChallenge,
            code_challenge_method: codeChallengeMethod,
            tenant_id: ctx.tenantId,
            user_id: ctx.userId,
            expires_at: (0, postgres_sql_1.toLocalSqlTimestamp)(new Date(Date.now() + exports.CODE_TTL_MS)),
        });
        return { code };
    }
    async exchange(code, state, codeVerifier) {
        const row = await this.codeRepo.findOne({ where: { code_hash: sha256Hex(code) } });
        if (!row || row.state !== state)
            throw new common_1.BadRequestException(INVALID_CODE);
        if (new Date(row.expires_at).getTime() <= Date.now()) {
            throw new common_1.BadRequestException(INVALID_CODE);
        }
        if (!row.code_challenge || row.code_challenge_method !== 'S256') {
            throw new common_1.BadRequestException(INVALID_CODE);
        }
        if (!secureEquals(deriveCodeChallenge(codeVerifier), row.code_challenge)) {
            throw new common_1.BadRequestException(INVALID_CODE);
        }
        const ttlDays = this.configService.get('app.cliTokenTtlDays', 30);
        const absoluteDays = this.configService.get('app.cliTokenAbsoluteTtlDays', 90);
        const token = PAT_PREFIX + (0, crypto_1.randomBytes)(32).toString('base64url');
        const slidingDate = new Date(Date.now() + ttlDays * 86_400_000);
        const absoluteDate = new Date(Date.now() + absoluteDays * 86_400_000);
        const expiresDate = absoluteDate < slidingDate ? absoluteDate : slidingDate;
        await this.dataSource.transaction(async (manager) => {
            const deleted = await manager.delete(cli_auth_code_entity_1.CliAuthCode, { id: row.id });
            if (!deleted.affected)
                throw new common_1.BadRequestException(INVALID_CODE);
            await manager.insert(api_key_entity_1.ApiKey, {
                id: (0, crypto_1.randomUUID)(),
                key: null,
                key_hash: (0, hash_util_1.hashKey)(token),
                key_prefix: (0, hash_util_1.keyPrefix)(token),
                tenant_id: row.tenant_id,
                created_by_user_id: row.user_id,
                name: exports.CLI_KEY_NAME,
                expires_at: (0, postgres_sql_1.toLocalSqlTimestamp)(expiresDate),
                absolute_expires_at: (0, postgres_sql_1.toLocalSqlTimestamp)(absoluteDate),
            });
        });
        return { token, expiresAt: expiresDate.toISOString() };
    }
    async revokeByRawKey(rawKey) {
        const candidates = await this.apiKeyRepo.find({
            where: { key_prefix: (0, hash_util_1.keyPrefix)(rawKey), name: exports.CLI_KEY_NAME },
        });
        const found = candidates.find((c) => (0, hash_util_1.verifyKey)(rawKey, c.key_hash));
        if (!found)
            return { revoked: false };
        await this.apiKeyRepo.delete({ id: found.id });
        return { revoked: true };
    }
};
exports.CliAuthService = CliAuthService;
exports.CliAuthService = CliAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cli_auth_code_entity_1.CliAuthCode)),
    __param(1, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        typeorm_2.DataSource])
], CliAuthService);
//# sourceMappingURL=cli-auth.service.js.map