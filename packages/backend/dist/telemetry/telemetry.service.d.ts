import { OnModuleInit } from '@nestjs/common';
import { InstallIdService } from './install-id.service';
import { PayloadBuilderService } from './payload-builder.service';
export declare class TelemetryService implements OnModuleInit {
    private readonly installIds;
    private readonly payloadBuilder;
    private readonly logger;
    private readonly config;
    constructor(installIds: InstallIdService, payloadBuilder: PayloadBuilderService);
    onModuleInit(): Promise<void>;
    tick(now?: Date): Promise<void>;
    private shouldSend;
    private postPayload;
}
