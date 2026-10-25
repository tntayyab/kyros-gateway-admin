import type { Response as ExpressResponse } from 'express';
import type { PlaygroundHistoryRunDetail, PlaygroundHistoryRunSummary } from 'manifest-shared';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { PlaygroundService } from './playground.service';
import { PlaygroundHistoryService } from './playground-history.service';
import { PlaygroundAgentService } from './playground-agent.service';
import { RunPlaygroundDto } from './dto/run-playground.dto';
import { RunIdParamDto, SetBestColumnDto } from './dto/history.dto';
export declare class PlaygroundController {
    private readonly playgroundService;
    private readonly historyService;
    private readonly playgroundAgent;
    constructor(playgroundService: PlaygroundService, historyService: PlaygroundHistoryService, playgroundAgent: PlaygroundAgentService);
    getAgent(ctx: TenantContext): Promise<{
        name: string;
    }>;
    run(ctx: TenantContext, body: RunPlaygroundDto, res: ExpressResponse): Promise<void>;
    listRuns(ctx: TenantContext): Promise<PlaygroundHistoryRunSummary[]>;
    getRun(ctx: TenantContext, params: RunIdParamDto): Promise<PlaygroundHistoryRunDetail>;
    toggleStar(ctx: TenantContext, params: RunIdParamDto): Promise<{
        starred: boolean;
    }>;
    setBest(ctx: TenantContext, params: RunIdParamDto, body: SetBestColumnDto): Promise<{
        bestColumnId: string | null;
    }>;
}
