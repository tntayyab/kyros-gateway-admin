import { OnModuleDestroy } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AgentListCacheService } from './agent-list-cache.service';
export type IngestEventKind = 'message' | 'agent' | 'routing';
export interface IngestEvent {
    tenantId: string;
    kind: IngestEventKind;
    userId?: string | null;
}
export declare class IngestEventBusService implements OnModuleDestroy {
    private readonly agentListCache;
    private readonly logger;
    private readonly subject;
    private readonly debounceTimers;
    private readonly DEBOUNCE_MS;
    constructor(agentListCache: AgentListCacheService);
    private publish;
    emit(tenantId: string, kind?: IngestEventKind, userId?: string | null): void;
    forTenant(tenantId: string | null): Observable<IngestEvent>;
    all(): Observable<IngestEvent>;
    onModuleDestroy(): void;
}
