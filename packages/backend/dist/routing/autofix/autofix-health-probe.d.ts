import { type OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class AutofixHealthProbe implements OnApplicationBootstrap {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    onApplicationBootstrap(): void;
    probe(): Promise<void>;
}
