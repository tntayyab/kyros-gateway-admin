import { Request } from 'express';
export interface TenantContext {
    tenantId: string | null;
    userId: string | null;
}
export type RequestWithTenantContext = Request & {
    tenantContext?: TenantContext;
};
export declare const TenantCtx: (...dataOrPipes: unknown[]) => ParameterDecorator;
