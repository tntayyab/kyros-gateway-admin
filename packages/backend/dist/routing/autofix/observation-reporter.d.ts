import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AutofixService } from './autofix.service';
import { type HealingClient } from './healing-client';
import { type ObservationInput } from './observation-payload';
export declare class ObservationReporter implements OnModuleDestroy {
    private readonly client;
    private readonly autofix;
    private readonly logger;
    private readonly enabled;
    private queue;
    private readonly inFlight;
    private timer;
    private dropped;
    constructor(client: HealingClient, autofix: AutofixService, config: ConfigService);
    report(input: ObservationInput): void;
    private countDrop;
    private gateAndEnqueue;
    private enqueue;
    private scheduleFlush;
    flush(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
