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
var SetupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ollama_1 = require("../common/constants/ollama");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const send_email_1 = require("../notifications/services/email-providers/send-email");
const mcp_availability_1 = require("../auth/mcp-availability");
const SETUP_ADVISORY_LOCK_KEY = 9001;
let SetupService = SetupService_1 = class SetupService {
    dataSource;
    logger = new common_1.Logger(SetupService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    isSelfHosted() {
        return (0, detect_self_hosted_1.isSelfHosted)();
    }
    getLocalLlmHost() {
        return (0, detect_self_hosted_1.getContainerHostAlias)();
    }
    getEnabledSocialProviders() {
        const providers = [];
        if (process.env['GOOGLE_CLIENT_ID'] && process.env['GOOGLE_CLIENT_SECRET'])
            providers.push('google');
        if (process.env['GITHUB_CLIENT_ID'] && process.env['GITHUB_CLIENT_SECRET'])
            providers.push('github');
        if (process.env['DISCORD_CLIENT_ID'] && process.env['DISCORD_CLIENT_SECRET'])
            providers.push('discord');
        return providers;
    }
    isEmailConfigured() {
        return (0, send_email_1.isEmailConfigured)();
    }
    isMcpEnabled() {
        return (0, mcp_availability_1.mcpAvailability)().enabled;
    }
    async isOllamaAvailable() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            const res = await fetch(`${ollama_1.OLLAMA_HOST}/api/tags`, { signal: controller.signal });
            clearTimeout(timeout);
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async needsSetup() {
        const rows = await this.dataSource.query(`SELECT COUNT(*) AS count FROM "user"`);
        const count = Number(rows[0]?.count ?? 0);
        return count === 0;
    }
    async createFirstAdmin(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            await queryRunner.query(`SELECT pg_advisory_lock($1)`, [SETUP_ADVISORY_LOCK_KEY]);
            try {
                const rows = (await queryRunner.query(`SELECT COUNT(*) AS count FROM "user"`));
                const count = Number(rows[0]?.count ?? 0);
                if (count > 0) {
                    if (count === 1) {
                        const unverified = (await queryRunner.query(`SELECT email FROM "user" WHERE "emailVerified" = false AND email = $1`, [dto.email]));
                        if (unverified.length === 1) {
                            await queryRunner.query(`UPDATE "user" SET "emailVerified" = true WHERE email = $1`, [
                                dto.email,
                            ]);
                            this.logger.log(`First-run setup recovery — completed verification for ${dto.email}`);
                            return;
                        }
                    }
                    throw new common_1.ConflictException('Setup already completed — an admin user exists');
                }
                const { auth } = require('../auth/auth.instance');
                await auth.api.signUpEmail({
                    body: {
                        email: dto.email,
                        password: dto.password,
                        name: dto.name,
                    },
                });
                await queryRunner.query(`UPDATE "user" SET "emailVerified" = true WHERE email = $1`, [
                    dto.email,
                ]);
                this.logger.log(`First-run setup complete — admin user created: ${dto.email}`);
            }
            finally {
                await queryRunner.query(`SELECT pg_advisory_unlock($1)`, [SETUP_ADVISORY_LOCK_KEY]);
            }
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.SetupService = SetupService;
exports.SetupService = SetupService = SetupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SetupService);
//# sourceMappingURL=setup.service.js.map