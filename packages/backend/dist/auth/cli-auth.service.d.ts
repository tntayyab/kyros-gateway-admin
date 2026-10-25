import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { ApiKey } from '../entities/api-key.entity';
import { CliAuthCode } from '../entities/cli-auth-code.entity';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
export declare const CLI_KEY_NAME = "cli";
export declare const CODE_TTL_MS: number;
export declare function deriveCodeChallenge(codeVerifier: string): string;
export declare class CliAuthService {
    private readonly codeRepo;
    private readonly apiKeyRepo;
    private readonly configService;
    private readonly dataSource;
    constructor(codeRepo: Repository<CliAuthCode>, apiKeyRepo: Repository<ApiKey>, configService: ConfigService, dataSource: DataSource);
    createAuthorization(ctx: TenantContext, state: string, codeChallenge: string, codeChallengeMethod?: string): Promise<{
        code: string;
    }>;
    exchange(code: string, state: string, codeVerifier: string): Promise<{
        token: string;
        expiresAt: string;
    }>;
    revokeByRawKey(rawKey: string): Promise<{
        revoked: boolean;
    }>;
}
