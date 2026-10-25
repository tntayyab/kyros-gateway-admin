import { Repository } from 'typeorm';
import { AgentMessage } from '../entities/agent-message.entity';
export interface DiscoveredCluster {
    cluster_key: string;
    provider: string;
    http_status: number | null;
    category: string;
    category_label: string;
    suggested_slug: string;
    tenants: number;
    volume_7d: number;
    volume_30d: number;
    recovery_rate: number | null;
    first_seen: string | null;
    last_seen: string | null;
    sample_message: string;
    variants: string[];
    trend: {
        date: string;
        count: number;
    }[];
}
export declare class ErrorDiscoveryService {
    private readonly repo;
    constructor(repo: Repository<AgentMessage>);
    discover(): Promise<DiscoveredCluster[]>;
}
