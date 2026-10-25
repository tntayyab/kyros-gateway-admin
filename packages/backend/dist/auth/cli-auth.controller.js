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
exports.CliAuthController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const tenant_context_decorator_1 = require("../common/decorators/tenant-context.decorator");
const cli_auth_service_1 = require("./cli-auth.service");
const STATE_MESSAGE = 'state must be 16-128 URL-safe characters (letters, numbers, dashes, underscores)';
const PKCE_MESSAGE = 'must be 43-128 URL-safe characters (letters, numbers, dashes, underscores)';
class AuthorizeDto {
    state;
    code_challenge;
    code_challenge_method;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_-]{16,128}$/, { message: STATE_MESSAGE }),
    __metadata("design:type", String)
], AuthorizeDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_-]{43}$/, {
        message: 'code_challenge must be exactly 43 URL-safe characters (S256 output)',
    }),
    __metadata("design:type", String)
], AuthorizeDto.prototype, "code_challenge", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['S256'], { message: 'code_challenge_method must be S256' }),
    __metadata("design:type", String)
], AuthorizeDto.prototype, "code_challenge_method", void 0);
class ExchangeDto {
    code;
    state;
    code_verifier;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_-]{20,100}$/, {
        message: 'code must be 20-100 URL-safe characters (letters, numbers, dashes, underscores)',
    }),
    __metadata("design:type", String)
], ExchangeDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_-]{16,128}$/, { message: STATE_MESSAGE }),
    __metadata("design:type", String)
], ExchangeDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9_-]{43,128}$/, { message: `code_verifier ${PKCE_MESSAGE}` }),
    __metadata("design:type", String)
], ExchangeDto.prototype, "code_verifier", void 0);
let CliAuthController = class CliAuthController {
    cliAuth;
    constructor(cliAuth) {
        this.cliAuth = cliAuth;
    }
    async authorize(dto, ctx, request) {
        const authMethod = request.authMethod;
        if (authMethod !== 'session') {
            throw new common_1.ForbiddenException('CLI authorization requires a browser session');
        }
        if (!ctx.tenantId) {
            throw new common_1.ForbiddenException('No workspace yet — create your first agent in the dashboard');
        }
        return this.cliAuth.createAuthorization(ctx, dto.state, dto.code_challenge, dto.code_challenge_method ?? 'S256');
    }
    async token(dto) {
        return this.cliAuth.exchange(dto.code, dto.state, dto.code_verifier);
    }
    async revoke(request) {
        const raw = request.headers['x-api-key'];
        if (typeof raw !== 'string' || raw.length === 0)
            return { revoked: false };
        return this.cliAuth.revokeByRawKey(raw);
    }
};
exports.CliAuthController = CliAuthController;
__decorate([
    (0, common_1.Post)('authorize'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AuthorizeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], CliAuthController.prototype, "authorize", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('token'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ExchangeDto]),
    __metadata("design:returntype", Promise)
], CliAuthController.prototype, "token", null);
__decorate([
    (0, common_1.Delete)('token'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CliAuthController.prototype, "revoke", null);
exports.CliAuthController = CliAuthController = __decorate([
    (0, common_1.Controller)('api/v1/cli'),
    __metadata("design:paramtypes", [cli_auth_service_1.CliAuthService])
], CliAuthController);
//# sourceMappingURL=cli-auth.controller.js.map