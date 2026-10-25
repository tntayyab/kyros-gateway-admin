import { Observable } from 'rxjs';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { IngestEventBusService } from '../common/services/ingest-event-bus.service';
interface MessageEvent {
    data: string;
    type: string;
}
export declare class SseController {
    private readonly eventBus;
    constructor(eventBus: IngestEventBusService);
    events(ctx: TenantContext): Observable<MessageEvent>;
}
export {};
