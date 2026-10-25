import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ApiKey } from '../../entities/api-key.entity';
export declare class ApiKeyGuard implements CanActivate {
    private readonly reflector;
    private readonly configService;
    private readonly apiKeyRepo;
    private readonly logger;
    constructor(reflector: Reflector, configService: ConfigService, apiKeyRepo: Repository<ApiKey>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private safeCompare;
}
