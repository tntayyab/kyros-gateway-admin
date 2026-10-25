import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { SeenHeadersService } from './seen-headers.service';
export declare class SeenHeadersController {
    private readonly seenHeaders;
    constructor(seenHeaders: SeenHeadersService);
    list(ctx: TenantContext, agentName: string, scope?: string): Promise<import("./seen-headers.service").SeenHeader[]>;
}
