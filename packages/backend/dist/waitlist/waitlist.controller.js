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
exports.WaitlistController = void 0;
exports.claimRequestIsSameOrigin = claimRequestIsSameOrigin;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const public_decorator_1 = require("../common/decorators/public.decorator");
const waitlist_claim_entity_1 = require("../entities/waitlist-claim.entity");
const pivot_claim_dto_1 = require("./dto/pivot-claim.dto");
function claimRequestIsSameOrigin(headers) {
    const origin = headers.origin;
    const host = headers.host;
    if (typeof origin !== 'string' || typeof host !== 'string')
        return false;
    try {
        return new URL(origin).host === host;
    }
    catch {
        return false;
    }
}
let WaitlistController = class WaitlistController {
    claimRepo;
    constructor(claimRepo) {
        this.claimRepo = claimRepo;
    }
    receiveClaim() {
        return { ok: true };
    }
    async receivePivotClaim(dto, req) {
        const source = dto.source ?? (claimRequestIsSameOrigin(req.headers) ? 'cloud' : pivot_claim_dto_1.DEFAULT_PIVOT_CLAIM_SOURCE);
        await this.claimRepo
            .createQueryBuilder()
            .insert()
            .into(waitlist_claim_entity_1.WaitlistClaim)
            .values({
            email: dto.email.trim().toLowerCase(),
            source,
            claimed_at: new Date().toISOString(),
        })
            .orUpdate(['source', 'claimed_at'], ['email'], {
            overwriteCondition: {
                where: '"waitlist_claims"."source" != :websiteSource',
                parameters: { websiteSource: 'website' },
            },
        })
            .execute();
        return { ok: true };
    }
};
exports.WaitlistController = WaitlistController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('autofix/claim'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], WaitlistController.prototype, "receiveClaim", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('pivot/claim'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pivot_claim_dto_1.PivotClaimDto, Object]),
    __metadata("design:returntype", Promise)
], WaitlistController.prototype, "receivePivotClaim", null);
exports.WaitlistController = WaitlistController = __decorate([
    (0, common_1.Controller)('api/v1/waitlist'),
    __param(0, (0, typeorm_1.InjectRepository)(waitlist_claim_entity_1.WaitlistClaim)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WaitlistController);
//# sourceMappingURL=waitlist.controller.js.map