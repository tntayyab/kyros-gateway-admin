import { BeforeApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class ShutdownService implements BeforeApplicationShutdown {
    private readonly config;
    private readonly logger;
    private shuttingDown;
    constructor(config: ConfigService);
    isShuttingDown(): boolean;
    beforeApplicationShutdown(signal?: string): Promise<void>;
}
