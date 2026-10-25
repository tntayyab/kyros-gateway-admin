import { Repository } from 'typeorm';
import { Agent } from '../entities/agent.entity';
import { ApiKey } from '../entities/api-key.entity';
import { AgentMessage } from '../entities/agent-message.entity';
import { ManifestRequest } from '../entities/request.entity';
import type { TelemetryPayloadV1 } from './dto/telemetry-payload';
export declare class PayloadBuilderService {
    private readonly messages;
    private readonly agents;
    private readonly requests;
    private readonly apiKeys;
    private readonly logger;
    constructor(messages: Repository<AgentMessage>, agents: Repository<Agent>, requests: Repository<ManifestRequest>, apiKeys: Repository<ApiKey>);
    build(installId: string, manifestVersion: string): Promise<TelemetryPayloadV1>;
    private messagesByProvider;
    private messagesByBucket;
    private agentsByPlatform;
    private userAgentsCount;
    private requestCounts;
    private failedRequestsByClass;
    private cliKeyCounts;
    private mcpAggregates;
    private totals;
    private collapseProviders;
    private collapseProviderCosts;
    private bucketFor;
    private bucketsToRecord;
}
