import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
export declare class DbTuningService implements OnApplicationBootstrap {
    private readonly dataSource;
    private readonly config;
    private readonly logger;
    static readonly SETTINGS: ReadonlyArray<{
        param: string;
        value: string;
    }>;
    constructor(dataSource: DataSource, config: ConfigService);
    onApplicationBootstrap(): Promise<void>;
    apply(): Promise<void>;
}
