import { Request } from 'express';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { CliAuthService } from './cli-auth.service';
declare class AuthorizeDto {
    state: string;
    code_challenge: string;
    code_challenge_method?: 'S256';
}
declare class ExchangeDto {
    code: string;
    state: string;
    code_verifier: string;
}
export declare class CliAuthController {
    private readonly cliAuth;
    constructor(cliAuth: CliAuthService);
    authorize(dto: AuthorizeDto, ctx: TenantContext, request: Request): Promise<{
        code: string;
    }>;
    token(dto: ExchangeDto): Promise<{
        token: string;
        expiresAt: string;
    }>;
    revoke(request: Request): Promise<{
        revoked: boolean;
    }>;
}
export {};
