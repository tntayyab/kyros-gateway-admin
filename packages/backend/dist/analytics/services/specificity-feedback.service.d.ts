import { Repository } from 'typeorm';
import { AgentMessage } from '../../entities/agent-message.entity';
import { SpecificityCategory } from 'manifest-shared';
export declare class SpecificityFeedbackService {
    private readonly messageRepo;
    private readonly logger;
    private static readonly PENALTY_PER_FLAG;
    private static readonly PENALTY_CAP;
    constructor(messageRepo: Repository<AgentMessage>);
    flagMiscategorized(messageId: string, tenantId: string | null): Promise<void>;
    clearFlag(messageId: string, tenantId: string | null): Promise<void>;
    getPenaltiesForAgent(tenantId: string | null | undefined, agentId: string | null | undefined): Promise<Map<SpecificityCategory, number>>;
    private findOwnedMessage;
}
