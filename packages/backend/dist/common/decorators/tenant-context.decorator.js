"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantCtx = void 0;
const common_1 = require("@nestjs/common");
exports.TenantCtx = (0, common_1.createParamDecorator)((_data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.tenantContext) {
        throw new common_1.UnauthorizedException('This endpoint requires a tenant-scoped credential (session cookie or API key).');
    }
    return request.tenantContext;
});
//# sourceMappingURL=tenant-context.decorator.js.map