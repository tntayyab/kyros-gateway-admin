import { Repository } from 'typeorm';
import type { AuthType, PlaygroundHistoryRunDetail, PlaygroundHistoryRunSummary } from 'manifest-shared';
import { PlaygroundRun } from '../entities/playground-run.entity';
import { PlaygroundColumn } from '../entities/playground-column.entity';
export interface SaveColumnInput {
    createdByUserId: string | null;
    agent: {
        id: string;
        tenant_id: string;
        name: string;
    };
    runId?: string;
    prompt: string;
    model: string;
    provider: string;
    authType: AuthType | null;
    displayName: string | null;
    position: number;
    status: 'success' | 'error';
    content: string | null;
    headers: Record<string, string> | null;
    errorMessage: string | null;
    metrics: {
        inputTokens: number;
        outputTokens: number;
        cost: number | null;
        durationMs: number;
    } | null;
}
export declare const MAX_RUNS_PER_AGENT = 50;
export declare class PlaygroundHistoryService {
    private readonly runRepo;
    private readonly columnRepo;
    private readonly logger;
    constructor(runRepo: Repository<PlaygroundRun>, columnRepo: Repository<PlaygroundColumn>);
    saveColumn(input: SaveColumnInput): Promise<string | null>;
    private ensureRun;
    listRuns(tenantId: string, agentId: string): Promise<PlaygroundHistoryRunSummary[]>;
    getRun(tenantId: string, runId: string, agentId?: string): Promise<PlaygroundHistoryRunDetail>;
    toggleStar(tenantId: string | null, runId: string): Promise<boolean>;
    setBestColumn(tenantId: string | null, runId: string, columnId: string | null): Promise<string | null>;
    private pruneOldRuns;
}
