import { CompleteDiscoveryDto } from './dto/complete-discovery.dto';
export declare class DiscoverySyncService {
    private readonly logger;
    submit(submission: CompleteDiscoveryDto): Promise<void>;
}
