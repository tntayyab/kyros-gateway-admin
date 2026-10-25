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
exports.ServicesContactController = exports.SERVICES_CONTACT_URL = void 0;
const common_1 = require("@nestjs/common");
const detect_self_hosted_1 = require("../common/utils/detect-self-hosted");
const services_contact_dto_1 = require("./dto/services-contact.dto");
exports.SERVICES_CONTACT_URL = 'https://manifest.build/api/contact/';
let ServicesContactController = class ServicesContactController {
    async contact(dto) {
        const source = (0, detect_self_hosted_1.isSelfHosted)() ? 'dashboard-self-hosted' : 'dashboard-cloud';
        let res;
        try {
            res = await fetch(exports.SERVICES_CONTACT_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ ...dto, source }),
                signal: AbortSignal.timeout(10_000),
            });
        }
        catch {
            throw new common_1.BadGatewayException('manifest.build is unreachable');
        }
        if (!res.ok)
            throw new common_1.BadGatewayException('manifest.build did not send the email');
        return { ok: true };
    }
};
exports.ServicesContactController = ServicesContactController;
__decorate([
    (0, common_1.Post)('contact'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [services_contact_dto_1.ServicesContactDto]),
    __metadata("design:returntype", Promise)
], ServicesContactController.prototype, "contact", null);
exports.ServicesContactController = ServicesContactController = __decorate([
    (0, common_1.Controller)('api/v1/services')
], ServicesContactController);
//# sourceMappingURL=services-contact.controller.js.map