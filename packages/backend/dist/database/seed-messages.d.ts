import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AgentMessage } from '../entities/agent-message.entity';
import { ManifestRequest } from '../entities/request.entity';
interface SeedContext {
    tenantId: string;
    agentId: string;
    agentName: string;
}
export interface SeedConnection {
    id: string;
    provider: string;
    auth_type: 'subscription' | 'api_key';
}
export declare function seedConnectionId(provider: string, authType: string): string;
export declare function getSeedConnections(): SeedConnection[];
export declare function seedAgentMessages(messageRepo: Repository<AgentMessage>, userId: string, logger: Logger, ctx?: SeedContext, requestRepo?: Repository<ManifestRequest>): Promise<void>;
export {};
