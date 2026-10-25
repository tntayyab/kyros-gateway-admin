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
exports.SeenHeadersController = void 0;
const common_1 = require("@nestjs/common");
const tenant_context_decorator_1 = require("../../common/decorators/tenant-context.decorator");
const seen_headers_service_1 = require("./seen-headers.service");
let SeenHeadersController = class SeenHeadersController {
    seenHeaders;
    constructor(seenHeaders) {
        this.seenHeaders = seenHeaders;
    }
    async list(ctx, agentName, scope) {
        if (!ctx.tenantId)
            return [];
        const agentFilter = scope === 'all' ? undefined : agentName;
        return this.seenHeaders.getSeenHeaders(ctx.tenantId, agentFilter);
    }
};
exports.SeenHeadersController = SeenHeadersController;
__decorate([
    (0, common_1.Get)(':agentName/seen-headers'),
    __param(0, (0, tenant_context_decorator_1.TenantCtx)()),
    __param(1, (0, common_1.Param)('agentName')),
    __param(2, (0, common_1.Query)('scope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SeenHeadersController.prototype, "list", null);
exports.SeenHeadersController = SeenHeadersController = __decorate([
    (0, common_1.Controller)('api/v1/routing'),
    __metadata("design:paramtypes", [seen_headers_service_1.SeenHeadersService])
], SeenHeadersController);
//# sourceMappingURL=seen-headers.controller.js.map