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
exports.InstallIdService = exports.SINGLETON_ID = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const crypto_1 = require("crypto");
const typeorm_2 = require("typeorm");
const install_metadata_entity_1 = require("../entities/install-metadata.entity");
exports.SINGLETON_ID = 'singleton';
let InstallIdService = class InstallIdService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getOrCreate() {
        const existing = await this.repo.findOne({ where: { id: exports.SINGLETON_ID } });
        if (existing)
            return existing;
        await this.repo
            .createQueryBuilder()
            .insert()
            .into(install_metadata_entity_1.InstallMetadata)
            .values({
            id: exports.SINGLETON_ID,
            install_id: (0, crypto_1.randomUUID)(),
            first_send_at: this.computeFirstSendAt(),
            last_sent_at: null,
        })
            .orIgnore()
            .execute();
        const row = await this.repo.findOne({ where: { id: exports.SINGLETON_ID } });
        if (!row)
            throw new Error('install_metadata row missing after upsert');
        return row;
    }
    async markSent(now) {
        await this.repo.update(exports.SINGLETON_ID, { last_sent_at: now.toISOString() });
    }
    computeFirstSendAt() {
        const jitterMs = Math.floor(Math.random() * 24 * 60 * 60 * 1000);
        return new Date(Date.now() + jitterMs).toISOString();
    }
};
exports.InstallIdService = InstallIdService;
exports.InstallIdService = InstallIdService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(install_metadata_entity_1.InstallMetadata)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InstallIdService);
//# sourceMappingURL=install-id.service.js.map