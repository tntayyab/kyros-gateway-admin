import { CompleteDiscoveryDto } from './dto/complete-discovery.dto';
import { DiscoverySyncService } from './discovery-sync.service';
export declare class DiscoveryController {
    private readonly discoverySync;
    constructor(discoverySync: DiscoverySyncService);
    complete(submission: CompleteDiscoveryDto): {
        ok: true;
    };
}
