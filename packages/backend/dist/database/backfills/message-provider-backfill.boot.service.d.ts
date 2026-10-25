import { OnApplicationBootstrap } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BackfillState } from '../../entities/backfill-state.entity';
import { BackfillOptions, BackfillResult } from './backfill-message-providers';
export declare const MESSAGE_PROVIDER_BACKFILL_NAME = "agent_message_provider_attribution";
export declare const MESSAGE_PROVIDER_BACKFILL_LOCK_KEY = 1792000000;
export type BackfillRunner = (dataSource: DataSource, options: BackfillOptions) => Promise<BackfillResult>;
export declare class MessageProviderBackfillBootService implements OnApplicationBootstrap {
    private readonly dataSource;
    private readonly stateRepo;
    private readonly logger;
    constructor(dataSource: DataSource, stateRepo: Repository<BackfillState>);
    onApplicationBootstrap(): void;
    runUntilComplete(): Promise<void>;
    runOnce(runner?: BackfillRunner): Promise<boolean>;
    private isCompleted;
    private markCompleted;
}
