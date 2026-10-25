import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
export interface SeenHeader {
    key: string;
    count: number;
    top_values: string[];
    sdks: string[];
}
export declare class SeenHeadersService {
    private readonly messageRepo;
    private readonly cache;
    constructor(messageRepo: Repository<AgentMessage>);
    getSeenHeaders(tenantId: string, agentName?: string): Promise<SeenHeader[]>;
    private putCache;
}
