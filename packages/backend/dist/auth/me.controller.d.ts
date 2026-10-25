import { Request } from 'express';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
export declare class MeController {
    me(ctx: TenantContext, request: Request): {
        tenantId: string | null;
        userId: string | null;
        authMethod: string | null;
        expiresAt: string | null;
    };
}
