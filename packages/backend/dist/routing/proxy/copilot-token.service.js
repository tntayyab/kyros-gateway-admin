"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CopilotTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotTokenService = void 0;
const common_1 = require("@nestjs/common");
const secret_scrub_1 = require("../../common/utils/secret-scrub");
const TOKEN_ENDPOINT = 'https://api.github.com/copilot_internal/v2/token';
const EXPIRY_BUFFER_MS = 2 * 60 * 1000;
let CopilotTokenService = CopilotTokenService_1 = class CopilotTokenService {
    logger = new common_1.Logger(CopilotTokenService_1.name);
    cache = new Map();
    async getCopilotToken(githubToken) {
        const cached = this.cache.get(githubToken);
        if (cached && Date.now() < cached.expiresAt - EXPIRY_BUFFER_MS) {
            return cached.token;
        }
        this.evictExpired();
        const result = await this.exchange(githubToken);
        this.cache.set(githubToken, result);
        return result.token;
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache) {
            if (now >= entry.expiresAt)
                this.cache.delete(key);
        }
    }
    async exchange(githubToken) {
        const res = await fetch(TOKEN_ENDPOINT, {
            method: 'GET',
            headers: {
                Authorization: `token ${githubToken}`,
                Accept: 'application/json',
            },
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            this.logger.warn(`Copilot token exchange failed: ${res.status} ${(0, secret_scrub_1.scrubSecrets)(body)}`);
            throw new Error(`Copilot token exchange failed: ${res.status}`);
        }
        const data = (await res.json());
        if (!data.token || !data.expires_at) {
            throw new Error('Invalid Copilot token exchange response');
        }
        this.logger.debug(`Copilot token exchanged, expires at ${new Date(data.expires_at * 1000).toISOString()}`);
        return {
            token: data.token,
            expiresAt: data.expires_at * 1000,
        };
    }
};
exports.CopilotTokenService = CopilotTokenService;
exports.CopilotTokenService = CopilotTokenService = CopilotTokenService_1 = __decorate([
    (0, common_1.Injectable)()
], CopilotTokenService);
//# sourceMappingURL=copilot-token.service.js.map