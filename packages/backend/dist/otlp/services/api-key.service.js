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
exports.ApiKeyGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const tenant_entity_1 = require("../../entities/tenant.entity");
const agent_entity_1 = require("../../entities/agent.entity");
const agent_api_key_entity_1 = require("../../entities/agent-api-key.entity");
const hash_util_1 = require("../../common/utils/hash.util");
const crypto_util_1 = require("../../common/utils/crypto.util");
const api_key_constants_1 = require("../../common/constants/api-key.constants");
const agent_key_auth_guard_1 = require("../guards/agent-key-auth.guard");
let ApiKeyGeneratorService = class ApiKeyGeneratorService {
    tenantRepo;
    agentRepo;
    keyRepo;
    otlpAuthGuard;
    constructor(tenantRepo, agentRepo, keyRepo, otlpAuthGuard) {
        this.tenantRepo = tenantRepo;
        this.agentRepo = agentRepo;
        this.keyRepo = keyRepo;
        this.otlpAuthGuard = otlpAuthGuard;
    }
    generateKey() {
        return api_key_constants_1.API_KEY_PREFIX + (0, crypto_1.randomBytes)(32).toString('base64url');
    }
    async onboardAgent(params) {
        let tenantId;
        if (params.tenantId) {
            tenantId = params.tenantId;
        }
        else if (params.ownerUserId) {
            const existing = await this.tenantRepo.findOne({
                where: { owner_user_id: params.ownerUserId },
            });
            if (existing) {
                tenantId = existing.id;
            }
            else {
                tenantId = (0, uuid_1.v4)();
                await this.tenantRepo.insert({
                    id: tenantId,
                    name: params.ownerUserId,
                    owner_user_id: params.ownerUserId,
                    organization_name: params.organizationName ?? null,
                    email: params.email ?? null,
                    is_active: true,
                });
            }
        }
        else {
            throw new common_1.NotFoundException('No tenant available for agent onboarding');
        }
        const agentId = (0, uuid_1.v4)();
        await this.agentRepo.insert({
            id: agentId,
            name: params.agentName,
            display_name: params.displayName ?? null,
            description: params.agentDescription ?? null,
            agent_category: params.agentCategory ?? null,
            agent_platform: params.agentPlatform ?? null,
            ...(params.autofixEnabled !== undefined ? { autofix_enabled: params.autofixEnabled } : {}),
            ...(params.recordMessages !== undefined ? { record_messages: params.recordMessages } : {}),
            is_active: true,
            tenant_id: tenantId,
        });
        const rawKey = this.generateKey();
        const keyId = (0, uuid_1.v4)();
        await this.keyRepo.insert({
            id: keyId,
            key: (0, crypto_util_1.encrypt)(rawKey, (0, crypto_util_1.getEncryptionSecret)()),
            key_hash: (0, hash_util_1.hashKey)(rawKey),
            key_prefix: (0, hash_util_1.keyPrefix)(rawKey),
            label: `${params.agentName} ingest key`,
            tenant_id: tenantId,
            agent_id: agentId,
            is_active: true,
        });
        return { tenantId, agentId, apiKey: rawKey };
    }
    async getKeyForAgent(tenantId, agentName) {
        const keyRecord = await this.keyRepo
            .createQueryBuilder('k')
            .leftJoin('k.agent', 'a')
            .where('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.name = :agentName', { agentName })
            .andWhere('a.deleted_at IS NULL')
            .andWhere('k.is_active = true')
            .getOne();
        if (!keyRecord) {
            throw new common_1.NotFoundException('No active API key found for this agent');
        }
        if (keyRecord.key) {
            try {
                const fullKey = (0, crypto_util_1.decryptWithAny)(keyRecord.key, (0, crypto_util_1.getDecryptionSecrets)()).plaintext;
                return { keyPrefix: keyRecord.key_prefix, fullKey };
            }
            catch {
                return { keyPrefix: keyRecord.key_prefix };
            }
        }
        return { keyPrefix: keyRecord.key_prefix };
    }
    async rotateKey(tenantId, agentName) {
        const agent = await this.agentRepo
            .createQueryBuilder('a')
            .where('a.name = :agentName', { agentName })
            .andWhere('a.tenant_id = :tenantId', { tenantId })
            .andWhere('a.deleted_at IS NULL')
            .getOne();
        if (!agent)
            throw new common_1.NotFoundException('Agent not found or access denied');
        await this.keyRepo.delete({ agent_id: agent.id });
        this.otlpAuthGuard.clearCache();
        const rawKey = this.generateKey();
        const keyId = (0, uuid_1.v4)();
        await this.keyRepo.insert({
            id: keyId,
            key: (0, crypto_util_1.encrypt)(rawKey, (0, crypto_util_1.getEncryptionSecret)()),
            key_hash: (0, hash_util_1.hashKey)(rawKey),
            key_prefix: (0, hash_util_1.keyPrefix)(rawKey),
            label: `${agent.name} ingest key (rotated)`,
            tenant_id: agent.tenant_id,
            agent_id: agent.id,
            is_active: true,
        });
        return { apiKey: rawKey };
    }
};
exports.ApiKeyGeneratorService = ApiKeyGeneratorService;
exports.ApiKeyGeneratorService = ApiKeyGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_entity_1.Agent)),
    __param(2, (0, typeorm_1.InjectRepository)(agent_api_key_entity_1.AgentApiKey)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        agent_key_auth_guard_1.AgentKeyAuthGuard])
], ApiKeyGeneratorService);
//# sourceMappingURL=api-key.service.js.map